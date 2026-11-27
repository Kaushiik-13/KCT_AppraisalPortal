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
  // Each chartable number has a weekly and a monthly series.
  const week = (pick: (w: Analytics['weekly']['points'][number]) => number) => ({
    weekly: a.weekly.points.map((w) => ({ label: w.label, value: pick(w) })),
    monthly: a.monthly.points.map((w) => ({ label: w.label, value: pick(w) })),
  });

  const kraWord = (n: number) => `${n} ${n === 1 ? 'KRA' : 'KRAs'}`;
  const framework: StripMetric[] = [
    {
      key: 'kpis',
      label: 'KPIs',
      value: String(h?.kpis ?? 0),
      sub: `in ${kraWord(h?.kras ?? 0)} · ${h?.published ?? 0} live`,
    },
  ];

  let metrics: StripMetric[];
  if (p && r && show('participation')) {
    const expected = Object.values(p.byStatus).reduce((x, y) => x + y, 0);
    const made = expected - p.byStatus.notStarted;
    const liveKpis = h?.published ?? 0;
    metrics = [
      ...framework,
      { key: 'people', label: 'Employees', value: String(p.people), sub: 'appraised this cycle' },
      {
        key: 'submitted',
        label: 'KPI submissions',
        value: String(made),
        sub: `of ${expected} (${p.people} × ${liveKpis} KPIs)`,
        seriesByPeriod: week((w) => Math.round((w.submissionRate / 100) * expected)),
        seriesLabel: 'Submissions',
      },
      {
        key: 'rate',
        label: 'Submission rate',
        value: pct(p.submissionRate),
        sub: 'of expected',
        seriesByPeriod: week((w) => w.submissionRate),
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
              sub: `avg ${r.avgDaysToReview} days to review`,
              seriesByPeriod: week((w) => w.waiting),
            },
          ]
        : []),
      {
        key: 'late',
        label: 'Late submissions',
        value: `${p.late.avgDays} days`,
        sub: `avg delay · ${p.late.count} late`,
      },
    ];
  } else {
    metrics = [
      { key: 'kras', label: 'KRAs', value: String(h?.kras ?? 0), sub: 'areas of work' },
      { key: 'kpis', label: 'KPIs', value: String(h?.kpis ?? 0), sub: `${h?.published ?? 0} live` },
      { key: 'drafts', label: 'Draft KPIs', value: String(h?.drafts ?? 0), sub: 'not live yet' },
      { key: 'fix', label: 'KPIs to fix', value: String(h?.incomplete.length ?? 0), sub: 'before publishing', danger: (h?.incomplete.length ?? 0) > 0 },
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
          valueLabel: 'Submissions · rate',
          max: 100,
          rows: p.byKra.map((k) => ({ id: k.id, label: k.name, value: k.percent, display: `${kraSubmitted(k.id)} · ${pct(k.percent)}` })),
        },
        {
          key: 'kpi',
          label: 'By KPI',
          valueLabel: 'Submissions · rate',
          max: 100,
          rows: [...published]
            .sort((x, y) => y.submittedPercent - x.submittedPercent)
            .map((k) => ({ id: k.id, prefix: k.code, label: k.name, value: k.submittedPercent, display: `${k.submissions} · ${pct(k.submittedPercent)}` })),
        },
        {
          key: 'department',
          label: 'By department',
          valueLabel: 'Submission rate',
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
            valueLabel: 'Submission rate',
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
        <p className="text-muted-foreground -mb-1 px-1 text-xs">
          Cycle 2026 H1 · one submission is one employee&apos;s answer to one KPI · sample numbers until appraisal cycles are built
        </p>
      )}
      <MetricStrip
        metrics={metrics}
        periods={[
          { key: 'weekly', label: 'Weekly' },
          { key: 'monthly', label: 'Monthly' },
        ]}
        markers={{
          weekly: a.weekly.points[a.weekly.deadlineIndex] ? { at: a.weekly.points[a.weekly.deadlineIndex].label, label: 'Deadline' } : undefined,
          monthly: a.monthly.points[a.monthly.deadlineIndex] ? { at: a.monthly.points[a.monthly.deadlineIndex].label, label: 'Deadline' } : undefined,
        }}
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
