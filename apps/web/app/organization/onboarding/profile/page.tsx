'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoticeBar, StepFooter, StepHeader } from '@/components/org/step-parts';
import { useOnboarding } from '@/components/org/onboarding-context';
import { Field } from '@/components/org/ui-parts';
import { COUNTRIES, INSTITUTION_TYPES, TIME_ZONES } from '@/lib/org/seed';
import { validateProfile } from '@/lib/org/validation';
import type { Profile } from '@/lib/org/types';

export default function ProfilePage() {
  const { profile, setProfile } = useOnboarding();
  const [touched, setTouched] = useState<Partial<Record<keyof Profile, boolean>>>({});
  const errors = validateProfile(profile);
  const show = (k: keyof Profile) => (touched[k] ? errors[k] : undefined);
  const touch = (k: keyof Profile) => setTouched((t) => ({ ...t, [k]: true }));
  const set = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch });

  return (
    <div className="grid max-w-2xl gap-6">
      <StepHeader
        title="Institution profile"
        description="Tell us about your institution. This sets the context for every appraisal in this workspace."
      />
      <NoticeBar />
      <Card>
        <CardContent className="grid gap-5 pt-6">
          <Field
            id="inst-name"
            label="Institution name"
            required
            autoComplete="organization"
            value={profile.name}
            onChange={(e) => set({ name: e.target.value })}
            onBlur={() => touch('name')}
            error={show('name')}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="inst-type" label="Institution type" required error={show('type')}>
              <Select value={profile.type} onValueChange={(v) => { set({ type: v }); touch('type'); }}>
                <SelectTrigger id="inst-type" className="w-full" aria-invalid={show('type') ? true : undefined}>
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              id="inst-email"
              label="Official contact email"
              type="email"
              required
              autoComplete="email"
              hint="Used for institution-level notices. A shared office mailbox is fine here."
              value={profile.contactEmail}
              onChange={(e) => set({ contactEmail: e.target.value })}
              onBlur={() => touch('contactEmail')}
              error={show('contactEmail')}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="inst-country" label="Country" required error={show('country')}>
              <Select value={profile.country} onValueChange={(v) => { set({ country: v }); touch('country'); }}>
                <SelectTrigger id="inst-country" className="w-full" aria-invalid={show('country') ? true : undefined}>
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              id="inst-tz"
              label="Time zone"
              required
              hint="Appraisal deadlines and reminders follow this time zone."
              error={show('timeZone')}
            >
              <Select value={profile.timeZone} onValueChange={(v) => { set({ timeZone: v }); touch('timeZone'); }}>
                <SelectTrigger id="inst-tz" className="w-full" aria-invalid={show('timeZone') ? true : undefined}>
                  <SelectValue placeholder="Choose a time zone" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_ZONES.map((z) => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>
      <StepFooter
        current="profile"
        canContinue
        onContinue={() => {
          if (Object.keys(errors).length === 0) return true;
          setTouched({ name: true, type: true, contactEmail: true, country: true, timeZone: true });
          return false;
        }}
      />
    </div>
  );
}
