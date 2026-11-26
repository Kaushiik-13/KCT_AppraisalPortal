'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Sample invitation shown in the prototype. A real invitation would be looked up from the link.
const INVITE = {
  organization: 'Acme Industries',
  invitedBy: 'Priya Raman',
  name: 'Meera Nair',
  email: 'meera.nair@acme.com',
  department: 'Engineering',
  title: 'Senior Engineer',
};

export default function AcceptInvitationPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Join {INVITE.organization}</h1>
        <p className="text-muted-foreground text-sm">
          {INVITE.invitedBy} invited you to AFPI. Set a password to finish creating your account.
        </p>
      </div>

      <dl className="divide-y rounded-lg border text-sm">
        <div className="flex items-center justify-between gap-4 px-3 py-2">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="truncate font-medium">{INVITE.email}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-3 py-2">
          <dt className="text-muted-foreground">Department</dt>
          <dd className="font-medium">{INVITE.department}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-3 py-2">
          <dt className="text-muted-foreground">Job title</dt>
          <dd className="font-medium">{INVITE.title}</dd>
        </div>
      </dl>

      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push('/login');
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" defaultValue={INVITE.name} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Create password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              className="pr-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="absolute top-1 right-1"
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow((v) => !v)}
            >
              {show ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            </Button>
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-1">
          Accept invitation
        </Button>
      </form>

      <p className="text-muted-foreground text-sm">
        Not you?{' '}
        <Link href="/accept-invitation/expired" className="text-foreground underline underline-offset-4">
          See the expired-link screen
        </Link>
      </p>
    </div>
  );
}
