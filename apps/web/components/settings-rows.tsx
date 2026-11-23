'use client';

import type { ReactNode } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Shared by the setup Configuration step and the Settings screen.
export function Section({ id, title, text, children }: { id: string; title: string; text: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-3">
      <div className="grid gap-0.5">
        <h3 id={id} className="text-base font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{text}</p>
      </div>
      <div className="@container divide-y rounded-lg border">{children}</div>
    </section>
  );
}

export function Row({ title, hint, children, preview }: { title: string; hint: string; children: ReactNode; preview?: ReactNode }) {
  return (
    <div className="grid gap-4 px-5 py-5 @lg:grid-cols-[minmax(0,1fr)_300px] @lg:gap-8">
      <div className="grid content-start gap-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-muted-foreground text-sm">{hint}</p>
      </div>
      <div className="grid content-start gap-2">
        {children}
        {preview ? <p className="text-muted-foreground text-xs">{preview}</p> : null}
      </div>
    </div>
  );
}

export function Pick({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'focus-visible:ring-ring/50 h-8 rounded-md border px-3 text-sm outline-none focus-visible:ring-3',
        on ? 'border-primary bg-primary/5 text-foreground font-medium' : 'text-muted-foreground hover:bg-muted/50',
      )}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ label, value, onChange, items }: { label: string; value: T; onChange: (v: T) => void; items: { value: T; label: string }[] }) {
  return (
    <div className="flex w-full max-w-full rounded-md border p-0.5" role="radiogroup" aria-label={label}>
      {items.map((w) => (
        <button
          key={w.value}
          type="button"
          role="radio"
          aria-checked={value === w.value}
          onClick={() => onChange(w.value)}
          className={cn(
            'focus-visible:ring-ring/50 h-8 flex-1 rounded-[4px] px-2.5 text-sm whitespace-nowrap outline-none focus-visible:ring-3',
            value === w.value ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}
