'use client';

import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export type Column = { label: string; value: number };

type ColumnChartCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  data: Column[];
  seriesLabel: string;
  height?: number;
};

/** Vertical columns, for example how marks spread across ranges. Shadcn chart style. */
export function ColumnChartCard({ title, description, action, data, seriesLabel, height = 240 }: ColumnChartCardProps) {
  const config = { value: { label: seriesLabel, color: 'var(--chart-1)' } } satisfies ChartConfig;
  return (
    <Card className="animate-in fade-in-0 fill-mode-both h-full shadow-xs duration-700">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
          <BarChart data={data} margin={{ top: 20, left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent hideIndicator />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} animationDuration={800}>
              <LabelList dataKey="value" position="top" offset={6} className="fill-muted-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
