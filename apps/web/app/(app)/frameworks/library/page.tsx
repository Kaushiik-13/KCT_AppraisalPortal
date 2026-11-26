'use client';

import { Layers, ListChecks, Lock } from 'lucide-react';
import { PrototypeStageSwitch } from '@/components/frameworks/prototype-stage-switch';
import { useDemoViewer, useFrameworkLibrary } from '@/lib/frameworks/use-framework-library';

// KRAs and KPIs tab (#79). Placeholder until the library screen is built: it states what will live here.
export default function FrameworkLibraryPage() {
  const { kras, kpis } = useFrameworkLibrary();
  const { viewer } = useDemoViewer();

  if (viewer !== 'admin') {
    return (
      <>
        <section className="bg-card text-muted-foreground flex items-center gap-3 rounded-xl border p-6 text-sm">
          <Lock className="size-4 shrink-0" aria-hidden />
          Only administrators can edit KRAs and KPIs. Your team&apos;s progress is on the Frameworks overview.
        </section>
        <PrototypeStageSwitch />
      </>
    );
  }

  const live = kpis.filter((k) => k.status !== 'archived');
  return (
    <>
      <section className="bg-card grid gap-4 rounded-xl border p-6">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold">KRAs and KPIs</h2>
          <p className="text-muted-foreground text-sm">
            {kras.length} KRAs and {live.length} KPIs so far. The library is built in the next step.
          </p>
        </div>
        <ul className="text-muted-foreground grid gap-2 text-sm">
          <li className="flex items-start gap-2">
            <Layers className="mt-0.5 size-4 shrink-0" aria-hidden />
            A list of KRAs to filter by, with add, rename, recolour and archive.
          </li>
          <li className="flex items-start gap-2">
            <ListChecks className="mt-0.5 size-4 shrink-0" aria-hidden />
            Every KPI with its inputs, evidence, status and version, and buttons to create, edit and duplicate.
          </li>
        </ul>
      </section>
      <PrototypeStageSwitch />
    </>
  );
}
