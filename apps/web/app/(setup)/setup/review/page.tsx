'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, CircleAlert, MailCheck, Pencil, Send } from 'lucide-react';
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
import { colorOf } from '@/lib/department-colors';
import { useSetup } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const initials = (n: string) =>
  n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 py-6 first:pt-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button asChild size="sm" variant="ghost">
          <Link href={href}>
            <Pencil aria-hidden data-icon="inline-start" /> Edit
          </Link>
        </Button>
      </div>
      {children}
    </section>
  );
}

function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-4 border-b border-dashed pb-2">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-right font-medium">{v || <span className="text-muted-foreground font-normal">Not set</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const { organization: o, departments, employees, config, invitesSent, sendInvitations, resetAll } = useSetup();
  const [confirming, setConfirming] = useState(false);

  const reviewers = employees.filter((e) => e.isReviewer);
  const withoutReviewer = employees.filter((e) => !e.isReviewer && !e.reviewerId);
  const noEmail = employees.filter((e) => !e.email.trim());
  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? 'No department';

  const checks: { ok: boolean; text: string; href: string }[] = [
    { ok: !!o.name.trim(), text: o.name.trim() ? `Organization: ${o.name}` : 'Organization name is empty', href: '/setup/organization' },
    { ok: employees.length > 0, text: employees.length > 0 ? `${employees.length} ${employees.length === 1 ? 'person' : 'people'} will be invited` : 'No employees added', href: '/setup/employees' },
    { ok: noEmail.length === 0, text: noEmail.length === 0 ? 'Everyone has an email address' : `${noEmail.length} ${noEmail.length === 1 ? 'person has' : 'people have'} no email address`, href: '/setup/employees' },
    { ok: reviewers.length > 0, text: reviewers.length > 0 ? `${reviewers.length} ${reviewers.length === 1 ? 'reviewer' : 'reviewers'} chosen` : 'No reviewers chosen', href: '/setup/roles' },
    { ok: withoutReviewer.length === 0, text: withoutReviewer.length === 0 ? 'Everyone has a reviewer' : `${withoutReviewer.length} ${withoutReviewer.length === 1 ? 'person has' : 'people have'} no reviewer`, href: '/setup/roles' },
  ];
  const issues = checks.filter((c) => !c.ok).length;

  if (invitesSent) {
    return (
      <>
        <div className="grid justify-items-start gap-3">
          <span className="bg-success/10 text-success grid size-12 place-items-center rounded-full">
            <MailCheck aria-hidden className="size-6" />
          </span>
          <div className="grid gap-1">
            <h2 className="text-xl font-semibold tracking-tight">Invitations sent</h2>
            <p className="text-muted-foreground text-sm">
              {employees.length} {employees.length === 1 ? 'invitation was' : 'invitations were'} sent. Each one expires after {config.inviteExpiryDays} days
              {config.reminders === 'off' ? '.' : `, and reminders go out ${config.reminders === 'weekly' ? 'weekly' : 'every 3 days'}.`}
            </p>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="text-muted-foreground flex items-center gap-3 border-b px-3 py-2 text-xs">
            <span className="flex-1">Person</span>
            <span className="hidden w-40 sm:block">Department</span>
            <span className="w-24">Status</span>
          </div>
          <ul className="divide-y">
            {employees.map((e) => {
              const d = departments.find((x) => x.id === e.departmentId);
              const c = d ? colorOf(d.color) : null;
              return (
                <li key={e.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full border border-black/5 text-xs font-medium"
                    style={c ? { backgroundColor: c.bg, color: c.fg } : undefined}
                  >
                    {initials(e.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{e.name || '(no name)'}</div>
                    <div className="text-muted-foreground truncate text-xs">{e.email || '(no email)'}</div>
                  </div>
                  <span className="text-muted-foreground hidden w-40 truncate text-sm sm:block">{deptName(e.departmentId)}</span>
                  <span className="flex w-24 items-center gap-2 text-sm">
                    <span className="bg-info size-2 rounded-full" /> Invited
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-muted/50 rounded-lg border px-4 py-3 text-sm">
          <p className="font-medium">What happens next</p>
          <p className="text-muted-foreground mt-1">
            People accept their invitation and set up their account. You can then set up appraisal cycles, KPIs and scoring in Framework Studio. That module is not part of this prototype.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <Button variant="outline" size="lg" asChild>
            <Link href="/setup/organization">
              <ArrowLeft aria-hidden data-icon="inline-start" /> Review setup
            </Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              resetAll();
              router.push('/signup');
            }}
          >
            Start the demo over
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold tracking-tight">Review and finish</h2>
        <p className="text-muted-foreground text-sm">
          Check everything below. Nobody is emailed until you send the invitations.
        </p>
      </div>

      {/* Checks */}
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <h3 className="text-sm font-semibold">Checks</h3>
          <span className={cn('text-xs', issues > 0 ? 'text-warning' : 'text-success')}>
            {issues > 0 ? `${issues} to look at. You can still continue.` : 'All good'}
          </span>
        </div>
        <ul className="divide-y">
          {checks.map((c) => (
            <li key={c.text} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              {c.ok ? (
                <Check aria-hidden className="text-success size-4 shrink-0" />
              ) : (
                <CircleAlert aria-hidden className="text-warning size-4 shrink-0" />
              )}
              <span className="flex-1">{c.text}</span>
              {c.ok ? null : (
                <Button asChild size="sm" variant="ghost">
                  <Link href={c.href}>Fix</Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      <div className="divide-y">
        <Section title="Organization" href="/setup/organization">
          <Facts
            rows={[
              ['Name', o.name],
              ['Type', o.type],
              ['Employees', o.size],
              ['Location', [o.city, o.country].filter(Boolean).join(', ')],
              ['Contact email', o.contactEmail],
              ['Website', o.website],
            ]}
          />
        </Section>

        <Section title={`Departments (${departments.length})`} href="/setup/departments">
          {departments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No departments. Everyone stays in one group.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {departments.map((d) => {
                const c = colorOf(d.color);
                const n = employees.filter((e) => e.departmentId === d.id).length;
                return (
                  <li key={d.id} className="inline-flex items-center gap-2 rounded-md border py-1 pr-2.5 pl-1 text-sm">
                    <span className="grid size-6 place-items-center rounded-[4px] text-[10px] font-semibold" style={{ backgroundColor: c.bg, color: c.fg }}>
                      {(d.code || d.name).slice(0, 3).toUpperCase()}
                    </span>
                    {d.name}
                    <span className="text-muted-foreground">{n}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title={`Employees (${employees.length})`} href="/setup/employees">
          {employees.length === 0 ? (
            <p className="text-muted-foreground text-sm">No employees added yet.</p>
          ) : (
            <ul className="text-sm">
              {employees.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-4 border-b border-dashed py-1.5 last:border-0">
                  <span className="truncate">
                    <span className="font-medium">{e.name || '(no name)'}</span>
                    <span className="text-muted-foreground"> · {e.email || 'no email'}</span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">{deptName(e.departmentId)}</span>
                </li>
              ))}
              {employees.length > 5 ? <li className="text-muted-foreground pt-2 text-xs">and {employees.length - 5} more</li> : null}
            </ul>
          )}
        </Section>

        <Section title="Roles and reviewers" href="/setup/roles">
          {reviewers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reviewers chosen yet.</p>
          ) : (
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {reviewers.map((r) => {
                const n = employees.filter((e) => e.reviewerId === r.id).length;
                return (
                  <li key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground text-xs">reviews {n} {n === 1 ? 'person' : 'people'}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title="Configuration" href="/setup/configuration">
          <Facts
            rows={[
              ['Time zone', config.timeZone],
              ['Appraisal year starts', MONTHS[config.yearStartMonth - 1]],
              ['Date format', config.dateFormat],
              ['Language', config.language],
              ['Invitation expires after', `${config.inviteExpiryDays} days`],
              ['Sign-in', config.signIn === 'both' ? 'Password or single sign-on' : config.signIn === 'sso' ? 'Single sign-on' : 'Password'],
              ['Two-step verification', config.twoStep ? 'Required' : 'Off'],
              ['Allowed domains', config.allowedDomains.length ? config.allowedDomains.join(', ') : 'Any'],
              ['Maximum file size', `${config.maxFileMb} MB`],
              ['Keep records for', config.retentionYears === 0 ? 'Until deleted' : `${config.retentionYears} years`],
            ]}
          />
        </Section>
      </div>

      {/* Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <Button variant="outline" size="lg" onClick={() => router.push('/setup/configuration')}>
          <ArrowLeft aria-hidden data-icon="inline-start" /> Back
        </Button>
        <Button size="lg" onClick={() => setConfirming(true)}>
          <Send aria-hidden data-icon="inline-start" /> Send {employees.length} {employees.length === 1 ? 'invitation' : 'invitations'}
        </Button>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send {employees.length} {employees.length === 1 ? 'invitation' : 'invitations'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Each person gets an email to join {o.name.trim() || 'your organization'}. Emails cannot be unsent.
              {issues > 0 ? ` ${issues} ${issues === 1 ? 'check still needs' : 'checks still need'} your attention, but you can send anyway.` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                sendInvitations();
                setConfirming(false);
              }}
            >
              Send invitations
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
