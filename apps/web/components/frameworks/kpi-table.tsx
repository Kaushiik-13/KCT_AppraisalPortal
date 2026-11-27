'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Paperclip, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { KpiRow, KpiStatus } from '@/lib/frameworks/types';
import { cn } from '@/lib/utils';

type SortKey = 'code' | 'name' | 'kraName' | 'submissions' | 'submittedPercent' | 'returnPercent';
type Sort = { key: SortKey; dir: 'asc' | 'desc' };
type Filter = 'all' | KpiStatus;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean; className?: string }[] = [
  { key: 'code', label: 'Code', className: 'w-14 pl-3 sm:w-16' },
  { key: 'name', label: 'KPI' },
  { key: 'kraName', label: 'KRA', className: 'hidden w-52 md:table-cell' },
  { key: 'submissions', label: 'Submissions', numeric: true, className: 'hidden w-28 sm:table-cell' },
  { key: 'submittedPercent', label: 'Rate', numeric: true, className: 'w-20' },
  { key: 'returnPercent', label: 'Returned', numeric: true, className: 'hidden w-24 sm:table-cell' },
];

const STATUS_LABEL: Record<KpiStatus, string> = { published: 'Live', draft: 'Draft', archived: 'Archived' };

/** Stripe-style table: filter pills and search above a compact, sortable table. */
export function KpiTable({ rows, showResults = true }: { rows: KpiRow[]; /** False before a cycle starts: numbers show as dashes. */ showResults?: boolean }) {
  const [sort, setSort] = useState<Sort>({ key: 'submittedPercent', dir: 'desc' });
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () => ({ all: rows.length, published: rows.filter((r) => r.status === 'published').length, draft: rows.filter((r) => r.status === 'draft').length }),
    [rows],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const val = (r: KpiRow) => r[sort.key];
    return rows
      .filter((r) => filter === 'all' || r.status === filter)
      .filter((r) => !q || `${r.code} ${r.name} ${r.kraName}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const x = val(a);
        const y = val(b);
        const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
        return sort.dir === 'asc' ? c : -c;
      });
  }, [rows, sort, filter, query]);

  const toggle = (key: SortKey, numeric?: boolean) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: numeric ? 'desc' : 'asc' }));

  const pills: { key: Filter; label: string; n: number }[] = [
    { key: 'all', label: 'All', n: counts.all },
    { key: 'published', label: 'Live', n: counts.published },
    { key: 'draft', label: 'Draft', n: counts.draft },
  ];

  return (
    <section className="grid gap-3" aria-label="KPIs">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-base font-semibold">KPIs</h2>
        {pills.map((p) => (
          <button
            key={p.key}
            type="button"
            aria-pressed={filter === p.key}
            onClick={() => setFilter(p.key)}
            className={cn(
              'focus-visible:ring-ring/50 h-7 rounded-full border px-3 text-xs transition-colors outline-none focus-visible:ring-2',
              filter === p.key ? 'border-foreground/30 bg-background text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {p.label} <span className="text-muted-foreground ml-0.5 tabular-nums">{p.n}</span>
          </button>
        ))}
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
                    <button
                      type="button"
                      onClick={() => toggle(c.key, c.numeric)}
                      className={cn('hover:text-foreground inline-flex items-center gap-1', on && 'text-foreground')}
                    >
                      {c.label}
                      {on && <Icon className="size-3" aria-hidden />}
                    </button>
                  </TableHead>
                );
              })}
              <TableHead className="text-muted-foreground h-9 w-16 pr-3 text-right text-xs font-normal sm:w-20">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLUMNS.length + 1} className="text-muted-foreground py-8 text-center">
                  No KPIs match.
                </TableCell>
              </TableRow>
            )}
            {shown.map((r) => (
              <TableRow key={r.id} className="h-10">
                <TableCell className="text-muted-foreground pl-3 font-mono text-xs">{r.code}</TableCell>
                <TableCell className="max-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate">{r.name}</span>
                    {r.evidenceRequired && <Paperclip className="text-muted-foreground size-3 shrink-0" aria-label="Evidence required" />}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground hidden truncate md:table-cell">{r.kraName}</TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">{showResults && r.status === 'published' ? r.submissions : <Dash />}</TableCell>
                <TableCell className="text-right tabular-nums">{showResults && r.status === 'published' ? `${r.submittedPercent}%` : <Dash />}</TableCell>
                <TableCell className={cn('hidden text-right tabular-nums sm:table-cell', showResults && r.returnPercent >= 25 ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                  {showResults && r.status === 'published' ? `${r.returnPercent}%` : <Dash />}
                </TableCell>
                <TableCell className="pr-3 text-right">
                  <span className={cn('text-xs', r.status === 'published' ? 'text-foreground' : 'text-muted-foreground')}>
                    <span
                      className={cn('mr-1.5 inline-block size-1.5 rounded-full align-middle', r.status === 'published' ? 'bg-success' : 'bg-muted-foreground/40')}
                      aria-hidden
                    />
                    {STATUS_LABEL[r.status]}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function Dash() {
  return <span className="text-muted-foreground">—</span>;
}
