import { OP_LABEL, score, toNumber } from './scoring';
import type { BlockKind, ConditionOp, ExtractField, KpiContent, KpiInput, RoleMatch, ScoringRule, SplitBranch, ToolKind, WfNode, Workflow } from './types';

// KPI workflow model for the prototype editor. Frontend only.
// Blocks, tools and plugins follow the PoC (legacy/poc/web/src/workflowModel.js and reusableTools.js).
// Every step can produce values (the form its fields; Extract evidence what it reads from a file),
// and later steps check and score those values, as the PoC's policySources did.

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export type BlockDef = { kind: BlockKind; name: string; description: string; routes: string[]; terminal?: boolean };
export type ToolDef = { kind: ToolKind; name: string; description: string; later?: boolean };
export type PluginDef = { id: string; name: string; description: string; later?: boolean };

/** Blocks a person can add. The trigger is not listed: every workflow has exactly one. */
export const BLOCKS: BlockDef[] = [
  { kind: 'action', name: 'Action', description: 'Run one tool, for example Score.', routes: ['next'] },
  { kind: 'condition', name: 'Condition', description: 'Check one value and split into Met and Not met.', routes: ['met', 'notMet'] },
  { kind: 'split', name: 'Split by role', description: 'Send people down a path by role, for example team members and leads.', routes: [] },
  { kind: 'review', name: 'Human review', description: "Hand the submission to the person's reviewer. Ends the automated part.", routes: [], terminal: true },
  { kind: 'result', name: 'Result', description: 'End this path with a named outcome.', routes: [], terminal: true },
];

export const TOOLS: ToolDef[] = [
  { kind: 'score', name: 'Score', description: 'Turn values into points with rules. The only step that gives marks.' },
  { kind: 'extract_evidence', name: 'Extract evidence', description: 'Read values from an uploaded file, like a publication date, so later steps can check and score them.' },
  { kind: 'date_range', name: 'Check date range', description: 'Check a date against start and end dates.', later: true },
  { kind: 'compare_evidence', name: 'Compare evidence', description: 'Compare entered values with the evidence.', later: true },
  { kind: 'find_duplicates', name: 'Find duplicates', description: 'Look for an earlier submission of the same item.', later: true },
];

export const PLUGINS: PluginDef[] = [
  { id: 'publication', name: 'Publication', description: 'Checks a paper end to end: extract, look up, compare, dates, duplicates, score and review.', later: true },
];

export const TOOL_NAME: Record<ToolKind, string> = Object.fromEntries(TOOLS.map((t) => [t.kind, t.name])) as Record<ToolKind, string>;

/** Labels for each way out of a block. Split branches use their own labels. */
export function routeLabel(node: WfNode, route: string): string {
  if (node.kind === 'condition') return route === 'met' ? 'Met' : 'Not met';
  if (node.kind === 'split') return route === 'other' ? node.otherLabel?.trim() || 'Everyone else' : (node.branches?.find((b) => b.id === route)?.label ?? 'Branch');
  return '';
}

export function routesOf(node: WfNode): string[] {
  if (node.kind === 'split') return [...(node.branches ?? []).map((b) => b.id), 'other'];
  return BLOCKS.find((b) => b.kind === node.kind)?.routes ?? (node.kind === 'trigger' ? ['next'] : []);
}

export const isTerminal = (kind: BlockKind) => kind === 'review' || kind === 'result';

/** A new step of the given kind, not yet connected. */
export function createNode(kind: BlockKind, tool?: ToolKind): WfNode {
  const base: WfNode = { id: uid('step'), kind, name: '', routes: {} };
  if (kind === 'action') {
    base.tool = tool ?? 'score';
    base.name = TOOL_NAME[base.tool];
    if (base.tool === 'score') base.rules = [];
    if (base.tool === 'extract_evidence') base.extract = { fileInputId: '', fields: [] };
  }
  if (kind === 'condition') {
    base.name = 'Condition';
    base.condition = { inputId: '', op: 'gte', value: 1 };
  }
  if (kind === 'split') {
    base.name = 'Split by role';
    base.branches = [{ id: uid('br'), label: 'Lead', match: { by: 'reviewer' } }];
    base.otherLabel = 'Team member';
  }
  if (kind === 'review') base.name = 'Reviewer checks it';
  if (kind === 'result') {
    base.name = 'Result';
    base.outcome = '';
  }
  for (const r of routesOf(base)) base.routes[r] = null;
  return base;
}

const triggerNode = (next: string | null): WfNode => ({ id: 'trigger', kind: 'trigger', name: 'Employee submits', routes: { next } });

