// Framework Studio data shapes, used by the UI prototype.
// Frontend only: there is no backend yet. When the API exists, these move to packages/contracts.

/** Key result area: a group of related KPIs, for example "Teaching and learning". */
export type Kra = {
  id: string;
  /** Short prefix for its KPI codes, for example "TL". */
  code: string;
  name: string;
  /** A key from lib/department-colors, reused so all tints match. */
  color: string;
  description: string;
  /** Archived KRAs are hidden from new work but keep their history. */
  archived?: boolean;
};

export type KpiStatus = 'draft' | 'published' | 'archived';
export type InputType = 'number' | 'choice' | 'yesno' | 'text' | 'date' | 'file';

/** One field the employee fills in for a KPI. */
export type KpiInput = {
  id: string;
  label: string;
  type: InputType;
  required: boolean;
  /** Short help shown under the field. */
  help?: string;
  /** Bounds for number inputs. */
  min?: number;
  max?: number;
  /** Choices for choice inputs. */
  options?: string[];
};

/**
 * One scoring rule: "if <input> <op> <value> then <points>". The first matching rule wins.
 * Rules are unapproved placeholders until scoring policy is agreed (#20).
 */
export type ScoringRule = {
  id: string;
  /** A form field id, or an extracted field (`x:<stepId>:<fieldId>`). See `sourcesFor` in workflow.ts. */
  inputId: string;
  op: 'gte' | 'lte' | 'eq' | 'between';
  value: number;
  /** Upper bound for "between". */
  value2?: number;
  points: number;
};

export type KpiEvidence = { fileTypes: string[]; guidance: string };

/**
 * Workflow blocks, following the PoC (legacy/poc/web/src/workflowModel.js):
 * - trigger: the employee submits the KPI form. Always first, exactly one.
 * - action: runs one tool (a small step), for example Score.
 * - condition: checks one form answer and splits into Met / Not met.
 * - split: sends people down a path by role, for example team members and leads.
 * - review: hands the submission to the person's reviewer. Ends the automated part.
 * - result: ends a path with a named outcome.
 */
export type BlockKind = 'trigger' | 'action' | 'condition' | 'split' | 'review' | 'result';
/** Tools an Action block can run. Only Score works in the prototype; the rest come from the PoC and are marked Later. */
export type ToolKind = 'score' | 'date_range' | 'extract_evidence' | 'compare_evidence' | 'find_duplicates';

export type ConditionOp = ScoringRule['op'] | 'filled';
/** Who a split branch is for. Matched against the employee's title, or whether they review others. */
export type RoleMatch = { by: 'title'; contains: string } | { by: 'reviewer' };
export type SplitBranch = { id: string; label: string; match: RoleMatch };

export type WfNode = {
  id: string;
  kind: BlockKind;
  name: string;
  tool?: ToolKind;
  /** Score tool: its rules. Condition: the check. Split: its branches. Result: the outcome. */
  rules?: ScoringRule[];
  /** Extract evidence: which file field to read, and the fields to pull out of it. */
  extract?: { fileInputId: string; fields: ExtractField[] };
  condition?: { inputId: string; op: ConditionOp; value: number; value2?: number };
  branches?: SplitBranch[];
  /** Name of the split's catch-all path. Defaults to "Everyone else". */
  otherLabel?: string;
  outcome?: string;
  /** Next step for each way out of this block. Null means not connected yet. */
  routes: Record<string, string | null>;
};

/** A value the Extract evidence tool pulls out of a file. Later steps can check and score it like a form field. */
export type ExtractField = { id: string; label: string; type: 'number' | 'yesno' | 'choice' | 'text'; options?: string[] };

export type Workflow = {
  nodes: WfNode[];
  /** False until a starting point is chosen for a new KPI. Missing means chosen (older and sample workflows). */
  started?: boolean;
};

/** The editable part of a KPI. A published KPI keeps its live content while a draft of the next version is edited. */
export type KpiContent = {
  name: string;
  description: string;
  kraId: string;
  appliesTo: string;
  inputs: KpiInput[];
  evidenceRequired: boolean;
  evidence: KpiEvidence;
  /** Kept for older saved drafts. New scoring lives in the workflow's Score steps. */
  rules: ScoringRule[];
  /** How a submission moves from the form to the reviewer. Missing on older saved drafts: built from `rules`. */
  workflow?: Workflow;
};

export type KpiVersion = { version: number; publishedAt: string; note: string };

export type Kpi = {
  id: string;
  /** For example "TL-1". */
  code: string;
  name: string;
  kraId: string;
  status: KpiStatus;
  /** Latest published version, or 1 for a draft that was never published. */
  version: number;
  /** True when a newer draft version is being edited beside the published one. */
  hasDraftChanges: boolean;
  inputs: KpiInput[];
  evidenceRequired: boolean;
  /** Who it applies to, in words, for example "All teaching staff". */
  appliesTo: string;
  /** False while no scoring rules exist. Rules stay unapproved placeholders until #20 is settled. */
  hasScoringRules: boolean;
  description: string;
  evidence: KpiEvidence;
  rules: ScoringRule[];
  workflow?: Workflow;
  /** ISO date of the last change. */
  updatedAt: string;
  /** Published versions, oldest first. Empty for a KPI never published. */
  versions: KpiVersion[];
  /** Pending changes to a published KPI: the next version, not live until published. */
  draft?: KpiContent;
};

