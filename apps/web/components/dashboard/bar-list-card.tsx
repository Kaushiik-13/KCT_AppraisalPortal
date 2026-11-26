'use client';

import type { ReactNode } from 'react';
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export type BarItem = { id: string; label: string; value: number };

type BarListCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  items: BarItem[];
  /** Name of the measure, shown in the tooltip, for example "Submitted (%)". */
  seriesLabel: string;
  /** Value a full bar represents. */
  max?: number;
  format?: (v: number) => string;
  empty?: string;
  /** Width reserved for the labels on the left. */
  labelWidth?: number;
  color?: string;
  footer?: ReactNode;
};

/** Horizontal bar chart with labels on the left and values at the bar ends. Shadcn chart style. */
export function BarListCard({
  title,
  description,
  action,
  items,
  seriesLabel,
  max,
  format = (v) => String(v),
  empty = 'Nothing to show yet.',
  labelWidth = 150,
  color = 'var(--chart-1)',
  footer,
}: BarListCardProps) {
  const config = { value: { label: seriesLabel, color } } satisfies ChartConfig;
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  // About 6.5px per character at 12px; keeps every label on one line.
  const maxChars = Math.max(8, Math.floor((labelWidth - 10) / 6.5));
  return (
    <Card className="animate-in fade-in-0 fill-mode-both h-full shadow-xs duration-700">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">{empty}</p>
        ) : (
          <ChartContainer config={config} className="aspect-auto w-full" style={{ height: items.length * 34 + 8 }}>
            <BarChart data={items} layout="vertical" margin={{ left: 0, right: 44, top: 0, bottom: 0 }} barCategoryGap={10}>
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                axisLine={false}
                width={labelWidth}
                tick={({ x, y, payload }: { x: number | string; y: number | string; payload: { value: string } }) => (
                  <text x={Number(x) - 8} y={Number(y)} dy={4} textAnchor="end" fontSize={12} className="fill-muted-foreground">
                    <title>{payload.value}</title>
                    {payload.value.length > maxChars ? `${payload.value.slice(0, maxChars - 1)}…` : payload.value}
                  </text>
                )}
              />
              <XAxis type="number" dataKey="value" domain={[0, top]} hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
              <Bar dataKey="value" fill="var(--color-value)" barSize={12} radius={6} background={{ fill: 'var(--muted)', radius: 6 }} animationDuration={800}>
                <LabelList
                  dataKey="value"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(v: unknown) => format(Number(v))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
        {footer}
      </CardContent>
    </Card>
  );
}
