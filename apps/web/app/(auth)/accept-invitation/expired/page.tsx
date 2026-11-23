import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvitationExpiredPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <span className="bg-muted text-foreground grid size-10 place-items-center rounded-lg">
          <Clock className="size-5" aria-hidden />
        </span>
        <div className="grid gap-1">
          <h1 className="text-xl font-semibold tracking-tight">This invitation has expired</h1>
          <p className="text-muted-foreground text-sm">
            Invitation links stop working after a set number of days. Ask your administrator to send you a new one.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/login">Go to log in</Link>
        </Button>
      </div>

      <Link
        href="/accept-invitation"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to the invitation
      </Link>
    </div>
  );
}
