// PROTOTYPE ONLY. These types describe what the onboarding screens show and
// collect. They are NOT an approved data model, schema or API contract.

export type Profile = {
  name: string;
  type: string;
  contactEmail: string;
  country: string;
  timeZone: string;
};

export type AdminAccount = {
  fullName: string;
  workEmail: string;
  codeSent: boolean;
  verified: boolean;
};

export type UnitKind = 'Department' | 'School' | 'Other';

export type Unit = {
  id: string;
  name: string;
  kind: UnitKind;
};

// 'draft' = staged in setup, not yet invited. The rest apply after the
// administrator confirms setup.
export type InviteStatus = 'draft' | 'invited' | 'accepted';

// What the screen displays after applying any simulated delivery problems.
export type DisplayInviteStatus = InviteStatus | 'expired' | 'failed';

export type Person = {
  id: string;
  name: string;
  email: string;
  unitId: string | null;
  inviteStatus: InviteStatus;
  // True once the administrator has resent/retried, so a simulated
  // expiry or failure no longer applies to this person.
  resent: boolean;
  isFaculty: boolean;
  isSupervisor: boolean;
  supervisorId: string | null;
};

// Switches on the prototype panel that force edge-case states for review.
export type Simulation = {
  sessionExpired: boolean;
  accessDenied: boolean;
  loadingRoster: boolean;
  expiredInvites: boolean;
  failedInvite: boolean;
  selfReviewConflict: boolean;
};

export type StepKey =
  | 'profile'
  | 'account'
  | 'structure'
  | 'people'
  | 'roles'
  | 'review';

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'optional' | 'skipped';
