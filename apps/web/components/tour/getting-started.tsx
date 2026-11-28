'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Check, Route, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFrameworkLibrary } from '@/lib/frameworks/use-framework-library';
import { allRules, workflowOf } from '@/lib/frameworks/workflow';
import { tourActions, useTourState } from '@/lib/tour/progress';
import { startFirstKpiTour } from './help-button';
import { cn } from '@/lib/utils';

/**
 * Steps to a first live KPI, on the Frameworks overview until they are all done or hidden.
 * Each item links to where you do it. "Your" KPI is the newest one you created (not a template sample).
 */
export function GettingStarted() {
  const { kras, kpis } = useFrameworkLibrary();
  const { progress, checklistHidden } = useTourState();
  const pathname = usePathname();
  const router = useRouter();
  const mine = kpis.filter((k) => k.id.startsWith('kpi-'));
  const latest = mine.at(-1);
  const content = latest ? (latest.status === 'published' && latest.draft ? latest.draft : latest) : null;
  const wf = content ? workflowOf(content) : null;
  const editor = latest ? `/frameworks/kpis/${latest.id}` : '/frameworks/library';

  const items = [
    { label: 'Create a KRA', done: kras.length > 0, href: '/frameworks/library#new-kra' },
    { label: 'Create a KPI', done: mine.length > 0, href: '/frameworks/library' },
    { label: 'Add form fields', done: !!content && content.inputs.length > 0, href: editor },
    { label: 'Build the workflow', done: !!wf && wf.started !== false, href: editor },
    { label: 'Set scoring rules', done: !!wf && allRules(wf).length > 0, href: editor },
    { label: 'Test it', done: !!progress.tested, href: editor },
    { label: 'Publish it', done: !!progress.published || mine.some((k) => k.status === 'published'), href: editor },
  ];
  const doneCount = items.filter((i) => i.done).length;
  if (checklistHidden || doneCount === items.length) return null;
  const nextItem = items.find((i) => !i.done);

  return (
    <section className="bg-card grid gap-3 rounded-xl border p-4" aria-label="Getting started" data-tour="getting-started">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid gap-0.5">
          <h2 className="text-sm font-semibold">Getting started</h2>
          <p className="text-muted-foreground text-xs">
            {doneCount} of {items.length} done · steps to your first live KPI
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => startFirstKpiTour(pathname, router.push)}>
            <Route aria-hidden data-icon="inline-start" /> Guided tour
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Hide getting started" onClick={() => tourActions.hideChecklist()}>
            <X aria-hidden />
          </Button>
        </div>
      </div>
      <div className="bg-muted h-1 overflow-hidden rounded-full" aria-hidden>
        <div className="bg-primary h-full transition-[width] duration-500" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>
      <ol className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i, n) => (
          <li key={i.label}>
            <Link
              href={i.href}
              className={cn(
                'hover:bg-muted/60 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm',
                i.done ? 'text-muted-foreground' : i === nextItem ? 'text-foreground font-medium' : 'text-foreground',
              )}
            >
              <span className={cn('grid size-4 shrink-0 place-items-center rounded-full border text-[10px]', i.done && 'bg-foreground text-background border-foreground')} aria-hidden>
                {i.done ? <Check className="size-2.5" /> : n + 1}
              </span>
              <span className={cn(i.done && 'line-through decoration-1')}>{i.label}</span>
              <span className="sr-only">{i.done ? '(done)' : ''}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
