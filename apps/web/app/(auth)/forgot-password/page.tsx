'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  return (
    <div className="grid gap-6">
      {sentTo === null ? (
        <>
          <div className="grid gap-1">
            <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your work email and we will send you a link to choose a new password.
            </p>
          </div>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSentTo(String(new FormData(e.currentTarget).get('email') ?? ''));
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="name@company.com" />
            </div>
            <Button type="submit" size="lg">
              Send reset link
            </Button>
          </form>
        </>
      ) : (
        <div className="grid gap-4">
          <span className="bg-muted text-foreground grid size-10 place-items-center rounded-lg">
            <MailCheck className="size-5" aria-hidden />
          </span>
          <div className="grid gap-1">
            <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground text-sm">
              If {sentTo ? <span className="text-foreground font-medium">{sentTo}</span> : 'that address'} has an
              account, a reset link is on its way. The link works for 1 hour.
            </p>
          </div>
          <Button variant="outline" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </div>
      )}

      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to log in
      </Link>
    </div>
  );
}
