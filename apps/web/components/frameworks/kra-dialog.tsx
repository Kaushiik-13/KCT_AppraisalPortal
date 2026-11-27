'use client';

import { useEffect, useState } from 'react';
import { ColorPicker } from '@/components/color-picker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { nextColorKey } from '@/lib/department-colors';
import type { Kra } from '@/lib/frameworks/types';

export type KraDraft = Omit<Kra, 'id' | 'archived'>;

type KraDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Leave out to create a new KRA. */
  kra?: Kra;
  /** Codes already in use, so two KRAs cannot share a code. */
  usedCodes: string[];
  usedColors: string[];
  onSave: (value: KraDraft) => void;
};

/** Create or edit a KRA: name, short code used as the KPI code prefix, colour and description. */
export function KraDialog({ open, onOpenChange, kra, usedCodes, usedColors, onSave }: KraDialogProps) {
  const [value, setValue] = useState<KraDraft>({ name: '', code: '', color: 'blue', description: '' });

  useEffect(() => {
    if (open) setValue(kra ? { name: kra.name, code: kra.code, color: kra.color, description: kra.description } : { name: '', code: '', color: nextColorKey(usedColors), description: '' });
    // Reset only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const code = value.code.trim().toUpperCase();
  const codeTaken = !!code && code !== kra?.code && usedCodes.includes(code);
  const canSave = value.name.trim().length > 0 && code.length > 0 && !codeTaken;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSave) return;
            onSave({ ...value, name: value.name.trim(), code, description: value.description.trim() });
            onOpenChange(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>{kra ? 'Edit KRA' : 'New KRA'}</DialogTitle>
            <DialogDescription>A KRA groups related KPIs, for example Teaching or Research.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="kra-name">Name</Label>
                <Input id="kra-name" autoFocus value={value.name} onChange={(e) => setValue((v) => ({ ...v, name: e.target.value }))} placeholder="Teaching and learning" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="kra-code">Code</Label>
                <Input
                  id="kra-code"
                  value={value.code}
                  maxLength={4}
                  onChange={(e) => setValue((v) => ({ ...v, code: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') }))}
                  placeholder="TL"
                  aria-invalid={codeTaken}
                />
              </div>
            </div>
            <p className="text-muted-foreground -mt-2 text-xs">
              {codeTaken ? <span className="text-destructive">Another KRA already uses {code}.</span> : `KPIs in this KRA get codes like ${code || 'TL'}-1.`}
            </p>
            <div className="grid gap-1.5">
              <Label htmlFor="kra-desc">Description</Label>
              <Input id="kra-desc" value={value.description} onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))} placeholder="Course delivery, results and student feedback" />
            </div>
            <div className="grid gap-1.5">
              <Label>Colour</Label>
              <ColorPicker value={value.color} onChange={(color) => setValue((v) => ({ ...v, color }))} />
            </div>
            <p className="text-muted-foreground text-xs">Weight: not set. KRA weights stay unset until scoring policy is approved.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {kra ? 'Save' : 'Create KRA'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
