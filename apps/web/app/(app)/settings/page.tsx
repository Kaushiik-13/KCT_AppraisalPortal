'use client';

import { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Row, Pick, Toggle, Segmented } from '@/components/settings-rows';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSetup, type Config, type Organization } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'profile', label: 'Organization profile' },
  { id: 'dates', label: 'Dates and locale' },
  { id: 'email', label: 'Invitations and email' },
  { id: 'access', label: 'Access and security' },
  { id: 'data', label: 'Evidence and data' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const TYPES = ['Educational institution', 'Software or IT company', 'Consulting or services', 'Healthcare', 'Banking or finance', 'Manufacturing', 'Government or public sector', 'Other'];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore', 'Other'];
const SIZES = ['Up to 50', '51 to 200', '201 to 500', '501 to 2,000', 'More than 2,000'];
const ZONES = ['Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Chicago', 'America/Los_Angeles'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = [{ n: 1, l: 'Mon' }, { n: 2, l: 'Tue' }, { n: 3, l: 'Wed' }, { n: 4, l: 'Thu' }, { n: 5, l: 'Fri' }, { n: 6, l: 'Sat' }, { n: 0, l: 'Sun' }];
const EVIDENCE = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Images', 'Video'];
const opts = (list: string[]) => list.map((v) => ({ value: v, label: v }));

export default function SettingsPage() {
  const { organization, config, setOrganization, setConfig } = useSetup();
  const [tab, setTab] = useState<TabId>('profile');
  const [org, setOrg] = useState<Organization>(organization);
  const [cfg, setCfg] = useState<Config>(config);
  const [domain, setDomain] = useState('');
  const [saved, setSaved] = useState(false);

  // Start the drafts from the stored values once they have loaded from sessionStorage.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!ready) {
      setOrg(organization);
      setCfg(config);
      setReady(true);
    }
  }, [organization, config, ready]);

  const dirty = JSON.stringify(org) !== JSON.stringify(organization) || JSON.stringify(cfg) !== JSON.stringify(config);
  const patchOrg = (p: Partial<Organization>) => {
    setSaved(false);
    setOrg((o) => ({ ...o, ...p }));
  };
  const patchCfg = (p: Partial<Config>) => {
    setSaved(false);
    setCfg((c) => ({ ...c, ...p }));
  };
  const save = () => {
    setOrganization(org);
    setConfig(cfg);
    setSaved(true);
  };
  const discard = () => {
    setOrg(organization);
    setCfg(config);
  };
  const flip = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const addDomain = () => {
    const d = domain.trim().toLowerCase().replace(/^@/, '');
    if (d && !cfg.allowedDomains.includes(d)) patchCfg({ allowedDomains: [...cfg.allowedDomains, d] });
    setDomain('');
  };

  const text = (label: string, key: keyof Organization, placeholder?: string, type = 'text') => (
    <Input aria-label={label} type={type} placeholder={placeholder} value={org[key]} onChange={(e) => patchOrg({ [key]: e.target.value })} />
  );

  return (
    <>
      <PageHeader title="Settings" description="Organization-wide settings. Changes apply to everyone once you save." />

      <div className="grid gap-8 md:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto md:grid md:content-start md:overflow-visible">
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
            {tab === 'profile' && (
              <>
                <Row title="Organization name" hint="Shown in the sidebar and in emails.">{text('Organization name', 'name', 'Acme Industries')}</Row>
                <Row title="Type" hint="What kind of organization this is.">
                  <Pick label="Organization type" value={org.type || TYPES[0]} onChange={(v) => patchOrg({ type: v })} options={opts(TYPES)} />
                </Row>
                <Row title="Number of employees" hint="An approximate range is fine.">
                  <Pick label="Number of employees" value={org.size || SIZES[0]} onChange={(v) => patchOrg({ size: v })} options={opts(SIZES)} />
                </Row>
                <Row title="Country" hint="Where your organization is based.">
                  <Pick label="Country" value={org.country || COUNTRIES[0]} onChange={(v) => patchOrg({ country: v })} options={opts(COUNTRIES)} />
                </Row>
                <Row title="City" hint="Shown under the name in the sidebar.">{text('City', 'city', 'Coimbatore')}</Row>
                <Row title="Website" hint="Optional.">{text('Website', 'website', 'https://acme.com')}</Row>
                <Row title="Contact email" hint="Where AFPI sends organization notices.">{text('Contact email', 'contactEmail', 'hr@acme.com', 'email')}</Row>
                <Row title="Phone" hint="Optional.">{text('Phone', 'phone', '+91 98765 43210', 'tel')}</Row>
              </>
            )}

            {tab === 'dates' && (
              <>
                <Row title="Time zone" hint="Used for deadlines, reminders and report dates.">
                  <Pick label="Time zone" value={cfg.timeZone} onChange={(v) => patchCfg({ timeZone: v })} options={ZONES.map((z) => ({ value: z, label: z.replace('_', ' ') }))} />
                </Row>
                <Row title="Appraisal year starts in" hint="Your appraisal periods follow this month.">
                  <Pick label="Appraisal year start month" value={String(cfg.yearStartMonth)} onChange={(v) => patchCfg({ yearStartMonth: Number(v) })} options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} />
                </Row>
                <Row title="Date format" hint="How dates are shown to everyone.">
                  <Pick label="Date format" value={cfg.dateFormat} onChange={(v) => patchCfg({ dateFormat: v as Config['dateFormat'] })} options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((f) => ({ value: f, label: f }))} />
                </Row>
                <Row title="Week starts on" hint="Used in calendars and weekly views.">
                  <Segmented label="Week starts on" value={cfg.weekStart} onChange={(v) => patchCfg({ weekStart: v })} items={[{ value: 'monday', label: 'Monday' }, { value: 'sunday', label: 'Sunday' }, { value: 'saturday', label: 'Saturday' }]} />
                </Row>
                <Row title="Working days" hint="Deadlines and reminders skip the days you switch off.">
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Working days">
                    {DAYS.map((d) => (
                      <Toggle key={d.n} on={cfg.workingDays.includes(d.n)} onClick={() => patchCfg({ workingDays: cfg.workingDays.includes(d.n) ? cfg.workingDays.filter((x) => x !== d.n) : [...cfg.workingDays, d.n] })}>
                        {d.l}
                      </Toggle>
                    ))}
                  </div>
                </Row>
                <Row title="Language" hint="The language people see by default.">
                  <Pick label="Language" value={cfg.language} onChange={(v) => patchCfg({ language: v })} options={opts(['English', 'Hindi', 'Tamil'])} />
                </Row>
              </>
            )}

            {tab === 'email' && (
              <>
                <Row title="Invitation expires after" hint="After this, an invitation must be sent again.">
                  <Pick label="Invitation expiry" value={String(cfg.inviteExpiryDays)} onChange={(v) => patchCfg({ inviteExpiryDays: Number(v) })} options={[3, 7, 14, 30].map((n) => ({ value: String(n), label: `${n} days` }))} />
                </Row>
                <Row title="Sender name" hint="The name people see on emails from AFPI.">
                  <Input aria-label="Sender name" placeholder="Acme HR Team" value={cfg.senderName} onChange={(e) => patchCfg({ senderName: e.target.value })} />
                </Row>
                <Row title="Reply-to email" hint="Where replies to AFPI emails go.">
                  <Input aria-label="Reply-to email" type="email" placeholder="hr@acme.com" value={cfg.replyTo} onChange={(e) => patchCfg({ replyTo: e.target.value })} />
                </Row>
                <Row title="Reminders" hint="Reminders for pending invitations and unfinished tasks.">
                  <Pick label="Reminders" value={cfg.reminders} onChange={(v) => patchCfg({ reminders: v as Config['reminders'] })} options={[{ value: 'off', label: 'Never' }, { value: 'every3', label: 'Every 3 days' }, { value: 'weekly', label: 'Weekly' }]} />
                </Row>
              </>
            )}

            {tab === 'access' && (
              <>
                <Row title="Sign-in method" hint="How your people sign in to AFPI.">
                  <Segmented label="Sign-in method" value={cfg.signIn} onChange={(v) => patchCfg({ signIn: v })} items={[{ value: 'password', label: 'Password' }, { value: 'sso', label: 'Single sign-on' }, { value: 'both', label: 'Both' }]} />
                </Row>
                <Row title="Allowed email domains" hint="Only these domains can join. Leave empty to allow any." preview={cfg.allowedDomains.length === 0 ? 'Any email domain is allowed.' : undefined}>
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addDomain(); }}>
                    <Input aria-label="Add an email domain" placeholder="acme.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
                    <Button type="submit" variant="outline"><Plus aria-hidden data-icon="inline-start" /> Add</Button>
                  </form>
                  {cfg.allowedDomains.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5">
                      {cfg.allowedDomains.map((d) => (
                        <li key={d} className="bg-muted inline-flex items-center gap-1 rounded-md py-0.5 pr-0.5 pl-2 text-xs">
                          {d}
                          <Button size="icon-xs" variant="ghost" aria-label={`Remove ${d}`} onClick={() => patchCfg({ allowedDomains: cfg.allowedDomains.filter((x) => x !== d) })}>
                            <X aria-hidden />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Row>
                <Row title="Session timeout" hint="People are signed out after this much inactivity.">
                  <Pick label="Session timeout" value={String(cfg.sessionMinutes)} onChange={(v) => patchCfg({ sessionMinutes: Number(v) })} options={[{ value: '30', label: '30 minutes' }, { value: '60', label: '1 hour' }, { value: '240', label: '4 hours' }, { value: '480', label: '8 hours' }]} />
                </Row>
                <Row title="Two-step verification" hint="Ask for a second check when people sign in.">
                  <label className="flex items-center gap-3 text-sm">
                    <Switch aria-label="Two-step verification" checked={cfg.twoStep} onCheckedChange={(v) => patchCfg({ twoStep: v })} />
                    {cfg.twoStep ? 'Required for everyone' : 'Off'}
                  </label>
                </Row>
              </>
            )}

            {tab === 'data' && (
              <>
                <Row title="Allowed file types" hint="People can only upload these kinds of files.">
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Allowed file types">
                    {EVIDENCE.map((t) => (
                      <Toggle key={t} on={cfg.evidenceTypes.includes(t)} onClick={() => patchCfg({ evidenceTypes: flip(cfg.evidenceTypes, t) })}>{t}</Toggle>
                    ))}
                  </div>
                </Row>
                <Row title="Maximum file size" hint="For each uploaded file.">
                  <Pick label="Maximum file size" value={String(cfg.maxFileMb)} onChange={(v) => patchCfg({ maxFileMb: Number(v) })} options={[5, 10, 25, 50].map((n) => ({ value: String(n), label: `${n} MB` }))} />
                </Row>
                <Row title="Keep records for" hint="Appraisal records and evidence are kept this long.">
                  <Pick label="Retention" value={String(cfg.retentionYears)} onChange={(v) => patchCfg({ retentionYears: Number(v) })} options={[{ value: '3', label: '3 years' }, { value: '5', label: '5 years' }, { value: '7', label: '7 years' }, { value: '10', label: '10 years' }, { value: '0', label: 'Until deleted' }]} />
                </Row>
              </>
            )}
          </div>

          {(dirty || saved) && (
            <div className="bg-background sticky bottom-0 -mx-1 flex min-h-14 items-center gap-3 border-t px-1">
              {dirty ? (
                <>
                  <Button onClick={save}>Save changes</Button>
                  <Button variant="ghost" onClick={discard}>Discard</Button>
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
