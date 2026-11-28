import type { Kpi, KpiInput, KpiVersion, Kra, ScoringRule, Workflow } from './types';
import { defaultWorkflow } from './workflow';

// Prototype sample data, adapted from the previous PoC's PADS template (docs/reference/legacy/).
// It is NOT approved institutional policy. Marks, weights and caps stay unapproved until #20 is settled.

export const SAMPLE_KRAS: Kra[] = [
  { id: 'kra-tl', code: 'TL', name: 'Teaching and learning', color: 'blue', description: 'Course delivery, results and student feedback.' },
  { id: 'kra-rd', code: 'RD', name: 'Research and development', color: 'teal', description: 'Publications, projects and patents.' },
  { id: 'kra-ei', code: 'EI', name: 'External interface', color: 'amber', description: 'Industry, guest lectures and outreach.' },
  { id: 'kra-op', code: 'O', name: 'Operations', color: 'purple', description: 'Committees and institutional duties.' },
  { id: 'kra-sd', code: 'SD', name: 'Student development', color: 'rose', description: 'Mentoring, clubs and placements.' },
  { id: 'kra-ec', code: 'EC', name: 'Extra and co-curricular', color: 'green', description: 'Events and co-curricular activities.' },
];

const num = (id: string, label: string): KpiInput => ({ id, label, type: 'number', required: true });
const pick = (id: string, label: string): KpiInput => ({ id, label, type: 'choice', required: true });
const file = (id: string, label: string): KpiInput => ({ id, label, type: 'file', required: true });
const yes = (id: string, label: string): KpiInput => ({ id, label, type: 'yesno', required: true });

type K = Omit<Kpi, 'hasDraftChanges' | 'appliesTo' | 'description' | 'evidence' | 'rules' | 'updatedAt' | 'versions' | 'draft' | 'workflow'> &
  Partial<Pick<Kpi, 'hasDraftChanges' | 'appliesTo' | 'description' | 'workflow'>>;

const DAY = 24 * 60 * 60 * 1000;
const BASE = Date.UTC(2026, 10, 20);
const iso = (daysAgo: number) => new Date(BASE - daysAgo * DAY).toISOString();

/** Fills the editor-only fields with plausible sample values. */
const kpi = (k: K): Kpi => {
  const first = k.inputs.find((i) => i.type === 'number' || i.type === 'yesno' || i.type === 'choice');
  const rules: ScoringRule[] =
    k.hasScoringRules && first
      ? [
          { id: `${k.id}-r1`, inputId: first.id, op: 'gte', value: first.type === 'number' ? 3 : 1, points: 5 },
          { id: `${k.id}-r2`, inputId: first.id, op: 'gte', value: first.type === 'number' ? 1 : 0, points: 2 },
        ]
      : [];
  const versions: KpiVersion[] =
    k.status === 'draft' ? [] : Array.from({ length: k.version }, (_, i) => ({ version: i + 1, publishedAt: iso(120 - i * 30), note: i === 0 ? 'First version' : 'Clarified the evidence guidance' }));
  const base: Kpi = {
    hasDraftChanges: false,
    appliesTo: 'All teaching staff',
    description: '',
    ...k,
    evidence: { fileTypes: k.evidenceRequired ? ['PDF', 'Images'] : [], guidance: k.evidenceRequired ? 'Attach a signed or official record.' : '' },
    rules,
    workflow: k.workflow ?? defaultWorkflow(rules),
    updatedAt: iso(k.status === 'draft' ? 0 : (k.code.length * 7) % 40),
    versions,
  };
  if (base.hasDraftChanges) {
    base.draft = {
      name: base.name,
      description: 'Count papers presented, not only submitted.',
      kraId: base.kraId,
      appliesTo: base.appliesTo,
      inputs: base.inputs,
      evidenceRequired: base.evidenceRequired,
      evidence: base.evidence,
      rules: base.rules,
      workflow: base.workflow,
    };
  }
  return base;
};

