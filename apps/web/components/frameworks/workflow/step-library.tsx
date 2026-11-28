'use client';

import { useState } from 'react';
import { Calculator, ChevronRight, FileSearch, Flag, GitBranch, Search, Split, UserCheck, X, type LucideIcon } from 'lucide-react';
import type { BlockKind, KpiContent, ToolKind, Workflow } from '@/lib/frameworks/types';
import { GOALS, LATER, slotLabel, suggestionsFor, type GoalDef, type GoalId } from '@/lib/frameworks/workflow';
import { cn } from '@/lib/utils';

export type LibraryPick = { kind: BlockKind; tool?: ToolKind };

export const GOAL_ICON: Record<GoalId, LucideIcon> = { points: Calculator, check: GitBranch, split: Split, read: FileSearch, review: UserCheck, result: Flag };

/** Why a goal cannot go at this +, if it cannot. */
export function goalBlocked(g: GoalDef, midPath: boolean, hasFile: boolean): string | undefined {
  if (g.finish && midPath) return 'Only at the end of a path.';
  if (g.id === 'read' && !hasFile) return 'Add a file upload field in the Form step first.';
  return undefined;
}

function GoalItem({ goal, blocked, big, onPick }: { goal: GoalDef; blocked?: string; big?: boolean; onPick: () => void }) {
  const Icon = GOAL_ICON[goal.id];
  return (
    <li>
      <button
        type="button"
        disabled={!!blocked}
        onClick={onPick}
        className={cn(
          'focus-visible:ring-ring/50 flex w-full items-start gap-3 rounded-lg text-left outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
          big ? 'bg-card hover:border-foreground/40 border p-3 shadow-xs' : 'hover:bg-muted/70 px-2.5 py-2 disabled:hover:bg-transparent',
        )}
      >
        <span className={cn('mt-0.5 grid shrink-0 place-items-center rounded-md', big ? 'bg-foreground text-background size-8' : 'bg-muted size-7')}>
          <Icon className={big ? 'size-4' : 'size-3.5'} aria-hidden />
        </span>
        <span className="grid min-w-0 gap-0.5">
          <span className="text-sm font-medium">{goal.name}</span>
          <span className="text-muted-foreground text-xs">{blocked ?? goal.description}</span>
        </span>
      </button>
    </li>
  );
}

type Props = {
  content: KpiContent;
  workflow: Workflow;
  slot: { parentId: string; route: string };
  onPick: (pick: LibraryPick) => void;
  onClose: () => void;
};

/**
 * Add a step, chosen by what should happen next rather than by block type. The PoC's blocks, tools and
 * plugins are still underneath: each goal adds one of them. Steps not built yet are tucked away.
 */
export function StepLibrary({ content, workflow, slot, onPick, onClose }: Props) {
  const [q, setQ] = useState('');
  const [later, setLater] = useState(false);
  const parent = workflow.nodes.find((n) => n.id === slot.parentId);
  const midPath = !!parent?.routes[slot.route];
  const hasFile = content.inputs.some((i) => i.type === 'file');
  const suggested = suggestionsFor(content, workflow, slot.parentId, midPath).slice(0, 2);
  const hit = (g: { name: string; description: string }) => `${g.name} ${g.description}`.toLowerCase().includes(q.trim().toLowerCase());
  const searching = q.trim().length > 0;
  const steps = GOALS.filter((g) => !g.finish && hit(g));
  const finish = GOALS.filter((g) => g.finish && hit(g));
  const laterHits = LATER.filter(hit);
  const pick = (g: GoalDef) => onPick({ kind: g.kind, tool: g.tool });

  return (
    <div className="flex h-full flex-col" data-tour="step-library">
      <div className="grid gap-0.5 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">What should happen next?</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground ml-auto">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <p className="text-muted-foreground truncate text-xs">Adding a step {slotLabel(workflow, slot.parentId, slot.route)}</p>
      </div>
      <div className="px-4 pt-3">
        <label className="relative block">
          <Search className="text-muted-foreground pointer-events-none absolute top-2 left-2.5 size-3.5" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search steps"
            aria-label="Search steps"
            className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 h-8 w-full rounded-md border pr-2 pl-8 text-sm outline-none focus-visible:ring-2"
          />
        </label>
      </div>
      <div className="grid flex-1 content-start gap-5 overflow-y-auto px-2 py-3">
        {!searching && suggested.length > 0 && (
          <section className="grid gap-2 px-2">
            <h3 className="text-muted-foreground text-xs font-medium">Suggested here</h3>
            <ul className="grid gap-2">
              {suggested.map((id) => {
                const g = GOALS.find((x) => x.id === id)!;
                return <GoalItem key={id} big goal={g} blocked={goalBlocked(g, midPath, hasFile)} onPick={() => pick(g)} />;
              })}
            </ul>
          </section>
        )}
        {steps.length > 0 && (
          <section className="grid gap-1">
            <h3 className="text-muted-foreground px-2.5 text-xs font-medium">Steps</h3>
            <ul className="grid">
              {steps.map((g) => (
                <GoalItem key={g.id} goal={g} blocked={goalBlocked(g, midPath, hasFile)} onPick={() => pick(g)} />
              ))}
            </ul>
          </section>
        )}
        {finish.length > 0 && (
          <section className="grid gap-1">
            <h3 className="text-muted-foreground px-2.5 text-xs font-medium">Finish the path</h3>
            <ul className="grid">
              {finish.map((g) => (
                <GoalItem key={g.id} goal={g} blocked={goalBlocked(g, midPath, hasFile)} onPick={() => pick(g)} />
              ))}
            </ul>
          </section>
        )}
        {!steps.length && !finish.length && !laterHits.length && <p className="text-muted-foreground px-2.5 text-sm">Nothing matches.</p>}
      </div>
      {laterHits.length > 0 && (
        <div className="border-t px-2 py-1.5">
          <button
            type="button"
            aria-expanded={later || searching}
            onClick={() => setLater((v) => !v)}
            className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs"
          >
            <ChevronRight className={cn('size-3.5 transition-transform', (later || searching) && 'rotate-90')} aria-hidden />
            Coming later ({laterHits.length})
          </button>
          {(later || searching) && (
            <ul className="grid gap-1 px-2.5 pb-2">
              {laterHits.map((l) => (
                <li key={l.name} className="text-muted-foreground text-xs">
                  <span className="text-foreground/70 font-medium">{l.name}</span> · {l.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
