'use client';

import { Fragment, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ChevronRight, Paperclip, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { KpiRow } from '@/lib/frameworks/types';
import { cn } from '@/lib/utils';

type SortKey = 'name' | 'submissions' | 'submittedPercent' | 'returnPercent';
type Sort = { key: SortKey; dir: 'asc' | 'desc' };

const COLUMNS: { key: SortKey; label: string; numeric?: boolean; className?: string }[] = [
  { key: 'name', label: 'KRA / KPI', className: 'pl-3' },
  { key: 'submissions', label: 'Submissions', numeric: true, className: 'hidden w-28 sm:table-cell' },
  { key: 'submittedPercent', label: 'Rate', numeric: true, className: 'w-20' },
  { key: 'returnPercent', label: 'Returned', numeric: true, className: 'hidden w-24 pr-4 sm:table-cell' },
];

type Group = { id: string; name: string; rows: KpiRow[] };

/**
 * KPIs grouped by KRA. Each KRA row shows totals for its KPIs; click it to open the KPIs inside.
 * Searching opens every KRA with a match.
 */
export function KpiTable({ rows, showResults = true }: { rows: KpiRow[]; /** False before a cycle starts: numbers show as dashes. */ showResults?: boolean }) {
  const [sort, setSort] = useState<Sort>({ key: 'submittedPercent', dir: 'desc' });
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const byKra = new Map<string, Group>();
    rows.forEach((r) => {
      if (!byKra.has(r.kraId)) byKra.set(r.kraId, { id: r.kraId, name: r.kraName, rows: [] });
      byKra.get(r.kraId)!.rows.push(r);
    });
    const cmp = (a: KpiRow, b: KpiRow) => {
      const x = a[sort.key];
      const y = b[sort.key];
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.dir === 'asc' ? c : -c;
    };
    return [...byKra.values()]
      .map((g) => ({ ...g, rows: g.rows.filter((r) => !q || `${r.code} ${r.name} ${g.name}`.toLowerCase().includes(q)).sort(cmp) }))
      .filter((g) => g.rows.length > 0);
  }, [rows, sort, q]);

  const isOpen = (id: string) => !!q || open.has(id);
  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allOpen = groups.length > 0 && groups.every((g) => open.has(g.id));
  const sortBy = (key: SortKey, numeric?: boolean) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: numeric ? 'desc' : 'asc' }));

  const live = (g: Group) => g.rows.filter((r) => r.status === 'published');
  const totals = (g: Group) => {
    const l = live(g);
    const avg = (pick: (r: KpiRow) => number) => (l.length ? Math.round(l.reduce((s, r) => s + pick(r), 0) / l.length) : 0);
    return { submissions: l.reduce((s, r) => s + r.submissions, 0), rate: avg((r) => r.submittedPercent), returned: avg((r) => r.returnPercent), hasLive: l.length > 0 };
  };
  const show = (ok: boolean, text: string | number) => (showResults && ok ? text : <span className="text-muted-foreground">—</span>);

  return (
    <section className="grid gap-3" aria-label="KPIs by KRA">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">KPIs by KRA</h2>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(groups.map((g) => g.id)))}
          className="text-muted-foreground hover:text-foreground ml-1 text-xs"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
        <label className="relative ml-auto w-full sm:w-56">
          <Search className="text-muted-foreground pointer-events-none absolute top-2 left-2.5 size-3.5" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search KPIs"
            aria-label="Search KPIs"
            className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 h-7 w-full rounded-md border pr-2 pl-8 text-xs outline-none focus-visible:ring-2"
          />
        </label>
      </div>

      <div className="bg-card overflow-hidden rounded-xl border">
        <Table className="table-fixed text-[13px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {COLUMNS.map((c) => {
                const on = sort.key === c.key;
                const Icon = sort.dir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <TableHead
                    key={c.key}
                    className={cn('text-muted-foreground h-9 text-xs font-normal', c.numeric && 'text-right', c.className)}
                    aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button type="button" onClick={() => sortBy(c.key, c.numeric)} className={cn('hover:text-foreground inline-flex items-center gap-1', on && 'text-foreground')}>
                      {c.label}
                      {on && <Icon className="size-3" aria-hidden />}
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLUMNS.length} className="text-muted-foreground py-8 text-center">
                  {q ? 'No KPIs match.' : 'No KPIs yet.'}
                </TableCell>
              </TableRow>
            )}
            {groups.map((g) => {
              const t = totals(g);
              const opened = isOpen(g.id);
              return (
                <Fragment key={g.id}>
                  <TableRow className="hover:bg-muted/40 h-11 cursor-pointer" onClick={() => toggle(g.id)}>
                    <TableCell className="pl-3">
                      <button
                        type="button"
                        aria-expanded={opened}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(g.id);
                        }}
                        className="flex w-full min-w-0 items-center gap-2 text-left"
                      >
                        <ChevronRight className={cn('text-muted-foreground size-4 shrink-0 transition-transform', opened && 'rotate-90')} aria-hidden />
                        <span className="truncate font-medium">{g.name}</span>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {g.rows.length} {g.rows.length === 1 ? 'KPI' : 'KPIs'}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="hidden text-right font-medium tabular-nums sm:table-cell">{show(t.hasLive, t.submissions)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{show(t.hasLive, `${t.rate}%`)}</TableCell>
                    <TableCell className={cn('hidden pr-4 text-right tabular-nums sm:table-cell', showResults && t.returned >= 25 && 'text-destructive')}>
                      {show(t.hasLive, `${t.returned}%`)}
                    </TableCell>
                  </TableRow>
                  {opened &&
                    g.rows.map((r) => {
                      const ok = r.status === 'published';
                      return (
                        <TableRow key={r.id} className="bg-muted/20 h-10">
                          <TableCell className="max-w-0 pl-9">
                            <Link href={`/frameworks/kpis/${r.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                              <span className="text-muted-foreground w-12 shrink-0 font-mono text-xs">{r.code}</span>
                              <span className="truncate">{r.name}</span>
                              {r.evidenceRequired && <Paperclip className="text-muted-foreground size-3 shrink-0" aria-label="Evidence required" />}
                            </Link>
                          </TableCell>
                          <TableCell className="hidden text-right tabular-nums sm:table-cell">{show(ok, r.submissions)}</TableCell>
                          <TableCell className="text-right tabular-nums">{show(ok, `${r.submittedPercent}%`)}</TableCell>
                          <TableCell
                            className={cn('hidden pr-4 text-right tabular-nums sm:table-cell', showResults && ok && r.returnPercent >= 25 ? 'text-destructive font-medium' : 'text-muted-foreground')}
                          >
                            {show(ok, `${r.returnPercent}%`)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
