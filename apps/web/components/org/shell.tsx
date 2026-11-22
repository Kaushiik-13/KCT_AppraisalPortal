'use client';

import Link from 'next/link';
import { Building2, ShieldAlert, UserRound } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboarding } from './onboarding-context';
import { DesignNotesButton, PrototypeBanner, PrototypeControlsButton } from './prototype-tools';
import { ThemeToggle } from './ui-parts';

export function OrganizationShell({ children }: { children: React.ReactNode }) {
  const { profile, admin, sim, setSim } = useOnboarding();
  const institution = profile.name.trim() || 'Institution not set up';

  return (
    <div className="bg-background text-foreground min-h-screen">
      <PrototypeBanner />
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link href="/organization" className="text-lg font-semibold tracking-tight">
              AFPI
            </Link>
            {/* Persistent context: which institution and which role the user is acting in. */}
            <dl className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
              <div className="flex items-center gap-1.5">
                <Building2 className="size-4" aria-hidden />
                <dt className="sr-only">Institution</dt>
                <dd>{institution}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <UserRound className="size-4" aria-hidden />
                <dt className="sr-only">Signed in as</dt>
                <dd>{admin.fullName.trim() ? `${admin.fullName} · ` : ''}Organization administrator</dd>
              </div>
            </dl>
          </div>
          <div className="flex items-center gap-2">
            <DesignNotesButton />
            <PrototypeControlsButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8">
        {sim.accessDenied ? <AccessDenied /> : children}
      </main>

      <AlertDialog open={sim.sessionExpired}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your session has expired</AlertDialogTitle>
            <AlertDialogDescription>
              Sign in again to continue. Your setup draft is kept, and you will return to the page you were on.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSim({ sessionExpired: false })}>Sign in again (prototype)</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AccessDenied() {
  const { setSim } = useOnboarding();
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <ShieldAlert className="text-warning size-6" aria-hidden />
        <CardTitle>You do not have access to this page</CardTitle>
        <CardDescription>
          Your permissions may have changed. If you think this is a mistake, ask an organization administrator. This
          message does not say whether the page exists.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={() => setSim({ accessDenied: false })}>
          Restore access (prototype)
        </Button>
      </CardContent>
    </Card>
  );
}
