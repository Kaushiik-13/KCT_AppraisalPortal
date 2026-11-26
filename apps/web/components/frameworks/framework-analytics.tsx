'use client';

import type { ReactNode } from 'react';
import { CalendarClock } from 'lucide-react';
import { BarList } from '@/components/charts/bar-list';
import { Histogram } from '@/components/charts/histogram';
import { LineChart, niceTicks } from '@/components/charts/line-chart';
import { STATUS_COLORS, StackedBar } from '@/components/charts/stacked-bar';
import { Panel, StatGrid, StatTile, Tag } from '@/components/stat-tile';
import type {
  AnalyticsSection,
  FrameworkAnalytics as Analytics,
  HealthStats,
  OutcomeStats,
  ParticipationStats,
  ReviewStats,
} from '@/lib/frameworks/types';

type FrameworkAnalyticsProps = {
  analytics: Analytics;
  /** Which sections to show. The page decides: admins get all four, reviewers get no health. */
  sections: AnalyticsSection[];
};

/**
 * Framework Studio analytics. Presentational only: it draws whatever analytics it is given and never
 * checks roles or fetches data, so the admin page and the reviewer page can both use it.
 */
export function FrameworkAnalytics({ analytics: a, sections }: FrameworkAnalyticsProps) {
  const show = (s: AnalyticsSection) => sections.includes(s);
  const isOrg = a.scope.kind === 'organization';

  return (
    <div className="grid gap-8">
      <KeyNumbers analytics={a} isOrg={isOrg} />

      {a.state === 'noSubmissions' && (
        <section className="bg-card text-muted-foreground flex items-start gap-3 rounded-lg border p-4 text-sm">
          <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
          Submission, review and mark analytics appear here once a cycle starts and people begin submitting.
        </section>
      )}

      {show('participation') && a.participation && (
        <Group title="Participation" text="Are people submitting?">
          <Participation p={a.participation} isOrg={isOrg} />
        </Group>
      )}

      {show('review') && a.review && a.participation && (
        <Group title="Review flow" text={isOrg ? 'Are reviews keeping up?' : 'How your reviews are going.'}>
          <Review r={a.review} p={a.participation} />
        </Group>
      )}

      {show('outcomes') && a.outcomes && (
        <Group title="Outcomes" text="Marks are sample data until scoring policy is approved." tag="Sample data">
          <Outcomes o={a.outcomes} />
        </Group>
      )}

      {show('health') && a.health && (
        <Group title="Framework health" text="Is the framework itself ready?">
          <Health h={a.health} />
        </Group>
      )}
    </div>
  );
}

function Group({ title, text, tag, children }: { title: string; text: string; tag?: string; children: ReactNode }) {
  return (
    <section className="grid gap-3" aria-label={title}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{text}</p>
        {tag && <Tag>{tag}</Tag>}
      </div>
      {children}
    </section>
  );
}

function KeyNumbers({ analytics: a, isOrg }: { analytics: Analytics; isOrg: boolean }) {
  const p = a.participation;
  const h = a.health;
  return (
    <StatGrid label="Key numbers">
      {isOrg && h ? (
        <StatTile label="KPIs" value={String(h.kpis)} note={`${h.published} published · ${h.drafts} ${h.drafts === 1 ? "draft" : "drafts"}`} />
      ) : (
        <StatTile label="Your team" value={String(p?.people ?? 0)} note="People you review" />
      )}
      <StatTile
        label="Submission rate"
        value={p ? `${p.submissionRate}%` : '—'}
        note={p ? `${p.mostSubmitted.length ? 'Of expected KPI submissions' : 'No submissions yet'}` : 'Starts with the cycle'}
      />
      <StatTile
        label="Waiting for review"
        value={a.review ? String(a.review.queue) : '—'}
        note={a.review ? `Oldest waiting ${a.review.oldestWaitingDays} days` : 'Starts with the cycle'}
      />
      <StatTile
        label="Overdue"
        value={p ? String(p.overdue) : '—'}
        note={p ? 'Past the submission deadline' : 'Starts with the cycle'}
        tone={p && p.overdue > 0 ? 'down' : undefined}
      />
    </StatGrid>
  );
}

function Participation({ p, isOrg }: { p: ParticipationStats; isOrg: boolean }) {
  const statuses = [
    { label: 'Not started', value: p.byStatus.notStarted, color: STATUS_COLORS.notStarted },
    { label: 'Submitted', value: p.byStatus.submitted, color: STATUS_COLORS.submitted },
    { label: 'In review', value: p.byStatus.inReview, color: STATUS_COLORS.inReview },
    { label: 'Returned', value: p.byStatus.returned, color: STATUS_COLORS.returned },
    { label: 'Released', value: p.byStatus.released, color: STATUS_COLORS.released },
  ];
  const deadline = p.overTime.points[p.overTime.deadlineIndex];
  const scale = niceTicks(Math.max(...p.overTime.points.map((x) => x.value)));
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Panel title="Submissions over time" aside={<span className="text-muted-foreground text-xs">Cumulative, by week</span>}>
          <LineChart
            points={p.overTime.points}
            min={0}
            max={scale.max}
            ticks={scale.ticks}
            marker={deadline ? { index: p.overTime.deadlineIndex, label: 'Deadline' } : undefined}
            ariaLabel={`Submissions over time, reaching ${p.overTime.points.at(-1)?.value ?? 0} by ${p.overTime.points.at(-1)?.label ?? 'now'}`}
          />
        </Panel>
      </div>
      <Panel title="Status of all KPI submissions">
        <StackedBar segments={statuses} />
      </Panel>

      <Panel title="Most submitted KPIs" aside={<span className="text-muted-foreground text-xs">of {p.people} people</span>}>
        <BarList
          items={p.mostSubmitted.map((k) => ({ id: k.id, label: k.name, hint: k.code, value: k.submissions }))}
          max={p.people}
          labelWidth="minmax(110px,170px)"
        />
      </Panel>
      <Panel title="Progress by KRA">
        <BarList items={p.byKra.map((k) => ({ id: k.id, label: k.name, value: k.percent }))} max={100} format={(v) => `${v}%`} labelWidth="minmax(110px,170px)" />
      </Panel>
      {isOrg ? (
        <Panel title="Progress by department">
          <BarList
            items={p.byDepartment.map((d) => ({ id: d.id, label: d.name, value: d.percent }))}
            max={100}
            format={(v) => `${v}%`}
            labelWidth="minmax(110px,170px)"
            empty="Add departments in People to compare them."
          />
        </Panel>
      ) : (
        <Panel title="Least submitted KPIs">
          <BarList
            items={p.leastSubmitted.map((k) => ({ id: k.id, label: k.name, hint: k.code, value: k.submissions }))}
            max={p.people}
            labelWidth="minmax(110px,170px)"
          />
        </Panel>
      )}
    </div>
  );
}

