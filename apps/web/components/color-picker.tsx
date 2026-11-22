'use client';

import { Check } from 'lucide-react';
import { DEPARTMENT_COLORS, colorOf } from '@/lib/department-colors';
import { cn } from '@/lib/utils';

export function ColorPicker({ value, onChange, label = 'Accent color' }: { value: string; onChange: (key: string) => void; label?: string }) {
  const selectedKey = colorOf(value).key;
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {DEPARTMENT_COLORS.map((c) => {
        const selected = c.key === selectedKey;
        return (
          <button
            key={c.key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c.name}
            title={c.name}
            onClick={() => onChange(c.key)}
            style={{ backgroundColor: c.bg, color: c.fg }}
            className={cn(
              'grid size-5 place-items-center rounded-full border border-black/10 outline-none',
              'focus-visible:ring-ring/50 focus-visible:ring-3',
              selected && 'ring-foreground/60 ring-offset-background ring-2 ring-offset-1',
            )}
          >
            {selected ? <Check aria-hidden className="size-3" /> : null}
          </button>
        );
      })}
    </div>
  );
}
