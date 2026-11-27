'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, CircleAlert, CircleCheck, History, RotateCcw } from 'lucide-react';
import {
  BasicsSection,
  EvidenceSection,
  InputsSection,
  PreviewSection,
  ReviewSection,
  ScoringSection,
} from '@/components/frameworks/editor/editor-sections';
import { VersionsDialog } from '@/components/frameworks/versions-dialog';
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
import type { KpiContent } from '@/lib/frameworks/types';
import { editableContent, frameworkActions, useFrameworkLibrary } from '@/lib/frameworks/use-framework-library';
import { useSetup } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'basics', label: 'Basics' },
  { key: 'inputs', label: 'Inputs' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'scoring', label: 'Scoring' },
  { key: 'review', label: 'Review' },
  { key: 'preview', label: 'Preview and test' },
] as const;
type StepKey = (typeof STEPS)[number]['key'];

/** Checks before publishing. Errors block publishing; warnings do not. */
function checksOf(c: KpiContent) {
  return [
    { ok: c.name.trim().length > 0 && c.name !== 'Untitled KPI', label: 'Has a name', blocking: true, step: 'basics' as StepKey },
    { ok: c.inputs.length > 0, label: 'Has at least one input', blocking: true, step: 'inputs' as StepKey },
    { ok: c.inputs.every((i) => i.label.trim()), label: 'Every input has a label', blocking: true, step: 'inputs' as StepKey },
    ...(c.evidenceRequired
      ? [{ ok: c.inputs.some((i) => i.type === 'file'), label: 'Has a file input for evidence', blocking: true, step: 'evidence' as StepKey }]
      : []),
    { ok: c.rules.length > 0, label: 'Has scoring rules', blocking: false, step: 'scoring' as StepKey },
  ];
}

