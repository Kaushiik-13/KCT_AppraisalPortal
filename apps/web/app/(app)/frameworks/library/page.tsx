'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, Copy, History, Lock, MoreHorizontal, Pencil, Plus, RotateCcw } from 'lucide-react';
import { KraDialog } from '@/components/frameworks/kra-dialog';
import { PrototypeStageSwitch } from '@/components/frameworks/prototype-stage-switch';
import { VersionsDialog } from '@/components/frameworks/versions-dialog';
import { SearchField } from '@/components/search-field';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { colorOf } from '@/lib/department-colors';
import { inputsSummary, relativeDay } from '@/lib/frameworks/format';
import type { Kpi, KpiStatus, Kra } from '@/lib/frameworks/types';
import { editableContent, frameworkActions, useDemoViewer, useFrameworkLibrary } from '@/lib/frameworks/use-framework-library';
import { cn } from '@/lib/utils';

const ALL = 'all';
const ARCHIVED = 'archived';
type StatusFilter = 'all' | Exclude<KpiStatus, 'archived'>;

/** Things to fix before a KPI can be relied on. */
function problemsOf(k: Kpi): string[] {
  const c = editableContent(k);
  const out: string[] = [];
  if (c.inputs.length === 0) out.push('no inputs');
  if (c.rules.length === 0) out.push('no scoring rules');
  return out;
}

