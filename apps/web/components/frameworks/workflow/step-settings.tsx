'use client';

import type { ReactNode } from 'react';
import { CircleAlert, Plus, Trash2, X } from 'lucide-react';
import { EvidenceSection, InputsSection, RulesEditor } from '@/components/frameworks/editor/editor-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { scorableInputs } from '@/lib/frameworks/scoring';
import type { ConditionOp, KpiContent, SplitBranch, WfNode } from '@/lib/frameworks/types';
import { CONDITION_LABEL, TOOL_NAME, TOOLS, type StepIssue } from '@/lib/frameworks/workflow';

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-t px-4 py-4 first:border-t-0">
      <div className="grid gap-0.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

type Props = {
  node: WfNode;
  content: KpiContent;
  issues: StepIssue[];
  readOnly?: boolean;
  onContent: (patch: Partial<KpiContent>) => void;
  onNode: (patch: Partial<WfNode>) => void;
  onRemove: () => void;
  onClose: () => void;
};

const TITLE: Record<WfNode['kind'], string> = {
  trigger: 'Trigger',
  action: 'Action',
  condition: 'Condition',
  split: 'Split by role',
  review: 'Human review',
  result: 'Result',
};

/** Settings for the selected step, in a drawer beside the canvas (a bottom sheet on phones). */
export function StepSettings({ node, content, issues, readOnly, onContent, onNode, onRemove, onClose }: Props) {
  const title = node.kind === 'action' && node.tool ? `Action · ${TOOL_NAME[node.tool]}` : TITLE[node.kind];
  const tool = TOOLS.find((t) => t.kind === node.tool);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="grid min-w-0">
          <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">{title}</span>
          <h2 className="truncate text-sm font-semibold">{node.name || 'Untitled step'}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close step settings" className="text-muted-foreground hover:text-foreground ml-auto">
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {issues.length > 0 && (
          <ul className="grid gap-1 border-b px-4 py-3">
            {issues.map((i) => (
              <li key={i.text} className={i.blocking ? 'text-warning flex items-center gap-2 text-xs' : 'text-muted-foreground flex items-center gap-2 text-xs'}>
                <CircleAlert className="size-3.5 shrink-0" aria-hidden /> {i.text}
              </li>
            ))}
          </ul>
        )}

        {node.kind !== 'trigger' && (
          <Group title="Step name">
            <Input aria-label="Step name" value={node.name} disabled={readOnly} onChange={(e) => onNode({ name: e.target.value })} />
          </Group>
        )}

        {node.kind === 'trigger' && (
          <>
            <Group title="Form fields" hint="What the employee fills in when they submit this KPI.">
              <InputsSection bare content={content} onChange={onContent} readOnly={readOnly} />
            </Group>
            <Group title="Evidence" hint="Whether proof must be attached, and what kind.">
              <EvidenceSection bare content={content} onChange={onContent} readOnly={readOnly} />
            </Group>
          </>
        )}

        {node.kind === 'action' && node.tool === 'score' && (
          <Group title="Scoring rules" hint="The only step that gives marks. Each path can have its own Score step.">
            <RulesEditor inputs={content.inputs} rules={node.rules ?? []} onChange={(rules) => onNode({ rules })} readOnly={readOnly} />
          </Group>
        )}
        {node.kind === 'action' && tool?.later && (
          <Group title={tool.name}>
            <p className="text-muted-foreground text-sm">{tool.description} This tool comes from the PoC and is not built in this prototype yet.</p>
          </Group>
        )}

        {node.kind === 'condition' && node.condition && <ConditionSettings node={node} content={content} readOnly={readOnly} onNode={onNode} />}
        {node.kind === 'split' && <SplitSettings node={node} readOnly={readOnly} onNode={onNode} />}

        {node.kind === 'review' && (
          <Group title="What happens" hint="The automated part ends here.">
            <ol className="text-muted-foreground grid list-decimal gap-1.5 pl-4 text-sm">
              <li>The submission goes to the person&apos;s assigned reviewer, with any points from Score.</li>
              <li>The reviewer checks the answers and the evidence.</li>
              <li>They approve and release the mark, or return it with feedback.</li>
            </ol>
            <p className="text-muted-foreground text-xs">Reviewers are assigned per person in People. Nobody reviews their own submission.</p>
          </Group>
        )}

        {node.kind === 'result' && (
          <Group title="Outcome" hint="What this path ends with, for example Not eligible.">
            <Input aria-label="Outcome" value={node.outcome ?? ''} disabled={readOnly} onChange={(e) => onNode({ outcome: e.target.value })} placeholder="Not eligible" />
          </Group>
        )}
      </div>

      {!readOnly && node.kind !== 'trigger' && (
        <div className="border-t px-4 py-3">
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onRemove}>
            <Trash2 aria-hidden data-icon="inline-start" /> Remove step
          </Button>
        </div>
      )}
    </div>
  );
}

