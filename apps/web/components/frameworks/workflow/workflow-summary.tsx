'use client';

import { Calculator, CircleAlert, CircleCheck, FileSearch, Flag, GitBranch, Play, Split, UserCheck, type LucideIcon } from 'lucide-react';
import { INPUT_TYPE_LABEL } from '@/lib/frameworks/format';
import type { KpiContent, WfNode, Workflow } from '@/lib/frameworks/types';
import { allExtracted, orderedSteps, pathLabels, type StepIssue } from '@/lib/frameworks/workflow';
import { cn } from '@/lib/utils';

const ICON: Record<WfNode['kind'], LucideIcon> = { trigger: Play, action: Calculator, condition: GitBranch, split: Split, review: UserCheck, result: Flag };
const iconOf = (n: WfNode) => (n.tool === 'extract_evidence' ? FileSearch : ICON[n.kind]);

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="grid gap-2 border-b px-4 py-4 last:border-b-0">
      <h3 className="text-muted-foreground flex items-center text-xs font-medium">
        {title}
        {aside && <span className="ml-auto">{aside}</span>}
      </h3>
      {children}
    </section>
  );
}

type Props = { content: KpiContent; workflow: Workflow; issues: StepIssue[]; onSelect: (id: string) => void };

/** The right panel when no step is selected: the workflow in words, what is left to do, and the values steps can use. */
export function WorkflowSummary({ content, workflow, issues, onSelect }: Props) {
  const steps = orderedSteps(workflow);
  const todo = [...issues].sort((a, b) => Number(b.blocking) - Number(a.blocking));
  const extracted = allExtracted(content, workflow);
  const nameOf = (id: string) => workflow.nodes.find((n) => n.id === id)?.name || 'A step';

  return (
    <div className="flex h-full flex-col" data-tour="wf-summary">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Workflow</h2>
        <p className="text-muted-foreground text-xs">What happens after an employee submits. Click a step to set it up.</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Section title="What happens">
          <ol className="grid">
            {steps.map((n, i) => {
              const Icon = iconOf(n);
              const where = pathLabels(workflow, n.id);
              const issue = issues.find((x) => x.nodeId === n.id && x.blocking);
              return (
                <li key={n.id} className="relative">
                  {i < steps.length - 1 && <span className="bg-border absolute top-8 bottom-0 left-[17px] w-px" aria-hidden />}
                  <button type="button" onClick={() => onSelect(n.id)} className="hover:bg-muted/60 flex w-full items-start gap-2.5 rounded-md px-1.5 py-1.5 text-left">
                    <span className="bg-card relative grid size-6 shrink-0 place-items-center rounded-md border">
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="flex items-center gap-1.5 text-sm">
                        <span className="truncate font-medium">{n.name || 'Untitled step'}</span>
                        {where.map((w) => (
                          <span key={w} className="bg-secondary text-muted-foreground shrink-0 rounded px-1 text-[10px] leading-4">
                            {w}
                          </span>
                        ))}
                      </span>
                    </span>
                    {issue ? <CircleAlert className="text-warning mt-1 size-3.5 shrink-0" aria-label="Needs attention" /> : <CircleCheck className="text-muted-foreground mt-1 size-3.5 shrink-0" aria-label="Ready" />}
                  </button>
                </li>
              );
            })}
          </ol>
        </Section>

        <Section title="To do" aside={todo.length > 0 && <span className="tabular-nums">{todo.length}</span>}>
          {todo.length === 0 ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <CircleCheck className="size-3.5" aria-hidden /> Nothing left in the workflow.
            </p>
          ) : (
            <ul className="grid gap-1">
              {todo.map((t, i) => (
                <li key={`${t.nodeId}-${i}`} className="flex items-start gap-2 text-sm">
                  <CircleAlert className={cn('mt-0.5 size-3.5 shrink-0', t.blocking ? 'text-warning' : 'text-muted-foreground')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="text-muted-foreground">{nameOf(t.nodeId)}:</span> {t.text}
                  </span>
                  <button type="button" onClick={() => onSelect(t.nodeId)} className="text-foreground shrink-0 text-xs font-medium hover:underline">
                    Fix
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Values steps can use">
          <div className="grid gap-3">
            <ValueGroup label="From the form" items={content.inputs.map((i) => ({ id: i.id, label: i.label || 'Untitled field', type: INPUT_TYPE_LABEL[i.type] }))} empty="No form fields yet." />
            {extracted.map((g) => (
              <ValueGroup key={g.label} label={g.label} items={g.items.map((i) => ({ id: i.id, label: i.label, type: INPUT_TYPE_LABEL[i.type] }))} />
            ))}
            {extracted.length === 0 && content.inputs.some((i) => i.type === 'file') && (
              <p className="text-muted-foreground text-xs">Add a Read a file step to use values from an upload.</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

function ValueGroup({ label, items, empty }: { label: string; items: { id: string; label: string; type: string }[]; empty?: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-medium">{label}</p>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-xs">{empty}</p>
      ) : (
        <ul className="grid gap-0.5">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-2 text-sm">
              <span className="truncate">{i.label}</span>
              <span className="text-muted-foreground ml-auto shrink-0 text-xs">{i.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
