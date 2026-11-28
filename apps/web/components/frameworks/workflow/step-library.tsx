'use client';

import { useState } from 'react';
import { Calculator, Flag, GitBranch, Package, Search, Split, UserCheck, Wrench, X } from 'lucide-react';
import type { BlockKind, ToolKind } from '@/lib/frameworks/types';
import { BLOCKS, PLUGINS, TOOLS } from '@/lib/frameworks/workflow';
import { cn } from '@/lib/utils';

const BLOCK_ICON: Partial<Record<BlockKind, typeof Calculator>> = {
  action: Wrench,
  condition: GitBranch,
  split: Split,
  review: UserCheck,
  result: Flag,
};

export type LibraryPick = { kind: BlockKind; tool?: ToolKind };

type Props = {
  /** True when the chosen + already leads somewhere, so blocks that end a path cannot go there. */
  midPath: boolean;
  onPick: (pick: LibraryPick) => void;
  onClose: () => void;
};

function Item({ icon: Icon, name, description, disabled, tag, onClick }: { icon: typeof Calculator; name: string; description: string; disabled?: boolean; tag?: string; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="hover:bg-muted/70 focus-visible:ring-ring/50 flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <span className="bg-muted mt-0.5 grid size-7 shrink-0 place-items-center rounded-md">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <span className="grid min-w-0 gap-0.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            {name}
            {tag && <span className="bg-secondary text-muted-foreground rounded px-1.5 text-[11px] font-normal">{tag}</span>}
          </span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </span>
      </button>
    </li>
  );
}

/**
 * The step library, in the PoC's three layers: blocks (steps on the canvas), tools (what an Action runs)
 * and plugins (a ready-made workflow added in one go).
 */
export function StepLibrary({ midPath, onPick, onClose }: Props) {
  const [q, setQ] = useState('');
  const hit = (s: string) => s.toLowerCase().includes(q.trim().toLowerCase());
  const blocks = BLOCKS.filter((b) => b.kind !== 'action' && hit(`${b.name} ${b.description}`));
  const tools = TOOLS.filter((t) => hit(`${t.name} ${t.description} action tool`));
  const plugins = PLUGINS.filter((p) => hit(`${p.name} ${p.description} plugin`));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Add a step</h2>
        <button type="button" onClick={onClose} aria-label="Close step library" className="text-muted-foreground hover:text-foreground ml-auto">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="px-4 pt-3">
        <label className="relative block">
          <Search className="text-muted-foreground pointer-events-none absolute top-2 left-2.5 size-3.5" aria-hidden />
          <input
            type="search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search blocks and tools"
            aria-label="Search blocks and tools"
            className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 h-8 w-full rounded-md border pr-2 pl-8 text-sm outline-none focus-visible:ring-2"
          />
        </label>
      </div>
      <div className="grid flex-1 content-start gap-4 overflow-y-auto px-2 py-3">
        {tools.length > 0 && (
          <section className="grid gap-1">
            <h3 className="text-muted-foreground px-2.5 text-xs font-medium">Tools · run as an Action</h3>
            <ul className="grid">
              {tools.map((t) => (
                <Item
                  key={t.kind}
                  icon={t.kind === 'score' ? Calculator : Wrench}
                  name={t.name}
                  description={t.description}
                  disabled={t.later}
                  tag={t.later ? 'Later' : undefined}
                  onClick={() => onPick({ kind: 'action', tool: t.kind })}
                />
              ))}
            </ul>
          </section>
        )}
        {blocks.length > 0 && (
          <section className="grid gap-1">
            <h3 className="text-muted-foreground px-2.5 text-xs font-medium">Blocks</h3>
            <ul className="grid">
              {blocks.map((b) => {
                const ends = b.terminal && midPath;
                return (
                  <Item
                    key={b.kind}
                    icon={BLOCK_ICON[b.kind] ?? Wrench}
                    name={b.name}
                    description={ends ? `${b.description} Only at the end of a path.` : b.description}
                    disabled={ends}
                    onClick={() => onPick({ kind: b.kind })}
                  />
                );
              })}
            </ul>
          </section>
        )}
        {plugins.length > 0 && (
          <section className="grid gap-1">
            <h3 className="text-muted-foreground px-2.5 text-xs font-medium">Plugins · a ready-made workflow</h3>
            <ul className="grid">
              {plugins.map((p) => (
                <Item key={p.id} icon={Package} name={p.name} description={p.description} disabled={p.later} tag={p.later ? 'Later' : undefined} onClick={() => {}} />
              ))}
            </ul>
          </section>
        )}
        {!tools.length && !blocks.length && !plugins.length && <p className="text-muted-foreground px-2.5 text-sm">Nothing matches.</p>}
      </div>
      <p className={cn('text-muted-foreground border-t px-4 py-2.5 text-xs')}>Steps marked Later come from the PoC and are not built in this prototype.</p>
    </div>
  );
}
