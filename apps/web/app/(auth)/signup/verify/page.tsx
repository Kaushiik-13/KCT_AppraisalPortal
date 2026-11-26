'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LENGTH = 6;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('your email');
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [seconds, setSeconds] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('afpi-signup-email');
      if (saved) setEmail(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setAt = (i: number, v: string) =>
    setDigits((d) => d.map((x, n) => (n === i ? v : x)));

  const onChange = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, '').slice(-1);
    setAt(i, v);
    if (v && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    setDigits(Array.from({ length: LENGTH }, (_, n) => text[n] ?? ''));
    refs.current[Math.min(text.length, LENGTH - 1)]?.focus();
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-muted-foreground text-sm">
          We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>.
        </p>
      </div>

      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push('/setup/organization');
        }}
      >
        <div className="flex gap-2" onPaste={onPaste} role="group" aria-label="Verification code">
          {digits.map((d, i) => (
            <Input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${i + 1}`}
              className="h-11 px-0 text-center text-lg font-medium tabular-nums"
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => e.currentTarget.select()}
            />
          ))}
        </div>
        <Button type="submit" size="lg">
          Verify and continue
        </Button>
      </form>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        {seconds > 0 ? (
          <span>Resend code in {seconds}s</span>
        ) : (
          <button type="button" className="text-foreground underline underline-offset-4" onClick={() => setSeconds(30)}>
            Resend code
          </button>
        )}
        <Link href="/signup" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft aria-hidden className="size-3.5" /> Use a different email
        </Link>
      </div>
    </div>
  );
}
