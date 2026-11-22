'use client';

// PROTOTYPE ONLY. All data lives in memory and is lost on reload. Nothing is
// saved, sent, authenticated or authorized.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  emptyAdmin,
  emptyProfile,
  noSimulation,
  sampleAdmin,
  sampleProfile,
  samplePeople,
  sampleUnits,
} from '@/lib/org/seed';
import {
  computeAssignmentIssues,
  isEmail,
  isProfileComplete,
  type AssignmentIssue,
} from '@/lib/org/validation';
import type {
  AdminAccount,
  DisplayInviteStatus,
  Person,
  Profile,
  Simulation,
  StepKey,
  StepStatus,
  Unit,
  UnitKind,
} from '@/lib/org/types';

export const STEPS: { key: StepKey; label: string; path: string; optional?: boolean }[] = [
  { key: 'profile', label: 'Institution', path: '/organization/onboarding/profile' },
  { key: 'account', label: 'Administrator', path: '/organization/onboarding/account' },
  { key: 'structure', label: 'Structure', path: '/organization/onboarding/structure', optional: true },
  { key: 'people', label: 'Employees', path: '/organization/onboarding/people' },
  { key: 'roles', label: 'Roles', path: '/organization/onboarding/roles' },
  { key: 'review', label: 'Review', path: '/organization/onboarding/review' },
];

type NewPerson = Pick<Person, 'name' | 'email' | 'unitId'> & Partial<Pick<Person, 'isFaculty' | 'isSupervisor'>>;

type Ctx = {
  profile: Profile;
  setProfile: (p: Profile) => void;
  admin: AdminAccount;
  setAdmin: (patch: Partial<AdminAccount>) => void;
  units: Unit[];
  addUnit: (name: string, kind: UnitKind) => string | null;
  removeUnit: (id: string) => void;
  unitsSkipped: boolean;
  setUnitsSkipped: (v: boolean) => void;
  people: Person[];
  addPerson: (p: NewPerson) => string | null;
  addPeople: (list: NewPerson[]) => void;
  removePerson: (id: string) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  displayStatus: (p: Person, index: number) => DisplayInviteStatus;
  resendInvite: (id: string) => void;
  issues: AssignmentIssue[];
  notice: string | null;
  clearNotice: () => void;
  confirmed: boolean;
  confirmSetup: () => void;
  stepStatus: (key: StepKey) => StepStatus;
  canVisit: (key: StepKey) => boolean;
  firstIncomplete: () => (typeof STEPS)[number] | null;
  started: boolean;
  sim: Simulation;
  setSim: (patch: Partial<Simulation>) => void;
  loadSampleSetup: (complete: boolean) => void;
  resetAll: () => void;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}

