import { cn } from '@/lib/utils';

/** Coloured dot with a text label. `dot` is a background class such as `bg-success`. */
export function StatusDot({ label, dot, className }: { label: string; dot: string; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 whitespace-nowrap', className)}>
      <span className={cn('size-2 shrink-0 rounded-full', dot)} aria-hidden />
      {label}
    </span>
  );
}
