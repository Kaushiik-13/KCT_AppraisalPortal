'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, TriangleAlert, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { STEPS, useOnboarding } from './onboarding-context';
import type { StepKey } from '@/lib/org/types';

export function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground max-w-2xl text-sm">{description}</p>
    </div>
  );
}

export function NoticeBar() {
  const { notice, clearNotice } = useOnboarding();
  if (!notice) return null;
  return (
    <Alert className="border-warning/40">
      <TriangleAlert aria-hidden />
      <AlertTitle>Assignment changed</AlertTitle>
      <AlertDescription>
        <p>{notice}</p>
        <Button variant="ghost" size="xs" className="mt-2" onClick={clearNotice}>
          <X aria-hidden data-icon="inline-start" /> Dismiss
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// Back / save for later / continue. "Save for later" is explicit that the
// prototype does not actually save anything.
export function StepFooter({
  current,
  canContinue,
  continueLabel = 'Continue',
  onContinue,
  blockedReason,
}: {
  current: StepKey;
  canContinue: boolean;
  continueLabel?: string;
  onContinue?: () => boolean | void;
  blockedReason?: string;
}) {
  const router = useRouter();
  const index = STEPS.findIndex((s) => s.key === current);
  const prev = STEPS[index - 1];
  const next = STEPS[index + 1];

  return (
    <div className="border-t pt-4">
      {!canContinue && blockedReason ? (
        <p className="text-muted-foreground mb-3 text-sm" role="status">
          {blockedReason}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {prev ? (
          <Button variant="outline" asChild>
            <Link href={prev.path}>
              <ArrowLeft aria-hidden data-icon="inline-start" /> Back
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/organization">Back to setup home</Link>
          </Button>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/organization">Save and finish later</Link>
          </Button>
          {next ? (
            <Button
              disabled={!canContinue}
              onClick={() => {
                if (onContinue && onContinue() === false) return;
                router.push(next.path);
              }}
            >
              {continueLabel} <ArrowRight aria-hidden data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      </div>
      <p className="text-muted-foreground mt-3 text-xs">
        Prototype note: "Save and finish later" returns to setup home. A real build would store a draft that survives
        reloads and sign-out.
      </p>
    </div>
  );
}
