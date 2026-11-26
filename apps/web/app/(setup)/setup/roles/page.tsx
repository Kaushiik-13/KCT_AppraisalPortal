'use client';

import { useState } from 'react';
import { ArrowRight, Check, Lock, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { colorOf } from '@/lib/department-colors';
import { useSetup, type Department } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

const NONE = '__none__';

const initials = (n: string) =>
  n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

function Avatar({ name, dept }: { name: string; dept?: Department }) {
  const c = dept ? colorOf(dept.color) : null;
  return (
    <span
      className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full border border-black/5 text-xs font-medium"
      style={c ? { backgroundColor: c.bg, color: c.fg } : undefined}
    >
      {initials(name)}
    </span>
  );
}

function DeptTag({ dept }: { dept?: Department }) {
  if (!dept) return <span className="text-muted-foreground text-xs">No department</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="size-2.5 rounded-full border border-black/10" style={{ backgroundColor: colorOf(dept.color).bg }} />
      {dept.name}
    </span>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative min-w-52 flex-1 sm:max-w-xs">
      <Search aria-hidden className="text-muted-foreground absolute top-2 left-2.5 size-4" />
      <Input aria-label="Search employees" placeholder="Search name or email" className="pl-8" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function RolesPage() {
  const { departments, employees, updateEmployee } = useSetup();
  const [step, setStep] = useState<1 | 2>(1);
  const [q, setQ] = useState('');
  const [show, setShow] = useState<'everyone' | 'without'>('everyone');
  const [selected, setSelected] = useState<string[]>([]);

  const reviewers = employees.filter((e) => e.isReviewer);
  const without = employees.filter((e) => !e.isReviewer && !e.reviewerId);
  const deptOf = (id: string) => departments.find((d) => d.id === id);
  const locked = reviewers.length === 0;

  const s = q.trim().toLowerCase();
  const searched = employees.filter((e) => !s || e.name.toLowerCase().includes(s) || e.email.toLowerCase().includes(s));
  const rows = searched.filter((e) => (show === 'without' ? !e.isReviewer && !e.reviewerId : true));
  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  const toggle = (id: string) => setSelected((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const bulkAssign = (reviewerId: string) => {
    selected.forEach((id) => {
      if (id !== reviewerId) updateEmployee(id, { reviewerId: reviewerId === NONE ? '' : reviewerId });
    });
    setSelected([]);
  };

  const go = (n: 1 | 2) => {
    setStep(n);
    setQ('');
    setSelected([]);
  };

  return (
    <>
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold tracking-tight">Roles and reviewers</h2>
        <p className="text-muted-foreground text-sm">
          This takes two short steps. First choose who can review others, then choose a reviewer for each person.
        </p>
      </div>

      {/* Two-step indicator */}
      <ol className="grid grid-cols-2 gap-3" aria-label="Roles steps">
        <li>
          <button
            type="button"
            onClick={() => go(1)}
            aria-current={step === 1 ? 'step' : undefined}
            className={cn('flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors', step === 1 ? 'border-primary bg-primary/5' : 'hover:bg-muted/50')}
          >
            <span className={cn('grid size-6 shrink-0 place-items-center rounded-full border text-xs font-medium', reviewers.length > 0 ? 'bg-primary text-primary-foreground border-primary' : step === 1 ? 'border-primary text-primary' : 'text-muted-foreground')}>
              {reviewers.length > 0 ? <Check aria-hidden className="size-3.5" /> : 1}
            </span>
            <span className="grid gap-0.5">
              <span className="text-sm font-medium">Choose reviewers</span>
              <span className="text-muted-foreground text-xs">
                {reviewers.length > 0 ? `${reviewers.length} chosen` : 'Pick who can review others'}
              </span>
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled={locked}
            onClick={() => go(2)}
            aria-current={step === 2 ? 'step' : undefined}
            className={cn(
              'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
              step === 2 ? 'border-primary bg-primary/5' : !locked && 'hover:bg-muted/50',
              locked && 'cursor-not-allowed opacity-60',
            )}
          >
            <span className={cn('grid size-6 shrink-0 place-items-center rounded-full border text-xs font-medium', step === 2 ? 'border-primary text-primary' : 'text-muted-foreground')}>
              {locked ? <Lock aria-hidden className="size-3" /> : 2}
            </span>
            <span className="grid gap-0.5">
              <span className="text-sm font-medium">Assign people</span>
              <span className="text-muted-foreground text-xs">
                {locked ? 'Choose a reviewer in step 1 first' : without.length > 0 ? `${without.length} still need a reviewer` : 'Everyone has a reviewer'}
              </span>
            </span>
          </button>
        </li>
      </ol>

      {step === 1 ? (
        <section className="grid gap-4" aria-label="Step 1: Choose reviewers">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchBox value={q} onChange={setQ} />
            <span className="text-muted-foreground text-sm">{reviewers.length} of {employees.length} can review others</span>
          </div>

          {searched.length === 0 ? (
            <Empty text={employees.length === 0 ? 'Add employees in the previous step first.' : 'No one matches your search.'} />
          ) : (
            <ul className="divide-y rounded-lg border">
              {searched.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar name={e.name} dept={deptOf(e.departmentId)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{e.name || '(no name)'}</div>
                    <div className="text-muted-foreground truncate text-xs">{e.title || e.email}</div>
                  </div>
                  <div className="hidden w-40 sm:block"><DeptTag dept={deptOf(e.departmentId)} /></div>
                  <label className="flex items-center gap-2">
                    <span className={cn('w-24 text-right text-xs', e.isReviewer ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                      {e.isReviewer ? 'Can review' : 'Cannot review'}
                    </span>
                    <Switch aria-label={`${e.name} can review others`} checked={e.isReviewer} onCheckedChange={(v) => updateEmployee(e.id, { isReviewer: v })} />
                  </label>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-sm">
              {locked ? 'Switch on at least one reviewer to go to step 2.' : 'You can change this any time.'}
            </span>
            <Button variant="secondary" disabled={locked} onClick={() => go(2)}>
              Next: assign people <ArrowRight aria-hidden data-icon="inline-end" />
            </Button>
          </div>
        </section>
      ) : (
        <section className="grid gap-4" aria-label="Step 2: Assign people">
          <div className="bg-muted/50 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <span className="text-muted-foreground">Reviewers:</span>
            {reviewers.map((r) => (
              <span key={r.id} className="bg-background rounded-md border px-2 py-0.5 text-xs font-medium">{r.name}</span>
            ))}
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => go(1)}>
              <Pencil aria-hidden data-icon="inline-start" /> Change reviewers
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchBox value={q} onChange={setQ} />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="Show people">
                <Seg active={show === 'everyone'} onClick={() => setShow('everyone')}>Everyone ({employees.length})</Seg>
                <Seg active={show === 'without'} onClick={() => setShow('without')}>Without a reviewer ({without.length})</Seg>
              </div>
            </div>
          </div>

          {rows.length === 0 ? (
            <Empty text={show === 'without' ? 'Everyone has a reviewer.' : 'No one matches your search.'} />
          ) : (
            <div className="rounded-lg border">
              {selected.length > 0 ? (
                <div className="bg-primary/5 flex flex-wrap items-center gap-3 border-b px-3 py-1.5 text-sm">
                  <Checkbox
                    aria-label="Select all shown"
                    checked={allSelected}
                    onCheckedChange={(v) => setSelected(v === true ? rows.map((r) => r.id) : [])}
                  />
                  <span className="font-medium">{selected.length} selected</span>
                  <Select value="" onValueChange={bulkAssign}>
                    <SelectTrigger size="sm" aria-label="Assign reviewer to selected people" className="bg-background w-56">
                      <SelectValue placeholder="Assign a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No reviewer</SelectItem>
                      {reviewers.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelected([])}>Clear selection</Button>
                </div>
              ) : (
                <div className="text-muted-foreground flex items-center gap-3 border-b px-3 py-2 text-xs">
                  <Checkbox
                    aria-label="Select all shown"
                    checked={allSelected}
                    onCheckedChange={(v) => setSelected(v === true ? rows.map((r) => r.id) : [])}
                  />
                  <span className="flex-1">Person</span>
                  <span className="hidden w-40 sm:block">Department</span>
                  <span className="w-52">Reviewed by</span>
                </div>
              )}
              <ul className="divide-y">
                {rows.map((e) => {
                  const options = reviewers.filter((r) => r.id !== e.id);
                  const missing = !e.isReviewer && !e.reviewerId;
                  return (
                    <li key={e.id} className={cn('flex items-center gap-3 px-3 py-2.5', selected.includes(e.id) && 'bg-primary/5')}>
                      <Checkbox aria-label={`Select ${e.name}`} checked={selected.includes(e.id)} onCheckedChange={() => toggle(e.id)} />
                      <Avatar name={e.name} dept={deptOf(e.departmentId)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{e.name || '(no name)'}</span>
                          {e.isReviewer ? <span className="text-muted-foreground rounded-[4px] border px-1 text-[10px]">Reviewer</span> : null}
                        </div>
                        <div className="text-muted-foreground truncate text-xs">{e.title || e.email}</div>
                      </div>
                      <div className="hidden w-40 sm:block"><DeptTag dept={deptOf(e.departmentId)} /></div>
                      <div className="flex w-52 items-center gap-2">
                        <Select value={e.reviewerId || NONE} onValueChange={(v) => updateEmployee(e.id, { reviewerId: v === NONE ? '' : v })}>
                          <SelectTrigger size="sm" aria-label={`Reviewer for ${e.name}`} className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>{e.isReviewer ? 'No reviewer (top level)' : 'Choose a reviewer'}</SelectItem>
                            {options.map((r) => (
                              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="size-2 shrink-0">
                          {missing ? <span aria-label="Needs a reviewer" title="Needs a reviewer" className="bg-warning block size-2 rounded-full" /> : null}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}
    </>
  );
}

function Seg({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'focus-visible:ring-ring/50 h-7 rounded-[4px] px-2.5 text-xs outline-none focus-visible:ring-3',
        active ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-muted-foreground rounded-lg border border-dashed py-14 text-center text-sm">{text}</div>;
}
