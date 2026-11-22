'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, Clock, MailX, Moon, Send, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { DisplayInviteStatus } from '@/lib/org/types';

const TONE = {
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  info: 'border-info/40 bg-info/10 text-info',
  danger: 'border-destructive/40 bg-destructive/10 text-destructive',
  muted: 'border-border bg-muted text-muted-foreground',
} as const;

export function ToneBadge({ tone, children }: { tone: keyof typeof TONE; children: React.ReactNode }) {
  return (
    <Badge variant="outline" className={cn('gap-1', TONE[tone])}>
      {children}
    </Badge>
  );
}

// Status always has text, never colour alone.
export function InviteBadge({ status }: { status: DisplayInviteStatus }) {
  switch (status) {
    case 'draft':
      return <ToneBadge tone="muted"><Clock aria-hidden /> Not invited yet</ToneBadge>;
    case 'invited':
      return <ToneBadge tone="info"><Send aria-hidden /> Invited</ToneBadge>;
    case 'accepted':
      return <ToneBadge tone="success"><CheckCircle2 aria-hidden /> Accepted</ToneBadge>;
    case 'expired':
      return <ToneBadge tone="warning"><Clock aria-hidden /> Invitation expired</ToneBadge>;
    case 'failed':
      return <ToneBadge tone="danger"><MailX aria-hidden /> Could not be delivered</ToneBadge>;
  }
}

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children?: React.ReactNode;
} & Omit<React.ComponentProps<'input'>, 'id'>;

// Labelled field with an accessible error and hint. Pass children to render a
// custom control (for example a Select) in place of the default input.
export function Field({ id, label, hint, error, required, children, className, ...inputProps }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-muted-foreground font-normal"> (required)</span> : null}
      </Label>
      {children ?? (
        <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...inputProps} />
      )}
      {hint ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-destructive flex items-start gap-1 text-xs">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const prefers = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    setDark(prefers);
    document.documentElement.classList.toggle('dark', prefers);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('dark', next);
      }}
    >
      {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  );
}
