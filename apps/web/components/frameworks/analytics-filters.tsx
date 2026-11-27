'use client';

import { ChevronDown, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { AnalyticsFilters as Filters } from '@/lib/frameworks/types';
import { cn } from '@/lib/utils';

type Option = { id: string; name: string };

const ALL = 'all';

/**
 * A compact filter chip: dashed and quiet when nothing is picked, solid with the picked value when a filter is on.
 */
function FilterChip({ label, allLabel, value, options, onChange }: { label: string; allLabel: string; value: string; options: Option[]; onChange: (v: string) => void }) {
  const picked = options.find((o) => o.id === value);
  return (
    <div className={cn('bg-card flex h-8 items-center rounded-md border text-xs transition-colors', picked ? 'border-solid' : 'border-dashed')}>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`${label}: ${picked?.name ?? allLabel}`}
          className={cn(
            'hover:bg-muted/60 focus-visible:ring-ring/50 flex h-full min-w-0 items-center gap-1.5 rounded-md px-2.5 outline-none focus-visible:ring-2',
            picked && 'rounded-r-none pr-2',
          )}
        >
          <span className="text-muted-foreground">{label}</span>
          {picked && (
            <>
              <span className="bg-border h-3.5 w-px" aria-hidden />
              <span className="max-w-40 truncate font-medium">{picked.name}</span>
            </>
          )}
          <ChevronDown className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">Filter by {label === 'KRA' ? label : label.toLowerCase()}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
            <DropdownMenuRadioItem value={ALL}>{allLabel}</DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            {options.map((o) => (
              <DropdownMenuRadioItem key={o.id} value={o.id}>
                {o.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {picked && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={`Clear ${label.toLowerCase()} filter`}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:ring-ring/50 grid h-full place-items-center rounded-r-md border-l px-1.5 outline-none focus-visible:ring-2"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

type AnalyticsFiltersProps = {
  value: Filters;
  onChange: (next: Filters) => void;
  kras: Option[];
  /** Leave out to hide the department filter, for example for reviewers who only see their own team. */
  departments?: Option[];
};

/** KRA and department filters for the framework analytics, shown as chips. */
export function AnalyticsFilters({ value, onChange, kras, departments }: AnalyticsFiltersProps) {
  const active = !!value.kraId || !!value.departmentId;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter analytics">
      <FilterChip label="KRA" allLabel="All KRAs" value={value.kraId} options={kras} onChange={(kraId) => onChange({ ...value, kraId })} />
      {departments && departments.length > 0 && (
        <FilterChip
          label="Department"
          allLabel="All departments"
          value={value.departmentId}
          options={departments}
          onChange={(departmentId) => onChange({ ...value, departmentId })}
        />
      )}
      {active && (
        <button type="button" onClick={() => onChange({ ...value, kraId: '', departmentId: '' })} className="text-muted-foreground hover:text-foreground px-1 text-xs">
          Reset
        </button>
      )}
    </div>
  );
}