let counter = 100;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [admin, setAdminState] = useState<AdminAccount>(emptyAdmin);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitsSkipped, setUnitsSkipped] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sim, setSimState] = useState<Simulation>(noSimulation);

  const setAdmin = useCallback((patch: Partial<AdminAccount>) => setAdminState((a) => ({ ...a, ...patch })), []);
  const setSim = useCallback((patch: Partial<Simulation>) => setSimState((s) => ({ ...s, ...patch })), []);

  const addUnit = useCallback(
    (name: string, kind: UnitKind) => {
      const trimmed = name.trim();
      if (!trimmed) return 'Enter a name for the unit.';
      if (units.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) return `"${trimmed}" already exists.`;
      setUnits((list) => [...list, { id: nextId('u'), name: trimmed, kind }]);
      setUnitsSkipped(false);
      return null;
    },
    [units],
  );

  const removeUnit = useCallback((id: string) => {
    setUnits((list) => list.filter((u) => u.id !== id));
    setPeople((list) => list.map((p) => (p.unitId === id ? { ...p, unitId: null } : p)));
  }, []);

  const toPerson = (p: NewPerson): Person => ({
    id: nextId('p'),
    name: p.name.trim(),
    email: p.email.trim(),
    unitId: p.unitId,
    inviteStatus: 'draft',
    resent: false,
    isFaculty: p.isFaculty ?? false,
    isSupervisor: p.isSupervisor ?? false,
    supervisorId: null,
  });

  const addPerson = useCallback(
    (p: NewPerson) => {
      if (!p.name.trim()) return 'Enter the employee name.';
      if (!isEmail(p.email)) return 'Enter a valid work email address.';
      if (people.some((x) => x.email.toLowerCase() === p.email.trim().toLowerCase())) {
        return 'An employee with this email is already in setup.';
      }
      setPeople((list) => [...list, toPerson(p)]);
      return null;
    },
    [people],
  );

  const addPeople = useCallback((list: NewPerson[]) => {
    setPeople((current) => [...current, ...list.map(toPerson)]);
  }, []);

  const removePerson = useCallback((id: string) => {
    setPeople((list) => list.filter((p) => p.id !== id).map((p) => (p.supervisorId === id ? { ...p, supervisorId: null } : p)));
  }, []);

  const updatePerson = useCallback(
    (id: string, patch: Partial<Person>) => {
      const target = people.find((p) => p.id === id);
      let next = people.map((p) => (p.id === id ? { ...p, ...patch } : p));

      // Removing the supervisor responsibility clears everyone assigned to that person.
      if (target?.isSupervisor && patch.isSupervisor === false) {
        const affected = next.filter((p) => p.supervisorId === id);
        if (affected.length > 0) {
          next = next.map((p) => (p.supervisorId === id ? { ...p, supervisorId: null } : p));
          setNotice(
            `${target.name} is no longer a supervisor, so ${affected.length} faculty member${affected.length === 1 ? '' : 's'} lost their supervisor assignment. Assign a new supervisor to continue.`,
          );
        }
      }
      // A person who is no longer faculty has no supervisor to keep.
      if (patch.isFaculty === false) {
        next = next.map((p) => (p.id === id ? { ...p, supervisorId: null } : p));
      }
      setPeople(next);
    },
    [people],
  );

  const displayStatus = useCallback(
    (p: Person, index: number): DisplayInviteStatus => {
      if (p.inviteStatus !== 'invited' || p.resent) return p.inviteStatus;
      if (sim.failedInvite && index === 0) return 'failed';
      if (sim.expiredInvites && index % 3 === 1) return 'expired';
      return 'invited';
    },
    [sim],
  );

  const resendInvite = useCallback((id: string) => {
    setPeople((list) => list.map((p) => (p.id === id ? { ...p, inviteStatus: 'invited', resent: true } : p)));
  }, []);

  const issues = useMemo(() => computeAssignmentIssues(people, sim), [people, sim]);

  const confirmSetup = useCallback(() => {
    setConfirmed(true);
    setPeople((list) => list.map((p) => ({ ...p, inviteStatus: p.inviteStatus === 'draft' ? 'invited' : p.inviteStatus })));
  }, []);

  const complete = useMemo<Record<StepKey, boolean>>(
    () => ({
      profile: isProfileComplete(profile),
      account: admin.verified && admin.fullName.trim().length > 0 && isEmail(admin.workEmail),
      structure: units.length > 0 || unitsSkipped,
      people: people.length > 0,
      roles: people.length > 0 && issues.length === 0,
      review: confirmed,
    }),
    [profile, admin, units, unitsSkipped, people, issues, confirmed],
  );

  const requiredBefore = useCallback(
    (key: StepKey) => {
      const idx = STEPS.findIndex((s) => s.key === key);
      return STEPS.slice(0, idx).every((s) => s.optional || complete[s.key]);
    },
    [complete],
  );

  const canVisit = useCallback((key: StepKey) => requiredBefore(key), [requiredBefore]);

  const firstIncomplete = useCallback(() => STEPS.find((s) => !s.optional && !complete[s.key]) ?? null, [complete]);

  const stepStatus = useCallback(
    (key: StepKey): StepStatus => {
      const step = STEPS.find((s) => s.key === key)!;
      if (complete[key]) return key === 'structure' && unitsSkipped && units.length === 0 ? 'skipped' : 'complete';
      if (step.optional) return 'optional';
      return firstIncomplete()?.key === key ? 'current' : 'upcoming';
    },
    [complete, firstIncomplete, unitsSkipped, units.length],
  );

  const started = profile.name.trim() !== '' || admin.fullName.trim() !== '' || people.length > 0 || units.length > 0;

  const loadSampleSetup = useCallback((done: boolean) => {
    setProfile(sampleProfile);
    setAdminState(sampleAdmin);
    setUnits(sampleUnits);
    setUnitsSkipped(false);
    setPeople(samplePeople.map((p) => ({ ...p, inviteStatus: done ? 'invited' : 'draft', resent: false })));
    setConfirmed(done);
    setNotice(null);
  }, []);

  const resetAll = useCallback(() => {
    setProfile(emptyProfile);
    setAdminState(emptyAdmin);
    setUnits([]);
    setUnitsSkipped(false);
    setPeople([]);
    setConfirmed(false);
    setNotice(null);
    setSimState(noSimulation);
  }, []);

  const value: Ctx = {
    profile,
    setProfile,
    admin,
    setAdmin,
    units,
    addUnit,
    removeUnit,
    unitsSkipped,
    setUnitsSkipped,
    people,
    addPerson,
    addPeople,
    removePerson,
    updatePerson,
    displayStatus,
    resendInvite,
    issues,
    notice,
    clearNotice: () => setNotice(null),
    confirmed,
    confirmSetup,
    stepStatus,
    canVisit,
    firstIncomplete,
    started,
    sim,
    setSim,
    loadSampleSetup,
    resetAll,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}
