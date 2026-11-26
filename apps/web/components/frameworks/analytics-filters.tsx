'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AnalyticsFilters as Filters } from '@/lib/frameworks/types';

type Option = { id: string; name: string };

const ALL = 'all';

function FilterSelect({ label, allLabel, value, options, onChange }: { label: string; allLabel: string; value: string; options: Option[]; onChange: (v: string) => void }) {
  return (
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
      <SelectTrigger size="sm" aria-label={label} className="w-full sm:w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type AnalyticsFiltersProps = {
  value: Filters;
  onChange: (next: Filters) => void;
  kras: Option[];
  /** Leave out to hide the department filter, for example for reviewers who only see their own team. */
  departments?: Option[];
};

/** KRA and department filters for the framework analytics. The cycle comes from the top bar. */
export function AnalyticsFilters({ value, onChange, kras, departments }: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter analytics">
      <FilterSelect label="KRA" allLabel="All KRAs" value={value.kraId} options={kras} onChange={(kraId) => onChange({ ...value, kraId })} />
      {departments && (
        <FilterSelect
          label="Department"
          allLabel="All departments"
          value={value.departmentId}
          options={departments}
          onChange={(departmentId) => onChange({ ...value, departmentId })}
        />
      )}
    </div>
  );
}
