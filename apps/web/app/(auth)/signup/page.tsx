'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignUpPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Create your administrator account</h1>
        <p className="text-muted-foreground text-sm">
          You will set up and manage your organization in AFPI.
        </p>
      </div>

      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const email = String(data.get('email') ?? '');
          try {
            sessionStorage.setItem('afpi-signup-email', email);
            sessionStorage.setItem('afpi-signup-name', String(data.get('name') ?? ''));
          } catch {}
          router.push('/signup/verify');
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Priya Raman" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="name@company.com" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
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
          Create account
        </Button>
      </form>

      <p className="text-muted-foreground text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
