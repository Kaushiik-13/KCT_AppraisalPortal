'use client';

import { BarList } from '@/components/charts/bar-list';
import { LineChart } from '@/components/charts/line-chart';
import { STATUS_COLORS, StackedBar } from '@/components/charts/stacked-bar';
import { PageHeader } from '@/components/page-header';
import { Panel, StatGrid, StatTile } from '@/components/stat-tile';
import { useAdminUser } from '@/lib/admin-user';
import { useSetupProgress } from '@/lib/setup-progress';
import { useSetup } from '@/lib/setup-store';

// Prototype only: appraisal scores and review counts come from Framework Studio, which is not built.
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
  { label: 'Submitted', value: 18, color: STATUS_COLORS.submitted },
  { label: 'In review', value: 14, color: STATUS_COLORS.inReview },
  { label: 'Released', value: 18, color: STATUS_COLORS.released },
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

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description="Appraisal cycle 2026 H1 · scores and reviews are sample data until Framework Studio is built"
      />

      <StatGrid label="Key numbers">
        <StatTile label="Appraisal completion" value="72%" note="▲ 8 pts vs last cycle" tone="up" />
        <StatTile label="Average score" value="3.9" note="▲ 0.3 vs last cycle" tone="up" />
        <StatTile label="Reviews pending" value="14" note="3 overdue" tone="down" />
        <StatTile
          label="Participation"
          value={`${participation}%`}
          note={invitesSent ? `${Math.round((participation / 100) * employees.length)} of ${employees.length} joined` : 'Invitations not sent'}
        />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Average score by cycle">
            <LineChart
              points={SCORE_TREND}
              min={3}
              max={4}
              ticks={[3, 3.5, 4]}
              formatTick={(v) => v.toFixed(1)}
              ariaLabel="Average score by cycle, rising from 3.4 to 3.9"
            />
          </Panel>
        </div>
        <Panel title="Review status">
          <StackedBar segments={REVIEW_STATUS} />
        </Panel>
      </div>

      <Panel title="Average score by department">
        <BarList
          items={departments.map((d, i) => ({ id: d.id, label: d.name, value: DEPT_SCORES[i % DEPT_SCORES.length] }))}
          max={5}
          format={(v) => v.toFixed(1)}
          empty="Add departments to compare scores."
        />
      </Panel>
    </>
  );
}
