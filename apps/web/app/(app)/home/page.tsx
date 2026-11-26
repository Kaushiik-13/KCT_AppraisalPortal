'use client';

import { BarListCard } from '@/components/dashboard/bar-list-card';
import { DonutCard } from '@/components/dashboard/donut-card';
import { MetricCard, MetricGrid } from '@/components/dashboard/metric-card';
import { TrendAreaCard } from '@/components/dashboard/trend-area-card';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { useAdminUser } from '@/lib/admin-user';
import { useSetupProgress } from '@/lib/setup-progress';
import { useSetup } from '@/lib/setup-store';

// Prototype only: appraisal scores and review counts come from Framework Studio, which has no backend yet.
// Everything below except the people counts is sample data.
const SCORE_TREND = [
  { label: '23 H1', value: 3.4 },
  { label: '23 H2', value: 3.5 },
  { label: '24 H1', value: 3.7 },
  { label: '24 H2', value: 3.6 },
  { label: '26 H1', value: 3.9 },
];
const DEPT_SCORES = [4.1, 3.8, 3.6, 3.9, 3.7, 4.0, 3.5, 3.8];
const REVIEW_STATUS = [
  { key: 'submitted', label: 'Submitted', value: 18, color: 'var(--chart-3)' },
  { key: 'inReview', label: 'In review', value: 14, color: 'var(--chart-2)' },
  { key: 'released', label: 'Released', value: 18, color: 'var(--chart-1)' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function HomePage() {
  const { departments, employees, invitesSent } = useSetup();
  const { allDone } = useSetupProgress();
  const user = useAdminUser();

  const participation = employees.length === 0 || !invitesSent ? 0 : allDone ? 100 : 60;
  const joined = Math.round((participation / 100) * employees.length);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description="Appraisal cycle 2026 H1 at a glance."
        actions={<Badge variant="secondary">Scores and reviews are sample data</Badge>}
      />

      <MetricGrid label="Key numbers">
        <MetricCard
          index={0}
          label="Appraisal completion"
          value={72}
          format={(v) => `${Math.round(v)}%`}
          trend={{ label: '+8 pts', direction: 'up' }}
          summary="Up on last cycle"
          detail="People with every KPI released"
        />
        <MetricCard
          index={1}
          label="Average score"
          value={3.9}
          format={(v) => v.toFixed(1)}
          trend={{ label: '+0.3', direction: 'up' }}
          summary="Highest in five cycles"
          detail="Out of 5, released marks only"
        />
        <MetricCard
          index={2}
          label="Reviews pending"
          value={14}
          trend={{ label: '3 overdue', direction: 'down', good: false }}
          summary="3 past the review deadline"
          detail="Waiting for a reviewer"
        />
        <MetricCard
          index={3}
          label="Participation"
          value={participation}
          format={(v) => `${Math.round(v)}%`}
          summary={invitesSent ? `${joined} of ${employees.length} joined` : 'Invitations not sent'}
          detail="People who accepted their invitation"
        />
      </MetricGrid>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TrendAreaCard
            title="Average score by cycle"
            description="Released marks, out of 5"
            seriesLabel="Average score"
            data={SCORE_TREND}
            ranges={[
              { value: '3', label: 'Last 3', last: 3 },
              { value: 'all', label: 'All cycles' },
            ]}
            yDomain={[3, 4]}
            yTickFormat={(v) => v.toFixed(1)}
          />
        </div>
        <div className="lg:col-span-2">
          <DonutCard title="Review status" description="KPI submissions this cycle" totalLabel="submissions" segments={REVIEW_STATUS} />
        </div>
      </div>

      <BarListCard
        title="Average score by department"
        description="Out of 5"
        seriesLabel="Average score"
        items={departments.map((d, i) => ({ id: d.id, label: d.name, value: DEPT_SCORES[i % DEPT_SCORES.length] }))}
        max={5}
        format={(v) => v.toFixed(1)}
        labelWidth={150}
        empty="Add departments in People to compare scores."
      />
    </>
  );
}
