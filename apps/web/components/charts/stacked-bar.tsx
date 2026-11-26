export type Segment = { label: string; value: number; color: string };

/** One bar split into parts, with a legend showing counts and shares. Used for status breakdowns. */
export function StackedBar({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <>
      <div
        className="flex h-2 gap-0.5 overflow-hidden rounded-[3px]"
        role="img"
        aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}
      >
        {segments.map((s) => (
          <div key={s.label} style={{ flex: s.value, background: s.color }} />
        ))}
      </div>
      <ul className="grid gap-2.5 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-[2px]" style={{ background: s.color }} aria-hidden />
              <span className="text-muted-foreground">{s.label}</span>
            </span>
            <span className="tabular-nums">
              {s.value} <span className="text-muted-foreground text-xs">({Math.round((s.value / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Shared status palette so every chart colours the same state the same way. */
export const STATUS_COLORS = {
  notStarted: 'var(--border)',
  submitted: 'var(--primary)',
  inReview: 'color-mix(in oklab, var(--primary) 45%, var(--background))',
  returned: 'var(--warning)',
  released: 'var(--success)',
} as const;
