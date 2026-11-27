'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FrameworksEmptyProps = {
  /** Admins can build; others only read. The caller decides, this component never checks roles. */
  canBuild: boolean;
  onStartFromTemplate?: () => void;
  onCreateFromScratch?: () => void;
};

/** Shown on Frameworks screens when no KRAs or KPIs exist yet: say what is missing and offer the next step. */
export function FrameworksEmpty({ canBuild, onStartFromTemplate, onCreateFromScratch }: FrameworksEmptyProps) {
  return (
    <section className="grid place-items-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center">
      <div className="grid max-w-md gap-1">
        <h2 className="text-base font-medium">No KRAs or KPIs yet</h2>
        <p className="text-muted-foreground text-sm">
          {canBuild
            ? 'Start with a KRA, an area of work such as Teaching, then add the KPIs people are appraised on.'
            : 'Nothing has been published for this cycle yet.'}
        </p>
      </div>
      {canBuild && (
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={onCreateFromScratch} disabled={!onCreateFromScratch}>
            <Plus aria-hidden data-icon="inline-start" /> New KRA
          </Button>
          <Button size="sm" variant="outline" onClick={onStartFromTemplate} disabled={!onStartFromTemplate}>
            Use a template
          </Button>
        </div>
      )}
    </section>
  );
}
