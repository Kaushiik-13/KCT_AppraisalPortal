'use client';

import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ROSTER_TEMPLATE, SAMPLE_ROSTER, checkRoster } from '@/lib/org/roster';
import { useOnboarding } from './onboarding-context';
import { ToneBadge } from './ui-parts';

export function RosterImport() {
  const { people, units, addPeople } = useOnboarding();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const rows = useMemo(() => (checked ? checkRoster(text, people, units) : []), [checked, text, people, units]);
  const valid = rows.filter((r) => r.errors.length === 0);
  const invalid = rows.filter((r) => r.errors.length > 0);

  const reset = () => {
    setText('');
    setChecked(false);
    setResult(null);
  };

  const importValid = () => {
    addPeople(
      valid.map((r) => ({
        name: r.name,
        email: r.email,
        unitId: units.find((u) => u.name.toLowerCase() === r.department.toLowerCase())?.id ?? null,
        isFaculty: r.isFaculty,
        isSupervisor: r.isSupervisor,
      })),
    );
    // Keep only the problem rows so they can be fixed and re-checked without losing the valid ones.
    const remaining = invalid.map((r) => `${r.name},${r.email},${r.department},${[r.isFaculty && 'faculty', r.isSupervisor && 'supervisor'].filter(Boolean).join(';')}`);
    if (remaining.length === 0) {
      setOpen(false);
      reset();
      return;
    }
    setText(['name,email,department,role', ...remaining].join('\n'));
    setResult(`${valid.length} employee${valid.length === 1 ? '' : 's'} added. ${invalid.length} row${invalid.length === 1 ? '' : 's'} still need fixing below.`);
    setChecked(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet aria-hidden data-icon="inline-start" /> Import a roster
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import a roster</DialogTitle>
          <DialogDescription>
            Paste rows with the columns name, email, department and role (faculty, supervisor, or both separated by a
            semicolon). We check every row before anything is added.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="roster-text">Roster rows</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = URL.createObjectURL(new Blob([ROSTER_TEMPLATE], { type: 'text/csv' }));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'afpi-roster-template.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download aria-hidden data-icon="inline-start" /> Download template
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setText(SAMPLE_ROSTER); setChecked(false); setResult(null); }}>
                Use sample roster (has errors)
              </Button>
            </div>
          </div>
          <Textarea
            id="roster-text"
            rows={7}
            className="font-mono text-xs"
            placeholder={'name,email,department,role\nAsha K,asha@college.edu,Computer Science,faculty'}
            value={text}
            onChange={(e) => { setText(e.target.value); setChecked(false); setResult(null); }}
          />
          <p className="text-muted-foreground text-xs">
            Prototype: paste text here. A real build would accept a file upload with a size limit.
          </p>
        </div>

        {result ? <p role="status" className="text-success text-sm">{result}</p> : null}

        {checked ? (
          rows.length === 0 ? (
            <p role="status" className="text-muted-foreground text-sm">There are no rows to check.</p>
          ) : (
            <div className="grid gap-2">
              <p role="status" className="text-sm">
                <strong>{valid.length}</strong> ready to import, <strong>{invalid.length}</strong> need attention.
              </p>
              {units.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No organization units are set up, so the Unit column is ignored. Add units on the Structure step to place people in them.
                </p>
              ) : null}
              <div className="max-h-64 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">Line</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.line}>
                        <TableCell>{r.line}</TableCell>
                        <TableCell>{r.name || <span className="text-muted-foreground">(missing)</span>}</TableCell>
                        <TableCell>{r.email || <span className="text-muted-foreground">(missing)</span>}</TableCell>
                        <TableCell>{r.department || <span className="text-muted-foreground">None</span>}</TableCell>
                        <TableCell className="whitespace-normal">
                          {r.errors.length === 0 ? (
                            <ToneBadge tone="success">Ready</ToneBadge>
                          ) : (
                            <div className="grid gap-1">
                              <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive w-fit">Needs fixing</Badge>
                              <ul className="text-muted-foreground list-disc pl-4 text-xs">
                                {r.errors.map((e) => <li key={e}>{e}</li>)}
                              </ul>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          <Button variant="secondary" disabled={text.trim().length === 0} onClick={() => { setChecked(true); setResult(null); }}>
            Check roster
          </Button>
          <Button disabled={!checked || valid.length === 0} onClick={importValid}>
            Import {checked ? valid.length : 0} valid row{valid.length === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
