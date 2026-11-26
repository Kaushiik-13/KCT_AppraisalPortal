import { initials } from '@/lib/admin-user';
import { cn } from '@/lib/utils';

/** Round initials badge. */
export function PersonAvatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md'; className?: string }) {
  return (
    <span
      className={cn(
        'bg-secondary text-foreground grid shrink-0 place-items-center rounded-full font-medium',
        size === 'sm' ? 'size-7 text-[11px]' : 'size-8 text-xs',
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
