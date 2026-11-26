'use client';

import { useEffect, useState } from 'react';
import { Check, Laptop, Smartphone } from 'lucide-react';
import { Pick, Row } from '@/components/settings-rows';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { initials, useAdminUser } from '@/lib/admin-user';
import { useSetup } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

// Prototype: the signed-in person's own profile. Nothing is sent or stored beyond this browser tab.
const TABS = [
  { id: 'about', label: 'About you' },
  { id: 'security', label: 'Sign-in and security' },
  { id: 'prefs', label: 'Preferences' },
  { id: 'notify', label: 'Notifications' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const ZONES = ['Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York'];
const ORG_DEFAULT = 'org';

type Draft = {
  name: string;
  title: string;
  timeZone: string;
  language: string;
  dateFormat: string;
  notify: { reminders: boolean; released: boolean; invitations: boolean; weekly: boolean };
};

const SAMPLE_SESSIONS = [
  { id: 's1', icon: Laptop, device: 'Chrome on Windows', where: 'Chennai, India', when: 'Active now', current: true },
  { id: 's2', icon: Smartphone, device: 'Safari on iPhone', where: 'Chennai, India', when: '2 days ago', current: false },
  { id: 's3', icon: Laptop, device: 'Edge on Windows', where: 'Coimbatore, India', when: '9 days ago', current: false },
];

export default function ProfilePage() {
  const user = useAdminUser();
  const { config, employees, departments } = useSetup();
  const [tab, setTab] = useState<TabId>('about');

  const initial: Draft = {
    name: user.name,
    title: 'Organization Administrator',
    timeZone: ORG_DEFAULT,
    language: ORG_DEFAULT,
    dateFormat: ORG_DEFAULT,
    notify: { reminders: true, released: true, invitations: true, weekly: false },
  };
  const [stored, setStored] = useState<Draft>(initial);
  const [draft, setDraft] = useState<Draft>(initial);
  const [saved, setSaved] = useState(false);

  // The name arrives from sessionStorage after the first render.
  useEffect(() => {
    setStored((s) => ({ ...s, name: user.name }));
    setDraft((d) => ({ ...d, name: user.name }));
  }, [user.name]);

  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [twoStep, setTwoStep] = useState(false);
  const [sessions, setSessions] = useState(SAMPLE_SESSIONS);

  const me = employees.find((e) => e.email.toLowerCase() === user.email.toLowerCase());
  const department = departments.find((d) => d.id === me?.departmentId)?.name;
  const reviewer = employees.find((e) => e.id === me?.reviewerId)?.name;
  const orgRequires2fa = config.twoStep;

  const dirty = JSON.stringify(draft) !== JSON.stringify(stored);
  const patch = (p: Partial<Draft>) => {
    setSaved(false);
    setDraft((d) => ({ ...d, ...p }));
  };
  const save = () => {
    setStored(draft);
    setSaved(true);
    try {
      sessionStorage.setItem('afpi-signup-name', draft.name);
    } catch {}
  };

  const withDefault = (current: string, list: { value: string; label: string }[]) => [
    { value: ORG_DEFAULT, label: `Organization default (${current})` },
    ...list,
  ];

  return (
    <>
      <PageHeader title="Your profile" description="Your own details and preferences. Only you see this page." />

      <div className="grid gap-8 md:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Profile sections" className="flex gap-1 overflow-x-auto md:grid md:content-start md:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-lg px-2.5 py-1.5 text-left text-sm whitespace-nowrap',
                tab === t.id ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="grid min-w-0 content-start gap-4">
          <h2 className="text-base font-semibold">{TABS.find((t) => t.id === tab)?.label}</h2>
          <div className="bg-card @container divide-y rounded-lg border">
            {tab === 'about' && (
              <>
                <Row title="Photo" hint="Shown next to your name. Initials are used until you add one.">
                  <div className="flex items-center gap-3">
                    <span className="bg-secondary grid size-12 shrink-0 place-items-center rounded-full text-sm font-medium">
                      {initials(draft.name)}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setNotice('Prototype: photo upload is not built yet.')}>
                      Upload photo
                    </Button>
                  </div>
                </Row>
                <Row title="Full name" hint="How your name appears to others.">
                  <Input aria-label="Full name" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
                </Row>
                <Row title="Job title" hint="Shown on your profile and in people lists.">
                  <Input aria-label="Job title" value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
                </Row>
                <Row title="Department" hint="Managed by your administrator in People.">
                  <p className="text-sm">{department ?? 'Not in a department'}</p>
                </Row>
                <Row title="Reviewer" hint="Managed by your administrator in People.">
                  <p className="text-sm">{reviewer ?? 'No reviewer assigned'}</p>
                </Row>
              </>
            )}

            {tab === 'security' && (
              <>
                <Row title="Email" hint="You sign in with this address. Changing it needs a code sent to the new address.">
                  <p className="text-sm">{user.email}</p>
                  {emailOpen ? (
                    <form
                      className="grid gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setEmailOpen(false);
                        setNotice('Prototype: no code was sent. In the product, a code goes to the new address.');
                      }}
                    >
                      <Input aria-label="New email" type="email" placeholder="you@acme.com" />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Send code</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEmailOpen(false)}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <Button variant="outline" size="sm" className="justify-self-start" onClick={() => setEmailOpen(true)}>Change email</Button>
                  )}
                </Row>
                <Row title="Password" hint="Use at least 12 characters.">
                  {passwordOpen ? (
                    <form
                      className="grid gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setPasswordOpen(false);
                        setNotice('Prototype: the password was not changed.');
                      }}
                    >
                      <Input aria-label="Current password" type="password" placeholder="Current password" />
                      <Input aria-label="New password" type="password" placeholder="New password" />
                      <Input aria-label="Confirm new password" type="password" placeholder="Confirm new password" />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Update password</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setPasswordOpen(false)}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <Button variant="outline" size="sm" className="justify-self-start" onClick={() => setPasswordOpen(true)}>Change password</Button>
                  )}
                </Row>
                <Row
                  title="Two-step verification"
                  hint="A second check when you sign in."
                  preview={orgRequires2fa ? 'Required by your organization, so it cannot be turned off.' : undefined}
                >
                  <label className="flex items-center gap-3 text-sm">
                    <Switch
                      aria-label="Two-step verification"
                      checked={orgRequires2fa || twoStep}
                      disabled={orgRequires2fa}
                      onCheckedChange={setTwoStep}
                    />
                    {orgRequires2fa || twoStep ? 'On' : 'Off'}
                  </label>
                </Row>
                <Row title="Active sessions" hint="Devices signed in to your account.">
                  <ul className="grid gap-2">
                    {sessions.map((s) => {
                      const Icon = s.icon;
                      return (
                        <li key={s.id} className="flex items-center gap-3 text-sm">
                          <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                          <span className="grid min-w-0">
                            <span className="truncate">
                              {s.device}
                              {s.current && <span className="text-success ml-1.5 text-xs">This device</span>}
                            </span>
                            <span className="text-muted-foreground truncate text-xs">{s.where} · {s.when}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {sessions.length > 1 && (
                    <Button variant="outline" size="sm" className="justify-self-start" onClick={() => setSessions((l) => l.filter((s) => s.current))}>
                      Sign out other devices
                    </Button>
                  )}
                </Row>
              </>
            )}

            {tab === 'prefs' && (
              <>
                <Row title="Time zone" hint="Used for your deadlines and reminders.">
                  <Pick
                    label="Time zone"
                    value={draft.timeZone}
                    onChange={(v) => patch({ timeZone: v })}
                    options={withDefault(config.timeZone, ZONES.map((z) => ({ value: z, label: z })))}
                  />
                </Row>
                <Row title="Language" hint="The language AFPI uses for you.">
                  <Pick
                    label="Language"
                    value={draft.language}
                    onChange={(v) => patch({ language: v })}
                    options={withDefault(config.language, ['English', 'Hindi', 'Tamil'].map((l) => ({ value: l, label: l })))}
                  />
                </Row>
                <Row title="Date format" hint="How dates are shown to you.">
                  <Pick
                    label="Date format"
                    value={draft.dateFormat}
                    onChange={(v) => patch({ dateFormat: v })}
                    options={withDefault(config.dateFormat, ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((f) => ({ value: f, label: f })))}
                  />
                </Row>
              </>
            )}

            {tab === 'notify' && (
              <>
                {(
                  [
                    { key: 'reminders', title: 'Review reminders', hint: 'When something is waiting for you or a deadline is near.' },
                    { key: 'released', title: 'Marks released', hint: 'When a reviewer releases a mark to you.' },
                    { key: 'invitations', title: 'Invitation updates', hint: 'When people accept, or invitations expire or fail.' },
                    { key: 'weekly', title: 'Weekly summary', hint: 'A short email every Monday with progress and open items.' },
                  ] as const
                ).map((n) => (
                  <Row key={n.key} title={n.title} hint={n.hint}>
                    <label className="flex items-center gap-3 text-sm">
                      <Switch
                        aria-label={n.title}
                        checked={draft.notify[n.key]}
                        onCheckedChange={(v) => patch({ notify: { ...draft.notify, [n.key]: v } })}
                      />
                      {draft.notify[n.key] ? 'Email me' : 'Off'}
                    </label>
                  </Row>
                ))}
              </>
            )}
          </div>

          {notice && <p className="text-muted-foreground text-sm" role="status">{notice}</p>}

          {(dirty || saved) && (
            <div className="bg-background sticky bottom-0 -mx-1 flex min-h-14 items-center gap-3 border-t px-1">
              {dirty ? (
                <>
                  <Button onClick={save}>Save changes</Button>
                  <Button variant="ghost" onClick={() => setDraft(stored)}>Discard</Button>
                  <span className="text-muted-foreground text-sm">You have unsaved changes.</span>
                </>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <Check className="text-success size-4" aria-hidden /> Saved
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
