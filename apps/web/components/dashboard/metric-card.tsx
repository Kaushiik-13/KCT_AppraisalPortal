'use client';

import type { ReactNode } from 'react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCountUp } from './use-count-up';

export type Trend = {
  /** Short change, for example "+8 pts". */
  label: string;
  direction: 'up' | 'down' | 'flat';
  /** Whether this direction is good news. Defaults to up = good. */
  good?: boolean;
};

type MetricCardProps = {
  label: string;
  /** Numeric value; animates in. Use `display` instead for text values. */
  value?: number;
  format?: (v: number) => string;
  /** Shown as-is instead of an animated number, for example "—". */
  display?: string;
  trend?: Trend;
  /** Bold first footer line. */
  summary?: ReactNode;
  /** Muted second footer line. */
  detail?: ReactNode;
  /** Position in the grid, used to stagger the entrance animation. */
  index?: number;
};

const ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };

/** One key number in the shadcn dashboard style: label, large value, trend badge and a two-line footer. */
export function MetricCard({ label, value = 0, format = (v) => String(Math.round(v)), display, trend, summary, detail, index = 0 }: MetricCardProps) {
  const animated = useCountUp(value);
  const Icon = trend ? ICON[trend.direction] : null;
  const good = trend ? (trend.good ?? trend.direction === 'up') : true;
  return (
    <Card
      className="from-primary/5 to-card animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both bg-gradient-to-t shadow-xs duration-500 dark:bg-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{display ?? format(animated)}</CardTitle>
        {trend && Icon && (
          <CardAction>
            <Badge variant="outline" className={cn(trend.direction !== 'flat' && (good ? 'text-success' : 'text-destructive'))}>
              <Icon data-icon="inline-start" />
              {trend.label}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {(summary || detail) && (
        <CardFooter className="flex-col items-start gap-1 border-0 bg-transparent pt-0 text-sm">
          {summary && <div className="flex items-center gap-1.5 font-medium">{summary}</div>}
          {detail && <div className="text-muted-foreground">{detail}</div>}
        </CardFooter>
      )}
    </Card>
  );
}

/** Responsive row of metric cards: 1, 2 or 4 across. */
export function MetricGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </section>
  );
}
