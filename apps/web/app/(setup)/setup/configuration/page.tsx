'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSetup, type Config } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

const ZONES = [
  'Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
  'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DATE_FORMATS: Config['dateFormat'][] = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const WEEK_STARTS: { value: Config['weekStart']; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'saturday', label: 'Saturday' },
];
const DAYS = [
  { n: 1, l: 'Mon' }, { n: 2, l: 'Tue' }, { n: 3, l: 'Wed' }, { n: 4, l: 'Thu' }, { n: 5, l: 'Fri' }, { n: 6, l: 'Sat' }, { n: 0, l: 'Sun' },
];
const LANGUAGES = ['English', 'Hindi', 'Tamil'];
const EVIDENCE = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Images', 'Video'];

function formatDate(d: Date, f: Config['dateFormat']) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return f === 'DD/MM/YYYY' ? `${dd}/${mm}/${yyyy}` : f === 'MM/DD/YYYY' ? `${mm}/${dd}/${yyyy}` : `${yyyy}-${mm}-${dd}`;
}

function Section({ id, title, text, children }: { id: string; title: string; text: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-3">
      <div className="grid gap-0.5">
        <h3 id={id} className="text-base font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{text}</p>
      </div>
      <div className="divide-y rounded-lg border">{children}</div>
    </section>
  );
}

function Row({ title, hint, children, preview }: { title: string; hint: string; children: React.ReactNode; preview?: React.ReactNode }) {
  return (
    <div className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_300px] sm:gap-8">
      <div className="grid content-start gap-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-muted-foreground text-sm">{hint}</p>
      </div>
      <div className="grid content-start gap-2">
        {children}
        {preview ? <p className="text-muted-foreground text-xs">{preview}</p> : null}
      </div>
    </div>
  );
}

function Pick({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'focus-visible:ring-ring/50 h-8 rounded-md border px-3 text-sm outline-none focus-visible:ring-3',
        on ? 'border-primary bg-primary/5 text-foreground font-medium' : 'text-muted-foreground hover:bg-muted/50',
      )}
    >
      {children}
    </button>
  );
}