// KPI editor in focus mode (#79). Changes save as you type: into the draft, or beside the live version.
export default function KpiEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { kras, kpis } = useFrameworkLibrary();
  const { departments } = useSetup();
  const kpi = kpis.find((k) => k.id === id);

  const [step, setStep] = useState<StepKey>('basics');
  const [content, setContent] = useState<KpiContent | null>(null);
  const [code, setCode] = useState('');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [publishOpen, setPublishOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [published, setPublished] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the content to edit once the KPI is known (and again after publish or discard).
  const loadedFor = useRef<string>('');
  useEffect(() => {
    if (!kpi) return;
    const key = `${kpi.id}:${kpi.version}:${kpi.status}:${kpi.hasDraftChanges ? 1 : 0}`;
    if (loadedFor.current === key && content) return;
    loadedFor.current = key;
    setContent(editableContent(kpi));
    setCode(kpi.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi?.id, kpi?.version, kpi?.status, kpi?.hasDraftChanges]);

  if (!kpi || !content) {
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

  const readOnly = kpi.status === 'archived';
  const kra = kras.find((k) => k.id === content.kraId);
  const audiences = ['All teaching staff', 'All staff', ...departments.map((d) => `${d.name} department`)];
  const checks = checksOf(content);
  const blocked = checks.some((c) => c.blocking && !c.ok);
  const isPublished = kpi.status === 'published';
  const editingNext = isPublished && kpi.hasDraftChanges;

  const change = (patch: Partial<KpiContent>) => {
    if (readOnly) return;
    const next = { ...content, ...patch };
    setContent(next);
    setSaved('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      frameworkActions.saveContent(kpi.id, next);
      setSaved('saved');
    }, 400);
  };

  const flush = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      frameworkActions.saveContent(kpi.id, content);
    }
  };

  const stepWarn = (s: StepKey) => checks.some((c) => c.step === s && !c.ok);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-card sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3 md:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/frameworks/library" onClick={flush}>
            <ArrowLeft aria-hidden data-icon="inline-start" /> KRAs and KPIs
          </Link>
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          {kra && <span className="size-2 shrink-0 rounded-full" style={{ background: colorOf(kra.color).fg }} aria-hidden />}
          <span className="text-muted-foreground font-mono text-xs">{code}</span>
          <h1 className="truncate text-sm font-semibold">{content.name || 'Untitled KPI'}</h1>
          <span
            className={cn(
              'shrink-0 rounded-full border px-2 text-[11px] leading-5',
              isPublished ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {kpi.status === 'archived' ? 'Archived' : isPublished ? `Live v${kpi.version}${editingNext ? ` · editing v${kpi.version + 1}` : ''}` : 'Draft'}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground hidden text-xs sm:inline" aria-live="polite">
            {readOnly ? 'Read only' : saved === 'saving' ? 'Saving…' : saved === 'saved' ? 'Saved' : isPublished && !editingNext ? 'Edits create a new version' : 'Draft saved'}
          </span>
          {kpi.versions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setVersionsOpen(true)}>
              <History aria-hidden data-icon="inline-start" /> Versions
            </Button>
          )}
          {kpi.status === 'archived' ? (
            <Button size="sm" onClick={() => frameworkActions.restore(kpi.id)}>
              <RotateCcw aria-hidden data-icon="inline-start" /> Restore as draft
            </Button>
          ) : (
            !readOnly && (
              <>
                {editingNext && (
                  <Button variant="outline" size="sm" onClick={() => setDiscardOpen(true)}>
                    Discard changes
                  </Button>
                )}
                <Button
                  size="sm"
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
            )
          )}
        </div>
      </header>

      {editingNext && (
        <div className="bg-muted/50 text-muted-foreground border-b px-4 py-2 text-center text-xs md:px-6">
          You are editing v{kpi.version + 1}. v{kpi.version} stays live, and cycles that already use it keep it, until you publish.
        </div>
      )}

      <div className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-8 px-4 py-8 md:grid-cols-[200px_minmax(0,1fr)] md:px-6">
        <nav aria-label="Editor steps" className="flex gap-1 overflow-x-auto md:sticky md:top-24 md:grid md:content-start md:self-start md:overflow-visible">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-current={step === s.key ? 'step' : undefined}
              onClick={() => setStep(s.key)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm whitespace-nowrap',
                step === s.key ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              )}
            >
              <span className="w-4 text-xs tabular-nums">{i + 1}</span>
              <span className="flex-1">{s.label}</span>
              {stepWarn(s.key) && <span className="bg-warning size-1.5 rounded-full" aria-label="Needs attention" />}
            </button>
          ))}
        </nav>

        <main className="min-w-0 max-w-3xl">
          {step === 'basics' && (
            <BasicsSection
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
          )}
          {step === 'inputs' && <InputsSection content={content} onChange={change} readOnly={readOnly} />}
          {step === 'evidence' && <EvidenceSection content={content} onChange={change} readOnly={readOnly} />}
          {step === 'scoring' && <ScoringSection content={content} onChange={change} readOnly={readOnly} />}
          {step === 'review' && <ReviewSection />}
          {step === 'preview' && <PreviewSection content={content} />}

          <div className="mt-10 flex items-center justify-between border-t pt-5">
            <Button variant="outline" disabled={step === STEPS[0].key} onClick={() => setStep(STEPS[STEPS.findIndex((s) => s.key === step) - 1].key)}>
              Back
            </Button>
            {step !== 'preview' && (
              <Button variant="outline" onClick={() => setStep(STEPS[STEPS.findIndex((s) => s.key === step) + 1].key)}>
                Next
              </Button>
            )}
          </div>
        </main>
      </div>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-md">
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
                <Button onClick={() => router.push('/frameworks/library')}>Back to KRAs and KPIs</Button>
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
                setSaved('idle');
                setPublished(v);
              }}
            >
              <DialogHeader>
                <DialogTitle>{isPublished ? `Publish v${kpi.version + 1}` : 'Publish this KPI'}</DialogTitle>
                <DialogDescription>Publishing makes it available to new cycles. You can still change it later as a new version.</DialogDescription>
              </DialogHeader>
              <ul className="grid gap-2 text-sm">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2">
                    {c.ok ? (
                      <CircleCheck className="text-success size-4 shrink-0" aria-hidden />
                    ) : (
                      <CircleAlert className={cn('size-4 shrink-0', c.blocking ? 'text-destructive' : 'text-warning')} aria-hidden />
                    )}
                    <span className={cn(!c.ok && c.blocking && 'text-destructive')}>{c.label}</span>
                    {!c.ok && (
                      <button
                        type="button"
                        className="text-primary ml-auto text-xs hover:underline"
                        onClick={() => {
                          setStep(c.step);
                          setPublishOpen(false);
                        }}
                      >
                        Fix
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {!checks.find((c) => c.label === 'Has scoring rules')?.ok && (
                <p className="text-muted-foreground text-xs">Without scoring rules, reviewers enter marks by hand.</p>
              )}
              <div className="grid gap-1.5">
                <Label htmlFor="pub-note">What changed {isPublished ? '' : '(optional)'}</Label>
                <Input id="pub-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={isPublished ? 'Clarified what counts as evidence' : 'First version'} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPublishOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={blocked}>
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
