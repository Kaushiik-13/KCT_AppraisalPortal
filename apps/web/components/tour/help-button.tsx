'use client';

import { usePathname, useRouter } from 'next/navigation';
import { CircleQuestionMark, ListChecks, Map as MapIcon, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { tourActions } from '@/lib/tour/progress';
import { pageTourFor } from '@/lib/tour/tours';

/** Starts the main guided tour from the right place. */
export function startFirstKpiTour(pathname: string, push: (href: string) => void) {
  tourActions.start('first-kpi');
  if (pathname.startsWith('/frameworks')) tourActions.go(1);
  else if (!['/home', '/people', '/invitations', '/profile', '/settings'].some((p) => pathname.startsWith(p))) push('/home');
}

/** The ? button: tour this page, the full guided tour, or the getting-started checklist. */
export function HelpButton({ page }: { page?: 'editor' }) {
  const pathname = usePathname();
  const router = useRouter();
  const tour = pageTourFor(page === 'editor' ? '/frameworks/kpis/x' : pathname);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Help and tours" data-tour="help">
          <CircleQuestionMark aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">Help</DropdownMenuLabel>
        {tour && (
          <DropdownMenuItem onSelect={() => tourActions.start(tour.id)}>
            <MapIcon aria-hidden /> Tour this page
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => startFirstKpiTour(pathname, router.push)}>
          <Route aria-hidden /> Guided tour: create a KPI
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            tourActions.hideChecklist(false);
            router.push('/frameworks');
          }}
        >
          <ListChecks aria-hidden /> Getting started checklist
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
