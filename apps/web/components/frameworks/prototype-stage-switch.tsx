'use client';

import type { ReactNode } from 'react';
import { FlaskConical } from 'lucide-react';
import { Toggle } from '@/components/settings-rows';
import { useDemoViewer, useFrameworkLibrary, type DemoStage, type DemoViewer } from '@/lib/frameworks/use-framework-library';

const STAGES: { value: DemoStage; label: string }[] = [
  { value: 'empty', label: 'Nothing built' },
  { value: 'built', label: 'Framework built' },
  { value: 'active', label: 'Cycle running' },
];
const VIEWERS: { value: DemoViewer; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'reviewer', label: 'Reviewer' },
];

/** Prototype-only control to preview each state of a Frameworks screen, as an admin or a reviewer. Not part of the product. */
export function PrototypeStageSwitch({ children }: { children?: ReactNode }) {
  const { stage, setStage } = useFrameworkLibrary();
  const { viewer, setViewer } = useDemoViewer();
  return (
    <aside aria-label="Prototype view" className="grid min-w-0 gap-3 rounded-lg border border-dashed p-4">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <FlaskConical className="size-3.5 shrink-0" aria-hidden /> Prototype view: preview other states. Not part of the product.
      </span>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Preview state">
          {STAGES.map((s) => (
            <Toggle key={s.value} on={stage === s.value} onClick={() => setStage(s.value)}>
              {s.label}
            </Toggle>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="View as">
          {VIEWERS.map((v) => (
            <Toggle key={v.value} on={viewer === v.value} onClick={() => setViewer(v.value)}>
              {v.label}
            </Toggle>
          ))}
        </div>
      </div>
      {children}
    </aside>
  );
}
