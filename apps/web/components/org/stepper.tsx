'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepStatus } from '@/lib/org/types';
import { STEPS, useOnboarding } from './onboarding-context';

const STATUS_TEXT: Record<StepStatus, string> = {
  complete: 'Done',
  current: 'Next up',
  upcoming: 'Not started',
  optional: 'Optional',
  skipped: 'Skipped',
};

export function Stepper() {
  const pathname = usePathname();
  const { stepStatus, canVisit } = useOnboarding();
  const activeIndex = Math.max(0, STEPS.findIndex((s) => pathname.endsWith(s.path.split('/').pop()!)));

  return (
    <nav aria-label="Setup steps">
      <p className="text-muted-foreground mb-3 text-sm md:hidden">
        Step {activeIndex + 1} of {STEPS.length}: <span className="text-foreground font-medium">{STEPS[activeIndex].label}</span>
      </p>
      <ol className="hidden gap-2 md:grid md:grid-cols-6">
        {STEPS.map((step, index) => {
          const status = stepStatus(step.key);
          const active = index === activeIndex;
          const reachable = canVisit(step.key);
          const body = (
            <>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs',
                  status === 'complete' && 'border-success/50 bg-success/10 text-success',
                  active && status !== 'complete' && 'border-primary bg-primary text-primary-foreground',
                )}
                aria-hidden
              >
                {status === 'complete' ? <Check className="size-3.5" /> : status === 'skipped' ? <Minus className="size-3.5" /> : index + 1}
              </span>
              <span className="grid text-left">
                <span className={cn('text-sm', active ? 'font-semibold' : 'font-medium')}>{step.label}</span>
                <span className="text-muted-foreground text-xs">{STATUS_TEXT[status]}</span>
              </span>
            </>
          );
          const base = 'flex items-center gap-2 rounded-lg border p-2.5';
          return (
            <li key={step.key}>
              {reachable ? (
                <Link
                  href={step.path}
                  aria-current={active ? 'step' : undefined}
                  className={cn(base, 'hover:bg-muted focus-visible:ring-ring/50 outline-none focus-visible:ring-3', active && 'border-primary')}
                >
                  {body}
                </Link>
              ) : (
                <div className={cn(base, 'text-muted-foreground opacity-60')} aria-disabled="true">
                  {body}
                  <span className="sr-only"> (finish earlier steps first)</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
