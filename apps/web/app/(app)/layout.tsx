'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Bell,
  Check,
  ChevronsUpDown,
  Ellipsis,
  Home,
  Keyboard,
  ClipboardList,
  Lightbulb,
  LogOut,
  Mail,
  Search,
  Settings,
  ChartLine,
  CircleQuestionMark,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initials, useAdminUser } from '@/lib/admin-user';
import { useSetupProgress } from '@/lib/setup-progress';
import { SetupProvider, useSetup } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

type NavItem = { href: string; label: string; icon: LucideIcon; built: boolean };

// Day-to-day pages: changes here affect real people now.
const MAIN_NAV: NavItem[] = [
  { href: '/home', label: 'Home', icon: Home, built: true },
  { href: '/people', label: 'People', icon: Users, built: true },
  { href: '/invitations', label: 'Invitations', icon: Mail, built: true },
];

// Studio: where admins draft, test and publish. Unbuilt modules show as "Later" so the product shape is visible.
const STUDIO_NAV: NavItem[] = [
  { href: '/frameworks', label: 'Frameworks', icon: ClipboardList, built: true },
  { href: '/prediction', label: 'Prediction', icon: ChartLine, built: false },
  { href: '/recommendation', label: 'Recommendation', icon: Lightbulb, built: false },
];

const SETTINGS_NAV: NavItem = { href: '/settings', label: 'Organization settings', icon: Settings, built: true };

const NAV = [...MAIN_NAV, ...STUDIO_NAV, SETTINGS_NAV];

const SHORTCUTS = [
  { keys: 'Ctrl K', action: 'Focus search' },
  { keys: 'Ctrl /', action: 'Show keyboard shortcuts' },
];

