'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, CircleAlert, CircleCheck, History, Pencil, RotateCcw } from 'lucide-react';
import { BasicsSection } from '@/components/frameworks/editor/editor-sections';
import { VersionsDialog } from '@/components/frameworks/versions-dialog';
import { FormStep, ScoringStep, StartingPoints } from '@/components/frameworks/workflow/editor-steps';
import { StepLibrary, type LibraryPick } from '@/components/frameworks/workflow/step-library';
import { StepSettings } from '@/components/frameworks/workflow/step-settings';
import { TestPanel } from '@/components/frameworks/workflow/test-panel';
import { WorkflowCanvas, type Slot } from '@/components/frameworks/workflow/workflow-canvas';
import { HelpButton } from '@/components/tour/help-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { colorOf } from '@/lib/department-colors';
import type { KpiContent, WfNode, Workflow } from '@/lib/frameworks/types';
import { editableContent, frameworkActions, useFrameworkLibrary } from '@/lib/frameworks/use-framework-library';
import { allRules, createNode, insertStep, isScore, removeStep, startFrom, updateNode, workflowIssues, workflowOf, type RunResult } from '@/lib/frameworks/workflow';
import { markProgress } from '@/lib/tour/progress';
import { useSetup } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

type Step = 'form' | 'workflow' | 'scoring' | 'test';
type Run = (RunResult & { snapshot: string }) | null;

const STEPS: { key: Step; label: string }[] = [
  { key: 'form', label: 'Form' },
  { key: 'workflow', label: 'Workflow' },
  { key: 'scoring', label: 'Scoring' },
  { key: 'test', label: 'Test' },
];

