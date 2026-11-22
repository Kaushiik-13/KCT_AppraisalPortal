'use client';

import { useState } from 'react';
import { CheckCircle2, Info, MailCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NoticeBar, StepFooter, StepHeader } from '@/components/org/step-parts';
import { useOnboarding } from '@/components/org/onboarding-context';
import { Field, ToneBadge } from '@/components/org/ui-parts';
import { isEmail, looksSharedMailbox } from '@/lib/org/validation';

export default function AccountPage() {
  const { admin, setAdmin } = useOnboarding();
  const [touched, setTouched] = useState({ fullName: false, workEmail: false });
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();

  const nameError = touched.fullName && !admin.fullName.trim() ? 'Enter your full name.' : undefined;
  const emailError = !touched.workEmail
    ? undefined
    : !admin.workEmail.trim()
      ? 'Enter your work email.'
      : !isEmail(admin.workEmail)
        ? 'Enter a valid email address, for example name@college.edu.'
        : undefined;
  const shared = isEmail(admin.workEmail) && looksSharedMailbox(admin.workEmail);
  const detailsValid = admin.fullName.trim().length > 0 && isEmail(admin.workEmail);

  return (
    <div className="grid max-w-2xl gap-6">
      <StepHeader
        title="Administrator account"
        description="Create the first administrator account. It belongs to you personally, so actions in the workspace can be traced to a named person."
      />
      <NoticeBar />

      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>We never ask for, or store, the password of your email account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Field
            id="admin-name"
            label="Full name"
            required
            autoComplete="name"
            value={admin.fullName}
            disabled={admin.verified}
            onChange={(e) => setAdmin({ fullName: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
            error={nameError}
          />
          <Field
            id="admin-email"
            label="Work email"
            type="email"
            required
            autoComplete="email"
            hint="Use your own work email, not a shared mailbox."
            value={admin.workEmail}
            disabled={admin.verified}
            onChange={(e) => setAdmin({ workEmail: e.target.value, codeSent: false })}
            onBlur={() => setTouched((t) => ({ ...t, workEmail: true }))}
            error={emailError}
          />
          {shared && !admin.verified ? (
            <Alert className="border-warning/40">
              <Info aria-hidden />
              <AlertTitle>This looks like a shared mailbox</AlertTitle>
              <AlertDescription>
                Addresses like office@ or admin@ are often shared by several people. Use a personal address so this account
                has one clear owner. You can continue if this really is your own mailbox.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Verify your email
            {admin.verified ? (
              <ToneBadge tone="success"><CheckCircle2 aria-hidden /> Verified</ToneBadge>
            ) : admin.codeSent ? (
              <ToneBadge tone="info"><MailCheck aria-hidden /> Code sent</ToneBadge>
            ) : (
              <ToneBadge tone="muted">Not verified</ToneBadge>
            )}
          </CardTitle>
          <CardDescription>
            {admin.verified
              ? 'Your email is verified. You are the owner of this workspace.'
              : 'We send a one-time code to confirm the address belongs to you.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!admin.verified && !admin.codeSent ? (
            <div>
              <Button
                disabled={!detailsValid}
                onClick={() => {
                  setTouched({ fullName: true, workEmail: true });
                  if (detailsValid) setAdmin({ codeSent: true });
                }}
              >
                Send verification code
              </Button>
              {!detailsValid ? (
                <p className="text-muted-foreground mt-2 text-xs">Enter your name and a valid email first.</p>
              ) : null}
            </div>
          ) : null}

          {!admin.verified && admin.codeSent ? (
            <div className="grid gap-3">
              <Alert>
                <MailCheck aria-hidden />
                <AlertTitle>Check {admin.workEmail}</AlertTitle>
                <AlertDescription>Prototype: no email is sent. Enter any six digits to continue.</AlertDescription>
              </Alert>
              <Field
                id="admin-code"
                label="Six-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setCodeError(undefined); }}
                error={codeError}
                className="max-w-48"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    if (code.length !== 6) {
                      setCodeError('Enter all six digits of the code.');
                      return;
                    }
                    setAdmin({ verified: true });
                  }}
                >
                  Verify email
                </Button>
                <Button variant="outline" onClick={() => { setCode(''); setCodeError(undefined); }}>
                  Send a new code
                </Button>
                <Button variant="ghost" onClick={() => setAdmin({ codeSent: false })}>
                  Use a different email
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <StepFooter
        current="account"
        canContinue={admin.verified}
        blockedReason="Verify your email to continue."
      />
    </div>
  );
}
