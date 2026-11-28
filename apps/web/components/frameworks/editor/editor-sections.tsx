'use client';

import { type ReactNode } from 'react';
import { ArrowDown, ArrowUp, CircleAlert, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/settings-rows';
import { INPUT_TYPE_LABEL } from '@/lib/frameworks/format';
import { OP_LABEL, scorableInputs } from '@/lib/frameworks/scoring';
import type { InputType, KpiContent, KpiInput, Kra, ScoringRule } from '@/lib/frameworks/types';
import type { SourceGroup } from '@/lib/frameworks/workflow';
import { cn } from '@/lib/utils';

type SectionProps = { content: KpiContent; onChange: (patch: Partial<KpiContent>) => void; readOnly?: boolean; /** Hide the section title inside a panel that has its own. */ bare?: boolean };

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const FILE_TYPES = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Images', 'Video'];

function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

function TextArea(props: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      className={cn(
        'border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 disabled:opacity-60',
        props.className,
      )}
    />
  );
}

export function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

/* ---------------- Basics ---------------- */

export function BasicsSection({
  content,
  onChange,
  readOnly,
  bare,
  code,
  onCodeChange,
  kras,
  audiences,
}: SectionProps & { code: string; onCodeChange: (code: string) => void; kras: Kra[]; audiences: string[] }) {
  return (
    <div className="grid gap-5">
      {!bare && <SectionTitle title="Basics" text="What the KPI is called, which KRA it belongs to and who it applies to." />}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
        <Field label="Name" htmlFor="kpi-name">
          <Input id="kpi-name" value={content.name} disabled={readOnly} onChange={(e) => onChange({ name: e.target.value })} placeholder="Guest lecture delivery" />
        </Field>
        <Field label="Code" htmlFor="kpi-code">
          <Input id="kpi-code" value={code} disabled={readOnly} onChange={(e) => onCodeChange(e.target.value.toUpperCase())} />
        </Field>
      </div>
      <Field label="Description" htmlFor="kpi-desc" hint="Shown to employees above the form.">
        <TextArea id="kpi-desc" value={content.description} disabled={readOnly} onChange={(e) => onChange({ description: e.target.value })} placeholder="What counts, and what does not" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="KRA">
          <Select value={content.kraId} disabled={readOnly} onValueChange={(kraId) => onChange({ kraId })}>
            <SelectTrigger className="w-full" aria-label="KRA">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kras.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Applies to">
          <Select value={content.appliesTo || audiences[0]} disabled={readOnly} onValueChange={(appliesTo) => onChange({ appliesTo })}>
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
        </Field>
      </div>
    </div>
  );
}

/* ---------------- Inputs ---------------- */

