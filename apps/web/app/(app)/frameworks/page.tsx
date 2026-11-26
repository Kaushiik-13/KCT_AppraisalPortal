'use client';

import { useState } from 'react';
import { AnalyticsFilters } from '@/components/frameworks/analytics-filters';
import { FrameworkAnalytics } from '@/components/frameworks/framework-analytics';
import { FrameworksEmpty } from '@/components/frameworks/frameworks-empty';
import { PrototypeStageSwitch } from '@/components/frameworks/prototype-stage-switch';
import { PageHeader } from '@/components/page-header';
import type { AnalyticsFilters as Filters, AnalyticsScope, AnalyticsSection } from '@/lib/frameworks/types';
import { useFrameworkAnalytics } from '@/lib/frameworks/use-framework-analytics';
import { useDemoViewer, useFrameworkLibrary } from '@/lib/frameworks/use-framework-library';
import { useSetup } from '@/lib/setup-store';

const ADMIN_SECTIONS: AnalyticsSection[] = ['participation', 'review', 'outcomes', 'health'];
const REVIEWER_SECTIONS: AnalyticsSection[] = ['participation', 'review', 'outcomes'];

// Framework Studio (#79). The page decides who is looking and what they may see or do;
// the components below never check roles, so a reviewer page can reuse them as they are.
export default function FrameworksPage() {
  const { kras, setStage } = useFrameworkLibrary();
  const { viewer } = useDemoViewer();
  const { departments, employees } = useSetup();
  const [filters, setFilters] = useState<Filters>({ cycle: '2026-h1', kraId: '', departmentId: '' });

  const canBuild = viewer === 'admin';
  const reviewerId = employees.find((e) => e.isReviewer)?.id ?? 'sample-reviewer';
  const scope: AnalyticsScope = canBuild ? { kind: 'organization' } : { kind: 'reviewer', reviewerId };
  const analytics = useFrameworkAnalytics(scope, filters);

  return (
    <>
      <PageHeader
        title="Frameworks"
        description={
          canBuild
            ? "Build the KRAs and KPIs your organization appraises against. Drafts don't affect anyone until published."
            : 'Progress on the KRAs and KPIs your team is appraised against.'
        }
        actions={
          analytics.state !== 'empty' && (
            <AnalyticsFilters
              value={filters}
              onChange={setFilters}
              kras={kras.map((k) => ({ id: k.id, name: k.name }))}
              departments={canBuild ? departments.map((d) => ({ id: d.id, name: d.name })) : undefined}
            />
          )
        }
      />

      {analytics.state === 'empty' ? (
        <FrameworksEmpty canBuild={canBuild} onStartFromTemplate={() => setStage('built')} />
      ) : (
        <FrameworkAnalytics analytics={analytics} sections={canBuild ? ADMIN_SECTIONS : REVIEWER_SECTIONS} />
      )}

      <PrototypeStageSwitch />
    </>
  );
}
