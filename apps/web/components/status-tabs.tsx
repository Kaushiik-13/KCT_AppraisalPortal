import { cn } from '@/lib/utils';

export type TabItem<K extends string> = { key: K; label: string; count?: number };

/** Filter tabs with an optional count. `pill` is a soft highlight, `underline` sits on a divider line. */
export function StatusTabs<K extends string>({
  items,
  value,
  onChange,
  label,
  variant = 'pill',
  className,
}: {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  label: string;
  variant?: 'pill' | 'underline';
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('flex', variant === 'pill' ? 'flex-wrap gap-1' : 'gap-4 border-b px-3', className)}
    >
      {items.map((t) => {
        const on = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.key)}
            className={cn(
              'text-sm',
              variant === 'pill'
                ? cn('rounded-lg px-2.5 py-1', on ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground')
                : cn('-mb-px border-b-2 py-2', on ? 'border-foreground text-foreground font-medium' : 'text-muted-foreground hover:text-foreground border-transparent'),
            )}
          >
            {t.label} {t.count !== undefined && <span className="text-muted-foreground tabular-nums">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
