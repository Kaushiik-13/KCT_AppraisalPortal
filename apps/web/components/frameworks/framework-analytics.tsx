'use client';

import { AlertTriangle, CalendarClock, CheckCircle2, Clock, FileWarning, Hourglass } from 'lucide-react';
import { BarListCard } from '@/components/dashboard/bar-list-card';
import { ColumnChartCard } from '@/components/dashboard/column-chart-card';
import { DonutCard } from '@/components/dashboard/donut-card';
import { MetricCard, MetricGrid } from '@/components/dashboard/metric-card';
import { TrendAreaCard } from '@/components/dashboard/trend-area-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AnalyticsSection, FrameworkAnalytics as Analytics, HealthStats, OutcomeStats, ParticipationStats, ReviewStats } from '@/lib/frameworks/types';
import { KpiTable } from './kpi-table';

type FrameworkAnalyticsProps = {
  analytics: Analytics;
  /** Which sections to show. The page decides: admins get all four, reviewers get no health. */
  sections: AnalyticsSection[];
};

const TAB_LABEL: Record<AnalyticsSection, string> = {
  participation: 'Participation',
  review: 'Review flow',
  outcomes: 'Outcomes',
  health: 'Framework health',
};

/** Shared status colours so every chart shows a status the same way. */
export const STATUS_SEGMENTS = [
  { key: 'notStarted', label: 'Not started', color: 'color-mix(in oklab, var(--muted-foreground) 30%, transparent)' },
  { key: 'submitted', label: 'Submitted', color: 'var(--chart-3)' },
  { key: 'inReview', label: 'In review', color: 'var(--chart-2)' },
  { key: 'returned', label: 'Returned', color: 'var(--warning)' },
  { key: 'released', label: 'Released', color: 'var(--chart-1)' },
] as const;

/**
 * Framework Studio analytics, built on shadcn cards, charts, tabs and table.
 * Presentational only: it draws the analytics it is given and never checks roles or fetches data,
 * so the admin page and a reviewer page can both use it.
 */
