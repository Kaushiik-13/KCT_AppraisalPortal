'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Kra } from '@/lib/frameworks/types';

export type NewKpi = { kraId: string; name: string; appliesTo: string; description: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kras: Kra[];
  defaultKraId: string;
  audiences: string[];
  onCreate: (kpi: NewKpi) => void;
};

/** The few details a KPI needs before the editor opens, so nobody lands on "Untitled KPI". */
export function NewKpiDialog({ open, onOpenChange, kras, defaultKraId, audiences, onCreate }: Props) {
  const [kpi, setKpi] = useState<NewKpi>({ kraId: defaultKraId, name: '', appliesTo: audiences[0] ?? '', description: '' });
  useEffect(() => {
    if (open) setKpi({ kraId: defaultKraId, name: '', appliesTo: audiences[0] ?? '', description: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultKraId]);
  const kra = kras.find((k) => k.id === kpi.kraId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-tour="new-kpi-dialog">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!kpi.name.trim() || !kpi.kraId) return;
            onCreate({ ...kpi, name: kpi.name.trim() });
          }}
        >
          <DialogHeader>
            <DialogTitle>New KPI</DialogTitle>
            <DialogDescription>Name it and say who it is for. Next you build the form, the workflow and the scoring.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="new-kpi-name">Name</Label>
            <Input id="new-kpi-name" autoFocus value={kpi.name} onChange={(e) => setKpi({ ...kpi, name: e.target.value })} placeholder="Guest lectures delivered" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>KRA</Label>
              <Select value={kpi.kraId} onValueChange={(kraId) => setKpi({ ...kpi, kraId })}>
                <SelectTrigger className="w-full" aria-label="KRA">
                  <SelectValue placeholder="Choose a KRA" />
                </SelectTrigger>
                <SelectContent>
                  {kras.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Applies to</Label>
              <Select value={kpi.appliesTo} onValueChange={(appliesTo) => setKpi({ ...kpi, appliesTo })}>
                <SelectTrigger className="w-full" aria-label="Applies to">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-kpi-desc">Description (optional)</Label>
            <Input id="new-kpi-desc" value={kpi.description} onChange={(e) => setKpi({ ...kpi, description: e.target.value })} placeholder="What counts, and what does not" />
          </div>
          {kra && <p className="text-muted-foreground text-xs">Its code will start with {kra.code}, like {kra.code}-1.</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!kpi.name.trim() || !kpi.kraId} data-tour="new-kpi-create">
              Create and build
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
