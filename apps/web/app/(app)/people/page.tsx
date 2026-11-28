'use client';

import { useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Upload } from 'lucide-react';
import { AddEmployeeDialog } from '@/components/add-employee-dialog';
import { ImportDialog, type ImportTarget } from '@/components/import-employees';
import { DepartmentChip } from '@/components/department-chip';
import { PageHeader } from '@/components/page-header';
import { PersonAvatar } from '@/components/person-avatar';
import { SearchField } from '@/components/search-field';
import { StatusTabs } from '@/components/status-tabs';
import { TableEmpty } from '@/components/table-empty';
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { colorOf } from '@/lib/department-colors';
import { useSetup, type Employee } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

const NONE = '__none__';
const ALL = '__all__';
const NOREV = '__norev__';

export default function PeoplePage() {
  const { employees, departments, updateEmployee, addDepartment } = useSetup();
  // Prototype only: deactivation is kept in this page's memory and is lost on reload.
  const [off, setOff] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<'active' | 'deactivated'>('active');
  const [dept, setDept] = useState(ALL);
  const [role, setRole] = useState(ALL);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [newDept, setNewDept] = useState<string | null>(null);
  const [importing, setImporting] = useState<ImportTarget>(null);

  const rows = useMemo(
    () =>
      employees.map((e) => {
        const di = departments.findIndex((d) => d.id === e.departmentId);
        return {
          e,
          dept: departments[di],
          color: colorOf(departments[di]?.color, Math.max(di, 0)),
          active: !off.has(e.id),
        };
      }),
    [employees, departments, off],
  );

  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      r.active === (status === 'active') &&
      (dept === ALL ||
        (dept === NOREV ? !r.e.reviewerId && !r.e.isReviewer : r.e.departmentId === (dept === NONE ? '' : dept))) &&
      (role === ALL || (role === 'reviewer' ? r.e.isReviewer : !r.e.isReviewer)) &&
      (!q || r.e.name.toLowerCase().includes(q) || r.e.email.toLowerCase().includes(q) || r.e.title.toLowerCase().includes(q)),
  );
  const activeCount = rows.filter((r) => r.active).length;
  const offCount = rows.length - activeCount;
  const noReviewer = rows.filter((r) => r.active && !r.e.reviewerId && !r.e.isReviewer).length;
  const countIn = (id: string) => rows.filter((r) => r.active && r.e.departmentId === id).length;
  const selected = departments.find((d) => d.id === dept);
  const reviewers = employees.filter((x) => x.isReviewer);

  const toggle = (id: string) =>
    setOff((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const railItem = (key: string, label: string, n: number, dot?: string, warn?: boolean) => (
    <button
      key={key}
      type="button"
      onClick={() => setDept(key)}
      aria-pressed={dept === key}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm',
        dept === key
          ? 'bg-secondary text-foreground font-medium'
          : warn
            ? 'text-warning hover:bg-secondary/60'
            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        {dot && <span className="size-2 shrink-0 rounded-[2px]" style={{ background: dot }} aria-hidden />}
        <span className="truncate">{label}</span>
      </span>
      <span className="text-xs tabular-nums">{n}</span>
    </button>
  );

  return (
    <>
      <PageHeader
        title="People"
        description={`${activeCount} people in ${departments.length} departments`}
        actions={
          <>
          {selected ? (
            <Button size="sm" variant="outline" onClick={() => setImporting({ id: selected.id, name: selected.name, color: selected.color, code: selected.code })}>
              <Upload aria-hidden /> Import CSV
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={departments.length === 0}>
                  <Upload aria-hidden /> Import CSV
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Import into</DropdownMenuLabel>
                {departments.map((d) => (
                  <DropdownMenuItem key={d.id} onSelect={() => setImporting({ id: d.id, name: d.name, color: d.color, code: d.code })}>
                    {d.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button data-tour="people-actions" size="sm" onClick={() => setAdding(selected ? selected.id : '')}>
            <Plus aria-hidden /> Add person
          </Button>
          </>
        }
      />

      <div className="bg-card grid overflow-hidden rounded-lg border md:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="grid content-start gap-0.5 border-b p-2 md:border-r md:border-b-0" aria-label="Departments">
          <div className="text-muted-foreground flex items-center justify-between px-2 pt-1 pb-1.5 text-[11px] font-medium tracking-wide uppercase">
            Departments
            <Button variant="ghost" size="icon-xs" aria-label="Add department" onClick={() => setNewDept('')}>
              <Plus aria-hidden />
            </Button>
          </div>
          {railItem(ALL, 'All people', activeCount)}
          {departments.map((d, i) => railItem(d.id, d.name, countIn(d.id), colorOf(d.color, i).fg))}
          {newDept !== null && (
            <form
              className="px-1 pt-1"
              onSubmit={(ev) => {
                ev.preventDefault();
                if (newDept.trim()) addDepartment(newDept);
                setNewDept(null);
              }}
            >
              <Input
                autoFocus
                value={newDept}
                onChange={(ev) => setNewDept(ev.target.value)}
                onBlur={() => setNewDept(null)}
                placeholder="Department name"
                aria-label="New department name"
                className="h-8"
              />
            </form>
          )}
          <div className="bg-border mx-2 my-1.5 h-px" />
          {railItem(NOREV, 'No reviewer', noReviewer, undefined, noReviewer > 0)}
        </aside>

        <section className="min-w-0" data-tour="people-list">
          <div className="flex flex-wrap items-center gap-2 border-b p-3">
            <SearchField value={query} onChange={setQuery} placeholder="Search people" label="Search people" className="min-w-40 flex-1" />
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
          </div>
          <StatusTabs
            variant="underline"
            label="Filter by status"
            items={[
              { key: 'active', label: 'Active', count: activeCount },
              { key: 'deactivated', label: 'Deactivated', count: offCount },
            ]}
            value={status}
            onChange={setStatus}
          />

          <div className="overflow-x-auto">
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
                {visible.map(({ e, dept: d, color, active }) => (
                  <tr key={e.id} className={cn(!active && 'text-muted-foreground')}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
<PersonAvatar name={e.name} />
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
                      <DepartmentChip name={d?.name} color={d ? color : undefined} />
                    </td>
                    <td className="px-3 py-2.5">{e.title || '—'}</td>
                    <td className="px-3 py-2.5">
                      {e.isReviewer && !e.reviewerId ? (
                        <span className="text-muted-foreground text-xs">Not reviewed</span>
                      ) : (
                        <Select
                          value={e.reviewerId || NONE}
                          onValueChange={(v) => updateEmployee(e.id, { reviewerId: v === NONE ? '' : v })}
                        >
                          <SelectTrigger
                            size="sm"
                            aria-label={`Reviewer for ${e.name}`}
                            className={cn('w-36 border-transparent shadow-none', !e.reviewerId && 'text-warning')}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>No reviewer</SelectItem>
                            {reviewers
                              .filter((x) => x.id !== e.id)
                              .map((x) => (
                                <SelectItem key={x.id} value={x.id}>
                                  {x.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
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
                  <TableEmpty colSpan={5}>No people match.</TableEmpty>
                )}
              </tbody>
            </table>
          </div>
          {status === 'deactivated' && (
            <p className="text-muted-foreground border-t px-4 py-2 text-xs">
              Deactivated people cannot sign in. Their appraisal history is kept.
            </p>
          )}
        </section>
      </div>

      <AddEmployeeDialog open={adding} onClose={() => setAdding(null)} />
      <ImportDialog target={importing} onClose={() => setImporting(null)} />
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
