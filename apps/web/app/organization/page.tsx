'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, ClipboardList, Lightbulb, Lock, RotateCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { STEPS, useOnboarding } from '@/components/org/onboarding-context';
import { InviteBadge, ToneBadge } from '@/components/org/ui-parts';
import type { StepStatus } from '@/lib/org/types';

const STATUS_LABEL: Record<StepStatus, string> = {
  complete: 'Done',
  current: 'Next up',
  upcoming: 'Not started',
  optional: 'Optional',
  skipped: 'Skipped',
};

const MODULES = [
  { icon: ClipboardList, name: 'Appraisal cycle and KPIs', owner: 'Framework Studio', text: 'Create the cycle, KPIs and KRAs, evidence requirements and scoring rules.' },
  { icon: Brain, name: 'Prediction workspace', owner: 'Prediction', text: 'Build, evaluate and publish prediction models for your institution.' },
  { icon: Lightbulb, name: 'Recommendation workspace', owner: 'Recommendation', text: 'Build, evaluate and publish recommendations for your institution.' },
  { icon: BarChart3, name: 'Institution analytics', owner: 'Analytics', text: 'See KPI, KRA and faculty performance across the institution.' },
];

export default function OrganizationHome() {
  const { confirmed, started, stepStatus, firstIncomplete, profile, people, units, displayStatus, resendInvite } = useOnboarding();
  const next = firstIncomplete();

  if (!started && !confirmed) {
    return (
      <div className="mx-auto grid max-w-xl gap-6 py-10 text-center">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Set up your institution</h1>
          <p className="text-muted-foreground">
            It takes six short steps: your institution, your administrator account, optional departments, your
            employees, their roles, and a final review. You can stop and come back at any time.
          </p>
        </div>
        <div>
          <Button size="lg" asChild>
            <Link href={STEPS[0].path}>Start setup <ArrowRight aria-hidden data-icon="inline-end" /></Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Reviewing the prototype? Open <strong>Prototype controls</strong> at the top to fill in sample data.
        </p>
      </div>
    );
  }

  if (!confirmed) {
    return (
      <div className="grid max-w-3xl gap-6">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Continue setting up {profile.name.trim() || 'your institution'}</h1>
          <p className="text-muted-foreground text-sm">Setup is not finished, so nothing has been sent to employees yet.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Setup progress</CardTitle>
            <CardDescription>
              {STEPS.filter((s) => stepStatus(s.key) === 'complete').length} of {STEPS.length} steps done
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="divide-y rounded-md border">
              {STEPS.map((s) => {
                const status = stepStatus(s.key);
                return (
                  <li key={s.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <span className="text-sm font-medium">{s.label}</span>
                    <ToneBadge tone={status === 'complete' ? 'success' : status === 'current' ? 'info' : 'muted'}>
                      {STATUS_LABEL[status]}
                    </ToneBadge>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
        <div>
          <Button size="lg" asChild>
            <Link href={(next ?? STEPS[STEPS.length - 1]).path}>
              {next ? `Continue: ${next.label}` : 'Go to review'} <ArrowRight aria-hidden data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const rows = people.map((p, i) => ({ p, status: displayStatus(p, i) }));
  const problems = rows.filter((r) => r.status === 'failed' || r.status === 'expired');

  return (
    <div className="grid gap-8">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
        <p className="text-muted-foreground text-sm">
          Setup is confirmed. {people.length} employee{people.length === 1 ? '' : 's'} invited across {units.length} unit{units.length === 1 ? '' : 's'}.
        </p>
      </div>

      {problems.length > 0 ? (
        <Alert variant="destructive">
          <RotateCw aria-hidden />
          <AlertTitle>{problems.length} invitation{problems.length === 1 ? '' : 's'} need attention</AlertTitle>
          <AlertDescription>Resend them below. Employees with a delivery problem cannot join until the invitation is resent.</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-3" aria-labelledby="next-heading">
        <h2 id="next-heading" className="text-lg font-semibold">Next steps</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODULES.map((m) => (
            <Card key={m.name}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <m.icon className="text-muted-foreground size-5" aria-hidden />
                  <ToneBadge tone="muted"><Lock aria-hidden /> Not in this prototype</ToneBadge>
                </div>
                <CardTitle>{m.name}</CardTitle>
                <CardDescription>{m.text}</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-xs">Owned by {m.owner}. Entry point only.</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-3" aria-labelledby="invites-heading">
        <h2 id="invites-heading" className="text-lg font-semibold">Invitations</h2>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ p, status }) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell><InviteBadge status={status} /></TableCell>
                  <TableCell>
                    {status === 'failed' || status === 'expired' ? (
                      <Button variant="outline" size="sm" onClick={() => resendInvite(p.id)}>
                        {status === 'failed' ? 'Retry' : 'Resend'}<span className="sr-only"> invitation to {p.name}</span>
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
