'use client';

import { useId, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type TrendPoint = { label: string; value: number };
export type TrendRange = { value: string; label: string; /** How many of the latest points to show; omit for all. */ last?: number };

type TrendAreaCardProps = {
  title: string;
  description?: string;
  data: TrendPoint[];
  /** Name of the series, shown in the tooltip. */
  seriesLabel: string;
  /** Optional range switch, for example last 4 weeks or the whole cycle. */
  ranges?: TrendRange[];
  /** Vertical dashed line at one x label, for example a deadline. */
  marker?: { at: string; label: string };
  yDomain?: [number | 'auto', number | 'auto'];
  yTickFormat?: (v: number) => string;
  height?: number;
};

/** Interactive area chart in the shadcn style: gradient fill, hover tooltip, optional range toggle and marker. */
export function TrendAreaCard({ title, description, data, seriesLabel, ranges, marker, yDomain = [0, 'auto'], yTickFormat, height = 250 }: TrendAreaCardProps) {
  const [range, setRange] = useState(ranges?.[ranges.length - 1]?.value ?? '');
  const gradientId = `fill-${useId().replace(/:/g, '')}`;
  const last = ranges?.find((r) => r.value === range)?.last;
  const shown = last ? data.slice(-last) : data;
  const config = { value: { label: seriesLabel, color: 'var(--chart-1)' } } satisfies ChartConfig;

  return (
    <Card className="animate-in fade-in-0 fill-mode-both shadow-xs duration-700">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {ranges && ranges.length > 1 && (
          <CardAction>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={range}
              onValueChange={(v) => v && setRange(v)}
              aria-label="Time range"
            >
              {ranges.map((r) => (
                <ToggleGroupItem key={r.value} value={r.value} className="px-3">
                  {r.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
          <AreaChart data={shown} margin={{ left: 4, right: marker ? 32 : 16, top: marker ? 22 : 8 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
            <YAxis
              width={36}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              domain={yDomain}
              tickCount={4}
              tickFormatter={yTickFormat}
            />
            <ChartTooltip cursor={{ strokeDasharray: '4 4' }} content={<ChartTooltipContent indicator="line" />} />
            {marker && shown.some((p) => p.label === marker.at) && (
              <ReferenceLine
                x={marker.at}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                label={{ value: marker.label, position: 'top', fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
            )}
            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4 }}
              animationDuration={900}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
