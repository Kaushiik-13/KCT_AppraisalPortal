import type { DeptColor } from '@/lib/department-colors';

/** Department name on its tint colour, or a muted "No department" when there is none. */
export function DepartmentChip({ name, color }: { name?: string; color?: DeptColor }) {
  if (!name || !color) return <span className="text-muted-foreground text-xs">No department</span>;
  return (
    <span className="rounded-[4px] px-1.5 py-0.5 text-xs font-medium whitespace-nowrap" style={{ backgroundColor: color.bg, color: color.fg }}>
      {name}
    </span>
  );
}
