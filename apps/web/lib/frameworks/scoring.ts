import type { KpiInput, ScoringRule } from './types';

export const OP_LABEL: Record<ScoringRule['op'], string> = {
  gte: 'is at least',
  lte: 'is at most',
  eq: 'equals',
  between: 'is between',
};

/** Inputs a rule can test: numbers, yes/no (1 or 0) and choices (option number, starting at 1). */
export function scorableInputs(inputs: KpiInput[]): KpiInput[] {
  return inputs.filter((i) => i.type === 'number' || i.type === 'yesno' || i.type === 'choice');
}

/** Turns an entered value into a number a rule can compare. Returns null when empty or not numeric. */
export function toNumber(input: KpiInput, raw: string): number | null {
  if (raw === '') return null;
  if (input.type === 'yesno') return raw === 'yes' ? 1 : 0;
  if (input.type === 'choice') {
    const i = (input.options ?? []).indexOf(raw);
    return i >= 0 ? i + 1 : null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function matches(rule: ScoringRule, v: number): boolean {
  if (rule.op === 'gte') return v >= rule.value;
  if (rule.op === 'lte') return v <= rule.value;
  if (rule.op === 'eq') return v === rule.value;
  return v >= rule.value && v <= (rule.value2 ?? rule.value);
}

export type ScoreResult =
  | { kind: 'blocked'; missing: string[] }
  | { kind: 'scored'; points: number; ruleIndex: number | null; outOfRange: string[] };

/**
 * Runs a test submission through the rules. The first matching rule wins; no match scores 0.
 * Required inputs must be filled first, and numbers outside their bounds are reported.
 */
export function score(inputs: KpiInput[], rules: ScoringRule[], values: Record<string, string>): ScoreResult {
  const missing = inputs.filter((i) => i.required && i.type !== 'file' && !(values[i.id] ?? '').trim()).map((i) => i.label || 'Untitled input');
  if (missing.length) return { kind: 'blocked', missing };

  const outOfRange = inputs
    .filter((i) => i.type === 'number' && values[i.id])
    .filter((i) => {
      const n = Number(values[i.id]);
      return (i.min !== undefined && n < i.min) || (i.max !== undefined && n > i.max);
    })
    .map((i) => i.label || 'Untitled input');

  for (let r = 0; r < rules.length; r++) {
    const input = inputs.find((i) => i.id === rules[r].inputId);
    if (!input) continue;
    const v = toNumber(input, values[input.id] ?? '');
    if (v !== null && matches(rules[r], v)) return { kind: 'scored', points: rules[r].points, ruleIndex: r, outOfRange };
  }
  return { kind: 'scored', points: 0, ruleIndex: null, outOfRange };
}
