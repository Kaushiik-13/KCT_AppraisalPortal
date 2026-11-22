'use client';

import { Building2, CircleCheck, ImageUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SETUP_STEPS } from '@/lib/setup-steps';
import { useSetup } from '@/lib/setup-store';

const TYPES = ['Educational institution', 'Software or IT company', 'Consulting or services', 'Healthcare', 'Banking or finance', 'Manufacturing', 'Government or public sector', 'Other'];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore', 'Other'];
const SIZES = ['Up to 50', '51 to 200', '201 to 500', '501 to 2,000', 'More than 2,000'];

function Field({ id, label, hint, children, className }: { id: string; label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid content-start gap-1.5 ${className ?? ''}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

function Pick({ id, placeholder, items, value, onChange }: { id: string; placeholder: string; items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((t) => (
          <SelectItem key={t} value={t}>{t}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function OrganizationPage() {
  const { organization: o, setOrganization } = useSetup();
  const { name, type, country, city } = o;

  const meta = [type, [city, country].filter(Boolean).join(', ')].filter(Boolean).join(' · ');

  return (
    <>
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold tracking-tight">Your organization</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about the organization you are setting up. You can edit this later.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Basic details</CardTitle>
              <CardDescription>How your organization appears across AFPI.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label="Organization name" className="sm:col-span-2">
                <Input id="name" placeholder="Acme Technologies" value={name} onChange={(e) => setOrganization({ name: e.target.value })} />
              </Field>
              <Field id="type" label="Type">
                <Pick id="type" placeholder="Select type" items={TYPES} value={o.type} onChange={(v) => setOrganization({ type: v })} />
              </Field>
              <Field id="size" label="Number of employees" hint="An estimate is fine.">
                <Pick id="size" placeholder="Select range" items={SIZES} value={o.size} onChange={(v) => setOrganization({ size: v })} />
              </Field>
              <Field id="country" label="Country">
                <Pick id="country" placeholder="Select country" items={COUNTRIES} value={o.country} onChange={(v) => setOrganization({ country: v })} />
              </Field>
              <Field id="city" label="City">
                <Input id="city" placeholder="Bengaluru" value={city} onChange={(e) => setOrganization({ city: e.target.value })} />
              </Field>
              <Field id="website" label="Website" className="sm:col-span-2">
                <Input id="website" placeholder="https://www.acme.com" value={o.website} onChange={(e) => setOrganization({ website: e.target.value })} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Used for notices about your organization account.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field id="contact" label="Official contact email">
                <Input id="contact" type="email" placeholder="hr@acme.com" value={o.contactEmail} onChange={(e) => setOrganization({ contactEmail: e.target.value })} />
              </Field>
              <Field id="phone" label="Phone">
                <Input id="phone" type="tel" placeholder="+91 98765 43210" value={o.phone} onChange={(e) => setOrganization({ phone: e.target.value })} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Optional. Shown to your employees and reviewers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground flex items-center gap-4 rounded-md border border-dashed p-4 text-sm">
                <ImageUp aria-hidden className="size-5 shrink-0" />
                <span>Drag a PNG or SVG here, or choose a file. Up to 2 MB.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-10">
          <Card size="sm">
            <CardHeader>
              <CardDescription>Preview</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <span className="bg-muted text-muted-foreground grid size-11 shrink-0 place-items-center rounded-md border">
                {name ? <span className="text-foreground text-base font-semibold">{name.trim()[0]?.toUpperCase()}</span> : <Building2 aria-hidden className="size-5" />}
              </span>
              <div className="min-w-0">
                <div className={`truncate text-sm font-medium ${name ? '' : 'text-muted-foreground'}`}>{name || 'Your organization'}</div>
                <div className="text-muted-foreground truncate text-xs">{meta || 'Type · City, Country'}</div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>What happens next</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2.5 text-sm">
                {SETUP_STEPS.slice(1).map((s) => (
                  <li key={s.path} className="flex items-start gap-2">
                    <CircleCheck aria-hidden className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <span>
                      {s.label}
                      <span className="text-muted-foreground block text-xs">{s.hint}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <p className="text-muted-foreground text-xs">
            Nobody is emailed until the final review step.
          </p>
        </aside>
      </div>
    </>
  );
}
