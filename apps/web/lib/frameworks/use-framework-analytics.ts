'use client';

import { useMemo } from 'react';
import type { Department, Employee } from '@/lib/setup-store';
import { useSetup } from '@/lib/setup-store';
import {
  SAMPLE_DEADLINE_WEEK,
  SAMPLE_DEPARTMENT_RATES,
  SAMPLE_KPI_RESULTS,
  SAMPLE_MARK_BINS,
  SAMPLE_REVIEW,
  SAMPLE_STATUS_SHARE,
  SAMPLE_WEEKLY_PROGRESS,
} from './sample-data';
import type {
  AnalyticsFilters,
  AnalyticsScope,
  FrameworkAnalytics,
  HealthStats,
  Kpi,
  KpiRow,
  Kra,
  OutcomeStats,
  ParticipationStats,
  ReviewStats,
  SubmissionStatus,
} from './types';
import { useFrameworkLibrary, type DemoStage } from './use-framework-library';

/** Used when the prototype has no people yet, so charts still have something to show. */
const SAMPLE_PEOPLE = { organization: 48, reviewer: 6 };

type Input = {
  kras: Kra[];
  kpis: Kpi[];
  stage: DemoStage;
  departments: Department[];
  employees: Employee[];
  scope: AnalyticsScope;
  filters: AnalyticsFilters;
};

const pct = (v: number) => Math.round(v * 100);

/**
 * Pure function: builds the analytics for one scope and set of filters.
 * Kept separate from React so it can be unit tested and later swapped for an API call.
 */
