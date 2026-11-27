import type { InputType, KpiInput } from './types';

/** "today", "3 days ago", "2 weeks ago", then a date. */
export function relativeDay(iso: string, now = Date.now()): string {
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(iso);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const TYPE_WORD: Record<InputType, [string, string]> = {
  number: ['number', 'numbers'],
  choice: ['choice', 'choices'],
  yesno: ['yes/no', 'yes/no'],
  text: ['text', 'texts'],
  date: ['date', 'dates'],
  file: ['file', 'files'],
};

/** Short summary of a KPI's inputs, for example "2 numbers · file". */
export function inputsSummary(inputs: KpiInput[]): string {
  if (inputs.length === 0) return 'No inputs';
  const counts = new Map<InputType, number>();
  inputs.forEach((i) => counts.set(i.type, (counts.get(i.type) ?? 0) + 1));
  return [...counts]
    .map(([type, n]) => (type === 'file' ? (n === 1 ? 'file' : `${n} files`) : `${n} ${TYPE_WORD[type][n === 1 ? 0 : 1]}`))
    .join(' · ');
}

export const INPUT_TYPE_LABEL: Record<InputType, string> = {
  number: 'Number',
  choice: 'Choice',
  yesno: 'Yes / no',
  text: 'Text',
  date: 'Date',
  file: 'File upload',
};
