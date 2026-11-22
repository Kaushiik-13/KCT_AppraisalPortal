'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleAlert, Pencil } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NoticeBar, StepFooter, StepHeader } from '@/components/org/step-parts';
import { STEPS, useOnboarding } from '@/components/org/onboarding-context';
import { effectiveSupervisorId } from '@/lib/org/validation';
import type { StepKey } from '@/lib/org/types';

function Section({ title, step, children }: { title: string; step: StepKey; children: React.ReactNode }) {
  const path = STEPS.find((s) => s.key === step)!.path;
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={path}><Pencil aria-hidden data-icon="inline-start" /> Edit<span className="sr-only"> {title}</span></Link>
        </Button>
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const { profile, admin, units, unitsSkipped, people, issues, stepStatus, confirmSetup, sim } = useOnboarding();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  const missing = (['profile', 'account', 'people', 'roles'] as StepKey[]).filter((k) => stepStatus(k) !== 'complete');
  const blocked = missing.length > 0;
  const faculty = people.filter((p) => p.isFaculty);
  const supervisors = people.filter((p) => p.isSupervisor);

  return (
    <div className="grid gap-6">
      <StepHeader
        title="Review and finish"
        description="Check everything before you confirm. Confirming sends the invitations and is recorded in the audit history."
      />
      <NoticeBar />

      {blocked ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden />
          <AlertTitle>Setup is not ready to confirm</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {missing.map((k) => {
                const step = STEPS.find((s) => s.key === k)!;
                return (
                  <li key={k}>
                    <Link href={step.path} className="underline underline-offset-2">{step.label}</Link> is incomplete.
                  </li>
                );
              })}
              {issues.map((i) => <li key={i.id}>{i.message}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Institution" step="profile">
          <dl>
            <Row label="Name" value={profile.name || 'Not entered'} />
            <Row label="Type" value={profile.type || 'Not entered'} />
            <Row label="Contact email" value={profile.contactEmail || 'Not entered'} />
            <Row label="Country" value={profile.country || 'Not entered'} />
            <Row label="Time zone" value={profile.timeZone || 'Not entered'} />
          </dl>
        </Section>
        <Section title="Administrator" step="account">
          <dl>
            <Row label="Name" value={admin.fullName || 'Not entered'} />
            <Row label="Work email" value={admin.workEmail || 'Not entered'} />
            <Row label="Email" value={admin.verified ? 'Verified' : 'Not verified'} />
          </dl>
        </Section>
        <Section title="Structure" step="structure">
          {units.length > 0 ? (
            <p>{units.map((u) => u.name).join(', ')}</p>
          ) : (
            <p className="text-muted-foreground">{unitsSkipped ? 'Skipped. You can add units later.' : 'No units added.'}</p>
          )}
        </Section>
        <Section title="Employees and roles" step="roles">
          <dl>
            <Row label="Employees to invite" value={people.length} />
            <Row label="Faculty" value={faculty.length} />
            <Row label="Supervisors" value={supervisors.length} />
            <Row label="Faculty without a supervisor" value={faculty.filter((p) => !effectiveSupervisorId(p, sim)).length} />
          </dl>
        </Section>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Who reviews whom</CardTitle>
          <CardDescription>Supervisor assignments you are about to confirm.</CardDescription>
        </CardHeader>
        <CardContent>
          {faculty.length === 0 ? (
            <p className="text-muted-foreground text-sm">No faculty assigned yet.</p>
          ) : (
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              {faculty.map((f) => {
                const sup = people.find((p) => p.id === effectiveSupervisorId(f, sim));
                return (
                  <li key={f.id} className="flex justify-between gap-3 rounded-md border px-3 py-1.5">
                    <span>{f.name}</span>
                    <span className="text-muted-foreground">{sup ? sup.name : 'No supervisor'}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What happens when you confirm</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground grid gap-1 text-sm">
          <p>Invitations are sent to {people.length} employee{people.length === 1 ? '' : 's'}.</p>
          <p>Supervisor assignments take effect.</p>
          <p>An audit entry is recorded: who confirmed setup, when, and a summary of what was set up.</p>
          <p>You can then set up the appraisal cycle and KPIs in Framework Studio.</p>
        </CardContent>
      </Card>

      <StepFooter current="review" canContinue={false} />
      <div className="-mt-4 flex justify-end">
        <Button disabled={blocked || done} onClick={() => setOpen(true)}>
          Confirm setup and send invitations
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm setup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send {people.length} invitation{people.length === 1 ? '' : 's'} and apply the supervisor
              assignments. Prototype: nothing is actually sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDone(true);
                confirmSetup();
                router.push('/organization');
              }}
            >
              Confirm and send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
