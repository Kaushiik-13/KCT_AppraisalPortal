'use client';

import type { ReactNode } from 'react';
import { ArrowRight, CircleAlert, Plus, Trash2, X } from 'lucide-react';
import { RulesEditor } from '@/components/frameworks/editor/editor-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { scorableInputs } from '@/lib/frameworks/scoring';
import type { ConditionOp, ExtractField, KpiContent, SplitBranch, WfNode, Workflow } from '@/lib/frameworks/types';
import { CONDITION_LABEL, sourcesFor, TOOL_NAME, TOOLS, type StepIssue } from '@/lib/frameworks/workflow';

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-t px-4 py-4 first:border-t-0">
      <div className="grid gap-0.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

type Props = {
  node: WfNode;
  content: KpiContent;
  workflow: Workflow;
  issues: StepIssue[];
  readOnly?: boolean;
  onNode: (patch: Partial<WfNode>) => void;
  onRemove: () => void;
  onClose: () => void;
  /** Opens the Form step, where the trigger's fields are edited. */
  onEditForm: () => void;
};

const TITLE: Record<WfNode['kind'], string> = {
  trigger: 'Trigger',
  action: 'Action',
  condition: 'Condition',
  split: 'Split by role',
  review: 'Human review',
  result: 'Result',
};

/** Settings for the selected step, in a drawer beside the canvas (a bottom sheet on phones). */
export function StepSettings({ node, content, workflow, issues, readOnly, onNode, onRemove, onClose, onEditForm }: Props) {
  const title = node.kind === 'action' && node.tool ? `Action · ${TOOL_NAME[node.tool]}` : TITLE[node.kind];
  const tool = TOOLS.find((t) => t.kind === node.tool);

  return (
    <div className="flex h-full flex-col" data-tour="step-settings">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="grid min-w-0">
          <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">{title}</span>
          <h2 className="truncate text-sm font-semibold">{node.name || 'Untitled step'}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close step settings" className="text-muted-foreground hover:text-foreground ml-auto">
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {issues.length > 0 && (
          <ul className="grid gap-1 border-b px-4 py-3">
            {issues.map((i) => (
              <li key={i.text} className={i.blocking ? 'text-warning flex items-center gap-2 text-xs' : 'text-muted-foreground flex items-center gap-2 text-xs'}>
                <CircleAlert className="size-3.5 shrink-0" aria-hidden /> {i.text}
              </li>
            ))}
          </ul>
        )}

        {node.kind !== 'trigger' && (
          <Group title="Step name">
            <Input aria-label="Step name" value={node.name} disabled={readOnly} onChange={(e) => onNode({ name: e.target.value })} />
          </Group>
        )}

        {node.kind === 'trigger' && (
          <Group title="Form" hint="Starts the workflow when an employee submits this KPI.">
            <ul className="text-muted-foreground grid gap-1 text-sm">
              {content.inputs.length === 0 && <li>No form fields yet.</li>}
              {content.inputs.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2">
                  <span className="text-foreground truncate">{i.label || 'Untitled field'}</span>
                  <span className="shrink-0 text-xs">{i.type === 'yesno' ? 'yes/no' : i.type}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="justify-self-start" onClick={onEditForm}>
              Edit the form <ArrowRight aria-hidden data-icon="inline-end" />
            </Button>
          </Group>
        )}

        {node.kind === 'action' && node.tool === 'score' && (
          <Group title="Scoring rules" hint="The only step that gives marks. Rules can use form answers and values extracted earlier on this path.">
            <RulesEditor sources={sourcesFor(content, workflow, node.id)} rules={node.rules ?? []} onChange={(rules) => onNode({ rules })} readOnly={readOnly} />
          </Group>
        )}
        {node.kind === 'action' && node.tool === 'extract_evidence' && <ExtractSettings node={node} content={content} readOnly={readOnly} onNode={onNode} onEditForm={onEditForm} />}
        {node.kind === 'action' && tool?.later && (
          <Group title={tool.name}>
            <p className="text-muted-foreground text-sm">{tool.description} This tool comes from the PoC and is not built in this prototype yet.</p>
          </Group>
        )}

        {node.kind === 'condition' && node.condition && <ConditionSettings node={node} content={content} workflow={workflow} readOnly={readOnly} onNode={onNode} />}
        {node.kind === 'split' && <SplitSettings node={node} readOnly={readOnly} onNode={onNode} />}

        {node.kind === 'review' && (
          <Group title="What happens" hint="The automated part ends here.">
            <ol className="text-muted-foreground grid list-decimal gap-1.5 pl-4 text-sm">
              <li>The submission goes to the person&apos;s assigned reviewer, with any points from Score.</li>
              <li>The reviewer checks the answers and the evidence.</li>
              <li>They approve and release the mark, or return it with feedback.</li>
            </ol>
            <p className="text-muted-foreground text-xs">Reviewers are assigned per person in People. Nobody reviews their own submission.</p>
          </Group>
        )}

        {node.kind === 'result' && (
          <Group title="Outcome" hint="What this path ends with, for example Not eligible.">
            <Input aria-label="Outcome" value={node.outcome ?? ''} disabled={readOnly} onChange={(e) => onNode({ outcome: e.target.value })} placeholder="Not eligible" />
          </Group>
        )}
      </div>

      {!readOnly && node.kind !== 'trigger' && (
        <div className="border-t px-4 py-3">
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onRemove}>
            <Trash2 aria-hidden data-icon="inline-start" /> Remove step
          </Button>
        </div>
      )}
    </div>
  );
}

