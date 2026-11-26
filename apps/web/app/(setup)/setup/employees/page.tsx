'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { AddEmployeeDialog } from '@/components/add-employee-dialog';
import { ImportDialog, type ImportTarget } from '@/components/import-employees';
import { colorOf } from '@/lib/department-colors';
import { useSetup, type Employee } from '@/lib/setup-store';

const initials = (n: string) =>
  n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export default function EmployeesPage() {
  const { departments, employees, updateEmployee, removeEmployee } = useSetup();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState<string | null>(null);
  const [importing, setImporting] = useState<ImportTarget>(null);

  const s = q.trim().toLowerCase();
  const match = (e: Employee) => !s || e.name.toLowerCase().includes(s) || e.email.toLowerCase().includes(s);

  const groups = [
    ...departments.map((d) => ({ id: d.id, name: d.name, code: d.code, color: d.color, isDept: true })),
    { id: '', name: 'No department', code: '', color: '', isDept: false },
  ]
    .map((g) => ({ ...g, all: employees.filter((e) => e.departmentId === g.id) }))
    .map((g) => ({ ...g, people: g.all.filter(match) }))
    // Hide "No department" when empty. While searching, hide groups with no matches.
    .filter((g) => (!g.isDept ? g.people.length > 0 : s ? g.people.length > 0 : true));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="text-xl font-semibold tracking-tight">Employees</h2>
          <p className="text-muted-foreground text-sm">
            {employees.length} {employees.length === 1 ? 'person' : 'people'} across {departments.length}{' '}
            {departments.length === 1 ? 'department' : 'departments'}. Nobody is emailed until the final review.
          </p>
        </div>
        <Button size="lg" onClick={() => setAdding('')}>
          <Plus aria-hidden data-icon="inline-start" /> Add employee
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search aria-hidden className="text-muted-foreground absolute top-2 left-2.5 size-4" />
        <Input aria-label="Search employees" placeholder="Search name or email" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {groups.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed py-16 text-center text-sm">
          {employees.length === 0 ? 'No employees yet. Add one, or import a file for a department.' : 'No one matches your search.'}
        </div>
      ) : (
        <div className="grid gap-8">
          {groups.map((g) => {
            const c = g.isDept ? colorOf(g.color) : null;
            const gid = g.id || 'none';
            return (
              <section key={gid} aria-labelledby={`g-${gid}`}>
                <header className="flex items-center justify-between gap-3 border-b pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="bg-muted text-muted-foreground grid size-7 place-items-center rounded-[4px] border border-black/5 text-[11px] font-semibold"
                      style={c ? { backgroundColor: c.bg, color: c.fg } : undefined}
                    >
                      {(g.code || g.name).slice(0, 3).toUpperCase()}
                    </span>
                    <h3 id={`g-${gid}`} className="text-sm font-semibold">{g.name}</h3>
                    <span className="text-muted-foreground text-sm">{g.all.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {g.isDept ? (
                      <Button size="sm" variant="ghost" onClick={() => setImporting({ id: g.id, name: g.name, code: g.code, color: g.color })}>
                        <Upload aria-hidden data-icon="inline-start" /> Import
                      </Button>
                    ) : null}
                    <Button size="sm" variant="ghost" onClick={() => setAdding(g.id)}>
                      <Plus aria-hidden data-icon="inline-start" /> Add
                    </Button>
                  </div>
                </header>

                {g.people.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-sm">
                    No one here yet. Import a file or add a person to {g.name}.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {g.people.map((e) => (
                      <li key={e.id} className="flex items-center gap-3 py-2.5">
                        <span
                          className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full border border-black/5 text-xs font-medium"
                          style={c ? { backgroundColor: c.bg, color: c.fg } : undefined}
                        >
                          {initials(e.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{e.name || '(no name)'}</div>
                          <div className="text-muted-foreground truncate text-xs">{e.email || '(no email)'}</div>
                        </div>
                        <span className="text-muted-foreground hidden truncate text-sm sm:block sm:w-44">{e.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon-sm" variant="ghost" aria-label={`Actions for ${e.name}`}>
                              <MoreHorizontal aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Move to</DropdownMenuLabel>
                            {departments
                              .filter((d) => d.id !== e.departmentId)
                              .map((d) => (
                                <DropdownMenuItem key={d.id} onSelect={() => updateEmployee(e.id, { departmentId: d.id })}>
                                  <span className="size-2.5 rounded-full border border-black/10" style={{ backgroundColor: colorOf(d.color).bg }} />
                                  {d.name}
                                </DropdownMenuItem>
                              ))}
                            {e.departmentId ? (
                              <DropdownMenuItem onSelect={() => updateEmployee(e.id, { departmentId: '' })}>No department</DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => removeEmployee(e.id)}>
                              <Trash2 aria-hidden /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <AddEmployeeDialog open={adding} onClose={() => setAdding(null)} />
      <ImportDialog target={importing} onClose={() => setImporting(null)} />
    </>
  );
}