/** The ready flow for older KPIs: Submission → Score → Human review. */
export function defaultWorkflow(rules: ScoringRule[] = []): Workflow {
  const review = createNode('review');
  const scoreStep: WfNode = { ...createNode('action', 'score'), rules, routes: { next: review.id } };
  return { nodes: [triggerNode(scoreStep.id), scoreStep, review] };
}

/** A brand-new KPI: only the trigger, waiting for a starting point. */
export const unstartedWorkflow = (): Workflow => ({ nodes: [triggerNode(null)], started: false });

export type StartingPoint = { id: 'form' | 'evidence' | 'role' | 'blank'; name: string; description: string; flow: string };

export const STARTING_POINTS: StartingPoint[] = [
  { id: 'form', name: 'Score from the form', description: 'Most KPIs. Points come straight from what the employee enters.', flow: 'Submit → Score → Review' },
  { id: 'evidence', name: 'Check evidence first', description: 'Read values from an uploaded file, like a publication date, then score them.', flow: 'Submit → Extract → Score → Review' },
  { id: 'role', name: 'Different by role', description: 'Leads and team members need different amounts for the same marks.', flow: 'Submit → Split by role → Score each → Review' },
  { id: 'blank', name: 'Start blank', description: 'Build the steps yourself.', flow: 'Submit → …' },
];

/** Builds the workflow for a starting point, using the form's fields where it can. */
export function startFrom(id: StartingPoint['id'], c: KpiContent): Workflow {
  const review = createNode('review');
  if (id === 'form') {
    const s = { ...createNode('action', 'score'), routes: { next: review.id } };
    return { nodes: [triggerNode(s.id), s, review], started: true };
  }
  if (id === 'evidence') {
    const s = { ...createNode('action', 'score'), routes: { next: review.id } };
    const x: WfNode = {
      ...createNode('action', 'extract_evidence'),
      name: 'Read the evidence',
      extract: { fileInputId: c.inputs.find((i) => i.type === 'file')?.id ?? '', fields: [] },
      routes: { next: s.id },
    };
    return { nodes: [triggerNode(x.id), x, s, review], started: true };
  }
  if (id === 'role') {
    const lead = { ...createNode('action', 'score'), name: 'Score for leads', routes: { next: review.id } };
    const member = { ...createNode('action', 'score'), name: 'Score for team members', routes: { next: review.id } };
    const split = createNode('split');
    const leadBranch = split.branches![0].id;
    const sp: WfNode = { ...split, name: 'Who is submitting?', routes: { [leadBranch]: lead.id, other: member.id } };
    return { nodes: [triggerNode(sp.id), sp, lead, member, review], started: true };
  }
  return { nodes: [triggerNode(null)], started: true };
}

/** The workflow to edit: the saved one, or a default built from older scoring rules. */
export function workflowOf(c: KpiContent): Workflow {
  return c.workflow ?? defaultWorkflow(c.rules);
}

export const isScore = (n: WfNode) => n.kind === 'action' && n.tool === 'score';

/** All scoring rules in the workflow, so lists and analytics know whether a KPI is scored. */
export const allRules = (wf: Workflow) => wf.nodes.flatMap((n) => (isScore(n) ? (n.rules ?? []) : []));

/** Steps in the order a reader meets them, top to bottom. */
export function orderedSteps(wf: Workflow): WfNode[] {
  const out: WfNode[] = [];
  const seen = new Set<string>();
  const queue = [wf.nodes.find((n) => n.kind === 'trigger')?.id];
  while (queue.length) {
    const id = queue.shift();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const n = wf.nodes.find((x) => x.id === id);
    if (!n) continue;
    out.push(n);
    routesOf(n).forEach((r) => queue.push(n.routes[r] ?? undefined));
  }
  return out;
}

/** Where a step sits: the branch names on the way to it, for example ["Lead"]. */
export function pathLabels(wf: Workflow, id: string): string[] {
  for (const n of wf.nodes) {
    for (const r of routesOf(n)) {
      if (n.routes[r] === id) {
        const label = routeLabel(n, r);
        return [...pathLabels(wf, n.id), ...(label ? [label] : [])];
      }
    }
  }
  return [];
}

/** Steps that come before `id` on some path. */
function ancestors(wf: Workflow, id: string): Set<string> {
  const out = new Set<string>();
  const walk = (target: string) => {
    for (const n of wf.nodes) {
      if (Object.values(n.routes).includes(target) && !out.has(n.id)) {
        out.add(n.id);
        walk(n.id);
      }
    }
  };
  walk(id);
  return out;
}

/* ---------- Values a step can use ---------- */