/**
 * Example of one KPI scored differently by role: a team member needs 1 peer review for full marks, a lead needs 2.
 * Leads are people who review others; everyone else follows the team member path.
 */
const PEER_REVIEWS: Workflow = {
  nodes: [
    { id: 'trigger', kind: 'trigger', name: 'Employee submits', routes: { next: 'pr-split' } },
    {
      id: 'pr-split',
      kind: 'split',
      name: 'Who is submitting?',
      branches: [{ id: 'lead', label: 'Lead', match: { by: 'reviewer' } }],
      otherLabel: 'Team member',
      routes: { lead: 'pr-score-lead', other: 'pr-score-member' },
    },
    {
      id: 'pr-score-lead',
      kind: 'action',
      tool: 'score',
      name: 'Score for leads',
      rules: [
        { id: 'prl-1', inputId: 'n', op: 'gte', value: 2, points: 10 },
        { id: 'prl-2', inputId: 'n', op: 'eq', value: 1, points: 5 },
      ],
      routes: { next: 'pr-review' },
    },
    {
      id: 'pr-score-member',
      kind: 'action',
      tool: 'score',
      name: 'Score for team members',
      rules: [{ id: 'prm-1', inputId: 'n', op: 'gte', value: 1, points: 10 }],
      routes: { next: 'pr-review' },
    },
    { id: 'pr-review', kind: 'review', name: 'Reviewer checks it', routes: {} },
  ],
};

