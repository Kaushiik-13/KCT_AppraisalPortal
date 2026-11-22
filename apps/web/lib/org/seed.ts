// PROTOTYPE ONLY. Sample data so reviewers can see populated screens.

import type { AdminAccount, Person, Profile, Simulation, Unit } from './types';

export const INSTITUTION_TYPES = [
  'University',
  'Autonomous college',
  'Affiliated college',
  'Polytechnic',
  'School',
  'Other',
];

export const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore', 'Other'];

export const TIME_ZONES = [
  'Asia/Kolkata (UTC+05:30)',
  'Asia/Dubai (UTC+04:00)',
  'Asia/Singapore (UTC+08:00)',
  'Europe/London (UTC+00:00)',
  'America/New_York (UTC-05:00)',
];

export const emptyProfile: Profile = { name: '', type: '', contactEmail: '', country: '', timeZone: '' };
export const emptyAdmin: AdminAccount = { fullName: '', workEmail: '', codeSent: false, verified: false };
export const noSimulation: Simulation = {
  sessionExpired: false,
  accessDenied: false,
  loadingRoster: false,
  expiredInvites: false,
  failedInvite: false,
  selfReviewConflict: false,
};

export const sampleProfile: Profile = {
  name: 'Sample Institute of Technology',
  type: 'Autonomous college',
  contactEmail: 'office@sample-institute.edu',
  country: 'India',
  timeZone: 'Asia/Kolkata (UTC+05:30)',
};

export const sampleAdmin: AdminAccount = {
  fullName: 'Priya Raman',
  workEmail: 'priya.raman@sample-institute.edu',
  codeSent: true,
  verified: true,
};

export const sampleUnits: Unit[] = [
  { id: 'u-cs', name: 'Computer Science', kind: 'Department' },
  { id: 'u-me', name: 'Mechanical', kind: 'Department' },
  { id: 'u-sh', name: 'Science and Humanities', kind: 'School' },
];

const person = (
  n: number,
  name: string,
  unitId: string,
  isFaculty: boolean,
  isSupervisor: boolean,
  supervisorId: string | null,
): Person => ({
  id: `p-${n}`,
  name,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/\.$/, '')}@sample-institute.edu`,
  unitId,
  inviteStatus: 'draft',
  resent: false,
  isFaculty,
  isSupervisor,
  supervisorId,
});

export const samplePeople: Person[] = [
  person(1, 'Dr. Meera Nair', 'u-cs', true, true, 'p-5'),
  person(2, 'Arun Prakash', 'u-cs', true, false, 'p-1'),
  person(3, 'Divya Menon', 'u-cs', true, false, 'p-1'),
  person(4, 'Karthik S', 'u-me', true, false, 'p-5'),
  person(5, 'Dr. Lakshmi Rao', 'u-me', false, true, null),
  person(6, 'Sana Iqbal', 'u-sh', true, false, 'p-5'),
];
