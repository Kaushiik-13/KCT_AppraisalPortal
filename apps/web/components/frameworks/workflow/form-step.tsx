'use client';

import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Calendar, Copy, Hash, List, MousePointerClick, Paperclip, Plus, ToggleLeft, Trash2, Type, Upload, type LucideIcon } from 'lucide-react';
import { Toggle } from '@/components/settings-rows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { INPUT_TYPE_LABEL } from '@/lib/frameworks/format';
import type { InputType, KpiContent, KpiInput } from '@/lib/frameworks/types';
import { cn } from '@/lib/utils';

const FILE_TYPES = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Images', 'Video'];
const TYPE_ICON: Record<InputType, LucideIcon> = { number: Hash, choice: List, yesno: ToggleLeft, text: Type, date: Calendar, file: Paperclip };
const uid = () => `in-${Math.random().toString(36).slice(2, 8)}`;

type Props = { content: KpiContent; onChange: (p: Partial<KpiContent>) => void; readOnly?: boolean; onNext: () => void };

/**
 * Step 1: the form an employee fills in. A list of fields on the left and the selected field's settings on
 * the right, as in the PoC builder. Proof is a file field: its allowed types and help text live on the
 * field, and a required file field is what makes evidence required.
 */
export function FormStep({ content, onChange, readOnly, onNext }: Props) {
  const [view, setView] = useState<'build' | 'preview'>('build');
  const [selectedId, setSelectedId] = useState(content.inputs[0]?.id ?? '');
  const inputs = content.inputs;
  const selected = inputs.find((i) => i.id === selectedId);

  const set = (next: KpiInput[]) => onChange({ inputs: next });
  const patch = (id: string, p: Partial<KpiInput>) => set(inputs.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const add = (type: InputType = 'number') => {
    const f: KpiInput = { id: uid(), label: '', type, required: true };
    set([...inputs, f]);
    setSelectedId(f.id);
    setView('build');
  };
  const move = (i: number, d: -1 | 1) => {
    const next = [...inputs];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set(next);
  };
  const duplicate = (f: KpiInput) => {
    const copy = { ...f, id: uid(), label: f.label ? `${f.label} (copy)` : '' };
    const at = inputs.findIndex((i) => i.id === f.id);
    set([...inputs.slice(0, at + 1), copy, ...inputs.slice(at + 1)]);
    setSelectedId(copy.id);
  };
  const remove = (id: string) => {
    const at = inputs.findIndex((i) => i.id === id);
    const next = inputs.filter((i) => i.id !== id);
    set(next);
    setSelectedId(next[Math.min(at, next.length - 1)]?.id ?? '');
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <span className="text-muted-foreground text-xs">Step 1 of 4</span>
          <h2 className="text-lg font-semibold">Form</h2>
          <p className="text-muted-foreground text-sm">What an employee fills in. Ask for proof with a file field.</p>
        </div>
        <div className="flex items-center gap-2">
          <div role="tablist" aria-label="Form view" className="bg-muted flex rounded-lg p-0.5 text-sm" data-tour="form-view">
            {(['build', 'preview'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn('rounded-md px-3 py-1', view === v ? 'bg-card text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground')}
              >
                {v === 'build' ? 'Build' : 'Preview'}
              </button>
            ))}
          </div>
          <Button onClick={onNext} data-tour="form-next">
            Next: Workflow <ArrowRight aria-hidden data-icon="inline-end" />
          </Button>
        </div>
      </div>

      {view === 'preview' ? (
        <EmployeePreview content={content} />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Fields */}
          <section className="bg-card overflow-hidden rounded-xl border" aria-label="Fields" data-tour="form-fields">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Fields</h3>
              <span className="text-muted-foreground text-xs">
                {inputs.length} · {inputs.filter((i) => i.required).length} required
              </span>
              {!readOnly && inputs.length > 0 && (
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => add()} data-tour="form-add">
                  <Plus aria-hidden data-icon="inline-start" /> Add field
                </Button>
              )}
            </div>
            {inputs.length === 0 ? (
              <div className="grid justify-items-center gap-3 px-6 py-14 text-center">
                <span className="bg-muted grid size-10 place-items-center rounded-full">
                  <MousePointerClick className="text-muted-foreground size-5" aria-hidden />
                </span>
                <div className="grid gap-1">
                  <p className="font-medium">Your form starts here</p>
                  <p className="text-muted-foreground max-w-sm text-sm">Add the values this KPI needs, like a count, and a file field if you need proof.</p>
                </div>
                {!readOnly && (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={() => add('number')} data-tour="form-add">
                      <Plus aria-hidden data-icon="inline-start" /> Add field
                    </Button>
                    <Button variant="outline" onClick={() => add('file')}>
                      <Paperclip aria-hidden data-icon="inline-start" /> Add a proof upload
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <ol className="divide-y">
                {inputs.map((f, i) => {
                  const Icon = TYPE_ICON[f.type];
                  const on = f.id === selectedId;
                  return (
                    <li key={f.id} className={cn('group flex items-center gap-1 pr-2', on ? 'bg-muted/60' : 'hover:bg-muted/30')}>
                      <button type="button" onClick={() => setSelectedId(f.id)} aria-current={on || undefined} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left outline-none focus-visible:underline">
                        <span className="text-muted-foreground w-5 font-mono text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                        <span className={cn('grid size-8 shrink-0 place-items-center rounded-md border', on ? 'bg-card border-foreground/30' : 'bg-card')}>
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="grid min-w-0 gap-0.5">
                          <span className={cn('truncate text-sm font-medium', !f.label && 'text-muted-foreground italic')}>{f.label || 'Untitled field'}</span>
                          <span className="text-muted-foreground truncate text-xs">
                            {INPUT_TYPE_LABEL[f.type]}
                            {f.required ? ' · Required' : ' · Optional'}
                            {f.type === 'file' && f.required && ' · Evidence'}
                          </span>
                        </span>
                      </button>
                      {!readOnly && (
                        <span className="flex shrink-0 items-center opacity-60 group-hover:opacity-100">
                          <Button variant="ghost" size="icon-xs" aria-label={`Move ${f.label || 'field'} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                            <ArrowUp aria-hidden />
                          </Button>
                          <Button variant="ghost" size="icon-xs" aria-label={`Move ${f.label || 'field'} down`} disabled={i === inputs.length - 1} onClick={() => move(i, 1)}>
                            <ArrowDown aria-hidden />
                          </Button>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* Settings of the selected field */}
          <aside className="bg-card grid gap-4 rounded-xl border p-4 lg:sticky lg:top-4" aria-label="Field settings" data-tour="form-settings">
            <h3 className="text-sm font-semibold">Field settings</h3>
            {!selected ? (
              <p className="text-muted-foreground text-sm">{inputs.length ? 'Select a field to set it up.' : 'Add a field to set it up here.'}</p>
            ) : (
              <FieldSettings key={selected.id} field={selected} readOnly={readOnly} onPatch={(p) => patch(selected.id, p)} onDuplicate={() => duplicate(selected)} onRemove={() => remove(selected.id)} />
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function FieldSettings({ field: f, readOnly, onPatch, onDuplicate, onRemove }: { field: KpiInput; readOnly?: boolean; onPatch: (p: Partial<KpiInput>) => void; onDuplicate: () => void; onRemove: () => void }) {
  const types = f.fileTypes ?? [];
  const flip = (t: string) => onPatch({ fileTypes: types.includes(t) ? types.filter((x) => x !== t) : [...types, t] });
  const isFile = f.type === 'file';
  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="field-label">Label</Label>
        <Input id="field-label" autoFocus={!f.label} value={f.label} disabled={readOnly} onChange={(e) => onPatch({ label: e.target.value })} placeholder={isFile ? 'For example Certificate' : 'For example Lectures delivered'} />
      </div>
      <div className="grid gap-1.5">
        <Label>Type</Label>
        <Select
          value={f.type}
          disabled={readOnly}
          onValueChange={(v) => {
            const type = v as InputType;
            onPatch({ type, options: type === 'choice' ? (f.options ?? []) : undefined, min: undefined, max: undefined, fileTypes: type === 'file' ? (f.fileTypes ?? ['PDF']) : undefined, multiple: undefined });
          }}
        >
          <SelectTrigger className="w-full" aria-label="Field type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(INPUT_TYPE_LABEL) as InputType[]).map((t) => {
              const Icon = TYPE_ICON[t];
              return (
                <SelectItem key={t} value={t}>
                  <Icon aria-hidden /> {INPUT_TYPE_LABEL[t]}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {f.type === 'number' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="field-min">Minimum</Label>
            <Input id="field-min" type="number" value={f.min ?? ''} disabled={readOnly} onChange={(e) => onPatch({ min: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="None" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="field-max">Maximum</Label>
            <Input id="field-max" type="number" value={f.max ?? ''} disabled={readOnly} onChange={(e) => onPatch({ max: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="None" />
          </div>
        </div>
      )}
      {f.type === 'choice' && (
        <div className="grid gap-1.5">
          <Label htmlFor="field-options">Choices</Label>
          <Input
            id="field-options"
            value={(f.options ?? []).join(', ')}
            disabled={readOnly}
            onChange={(e) => onPatch({ options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="Scopus, Web of Science, Other"
          />
          <p className="text-muted-foreground text-xs">Separate choices with commas.</p>
        </div>
      )}
      {isFile && (
        <div className="grid gap-1.5">
          <Label>Allowed file types</Label>
          <div className="flex flex-wrap gap-1.5">
            {FILE_TYPES.map((t) => (
              <Toggle key={t} on={types.includes(t)} onClick={() => !readOnly && flip(t)}>
                {t}
              </Toggle>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">None selected accepts any file.</p>
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="field-help">
          {isFile ? 'What counts as proof' : 'Help text'} <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <textarea
          id="field-help"
          value={f.help ?? ''}
          disabled={readOnly}
          onChange={(e) => onPatch({ help: e.target.value })}
          placeholder={isFile ? 'A signed certificate or the official event report' : 'Shown under the field'}
          className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-16 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 disabled:opacity-60"
        />
      </div>

      <div className="grid gap-3 border-t pt-4">
        <label className="flex items-start justify-between gap-4 text-sm">
          <span className="grid gap-0.5">
            <span className="font-medium">Required</span>
            <span className="text-muted-foreground text-xs">{isFile ? 'Makes this KPI need evidence. The reviewer checks it before releasing a mark.' : 'It must be filled in to submit.'}</span>
          </span>
          <Switch checked={f.required} disabled={readOnly} onCheckedChange={(required) => onPatch({ required })} aria-label="Required" />
        </label>
        {isFile && (
          <label className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">Allow several files</span>
            <Switch checked={!!f.multiple} disabled={readOnly} onCheckedChange={(multiple) => onPatch({ multiple })} aria-label="Allow several files" />
          </label>
        )}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy aria-hidden data-icon="inline-start" /> Duplicate
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={onRemove}>
            <Trash2 aria-hidden data-icon="inline-start" /> Remove
          </Button>
        </div>
      )}
    </div>
  );
}

/** The form as the employee sees it. */
function EmployeePreview({ content }: { content: KpiContent }) {
  return (
    <div className="mx-auto grid w-full max-w-xl gap-3" data-tour="form-preview">
      <p className="text-muted-foreground text-center text-xs">What the employee sees</p>
      <div className="bg-card grid gap-5 rounded-xl border p-6 shadow-xs">
        <div className="grid gap-1">
          <h3 className="font-semibold">{content.name || 'Untitled KPI'}</h3>
          {content.description && <p className="text-muted-foreground text-sm">{content.description}</p>}
        </div>
        {content.inputs.length === 0 && <p className="text-muted-foreground text-sm">No fields yet. Switch to Build to add some.</p>}
        {content.inputs.map((i) => (
          <div key={i.id} className="grid gap-1.5">
            <Label className="text-sm">
              {i.label || 'Untitled field'}
              {i.required && <span className="text-destructive"> *</span>}
            </Label>
            {i.help && <p className="text-muted-foreground -mt-0.5 text-xs">{i.help}</p>}
            {i.type === 'file' ? (
              <div className="text-muted-foreground grid justify-items-center gap-1 rounded-lg border border-dashed px-3 py-5 text-center text-xs">
                <Upload className="size-4" aria-hidden />
                <span>
                  Upload {i.multiple ? 'files' : 'a file'}
                  {i.fileTypes?.length ? ` · ${i.fileTypes.join(', ')}` : ''}
                </span>
              </div>
            ) : (
              <Input disabled placeholder={i.type === 'yesno' ? 'Yes or no' : i.type === 'choice' ? (i.options?.join(' / ') || 'Choose') : i.type === 'date' ? 'Date' : ''} />
            )}
          </div>
        ))}
        <Button disabled size="sm" className="justify-self-start">
          Submit
        </Button>
      </div>
    </div>
  );
}
