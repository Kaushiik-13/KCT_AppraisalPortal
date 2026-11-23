import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** One key number. Place several inside a `StatGrid`. */
export function StatTile({ label, value, note, tone }: { label: string; value: string; note: string; tone?: 'up' | 'down' }) {
  return (
    <div className="bg-card grid gap-1 p-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span className={cn('text-xs', tone === 'up' ? 'text-success' : tone === 'down' ? 'text-destructive' : 'text-muted-foreground')}>{note}</span>
    </div>
  );
}

/** Joined row of stat tiles separated by hairlines. */
export function StatGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-lg border md:grid-cols-4">
      {children}
    </section>
  );
}

/** Titled card used for charts and lists. */
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-card grid h-full content-start gap-3 rounded-lg border p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
