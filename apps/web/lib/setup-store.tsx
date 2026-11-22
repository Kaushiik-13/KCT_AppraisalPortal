'use client';

// PROTOTYPE ONLY. Holds onboarding data for the flow demo in the browser
// session. No validation and no server.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { nextColorKey } from './department-colors';

export type Department = { id: string; name: string; code: string; color: string };
export type Employee = {
  id: string;
  name: string;
  email: string;
  title: string;
  departmentId: string;
  isReviewer: boolean;
  reviewerId: string;
};

export type Config = {
  timeZone: string;
  yearStartMonth: number; // 1 to 12
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  weekStart: 'monday' | 'sunday' | 'saturday';
  language: string;
  workingDays: number[]; // 0 = Sunday ... 6 = Saturday
  inviteExpiryDays: number;
  senderName: string;
  replyTo: string;
  reminders: 'off' | 'every3' | 'weekly';
  signIn: 'password' | 'sso' | 'both';
  allowedDomains: string[];
  sessionMinutes: number;
  twoStep: boolean;
  evidenceTypes: string[];
  maxFileMb: number;
  retentionYears: number; // 0 = keep until deleted
};

type Store = {
  config: Config;
  setConfig: (patch: Partial<Config>) => void;
  departments: Department[];
  addDepartment: (name: string, code?: string, color?: string) => void;
  removeDepartment: (id: string) => void;
  updateDepartment: (id: string, patch: Partial<Pick<Department, 'name' | 'code' | 'color'>>) => void;
  moveDepartment: (from: number, to: number) => void;
  employees: Employee[];
  addEmployee: (e: Partial<Omit<Employee, 'id'>>) => void;
  addEmployees: (list: Partial<Omit<Employee, 'id'>>[]) => void;
  updateEmployee: (id: string, patch: Partial<Omit<Employee, 'id'>>) => void;
  removeEmployee: (id: string) => void;
  setReviewerForDepartment: (departmentId: string, reviewerId: string) => void;
};

const KEY = 'afpi-setup-proto';
const DEPT_SEED: Department[] = [
  { id: 'd1', name: 'Engineering', code: 'ENG', color: 'blue' },
  { id: 'd2', name: 'Human Resources', code: 'HR', color: 'teal' },
  { id: 'd3', name: 'Finance', code: 'FIN', color: 'amber' },
];
const EMP_SEED: Employee[] = [
  { id: 'e1', name: 'Meera Nair', email: 'meera.nair@acme.com', title: 'Engineering Manager', departmentId: 'd1', isReviewer: true, reviewerId: '' },
  { id: 'e2', name: 'Arun Prakash', email: 'arun.prakash@acme.com', title: 'Senior Engineer', departmentId: 'd1', isReviewer: false, reviewerId: 'e1' },
  { id: 'e3', name: 'Divya Menon', email: 'divya.menon@acme.com', title: 'HR Executive', departmentId: 'd2', isReviewer: false, reviewerId: '' },
  { id: 'e4', name: 'Karthik S', email: 'karthik.s@acme.com', title: 'Accountant', departmentId: 'd3', isReviewer: false, reviewerId: 'e5' },
  { id: 'e5', name: 'Lakshmi Rao', email: 'lakshmi.rao@acme.com', title: 'Finance Lead', departmentId: 'd3', isReviewer: true, reviewerId: '' },
];

const CONFIG_DEFAULT: Config = {
  timeZone: 'Asia/Kolkata',
  yearStartMonth: 4,
  dateFormat: 'DD/MM/YYYY',
  weekStart: 'monday',
  language: 'English',
  workingDays: [1, 2, 3, 4, 5],
  inviteExpiryDays: 7,
  senderName: '',
  replyTo: '',
  reminders: 'every3',
  signIn: 'both',
  allowedDomains: [],
  sessionMinutes: 480,
  twoStep: false,
  evidenceTypes: ['PDF', 'Word', 'Excel', 'PowerPoint', 'Images'],
  maxFileMb: 25,
  retentionYears: 7,
};

const Ctx = createContext<Store | null>(null);
const uid = () => crypto.randomUUID();
const norm = (e: Partial<Omit<Employee, 'id'>>): Employee => ({
  isReviewer: false,
  reviewerId: '',
  id: uid(),
  name: (e.name ?? '').trim(),
  email: (e.email ?? '').trim(),
  title: (e.title ?? '').trim(),
  departmentId: e.departmentId ?? '',
});

export function SetupProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(DEPT_SEED);
  const [employees, setEmployees] = useState<Employee[]>(EMP_SEED);
  const [config, setConfigState] = useState<Config>(CONFIG_DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const deps: Department[] = saved.departments ?? DEPT_SEED;
        // Older saved data may have no color; give those a default.
        const fixed: Department[] = [];
        for (const d of deps) fixed.push({ ...d, color: d.color || nextColorKey(fixed.map((x) => x.color)) });
        setDepartments(fixed);
        if (saved.config) setConfigState({ ...CONFIG_DEFAULT, ...saved.config });
        if (saved.employees) {
          setEmployees(saved.employees.map((e: Employee) => ({ ...e, isReviewer: e.isReviewer ?? false, reviewerId: e.reviewerId ?? '' })));
        }
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ departments, employees, config }));
    } catch {}
  }, [departments, employees, config, ready]);

  const value = useMemo<Store>(
    () => ({
      config,
      setConfig: (patch) => setConfigState((c) => ({ ...c, ...patch })),
      departments,
      addDepartment: (name, code = '', color) =>
        setDepartments((d) => [
          ...d,
          { id: uid(), name: name.trim(), code: code.trim(), color: color ?? nextColorKey(d.map((x) => x.color)) },
        ]),
      removeDepartment: (id) => {
        setDepartments((d) => d.filter((x) => x.id !== id));
        setEmployees((list) => list.map((e) => (e.departmentId === id ? { ...e, departmentId: '' } : e)));
      },
      updateDepartment: (id, patch) => setDepartments((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      moveDepartment: (from, to) =>
        setDepartments((d) => {
          if (to < 0 || to >= d.length || from === to) return d;
          const next = [...d];
          const [item] = next.splice(from, 1);
          next.splice(to, 0, item);
          return next;
        }),
      employees,
      addEmployee: (e) => setEmployees((l) => [...l, norm(e)]),
      addEmployees: (list) => setEmployees((l) => [...l, ...list.map(norm)]),
      updateEmployee: (id, patch) =>
        setEmployees((l) =>
          l.map((x) => {
            if (x.id === id) return { ...x, ...patch };
            // Someone who stops being a reviewer no longer reviews anyone.
            if (patch.isReviewer === false && x.reviewerId === id) return { ...x, reviewerId: '' };
            return x;
          }),
        ),
      removeEmployee: (id) =>
        setEmployees((l) => l.filter((x) => x.id !== id).map((x) => (x.reviewerId === id ? { ...x, reviewerId: '' } : x))),
      setReviewerForDepartment: (departmentId, reviewerId) =>
        setEmployees((l) => l.map((x) => (x.departmentId === departmentId && x.id !== reviewerId ? { ...x, reviewerId } : x))),
    }),
    [departments, employees, config],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSetup() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSetup must be used inside SetupProvider');
  return c;
}