export type SourceGroup = { label: string; items: KpiInput[] };

const extractedId = (nodeId: string, fieldId: string) => `x:${nodeId}:${fieldId}`;

/** An extracted field shaped like a form field, so the same rules and checks work on both. */
const asInput = (node: WfNode, f: ExtractField): KpiInput => ({ id: extractedId(node.id, f.id), label: f.label || 'Untitled value', type: f.type, required: false, options: f.options });

/**
 * The values step `id` can check or score: the form's fields, plus anything extracted by
 * Extract evidence steps above it. A step cannot use a value that has not been read yet.
 */
export function sourcesFor(c: KpiContent, wf: Workflow, id: string): SourceGroup[] {
  const before = ancestors(wf, id);
  const groups: SourceGroup[] = [{ label: 'Form', items: c.inputs }];
  for (const n of orderedSteps(wf)) {
    if (!before.has(n.id) || n.tool !== 'extract_evidence' || !n.extract?.fields.length) continue;
    const file = c.inputs.find((i) => i.id === n.extract!.fileInputId);
    groups.push({ label: `Extracted from ${file?.label || 'the file'}`, items: n.extract.fields.map((f) => asInput(n, f)) });
  }
  return groups;
}

/** Every extracted value in the workflow, for the test form. */
export function allExtracted(c: KpiContent, wf: Workflow): SourceGroup[] {
  return orderedSteps(wf)
    .filter((n) => n.tool === 'extract_evidence' && n.extract?.fields.length)
    .map((n) => ({
      label: `${n.name || 'Extract evidence'} · from ${c.inputs.find((i) => i.id === n.extract!.fileInputId)?.label || 'the file'}`,
      items: n.extract!.fields.map((f) => asInput(n, f)),
    }));
}

const flat = (groups: SourceGroup[]) => groups.flatMap((g) => g.items);

/* ---------- Editing ---------- */

/** Puts a new step on the route `route` of `parentId`. The step takes over whatever that route pointed to. */
export function insertStep(wf: Workflow, parentId: string, route: string, step: WfNode): Workflow {
  const parent = wf.nodes.find((n) => n.id === parentId);
  if (!parent) return wf;
  const oldTarget = parent.routes[route] ?? null;
  const first = routesOf(step)[0];
  const placed: WfNode = first && oldTarget ? { ...step, routes: { ...step.routes, [first]: oldTarget } } : step;
  return { ...wf, nodes: [...wf.nodes.map((n) => (n.id === parentId ? { ...n, routes: { ...n.routes, [route]: placed.id } } : n)), placed] };
}

/** Removes a step. A step with one way out is bridged; otherwise the steps only it led to go too. */
export function removeStep(wf: Workflow, id: string): Workflow {
  const node = wf.nodes.find((n) => n.id === id);
  if (!node || node.kind === 'trigger') return wf;
  const outs = routesOf(node);
  const bridge = outs.length === 1 ? (node.routes[outs[0]] ?? null) : null;
  let nodes = wf.nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, routes: Object.fromEntries(Object.entries(n.routes).map(([r, t]) => [r, t === id ? bridge : t])) }));
  const reach = reachable({ nodes });
  nodes = nodes.filter((n) => reach.has(n.id));
  return { ...wf, nodes };
}

export function reachable(wf: Workflow): Set<string> {
  return new Set(orderedSteps(wf).map((n) => n.id));
}

export function updateNode(wf: Workflow, id: string, patch: Partial<WfNode>): Workflow {
  return {
    ...wf,
    nodes: wf.nodes.map((n) => {
      if (n.id !== id) return n;
      const next = { ...n, ...patch };
      // Keep one route per split branch, plus the catch-all path.
      if (n.kind === 'split') next.routes = Object.fromEntries(routesOf(next).map((r) => [r, n.routes[r] ?? null]));
      return next;
    }),
  };
}

/* ---------- Checks ---------- */

export type StepIssue = { nodeId: string; text: string; blocking: boolean };

