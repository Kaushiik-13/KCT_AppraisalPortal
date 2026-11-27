'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type RankedRow = {
  id: string;
  label: string;
  /** Muted text before the label, for example a KPI code. */
  prefix?: string;
  /** Bar length. Leave out for rows with no bar. */
  value?: number;
  /** Optional second part of the bar, drawn lighter, for example draft KPIs after live ones. */
  value2?: number;
  /** Main number on the right, for example "90%". */
  display: string;
  /** Optional muted number in its own column before the main one, for example "18". */
  meta?: string;
  danger?: boolean;
};

export type RankedTab = {
  key: string;
  label: string;
  /** Heading of the main number column, for example "Rate". */
  valueLabel: string;
  /** Heading of the muted column, when rows have `meta`. */
  metaLabel?: string;
  rows: RankedRow[];
  /** Value of a full bar. Defaults to the largest row. */
  max?: number;
  empty?: string;
  /** Legend or note under the list. */
  note?: ReactNode;
};

/**
 * Tabbed ranked list: name, a slim bar and right-aligned number columns.
 * Each tab is one way of slicing the same question.
 */
export function RankedPanel({ tabs, limit = 6 }: { tabs: RankedTab[]; limit?: number }) {
  const [selected, setSelected] = useState(tabs[0]?.key);
  const tab = tabs.find((t) => t.key === selected) ?? tabs[0];
  if (!tab) return null;
  const top = tab.max ?? Math.max(...tab.rows.map((r) => (r.value ?? 0) + (r.value2 ?? 0)), 1);
  const rows = tab.rows.slice(0, limit);
  const hasBars = rows.some((r) => r.value !== undefined);
  const hasMeta = rows.some((r) => r.meta !== undefined);
  // On phones the bar drops under the name so the name keeps the full width.
  const cols = cn(
    'grid items-center gap-x-4',
    hasBars ? 'grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_minmax(48px,28%)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]',
  );
  const numbers = (meta: ReactNode, main: ReactNode) => (
    <span className={cn('flex items-center justify-end gap-4', hasBars && 'max-sm:col-start-2 max-sm:row-start-1')}>
      {hasMeta && <span className="w-12 text-right">{meta}</span>}
      <span className="min-w-14 text-right whitespace-nowrap">{main}</span>
    </span>
  );
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / top) * 100))}%`;

  return (
    <section className="bg-card flex min-w-0 flex-col rounded-xl border" aria-label={tabs.map((t) => t.label).join(', ')}>
      <div className="flex items-center gap-4 border-b px-4" role="tablist">
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
                'focus-visible:ring-ring/50 -mb-px border-b py-3 text-sm transition-colors outline-none focus-visible:ring-2',
                on ? 'border-foreground text-foreground font-medium' : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="px-4 pt-2 pb-3">
        {rows.length > 0 && (
          <div className={cn(cols, 'text-muted-foreground pb-1 text-[11px]')} aria-hidden>
            <span />
            {hasBars && <span className="hidden sm:block" />}
            {numbers(tab.metaLabel, tab.valueLabel)}
          </div>
        )}
        <ul className="grid">
          {rows.length === 0 && <li className="text-muted-foreground py-6 text-center text-sm">{tab.empty ?? 'Nothing to show yet.'}</li>}
          {rows.map((r) => (
            <li key={r.id} className={cn(cols, 'border-t py-2.5 text-sm first:border-t-0')}>
              <span className="min-w-0 truncate">
                {r.prefix && <span className="text-muted-foreground mr-2 font-mono text-xs">{r.prefix}</span>}
                {r.label}
              </span>
              {hasBars && (
                <span className="bg-muted flex h-1.5 overflow-hidden rounded-full max-sm:col-span-2 max-sm:row-start-2 max-sm:mt-1.5" aria-hidden>
                  {r.value !== undefined && (
                    <span className={cn('h-full transition-[width] duration-500', r.danger ? 'bg-destructive' : 'bg-primary')} style={{ width: pct(r.value) }} />
                  )}
                  {r.value2 !== undefined && r.value2 > 0 && <span className="bg-primary/30 h-full transition-[width] duration-500" style={{ width: pct(r.value2) }} />}
                </span>
              )}
              {numbers(
                <span className="text-muted-foreground tabular-nums">{r.meta}</span>,
                <span className={cn('tabular-nums', r.danger ? 'text-destructive font-medium' : 'font-medium')}>{r.display}</span>,
              )}
            </li>
          ))}
        </ul>
        {tab.note && <div className="text-muted-foreground mt-2 text-xs">{tab.note}</div>}
      </div>
    </section>
  );
}