export function buildFrameworkAnalytics({ kras, kpis, stage, departments, employees, scope, filters }: Input): FrameworkAnalytics {
  const base = { scope, filters, health: null, participation: null, review: null, outcomes: null, kpiRows: [], weekly: { points: [], deadlineIndex: 0 } };
  if (stage === 'empty' || kras.length === 0) return { ...base, state: 'empty' };

  const isOrg = scope.kind === 'organization';
  const inKra = (k: Kpi) => !filters.kraId || k.kraId === filters.kraId;
  const live = kpis.filter((k) => k.status !== 'archived' && inKra(k));
  const shownKras = kras.filter((k) => !filters.kraId || k.id === filters.kraId);

  const health: HealthStats | null = isOrg
    ? {
        kras: shownKras.length,
        kpis: live.length,
        published: live.filter((k) => k.status === 'published').length,
        drafts: live.filter((k) => k.status === 'draft').length,
        evidenceShare: live.length ? pct(live.filter((k) => k.evidenceRequired).length / live.length) : 0,
        incomplete: live
          .map((k) => ({
            id: k.id,
            code: k.code,
            name: k.name,
            problem: k.inputs.length === 0 ? 'No inputs yet' : !k.hasScoringRules ? 'No scoring rules' : !k.appliesTo ? 'Not assigned to anyone' : '',
          }))
          .filter((k) => k.problem),
        unapprovedScoring: live.filter((k) => k.hasScoringRules).length,
      }
    : null;

  const kraName = (id: string) => kras.find((k) => k.id === id)?.name ?? '';
  // Every live KPI as a table row; numbers are filled in below once a cycle is running.
  const emptyRow = (k: Kpi): KpiRow => ({
    id: k.id,
    code: k.code,
    name: k.name,
    kraId: k.kraId,
    kraName: kraName(k.kraId),
    status: k.status,
    submittedPercent: 0,
    submissions: 0,
    returnPercent: 0,
    avgMark: null,
    evidenceRequired: k.evidenceRequired,
  });

  if (stage === 'built') return { ...base, state: 'noSubmissions', health, kpiRows: live.map(emptyRow) };

  // People in scope. Reviewers see only their reviewees; the department filter applies to admins only.
  const reviewees = scope.kind === 'reviewer' ? employees.filter((e) => e.reviewerId === scope.reviewerId) : [];
  const inDept = isOrg && filters.departmentId ? employees.filter((e) => e.departmentId === filters.departmentId) : employees;
  const realPeople = isOrg ? inDept.length : reviewees.length;
  const people = realPeople || SAMPLE_PEOPLE[scope.kind];

  const deptIndex = departments.findIndex((d) => d.id === filters.departmentId);
  const avgDeptRate = SAMPLE_DEPARTMENT_RATES.reduce((a, r) => a + r, 0) / SAMPLE_DEPARTMENT_RATES.length;
  const factor = isOrg && deptIndex >= 0 ? SAMPLE_DEPARTMENT_RATES[deptIndex % SAMPLE_DEPARTMENT_RATES.length] / avgDeptRate : 1;

  const published = live.filter((k) => k.status === 'published' && SAMPLE_KPI_RESULTS[k.id]);
  const rows = published.map((k) => {
    const r = SAMPLE_KPI_RESULTS[k.id];
    const share = Math.min(1, r.submitted * factor);
    return { kpi: k, r, share, submissions: Math.round(share * people) };
  });

  const expected = people * rows.length || 1;
  const totalSubmitted = rows.reduce((a, x) => a + x.submissions, 0);
  const byStatus = Object.fromEntries(
    (Object.keys(SAMPLE_STATUS_SHARE) as SubmissionStatus[]).map((s) => [s, Math.round(SAMPLE_STATUS_SHARE[s] * expected)]),
  ) as Record<SubmissionStatus, number>;
  const ranked = [...rows].sort((a, b) => b.submissions - a.submissions);
  const toItem = (x: (typeof rows)[number]) => ({ id: x.kpi.id, code: x.kpi.code, name: x.kpi.name, submissions: x.submissions });

  const participation: ParticipationStats = {
    people,
    submissionRate: pct(totalSubmitted / expected),
    overdue: Math.round(byStatus.notStarted * 0.12),
    byStatus,
    mostSubmitted: ranked.slice(0, 5).map(toItem),
    leastSubmitted: ranked.slice(-3).reverse().map(toItem),
    byKra: shownKras
      .map((kra) => {
        const mine = rows.filter((x) => x.kpi.kraId === kra.id);
        return { id: kra.id, name: kra.name, percent: mine.length ? pct(mine.reduce((a, x) => a + x.share, 0) / mine.length) : 0 };
      })
      .filter((k) => rows.some((x) => x.kpi.kraId === k.id)),
    byDepartment: isOrg
      ? departments.map((d, i) => ({ id: d.id, name: d.name, percent: pct(SAMPLE_DEPARTMENT_RATES[i % SAMPLE_DEPARTMENT_RATES.length]) }))
      : [],
    overTime: {
      points: SAMPLE_WEEKLY_PROGRESS.map((v, i) => ({ label: `W${i + 1}`, value: Math.round(v * factor * expected) })),
      deadlineIndex: SAMPLE_DEADLINE_WEEK,
    },
  };

  const scale = people / SAMPLE_PEOPLE.organization;
  const review: ReviewStats = {
    queue: byStatus.submitted + byStatus.inReview,
    avgDaysToReview: SAMPLE_REVIEW.avgDaysToReview,
    oldestWaitingDays: SAMPLE_REVIEW.oldestWaitingDays,
    mostReturned: [...rows]
      .sort((a, b) => b.r.returnRate - a.r.returnRate)
      .slice(0, 3)
      .map((x) => ({ id: x.kpi.id, code: x.kpi.code, name: x.kpi.name, returnRate: pct(x.r.returnRate) })),
    evidenceIssues: {
      missing: Math.round(SAMPLE_REVIEW.evidence.missing * scale),
      unreadable: Math.round(SAMPLE_REVIEW.evidence.unreadable * scale),
      replaced: Math.round(SAMPLE_REVIEW.evidence.replaced * scale),
    },
  };

  const marked = rows.filter((x) => x.r.avgMark > 0);
  const outcomes: OutcomeStats = {
    isSample: true,
    avgByKra: shownKras
      .map((kra) => {
        const mine = marked.filter((x) => x.kpi.kraId === kra.id);
        return { id: kra.id, name: kra.name, value: mine.length ? mine.reduce((a, x) => a + x.r.avgMark, 0) / mine.length : 0 };
      })
      .filter((k) => k.value > 0),
    avgByKpi: marked.map((x) => ({ id: x.kpi.id, code: x.kpi.code, name: x.kpi.name, value: x.r.avgMark })),
    distribution: SAMPLE_MARK_BINS.map((b) => ({ label: b.label, count: Math.round(b.share * byStatus.released) })),
    ceilingKpis: marked
      .filter((x) => x.r.fullMarkShare >= 0.8)
      .map((x) => ({ id: x.kpi.id, code: x.kpi.code, name: x.kpi.name, fullMarkShare: pct(x.r.fullMarkShare) })),
    vsLastCycle: 0.3,
  };

  const kpiRows: KpiRow[] = live.map((k) => {
    const x = rows.find((row) => row.kpi.id === k.id);
    if (!x) return emptyRow(k);
    return {
      ...emptyRow(k),
      submittedPercent: pct(x.share),
      submissions: x.submissions,
      returnPercent: pct(x.r.returnRate),
      avgMark: x.r.avgMark > 0 ? x.r.avgMark : null,
    };
  });

  // Sample week-by-week series, shaped so the last week matches the headline numbers.
  const lastShare = SAMPLE_WEEKLY_PROGRESS[SAMPLE_WEEKLY_PROGRESS.length - 1];
  const weekly = {
    deadlineIndex: SAMPLE_DEADLINE_WEEK,
    points: SAMPLE_WEEKLY_PROGRESS.map((v, i) => {
      const f = v / lastShare;
      return {
        label: `W${i + 1}`,
        submissionRate: Math.round(participation.submissionRate * f),
        waiting: Math.round(review.queue * Math.min(1, f * 1.25) * (0.7 + 0.3 * f)),
        overdue: i < SAMPLE_DEADLINE_WEEK ? 0 : participation.overdue,
        released: Math.round(byStatus.released * f * f),
      };
    }),
  };

  return { ...base, state: 'active', health, participation, review, outcomes, kpiRows, weekly };
}

/** Framework analytics for one scope. Frontend only: returns sample data until the API exists. */
export function useFrameworkAnalytics(scope: AnalyticsScope, filters: AnalyticsFilters) {
  const { kras, kpis, stage } = useFrameworkLibrary();
  const { departments, employees } = useSetup();
  // Scope is compared by value so callers can pass an inline object.
  const scopeKey = scope.kind === 'reviewer' ? `r:${scope.reviewerId}` : 'org';
  return useMemo(
    () => buildFrameworkAnalytics({ kras, kpis, stage, departments, employees, scope, filters }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kras, kpis, stage, departments, employees, scopeKey, filters.cycle, filters.kraId, filters.departmentId],
  );
}