export const SAMPLE_KPIS: Kpi[] = [
  kpi({ id: 'tl-1', code: 'TL-1', name: 'Teaching pedagogy score', kraId: 'kra-tl', status: 'published', version: 2, inputs: [num('pct', 'Teaching score'), file('ev', 'Review report')], evidenceRequired: true, hasScoringRules: true }),
  kpi({ id: 'tl-2', code: 'TL-2', name: 'Course results', kraId: 'kra-tl', status: 'published', version: 1, inputs: [num('pass', 'Pass percentage'), num('avg', 'Class average')], evidenceRequired: false, hasScoringRules: true }),
  kpi({ id: 'tl-3', code: 'TL-3', name: 'Student feedback', kraId: 'kra-tl', status: 'published', version: 1, inputs: [num('rating', 'Feedback rating')], evidenceRequired: false, hasScoringRules: true }),
  kpi({ id: 'tl-4', code: 'TL-4', name: 'Course materials prepared', kraId: 'kra-tl', status: 'published', version: 1, inputs: [yes('done', 'Materials prepared'), file('ev', 'Materials')], evidenceRequired: true, hasScoringRules: true }),
  kpi({
    id: 'tl-6',
    code: 'TL-6',
    name: 'Peer reviews completed',
    kraId: 'kra-tl',
    status: 'published',
    version: 1,
    inputs: [{ id: 'n', label: 'Peer reviews submitted', type: 'number', required: true, min: 0, max: 20 }],
    evidenceRequired: false,
    hasScoringRules: true,
    description: 'Team members need 1 peer review for full marks; leads need 2.',
    workflow: PEER_REVIEWS,
  }),
  kpi({ id: 'tl-5', code: 'TL-5', name: 'Guest lecture delivery', kraId: 'kra-tl', status: 'draft', version: 1, inputs: [num('n', 'Lectures delivered'), pick('aud', 'Audience'), file('ev', 'Proof')], evidenceRequired: true, hasScoringRules: false }),
  kpi({ id: 'rd-1', code: 'RD-1', name: 'Journal publications', kraId: 'kra-rd', status: 'published', version: 3, inputs: [num('n', 'Papers published'), pick('idx', 'Indexing'), file('ev', 'Papers')], evidenceRequired: true, hasScoringRules: true }),
  kpi({ id: 'rd-6', code: 'RD-6', name: 'Conference papers', kraId: 'kra-rd', status: 'published', version: 2, hasDraftChanges: true, inputs: [pick('kind', 'Submitted or presented'), file('ev', 'Certificate')], evidenceRequired: true, hasScoringRules: true }),
  kpi({ id: 'rd-8', code: 'RD-8', name: 'Funded projects', kraId: 'kra-rd', status: 'published', version: 1, inputs: [num('amt', 'Grant amount'), file('ev', 'Sanction letter')], evidenceRequired: true, hasScoringRules: true }),
  kpi({ id: 'rd-10', code: 'RD-10', name: 'Patents filed', kraId: 'kra-rd', status: 'draft', version: 1, inputs: [num('n', 'Patents filed')], evidenceRequired: false, hasScoringRules: false }),
  kpi({ id: 'ei-1', code: 'EI-1', name: 'Industry collaboration', kraId: 'kra-ei', status: 'published', version: 1, inputs: [num('n', 'MoUs or projects'), file('ev', 'Agreement')], evidenceRequired: true, hasScoringRules: true }),
  kpi({ id: 'ei-3', code: 'EI-3', name: 'Workshops organised', kraId: 'kra-ei', status: 'published', version: 1, inputs: [num('n', 'Workshops'), file('ev', 'Report')], evidenceRequired: true, hasScoringRules: true }),
  kpi({ id: 'ei-11', code: 'EI-11', name: 'Outreach programmes', kraId: 'kra-ei', status: 'draft', version: 1, inputs: [], evidenceRequired: false, hasScoringRules: false }),
  kpi({ id: 'o-2', code: 'O-2', name: 'Committee membership', kraId: 'kra-op', status: 'published', version: 1, inputs: [num('n', 'Committees')], evidenceRequired: false, hasScoringRules: true }),
  kpi({ id: 'o-4', code: 'O-4', name: 'Exam duties', kraId: 'kra-op', status: 'published', version: 1, inputs: [num('n', 'Duties completed')], evidenceRequired: false, hasScoringRules: true }),
  kpi({ id: 'o-7', code: 'O-7', name: 'Accreditation work', kraId: 'kra-op', status: 'draft', version: 1, inputs: [pick('role', 'Role'), file('ev', 'Assignment letter')], evidenceRequired: true, hasScoringRules: false, appliesTo: '' }),
  kpi({ id: 'sd-1', code: 'SD-1', name: 'Mentoring hours', kraId: 'kra-sd', status: 'published', version: 1, inputs: [num('h', 'Hours')], evidenceRequired: false, hasScoringRules: true }),
  kpi({ id: 'sd-4', code: 'SD-4', name: 'Placement support', kraId: 'kra-sd', status: 'published', version: 1, inputs: [num('n', 'Students placed'), file('ev', 'Placement list')], evidenceRequired: true, hasScoringRules: true }),
  kpi({ id: 'ec-1', code: 'EC-1', name: 'Events coordinated', kraId: 'kra-ec', status: 'published', version: 1, inputs: [num('n', 'Events'), file('ev', 'Event report')], evidenceRequired: true, hasScoringRules: true }),
  kpi({ id: 'ec-2', code: 'EC-2', name: 'Co-curricular clubs', kraId: 'kra-ec', status: 'archived', version: 1, inputs: [num('n', 'Clubs')], evidenceRequired: false, hasScoringRules: true }),
];

/** Sample results per published KPI for the running cycle (2026 H1), for the whole organization. */
export type KpiSample = {
  /** Share of expected people who submitted, 0 to 1. */
  submitted: number;
  /** Share of submissions sent back for correction, 0 to 1. */
  returnRate: number;
  /** Average mark out of 5. Sample only. */
  avgMark: number;
  /** Share of people at full marks, 0 to 1. */
  fullMarkShare: number;
};