/** What still needs doing, per step. Shown as badges on the canvas and in the publish checklist. */
export function workflowIssues(c: KpiContent, wf: Workflow): StepIssue[] {
  const issues: StepIssue[] = [];
  for (const n of orderedSteps(wf)) {
    const add = (text: string, blocking = true) => issues.push({ nodeId: n.id, text, blocking });
    if (n.kind === 'trigger') {
      if (c.inputs.length === 0) add('Add at least one form field');
      else if (c.inputs.some((i) => !i.label.trim())) add('Every form field needs a label');
      if (c.evidenceRequired && !c.inputs.some((i) => i.type === 'file')) add('Add a file field for evidence');
      if (wf.started === false) add('Choose a starting point');
    }
    if (isScore(n)) {
      const ids = new Set(flat(sourcesFor(c, wf, n.id)).map((i) => i.id));
      if (!(n.rules ?? []).length) add('Add scoring rules', false);
      else if ((n.rules ?? []).some((r) => !ids.has(r.inputId))) add('A rule uses a value that is gone or not read yet');
    }
    if (n.tool === 'extract_evidence') {
      if (!c.inputs.some((i) => i.id === n.extract?.fileInputId && i.type === 'file')) add('Choose the file field to read');
      if (!n.extract?.fields.length) add('Add the values to extract');
      else if (n.extract.fields.some((f) => !f.label.trim())) add('Name every value to extract');
    }
    if (n.kind === 'action' && TOOLS.find((t) => t.kind === n.tool)?.later) add('This tool is not available yet');
    if (n.kind === 'condition' && !flat(sourcesFor(c, wf, n.id)).some((i) => i.id === n.condition?.inputId)) add('Choose a value to check');
    if (n.kind === 'split') {
      if ((n.branches ?? []).some((b) => !b.label.trim())) add('Name every role');
      if ((n.branches ?? []).some((b) => b.match.by === 'title' && !b.match.contains.trim())) add('Say which titles each role is for');
    }
    if (n.kind === 'result' && !n.outcome?.trim()) add('Name the outcome');
    if (routesOf(n).some((r) => !n.routes[r]) && !(n.kind === 'trigger' && wf.started === false)) add(n.kind === 'condition' || n.kind === 'split' ? 'Connect every path' : 'Connect the next step');
  }
  return issues;
}

/* ---------- Test runs ---------- */

/** The person a test run pretends to be. */
export type TestPerson = { title: string; isReviewer: boolean };

export function roleMatches(m: RoleMatch, p: TestPerson): boolean {
  if (m.by === 'reviewer') return p.isReviewer;
  const words = m.contains
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);
  return words.length > 0 && words.some((w) => p.title.toLowerCase().includes(w));
}

export type TraceStep = { nodeId: string; route?: string; text: string; tone: 'ok' | 'stop' | 'end' };
export type RunResult = { trace: TraceStep[]; points: number | null; outcome: string; stopped: boolean };

function conditionMet(input: KpiInput, op: ConditionOp, value: number, value2: number | undefined, raw: string): boolean {
  if (op === 'filled') return raw.trim() !== '';
  const v = toNumber(input, raw);
  if (v === null) return false;
  if (op === 'gte') return v >= value;
  if (op === 'lte') return v <= value;
  if (op === 'eq') return v === value;
  return v >= value && v <= (value2 ?? value);
}

export const CONDITION_LABEL: Record<ConditionOp, string> = { ...OP_LABEL, filled: 'is answered' };

/**
 * Runs a test submission through the workflow, step by step, the way the PoC trace did.
 * `values` holds form answers by field id, and simulated extracted values by `x:<stepId>:<fieldId>`.
 */
