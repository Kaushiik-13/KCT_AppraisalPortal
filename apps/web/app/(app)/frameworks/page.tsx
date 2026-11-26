'use client';

import { ClipboardList, Plus, TriangleAlert } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';

// Prototype screen 1 of Framework Studio (#79): the Frameworks page as an empty shell.
// The KRA/KPI library and the KPI editor come in the next steps.
export default function FrameworksPage() {
  return (
    <>
      <PageHeader
        title="Frameworks"
        description="Build the KRAs and KPIs your organization appraises against. Drafts don't affect anyone until published."
      />

      <section className="bg-card grid place-items-center gap-4 rounded-xl border px-6 py-16 text-center">
        <span className="bg-secondary text-muted-foreground grid size-12 place-items-center rounded-xl" aria-hidden>
          <ClipboardList className="size-6" />
        </span>
        <div className="grid max-w-md gap-1.5">
          <h2 className="text-lg font-semibold">Build your first framework</h2>
          <p className="text-muted-foreground text-sm">
            Group KPIs under KRAs, add the inputs people fill in, then test and publish.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button disabled>
            <Plus aria-hidden data-icon="inline-start" /> New KRA
          </Button>
          <Button variant="outline" disabled>
            Start from template
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">Prototype: these open in the next step.</p>
      </section>

      <p className="border-warning/30 bg-warning/10 text-warning flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        Weights, maximums and caps are placeholders until scoring policy is approved.
      </p>
    </>
  );
}
