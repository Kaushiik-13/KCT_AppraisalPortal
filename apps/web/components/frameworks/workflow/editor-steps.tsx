'use client';

import type { ReactNode } from 'react';
import { ArrowRight, FileText, GitBranch, Plus, Split, Waypoints } from 'lucide-react';
import { EvidenceSection, InputsSection, RulesEditor } from '@/components/frameworks/editor/editor-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { KpiContent, WfNode, Workflow } from '@/lib/frameworks/types';
import { isScore, orderedSteps, pathLabels, sourcesFor, STARTING_POINTS, type StartingPoint } from '@/lib/frameworks/workflow';
import { cn } from '@/lib/utils';

function StepIntro({ n, title, text, children }: { n: number; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="grid gap-1">
        <span className="text-muted-foreground text-xs">Step {n} of 4</span>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground max-w-xl text-sm">{text}</p>
      </div>
      {children}
    </div>
  );
}

/* ---------------- Step 1: Form ---------------- */

/** What the employee fills in, with a live preview of their view beside it. */
export function FormStep({ content, onChange, readOnly, onNext }: { content: KpiContent; onChange: (p: Partial<KpiContent>) => void; readOnly?: boolean; onNext: () => void }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:px-6">
      <StepIntro n={1} title="Form" text="The fields an employee fills in for this KPI. Use a file field for proof, like a certificate or a paper." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid content-start gap-6">
          <section className="bg-card grid gap-4 rounded-xl border p-4" data-tour="form-fields">
            <h3 className="text-sm font-semibold">Fields</h3>
            <InputsSection bare content={content} onChange={onChange} readOnly={readOnly} />
          </section>
          <section className="bg-card grid gap-4 rounded-xl border p-4" data-tour="form-evidence">
            <h3 className="text-sm font-semibold">Evidence</h3>
            <EvidenceSection bare content={content} onChange={onChange} readOnly={readOnly} />
          </section>
        </div>
        <aside className="grid content-start gap-3 lg:sticky lg:top-4 lg:self-start" data-tour="form-preview">
          <h3 className="text-muted-foreground text-xs font-medium">What the employee sees</h3>
          <div className="bg-card grid gap-4 rounded-xl border p-5 shadow-xs">
            <div className="grid gap-1">
              <h4 className="font-semibold">{content.name || 'Untitled KPI'}</h4>
              {content.description && <p className="text-muted-foreground text-sm">{content.description}</p>}
            </div>
            {content.inputs.length === 0 && <p className="text-muted-foreground text-sm">Fields you add show up here.</p>}
            {content.inputs.map((i) => (
              <div key={i.id} className="grid gap-1.5">
                <Label className="text-sm">
                  {i.label || 'Untitled field'}
                  {i.required && <span className="text-destructive"> *</span>}
                </Label>
                {i.type === 'file' ? (
                  <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed px-3 py-3 text-xs">
                    <FileText className="size-4" aria-hidden /> Upload a file{content.evidence.fileTypes.length ? ` · ${content.evidence.fileTypes.join(', ')}` : ''}
                  </div>
                ) : (
                  <Input disabled placeholder={i.type === 'yesno' ? 'Yes or no' : i.type === 'choice' ? (i.options?.join(' / ') ?? 'Choose') : i.type === 'date' ? 'Date' : ''} />
                )}
                {i.help && <p className="text-muted-foreground text-xs">{i.help}</p>}
              </div>
            ))}
            <Button disabled size="sm" className="justify-self-start">
              Submit
            </Button>
          </div>
        </aside>
      </div>
      <div className="flex justify-end border-t pt-4">
        <Button onClick={onNext}>
          Next: Workflow <ArrowRight aria-hidden data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Step 2: starting points ---------------- */

const POINT_ICON: Record<StartingPoint['id'], typeof Plus> = { form: Waypoints, evidence: FileText, role: Split, blank: GitBranch };

/** Shown on the canvas until a new KPI picks how its workflow starts. */
export function StartingPoints({ onPick, hasFile }: { onPick: (id: StartingPoint['id']) => void; hasFile: boolean }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center overflow-y-auto p-4">
      <div className="bg-card grid w-full max-w-2xl gap-4 rounded-2xl border p-5 shadow-lg" data-tour="starting-points">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold">How should this KPI work?</h2>
          <p className="text-muted-foreground text-sm">Pick a starting point. You can change any step afterwards.</p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {STARTING_POINTS.map((p) => {
            const Icon = POINT_ICON[p.id];
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onPick(p.id)}
                  className="hover:border-foreground focus-visible:ring-ring/50 grid h-full w-full gap-1.5 rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-2"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="size-4" aria-hidden /> {p.name}
                    {p.id === 'form' && <span className="bg-secondary text-muted-foreground rounded px-1.5 text-[11px] font-normal">Most KPIs</span>}
                  </span>
                  <span className="text-muted-foreground text-xs">{p.description}</span>
                  <span className="text-muted-foreground font-mono text-[11px]">{p.flow}</span>
                  {p.id === 'evidence' && !hasFile && <span className="text-warning text-xs">Needs a file field in the form.</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Step 3: Scoring ---------------- */

/** Every Score step in one place, as the KPI's scoring policy. */
export function ScoringStep({
  content,
  workflow,
  readOnly,
  onNode,
  onShowOnCanvas,
  onGoToWorkflow,
  onNext,
}: {
  content: KpiContent;
  workflow: Workflow;
  readOnly?: boolean;
  onNode: (id: string, patch: Partial<WfNode>) => void;
  onShowOnCanvas: (id: string) => void;
  onGoToWorkflow: () => void;
  onNext: () => void;
}) {
  const scores = orderedSteps(workflow).filter(isScore);
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-6 md:px-6">
      <StepIntro
        n={3}
        title="Scoring"
        text="Rules turn values into points. They can use form answers, and values an Extract evidence step read from a file before this point. The first rule that matches wins; no match scores 0."
      />
      <p className="text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 text-xs">Draft rules for testing. They are not approved policy until scoring rules are agreed.</p>
      {scores.length === 0 && (
        <div className="grid justify-items-center gap-3 rounded-xl border border-dashed px-4 py-10 text-center">
          <p className="text-muted-foreground text-sm">This workflow has no Score step yet, so reviewers would enter marks by hand.</p>
          <Button variant="outline" size="sm" onClick={onGoToWorkflow}>
            Add a Score step in the workflow
          </Button>
        </div>
      )}
      {scores.map((n, i) => {
        const where = pathLabels(workflow, n.id);
        return (
          <section key={n.id} className="bg-card grid gap-4 rounded-xl border p-4" data-tour={i === 0 ? 'scoring-card' : undefined}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">{n.name || 'Score'}</h3>
              {where.map((w) => (
                <span key={w} className="bg-secondary text-muted-foreground rounded px-1.5 text-[11px] leading-5">
                  {w}
                </span>
              ))}
              <button type="button" onClick={() => onShowOnCanvas(n.id)} className="text-muted-foreground hover:text-foreground ml-auto text-xs hover:underline">
                Show on canvas
              </button>
            </div>
            <RulesEditor sources={sourcesFor(content, workflow, n.id)} rules={n.rules ?? []} onChange={(rules) => onNode(n.id, { rules })} readOnly={readOnly} />
          </section>
        );
      })}
      <div className={cn('flex justify-end border-t pt-4')}>
        <Button onClick={onNext}>
          Next: Test <ArrowRight aria-hidden data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
