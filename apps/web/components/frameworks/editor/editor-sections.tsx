'use client';

import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, CircleAlert, CircleCheck, Plus, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/settings-rows';
import { INPUT_TYPE_LABEL } from '@/lib/frameworks/format';
import { OP_LABEL, score, scorableInputs, type ScoreResult } from '@/lib/frameworks/scoring';
import type { InputType, KpiContent, KpiInput, Kra, ScoringRule } from '@/lib/frameworks/types';
import { cn } from '@/lib/utils';

type SectionProps = { content: KpiContent; onChange: (patch: Partial<KpiContent>) => void; readOnly?: boolean };

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
  code,
  onCodeChange,
  kras,
  audiences,
}: SectionProps & { code: string; onCodeChange: (code: string) => void; kras: Kra[]; audiences: string[] }) {
  return (
    <div className="grid gap-5">
      <SectionTitle title="Basics" text="What the KPI is called, which KRA it belongs to and who it applies to." />
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

export function InputsSection({ content, onChange, readOnly }: SectionProps) {
  const set = (inputs: KpiInput[]) => onChange({ inputs });
  const patch = (id: string, p: Partial<KpiInput>) => set(content.inputs.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...content.inputs];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set(next);
  };
  const remove = (id: string) =>
    onChange({ inputs: content.inputs.filter((i) => i.id !== id), rules: content.rules.filter((r) => r.inputId !== id) });

  return (
    <div className="grid gap-5">
      <SectionTitle title="Inputs" text="The fields an employee fills in. Use a file upload for proof." />
      {content.inputs.length === 0 && (
        <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">No inputs yet. A KPI needs at least one.</p>
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
          <Plus aria-hidden data-icon="inline-start" /> Add input
        </Button>
      )}
    </div>
  );
}

/* ---------------- Evidence ---------------- */

export function EvidenceSection({ content, onChange, readOnly }: SectionProps) {
  const ev = content.evidence;
  const flip = (t: string) => onChange({ evidence: { ...ev, fileTypes: ev.fileTypes.includes(t) ? ev.fileTypes.filter((x) => x !== t) : [...ev.fileTypes, t] } });
  const hasFileInput = content.inputs.some((i) => i.type === 'file');
  return (
    <div className="grid gap-5">
      <SectionTitle title="Evidence" text="Whether proof must be attached, and what kind." />
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

/* ---------------- Scoring ---------------- */

export function ScoringSection({ content, onChange, readOnly }: SectionProps) {
  const inputs = scorableInputs(content.inputs);
  const set = (rules: ScoringRule[]) => onChange({ rules });
  const patch = (id: string, p: Partial<ScoringRule>) => set(content.rules.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const num = (v: string) => (v === '' ? 0 : Number(v));
  return (
    <div className="grid gap-5">
      <SectionTitle title="Scoring" text="Rules turn what people enter into points. The first rule that matches wins; no match scores 0." />
      <p className="text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 text-xs">Draft rules for testing. They are not approved policy until scoring rules are agreed.</p>
      {inputs.length === 0 && <p className="text-muted-foreground text-sm">Add a number, yes/no or choice input first. Rules test those.</p>}
      <ol className="grid gap-2">
        {content.rules.map((r, i) => (
          <li key={r.id} className="bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3 text-sm">
            <span className="text-muted-foreground w-5 text-xs tabular-nums">{i + 1}.</span>
            <span className="text-muted-foreground">If</span>
            <Select value={r.inputId} disabled={readOnly} onValueChange={(inputId) => patch(r.id, { inputId })}>
              <SelectTrigger size="sm" className="w-44" aria-label="Input">
                <SelectValue placeholder="Choose input" />
              </SelectTrigger>
              <SelectContent>
                {inputs.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.label || 'Untitled input'}
                  </SelectItem>
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
            {!readOnly && (
              <span className="ml-auto flex">
                <Button variant="ghost" size="icon-xs" aria-label="Move rule up" disabled={i === 0} onClick={() => { const n = [...content.rules]; [n[i], n[i - 1]] = [n[i - 1], n[i]]; set(n); }}>
                  <ArrowUp aria-hidden />
                </Button>
                <Button variant="ghost" size="icon-xs" aria-label="Move rule down" disabled={i === content.rules.length - 1} onClick={() => { const n = [...content.rules]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; set(n); }}>
                  <ArrowDown aria-hidden />
                </Button>
                <Button variant="ghost" size="icon-xs" aria-label="Remove rule" onClick={() => set(content.rules.filter((x) => x.id !== r.id))}>
                  <Trash2 aria-hidden />
                </Button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {!readOnly && inputs.length > 0 && (
        <Button variant="outline" className="justify-self-start" onClick={() => set([...content.rules, { id: uid('r'), inputId: inputs[0].id, op: 'gte', value: 0, points: 0 }])}>
          <Plus aria-hidden data-icon="inline-start" /> Add rule
        </Button>
      )}
      <p className="text-muted-foreground text-xs">Yes/no counts as 1 for yes and 0 for no. Choices count as their position, starting at 1.</p>
    </div>
  );
}

/* ---------------- Review ---------------- */

export function ReviewSection() {
  const steps = [
    'The employee submits their answers and evidence.',
    'Their assigned reviewer checks the submission and the evidence.',
    'The reviewer either returns it with feedback, or records the mark.',
    'The reviewer releases the mark. Only then does the employee see it.',
  ];
  return (
    <div className="grid gap-5">
      <SectionTitle title="Review" text="Who checks submissions for this KPI and how a mark reaches the employee." />
      <ol className="bg-card grid gap-3 rounded-xl border p-4 text-sm">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="bg-muted text-muted-foreground grid size-5 shrink-0 place-items-center rounded-full text-xs">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <p className="text-muted-foreground text-sm">Reviewers are assigned per person in People. Nobody can review their own submission.</p>
    </div>
  );
}

/* ---------------- Preview and test ---------------- */

export function PreviewSection({ content }: { content: KpiContent }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ res: ScoreResult; snapshot: string } | null>(null);
  const snapshot = JSON.stringify({ inputs: content.inputs, rules: content.rules });
  const stale = !!result && result.snapshot !== snapshot;

  return (
    <div className="grid gap-5">
      <SectionTitle title="Preview and test" text="See the form as an employee will, try some answers and check which rule scores them." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <form
          noValidate
          className="bg-card grid content-start gap-4 rounded-xl border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setResult({ res: score(content.inputs, content.rules, values), snapshot });
          }}
        >
          <div className="grid gap-1">
            <h3 className="font-semibold">{content.name || 'Untitled KPI'}</h3>
            {content.description && <p className="text-muted-foreground text-sm">{content.description}</p>}
          </div>
          {content.inputs.length === 0 && <p className="text-muted-foreground text-sm">Add inputs to see the form.</p>}
          {content.inputs.map((i) => {
            const id = `pv-${i.id}`;
            const label = (
              <>
                {i.label || 'Untitled input'}
                {i.required && <span className="text-destructive"> *</span>}
              </>
            );
            return (
              <div key={i.id} className="grid gap-1.5">
                <Label htmlFor={id}>{label}</Label>
                {i.type === 'yesno' || i.type === 'choice' ? (
                  <Select value={values[i.id] ?? ''} onValueChange={(v) => setValues((s) => ({ ...s, [i.id]: v }))}>
                    <SelectTrigger id={id} className="w-full">
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      {(i.type === 'yesno' ? ['yes', 'no'] : (i.options ?? [])).map((o) => (
                        <SelectItem key={o} value={o}>
                          {i.type === 'yesno' ? (o === 'yes' ? 'Yes' : 'No') : o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : i.type === 'file' ? (
                  <div className="text-muted-foreground rounded-lg border border-dashed px-3 py-3 text-xs">
                    File upload{content.evidence.fileTypes.length ? ` · ${content.evidence.fileTypes.join(', ')}` : ''}. Not tested here.
                  </div>
                ) : (
                  <Input
                    id={id}
                    type={i.type === 'number' ? 'number' : i.type === 'date' ? 'date' : 'text'}
                    min={i.min}
                    max={i.max}
                    value={values[i.id] ?? ''}
                    onChange={(e) => setValues((s) => ({ ...s, [i.id]: e.target.value }))}
                  />
                )}
                {i.help && <p className="text-muted-foreground text-xs">{i.help}</p>}
              </div>
            );
          })}
          {content.evidenceRequired && content.evidence.guidance && <p className="text-muted-foreground text-xs">Evidence: {content.evidence.guidance}</p>}
          <Button type="submit" className="justify-self-start" disabled={content.inputs.length === 0}>
            <Play aria-hidden data-icon="inline-start" /> Run test
          </Button>
        </form>

        <aside className="bg-card grid content-start gap-3 rounded-xl border p-5 text-sm" aria-live="polite">
          <h3 className="font-semibold">Result</h3>
          {!result && <p className="text-muted-foreground">Fill in the form and run a test.</p>}
          {stale && <p className="text-warning text-xs">The inputs or rules changed. Run the test again.</p>}
          {result?.res.kind === 'blocked' && (
            <p className="text-destructive">Stopped: fill in {result.res.missing.join(', ')}.</p>
          )}
          {result?.res.kind === 'scored' && (
            <>
              <p className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums">{result.res.points}</span>
                <span className="text-muted-foreground">points</span>
              </p>
              <p className="text-muted-foreground flex items-start gap-2">
                <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                {result.res.ruleIndex === null ? 'No rule matched, so this scores 0.' : `Rule ${result.res.ruleIndex + 1} matched first.`}
              </p>
              {result.res.outOfRange.length > 0 && <p className="text-warning text-xs">Outside the allowed range: {result.res.outOfRange.join(', ')}.</p>}
              <p className="text-muted-foreground text-xs">Draft scoring, for testing only.</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