// KPI editor (#79) in four guided steps: Form, Workflow (a top-down canvas following the PoC's blocks,
// tools and plugins), Scoring and Test. Steps are a guide, not a lock. Changes save as you type.
export default function KpiEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { kras, kpis } = useFrameworkLibrary();
  const { departments } = useSetup();
  const kpi = kpis.find((k) => k.id === id);

  const [content, setContent] = useState<KpiContent | null>(null);
  const [code, setCode] = useState('');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [step, setStep] = useState<Step>('form');
  const [selectedId, setSelectedId] = useState('');
  const [slot, setSlot] = useState<Slot | null>(null);
  const [run, setRun] = useState<Run>(null);
  const [tested, setTested] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [published, setPublished] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<KpiContent | null>(null);

  // Load the content to edit once the KPI is known (and again after publish or discard).
  const loadedFor = useRef<string>('');
  useEffect(() => {
    if (!kpi) return;
    const key = `${kpi.id}:${kpi.version}:${kpi.status}:${kpi.hasDraftChanges ? 1 : 0}`;
    if (loadedFor.current === key && content) return;
    const first = loadedFor.current === '';
    loadedFor.current = key;
    const c = editableContent(kpi);
    const withFlow = { ...c, workflow: workflowOf(c) };
    setContent(withFlow);
    latest.current = withFlow;
    setCode(kpi.code);
    // New KPIs start on the form; KPIs that already have one open on their workflow.
    if (first) setStep(withFlow.inputs.length ? 'workflow' : 'form');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi?.id, kpi?.version, kpi?.status, kpi?.hasDraftChanges]);

  const readOnly = kpi?.status === 'archived';

  const change = useCallback(
    (patch: Partial<KpiContent>) => {
      if (!kpi || readOnly || !latest.current) return;
      const next = { ...latest.current, ...patch };
      latest.current = next;
      setContent(next);
      setSaved('saving');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        frameworkActions.saveContent(kpi.id, next);
        setSaved('saved');
      }, 400);
    },
    [kpi, readOnly],
  );

  const workflow = content?.workflow;
  const setWorkflow = useCallback((wf: Workflow) => change({ workflow: wf, rules: allRules(wf) }), [change]);
  const issues = useMemo(() => (content && workflow ? workflowIssues(content, workflow) : []), [content, workflow]);
  const path = useMemo(() => {
    if (!run || step !== 'test') return null;
    return {
      nodes: new Set(run.trace.map((t) => t.nodeId)),
      routes: new Set(run.trace.filter((t) => t.route).map((t) => `${t.nodeId}:${t.route}`)),
    };
  }, [run, step]);

  const select = useCallback((nodeId: string) => {
    setSlot(null);
    setSelectedId((s) => (s === nodeId ? '' : nodeId));
  }, []);
  const openSlot = useCallback((s: Slot) => {
    setSelectedId('');
    setSlot(s);
  }, []);

  if (!kpi || !content || !workflow) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div className="grid gap-3">
          <p className="text-muted-foreground text-sm">{kpis.length === 0 ? 'Loading…' : 'This KPI does not exist. It may have been removed when the prototype was reset.'}</p>
          <Button asChild variant="outline">
            <Link href="/frameworks/library">Back to KRAs and KPIs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const kra = kras.find((k) => k.id === content.kraId);
  const audiences = ['All teaching staff', 'All staff', ...departments.map((d) => `${d.name} department`)];
  const named = content.name.trim().length > 0 && content.name !== 'Untitled KPI';
  const blocked = !named || issues.some((i) => i.blocking);
  const isPublished = kpi.status === 'published';
  const editingNext = isPublished && kpi.hasDraftChanges;
  const selected = workflow.nodes.find((n) => n.id === selectedId);
  const slotParent = slot ? workflow.nodes.find((n) => n.id === slot.parentId) : undefined;
  const scoreIds = new Set(workflow.nodes.filter(isScore).map((n) => n.id));
  const triggerId = workflow.nodes.find((n) => n.kind === 'trigger')?.id;

  // A step is done when nothing it owns still needs attention.
  const done: Record<Step, boolean> = {
    form: !issues.some((i) => i.nodeId === triggerId && i.text !== 'Choose a starting point'),
    workflow: workflow.started !== false && !issues.some((i) => i.blocking && i.nodeId !== triggerId && !scoreIds.has(i.nodeId)),
    scoring: scoreIds.size > 0 && !issues.some((i) => scoreIds.has(i.nodeId)),
    test: tested,
  };

  const flush = () => {
    if (timer.current && latest.current) {
      clearTimeout(timer.current);
      timer.current = null;
      frameworkActions.saveContent(kpi.id, latest.current);
    }
  };

  const goTo = (s: Step) => {
    setStep(s);
    setSlot(null);
    if (s !== 'workflow') setSelectedId('');
  };

  const pick = (p: LibraryPick) => {
    if (!slot) return;
    const node = createNode(p.kind, p.tool);
    if (node.tool === 'extract_evidence') node.extract = { fileInputId: content.inputs.find((i) => i.type === 'file')?.id ?? '', fields: [] };
    setWorkflow(insertStep(workflow, slot.parentId, slot.route, node));
    setSlot(null);
    setSelectedId(node.id);
  };

  const patchNode = (nodeId: string, patch: Partial<WfNode>) => setWorkflow(updateNode(workflow, nodeId, patch));

  const panel =
    step === 'test' ? (
      <TestPanel
        content={content}
        workflow={workflow}
        result={run}
        onResult={(r) => {
          setRun(r);
          if (r && !r.stopped) {
            setTested(true);
            markProgress('tested');
          }
        }}
        onFocusStep={(nodeId) => {
          goTo('workflow');
          setSelectedId(nodeId);
        }}
      />
    ) : step === 'workflow' && slot ? (
      <StepLibrary midPath={!!slotParent?.routes[slot.route]} onPick={pick} onClose={() => setSlot(null)} />
    ) : step === 'workflow' && selected ? (
      <StepSettings
        key={selected.id}
        node={selected}
        content={content}
        workflow={workflow}
        issues={issues.filter((i) => i.nodeId === selected.id)}
        readOnly={readOnly}
        onNode={(p) => patchNode(selected.id, p)}
        onRemove={() => {
          setWorkflow(removeStep(workflow, selected.id));
          setSelectedId('');
        }}
        onClose={() => setSelectedId('')}
        onEditForm={() => goTo('form')}
      />
    ) : null;

  const canvasStep = step === 'workflow' || step === 'test';

  return (
    <div className="flex h-dvh flex-col">
      <header className="bg-card relative z-20 flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2.5 md:px-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/frameworks/library" onClick={flush} aria-label="Back to KRAs and KPIs">
            <ArrowLeft aria-hidden data-icon="inline-start" /> <span className="hidden sm:inline">KRAs and KPIs</span>
          </Link>
        </Button>
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="hover:bg-muted/60 group flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 xl:max-w-[calc(50vw-26rem)]"
          aria-label="Edit KPI details"
          data-tour="kpi-details"
        >
          {kra && <span className="size-2 shrink-0 rounded-full" style={{ background: colorOf(kra.color).fg }} aria-hidden />}
          <span className="text-muted-foreground font-mono text-xs">{code}</span>
          <h1 className="truncate text-sm font-semibold">{content.name || 'Untitled KPI'}</h1>
          <Pencil className="text-muted-foreground size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
        </button>
        <span className={cn('shrink-0 rounded-full border px-2 text-[11px] leading-5', isPublished ? 'text-foreground' : 'text-muted-foreground')}>
          {kpi.status === 'archived' ? 'Archived' : isPublished ? `Live v${kpi.version}${editingNext ? ` · editing v${kpi.version + 1}` : ''}` : 'Draft'}
        </span>

        {/* The four steps. Centred on the page on wide screens; the title is capped there so they never overlap. */}
        <nav
          aria-label="Editor steps"
          data-tour="editor-steps"
          className="flex items-center gap-0.5 text-xs max-md:order-last max-md:w-full max-md:overflow-x-auto xl:absolute xl:left-1/2 xl:-translate-x-1/2"
        >
          {STEPS.map((s, i) => {
            const on = step === s.key;
            return (
              <div key={s.key} className="flex items-center">
                {i > 0 && <span className="bg-border mx-1 h-px w-3 sm:w-5" aria-hidden />}
                <button
                  type="button"
                  aria-current={on ? 'step' : undefined}
                  onClick={() => goTo(s.key)}
                  data-tour={`step-${s.key}`}
                  className={cn('flex items-center gap-1.5 rounded-md px-2 py-1 whitespace-nowrap', on ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground')}
                >
                  <span
                    className={cn(
                      'grid size-4 place-items-center rounded-full border text-[10px] tabular-nums',
                      done[s.key] ? 'bg-foreground text-background border-foreground' : on ? 'border-foreground' : '',
                    )}
                    aria-hidden
                  >
                    {done[s.key] ? <Check className="size-2.5" /> : i + 1}
                  </span>
                  {s.label}
                  {done[s.key] && <span className="sr-only">(done)</span>}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground hidden text-xs 2xl:inline" aria-live="polite">
            {readOnly ? 'Read only' : saved === 'saving' ? 'Saving…' : saved === 'saved' ? 'Saved' : isPublished && !editingNext ? 'Edits create a new version' : 'Draft saved'}
          </span>
          <HelpButton page="editor" />
          {kpi.versions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setVersionsOpen(true)} aria-label="Versions">
              <History aria-hidden data-icon="inline-start" /> <span className="hidden lg:inline">Versions</span>
            </Button>
          )}
          {kpi.status === 'archived' ? (
            <Button size="sm" onClick={() => frameworkActions.restore(kpi.id)}>
              <RotateCcw aria-hidden data-icon="inline-start" /> Restore as draft
            </Button>
          ) : (
            <>
              {editingNext && (
                <Button variant="outline" size="sm" onClick={() => setDiscardOpen(true)}>
                  Discard
                </Button>
              )}
              <Button
                size="sm"
                data-tour="publish"
                disabled={isPublished && !editingNext && saved !== 'saving'}
                onClick={() => {
                  flush();
                  setPublished(null);
                  setNote('');
                  setPublishOpen(true);
                }}
              >
                {isPublished ? `Publish v${kpi.version + 1}` : 'Publish'}
              </Button>
            </>
          )}
        </div>
      </header>

      {editingNext && (
        <div className="bg-muted/50 text-muted-foreground border-b px-4 py-1.5 text-center text-xs">
          You are editing v{kpi.version + 1}. v{kpi.version} stays live, and cycles that already use it keep it, until you publish.
        </div>
      )}

      {step === 'form' && (
        <div className="flex-1 overflow-y-auto">
          <FormStep content={content} onChange={change} readOnly={readOnly} onNext={() => goTo('workflow')} />
        </div>
      )}

      {step === 'scoring' && (
        <div className="flex-1 overflow-y-auto">
          <ScoringStep
            content={content}
            workflow={workflow}
            readOnly={readOnly}
            onNode={patchNode}
            onShowOnCanvas={(nodeId) => {
              goTo('workflow');
              setSelectedId(nodeId);
            }}
            onGoToWorkflow={() => goTo('workflow')}
            onNext={() => goTo('test')}
          />
        </div>
      )}

      {canvasStep && (
        <div className="relative flex min-h-0 flex-1">
          <div className="bg-muted/30 relative min-w-0 flex-1" data-tour="canvas">
            <WorkflowCanvas
              content={content}
              workflow={workflow}
              issues={issues}
              selectedId={step === 'workflow' ? selectedId : ''}
              onSelect={(nodeId) => {
                if (step === 'test') goTo('workflow');
                select(nodeId);
              }}
              onAdd={step === 'workflow' && !readOnly && workflow.started !== false ? openSlot : undefined}
              activeSlot={slot}
              path={path}
            />
            {step === 'workflow' && workflow.started === false && !readOnly && (
              <StartingPoints
                hasFile={content.inputs.some((i) => i.type === 'file')}
                onPick={(pid) => {
                  setWorkflow(startFrom(pid, content));
                  setSelectedId('');
                }}
              />
            )}
            {step === 'workflow' && workflow.started !== false && !readOnly && (
              <p className="bg-card/90 text-muted-foreground pointer-events-none absolute top-3 left-3 rounded-md border px-2.5 py-1 text-xs backdrop-blur">
                <span className="text-foreground font-medium">Step 2 of 4.</span> Click a step to set it up · <span className="text-foreground font-medium">+</span> adds a step
              </p>
            )}
            {step === 'test' && (
              <p className="bg-card/90 text-muted-foreground pointer-events-none absolute top-3 left-3 rounded-md border px-2.5 py-1 text-xs backdrop-blur">
                <span className="text-foreground font-medium">Step 4 of 4.</span> {path ? 'Dark steps are the path this test took' : 'Run a test to see the path'}
              </p>
            )}
            {step === 'workflow' && workflow.started !== false && (
              <Button size="sm" className="absolute bottom-3 left-3 shadow-sm" onClick={() => goTo('scoring')} data-tour="next-scoring">
                Next: Scoring <ArrowRight aria-hidden data-icon="inline-end" />
              </Button>
            )}
          </div>

          {panel && (
            <aside
              className={cn(
                'bg-card flex min-h-0 flex-col border-l',
                'md:relative md:w-[380px] md:shrink-0',
                'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:max-h-[72dvh] max-md:rounded-t-2xl max-md:border-t max-md:border-l-0 max-md:shadow-lg',
              )}
              aria-label={step === 'test' ? 'Test a submission' : slot ? 'Add a step' : 'Step settings'}
            >
              {panel}
            </aside>
          )}
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>KPI details</DialogTitle>
            <DialogDescription>What the KPI is called, which KRA it belongs to and who it applies to.</DialogDescription>
          </DialogHeader>
          <BasicsSection
            bare
            content={content}
            onChange={change}
            readOnly={readOnly}
            code={code}
            onCodeChange={(c) => {
              setCode(c);
              frameworkActions.updateCode(kpi.id, c);
            }}
            kras={kras.filter((k) => !k.archived || k.id === content.kraId)}
            audiences={audiences}
          />
          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-md" data-tour="publish-dialog">
          {published !== null ? (
            <>
              <DialogHeader>
                <DialogTitle>Published v{published}</DialogTitle>
                <DialogDescription>
                  {kpi.code} is live. New cycles use v{published}; cycles already running keep the version they started with.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPublishOpen(false)}>
                  Keep editing
                </Button>
                <Button onClick={() => router.push('/frameworks/library')} data-tour="publish-done">
                  Back to KRAs and KPIs
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (blocked) return;
                const v = isPublished ? kpi.version + 1 : 1;
                frameworkActions.publish(kpi.id, note);
                markProgress('published');
                setSaved('idle');
                setPublished(v);
              }}
            >
              <DialogHeader>
                <DialogTitle>{isPublished ? `Publish v${kpi.version + 1}` : 'Publish this KPI'}</DialogTitle>
                <DialogDescription>Publishing makes it available to new cycles. You can still change it later as a new version.</DialogDescription>
              </DialogHeader>
              <ul className="grid gap-2 text-sm">
                <li className="flex items-center gap-2">
                  {named ? <CircleCheck className="text-success size-4 shrink-0" aria-hidden /> : <CircleAlert className="text-destructive size-4 shrink-0" aria-hidden />}
                  <span className={cn(!named && 'text-destructive')}>Has a name</span>
                  {!named && (
                    <button
                      type="button"
                      className="text-primary ml-auto text-xs hover:underline"
                      onClick={() => {
                        setPublishOpen(false);
                        setDetailsOpen(true);
                      }}
                    >
                      Fix
                    </button>
                  )}
                </li>
                {issues.length === 0 && (
                  <li className="flex items-center gap-2">
                    <CircleCheck className="text-success size-4 shrink-0" aria-hidden /> Every step is set up
                  </li>
                )}
                {issues.map((i) => (
                  <li key={`${i.nodeId}-${i.text}`} className="flex items-center gap-2">
                    <CircleAlert className={cn('size-4 shrink-0', i.blocking ? 'text-destructive' : 'text-warning')} aria-hidden />
                    <span className={cn('min-w-0', i.blocking && 'text-destructive')}>
                      <span className="text-muted-foreground">{workflow.nodes.find((n) => n.id === i.nodeId)?.name || 'Step'}:</span> {i.text}
                    </span>
                    <button
                      type="button"
                      className="text-primary ml-auto shrink-0 text-xs hover:underline"
                      onClick={() => {
                        setPublishOpen(false);
                        if (i.nodeId === triggerId && i.text !== 'Choose a starting point') goTo('form');
                        else {
                          goTo('workflow');
                          if (i.nodeId !== triggerId) setSelectedId(i.nodeId);
                        }
                      }}
                    >
                      Fix
                    </button>
                  </li>
                ))}
                {!tested && <li className="text-muted-foreground text-xs">Tip: run a test first to check the path and points.</li>}
              </ul>
              <div className="grid gap-1.5">
                <Label htmlFor="pub-note">What changed {isPublished ? '' : '(optional)'}</Label>
                <Input id="pub-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={isPublished ? 'Leads now need two reviews' : 'First version'} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPublishOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={blocked} data-tour="publish-confirm">
                  <Check aria-hidden data-icon="inline-start" /> Publish
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard the v{kpi.version + 1} changes?</AlertDialogTitle>
            <AlertDialogDescription>The edits you made since v{kpi.version} are removed. v{kpi.version} stays live.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (timer.current) clearTimeout(timer.current);
                frameworkActions.discardChanges(kpi.id);
                setSaved('idle');
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VersionsDialog kpi={versionsOpen ? kpi : null} onOpenChange={setVersionsOpen} />
    </div>
  );
}
