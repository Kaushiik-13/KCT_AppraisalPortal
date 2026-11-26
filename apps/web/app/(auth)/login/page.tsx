'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Log in to AFPI</h1>
        <p className="text-muted-foreground text-sm">Use your work email and password.</p>
      </div>

      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push('/home');
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="name@company.com" />
        </div>
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
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
        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="font-normal">
            Keep me signed in on this device
          </Label>
        </div>
        <Button type="submit" size="lg" className="mt-1">
          Log in
        </Button>
      </form>

      <p className="text-muted-foreground text-sm">
        New to AFPI?{' '}
        <Link href="/signup" className="text-foreground underline underline-offset-4">
          Create an administrator account
        </Link>
      </p>
    </div>
  );
}
