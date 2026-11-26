'use client';

import { CalendarClock } from 'lucide-react';
import { MetricStrip, type StripMetric } from '@/components/dashboard/metric-strip';
import { RankedPanel, type RankedTab } from '@/components/dashboard/ranked-panel';
import type { AnalyticsSection, FrameworkAnalytics as Analytics } from '@/lib/frameworks/types';
import { KpiTable } from './kpi-table';

type FrameworkAnalyticsProps = {
  analytics: Analytics;
  /** Which sections to show. The page decides: admins get all four, reviewers get no health. */
  sections: AnalyticsSection[];
};

const pct = (v: number) => `${Math.round(v)}%`;

/**
 * Framework Studio analytics in a Vercel-analytics / Stripe style: a metric strip that switches one chart,
 * two ranked panels, then the KPI table. Presentational only: it never checks roles or fetches data,
 * so the admin page and a reviewer page can both use it.
 */
export function FrameworkAnalytics({ analytics: a, sections }: FrameworkAnalyticsProps) {
  const show = (s: AnalyticsSection) => sections.includes(s);
  const isOrg = a.scope.kind === 'organization';
  const p = a.participation;
  const r = a.review;
  const o = a.outcomes;
  const h = show('health') ? a.health : null;
  const week = (pick: (w: Analytics['weekly']['points'][number]) => number) => a.weekly.points.map((w) => ({ label: w.label, value: pick(w) }));

  // Headline numbers. While no cycle is running, show the framework's own numbers instead.
  let metrics: StripMetric[];
  if (p && r) {
    const expected = Object.values(p.byStatus).reduce((x, y) => x + y, 0);
    const made = expected - p.byStatus.notStarted;
    const marks = o?.avgByKpi ?? [];
    const avgMark = marks.length ? marks.reduce((x, k) => x + k.value, 0) / marks.length : 0;
    metrics = [
      { key: 'rate', label: 'Submission rate', value: pct(p.submissionRate), sub: `${made} of ${expected} expected`, series: week((w) => w.submissionRate), yDomain: [0, 100], yTicks: [0, 25, 50, 75, 100], yFormat: pct },
      { key: 'waiting', label: 'Waiting for review', value: String(r.queue), sub: `oldest ${r.oldestWaitingDays} days`, series: week((w) => w.waiting) },
      { key: 'overdue', label: 'Overdue', value: String(p.overdue), sub: 'past the deadline', danger: p.overdue > 0, series: week((w) => w.overdue) },
      { key: 'released', label: 'Released marks', value: String(p.byStatus.released), sub: `avg ${avgMark.toFixed(1)} / 5 · sample`, series: week((w) => w.released) },
    ];
  } else {
    metrics = [
      { key: 'kras', label: 'KRAs', value: String(a.health?.kras ?? 0) },
      { key: 'live', label: 'Live KPIs', value: String(a.health?.published ?? 0), sub: `of ${a.health?.kpis ?? 0}` },
      { key: 'drafts', label: 'Drafts', value: String(a.health?.drafts ?? 0) },
      { key: 'fix', label: 'To fix', value: String(a.health?.incomplete.length ?? 0), danger: (a.health?.incomplete.length ?? 0) > 0, sub: 'before publishing' },
    ];
  }

  const published = a.kpiRows.filter((k) => k.status === 'published');

  const leftTabs: RankedTab[] = p
    ? [
        {
          key: 'kpis',
          label: 'KPIs',
          valueLabel: 'Submitted',
          max: 100,
          rows: [...published].sort((x, y) => y.submittedPercent - x.submittedPercent).map((k) => ({ id: k.id, prefix: k.code, label: k.name, value: k.submittedPercent, display: pct(k.submittedPercent) })),
        },
        { key: 'kras', label: 'KRAs', valueLabel: 'Submitted', max: 100, rows: p.byKra.map((k) => ({ id: k.id, label: k.name, value: k.percent, display: pct(k.percent) })) },
        ...(isOrg
          ? [
              {
                key: 'departments',
                label: 'Departments',
                valueLabel: 'Submitted',
                max: 100,
                rows: p.byDepartment.map((d) => ({ id: d.id, label: d.name, value: d.percent, display: pct(d.percent) })),
                empty: 'Add departments in People to compare them.',
              },
            ]
          : []),
      ]
    : [];

  const toFix: RankedTab | null = h
    ? { key: 'fix', label: 'To fix', valueLabel: 'Problem', rows: h.incomplete.map((k) => ({ id: k.id, prefix: k.code, label: k.name, display: k.problem })), empty: 'Every KPI is ready to publish.' }
    : null;

  const rightTabs: RankedTab[] = [
    ...(r && show('review')
      ? [
          {
            key: 'returned',
            label: 'Returned',
            valueLabel: 'Return rate',
            max: 100,
            rows: [...published]
              .sort((x, y) => y.returnPercent - x.returnPercent)
              .map((k) => ({ id: k.id, prefix: k.code, label: k.name, value: k.returnPercent, display: pct(k.returnPercent), danger: k.returnPercent >= 25 })),
            note: 'A high return rate often means the KPI is unclear.',
          },
        ]
      : []),
    ...(o && show('outcomes')
      ? [
          {
            key: 'marks',
            label: 'Marks',
            valueLabel: 'Average / 5',
            max: 5,
            rows: o.avgByKra.map((k) => ({ id: k.id, label: k.name, value: k.value, display: k.value.toFixed(1) })),
            note: 'Sample data until scoring policy is approved.',
          },
        ]
      : []),
    ...(toFix ? [toFix] : []),
  ];

  return (
    <div className="grid gap-4 *:min-w-0">
      <MetricStrip
        metrics={metrics}
        marker={a.weekly.points[a.weekly.deadlineIndex] ? { at: a.weekly.points[a.weekly.deadlineIndex].label, label: 'Deadline' } : undefined}
      />

      {a.state === 'noSubmissions' && (
        <p className="text-muted-foreground flex items-center gap-2 px-1 text-sm">
          <CalendarClock className="size-4 shrink-0" aria-hidden />
          Submission, review and mark numbers start once a cycle is running.
        </p>
      )}

      {(leftTabs.length > 0 || rightTabs.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {leftTabs.length > 0 && <RankedPanel tabs={leftTabs} />}
          {rightTabs.length > 0 && <RankedPanel tabs={rightTabs} />}
        </div>
      )}

      {a.kpiRows.length > 0 && (
        <div className="pt-4">
          <KpiTable rows={a.kpiRows} showResults={a.state === 'active'} />
        </div>
      )}
    </div>
  );
}
