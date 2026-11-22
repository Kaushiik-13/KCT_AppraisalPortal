'use client';

import { usePathname } from 'next/navigation';
import { FlaskConical, NotebookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { DESIGN_NOTES } from '@/lib/org/design-notes';
import type { Simulation } from '@/lib/org/types';
import { useOnboarding } from './onboarding-context';

export function PrototypeBanner() {
  return (
    <div role="note" className="border-warning/40 bg-warning/10 text-warning border-b px-4 py-2 text-center text-sm">
      <strong className="font-semibold">Design prototype, not connected to a backend.</strong> Sample data is kept in
      memory and is lost on reload. Nothing is saved, emailed, authenticated or authorized.
    </div>
  );
}

function noteKey(pathname: string) {
  const match = pathname.match(/\/onboarding\/([a-z]+)/);
  return match ? match[1] : 'home';
}

function NoteList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="grid gap-1.5">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function DesignNotesButton() {
  const pathname = usePathname();
  const note = DESIGN_NOTES[noteKey(pathname)] ?? DESIGN_NOTES.home;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <NotebookText aria-hidden data-icon="inline-start" /> Design notes
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{note.title}: design notes</SheetTitle>
          <SheetDescription>{note.purpose}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 px-4 pb-6">
          <p className="text-muted-foreground bg-muted rounded-md p-3 text-xs">
            Reviewer notes. These describe what this screen implies for data and rules. They are proposals for
            discussion, not an approved data model, permission contract or API.
          </p>
          <NoteList title="Information shown or collected" items={note.data} />
          <NoteList title="Rules the screen assumes" items={note.rules} />
          <NoteList title="Operations it implies" items={note.operations} />
          <NoteList title="Still undecided" items={note.open} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

const SIMULATIONS: { key: keyof Simulation; label: string; help: string }[] = [
  { key: 'loadingRoster', label: 'Employee list is loading', help: 'Shows the loading state on the Employees step.' },
  { key: 'selfReviewConflict', label: 'Self-review conflict', help: 'Forces a person who is both faculty and supervisor to review themselves.' },
  { key: 'expiredInvites', label: 'Some invitations expired', help: 'After setup is confirmed, shows expired invitations.' },
  { key: 'failedInvite', label: 'An invitation failed to deliver', help: 'After setup is confirmed, shows a delivery failure.' },
  { key: 'sessionExpired', label: 'Session expired', help: 'Shows the sign-in-again prompt. The draft is kept.' },
  { key: 'accessDenied', label: 'Access removed', help: 'Shows the permission-denied page.' },
];

export function PrototypeControlsButton() {
  const { sim, setSim, loadSampleSetup, resetAll } = useOnboarding();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <FlaskConical aria-hidden data-icon="inline-start" /> Prototype controls
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Prototype controls</SheetTitle>
          <SheetDescription>Jump to populated data and force edge cases so every state can be reviewed.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 px-4 pb-6">
          <section className="grid gap-2">
            <h3 className="text-sm font-medium">Sample data</h3>
            <Button variant="outline" onClick={() => loadSampleSetup(false)}>
              Fill setup with sample data
            </Button>
            <Button variant="outline" onClick={() => loadSampleSetup(true)}>
              Show a completed setup
            </Button>
            <Button variant="ghost" onClick={resetAll}>
              Reset to empty
            </Button>
          </section>
          <Separator />
          <section className="grid gap-4">
            <h3 className="text-sm font-medium">Force a state</h3>
            {SIMULATIONS.map((s) => (
              <div key={s.key} className="flex items-start justify-between gap-4">
                <div className="grid gap-0.5">
                  <Label htmlFor={`sim-${s.key}`}>{s.label}</Label>
                  <p className="text-muted-foreground text-xs">{s.help}</p>
                </div>
                <Switch id={`sim-${s.key}`} checked={sim[s.key]} onCheckedChange={(v) => setSim({ [s.key]: v })} />
              </div>
            ))}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
