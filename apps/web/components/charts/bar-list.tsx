export type BarItem = { id: string; label: string; value: number; hint?: string };

type BarListProps = {
  items: BarItem[];
  /** The value a full bar represents. Defaults to the largest item. */
  max?: number;
  format?: (v: number) => string;
  /** Width of the label column, for example "minmax(120px,200px)". */
  labelWidth?: string;
  empty?: string;
};

/** Labelled horizontal bars: rankings ("most submitted"), percentages ("progress by KRA") or averages. */
export function BarList({ items, max, format = (v) => String(v), labelWidth = 'minmax(120px,200px)', empty = 'Nothing to show yet.' }: BarListProps) {
  if (items.length === 0) return <p className="text-muted-foreground text-sm">{empty}</p>;
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li
          key={item.id}
          className="grid items-center gap-3 text-sm"
          style={{ gridTemplateColumns: `${labelWidth} minmax(0,1fr) auto` }}
        >
          <span className="grid min-w-0">
            <span className="truncate">{item.label}</span>
            {item.hint && <span className="text-muted-foreground truncate text-xs">{item.hint}</span>}
          </span>
          <div className="bg-secondary h-1.5 overflow-hidden rounded-[3px]" aria-hidden>
            <div className="bg-primary h-full rounded-[3px]" style={{ width: `${Math.min(100, (item.value / top) * 100)}%` }} />
          </div>
          <span className="text-right tabular-nums">{format(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}
