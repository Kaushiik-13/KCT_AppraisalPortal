'use client';

import type { ReactNode } from 'react';
import { Label, Pie, PieChart } from 'recharts';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export type DonutSegment = { key: string; label: string; value: number; color: string };

type DonutCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  segments: DonutSegment[];
  /** Word under the total in the middle, for example "submissions". */
  totalLabel: string;
};

/** Donut chart with the total in the middle and a legend with counts and shares. Shadcn chart style. */
export function DonutCard({ title, description, action, segments, totalLabel }: DonutCardProps) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const config = Object.fromEntries(segments.map((s) => [s.key, { label: s.label, color: s.color }])) satisfies ChartConfig;
  const data = segments.map((s) => ({ key: s.key, value: s.value, fill: `var(--color-${s.key})` }));

  return (
    <Card className="animate-in fade-in-0 fill-mode-both h-full shadow-xs duration-700">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="grid items-center gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
        <ChartContainer config={config} className="mx-auto aspect-square w-full max-w-[180px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <Pie data={data} dataKey="value" nameKey="key" innerRadius={58} outerRadius={82} strokeWidth={4} paddingAngle={1} animationDuration={900}>
              <Label
                content={({ viewBox }) =>
                  viewBox && 'cx' in viewBox && 'cy' in viewBox ? (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">
                        {total.toLocaleString()}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
                        {totalLabel}
                      </tspan>
                    </text>
                  ) : null
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="grid gap-2.5 text-sm">
          {segments.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} aria-hidden />
                <span className="text-muted-foreground truncate">{s.label}</span>
              </span>
              <span className="tabular-nums">
                {s.value.toLocaleString()}
                <span className="text-muted-foreground ml-1.5 text-xs">{total ? Math.round((s.value / total) * 100) : 0}%</span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
