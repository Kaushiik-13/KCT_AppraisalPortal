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
};

export type KpiStatus = 'draft' | 'published' | 'archived';
export type InputType = 'number' | 'choice' | 'yesno' | 'text' | 'date' | 'file';

/** One field the employee fills in for a KPI. */
export type KpiInput = { id: string; label: string; type: InputType; required: boolean };

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
};

export type ParticipationStats = {
  /** People expected to submit in this scope. */
  people: number;
  /** Share of expected KPI submissions made, 0 to 100. */
  submissionRate: number;
  overdue: number;
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
  label: string;
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
};
