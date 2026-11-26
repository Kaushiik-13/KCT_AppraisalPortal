import type { Kpi, KpiInput, Kra } from './types';

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

type K = Omit<Kpi, 'hasDraftChanges' | 'appliesTo'> & Partial<Pick<Kpi, 'hasDraftChanges' | 'appliesTo'>>;
const kpi = (k: K): Kpi => ({ hasDraftChanges: false, appliesTo: 'All teaching staff', ...k });

export const SAMPLE_KPIS: Kpi[] = [
  kpi({ id: 'tl-1', code: 'TL-1', name: 'Teaching pedagogy score', kraId: 'kra-tl', status: 'published', version: 2, inputs: [num('pct', 'Teaching score'), file('ev', 'Review report')], evidenceRequired: true, hasScoringRules: true }),
  kpi({ id: 'tl-2', code: 'TL-2', name: 'Course results', kraId: 'kra-tl', status: 'published', version: 1, inputs: [num('pass', 'Pass percentage'), num('avg', 'Class average')], evidenceRequired: false, hasScoringRules: true }),
  kpi({ id: 'tl-3', code: 'TL-3', name: 'Student feedback', kraId: 'kra-tl', status: 'published', version: 1, inputs: [num('rating', 'Feedback rating')], evidenceRequired: false, hasScoringRules: true }),
  kpi({ id: 'tl-4', code: 'TL-4', name: 'Course materials prepared', kraId: 'kra-tl', status: 'published', version: 1, inputs: [yes('done', 'Materials prepared'), file('ev', 'Materials')], evidenceRequired: true, hasScoringRules: true }),
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
export const SAMPLE_WEEKLY_PROGRESS = [0.04, 0.09, 0.17, 0.26, 0.34, 0.45, 0.58, 0.66];
export const SAMPLE_DEADLINE_WEEK = 7;

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

export const SAMPLE_REVIEW = { avgDaysToReview: 3.4, oldestWaitingDays: 11, evidence: { missing: 7, unreadable: 3, replaced: 5 } };