function Review({ r, p }: { r: ReviewStats; p: ParticipationStats }) {
  const neverSubmitted = p.leastSubmitted.filter((k) => k.submissions === 0);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Most returned KPIs">
        <BarList
          items={r.mostReturned.map((k) => ({ id: k.id, label: k.name, hint: k.code, value: k.returnRate }))}
          max={100}
          format={(v) => `${v}%`}
          labelWidth="minmax(110px,150px)"
        />
        <p className="text-muted-foreground text-xs">A high return rate often means the KPI is unclear.</p>
      </Panel>
      <Panel title="Review timing">
        <dl className="grid gap-3 text-sm">
          <Fact label="Average time to review" value={`${r.avgDaysToReview} days`} />
          <Fact label="Oldest waiting" value={`${r.oldestWaitingDays} days`} warn={r.oldestWaitingDays > 7} />
          <Fact label="Waiting now" value={String(r.queue)} />
        </dl>
      </Panel>
      <Panel title="Evidence problems">
        <dl className="grid gap-3 text-sm">
          <Fact label="Missing evidence" value={String(r.evidenceIssues.missing)} warn={r.evidenceIssues.missing > 0} />
          <Fact label="Unreadable files" value={String(r.evidenceIssues.unreadable)} warn={r.evidenceIssues.unreadable > 0} />
          <Fact label="Files replaced" value={String(r.evidenceIssues.replaced)} />
          {neverSubmitted.length > 0 && <Fact label="KPIs nobody submitted" value={neverSubmitted.map((k) => k.code).join(', ')} warn />}
        </dl>
      </Panel>
    </div>
  );
}

function Outcomes({ o }: { o: OutcomeStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Panel title="How marks are spread" aside={<span className="text-muted-foreground text-xs">Released marks, out of 5</span>}>
          <Histogram bins={o.distribution} ariaLabel={`Mark distribution: ${o.distribution.map((b) => `${b.label}: ${b.count}`).join(', ')}`} />
        </Panel>
      </div>
      <Panel title="Average mark by KRA" aside={<span className="text-success text-xs">▲ {o.vsLastCycle} vs last cycle</span>}>
        <BarList items={o.avgByKra.map((k) => ({ id: k.id, label: k.name, value: k.value }))} max={5} format={(v) => v.toFixed(1)} labelWidth="minmax(100px,140px)" />
      </Panel>
      <div className="lg:col-span-3">
        <Panel title="KPIs that don't tell people apart" aside={<span className="text-muted-foreground text-xs">80% or more get full marks</span>}>
          {o.ceilingKpis.length === 0 ? (
            <p className="text-muted-foreground text-sm">None. Every KPI spreads people out.</p>
          ) : (
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {o.ceilingKpis.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <span className="min-w-0 truncate">
                    <span className="text-muted-foreground mr-1.5">{k.code}</span>
                    {k.name}
                  </span>
                  <span className="text-warning shrink-0 tabular-nums">{k.fullMarkShare}% full marks</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Health({ h }: { h: HealthStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="At a glance">
        <dl className="grid gap-3 text-sm">
          <Fact label="KRAs" value={String(h.kras)} />
          <Fact label="Published KPIs" value={`${h.published} of ${h.kpis}`} />
          <Fact label="KPIs needing evidence" value={`${h.evidenceShare}%`} />
          <Fact label="Unapproved scoring rules" value={String(h.unapprovedScoring)} warn={h.unapprovedScoring > 0} />
        </dl>
      </Panel>
      <div className="lg:col-span-2">
        <Panel title="KPIs to finish" aside={<span className="text-muted-foreground text-xs">{h.incomplete.length} to fix before publishing</span>}>
          {h.incomplete.length === 0 ? (
            <p className="text-muted-foreground text-sm">Every KPI has inputs, scoring rules and an audience.</p>
          ) : (
            <ul className="divide-y text-sm">
              {h.incomplete.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <span className="min-w-0 truncate">
                    <span className="text-muted-foreground mr-1.5">{k.code}</span>
                    {k.name}
                  </span>
                  <span className="text-warning shrink-0 text-xs">{k.problem}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Fact({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={warn ? 'text-warning text-right font-medium tabular-nums' : 'text-right tabular-nums'}>{value}</dd>
    </div>
  );
}
