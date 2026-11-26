'use client';

import { MetricStrip, type StripMetric } from '@/components/dashboard/metric-strip';
import { RankedPanel } from '@/components/dashboard/ranked-panel';
import { PageHeader } from '@/components/page-header';
import { useAdminUser } from '@/lib/admin-user';
import { useSetupProgress } from '@/lib/setup-progress';
import { useSetup } from '@/lib/setup-store';

// Prototype only: appraisal scores and review counts come from Framework Studio, which has no backend yet.
// Everything below except the people counts is sample data.
const CYCLES = ['23 H1', '23 H2', '24 H1', '24 H2', '26 H1'];
const series = (values: number[]) => CYCLES.map((label, i) => ({ label, value: values[i] }));
const DEPT_SCORES = [4.1, 3.8, 3.6, 3.9, 3.7, 4.0, 3.5, 3.8];
const DEPT_COMPLETION = [84, 66, 71, 58, 77, 62, 69, 74];
const pct = (v: number) => `${Math.round(v)}%`;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function HomePage() {
  const { departments, employees, invitesSent } = useSetup();
  const { allDone, attention } = useSetupProgress();
  const user = useAdminUser();

  const participation = employees.length === 0 || !invitesSent ? 0 : allDone ? 100 : 60;
  const joined = Math.round((participation / 100) * employees.length);

  const metrics: StripMetric[] = [
    { key: 'completion', label: 'Appraisal completion', value: '72%', sub: '+8 pts on last cycle', series: series([51, 58, 63, 64, 72]), yDomain: [0, 100], yTicks: [0, 25, 50, 75, 100], yFormat: pct },
    { key: 'score', label: 'Average score', value: '3.9', sub: 'out of 5', series: series([3.4, 3.5, 3.7, 3.6, 3.9]), yDomain: [3, 4], yTicks: [3, 3.25, 3.5, 3.75, 4], yFormat: (v) => v.toFixed(2).replace(/0$/, '') },
    { key: 'pending', label: 'Reviews pending', value: '14', sub: '3 overdue', danger: true, series: series([22, 19, 17, 18, 14]) },
    {
      key: 'participation',
      label: 'Participation',
      value: `${participation}%`,
      sub: invitesSent ? `${joined} of ${employees.length} joined` : 'invitations not sent',
    },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description="Appraisal cycle 2026 H1. Scores and reviews are sample data."
      />

      <MetricStrip metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <RankedPanel
          tabs={[
            {
              key: 'score',
              label: 'Average score',
              valueLabel: 'Out of 5',
              max: 5,
              rows: departments.map((d, i) => {
                const v = DEPT_SCORES[i % DEPT_SCORES.length];
                return { id: d.id, label: d.name, value: v, display: v.toFixed(1) };
              }),
              empty: 'Add departments in People to compare them.',
            },
            {
              key: 'completion',
              label: 'Completion',
              valueLabel: 'Completed',
              max: 100,
              rows: departments.map((d, i) => {
                const v = DEPT_COMPLETION[i % DEPT_COMPLETION.length];
                return { id: d.id, label: d.name, value: v, display: pct(v) };
              }),
              empty: 'Add departments in People to compare them.',
            },
          ]}
        />
        <RankedPanel
          tabs={[
            {
              key: 'reviews',
              label: 'Review status',
              valueLabel: 'Submissions',
              rows: [
                { id: 'submitted', label: 'Submitted', value: 18, display: '18' },
                { id: 'review', label: 'In review', value: 14, display: '14' },
                { id: 'released', label: 'Released', value: 18, display: '18' },
                { id: 'overdue', label: 'Overdue reviews', value: 3, display: '3', danger: true },
              ],
            },
            {
              key: 'attention',
              label: 'Needs attention',
              valueLabel: 'Action',
              rows: attention.map((x) => ({ id: x.id, label: x.text, display: x.action, danger: x.tone === 'danger' })),
              empty: 'Nothing needs attention.',
            },
          ]}
        />
      </div>
    </>
  );
}