export function InputsSection({ content, onChange, readOnly, bare }: SectionProps) {
  const set = (inputs: KpiInput[]) => onChange({ inputs });
  const patch = (id: string, p: Partial<KpiInput>) => set(content.inputs.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...content.inputs];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set(next);
  };
  const remove = (id: string) => onChange({ inputs: content.inputs.filter((i) => i.id !== id) });

  return (
    <div className="grid gap-5">
      {!bare && <SectionTitle title="Inputs" text="The fields an employee fills in. Use a file upload for proof." />}
      {content.inputs.length === 0 && (
        <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">No form fields yet. A KPI needs at least one.</p>
      )}
      <ol className="grid gap-3">
        {content.inputs.map((input, i) => (
          <li key={input.id} className="bg-card grid gap-3 rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-6 text-xs tabular-nums">{i + 1}.</span>
              <Input
                aria-label={`Input ${i + 1} label`}
                value={input.label}
                disabled={readOnly}
                onChange={(e) => patch(input.id, { label: e.target.value })}
                placeholder="Label, for example Lectures delivered"
                className="flex-1"
              />
              <Select value={input.type} disabled={readOnly} onValueChange={(type) => patch(input.id, { type: type as InputType, options: type === 'choice' ? (input.options ?? []) : undefined })}>
                <SelectTrigger className="w-36" aria-label={`Input ${i + 1} type`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(INPUT_TYPE_LABEL) as InputType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {INPUT_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 pl-8 sm:grid-cols-2">
              <Input aria-label={`Input ${i + 1} help`} value={input.help ?? ''} disabled={readOnly} onChange={(e) => patch(input.id, { help: e.target.value })} placeholder="Help text (optional)" />
              {input.type === 'number' && (
                <div className="flex items-center gap-2">
                  <Input aria-label="Minimum" type="number" value={input.min ?? ''} disabled={readOnly} onChange={(e) => patch(input.id, { min: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Min" />
                  <span className="text-muted-foreground text-xs">to</span>
                  <Input aria-label="Maximum" type="number" value={input.max ?? ''} disabled={readOnly} onChange={(e) => patch(input.id, { max: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Max" />
                </div>
              )}
              {input.type === 'choice' && (
                <Input
                  aria-label="Choices"
                  value={(input.options ?? []).join(', ')}
                  disabled={readOnly}
                  onChange={(e) => patch(input.id, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Choices, separated by commas"
                />
              )}
            </div>
            <div className="flex items-center gap-3 pl-8">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={input.required} disabled={readOnly} onCheckedChange={(required) => patch(input.id, { required })} aria-label="Required" />
                Required
              </label>
              {!readOnly && (
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="icon-xs" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp aria-hidden />
                  </Button>
                  <Button variant="ghost" size="icon-xs" aria-label="Move down" disabled={i === content.inputs.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown aria-hidden />
                  </Button>
                  <Button variant="ghost" size="icon-xs" aria-label="Remove input" onClick={() => remove(input.id)}>
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {!readOnly && (
        <Button variant="outline" className="justify-self-start" onClick={() => set([...content.inputs, { id: uid('in'), label: '', type: 'number', required: true }])}>
          <Plus aria-hidden data-icon="inline-start" /> Add field
        </Button>
      )}
    </div>
  );
}

/* ---------------- Evidence ---------------- */

export function EvidenceSection({ content, onChange, readOnly, bare }: SectionProps) {
  const ev = content.evidence;
  const flip = (t: string) => onChange({ evidence: { ...ev, fileTypes: ev.fileTypes.includes(t) ? ev.fileTypes.filter((x) => x !== t) : [...ev.fileTypes, t] } });
  const hasFileInput = content.inputs.some((i) => i.type === 'file');
  return (
    <div className="grid gap-5">
      {!bare && <SectionTitle title="Evidence" text="Whether proof must be attached, and what kind." />}
      <label className="bg-card flex items-center justify-between gap-4 rounded-xl border p-4 text-sm">
        <span className="grid gap-0.5">
          <span className="font-medium">Evidence required</span>
          <span className="text-muted-foreground">The reviewer checks it before releasing a mark.</span>
        </span>
        <Switch checked={content.evidenceRequired} disabled={readOnly} onCheckedChange={(evidenceRequired) => onChange({ evidenceRequired })} aria-label="Evidence required" />
      </label>
      {content.evidenceRequired && (
        <>
          {!hasFileInput && (
            <p className="text-warning flex items-center gap-2 text-sm">
              <CircleAlert className="size-4" aria-hidden /> Add a file upload input so people can attach it.
            </p>
          )}
          <Field label="Allowed file types">
            <div className="flex flex-wrap gap-1.5">
              {FILE_TYPES.map((t) => (
                <Toggle key={t} on={ev.fileTypes.includes(t)} onClick={() => !readOnly && flip(t)}>
                  {t}
                </Toggle>
              ))}
            </div>
          </Field>
          <Field label="Guidance" htmlFor="ev-guide" hint="Tell people what a good piece of evidence looks like.">
            <TextArea id="ev-guide" value={ev.guidance} disabled={readOnly} onChange={(e) => onChange({ evidence: { ...ev, guidance: e.target.value } })} placeholder="A signed certificate or the official event report" />
          </Field>
        </>
      )}
    </div>
  );
}

/* ---------------- Scoring rules ---------------- */

/** Rules for one Score step: "if <field> <op> <value> then <points>". The first match wins; no match scores 0. */
export function RulesEditor({
  sources,
  rules,
  onChange,
  readOnly,
}: {
  /** Values the rules can use, grouped: the form, then anything extracted earlier on the path. */
  sources: SourceGroup[];
  rules: ScoringRule[];
  onChange: (rules: ScoringRule[]) => void;
  readOnly?: boolean;
}) {
  const groups = sources.map((g) => ({ ...g, items: scorableInputs(g.items) })).filter((g) => g.items.length);
  const inputs = groups.flatMap((g) => g.items);
  const patch = (id: string, p: Partial<ScoringRule>) => onChange(rules.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const num = (v: string) => (v === '' ? 0 : Number(v));
  const swap = (i: number, j: number) => {
    const n = [...rules];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  return (
    <div className="grid gap-3">
      {inputs.length === 0 && <p className="text-muted-foreground text-sm">Add a number, yes/no or choice field to the form, or extract one from a file. Rules test those.</p>}
      <ol className="grid gap-2">
        {rules.map((r, i) => (
          <li key={r.id} className="bg-card grid gap-2 rounded-lg border p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs tabular-nums">Rule {i + 1}</span>
              {!readOnly && (
                <span className="ml-auto flex">
                  <Button variant="ghost" size="icon-xs" aria-label="Move rule up" disabled={i === 0} onClick={() => swap(i, i - 1)}>
                    <ArrowUp aria-hidden />
                  </Button>
                  <Button variant="ghost" size="icon-xs" aria-label="Move rule down" disabled={i === rules.length - 1} onClick={() => swap(i, i + 1)}>
                    <ArrowDown aria-hidden />
                  </Button>
                  <Button variant="ghost" size="icon-xs" aria-label="Remove rule" onClick={() => onChange(rules.filter((x) => x.id !== r.id))}>
                    <Trash2 aria-hidden />
                  </Button>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">If</span>
              <Select value={r.inputId} disabled={readOnly} onValueChange={(inputId) => patch(r.id, { inputId })}>
                <SelectTrigger size="sm" className="min-w-0 flex-1" aria-label="Value to test">
                  <SelectValue placeholder="Choose a value" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectGroup key={g.label}>
                      <SelectLabel>{g.label}</SelectLabel>
                      {g.items.map((x) => (
                        <SelectItem key={x.id} value={x.id}>
                          {x.label || 'Untitled field'}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <Select value={r.op} disabled={readOnly} onValueChange={(op) => patch(r.id, { op: op as ScoringRule['op'] })}>
                <SelectTrigger size="sm" className="w-32" aria-label="Comparison">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(OP_LABEL) as ScoringRule['op'][]).map((op) => (
                    <SelectItem key={op} value={op}>
                      {OP_LABEL[op]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input type="number" aria-label="Value" className="h-7 w-20" value={r.value} disabled={readOnly} onChange={(e) => patch(r.id, { value: num(e.target.value) })} />
              {r.op === 'between' && (
                <>
                  <span className="text-muted-foreground">and</span>
                  <Input type="number" aria-label="Upper value" className="h-7 w-20" value={r.value2 ?? ''} disabled={readOnly} onChange={(e) => patch(r.id, { value2: num(e.target.value) })} />
                </>
              )}
              <span className="text-muted-foreground">then</span>
              <Input type="number" aria-label="Points" className="h-7 w-16" value={r.points} disabled={readOnly} onChange={(e) => patch(r.id, { points: num(e.target.value) })} />
              <span className="text-muted-foreground">points</span>
            </div>
          </li>
        ))}
      </ol>
      {!readOnly && inputs.length > 0 && (
        <Button variant="outline" size="sm" className="justify-self-start" onClick={() => onChange([...rules, { id: uid('r'), inputId: inputs[0].id, op: 'gte', value: 0, points: 0 }])}>
          <Plus aria-hidden data-icon="inline-start" /> Add rule
        </Button>
      )}
      <p className="text-muted-foreground text-xs">The first rule that matches wins; no match scores 0. Yes counts as 1 and no as 0; choices count as their position. Draft rules, not approved policy.</p>
    </div>
  );
}
