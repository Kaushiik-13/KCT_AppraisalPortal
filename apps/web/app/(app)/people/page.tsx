'use client';

import { useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { AddEmployeeDialog } from '@/components/add-employee-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { initials } from '@/lib/admin-user';
import { colorOf } from '@/lib/department-colors';
import { useSetup, type Employee } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

const NONE = '__none__';
const ALL = '__all__';

export default function PeoplePage() {
  const { employees, departments, updateEmployee } = useSetup();
  // Prototype only: deactivation is kept in this page's memory and is lost on reload.
  const [off, setOff] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<'active' | 'deactivated'>('active');
  const [dept, setDept] = useState(ALL);
  const [role, setRole] = useState(ALL);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      employees.map((e) => {
        const di = departments.findIndex((d) => d.id === e.departmentId);
        return {
          e,
          dept: departments[di],
          color: colorOf(departments[di]?.color, Math.max(di, 0)),
          reviewer: employees.find((x) => x.id === e.reviewerId),
          active: !off.has(e.id),
        };
      }),
    [employees, departments, off],
  );

  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      r.active === (status === 'active') &&
      (dept === ALL || r.e.departmentId === (dept === NONE ? '' : dept)) &&
      (role === ALL || (role === 'reviewer' ? r.e.isReviewer : !r.e.isReviewer)) &&
      (!q || r.e.name.toLowerCase().includes(q) || r.e.email.toLowerCase().includes(q) || r.e.title.toLowerCase().includes(q)),
  );
  const activeCount = rows.filter((r) => r.active).length;
  const offCount = rows.length - activeCount;

  const toggle = (id: string) =>
    setOff((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">People</h1>
          <p className="text-muted-foreground text-sm">Everyone in your organization, their department and reviewer.</p>
        </div>
        <Button size="sm" onClick={() => setAdding('')}>
          <Plus aria-hidden /> Add person
        </Button>
      </header>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Filter by status" className="flex gap-1">
            {(
              [
                ['active', 'Active', activeCount],
                ['deactivated', 'Deactivated', offCount],
              ] as const
            ).map(([key, label, n]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={status === key}
                onClick={() => setStatus(key)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-sm',
                  status === key ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label} <span className="text-muted-foreground tabular-nums">{n}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-44" aria-label="Department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
                <SelectItem value={NONE}>No department</SelectItem>
              </SelectContent>
            </Select>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-36" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Everyone</SelectItem>
                <SelectItem value="reviewer">Reviewers</SelectItem>
                <SelectItem value="member">Not reviewers</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-56">
              <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people"
                aria-label="Search people"
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <div className="bg-card overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b text-left text-xs">
              <tr>
                <th className="px-4 py-2 font-medium">Person</th>
                <th className="px-3 py-2 font-medium">Department</th>
                <th className="px-3 py-2 font-medium">Job title</th>
                <th className="px-3 py-2 font-medium">Reviewer</th>
                <th className="w-12 px-4 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map(({ e, dept: d, color, reviewer, active }) => (
                <tr key={e.id} className={cn(!active && 'text-muted-foreground')}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="bg-secondary text-foreground grid size-8 shrink-0 place-items-center rounded-full text-xs font-medium">
                        {initials(e.name)}
                      </span>
                      <div className="grid">
                        <span className="flex items-center gap-2 font-medium">
                          {e.name}
                          {e.isReviewer && (
                            <span className="text-muted-foreground border-border rounded-[4px] border px-1 text-[11px] font-normal">
                              Reviewer
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground text-xs">{e.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {d ? (
                      <span
                        className="rounded-[4px] px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
                        style={{ backgroundColor: color.bg, color: color.fg }}
                      >
                        {d.name}
                      </span>
                    ) : (
                      <span className="text-xs">No department</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">{e.title || '—'}</td>
                  <td className="px-3 py-2.5">
                    {reviewer ? (
                      reviewer.name
                    ) : e.isReviewer ? (
                      <span className="text-xs">Not reviewed</span>
                    ) : (
                      <span className="flex items-center gap-2 text-xs">
                        <span className="bg-warning size-2 rounded-full" aria-hidden />
                        No reviewer
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${e.name}`}>
                          <MoreHorizontal aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(e)}>Edit details</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toggle(e.id)}>
                          {active ? 'Deactivate' : 'Reactivate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center text-sm">
                    No people match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {status === 'deactivated' && (
          <p className="text-muted-foreground text-xs">
            Deactivated people cannot sign in. Their appraisal history is kept.
          </p>
        )}
      </section>

      <AddEmployeeDialog open={adding} onClose={() => setAdding(null)} />
      <EditDialog
        person={editing}
        onClose={() => setEditing(null)}
        onSave={(id, patch) => {
          updateEmployee(id, patch);
          setEditing(null);
        }}
      />
    </>
  );
}

function EditDialog({
  person,
  onClose,
  onSave,
}: {
  person: Employee | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Omit<Employee, 'id'>>) => void;
}) {
  const { employees, departments } = useSetup();
  return (
    <Dialog open={person !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        {person && <EditForm key={person.id} person={person} employees={employees} departments={departments} onClose={onClose} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  person,
  employees,
  departments,
  onClose,
  onSave,
}: {
  person: Employee;
  employees: Employee[];
  departments: { id: string; name: string }[];
  onClose: () => void;
  onSave: (id: string, patch: Partial<Omit<Employee, 'id'>>) => void;
}) {
  const [name, setName] = useState(person.name);
  const [email, setEmail] = useState(person.email);
  const [title, setTitle] = useState(person.title);
  const [dept, setDept] = useState(person.departmentId || NONE);
  const [isReviewer, setIsReviewer] = useState(person.isReviewer);
  const [reviewerId, setReviewerId] = useState(person.reviewerId || NONE);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit {person.name}</DialogTitle>
        <DialogDescription>Changes apply right away.</DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          onSave(person.id, {
            name,
            email,
            title,
            departmentId: dept === NONE ? '' : dept,
            isReviewer,
            reviewerId: reviewerId === NONE ? '' : reviewerId,
          });
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="e-name">Full name</Label>
          <Input id="e-name" value={name} onChange={(ev) => setName(ev.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="e-email">Work email</Label>
          <Input id="e-email" type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="e-title">Job title</Label>
            <Input id="e-title" value={title} onChange={(ev) => setTitle(ev.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="e-dept">Department</Label>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger id="e-dept" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No department</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="e-reviewer">Reviewed by</Label>
          <Select value={reviewerId} onValueChange={setReviewerId}>
            <SelectTrigger id="e-reviewer" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>No reviewer</SelectItem>
              {employees
                .filter((x) => x.isReviewer && x.id !== person.id)
                .map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
          <Label htmlFor="e-can-review" className="font-normal">
            Can review other people
          </Label>
          <Switch id="e-can-review" checked={isReviewer} onCheckedChange={setIsReviewer} />
        </div>
        <DialogFooter className="mt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </form>
    </>
  );
}