function Segmented<T extends string>({ label, value, onChange, items }: { label: string; value: T; onChange: (v: T) => void; items: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex w-fit rounded-md border p-0.5" role="radiogroup" aria-label={label}>
      {items.map((w) => (
        <button
          key={w.value}
          type="button"
          role="radio"
          aria-checked={value === w.value}
          onClick={() => onChange(w.value)}
          className={cn(
            'focus-visible:ring-ring/50 h-8 rounded-[4px] px-3 text-sm outline-none focus-visible:ring-3',
            value === w.value ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}

export default function ConfigurationPage() {
  const { config, setConfig } = useSetup();
  const [now, setNow] = useState<Date | null>(null);
  const [detected, setDetected] = useState<string | null>(null);
  const [domain, setDomain] = useState('');

  useEffect(() => {
    setNow(new Date());
    try {
      setDetected(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {}
  }, []);

  const zones = detected && !ZONES.includes(detected) ? [detected, ...ZONES] : ZONES;

  let zoneNow = '';
  try {
    if (now) zoneNow = new Intl.DateTimeFormat('en-GB', { timeZone: config.timeZone, hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }).format(now);
  } catch {}

  let yearText = '';
  if (now) {
    const m = config.yearStartMonth - 1;
    const startYear = now.getMonth() >= m ? now.getFullYear() : now.getFullYear() - 1;
    yearText = `Current appraisal year: ${formatDate(new Date(startYear, m, 1), config.dateFormat)} to ${formatDate(new Date(startYear + 1, m, 0), config.dateFormat)}`;
  }

  const flip = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const addDomain = () => {
    const d = domain.trim().toLowerCase().replace(/^@/, '');
    if (d && !config.allowedDomains.includes(d)) setConfig({ allowedDomains: [...config.allowedDomains, d] });
    setDomain('');
  };

  return (
    <>
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold tracking-tight">Configuration</h2>
        <p className="text-muted-foreground text-sm">
          Organization-wide settings. We filled in sensible defaults, so you can usually just continue. KPIs, scoring and model settings are set up later in their own areas.
        </p>
      </div>

      <div className="grid gap-9">
        {/* 1. Dates and locale */}
        <Section id="cfg-dates" title="Dates and locale" text="How dates, times and weeks work across your organization.">
          <Row title="Time zone" hint="Used for deadlines, reminders and report dates." preview={zoneNow ? `Current time there: ${zoneNow}${detected === config.timeZone ? ' (detected from your device)' : ''}` : undefined}>
            <Pick label="Time zone" value={config.timeZone} onChange={(v) => setConfig({ timeZone: v })} options={zones.map((z) => ({ value: z, label: z.replace('_', ' ') }))} />
          </Row>
          <Row title="Appraisal year starts in" hint="Your appraisal periods follow this month, such as April to March." preview={yearText || undefined}>
            <Pick label="Appraisal year start month" value={String(config.yearStartMonth)} onChange={(v) => setConfig({ yearStartMonth: Number(v) })} options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} />
          </Row>
          <Row title="Date format" hint="How dates are shown to everyone.">
            <div role="radiogroup" aria-label="Date format" className="grid gap-2">
              {DATE_FORMATS.map((f) => {
                const on = config.dateFormat === f;
                return (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setConfig({ dateFormat: f })}
                    className={cn('focus-visible:ring-ring/50 flex items-center justify-between rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-3', on ? 'border-primary bg-primary/5' : 'hover:bg-muted/50')}
                  >
                    <span className="font-medium">{f}</span>
                    <span className="text-muted-foreground text-xs">{now ? formatDate(now, f) : ''}</span>
                  </button>
                );
              })}
            </div>
          </Row>
          <Row title="Week starts on" hint="Used in calendars and weekly views.">
            <Segmented label="Week starts on" value={config.weekStart} onChange={(v) => setConfig({ weekStart: v })} items={WEEK_STARTS} />
          </Row>
          <Row title="Working days" hint="Deadlines and reminders skip the days you switch off.">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Working days">
              {DAYS.map((d) => (
                <Toggle key={d.n} on={config.workingDays.includes(d.n)} onClick={() => setConfig({ workingDays: config.workingDays.includes(d.n) ? config.workingDays.filter((x) => x !== d.n) : [...config.workingDays, d.n] })}>
                  {d.l}
                </Toggle>
              ))}
            </div>
          </Row>
          <Row title="Language" hint="The language people see by default.">
            <Pick label="Language" value={config.language} onChange={(v) => setConfig({ language: v })} options={LANGUAGES.map((l) => ({ value: l, label: l }))} />
          </Row>
        </Section>

        {/* 2. Invitations and email */}
        <Section id="cfg-email" title="Invitations and email" text="How invitations and reminders reach your people.">
          <Row title="Invitation expires after" hint="After this, an invitation must be sent again.">
            <Pick label="Invitation expiry" value={String(config.inviteExpiryDays)} onChange={(v) => setConfig({ inviteExpiryDays: Number(v) })} options={[3, 7, 14, 30].map((n) => ({ value: String(n), label: `${n} days` }))} />
          </Row>
          <Row title="Sender name" hint="The name people see on emails from AFPI.">
            <Input aria-label="Sender name" placeholder="Acme HR Team" value={config.senderName} onChange={(e) => setConfig({ senderName: e.target.value })} />
          </Row>
          <Row title="Reply-to email" hint="Where replies to AFPI emails go.">
            <Input aria-label="Reply-to email" type="email" placeholder="hr@acme.com" value={config.replyTo} onChange={(e) => setConfig({ replyTo: e.target.value })} />
          </Row>
          <Row title="Reminders" hint="Reminders for pending invitations and unfinished tasks.">
            <Pick label="Reminders" value={config.reminders} onChange={(v) => setConfig({ reminders: v as Config['reminders'] })} options={[{ value: 'off', label: 'Never' }, { value: 'every3', label: 'Every 3 days' }, { value: 'weekly', label: 'Weekly' }]} />
          </Row>
        </Section>

        {/* 3. Access and security */}
        <Section id="cfg-access" title="Access and security" text="Who can sign in and how.">
          <Row title="Sign-in method" hint="How your people sign in to AFPI.">
            <Segmented label="Sign-in method" value={config.signIn} onChange={(v) => setConfig({ signIn: v })} items={[{ value: 'password', label: 'Password' }, { value: 'sso', label: 'Single sign-on' }, { value: 'both', label: 'Both' }]} />
          </Row>
          <Row title="Allowed email domains" hint="Only these domains can join. Leave empty to allow any." preview={config.allowedDomains.length === 0 ? 'Any email domain is allowed.' : undefined}>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addDomain(); }}>
              <Input aria-label="Add an email domain" placeholder="acme.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
              <Button type="submit" variant="outline"><Plus aria-hidden data-icon="inline-start" /> Add</Button>
            </form>
            {config.allowedDomains.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {config.allowedDomains.map((d) => (
                  <li key={d} className="bg-muted inline-flex items-center gap-1 rounded-md py-0.5 pr-0.5 pl-2 text-xs">
                    {d}
                    <Button size="icon-xs" variant="ghost" aria-label={`Remove ${d}`} onClick={() => setConfig({ allowedDomains: config.allowedDomains.filter((x) => x !== d) })}>
                      <X aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </Row>
          <Row title="Session timeout" hint="People are signed out after this much inactivity.">
            <Pick label="Session timeout" value={String(config.sessionMinutes)} onChange={(v) => setConfig({ sessionMinutes: Number(v) })} options={[{ value: '30', label: '30 minutes' }, { value: '60', label: '1 hour' }, { value: '240', label: '4 hours' }, { value: '480', label: '8 hours' }]} />
          </Row>
          <Row title="Two-step verification" hint="Ask for a second check when people sign in.">
            <label className="flex items-center gap-3 text-sm">
              <Switch aria-label="Two-step verification" checked={config.twoStep} onCheckedChange={(v) => setConfig({ twoStep: v })} />
              {config.twoStep ? 'Required for everyone' : 'Off'}
            </label>
          </Row>
        </Section>

        {/* 4. Evidence and data */}
        <Section id="cfg-data" title="Evidence and data" text="Files faculty upload as evidence, and how long records are kept.">
          <Row title="Allowed file types" hint="People can only upload these kinds of files.">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Allowed file types">
              {EVIDENCE.map((t) => (
                <Toggle key={t} on={config.evidenceTypes.includes(t)} onClick={() => setConfig({ evidenceTypes: flip(config.evidenceTypes, t) })}>{t}</Toggle>
              ))}
            </div>
          </Row>
          <Row title="Maximum file size" hint="For each uploaded file.">
            <Pick label="Maximum file size" value={String(config.maxFileMb)} onChange={(v) => setConfig({ maxFileMb: Number(v) })} options={[5, 10, 25, 50].map((n) => ({ value: String(n), label: `${n} MB` }))} />
          </Row>
          <Row title="Keep records for" hint="Appraisal records and evidence are kept this long.">
            <Pick label="Retention" value={String(config.retentionYears)} onChange={(v) => setConfig({ retentionYears: Number(v) })} options={[{ value: '3', label: '3 years' }, { value: '5', label: '5 years' }, { value: '7', label: '7 years' }, { value: '10', label: '10 years' }, { value: '0', label: 'Until deleted' }]} />
          </Row>
        </Section>
      </div>

      <p className="text-muted-foreground text-sm">You can change any of these later in Settings.</p>
    </>
  );
}
