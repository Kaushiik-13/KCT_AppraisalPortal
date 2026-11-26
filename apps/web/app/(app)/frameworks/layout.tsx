'use client';

import type { ReactNode } from 'react';
import { FrameworksTabs } from '@/components/frameworks/frameworks-tabs';
import { PageHeader } from '@/components/page-header';
import { useDemoViewer } from '@/lib/frameworks/use-framework-library';

// Shared header and tabs for every Framework Studio page. Reviewers only get the overview, so no tabs.
export default function FrameworksLayout({ children }: { children: ReactNode }) {
  const { viewer } = useDemoViewer();
  const canBuild = viewer === 'admin';
  return (
    <>
      <div className="grid gap-5">
        <PageHeader
          title="Frameworks"
          description={
            canBuild
              ? "Build the KRAs and KPIs your organization appraises against. Drafts don't affect anyone until published."
              : 'Progress on the KRAs and KPIs your team is appraised against.'
          }
        />
        {canBuild && (
          <FrameworksTabs
            tabs={[
              { href: '/frameworks', label: 'Overview' },
              { href: '/frameworks/library', label: 'KRAs and KPIs' },
            ]}
          />
        )}
      </div>
      {children}
    </>
  );
}
