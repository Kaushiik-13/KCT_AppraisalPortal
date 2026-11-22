'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { colorOf } from '@/lib/department-colors';
import { useSetup } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

const TEMPLATE = 'name,email,job title\n';
const COLUMNS = ['name', 'email', 'job title'];
const DEMO = [
  ['Rohan Mehta', 'rohan.mehta@acme.com', 'Associate'],
  ['Sana Iqbal', 'sana.iqbal@acme.com', 'Analyst'],
  ['Vikram Rao', 'vikram.rao@acme.com', 'Specialist'],
  ['Neha Joshi', 'neha.joshi@acme.com', 'Executive'],
];

export type ImportTarget = { id: string; name: string; color?: string; code?: string } | null;

const kb = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

/** Drag and drop import popup for one department. */
export function ImportDialog({ target, onClose }: { target: ImportTarget; onClose: () => void }) {
  const { addEmployees } = useSetup();
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [over, setOver] = useState(false);

  const c = target?.color ? colorOf(target.color) : null;

  const close = () => {
    setFile(null);
    setOver(false);
    onClose();
  };

  const pick = (f?: File) => setFile(f ? { name: f.name, size: f.size } : null);

  const run = () => {
    // Demo: a real build would read the chosen file. Here we add sample rows.
    if (target) addEmployees(DEMO.map(([name, email, title]) => ({ name, email, title, departmentId: target.id })));
    close();
  };

  return (
    <Dialog open={target !== null} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="flex-row items-center gap-3 border-b px-6 py-5">
          <span
            className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-md border border-black/5 text-xs font-semibold"
            style={c ? { backgroundColor: c.bg, color: c.fg } : undefined}
          >
            {(target?.code || target?.name || '?').slice(0, 3).toUpperCase()}
          </span>
          <div className="grid gap-0.5 text-left">
            <DialogTitle>Import into {target?.name}</DialogTitle>
            <DialogDescription>Everyone in your file is added to this department.</DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid gap-5 px-6 py-6">
          {file ? (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <span className="bg-success/10 text-success grid size-10 shrink-0 place-items-center rounded-md">
                <FileSpreadsheet aria-hidden className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{file.name}</div>
                <div className="text-muted-foreground text-xs">{kb(file.size)} · ready to import</div>
              </div>
              <Button size="icon-sm" variant="ghost" aria-label="Remove file" onClick={() => setFile(null)}>
                <X aria-hidden />
              </Button>
            </div>
          ) : (
            <label
              htmlFor="imp-file"
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                pick(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                'group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
                over ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40',
              )}
            >
              <span
                className={cn(
                  'grid size-12 place-items-center rounded-full transition-colors',
                  over ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-foreground',
                )}
              >
                <UploadCloud aria-hidden className="size-6" />
              </span>
              <div className="grid gap-1">
                <span className="text-sm font-medium">{over ? 'Drop to upload' : 'Drag and drop your file here'}</span>
                <span className="text-muted-foreground text-sm">
                  or <span className="text-primary underline underline-offset-4">browse your computer</span>
                </span>
              </div>
              <span className="text-muted-foreground text-xs">CSV file, up to 5 MB</span>
              <input id="imp-file" type="file" accept=".csv" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
            </label>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground">Columns:</span>
              {COLUMNS.map((col) => (
                <code key={col} className="bg-muted rounded-[4px] px-1.5 py-0.5 text-xs">{col}</code>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
                const a = document.createElement('a');
                a.href = url;
                a.download = 'employees-template.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download aria-hidden data-icon="inline-start" /> Template
            </Button>
          </div>
        </div>

        <DialogFooter className="bg-muted/40 m-0 items-center rounded-none border-t px-6 py-4 sm:justify-between">
          <span className="text-muted-foreground text-xs">Prototype: Import adds 4 sample people.</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={run}>Import</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