// Phone: the three most-used pages as tabs, everything else under More.
const PHONE_TABS = ['/home', '/people', '/frameworks'];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const base = 'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap';
  if (!item.built) {
    return (
      <span aria-disabled="true" className={cn(base, 'text-muted-foreground cursor-not-allowed')}>
        <Icon className="size-4" aria-hidden />
        {item.label}
        <span className="bg-secondary text-muted-foreground ml-auto rounded px-1.5 text-[11px] leading-5">Later</span>
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        base,
        active ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      <Icon className="size-4" aria-hidden />
      {item.label}
    </Link>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { organization } = useSetup();
  const user = useAdminUser();
  const progress = useSetupProgress();
  const searchRef = useRef<HTMLInputElement>(null);
  const [cycle, setCycle] = useState('2026-h1');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const page = pathname === '/profile' ? 'Your profile' : NAV.find((n) => pathname.startsWith(n.href))?.label;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <aside className="bg-card flex shrink-0 flex-col border-b md:h-full md:w-60 md:overflow-y-auto md:border-r md:border-b-0">
        <div className="flex h-16 items-center gap-3 px-4 md:h-[72px]">
          <span
            className="bg-foreground text-background grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold"
            aria-hidden
          >
            {(organization.name || 'O').trim()[0].toUpperCase()}
          </span>
          <div className="grid min-w-0">
            <span className="truncate text-sm font-semibold">{organization.name || 'Your organization'}</span>
            <span className="text-muted-foreground truncate text-xs">
              {[organization.type, organization.city].filter(Boolean).join(' · ') || 'Not set yet'}
            </span>
          </div>
        </div>
        <nav aria-label="Main" className="hidden gap-0.5 px-3 py-1 md:grid">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
          <div className="text-muted-foreground px-2.5 pt-5 pb-1 text-[11px] font-medium tracking-wide uppercase">Studio</div>
          {STUDIO_NAV.map((item) => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>
        <nav aria-label="Main" className="grid grid-cols-4 gap-1 p-2 md:hidden">
          {PHONE_TABS.map((href) => {
            const item = NAV.find((n) => n.href === href)!;
            const Icon = item.icon;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-xs whitespace-nowrap',
                  active ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-xs',
                  NAV.some((n) => !PHONE_TABS.includes(n.href) && pathname.startsWith(n.href))
                    ? 'bg-secondary text-foreground font-medium'
                    : 'text-muted-foreground',
                )}
              >
                <Ellipsis className="size-4" aria-hidden />
                More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {NAV.filter((n) => !PHONE_TABS.includes(n.href)).map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} disabled={!item.built} onSelect={() => router.push(item.href)}>
                    <Icon aria-hidden /> {item.label}
                    {!item.built && <span className="bg-secondary text-muted-foreground ml-auto rounded px-1.5 text-[11px] leading-5">Later</span>}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/profile')}>
                <UserRound aria-hidden /> Your profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="mt-auto hidden p-3 md:block">
          {progress.complete ? (
            <div className="text-muted-foreground mb-1 flex items-center gap-2 px-2 py-1.5 text-xs">
              <Check className="text-success size-3.5" aria-hidden /> Setup complete
            </div>
          ) : (
            <div className="bg-background mb-2 grid gap-1.5 rounded-lg border p-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium">Setup</span>
                <span className="text-muted-foreground tabular-nums">
                  {progress.done} of {progress.total}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Setup progress"
                aria-valuemin={0}
                aria-valuemax={progress.total}
                aria-valuenow={progress.done}
                className="bg-secondary h-1 overflow-hidden rounded-full"
              >
                <div className="bg-primary h-full rounded-full" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
              <Link href="/setup/review" className="text-primary font-medium hover:underline">
                Continue setup →
              </Link>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hover:bg-secondary/60 flex w-full items-center gap-2.5 rounded-lg p-2 text-left"
              >
                <span className="bg-secondary text-foreground grid size-8 shrink-0 place-items-center rounded-full text-xs font-medium">
                  {initials(user.name)}
                </span>
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </span>
                <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-60">
              <DropdownMenuLabel className="grid gap-0.5 font-normal">
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="text-muted-foreground text-xs">Organization Administrator</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/profile')}>
                <UserRound aria-hidden /> Your profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push(SETTINGS_NAV.href)}>
                <Settings aria-hidden /> Organization settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <CircleQuestionMark aria-hidden /> Get help
                <span className="bg-secondary text-muted-foreground ml-auto rounded px-1.5 text-[11px] leading-5">Soon</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShortcutsOpen(true)}>
                <Keyboard aria-hidden /> Keyboard shortcuts
                <DropdownMenuShortcut>Ctrl /</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/login')}>
                <LogOut aria-hidden /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>On a Mac, use Cmd instead of Ctrl.</DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2 text-sm">
            {SHORTCUTS.map((s) => (
              <li key={s.keys} className="flex items-center justify-between gap-4">
                {s.action}
                <kbd className="bg-secondary text-muted-foreground rounded border px-1.5 text-xs leading-5">{s.keys}</kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-4 border-b px-5 md:px-10">
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm lg:flex">
            <span className="text-muted-foreground truncate">{organization.name || 'Your organization'}</span>
            {page && (
              <>
                <span className="text-muted-foreground" aria-hidden>/</span>
                <span className="font-medium">{page}</span>
              </>
            )}
          </nav>
          <div className="relative mx-auto hidden w-full max-w-sm md:block">
            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              aria-label="Search"
              placeholder="Search people, invitations…"
              className="bg-secondary/50 placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-lg border pr-12 pl-8 text-sm outline-none focus-visible:ring-2"
            />
            <kbd className="text-muted-foreground bg-background pointer-events-none absolute top-2 right-2 rounded border px-1.5 text-[10px] leading-4">
              Ctrl K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Select value={cycle} onValueChange={setCycle}>
            <SelectTrigger size="sm" className="w-28" aria-label="Appraisal cycle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="2026-h1">2026 H1</SelectItem>
              <SelectItem value="2024-h2">2024 H2</SelectItem>
              <SelectItem value="2024-h1">2024 H1</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative" aria-label={`Notifications, ${progress.attention.length} need attention`}>
                <Bell aria-hidden />
                {progress.attention.length > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 grid min-w-4 place-items-center rounded-full px-1 text-[10px] leading-4">
                    {progress.attention.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Needs attention</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {progress.attention.length === 0 && (
                <div className="text-muted-foreground px-2 py-3 text-sm">Nothing needs attention.</div>
              )}
              {progress.attention.map((a) => (
                <DropdownMenuItem key={a.id} onSelect={() => router.push(a.href)} className="justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className={cn('size-2 shrink-0 rounded-full', a.tone === 'danger' ? 'bg-destructive' : 'bg-warning')} aria-hidden />
                    {a.text}
                  </span>
                  <span className="text-primary text-xs font-medium">{a.action}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-16 md:px-10">
          <div className="mx-auto grid max-w-5xl gap-8 *:min-w-0">{children}</div>
        </main>
      </div>
      <div className="text-muted-foreground bg-background/80 fixed right-4 bottom-3 hidden items-center md:flex gap-1.5 rounded-md px-2 py-1 text-xs backdrop-blur-sm">
        Powered by
        <span className="text-foreground flex items-center gap-1 font-semibold">
          <span className="bg-foreground text-background grid size-4 place-items-center rounded-[3px] text-[10px]">A</span>
          AFPI
        </span>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SetupProvider>
      <Shell>{children}</Shell>
    </SetupProvider>
  );
}
