'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type RankedRow = {
  id: string;
  label: string;
  /** Muted text before the label, for example a KPI code. */
  prefix?: string;
  /** Used for the background bar width. Leave out for rows with no bar. */
  value?: number;
  /** What to print on the right, for example "41%". */
  display: string;
  danger?: boolean;
};

export type RankedTab = {
  key: string;
  label: string;
  /** Right-aligned column heading, for example "Submitted". */
  valueLabel: string;
  rows: RankedRow[];
  /** Value of a full-width bar. Defaults to the largest row. */
  max?: number;
  empty?: string;
  /** Small note under the list, for example "Sample data". */
  note?: ReactNode;
};

/**
 * Vercel-analytics style panel: tabs in the header, a ranked list with a light bar behind each row.
 * Each tab is one way of slicing the same question.
 */
export function RankedPanel({ tabs, limit = 6 }: { tabs: RankedTab[]; limit?: number }) {
  const [selected, setSelected] = useState(tabs[0]?.key);
  const tab = tabs.find((t) => t.key === selected) ?? tabs[0];
  if (!tab) return null;
  const top = tab.max ?? Math.max(...tab.rows.map((r) => r.value ?? 0), 1);
  const rows = tab.rows.slice(0, limit);

  return (
    <section className="bg-card flex min-w-0 flex-col rounded-xl border px-4 pb-3" aria-label={tabs.map((t) => t.label).join(', ')}>
      <div className="flex items-center gap-4 border-b" role="tablist">
        {tabs.map((t) => {
          const on = t.key === tab.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSelected(t.key)}
              className={cn(
                'focus-visible:ring-ring/50 -mb-px border-b py-2.5 text-sm transition-colors outline-none focus-visible:ring-2',
                on ? 'border-foreground text-foreground font-medium' : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              {t.label}
            </button>
          );
        })}
        <span className="text-muted-foreground ml-auto text-xs">{tab.valueLabel}</span>
      </div>

      <ul className="mt-2 grid gap-0.5" role="tabpanel">
        {rows.length === 0 && <li className="text-muted-foreground px-2 py-6 text-center text-sm">{tab.empty ?? 'Nothing to show yet.'}</li>}
        {rows.map((r) => (
          <li key={r.id} className="hover:bg-muted/40 relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-1.5 text-sm">
            {r.value !== undefined && (
              <span
                className={cn('absolute inset-y-0.5 left-0 rounded-md transition-[width] duration-500', r.danger ? 'bg-destructive/10' : 'bg-muted')}
                style={{ width: `${Math.max(2, Math.min(100, (r.value / top) * 100))}%` }}
                aria-hidden
              />
            )}
            <span className="relative min-w-0 truncate">
              {r.prefix && <span className="text-muted-foreground mr-2 font-mono text-xs">{r.prefix}</span>}
              {r.label}
            </span>
            <span className={cn('relative text-right tabular-nums', r.danger ? 'text-destructive font-medium' : 'text-foreground')}>{r.display}</span>
          </li>
        ))}
      </ul>
      {tab.note && <div className="text-muted-foreground mt-auto px-2 pt-2 text-xs">{tab.note}</div>}
    </section>
  );
}
