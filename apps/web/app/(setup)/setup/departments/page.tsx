'use client';

import { useState } from 'react';
import { Check, GripVertical, Info, Network, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSetup, type Department } from '@/lib/setup-store';
import { cn } from '@/lib/utils';
import { ColorPicker } from '@/components/color-picker';
import { colorOf, nextColorKey } from '@/lib/department-colors';

const SUGGESTIONS = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Operations', 'Customer support', 'Legal', 'IT'];

export default function DepartmentsPage() {
  const { departments, employees, addDepartment, removeDepartment, updateDepartment, moveDepartment } = useSetup();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState<string>('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', code: '', color: '' });
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const startEdit = (d: Department) => {
    setEditing(d.id);
    setDraft({ name: d.name, code: d.code, color: d.color });
  };
  const saveEdit = () => {
    if (editing) updateDepartment(editing, draft);
    setEditing(null);
  };

  const add = () => {
    if (!name.trim()) return;
    addDepartment(name, code, color || nextColor);
    setName('');
    setCode('');
    setColor('');
  };

  const nextColor = nextColorKey(departments.map((d) => d.color));
  const unused = SUGGESTIONS.filter((s) => !departments.some((d) => d.name.toLowerCase() === s.toLowerCase()));

  return (
    <>
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold tracking-tight">Departments</h2>
        <p className="text-muted-foreground text-sm">
          Group your people by department, team or unit. This step is optional and you can add more later.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Add a department</CardTitle>
              <CardDescription>A name is enough. The short code is optional.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_140px_auto]"
                onSubmit={(e) => {
                  e.preventDefault();
                  add();
                }}
              >
                <div className="grid gap-1.5">
                  <Label htmlFor="dname">Department name</Label>
                  <Input id="dname" placeholder="Engineering" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="dcode">Code</Label>
                  <Input id="dcode" placeholder="ENG" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <Button type="submit" size="lg">
                  <Plus aria-hidden data-icon="inline-start" /> Add
                </Button>
                <div className="grid gap-1.5 sm:col-span-3">
                  <Label>Accent color</Label>
                  <ColorPicker value={color || nextColor} onChange={setColor} />
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Your departments</CardTitle><CardDescription>Drag the handle to reorder.</CardDescription></div>
                <Badge variant="secondary">{departments.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-sm">
                  <Network aria-hidden className="size-5" />
                  No departments yet. Add one above, or skip this step.
                </div>
              ) : (
                <ul className="divide-y rounded-md border">
                  {departments.map((d, i) => (
                    <li
                      key={d.id}
                      draggable={editing !== d.id}
                      onDragStart={() => setDragFrom(i)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(i);
                      }}
                      onDrop={() => {
                        if (dragFrom !== null) moveDepartment(dragFrom, i);
                        setDragFrom(null);
                        setDragOver(null);
                      }}
                      onDragEnd={() => {
                        setDragFrom(null);
                        setDragOver(null);
                      }}
                      className={cn(
                        'flex items-center justify-between gap-3 px-2 py-2',
                        dragFrom === i && 'opacity-40',
                        dragOver === i && dragFrom !== null && dragFrom !== i && 'bg-primary/5',
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Reorder ${d.name}. Use arrow up and down keys, or drag.`}
                          className="text-muted-foreground hover:text-foreground cursor-grab rounded-[4px] p-1 active:cursor-grabbing"
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowUp') { e.preventDefault(); moveDepartment(i, i - 1); }
                            if (e.key === 'ArrowDown') { e.preventDefault(); moveDepartment(i, i + 1); }
                          }}
                        >
                          <GripVertical aria-hidden className="size-4" />
                        </button>
                        {editing === d.id ? (
                          <form
                            className="grid min-w-0 flex-1 gap-2 py-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              saveEdit();
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Input aria-label="Department name" autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                              <Input aria-label="Code" className="w-24" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
                              <Button type="submit" size="icon-sm" aria-label="Save changes"><Check aria-hidden /></Button>
                              <Button type="button" size="icon-sm" variant="ghost" aria-label="Cancel" onClick={() => setEditing(null)}><X aria-hidden /></Button>
                            </div>
                            <ColorPicker value={draft.color} onChange={(k) => setDraft({ ...draft, color: k })} />
                          </form>
                        ) : (
                          <>
                            <span
                              style={{ backgroundColor: colorOf(d.color, i).bg, color: colorOf(d.color, i).fg }}
                              className="grid size-7 shrink-0 place-items-center rounded-[4px] border border-black/5 text-[11px] font-medium"
                            >
                              {(d.code || d.name).slice(0, 3).toUpperCase()}
                            </span>
                            <span className="truncate text-sm font-medium">{d.name}</span>
                          </>
                        )}
                      </div>
                      {editing === d.id ? null : (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground mr-2 text-xs">{employees.filter((e) => e.departmentId === d.id).length} people</span>
                          <Button size="icon-sm" variant="ghost" aria-label={`Edit ${d.name}`} onClick={() => startEdit(d)}>
                            <Pencil aria-hidden />
                          </Button>
                          <Button size="icon-sm" variant="ghost" aria-label={`Remove ${d.name}`} onClick={() => removeDepartment(d.id)}>
                            <Trash2 aria-hidden />
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-10">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Quick add</CardTitle>
              <CardDescription>Common departments. Click to add.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {unused.length === 0 ? (
                <span className="text-muted-foreground text-xs">All suggestions added.</span>
              ) : (
                unused.map((s) => (
                  <Button key={s} size="sm" variant="outline" onClick={() => addDepartment(s)}>
                    <Plus aria-hidden data-icon="inline-start" /> {s}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info aria-hidden className="size-4" /> Why departments
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground grid gap-2 text-xs">
              <p>Departments let you filter people, assign reviewers and compare performance by team.</p>
              <p>No departments? Skip this step. Everyone stays in one group.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
