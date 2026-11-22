// PROTOTYPE ONLY. Shows how a roster import could be checked row by row,
// keeping valid rows and explaining invalid ones.

import { isEmail } from './validation';
import type { Person, Unit } from './types';

export type RosterRow = {
  line: number;
  name: string;
  email: string;
  department: string;
  isFaculty: boolean;
  isSupervisor: boolean;
  errors: string[];
};

export const ROSTER_TEMPLATE = 'name,email,department,role\n';

export const SAMPLE_ROSTER = [
  'name,email,department,role',
  'Dr. Meera Nair,meera.nair@college.edu,Computer Science,supervisor;faculty',
  'Arun Prakash,arun.prakash@college.edu,Computer Science,faculty',
  'Divya Menon,divya.menon@college.edu,Computer Science,faculty',
  'Karthik S,karthik.college.edu,Mechanical,faculty',
  'Lakshmi Rao,lakshmi.rao@college.edu,Mechanical,supervisor',
  'Arun Prakash,arun.prakash@college.edu,Computer Science,faculty',
  ',ravi.k@college.edu,Mechanical,faculty',
  'Sana Iqbal,sana.iqbal@college.edu,Astrophysics,faculty',
].join('\n');

function parseRoles(raw: string) {
  const parts = raw
    .toLowerCase()
    .split(/[;|/]/)
    .map((p) => p.trim())
    .filter(Boolean);
  return { isFaculty: parts.includes('faculty'), isSupervisor: parts.includes('supervisor') };
}

export function checkRoster(text: string, existing: Person[], units: Unit[]): RosterRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const hasHeader = /^\s*name\s*,\s*email/i.test(lines[0]);
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const firstLine = hasHeader ? 2 : 1;

  const seen = new Map<string, number>();
  const existingEmails = new Set(existing.map((p) => p.email.trim().toLowerCase()));
  const unitNames = new Set(units.map((u) => u.name.trim().toLowerCase()));

  return dataLines.map((raw, index) => {
    const [name = '', email = '', department = '', role = ''] = raw.split(',').map((c) => c.trim());
    const errors: string[] = [];
    const key = email.toLowerCase();

    if (!name) errors.push('Name is missing.');
    if (!email) errors.push('Email is missing.');
    else if (!isEmail(email)) errors.push('Email address is not valid.');
    else if (existingEmails.has(key)) errors.push('This email already belongs to an employee in setup.');
    else if (seen.has(key)) errors.push(`Duplicate of line ${seen.get(key)} in this file.`);

    if (email && isEmail(email) && !seen.has(key)) seen.set(key, firstLine + index);

    // Only check the unit when the institution has defined units. Without any
    // structure the column is ignored, so skipping that step never blocks an import.
    if (department && unitNames.size > 0 && !unitNames.has(department.toLowerCase())) {
      errors.push(`Unit "${department}" is not in your organization structure.`);
    }

    return { line: firstLine + index, name, email, department, ...parseRoles(role), errors };
  });
}
