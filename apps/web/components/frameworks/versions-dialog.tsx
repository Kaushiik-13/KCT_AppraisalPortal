'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Kpi } from '@/lib/frameworks/types';
import { formatDate } from '@/lib/frameworks/format';

/** Version history of one KPI: published versions newest first, plus any pending draft. */
export function VersionsDialog({ kpi, onOpenChange }: { kpi: Kpi | null; onOpenChange: (open: boolean) => void }) {
  const versions = kpi ? [...kpi.versions].reverse() : [];
  return (
    <Dialog open={!!kpi} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Versions of {kpi?.code}</DialogTitle>
          <DialogDescription>{kpi?.name}. Cycles keep the version that was live when they started.</DialogDescription>
        </DialogHeader>
        <ol className="grid text-sm">
          {kpi?.hasDraftChanges && (
            <li className="flex items-baseline gap-3 border-b py-2.5">
              <span className="text-warning w-10 font-mono text-xs">v{kpi.version + 1}</span>
              <span className="min-w-0 flex-1">Draft changes, not live yet</span>
              <span className="text-muted-foreground text-xs">{formatDate(kpi.updatedAt)}</span>
            </li>
          )}
          {versions.map((v, i) => (
            <li key={v.version} className="flex items-baseline gap-3 border-b py-2.5 last:border-0">
              <span className="text-muted-foreground w-10 font-mono text-xs">v{v.version}</span>
              <span className="min-w-0 flex-1">
                {v.note}
                {i === 0 && kpi?.status === 'published' && <span className="text-success ml-2 text-xs">Live</span>}
              </span>
              <span className="text-muted-foreground text-xs">{formatDate(v.publishedAt)}</span>
            </li>
          ))}
          {versions.length === 0 && !kpi?.hasDraftChanges && <li className="text-muted-foreground py-4 text-center">Not published yet.</li>}
        </ol>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