function ConditionSettings({ node, content, readOnly, onNode }: { node: WfNode; content: KpiContent; readOnly?: boolean; onNode: (p: Partial<WfNode>) => void }) {
  const c = node.condition!;
  const input = content.inputs.find((i) => i.id === c.inputId);
  const numeric = !!input && scorableInputs([input]).length > 0;
  const ops: ConditionOp[] = numeric || !input ? ['gte', 'lte', 'eq', 'between', 'filled'] : ['filled'];
  const set = (p: Partial<typeof c>) => onNode({ condition: { ...c, ...p } });
  return (
    <Group title="Check" hint="Met and Not met each lead to their own next step.">
      <div className="grid gap-1.5">
        <Label>Field</Label>
        <Select
          value={c.inputId}
          disabled={readOnly}
          onValueChange={(inputId) => {
            const next = content.inputs.find((i) => i.id === inputId);
            set({ inputId, op: next && scorableInputs([next]).length ? c.op : 'filled' });
          }}
        >
          <SelectTrigger className="w-full" aria-label="Field to check">
            <SelectValue placeholder="Choose a field" />
          </SelectTrigger>
          <SelectContent>
            {content.inputs.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.label || 'Untitled field'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={c.op} disabled={readOnly || !input} onValueChange={(op) => set({ op: op as ConditionOp })}>
          <SelectTrigger size="sm" className="w-36" aria-label="Comparison">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ops.map((op) => (
              <SelectItem key={op} value={op}>
                {CONDITION_LABEL[op]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {c.op !== 'filled' && (
          <Input type="number" aria-label="Value" className="h-7 w-20" value={c.value} disabled={readOnly} onChange={(e) => set({ value: Number(e.target.value || 0) })} />
        )}
        {c.op === 'between' && (
          <>
            <span className="text-muted-foreground text-sm">and</span>
            <Input type="number" aria-label="Upper value" className="h-7 w-20" value={c.value2 ?? ''} disabled={readOnly} onChange={(e) => set({ value2: Number(e.target.value || 0) })} />
          </>
        )}
      </div>
    </Group>
  );
}

function SplitSettings({ node, readOnly, onNode }: { node: WfNode; readOnly?: boolean; onNode: (p: Partial<WfNode>) => void }) {
  const branches = node.branches ?? [];
  const patch = (id: string, p: Partial<SplitBranch>) => onNode({ branches: branches.map((b) => (b.id === id ? { ...b, ...p } : b)) });
  return (
    <Group title="Roles" hint="People go down the first branch that fits them. Everyone else takes the last path.">
      <ol className="grid gap-2">
        {branches.map((b, i) => (
          <li key={b.id} className="bg-card grid gap-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs tabular-nums">{i + 1}.</span>
              <Input aria-label={`Branch ${i + 1} name`} value={b.label} disabled={readOnly} onChange={(e) => patch(b.id, { label: e.target.value })} placeholder="Lead" className="h-8" />
              {!readOnly && (
                <Button variant="ghost" size="icon-xs" aria-label={`Remove ${b.label || 'branch'}`} disabled={branches.length <= 1} onClick={() => onNode({ branches: branches.filter((x) => x.id !== b.id) })}>
                  <Trash2 aria-hidden />
                </Button>
              )}
            </div>
            <Select
              value={b.match.by}
              disabled={readOnly}
              onValueChange={(by) => patch(b.id, { match: by === 'reviewer' ? { by: 'reviewer' } : { by: 'title', contains: '' } })}
            >
              <SelectTrigger size="sm" className="w-full" aria-label={`Who goes to ${b.label || 'this branch'}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewer">People who review others</SelectItem>
                <SelectItem value="title">Job title contains…</SelectItem>
              </SelectContent>
            </Select>
            {b.match.by === 'title' && (
              <Input
                aria-label={`Titles for ${b.label || 'this branch'}`}
                value={b.match.contains}
                disabled={readOnly}
                onChange={(e) => patch(b.id, { match: { by: 'title', contains: e.target.value } })}
                placeholder="Lead, Manager"
                className="h-8"
              />
            )}
          </li>
        ))}
        <li className="grid gap-1.5 rounded-lg border border-dashed p-3">
          <Input
            aria-label="Name of the path for everyone else"
            value={node.otherLabel ?? ''}
            disabled={readOnly}
            onChange={(e) => onNode({ otherLabel: e.target.value })}
            placeholder="Everyone else"
            className="h-8"
          />
          <span className="text-muted-foreground text-xs">Anyone who fits none of the roles above, for example team members.</span>
        </li>
      </ol>
      {!readOnly && (
        <Button variant="outline" size="sm" className="justify-self-start" onClick={() => onNode({ branches: [...branches, { id: uid('br'), label: '', match: { by: 'title', contains: '' } }] })}>
          <Plus aria-hidden data-icon="inline-start" /> Add role
        </Button>
      )}
      <p className="text-muted-foreground text-xs">Job titles are free text in People for now, so matching by title is approximate.</p>
    </Group>
  );
}
