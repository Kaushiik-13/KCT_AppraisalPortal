// PROTOTYPE ONLY. Client-side checks used to show how validation and error
// states should behave. Final validation must run on the server.

import type { Person, Profile, Simulation } from './types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Mailboxes that are usually shared rather than personal.
const SHARED_PREFIXES = ['info', 'admin', 'office', 'contact', 'hr', 'principal', 'registrar', 'hod', 'support'];

export const isEmail = (value: string) => EMAIL.test(value.trim());

export function looksSharedMailbox(email: string) {
  const local = email.trim().toLowerCase().split('@')[0] ?? '';
  return SHARED_PREFIXES.includes(local);
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function validateProfile(p: Profile): FieldErrors<keyof Profile> {
  const errors: FieldErrors<keyof Profile> = {};
  if (!p.name.trim()) errors.name = 'Enter the institution name.';
  if (!p.type) errors.type = 'Choose the institution type.';
  if (!p.contactEmail.trim()) errors.contactEmail = 'Enter an official contact email.';
  else if (!isEmail(p.contactEmail)) errors.contactEmail = 'Enter a valid email address, for example office@college.edu.';
  if (!p.country) errors.country = 'Choose the country.';
  if (!p.timeZone) errors.timeZone = 'Choose the time zone.';
  return errors;
}

export function isProfileComplete(p: Profile) {
  return Object.keys(validateProfile(p)).length === 0;
}

export type AssignmentIssue = {
  id: string;
  kind: 'missing-supervisor' | 'self-review' | 'no-faculty';
  personId?: string;
  message: string;
};

// Blocking problems with role and supervisor assignment.
export function computeAssignmentIssues(people: Person[], sim: Simulation): AssignmentIssue[] {
  const issues: AssignmentIssue[] = [];
  const faculty = people.filter((p) => p.isFaculty);

  if (people.length > 0 && faculty.length === 0) {
    issues.push({
      id: 'no-faculty',
      kind: 'no-faculty',
      message: 'No one is assigned the faculty responsibility yet. Mark at least one person as faculty.',
    });
  }

  for (const person of faculty) {
    const supervisorId = effectiveSupervisorId(person, sim);
    if (!supervisorId) {
      issues.push({
        id: `missing-${person.id}`,
        kind: 'missing-supervisor',
        personId: person.id,
        message: `${person.name} has no supervisor assigned.`,
      });
    } else if (supervisorId === person.id) {
      issues.push({
        id: `self-${person.id}`,
        kind: 'self-review',
        personId: person.id,
        message: `${person.name} is set to review their own submissions. A person cannot review or release their own marks.`,
      });
    }
  }
  return issues;
}

// The self-review simulation forces the first faculty member to be their own
// supervisor so the conflict state can be reviewed.
export function effectiveSupervisorId(person: Person, sim: Simulation): string | null {
  if (sim.selfReviewConflict && person.isFaculty && person.isSupervisor) return person.id;
  return person.supervisorId;
}
