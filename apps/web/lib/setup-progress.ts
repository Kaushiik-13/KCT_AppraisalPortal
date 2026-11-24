'use client';

import { useSetup } from '@/lib/setup-store';

export type AttentionItem = { id: string; tone: 'warning' | 'danger'; text: string; action: string; href: string };

/** Setup progress and the "needs attention" list, derived from the prototype's setup data. */
export function useSetupProgress() {
  const { organization, departments, employees, invitesSent } = useSetup();
  const reviewers = employees.filter((e) => e.isReviewer).length;
  const noReviewer = employees.filter((e) => !e.reviewerId && !e.isReviewer).length;
  // Prototype demo logic: once everything is assigned and sent, everyone counts as joined.
  const allDone = invitesSent && noReviewer === 0;

  const steps = [
    Boolean(organization.name),
    departments.length > 0,
    employees.length > 0,
    reviewers > 0 && noReviewer === 0,
    true,
    invitesSent,
  ];
  const done = steps.filter(Boolean).length;

  const attention: AttentionItem[] = [];
  if (!invitesSent)
    attention.push({ id: 'send', tone: 'warning', text: `${employees.length} invitations not sent`, action: 'Send', href: '/setup/review' });
  if (noReviewer > 0)
    attention.push({
      id: 'reviewer',
      tone: 'warning',
      text: `${noReviewer} ${noReviewer === 1 ? 'person has' : 'people have'} no reviewer`,
      action: 'Assign',
      href: '/setup/roles',
    });
  if (invitesSent && !allDone)
    attention.push({ id: 'expired', tone: 'danger', text: '1 invitation expired', action: 'Resend', href: '/invitations' });

  return { done, total: steps.length, complete: done === steps.length, attention, allDone, reviewers, noReviewer };
}
