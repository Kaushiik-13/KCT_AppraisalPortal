'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { KpiRow } from '@/lib/frameworks/types';
import { cn } from '@/lib/utils';

type KraGroup = { id: string; name: string };

/**
 * KRAs as groups: click a KRA to open the KPIs inside it. One KRA is open at a time.
 * When a cycle is running each KPI shows its submission rate.
 */
export function KraGroups({ kras, kpis, showRates }: { kras: KraGroup[]; kpis: KpiRow[]; showRates: boolean }) {
  const [open, setOpen] = useState<string | null>(kras[0]?.id ?? null);
  if (kras.length === 0) return <p className="text-muted-foreground py-6 text-center text-sm">No KRAs yet.</p>;

  return (
    <ul className="grid">
      {kras.map((kra) => {
        const items = kpis.filter((k) => k.kraId === kra.id).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
        const isOpen = open === kra.id;
        return (
          <li key={kra.id} className="border-t first:border-t-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : kra.id)}
              className="hover:bg-muted/40 focus-visible:ring-ring/50 -mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded-md px-2 py-2.5 text-left text-sm outline-none focus-visible:ring-2"
            >
              <ChevronRight className={cn('text-muted-foreground size-4 shrink-0 transition-transform', isOpen && 'rotate-90')} aria-hidden />
              <span className="min-w-0 flex-1 truncate font-medium">{kra.name}</span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {items.length} {items.length === 1 ? 'KPI' : 'KPIs'}
              </span>
            </button>
            {isOpen && (
              <ul className="mb-2 ml-6 grid border-l pl-3">
                {items.length === 0 && <li className="text-muted-foreground py-2 text-sm">No KPIs in this KRA yet.</li>}
                {items.map((k) => (
                  <li key={k.id}>
                    <Link
                      href={`/frameworks/kpis/${k.id}`}
                      className="hover:bg-muted/40 -mx-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                    >
                      <span className="text-muted-foreground w-12 shrink-0 font-mono text-xs">{k.code}</span>
                      <span className="min-w-0 flex-1 truncate">{k.name}</span>
                      {showRates && k.status === 'published' && <span className="text-muted-foreground tabular-nums">{k.submittedPercent}%</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
