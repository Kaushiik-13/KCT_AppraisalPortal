'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { KpiRow } from '@/lib/frameworks/types';
import { cn } from '@/lib/utils';

type SortKey = 'code' | 'kraName' | 'submittedPercent' | 'returnPercent' | 'avgMark';
type Sort = { key: SortKey; dir: 'asc' | 'desc' };

const COLUMNS: { key: SortKey; label: string; numeric?: boolean; className?: string }[] = [
  { key: 'code', label: 'KPI' },
  { key: 'kraName', label: 'KRA', className: 'hidden md:table-cell' },
  { key: 'submittedPercent', label: 'Submitted', numeric: true },
  { key: 'returnPercent', label: 'Returned', numeric: true },
  { key: 'avgMark', label: 'Avg mark', numeric: true, className: 'hidden sm:table-cell' },
];

/** Sortable table of KPIs with submission, return and mark numbers. Replaces separate "most/least" lists. */
export function KpiTable({ rows, people }: { rows: KpiRow[]; people: number }) {
  const [sort, setSort] = useState<Sort>({ key: 'submittedPercent', dir: 'desc' });
  const sorted = useMemo(() => {
    const val = (r: KpiRow) => (sort.key === 'avgMark' ? (r.avgMark ?? -1) : r[sort.key]);
    return [...rows].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
      return sort.dir === 'asc' ? c : -c;
    });
  }, [rows, sort]);

  const toggle = (key: SortKey, numeric?: boolean) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: numeric ? 'desc' : 'asc' }));

  return (
    <Card className="animate-in fade-in-0 fill-mode-both gap-0 shadow-xs duration-700">
      <CardHeader className="pb-3">
        <CardTitle>KPI performance</CardTitle>
        <CardDescription>Click a column to sort. Submitted is out of {people} people.</CardDescription>
        <CardAction>
          <Badge variant="secondary">{rows.length} KPIs</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {COLUMNS.map((c) => {
                const active = sort.key === c.key;
                const Icon = active ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                return (
                  <TableHead
                    key={c.key}
                    className={cn(c.numeric && 'text-right', c.key === 'code' && 'pl-4', c.className)}
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(c.key, c.numeric)}
                      className={cn('hover:text-foreground inline-flex items-center gap-1', active && 'text-foreground')}
                    >
                      {c.label}
                      <Icon className={cn('size-3.5', !active && 'opacity-40')} aria-hidden />
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="max-w-[260px] pl-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-12 shrink-0 font-mono text-xs">{r.code}</span>
                    <span className="truncate font-medium">{r.name}</span>
                    {r.evidenceRequired && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Paperclip className="text-muted-foreground size-3.5 shrink-0" aria-label="Evidence required" />
                        </TooltipTrigger>
                        <TooltipContent>Evidence required</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">{r.kraName}</TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto flex w-36 items-center justify-end gap-2">
                    <Progress value={r.submittedPercent} className="h-1.5" aria-label={`${r.code} submitted ${r.submittedPercent}%`} />
                    <span className="w-9 tabular-nums">{r.submittedPercent}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {r.returnPercent >= 25 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="destructive" className="tabular-nums">
                          {r.returnPercent}%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>Often returned: the KPI may be unclear</TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground tabular-nums">{r.returnPercent}%</span>
                  )}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {r.avgMark === null ? <span className="text-muted-foreground">—</span> : r.avgMark.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
