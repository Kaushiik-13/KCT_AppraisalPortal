'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { SETUP_STEPS } from '@/lib/setup-steps';
import { SetupProvider } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = Math.max(0, SETUP_STEPS.findIndex((s) => s.path === pathname));
  const isLast = current === SETUP_STEPS.length - 1;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-card flex h-12 items-center justify-between border-b px-5">
        <Brand />
        <span className="text-muted-foreground text-xs">
          Step {current + 1} of {SETUP_STEPS.length}
        </span>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 pt-8">
        <h1 className="text-2xl font-semibold tracking-tight">Organization onboarding</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Complete these {SETUP_STEPS.length} steps to get your organization ready. Nobody is emailed until the final review.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-5 py-8 grid-cols-[minmax(0,1fr)] md:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Setup steps" className="min-w-0 md:sticky md:top-10 md:self-start">
          <div className="grid gap-2 md:hidden">
            <div className="flex gap-1" aria-hidden>
              {SETUP_STEPS.map((s, i) => (
                <span key={s.path} className={cn('h-1 flex-1 rounded-full', i <= current ? 'bg-primary' : 'bg-border')} />
              ))}
            </div>
            <p className="text-sm">
              <span className="text-muted-foreground">
                Step {current + 1} of {SETUP_STEPS.length}:
              </span>{' '}
              <span className="font-medium">{SETUP_STEPS[current].label}</span>
            </p>
          </div>
          <ol className="hidden md:grid">
            {SETUP_STEPS.map((s, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li key={s.path} className="relative md:pb-6 md:last:pb-0">
                  {i < SETUP_STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className={cn('absolute top-6 left-[11px] hidden h-[calc(100%-1.5rem)] w-px md:block', done ? 'bg-primary' : 'bg-border')}
                    />
                  ) : null}
                  <Link
                    href={s.path}
                    aria-current={active ? 'step' : undefined}
                    className="flex items-start gap-3 whitespace-nowrap md:whitespace-normal"
                  >
                    <span
                      className={cn(
                        'bg-background relative z-10 grid size-6 shrink-0 place-items-center rounded-full border text-xs font-medium',
                        done && 'bg-primary text-primary-foreground border-primary',
                        active && 'border-primary text-primary ring-primary/20 ring-4',
                        !done && !active && 'text-muted-foreground',
                      )}
                    >
                      {done ? <Check aria-hidden className="size-3.5" /> : i + 1}
                    </span>
                    <span className="grid gap-0.5 leading-tight">
                      <span className={cn('text-sm', active ? 'font-medium' : done ? '' : 'text-muted-foreground')}>{s.label}</span>
                      <span className="text-muted-foreground hidden text-xs md:block">{s.hint}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <main className="grid min-w-0 content-start gap-8">
          <SetupProvider>{children}</SetupProvider>
          {isLast ? null : (
            <div className="flex items-center justify-between border-t pt-5">
              <Button
                variant="outline"
                size="lg"
                disabled={current === 0}
                onClick={() => router.push(SETUP_STEPS[current - 1].path)}
              >
                <ArrowLeft aria-hidden data-icon="inline-start" /> Back
              </Button>
              <Button size="lg" onClick={() => router.push(SETUP_STEPS[current + 1].path)}>
                {current === 1 ? 'Continue or skip' : 'Continue'} <ArrowRight aria-hidden data-icon="inline-end" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
