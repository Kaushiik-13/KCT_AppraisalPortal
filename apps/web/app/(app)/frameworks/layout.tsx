'use client';

import type { ReactNode } from 'react';
import { FrameworksTabs } from '@/components/frameworks/frameworks-tabs';
import { PageHeader } from '@/components/page-header';

// Shared header and tabs for every Framework Studio page. Administrators only for now.
export default function FrameworksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="grid gap-5">
        <PageHeader
          title="Frameworks"
          description="Build the KRAs and KPIs your organization appraises against. Drafts don't affect anyone until published."
        />
        <FrameworksTabs
          tabs={[
            { href: '/frameworks', label: 'Overview' },
            { href: '/frameworks/library', label: 'KRAs and KPIs' },
          ]}
        />
      </div>
      {children}
    </>
  );
}
