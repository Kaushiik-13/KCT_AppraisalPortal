'use client';

import { useState } from 'react';
import { CircleCheck, CircleDot, CircleStop, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { KpiContent, Workflow } from '@/lib/frameworks/types';
import { runWorkflow, type RunResult, type TestPerson } from '@/lib/frameworks/workflow';
import { cn } from '@/lib/utils';

const PRESETS: { label: string; person: TestPerson }[] = [
  { label: 'Team member', person: { title: 'Assistant Professor', isReviewer: false } },
  { label: 'Lead', person: { title: 'Head of Department', isReviewer: true } },
];

type Props = {
  content: KpiContent;
  workflow: Workflow;
  result: (RunResult & { snapshot: string }) | null;
  onResult: (r: (RunResult & { snapshot: string }) | null) => void;
  onFocusStep: (id: string) => void;
};

/** Test mode: pick who is submitting, fill the form, and watch which path the submission takes. */
export function TestPanel({ content, workflow, result, onResult, onFocusStep }: Props) {
  const [person, setPerson] = useState<TestPerson>(PRESETS[0].person);
  const [values, setValues] = useState<Record<string, string>>({});
  const snapshot = JSON.stringify({ i: content.inputs, w: workflow });
  const stale = !!result && result.snapshot !== snapshot;
  const name = (id: string) => workflow.nodes.find((n) => n.id === id)?.name || 'Step';

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Test a submission</h2>
        <p className="text-muted-foreground text-xs">Nothing is saved. Only the path this person takes runs.</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <section className="grid gap-3 border-b px-4 py-4">
          <h3 className="text-sm font-semibold">Submit as</h3>
          <div className="bg-muted inline-flex justify-self-start rounded-md p-0.5 text-xs" role="group" aria-label="Who is submitting">
            {PRESETS.map((p) => {
              const on = p.person.title === person.title && p.person.isReviewer === person.isReviewer;
              return (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPerson(p.person)}
                  className={cn('rounded px-2.5 py-1', on ? 'bg-card text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground')}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="test-title">Job title</Label>
            <Input id="test-title" value={person.title} onChange={(e) => setPerson({ ...person, title: e.target.value })} />
          </div>
          <label className="flex items-center justify-between gap-3 text-sm">
            Reviews others
            <Switch checked={person.isReviewer} onCheckedChange={(isReviewer) => setPerson({ ...person, isReviewer })} aria-label="Reviews others" />
          </label>
        </section>

        <form
          noValidate
          className="grid gap-4 border-b px-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            onResult({ ...runWorkflow(content, workflow, values, person), snapshot });
          }}
        >
          <div className="grid gap-0.5">
            <h3 className="text-sm font-semibold">{content.name || 'Untitled KPI'}</h3>
            {content.description && <p className="text-muted-foreground text-xs">{content.description}</p>}
          </div>
          {content.inputs.length === 0 && <p className="text-muted-foreground text-sm">The form has no fields yet. Add them on the Trigger step.</p>}
          {content.inputs.map((i) => {
            const id = `test-${i.id}`;
            return (
              <div key={i.id} className="grid gap-1.5">
                <Label htmlFor={id}>
                  {i.label || 'Untitled field'}
                  {i.required && <span className="text-destructive"> *</span>}
                </Label>
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
                  <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-2 text-xs">File upload. Not tested here.</p>
                ) : (
                  <Input
                    id={id}
                    type={i.type === 'number' ? 'number' : i.type === 'date' ? 'date' : 'text'}
                    value={values[i.id] ?? ''}
                    onChange={(e) => setValues((s) => ({ ...s, [i.id]: e.target.value }))}
                  />
                )}
                {i.help && <p className="text-muted-foreground text-xs">{i.help}</p>}
              </div>
            );
          })}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm">
              <Play aria-hidden data-icon="inline-start" /> Run test
            </Button>
            {result && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onResult(null)}>
                Clear
              </Button>
            )}
          </div>
        </form>

        <section className="grid gap-3 px-4 py-4" aria-live="polite">
          <h3 className="text-sm font-semibold">Result</h3>
          {!result && <p className="text-muted-foreground text-sm">Run a test to see the path on the canvas.</p>}
          {stale && <p className="text-warning text-xs">The workflow or form changed. Run the test again.</p>}
          {result && (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums">{result.points ?? '—'}</span>
                <span className="text-muted-foreground text-sm">{result.points === null ? 'no points' : 'points'} · {result.outcome}</span>
              </div>
              <ol className="grid gap-1">
                {result.trace.map((t, i) => (
                  <li key={i}>
                    <button type="button" onClick={() => onFocusStep(t.nodeId)} className="hover:bg-muted/60 flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left text-sm">
                      {t.tone === 'stop' ? (
                        <CircleStop className="text-destructive mt-0.5 size-3.5 shrink-0" aria-hidden />
                      ) : t.tone === 'end' ? (
                        <CircleCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                      ) : (
                        <CircleDot className="text-muted-foreground mt-0.5 size-3.5 shrink-0" aria-hidden />
                      )}
                      <span className="grid">
                        <span className="font-medium">{name(t.nodeId)}</span>
                        <span className="text-muted-foreground text-xs">{t.text}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="text-muted-foreground text-xs">Draft scoring, for testing only.</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
