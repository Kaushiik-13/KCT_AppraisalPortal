'use client';

import { FlaskConical } from 'lucide-react';
import { Segmented } from '@/components/settings-rows';
import { useFrameworkLibrary, type DemoStage } from '@/lib/frameworks/use-framework-library';

const STAGES: { value: DemoStage; label: string }[] = [
  { value: 'empty', label: 'Nothing built' },
  { value: 'built', label: 'Framework built' },
  { value: 'active', label: 'Cycle running' },
];

/** Prototype-only control to preview each state of a Frameworks screen. Not part of the product. */
export function PrototypeStageSwitch({ children }: { children?: React.ReactNode }) {
  const { stage, setStage } = useFrameworkLibrary();
  return (
    <aside aria-label="Prototype view" className="grid gap-3 rounded-lg border border-dashed p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <FlaskConical className="size-3.5" aria-hidden /> Prototype view
        </span>
        <div className="w-full max-w-md">
          <Segmented label="Preview state" value={stage} onChange={setStage} items={STAGES} />
        </div>
      </div>
      {children}
    </aside>
  );
}