export function runWorkflow(c: KpiContent, wf: Workflow, values: Record<string, string>, person: TestPerson): RunResult {
  const trace: TraceStep[] = [];
  let points: number | null = null;
  let id: string | null | undefined = wf.nodes.find((n) => n.kind === 'trigger')?.id;
  const visited = new Set<string>();

  while (id && !visited.has(id)) {
    visited.add(id);
    const n = wf.nodes.find((x) => x.id === id);
    if (!n) break;
    if (n.kind === 'trigger') {
      const missing = c.inputs.filter((i) => i.required && i.type !== 'file' && !(values[i.id] ?? '').trim()).map((i) => i.label || 'Untitled field');
      if (missing.length) {
        trace.push({ nodeId: n.id, text: `Stopped: fill in ${missing.join(', ')}`, tone: 'stop' });
        return { trace, points: null, outcome: 'Not submitted', stopped: true };
      }
      trace.push({ nodeId: n.id, route: 'next', text: `Submitted as ${person.title || 'an employee'}`, tone: 'ok' });
      id = n.routes.next;
    } else if (n.kind === 'action') {
      if (n.tool === 'extract_evidence') {
        const fields = n.extract?.fields ?? [];
        const read = fields.filter((f) => (values[extractedId(n.id, f.id)] ?? '').trim()).length;
        trace.push({ nodeId: n.id, route: 'next', text: `Read ${read} of ${fields.length} values from the file (test values)`, tone: 'ok' });
        id = n.routes.next;
        continue;
      }
      if (n.tool !== 'score') {
        trace.push({ nodeId: n.id, text: `${TOOL_NAME[n.tool!]} is not available in the prototype`, tone: 'stop' });
        return { trace, points, outcome: 'Stopped', stopped: true };
      }
      const res = score(flat(sourcesFor(c, wf, n.id)).filter((i) => i.type !== 'file'), n.rules ?? [], values);
      points = res.kind === 'scored' ? res.points : 0;
      trace.push({
        nodeId: n.id,
        route: 'next',
        text: res.kind === 'scored' ? (res.ruleIndex === null ? 'No rule matched: 0 points' : `Rule ${res.ruleIndex + 1} matched: ${res.points} points`) : 'Could not score',
        tone: 'ok',
      });
      id = n.routes.next;
    } else if (n.kind === 'condition') {
      const input = flat(sourcesFor(c, wf, n.id)).find((i) => i.id === n.condition?.inputId);
      if (!input || !n.condition) {
        trace.push({ nodeId: n.id, text: 'No value chosen to check', tone: 'stop' });
        return { trace, points, outcome: 'Stopped', stopped: true };
      }
      const met = conditionMet(input, n.condition.op, n.condition.value, n.condition.value2, values[input.id] ?? '');
      const route = met ? 'met' : 'notMet';
      trace.push({ nodeId: n.id, route, text: `${input.label} ${CONDITION_LABEL[n.condition.op]}${n.condition.op === 'filled' ? '' : ` ${n.condition.value}`}: ${met ? 'met' : 'not met'}`, tone: 'ok' });
      id = n.routes[route];
    } else if (n.kind === 'split') {
      const branch: SplitBranch | undefined = (n.branches ?? []).find((b) => roleMatches(b.match, person));
      const route = branch?.id ?? 'other';
      trace.push({ nodeId: n.id, route, text: `Went to ${branch?.label ?? (n.otherLabel?.trim() || 'Everyone else')}`, tone: 'ok' });
      id = n.routes[route];
    } else if (n.kind === 'review') {
      trace.push({ nodeId: n.id, text: points === null ? 'Sent to the reviewer, who enters the mark' : `Sent to the reviewer with ${points} points`, tone: 'end' });
      return { trace, points, outcome: 'With reviewer', stopped: false };
    } else {
      trace.push({ nodeId: n.id, text: `Ended: ${n.outcome || 'outcome not named'}`, tone: 'end' });
      return { trace, points, outcome: n.outcome || 'Ended', stopped: false };
    }
  }
  const last = trace.at(-1);
  if (last) trace.push({ nodeId: last.nodeId, text: 'Stopped: the next step is not connected', tone: 'stop' });
  return { trace, points, outcome: 'Stopped', stopped: true };
}

/** One line under a step on the canvas, saying what it does. */
export function summaryOf(n: WfNode, c: KpiContent, wf: Workflow): string {
  if (n.kind === 'trigger') {
    const files = c.inputs.filter((i) => i.type === 'file').length;
    return c.inputs.length ? `${c.inputs.length} ${c.inputs.length === 1 ? 'field' : 'fields'}${files ? ` · ${files} file` : ''}${c.evidenceRequired ? ' · evidence required' : ''}` : 'No form fields yet';
  }
  if (n.kind === 'action') {
    if (n.tool === 'extract_evidence') {
      const f = n.extract?.fields ?? [];
      return f.length ? `Reads ${f.map((x) => x.label || 'value').join(', ')}` : 'Nothing to extract yet';
    }
    if (n.tool !== 'score') return 'Not available yet';
    const r = n.rules ?? [];
    if (!r.length) return 'No rules yet';
    const first = r[0];
    const input = flat(sourcesFor(c, wf, n.id)).find((i) => i.id === first.inputId);
    return `${r.length} ${r.length === 1 ? 'rule' : 'rules'} · ${input?.label ?? 'value'} ${OP_LABEL[first.op]} ${first.value} → ${first.points} pts`;
  }
  if (n.kind === 'condition') {
    const input = flat(sourcesFor(c, wf, n.id)).find((i) => i.id === n.condition?.inputId);
    if (!input || !n.condition) return 'No value chosen';
    return `${input.label} ${CONDITION_LABEL[n.condition.op]}${n.condition.op === 'filled' ? '' : ` ${n.condition.value}`}`;
  }
  if (n.kind === 'split') {
    const k = (n.branches ?? []).length;
    return `${k} ${k === 1 ? 'role' : 'roles'} + ${(n.otherLabel?.trim() || 'everyone else').toLowerCase()}`;
  }
  if (n.kind === 'review') return 'Approve, or return with feedback';
  return n.outcome?.trim() || 'Outcome not named';
}
