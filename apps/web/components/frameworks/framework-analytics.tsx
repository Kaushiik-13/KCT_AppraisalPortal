'use client';

import { MetricStrip, type StripMetric } from '@/components/dashboard/metric-strip';
import { RankedPanel, type RankedTab } from '@/components/dashboard/ranked-panel';
import type { AnalyticsSection, FrameworkAnalytics as Analytics } from '@/lib/frameworks/types';
import { KpiTable } from './kpi-table';

type FrameworkAnalyticsProps = {
  analytics: Analytics;
  /** Which sections to show. The page decides. */
  sections: AnalyticsSection[];
};

const pct = (v: number) => `${Math.round(v)}%`;

/**
 * Framework Studio analytics, about the KRAs and KPIs only: how many there are, how much has been
 * submitted against them, what is waiting for review and what is overdue, by KRA, KPI and department.
 * Presentational only: it never checks roles or fetches data.
 */
export function FrameworkAnalytics({ analytics: a, sections }: FrameworkAnalyticsProps) {
  const show = (s: AnalyticsSection) => sections.includes(s);
  const p = a.participation;
  const r = a.review;
  const h = a.health;
  const week = (pick: (w: Analytics['weekly']['points'][number]) => number) => a.weekly.points.map((w) => ({ label: w.label, value: pick(w) }));

  const framework: StripMetric[] = [
    { key: 'kras', label: 'KRAs', value: String(h?.kras ?? 0), sub: 'areas of work' },
    { key: 'kpis', label: 'KPIs', value: String(h?.kpis ?? 0), sub: `${h?.published ?? 0} live · ${h?.drafts ?? 0} ${h?.drafts === 1 ? 'draft' : 'drafts'}` },
  ];

  let metrics: StripMetric[];
  if (p && r && show('participation')) {
    const expected = Object.values(p.byStatus).reduce((x, y) => x + y, 0);
    const made = expected - p.byStatus.notStarted;
    metrics = [
      ...framework,
      {
        key: 'submitted',
        label: 'Submissions',
        value: String(made),
        sub: `of ${expected} expected`,
        series: week((w) => Math.round((w.submissionRate / 100) * expected)),
        seriesLabel: 'Submissions',
      },
      {
        key: 'rate',
        label: 'Average submission',
        value: pct(p.submissionRate),
        sub: 'across live KPIs',
        series: week((w) => w.submissionRate),
        seriesLabel: 'Average submission',
        yDomain: [0, 100],
        yTicks: [0, 25, 50, 75, 100],
        yFormat: pct,
      },
      ...(show('review')
        ? [
            {
              key: 'waiting',
              label: 'Waiting for review',
              value: String(r.queue),
              sub: `avg review ${r.avgDaysToReview} days`,
              series: week((w) => w.waiting),
            },
          ]
        : []),
      { key: 'overdue', label: 'Overdue', value: String(p.overdue), sub: 'past the deadline', danger: p.overdue > 0, series: week((w) => w.overdue) },
    ];
  } else {
    metrics = [
      ...framework,
      { key: 'drafts', label: 'Drafts', value: String(h?.drafts ?? 0), sub: 'not live yet' },
      { key: 'fix', label: 'To fix', value: String(h?.incomplete.length ?? 0), sub: 'before publishing', danger: (h?.incomplete.length ?? 0) > 0 },
    ];
  }

  const published = a.kpiRows.filter((k) => k.status === 'published');
  // Expected submissions for one KPI = people in scope; a KRA's count is the sum over its live KPIs.
  const kraSubmitted = (kraId: string) => published.filter((k) => k.kraId === kraId).reduce((s, k) => s + k.submissions, 0);

  const submissionTabs: RankedTab[] = p
    ? [
        {
          key: 'kra',
          label: 'By KRA',
          valueLabel: 'Submitted',
          max: 100,
          rows: p.byKra.map((k) => ({ id: k.id, label: k.name, value: k.percent, display: `${kraSubmitted(k.id)} · ${pct(k.percent)}` })),
        },
        {
          key: 'kpi',
          label: 'By KPI',
          valueLabel: 'Submitted',
          max: 100,
          rows: [...published]
            .sort((x, y) => y.submittedPercent - x.submittedPercent)
            .map((k) => ({ id: k.id, prefix: k.code, label: k.name, value: k.submittedPercent, display: `${k.submissions} · ${pct(k.submittedPercent)}` })),
        },
        {
          key: 'department',
          label: 'By department',
          valueLabel: 'Submitted',
          max: 100,
          rows: p.byDepartment.map((d) => ({ id: d.id, label: d.name, value: d.percent, display: pct(d.percent) })),
          empty: 'Add departments in People to compare them.',
        },
      ]
    : [];

  const perKra: RankedTab | null = h
    ? {
        key: 'perKra',
        label: 'KPIs per KRA',
        valueLabel: 'KPIs',
        rows: h.kpisPerKra.map((k) => ({
          id: k.id,
          label: k.name,
          value: k.live + k.drafts,
          display: k.drafts ? `${k.live} live · ${k.drafts} draft` : `${k.live} live`,
        })),
        empty: 'No KRAs yet.',
      }
    : null;

  const kpiTabs: RankedTab[] = [
    ...(perKra ? [perKra] : []),
    ...(p
      ? [
          {
            key: 'least',
            label: 'Least submitted',
            valueLabel: 'Submitted',
            max: 100,
            rows: [...published]
              .sort((x, y) => x.submittedPercent - y.submittedPercent)
              .map((k) => ({ id: k.id, prefix: k.code, label: k.name, value: k.submittedPercent, display: pct(k.submittedPercent), danger: k.submittedPercent < 40 })),
          },
        ]
      : []),
    ...(h && show('health')
      ? [
          {
            key: 'fix',
            label: 'To fix',
            valueLabel: 'Problem',
            rows: h.incomplete.map((k) => ({ id: k.id, prefix: k.code, label: k.name, display: k.problem })),
            empty: 'Every KPI is ready to publish.',
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-4 *:min-w-0">
      {a.state === 'active' && (
        <p className="text-muted-foreground -mb-1 px-1 text-xs">Cycle 2026 H1 · sample submissions until appraisal cycles are built</p>
      )}
      <MetricStrip
        metrics={metrics}
        marker={a.weekly.points[a.weekly.deadlineIndex] ? { at: a.weekly.points[a.weekly.deadlineIndex].label, label: 'Deadline' } : undefined}
      />

      {a.state === 'noSubmissions' && (
        <p className="text-muted-foreground px-1 text-sm">Submission, review and overdue numbers start once a cycle is running.</p>
      )}

      <div className={submissionTabs.length ? 'grid gap-4 lg:grid-cols-2' : 'grid gap-4'}>
        {submissionTabs.length > 0 && <RankedPanel tabs={submissionTabs} />}
        {kpiTabs.length > 0 && <RankedPanel tabs={kpiTabs} />}
      </div>

      {a.kpiRows.length > 0 && (
        <div className="pt-4">
          <KpiTable rows={a.kpiRows} showResults={a.state === 'active'} />
        </div>
      )}
    </div>
  );
}