export function FrameworkAnalytics({ analytics: a, sections }: FrameworkAnalyticsProps) {
  const isOrg = a.scope.kind === 'organization';
  const p = a.participation;

  const tabs = sections.filter((s) => (s === 'health' ? !!a.health : s === 'participation' ? !!p : s === 'review' ? !!a.review : !!a.outcomes));

  return (
    <div className="grid gap-6 *:min-w-0">
      <MetricGrid label="Key numbers">
        {isOrg && a.health ? (
          <MetricCard
            index={0}
            label="Live KPIs"
            value={a.health.kpis}
            summary={`${a.health.published} published · ${a.health.drafts} ${a.health.drafts === 1 ? 'draft' : 'drafts'}`}
            detail={`Across ${a.health.kras} KRAs`}
          />
        ) : (
          <MetricCard index={0} label="Your team" value={p?.people ?? 0} summary="People you review" detail="This cycle" />
        )}
        {p ? (
          <MetricCard
            index={1}
            label="Submission rate"
            value={p.submissionRate}
            format={(v) => `${Math.round(v)}%`}
            trend={{ label: '+6 pts', direction: 'up' }}
            summary="Ahead of last cycle"
            detail="Of expected KPI submissions"
          />
        ) : (
          <MetricCard index={1} label="Submission rate" display="—" detail="Starts with the cycle" />
        )}
        {a.review ? (
          <MetricCard
            index={2}
            label="Waiting for review"
            value={a.review.queue}
            trend={{ label: `${a.review.avgDaysToReview}d avg`, direction: 'flat' }}
            summary={`Oldest waiting ${a.review.oldestWaitingDays} days`}
            detail="Submitted or in review"
          />
        ) : (
          <MetricCard index={2} label="Waiting for review" display="—" detail="Starts with the cycle" />
        )}
        {p ? (
          <MetricCard
            index={3}
            label="Overdue"
            value={p.overdue}
            trend={{ label: p.overdue > 0 ? 'Needs follow-up' : 'On track', direction: p.overdue > 0 ? 'down' : 'flat', good: p.overdue === 0 }}
            summary="Past the submission deadline"
            detail="Not started after the deadline"
          />
        ) : (
          <MetricCard index={3} label="Overdue" display="—" detail="Starts with the cycle" />
        )}
      </MetricGrid>

      {p && (
        <TrendAreaCard
          title="Submissions over time"
          description="Cumulative KPI submissions this cycle"
          seriesLabel="Submissions"
          data={p.overTime.points}
          ranges={[
            { value: '4w', label: 'Last 4 weeks', last: 4 },
            { value: 'all', label: 'Whole cycle' },
          ]}
          marker={p.overTime.points[p.overTime.deadlineIndex] ? { at: p.overTime.points[p.overTime.deadlineIndex].label, label: 'Deadline' } : undefined}
        />
      )}

      {a.state === 'noSubmissions' && (
        <Card className="shadow-xs">
          <CardContent className="text-muted-foreground flex items-center gap-3 text-sm">
            <CalendarClock className="size-4 shrink-0" aria-hidden />
            Submission, review and mark analytics appear here once a cycle starts and people begin submitting.
          </CardContent>
        </Card>
      )}

      {tabs.length > 0 && (
        <Tabs defaultValue={tabs[0]} className="gap-4">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
            {tabs.map((t) => (
              <TabsTrigger key={t} value={t}>
                {TAB_LABEL[t]}
                {t === 'outcomes' && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                    Sample
                  </Badge>
                )}
                {t === 'health' && a.health && a.health.incomplete.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                    {a.health.incomplete.length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {p && (
            <TabsContent value="participation">
              <Participation p={p} isOrg={isOrg} analytics={a} />
            </TabsContent>
          )}
          {a.review && p && (
            <TabsContent value="review">
              <Review r={a.review} p={p} />
            </TabsContent>
          )}
          {a.outcomes && (
            <TabsContent value="outcomes">
              <Outcomes o={a.outcomes} />
            </TabsContent>
          )}
          {a.health && (
            <TabsContent value="health">
              <Health h={a.health} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

function Participation({ p, isOrg, analytics }: { p: ParticipationStats; isOrg: boolean; analytics: Analytics }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <DonutCard
          title="Status of KPI submissions"
          description="Every expected submission this cycle"
          totalLabel="expected"
          segments={STATUS_SEGMENTS.map((s) => ({ ...s, value: p.byStatus[s.key] }))}
        />
        {isOrg ? (
          <BarListCard
            title="Progress by department"
            description="Share of expected submissions made"
            seriesLabel="Submitted (%)"
            items={p.byDepartment.map((d) => ({ id: d.id, label: d.name, value: d.percent }))}
            max={100}
            format={(v) => `${v}%`}
            empty="Add departments in People to compare them."
          />
        ) : (
          <BarListCard
            title="Progress by KRA"
            description="Share of expected submissions made"
            seriesLabel="Submitted (%)"
            items={p.byKra.map((k) => ({ id: k.id, label: k.name, value: k.percent }))}
            max={100}
            format={(v) => `${v}%`}
          />
        )}
      </div>
      {isOrg && (
        <BarListCard
          title="Progress by KRA"
          description="Share of expected submissions made"
          seriesLabel="Submitted (%)"
          items={p.byKra.map((k) => ({ id: k.id, label: k.name, value: k.percent }))}
          max={100}
          format={(v) => `${v}%`}
          labelWidth={150}
        />
      )}
      <KpiTable rows={analytics.kpiRows} people={p.people} />
    </div>
  );
}

function Review({ r, p }: { r: ReviewStats; p: ParticipationStats }) {
  const never = p.leastSubmitted.filter((k) => k.submissions === 0);
  const issues = [
    { icon: FileWarning, label: 'Missing evidence', value: r.evidenceIssues.missing, warn: r.evidenceIssues.missing > 0 },
    { icon: AlertTriangle, label: 'Unreadable files', value: r.evidenceIssues.unreadable, warn: r.evidenceIssues.unreadable > 0 },
    { icon: CheckCircle2, label: 'Files replaced', value: r.evidenceIssues.replaced, warn: false },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
        <MetricCard index={0} label="Average time to review" value={r.avgDaysToReview} format={(v) => `${v.toFixed(1)} days`} detail="From submission to decision" />
        <MetricCard
          index={1}
          label="Oldest waiting"
          value={r.oldestWaitingDays}
          format={(v) => `${Math.round(v)} days`}
          trend={r.oldestWaitingDays > 7 ? { label: 'Over a week', direction: 'down', good: false } : undefined}
          detail="Longest unreviewed submission"
        />
        <MetricCard index={2} label="Waiting now" value={r.queue} detail="Submitted or in review" />
      </div>
      <div className="lg:col-span-2">
        <BarListCard
          title="Most returned KPIs"
          description="A high return rate often means the KPI is unclear"
          seriesLabel="Returned (%)"
          items={r.mostReturned.map((k) => ({ id: k.id, label: `${k.code} ${k.name}`, value: k.returnRate }))}
          max={100}
          format={(v) => `${v}%`}
          color="var(--warning)"
          labelWidth={170}
        />
      </div>
      <Card className="animate-in fade-in-0 fill-mode-both shadow-xs duration-700">
        <CardHeader>
          <CardTitle>Evidence problems</CardTitle>
          <CardDescription>Across submissions this cycle</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          {issues.map((i) => {
            const Icon = i.icon;
            return (
              <div key={i.label} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Icon className="size-4" aria-hidden /> {i.label}
                </span>
                <span className={i.warn ? 'text-warning font-medium tabular-nums' : 'tabular-nums'}>{i.value}</span>
              </div>
            );
          })}
          {never.length > 0 && (
            <>
              <Separator />
              <div className="grid gap-1.5">
                <span className="text-muted-foreground">Nobody submitted</span>
                <div className="flex flex-wrap gap-1.5">
                  {never.map((k) => (
                    <Badge key={k.id} variant="outline">
                      {k.code} {k.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Outcomes({ o }: { o: OutcomeStats }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ColumnChartCard
            title="How marks are spread"
            description="Released marks, out of 5"
            seriesLabel="People"
            data={o.distribution.map((b) => ({ label: b.label, value: b.count }))}
            action={<Badge variant="secondary">Sample data</Badge>}
          />
        </div>
        <div className="lg:col-span-2">
          <BarListCard
            title="Average mark by KRA"
            description="Out of 5"
            seriesLabel="Average mark"
            items={o.avgByKra.map((k) => ({ id: k.id, label: k.name, value: Number(k.value.toFixed(1)) }))}
            max={5}
            format={(v) => v.toFixed(1)}
            action={
              <Badge variant="outline" className="text-success">
                ▲ {o.vsLastCycle} vs last
              </Badge>
            }
          />
        </div>
      </div>
      <Card className="animate-in fade-in-0 fill-mode-both shadow-xs duration-700">
        <CardHeader>
          <CardTitle>KPIs that don&apos;t tell people apart</CardTitle>
          <CardDescription>80% or more of people get full marks, so these KPIs may need a harder scale</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {o.ceilingKpis.length === 0 ? (
            <p className="text-muted-foreground text-sm">None. Every KPI spreads people out.</p>
          ) : (
            o.ceilingKpis.map((k) => (
              <div key={k.id} className="grid gap-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="text-muted-foreground mr-1.5 font-mono text-xs">{k.code}</span>
                    {k.name}
                  </span>
                  <span className="text-warning shrink-0 font-medium tabular-nums">{k.fullMarkShare}%</span>
                </div>
                <Progress value={k.fullMarkShare} className="h-1.5" aria-label={`${k.code} ${k.fullMarkShare}% at full marks`} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Health({ h }: { h: HealthStats }) {
  const publishedShare = h.kpis ? Math.round((h.published / h.kpis) * 100) : 0;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="animate-in fade-in-0 fill-mode-both shadow-xs duration-700">
        <CardHeader>
          <CardTitle>Readiness</CardTitle>
          <CardDescription>
            {h.kras} KRAs, {h.kpis} live KPIs
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <Meter label="Published" value={publishedShare} note={`${h.published} of ${h.kpis}`} />
          <Meter label="Need evidence" value={h.evidenceShare} note={`${h.evidenceShare}%`} />
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Hourglass className="size-4" aria-hidden /> Unapproved scoring rules
            </span>
            <Badge variant="outline" className="text-warning tabular-nums">
              {h.unapprovedScoring}
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card className="animate-in fade-in-0 fill-mode-both shadow-xs duration-700 lg:col-span-2">
        <CardHeader>
          <CardTitle>KPIs to finish</CardTitle>
          <CardDescription>Fix these before publishing</CardDescription>
          <CardAction>
            <Badge variant="secondary">{h.incomplete.length}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          {h.incomplete.length === 0 ? (
            <p className="text-muted-foreground text-sm">Every KPI has inputs, scoring rules and an audience.</p>
          ) : (
            <ul className="divide-y text-sm">
              {h.incomplete.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="min-w-0 truncate">
                    <span className="text-muted-foreground mr-2 font-mono text-xs">{k.code}</span>
                    {k.name}
                  </span>
                  <Badge variant="outline" className="text-warning shrink-0">
                    <Clock data-icon="inline-start" />
                    {k.problem}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Meter({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">{note}</span>
      </div>
      <Progress value={value} className="h-1.5" aria-label={`${label} ${value}%`} />
    </div>
  );
}