const EXTRACT_TYPES: { value: ExtractField['type']; label: string }[] = [
  { value: 'number', label: 'Number' },
  { value: 'yesno', label: 'Yes / no' },
  { value: 'choice', label: 'Choice' },
  { value: 'text', label: 'Text' },
];

function ExtractSettings({ node, content, readOnly, onNode, onEditForm }: { node: WfNode; content: KpiContent; readOnly?: boolean; onNode: (p: Partial<WfNode>) => void; onEditForm: () => void }) {
  const x = node.extract ?? { fileInputId: '', fields: [] };
  const files = content.inputs.filter((i) => i.type === 'file');
  const set = (p: Partial<typeof x>) => onNode({ extract: { ...x, ...p } });
  const patch = (id: string, p: Partial<ExtractField>) => set({ fields: x.fields.map((f) => (f.id === id ? { ...f, ...p } : f)) });
  return (
    <>
      <Group title="File to read" hint="One of the form's file fields.">
        {files.length === 0 ? (
          <div className="grid gap-2">
            <p className="text-muted-foreground text-sm">The form has no file field yet.</p>
            <Button variant="outline" size="sm" className="justify-self-start" onClick={onEditForm}>
              Add one in the form <ArrowRight aria-hidden data-icon="inline-end" />
            </Button>
          </div>
        ) : (
          <Select value={x.fileInputId} disabled={readOnly} onValueChange={(fileInputId) => set({ fileInputId })}>
            <SelectTrigger className="w-full" aria-label="File field to read">
              <SelectValue placeholder="Choose a file field" />
            </SelectTrigger>
            <SelectContent>
              {files.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label || 'Untitled file field'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Group>
      <Group title="Values to extract" hint="Later steps can check and score these like form answers. In the prototype you type them in when testing.">
        <ol className="grid gap-2">
          {x.fields.map((f, i) => (
            <li key={f.id} className="bg-card grid gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Input aria-label={`Value ${i + 1} name`} value={f.label} disabled={readOnly} onChange={(e) => patch(f.id, { label: e.target.value })} placeholder="Indexed in" className="h-8" />
                <Select value={f.type} disabled={readOnly} onValueChange={(type) => patch(f.id, { type: type as ExtractField['type'], options: type === 'choice' ? (f.options ?? []) : undefined })}>
                  <SelectTrigger size="sm" className="w-28" aria-label={`Value ${i + 1} type`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXTRACT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!readOnly && (
                  <Button variant="ghost" size="icon-xs" aria-label={`Remove ${f.label || 'value'}`} onClick={() => set({ fields: x.fields.filter((y) => y.id !== f.id) })}>
                    <Trash2 aria-hidden />
                  </Button>
                )}
              </div>
              {f.type === 'choice' && (
                <Input
                  aria-label="Choices"
                  value={(f.options ?? []).join(', ')}
                  disabled={readOnly}
                  onChange={(e) => patch(f.id, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Scopus, Web of Science, None"
                  className="h-8"
                />
              )}
            </li>
          ))}
        </ol>
        {!readOnly && (
          <Button variant="outline" size="sm" className="justify-self-start" onClick={() => set({ fields: [...x.fields, { id: uid('xf'), label: '', type: 'number' }] })}>
            <Plus aria-hidden data-icon="inline-start" /> Add value
          </Button>
        )}
      </Group>
    </>
  );
}

function ConditionSettings({ node, content, workflow, readOnly, onNode }: { node: WfNode; content: KpiContent; workflow: Workflow; readOnly?: boolean; onNode: (p: Partial<WfNode>) => void }) {
  const c = node.condition!;
  const groups = sourcesFor(content, workflow, node.id).map((g) => ({ ...g, items: g.items.filter((i) => i.type !== 'file') })).filter((g) => g.items.length);
  const all = groups.flatMap((g) => g.items);
  const input = all.find((i) => i.id === c.inputId);
  const numeric = !!input && scorableInputs([input]).length > 0;
  const ops: ConditionOp[] = numeric || !input ? ['gte', 'lte', 'eq', 'between', 'filled'] : ['filled'];
  const set = (p: Partial<typeof c>) => onNode({ condition: { ...c, ...p } });
  return (
    <Group title="Check" hint="Met and Not met each lead to their own next step.">
      <div className="grid gap-1.5">
        <Label>Value</Label>
        <Select
          value={c.inputId}
          disabled={readOnly}
          onValueChange={(inputId) => {
            const next = all.find((i) => i.id === inputId);
            set({ inputId, op: next && scorableInputs([next]).length ? c.op : 'filled' });
          }}
        >
          <SelectTrigger className="w-full" aria-label="Value to check">
            <SelectValue placeholder="Choose a value" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectGroup key={g.label}>
                <SelectLabel>{g.label}</SelectLabel>
                {g.items.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.label || 'Untitled field'}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={c.op} disabled={readOnly || !input} onValueChange={(op) => set({ op: op as ConditionOp })}>
          <SelectTrigger size="sm" className="w-36" aria-label="Comparison">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ops.map((op) => (
              <SelectItem key={op} value={op}>
                {CONDITION_LABEL[op]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {c.op !== 'filled' && (
          <Input type="number" aria-label="Value" className="h-7 w-20" value={c.value} disabled={readOnly} onChange={(e) => set({ value: Number(e.target.value || 0) })} />
        )}
        {c.op === 'between' && (
          <>
            <span className="text-muted-foreground text-sm">and</span>
            <Input type="number" aria-label="Upper value" className="h-7 w-20" value={c.value2 ?? ''} disabled={readOnly} onChange={(e) => set({ value2: Number(e.target.value || 0) })} />
          </>
        )}
      </div>
    </Group>
  );
}

function SplitSettings({ node, readOnly, onNode }: { node: WfNode; readOnly?: boolean; onNode: (p: Partial<WfNode>) => void }) {
  const branches = node.branches ?? [];
  const patch = (id: string, p: Partial<SplitBranch>) => onNode({ branches: branches.map((b) => (b.id === id ? { ...b, ...p } : b)) });
  return (
    <Group title="Roles" hint="People go down the first role that fits them. Everyone else takes the last path.">
      <ol className="grid gap-2">
        {branches.map((b, i) => (
          <li key={b.id} className="bg-card grid gap-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs tabular-nums">{i + 1}.</span>
              <Input aria-label={`Role ${i + 1} name`} value={b.label} disabled={readOnly} onChange={(e) => patch(b.id, { label: e.target.value })} placeholder="Lead" className="h-8" />
              {!readOnly && (
                <Button variant="ghost" size="icon-xs" aria-label={`Remove ${b.label || 'role'}`} disabled={branches.length <= 1} onClick={() => onNode({ branches: branches.filter((x) => x.id !== b.id) })}>
                  <Trash2 aria-hidden />
                </Button>
              )}
            </div>
            <Select value={b.match.by} disabled={readOnly} onValueChange={(by) => patch(b.id, { match: by === 'reviewer' ? { by: 'reviewer' } : { by: 'title', contains: '' } })}>
              <SelectTrigger size="sm" className="w-full" aria-label={`Who is a ${b.label || 'member of this role'}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewer">People who review others</SelectItem>
                <SelectItem value="title">Job title contains…</SelectItem>
              </SelectContent>
            </Select>
            {b.match.by === 'title' && (
              <Input
                aria-label={`Titles for ${b.label || 'this role'}`}
                value={b.match.contains}
                disabled={readOnly}
                onChange={(e) => patch(b.id, { match: { by: 'title', contains: e.target.value } })}
                placeholder="Lead, Manager"
                className="h-8"
              />
            )}
          </li>
        ))}
        <li className="grid gap-1.5 rounded-lg border border-dashed p-3">
          <Input aria-label="Name of the path for everyone else" value={node.otherLabel ?? ''} disabled={readOnly} onChange={(e) => onNode({ otherLabel: e.target.value })} placeholder="Everyone else" className="h-8" />
          <span className="text-muted-foreground text-xs">Anyone who fits none of the roles above, for example team members.</span>
        </li>
      </ol>
      {!readOnly && (
        <Button variant="outline" size="sm" className="justify-self-start" onClick={() => onNode({ branches: [...branches, { id: uid('br'), label: '', match: { by: 'title', contains: '' } }] })}>
          <Plus aria-hidden data-icon="inline-start" /> Add role
        </Button>
      )}
      <p className="text-muted-foreground text-xs">Job titles are free text in People for now, so matching by title is approximate.</p>
    </Group>
  );
}