export const SAMPLE_KPI_RESULTS: Record<string, KpiSample> = {
  'tl-1': { submitted: 0.94, returnRate: 0.08, avgMark: 3.9, fullMarkShare: 0.22 },
  'tl-2': { submitted: 0.91, returnRate: 0.04, avgMark: 3.6, fullMarkShare: 0.15 },
  'tl-3': { submitted: 0.88, returnRate: 0.03, avgMark: 4.6, fullMarkShare: 0.91 },
  'tl-4': { submitted: 0.85, returnRate: 0.12, avgMark: 4.2, fullMarkShare: 0.48 },
  'rd-1': { submitted: 0.61, returnRate: 0.18, avgMark: 3.1, fullMarkShare: 0.09 },
  'rd-6': { submitted: 0.57, returnRate: 0.41, avgMark: 2.8, fullMarkShare: 0.06 },
  'rd-8': { submitted: 0.34, returnRate: 0.22, avgMark: 3.0, fullMarkShare: 0.11 },
  'ei-1': { submitted: 0.42, returnRate: 0.15, avgMark: 3.3, fullMarkShare: 0.12 },
  'ei-3': { submitted: 0.53, returnRate: 0.09, avgMark: 3.7, fullMarkShare: 0.2 },
  'o-2': { submitted: 0.0, returnRate: 0, avgMark: 0, fullMarkShare: 0 },
  'o-4': { submitted: 0.97, returnRate: 0.02, avgMark: 4.8, fullMarkShare: 0.95 },
  'sd-1': { submitted: 0.72, returnRate: 0.06, avgMark: 3.8, fullMarkShare: 0.18 },
  'sd-4': { submitted: 0.48, returnRate: 0.27, avgMark: 3.4, fullMarkShare: 0.14 },
  'ec-1': { submitted: 0.66, returnRate: 0.11, avgMark: 3.9, fullMarkShare: 0.25 },
};

/** Cumulative share of expected submissions made, by week of the cycle. Deadline is week 8. */
/**
 * The sample cycle 2026 H1: opens Monday 5 Jan 2026, submission deadline in the week of 25 May,
 * and "today" is the week of 8 Jun. Each week has the cumulative share of expected submissions made.
 */
const CYCLE_START = Date.UTC(2026, 0, 5);
const WEEKS = 23;
const FINAL_SHARE = 0.66;
const curve = (i: number) => 1 / (1 + Math.exp(-(i - 12) / 3.4));
export const SAMPLE_WEEKS: { start: string; share: number }[] = Array.from({ length: WEEKS }, (_, i) => ({
  start: new Date(CYCLE_START + i * 7 * 86_400_000).toISOString(),
  share: Math.round((FINAL_SHARE * (curve(i) - curve(-1))) / (curve(WEEKS - 1) - curve(-1)) * 1000) / 1000,
}));
/** Index of the week the submission deadline falls in (week of 25 May). */
export const SAMPLE_DEADLINE_WEEK = 20;
/** Kept for older callers: the weekly shares on their own. */
export const SAMPLE_WEEKLY_PROGRESS = SAMPLE_WEEKS.map((w) => w.share);

/** How the organization's submissions split by status. Shares, 0 to 1. */
export const SAMPLE_STATUS_SHARE = { notStarted: 0.32, submitted: 0.14, inReview: 0.18, returned: 0.06, released: 0.3 };

/** Per-department submission rates, applied to the organization's real departments in order. */
export const SAMPLE_DEPARTMENT_RATES = [0.78, 0.64, 0.71, 0.52, 0.83, 0.6, 0.69, 0.58];

/** Mark distribution bins, out of 5. Sample only. */
export const SAMPLE_MARK_BINS = [
  { label: '0–1', share: 0.05 },
  { label: '1–2', share: 0.09 },
  { label: '2–3', share: 0.21 },
  { label: '3–4', share: 0.38 },
  { label: '4–5', share: 0.27 },
];

/** Share of answers sent in after the deadline, and their average delay in days. Sample only. */
export const SAMPLE_LATE = { share: 0.08, avgDays: 2.4 };

export const SAMPLE_REVIEW = { avgDaysToReview: 3.4, oldestWaitingDays: 11, evidence: { missing: 7, unreadable: 3, replaced: 5 } };
