'use client';

import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

type Point = { label: string; value: number };
export type Period = { key: string; label: string };

export type StripMetric = {
  key: string;
  label: string;
  /** The headline value, already formatted, for example "63%". */
  value: string;
  /** One short muted line under the value, for example "302 of 480 expected". */
  sub?: string;
  /** Red value, for problems like overdue items. */
  danger?: boolean;
  /** Values over time for the chart. Leave out for a number with no chart. */
  series?: Point[];
  /** Values for each period when the chart has a period switch, for example { weekly, monthly }. Overrides `series`. */
  seriesByPeriod?: Record<string, Point[]>;
  /** Name of the measure in the tooltip. Defaults to the label. */
  seriesLabel?: string;
  yDomain?: [number | 'auto', number | 'auto'];
  yFormat?: (v: number) => string;
  /** Exact y-axis tick values, for example [0, 25, 50, 75, 100]. */
  yTicks?: number[];
};

type MetricStripProps = {
  metrics: StripMetric[];
  /** Dashed vertical line at one x label, for example the deadline week. */
  marker?: { at: string; label: string };
  /** Optional period switch shown above the chart, for example Weekly and Monthly. */
  periods?: Period[];
  /** A marker for each period, used instead of `marker` when periods are given. */
  markers?: Record<string, { at: string; label: string } | undefined>;
  height?: number;
};

/**
 * A row of headline numbers that doubles as tabs for one chart (Stripe summary strip + Vercel analytics tabs).
 * Click or arrow-key between numbers; the chart below shows the selected one over time.
 */
export function MetricStrip({ metrics, marker: singleMarker, periods, markers, height = 220 }: MetricStripProps) {
  const [period, setPeriod] = useState(periods?.[0]?.key ?? '');
  const seriesOf = (m: StripMetric) => (periods && m.seriesByPeriod ? m.seriesByPeriod[period] : m.series);
  const marker = periods ? markers?.[period] : singleMarker;
  const chartable = metrics.filter((m) => (seriesOf(m)?.length ?? 0) > 1);
  const [selected, setSelected] = useState(chartable[0]?.key ?? '');
  const active = chartable.find((m) => m.key === selected) ?? chartable[0];

  const move = (dir: 1 | -1) => {
    const i = chartable.findIndex((m) => m.key === active?.key);
    const next = chartable[(i + dir + chartable.length) % chartable.length];
    if (next) {
      setSelected(next.key);
      document.getElementById(`metric-tab-${next.key}`)?.focus();
    }
  };

  const config = { value: { label: active?.seriesLabel ?? active?.label ?? '', color: active?.danger ? 'var(--destructive)' : 'var(--chart-1)' } } satisfies ChartConfig;

  return (
    <section className="bg-card overflow-hidden rounded-xl border" aria-label="Key numbers">
      <div
        role={chartable.length ? 'tablist' : undefined}
        aria-label="Choose a number to chart"
        className="grid grid-cols-2 lg:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
        style={{ ['--n' as string]: metrics.length }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') move(1);
          if (e.key === 'ArrowLeft') move(-1);
        }}
      >
        {metrics.map((m, i) => {
          const canChart = (seriesOf(m)?.length ?? 0) > 1;
          const isActive = canChart && m.key === active?.key;
          return (
            <button
              key={m.key}
              id={`metric-tab-${m.key}`}
              type="button"
              role={canChart ? 'tab' : undefined}
              aria-selected={canChart ? isActive : undefined}
              tabIndex={canChart ? (isActive ? 0 : -1) : -1}
              disabled={!canChart}
              onClick={() => canChart && setSelected(m.key)}
              className={cn(
                'relative grid content-start gap-0.5 border-b px-4 py-3.5 text-left transition-colors outline-none',
                'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:ring-inset',
                i % 2 === 1 && 'border-l',
                i > 0 && 'lg:border-l',
                !isActive && chartable.length > 0 && 'bg-muted/40',
                canChart && !isActive && 'hover:bg-muted/70 cursor-pointer',
                !canChart && 'cursor-default',
                isActive && 'bg-card lg:border-b-transparent',
              )}
            >
              {isActive && <span className="bg-foreground absolute inset-x-0 top-0 h-0.5" aria-hidden />}
              <span className={cn('text-xs', isActive ? 'text-foreground' : 'text-muted-foreground')}>{m.label}</span>
              <span className={cn('text-2xl font-semibold tracking-tight tabular-nums', m.danger && 'text-destructive')}>{m.value}</span>
              {m.sub && <span className="text-muted-foreground truncate text-xs">{m.sub}</span>}
            </button>
          );
        })}
      </div>

      {active && seriesOf(active) && (
        <div className="bg-card px-2 pt-3 pb-2 sm:px-4" role="tabpanel" aria-labelledby={`metric-tab-${active.key}`}>
          {periods && periods.length > 1 && (
            <div className="mb-1 flex justify-end px-2" role="group" aria-label="Chart period">
              <div className="bg-muted inline-flex rounded-md p-0.5 text-xs">
                {periods.map((pr) => (
                  <button
                    key={pr.key}
                    type="button"
                    aria-pressed={period === pr.key}
                    onClick={() => setPeriod(pr.key)}
                    className={cn(
                      'focus-visible:ring-ring/50 rounded px-2.5 py-1 transition-colors outline-none focus-visible:ring-2',
                      period === pr.key ? 'bg-card text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
            <AreaChart key={`${active.key}-${period}`} data={seriesOf(active)} margin={{ left: 4, right: marker ? 28 : 12, top: marker ? 20 : 6 }}>
              <CartesianGrid vertical={false} strokeDasharray="2 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
              <YAxis width={40} tickLine={false} axisLine={false} tickMargin={4} tickCount={4} ticks={active.yTicks} domain={active.yDomain ?? [0, 'auto']} tickFormatter={active.yFormat} />
              <ChartTooltip cursor={{ stroke: 'var(--border)' }} content={<ChartTooltipContent indicator="line" />} />
              {marker && seriesOf(active)?.some((p) => p.label === marker.at) && (
                <ReferenceLine
                  x={marker.at}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="3 3"
                  label={{ value: marker.label, position: 'top', fill: 'var(--muted-foreground)', fontSize: 11 }}
                />
              )}
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={1.5}
                fill="var(--color-value)"
                fillOpacity={0.06}
                dot={false}
                activeDot={{ r: 3 }}
                animationDuration={450}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      )}
    </section>
  );
}
