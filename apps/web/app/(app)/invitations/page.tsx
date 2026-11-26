'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DepartmentChip } from '@/components/department-chip';
import { PageHeader } from '@/components/page-header';
import { SearchField } from '@/components/search-field';
import { StatusDot } from '@/components/status-dot';
import { StatusTabs } from '@/components/status-tabs';
import { TableEmpty } from '@/components/table-empty';
import { colorOf } from '@/lib/department-colors';
import { useSetup } from '@/lib/setup-store';
import { cn } from '@/lib/utils';

type Status = 'not_sent' | 'invited' | 'joined' | 'expired' | 'failed';

const STATUS: Record<Status, { label: string; dot: string }> = {
  not_sent: { label: 'Not sent', dot: 'bg-muted-foreground/50' },
  invited: { label: 'Invited', dot: 'bg-info' },
  joined: { label: 'Joined', dot: 'bg-success' },
  expired: { label: 'Expired', dot: 'bg-warning' },
  failed: { label: 'Failed', dot: 'bg-destructive' },
};

// Prototype only: after "Send invitations" there is no real delivery data, so sample statuses are cycled.
const SAMPLE: Status[] = ['joined', 'joined', 'invited', 'expired', 'failed'];
const SAMPLE_DETAIL: Record<Status, string> = {
  not_sent: 'Waiting to be sent',
  invited: 'Link works for 5 more days',
  joined: 'Joined 2 days ago',
  expired: 'Link expired 2 days ago',
  failed: 'Email address bounced',
};

const FILTERS: { key: 'all' | Status; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'invited', label: 'Invited' },
  { key: 'joined', label: 'Joined' },
  { key: 'expired', label: 'Expired' },
  { key: 'failed', label: 'Failed' },
];

export default function InvitationsPage() {
  const { employees, departments, invitesSent, config } = useSetup();
  const [overrides, setOverrides] = useState<Record<string, { status: Status; detail: string }>>({});
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const rows = useMemo(
    () =>
      employees.map((e, i) => {
        const base: Status = invitesSent ? SAMPLE[i % SAMPLE.length] : 'not_sent';
        const o = overrides[e.id];
        const status = o?.status ?? base;
        const dIndex = departments.findIndex((d) => d.id === e.departmentId);
        return {
          e,
          status,
          detail: o?.detail ?? SAMPLE_DETAIL[base],
          dept: departments[dIndex],
          color: colorOf(departments[dIndex]?.color, Math.max(dIndex, 0)),
        };
      }),
    [employees, departments, invitesSent, overrides],
  );

  const count = (k: 'all' | Status) => (k === 'all' ? rows.length : rows.filter((r) => r.status === k).length);
  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      (filter === 'all' || r.status === filter) &&
      (!q || r.e.name.toLowerCase().includes(q) || r.e.email.toLowerCase().includes(q)),
  );

  const canResend = (s: Status) => s === 'invited' || s === 'expired' || s === 'failed';
  const resend = (ids: string[]) => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const id of ids) next[id] = { status: 'invited', detail: `Sent just now · works for ${config.inviteExpiryDays} days` };
      return next;
    });
    setPicked(new Set());
  };

  const pickedResendable = [...picked].filter((id) => canResend(rows.find((r) => r.e.id === id)?.status ?? 'joined'));
  const allVisiblePicked = visible.length > 0 && visible.every((r) => picked.has(r.e.id));

  return (
    <>
      <PageHeader title="Invitations" description="See who has joined, and resend links that were not used or did not arrive." />

      {!invitesSent && (
        <div className="bg-secondary/60 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
          <span>Invitations have not been sent yet. Nobody can sign in until they are.</span>
          <Button size="sm" asChild>
            <Link href="/setup/review">Send invitations</Link>
          </Button>
        </div>
      )}

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusTabs
            label="Filter by status"
            items={FILTERS.map((f) => ({ key: f.key, label: f.label, count: count(f.key) }))}
            value={filter}
            onChange={setFilter}
          />
          <SearchField value={query} onChange={setQuery} placeholder="Search name or email" label="Search invitations" className="w-full sm:w-64" />
        </div>

        {picked.size > 0 && (
          <div className="bg-primary/5 border-primary/20 flex items-center justify-between rounded-lg border px-4 py-2 text-sm">
            <span>{picked.size} selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={pickedResendable.length === 0} onClick={() => resend(pickedResendable)}>
                Resend {pickedResendable.length}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPicked(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="bg-card overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b text-left text-xs">
              <tr>
                <th className="w-10 py-2 pl-4">
                  <Checkbox
                    aria-label="Select all shown"
                    checked={allVisiblePicked}
                    onCheckedChange={(v) =>
                      setPicked(v === true ? new Set(visible.map((r) => r.e.id)) : new Set())
                    }
                  />
                </th>
                <th className="px-3 py-2 font-medium">Person</th>
                <th className="px-3 py-2 font-medium">Department</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Detail</th>
                <th className="px-4 py-2 text-right font-medium">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map(({ e, status, detail, dept, color }) => (
                <tr key={e.id} className={cn(picked.has(e.id) && 'bg-primary/5')}>
                  <td className="py-2.5 pl-4">
                    <Checkbox
                      aria-label={`Select ${e.name}`}
                      checked={picked.has(e.id)}
                      onCheckedChange={(v) =>
                        setPicked((prev) => {
                          const n = new Set(prev);
                          if (v === true) n.add(e.id);
                          else n.delete(e.id);
                          return n;
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="grid">
                      <span className="font-medium">{e.name}</span>
                      <span className="text-muted-foreground text-xs">{e.email}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <DepartmentChip name={dept?.name} color={dept ? color : undefined} />
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusDot label={STATUS[status].label} dot={STATUS[status].dot} />
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5 text-xs">{detail}</td>
                  <td className="px-4 py-2.5 text-right">
                    {canResend(status) && (
                      <Button variant="outline" size="sm" onClick={() => resend([e.id])}>
                        {status === 'failed' ? 'Retry' : 'Resend'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <TableEmpty colSpan={6}>No invitations match.</TableEmpty>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
