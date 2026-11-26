// Department accent colors: 8 light tints with dark text.
// Contrast of each text and background pair is at least 4.5:1.

export type DeptColor = { key: string; name: string; bg: string; fg: string };

export const DEPARTMENT_COLORS: DeptColor[] = [
  { key: 'indigo', name: 'Indigo', bg: '#E0E7FF', fg: '#3730A3' },
  { key: 'blue', name: 'Blue', bg: '#DBEAFE', fg: '#1E40AF' },
  { key: 'teal', name: 'Teal', bg: '#CCFBF1', fg: '#115E59' },
  { key: 'green', name: 'Green', bg: '#DCFCE7', fg: '#166534' },
  { key: 'amber', name: 'Amber', bg: '#FEF3C7', fg: '#92400E' },
  { key: 'rose', name: 'Rose', bg: '#FFE4E6', fg: '#9F1239' },
  { key: 'purple', name: 'Purple', bg: '#F3E8FF', fg: '#6B21A8' },
  { key: 'slate', name: 'Slate', bg: '#E2E8F0', fg: '#334155' },
];

/** Resolves a stored key to its colors. Older keys like "blue-medium" map to the hue. */
export function colorOf(key: string | undefined, fallbackIndex = 0): DeptColor {
  const hue = (key ?? '').split('-')[0];
  return DEPARTMENT_COLORS.find((c) => c.key === hue) ?? DEPARTMENT_COLORS[fallbackIndex % DEPARTMENT_COLORS.length];
}

/** Next color that no department uses yet. */
export function nextColorKey(used: string[]): string {
  const usedHues = new Set(used.filter(Boolean).map((k) => k.split('-')[0]));
  return (DEPARTMENT_COLORS.find((c) => !usedHues.has(c.key)) ?? DEPARTMENT_COLORS[used.length % DEPARTMENT_COLORS.length]).key;
}
