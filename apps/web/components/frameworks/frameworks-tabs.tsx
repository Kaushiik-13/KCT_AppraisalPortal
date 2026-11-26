'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export type FrameworksTab = { href: string; label: string };

/** Page-level tabs for Framework Studio. Each tab is its own URL, so it can be linked and bookmarked. */
export function FrameworksTabs({ tabs }: { tabs: FrameworksTab[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Frameworks sections" className="flex gap-5 border-b">
      {tabs.map((t) => {
        const on = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'focus-visible:ring-ring/50 -mb-px border-b-2 pb-2.5 text-sm transition-colors outline-none focus-visible:ring-2',
              on ? 'border-foreground text-foreground font-medium' : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