export type SubmissionStatus = 'notStarted' | 'submitted' | 'inReview' | 'returned' | 'released';

/** Whose data the analytics cover. The page decides; the analytics never check roles themselves. */
export type AnalyticsScope = { kind: 'organization' } | { kind: 'reviewer'; reviewerId: string };

export type AnalyticsFilters = {
  cycle: string;
  /** Empty means all KRAs. */
  kraId: string;
  /** Empty means all departments. Ignored for reviewer scope. */
  departmentId: string;
};

/** Which part of the analytics to show. Admins get all four; reviewers do not get health. */
export type AnalyticsSection = 'health' | 'participation' | 'review' | 'outcomes';

/**
 * empty: no KRAs or KPIs exist yet.
 * noSubmissions: a framework exists but no cycle has submissions yet.
 * active: a cycle is running.
 */
export type AnalyticsState = 'empty' | 'noSubmissions' | 'active';

export type HealthStats = {
  kras: number;
  kpis: number;
  published: number;
  drafts: number;
  /** Share of KPIs that need evidence, 0 to 100. */
  evidenceShare: number;
  /** KPIs missing inputs, scoring rules, or an audience. */
  incomplete: { id: string; code: string; name: string; problem: string }[];
  /** KPIs whose scoring rules are still unapproved placeholders. */
  unapprovedScoring: number;
  /** How many live and draft KPIs each KRA holds, including KRAs with none. */
  kpisPerKra: { id: string; name: string; live: number; drafts: number }[];
};

export type ParticipationStats = {
  /** People expected to submit in this scope. */
  people: number;
  /** Share of expected KPI submissions made, 0 to 100. */
  submissionRate: number;
  overdue: number;
  /** Answers sent in after the deadline, and how many days late they were on average. */
  late: { count: number; avgDays: number };
  byStatus: Record<SubmissionStatus, number>;
  mostSubmitted: { id: string; code: string; name: string; submissions: number }[];
  leastSubmitted: { id: string; code: string; name: string; submissions: number }[];
  byKra: { id: string; name: string; percent: number }[];
  byDepartment: { id: string; name: string; percent: number }[];
  /** Cumulative submissions by week, with the week index of the deadline. */
  overTime: { points: { label: string; value: number }[]; deadlineIndex: number };
};

export type ReviewStats = {
  queue: number;
  avgDaysToReview: number;
  oldestWaitingDays: number;
  mostReturned: { id: string; code: string; name: string; returnRate: number }[];
  evidenceIssues: { missing: number; unreadable: number; replaced: number };
};

export type OutcomeStats = {
  /** Always true in the prototype: marks are sample data until scoring policy is approved (#20). */
  isSample: true;
  avgByKra: { id: string; name: string; value: number }[];
  avgByKpi: { id: string; code: string; name: string; value: number }[];
  distribution: { label: string; count: number }[];
  /** KPIs where almost everyone gets full marks, so they do not tell people apart. */
  ceilingKpis: { id: string; code: string; name: string; fullMarkShare: number }[];
  vsLastCycle: number;
};

/** One week of the running cycle, so each headline number can be charted over time. */
export type WeekPoint = {
  /** Short axis label: "5 Jan" for a week, "Jan" for a month. */
  label: string;
  /** ISO date the week starts, or the last week in the month. */
  start: string;
  /** Cumulative share of expected submissions made, 0 to 100. */
  submissionRate: number;
  waiting: number;
  overdue: number;
  released: number;
};

/** One published KPI's numbers for the running cycle, for the KPI table. */
export type KpiRow = {
  id: string;
  code: string;
  name: string;
  kraId: string;
  kraName: string;
  status: KpiStatus;
  /** Share of people in scope who submitted, 0 to 100. */
  submittedPercent: number;
  submissions: number;
  /** Share of submissions sent back, 0 to 100. */
  returnPercent: number;
  /** Average mark out of 5, or null when no marks are released. Sample only. */
  avgMark: number | null;
  evidenceRequired: boolean;
};

export type FrameworkAnalytics = {
  state: AnalyticsState;
  scope: AnalyticsScope;
  filters: AnalyticsFilters;
  /** Null when the scope may not see it (reviewers get no health) or the state has no data yet. */
  health: HealthStats | null;
  participation: ParticipationStats | null;
  review: ReviewStats | null;
  outcomes: OutcomeStats | null;
  /** Per-KPI numbers for the running cycle. Empty until a cycle is active. */
  kpiRows: KpiRow[];
  /** Week-by-week values for the headline numbers, with the index of the deadline week. */
  weekly: { points: WeekPoint[]; deadlineIndex: number };
  /** The same numbers month by month: the last week of each month. */
  monthly: { points: WeekPoint[]; deadlineIndex: number };
};
