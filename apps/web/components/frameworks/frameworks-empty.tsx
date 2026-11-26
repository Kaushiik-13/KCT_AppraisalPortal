'use client';

import { ClipboardList, FileStack, FlaskConical, Layers, ListChecks, Rocket } from 'lucide-react';
import { BarList } from '@/components/charts/bar-list';
import { LineChart } from '@/components/charts/line-chart';
import { Button } from '@/components/ui/button';

const STEPS = [
  { icon: Layers, title: 'Create KRAs', text: 'Group the work into areas, like Teaching or Research.' },
  { icon: ListChecks, title: 'Add KPIs', text: 'Say what people fill in and what proof they attach.' },
  { icon: Rocket, title: 'Test and publish', text: 'Try it as an employee would, then publish it.' },
];

// Decorative preview only: fixed shapes so the empty page hints at what analytics will look like.
const PREVIEW_BARS = [
  { id: 'a', label: 'Teaching and learning', value: 78 },
  { id: 'b', label: 'Research', value: 52 },
  { id: 'c', label: 'Operations', value: 66 },
];
const PREVIEW_LINE = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((label, i) => ({ label, value: [4, 9, 17, 26, 34, 45][i] }));

type FrameworksEmptyProps = {
  /** Admins can build; reviewers and others only read. The caller decides, this component never checks roles. */
  canBuild: boolean;
  onStartFromTemplate?: () => void;
  onCreateFromScratch?: () => void;
};

/** Shown on Frameworks screens when no KRAs or KPIs exist yet. */
export function FrameworksEmpty({ canBuild, onStartFromTemplate, onCreateFromScratch }: FrameworksEmptyProps) {
  if (!canBuild) {
    return (
      <section className="bg-card grid place-items-center gap-3 rounded-xl border px-6 py-14 text-center">
        <span className="bg-secondary text-muted-foreground grid size-12 place-items-center rounded-xl" aria-hidden>
          <ClipboardList className="size-6" />
        </span>
        <h2 className="text-lg font-semibold">No framework published yet</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          Your administrator hasn&apos;t published the KRAs and KPIs for this cycle. Once they do and people start submitting, your
          team&apos;s progress shows here.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-card grid gap-8 rounded-xl border p-6 md:p-8">
      <div className="grid gap-1.5">
        <h2 className="text-lg font-semibold">Build your first framework</h2>
        <p className="text-muted-foreground max-w-xl text-sm">
          A framework is the set of KRAs and KPIs people are appraised against. Start from a template and adjust it, or build your own.
        </p>
      </div>

      <ol className="grid gap-3 md:grid-cols-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="bg-background grid content-start gap-2 rounded-lg border p-4">
              <span className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary grid size-7 place-items-center rounded-md text-xs font-semibold">{i + 1}</span>
                <Icon className="text-muted-foreground size-4" aria-hidden />
              </span>
              <span className="text-sm font-medium">{s.title}</span>
              <span className="text-muted-foreground text-sm">{s.text}</span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onStartFromTemplate}>
          <FileStack aria-hidden data-icon="inline-start" /> Start from template
        </Button>
        <Button variant="outline" onClick={onCreateFromScratch} disabled={!onCreateFromScratch}>
          Create from scratch
        </Button>
        <span className="text-muted-foreground text-xs">The template is a set of sample KRAs and KPIs to edit. It is not approved policy.</span>
      </div>

      <div className="grid gap-3 border-t pt-6">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <FlaskConical className="size-3.5" aria-hidden /> Preview: analytics appear here once people start submitting
        </p>
        <div className="pointer-events-none grid gap-4 opacity-40 select-none md:grid-cols-2" aria-hidden>
          <div className="bg-background grid content-start gap-3 rounded-lg border p-4">
            <span className="text-sm font-semibold">Progress by KRA</span>
            <BarList items={PREVIEW_BARS} max={100} format={(v) => `${v}%`} labelWidth="minmax(100px,160px)" />
          </div>
          <div className="bg-background grid content-start gap-3 rounded-lg border p-4">
            <span className="text-sm font-semibold">Submissions over time</span>
            <LineChart points={PREVIEW_LINE} min={0} max={50} ticks={[0, 25, 50]} height={120} ariaLabel="Preview chart" />
          </div>
        </div>
      </div>
    </section>
  );
}