// KRAs and KPIs library (#79). Admins only; reviewers get a read-only note.
export default function FrameworkLibraryPage() {
  const router = useRouter();
  const { kras, kpis } = useFrameworkLibrary();
  const { viewer } = useDemoViewer();
  const [selected, setSelected] = useState<string>(ALL);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [kraDialog, setKraDialog] = useState<{ open: boolean; kra?: Kra }>({ open: false });
  const [versionsOf, setVersionsOf] = useState<Kpi | null>(null);

  // "Create from scratch" on the empty Overview links here with #new-kra.
  useEffect(() => {
    if (window.location.hash === '#new-kra') {
      setKraDialog({ open: true });
      history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const activeKras = kras.filter((k) => !k.archived);
  const kra = kras.find((k) => k.id === selected);
  const inScope = useMemo(
    () => kpis.filter((k) => (selected === ARCHIVED ? k.status === 'archived' : k.status !== 'archived' && (selected === ALL || k.kraId === selected))),
    [kpis, selected],
  );
  const counts = { all: inScope.length, published: inScope.filter((k) => k.status === 'published').length, draft: inScope.filter((k) => k.status === 'draft').length };
  const shown = inScope
    .filter((k) => selected === ARCHIVED || status === 'all' || k.status === status)
    .filter((k) => !query.trim() || `${k.code} ${k.name}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  if (viewer !== 'admin') {
    return (
      <>
        <section className="bg-card text-muted-foreground flex items-center gap-3 rounded-xl border p-6 text-sm">
          <Lock className="size-4 shrink-0" aria-hidden />
          Only administrators can edit KRAs and KPIs. Your team&apos;s progress is on the Frameworks overview.
        </section>
        <PrototypeStageSwitch />
      </>
    );
  }

  const newKpi = () => {
    const target = kra && !kra.archived ? kra.id : activeKras[0]?.id;
    if (!target) return setKraDialog({ open: true });
    router.push(`/frameworks/kpis/${frameworkActions.createKpi(target)}`);
  };
  const liveInKra = (id: string) => kpis.some((k) => k.kraId === id && k.status === 'published');

  const railItem = (key: string, label: string, n: number, color?: string) => (
    <button
      key={key}
      type="button"
      aria-current={selected === key ? 'true' : undefined}
      onClick={() => setSelected(key)}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
        selected === key ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      {color && <span className="size-2 shrink-0 rounded-full" style={{ background: colorOf(color).fg }} aria-hidden />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="text-muted-foreground text-xs tabular-nums">{n}</span>
    </button>
  );

  return (
    <>
      <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
        {/* KRA list: a rail on desktop, a dropdown on phones. */}
        <aside className="hidden content-start gap-0.5 md:grid" aria-label="KRAs">
          <div className="text-muted-foreground flex items-center justify-between px-2 pb-1.5 text-[11px] font-medium tracking-wide uppercase">
            KRAs
            <Button variant="ghost" size="icon-xs" aria-label="New KRA" onClick={() => setKraDialog({ open: true })}>
              <Plus aria-hidden />
            </Button>
          </div>
          {railItem(ALL, 'All KPIs', kpis.filter((k) => k.status !== 'archived').length)}
          {activeKras.map((k) => railItem(k.id, k.name, kpis.filter((p) => p.kraId === k.id && p.status !== 'archived').length, k.color))}
          <div className="mt-2">{railItem(ARCHIVED, 'Archived', kpis.filter((k) => k.status === 'archived').length + kras.filter((k) => k.archived).length)}</div>
        </aside>

        <div className="grid min-w-0 content-start gap-4">
          <div className="md:hidden">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger aria-label="KRA" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All KPIs</SelectItem>
                {activeKras.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name}
                  </SelectItem>
                ))}
                <SelectItem value={ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <header className="flex flex-wrap items-start gap-3">
            <div className="grid min-w-0 flex-1 gap-1">
              <div className="flex items-center gap-2">
                {kra && <span className="size-2.5 shrink-0 rounded-full" style={{ background: colorOf(kra.color).fg }} aria-hidden />}
                <h2 className="truncate text-lg font-semibold">{kra ? kra.name : selected === ARCHIVED ? 'Archived' : 'All KPIs'}</h2>
                {kra && <span className="text-muted-foreground font-mono text-xs">{kra.code}</span>}
                {kra && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label={`${kra.name} options`}>
                        <MoreHorizontal aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onSelect={() => setKraDialog({ open: true, kra })}>
                        <Pencil aria-hidden /> Edit KRA
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={liveInKra(kra.id)}
                        onSelect={() => {
                          frameworkActions.updateKra(kra.id, { archived: true });
                          setSelected(ALL);
                        }}
                      >
                        <Archive aria-hidden /> {liveInKra(kra.id) ? 'Archive (archive its live KPIs first)' : 'Archive KRA'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {kra
                  ? `${kra.description || 'No description yet.'} Weight: not set until scoring policy is approved.`
                  : selected === ARCHIVED
                    ? 'Archived KPIs and KRAs keep their history. Restore a KPI to edit it again.'
                    : 'Every KPI across your KRAs. Click a KPI to open it.'}
              </p>
            </div>
            {selected !== ARCHIVED && (
              <Button onClick={newKpi}>
                <Plus aria-hidden data-icon="inline-start" /> New KPI
              </Button>
            )}
          </header>

          {selected !== ARCHIVED && (
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { key: 'all', label: 'All', n: counts.all },
                  { key: 'published', label: 'Live', n: counts.published },
                  { key: 'draft', label: 'Draft', n: counts.draft },
                ] as const
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={status === p.key}
                  onClick={() => setStatus(p.key)}
                  className={cn(
                    'h-7 rounded-full border px-3 text-xs transition-colors',
                    status === p.key ? 'border-foreground/30 bg-background text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p.label} <span className="text-muted-foreground tabular-nums">{p.n}</span>
                </button>
              ))}
              <SearchField value={query} onChange={setQuery} placeholder="Search KPIs" label="Search KPIs" className="ml-auto w-full sm:w-56" />
            </div>
          )}

          <div className="bg-card overflow-hidden rounded-xl border">
            <Table className="table-fixed text-[13px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground h-9 w-16 pl-3 text-xs font-normal">Code</TableHead>
                  <TableHead className="text-muted-foreground h-9 text-xs font-normal">KPI</TableHead>
                  <TableHead className="text-muted-foreground hidden h-9 w-36 text-xs font-normal lg:table-cell">Inputs</TableHead>
                  <TableHead className="text-muted-foreground hidden h-9 w-28 text-xs font-normal sm:table-cell">Version</TableHead>
                  <TableHead className="text-muted-foreground h-9 w-20 text-xs font-normal">Status</TableHead>
                  <TableHead className="text-muted-foreground hidden h-9 w-28 text-xs font-normal md:table-cell">Updated</TableHead>
                  <TableHead className="h-9 w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                      {query ? 'No KPIs match.' : selected === ARCHIVED ? 'Nothing archived.' : 'No KPIs here yet. Create one with New KPI.'}
                    </TableCell>
                  </TableRow>
                )}
                {shown.map((k) => {
                  const problems = problemsOf(k);
                  const open = () => router.push(`/frameworks/kpis/${k.id}`);
                  return (
                    <TableRow key={k.id} className="h-11 cursor-pointer" onClick={open}>
                      <TableCell className="text-muted-foreground pl-3 font-mono text-xs">{k.code}</TableCell>
                      <TableCell className="max-w-0">
                        <span className="block truncate">
                          <button type="button" className="hover:underline" onClick={(e) => (e.stopPropagation(), open())}>
                            {k.name}
                          </button>
                          {k.status !== 'archived' && problems.length > 0 && <span className="text-warning ml-2 text-xs">· {problems.join(', ')}</span>}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden truncate lg:table-cell">{inputsSummary(k.inputs)}</TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">
                        {k.status === 'draft' && k.versions.length === 0 ? 'v1' : `v${k.version}`}
                        {k.hasDraftChanges && <span className="text-warning"> · v{k.version + 1} draft</span>}
                      </TableCell>
                      <TableCell>
                        <span className={cn('text-xs', k.status === 'published' ? 'text-foreground' : 'text-muted-foreground')}>
                          <span
                            className={cn(
                              'mr-1.5 inline-block size-1.5 rounded-full align-middle',
                              k.status === 'published' ? 'bg-success' : k.status === 'draft' ? 'bg-muted-foreground/40' : 'bg-muted-foreground/20',
                            )}
                            aria-hidden
                          />
                          {k.status === 'published' ? 'Live' : k.status === 'draft' ? 'Draft' : 'Archived'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{relativeDay(k.updatedAt)}</span>
                          </TooltipTrigger>
                          <TooltipContent>{new Date(k.updatedAt).toLocaleString()}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="pr-2" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs" aria-label={`${k.code} options`}>
                              <MoreHorizontal aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {k.status !== 'archived' && (
                              <DropdownMenuItem onSelect={open}>
                                <Pencil aria-hidden /> Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onSelect={() => {
                                const id = frameworkActions.duplicate(k.id);
                                if (id) router.push(`/frameworks/kpis/${id}`);
                              }}
                            >
                              <Copy aria-hidden /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setVersionsOf(k)}>
                              <History aria-hidden /> View versions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {k.status === 'archived' ? (
                              <DropdownMenuItem onSelect={() => frameworkActions.restore(k.id)}>
                                <RotateCcw aria-hidden /> Restore as draft
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem variant="destructive" onSelect={() => frameworkActions.archive(k.id)}>
                                <Archive aria-hidden /> Archive
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {selected === ARCHIVED && kras.some((k) => k.archived) && (
            <section className="grid gap-2">
              <h3 className="text-sm font-semibold">Archived KRAs</h3>
              <ul className="bg-card divide-y rounded-xl border text-sm">
                {kras
                  .filter((k) => k.archived)
                  .map((k) => (
                    <li key={k.id} className="flex items-center gap-2 px-3 py-2.5">
                      <span className="size-2 rounded-full" style={{ background: colorOf(k.color).fg }} aria-hidden />
                      <span className="flex-1">{k.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => frameworkActions.updateKra(k.id, { archived: false })}>
                        <RotateCcw aria-hidden data-icon="inline-start" /> Restore
                      </Button>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <PrototypeStageSwitch />

      <KraDialog
        open={kraDialog.open}
        onOpenChange={(open) => setKraDialog((d) => ({ ...d, open }))}
        kra={kraDialog.kra}
        usedCodes={kras.map((k) => k.code)}
        usedColors={kras.map((k) => k.color)}
        onSave={(v) => {
          if (kraDialog.kra) frameworkActions.updateKra(kraDialog.kra.id, v);
          else setSelected(frameworkActions.addKra(v));
        }}
      />
      <VersionsDialog kpi={versionsOf} onOpenChange={(open) => !open && setVersionsOf(null)} />
    </>
  );
}
