'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsFilters } from '@/components/frameworks/analytics-filters';
import { FrameworkAnalytics } from '@/components/frameworks/framework-analytics';
import { FrameworksEmpty } from '@/components/frameworks/frameworks-empty';
import { PrototypeStageSwitch } from '@/components/frameworks/prototype-stage-switch';
import type { AnalyticsFilters as Filters, AnalyticsScope, AnalyticsSection } from '@/lib/frameworks/types';
import { useFrameworkAnalytics } from '@/lib/frameworks/use-framework-analytics';
import { useDemoViewer, useFrameworkLibrary } from '@/lib/frameworks/use-framework-library';
import { useSetup } from '@/lib/setup-store';

const ADMIN_SECTIONS: AnalyticsSection[] = ['participation', 'review', 'outcomes', 'health'];
const REVIEWER_SECTIONS: AnalyticsSection[] = ['participation', 'review', 'outcomes'];

// Framework Studio overview (#79). The header and tabs come from frameworks/layout.tsx. The page decides who is looking and what they may see or do;
// the components below never check roles, so a reviewer page can reuse them as they are.
export default function FrameworksPage() {
  const router = useRouter();
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
      {analytics.state !== 'empty' && (
        <div className="-mt-3 flex justify-end">
          <AnalyticsFilters
            value={filters}
            onChange={setFilters}
            kras={kras.map((k) => ({ id: k.id, name: k.name }))}
            departments={canBuild ? departments.map((d) => ({ id: d.id, name: d.name })) : undefined}
          />
        </div>
      )}

      {analytics.state === 'empty' ? (
        <FrameworksEmpty canBuild={canBuild} onStartFromTemplate={() => setStage('built')} onCreateFromScratch={() => router.push('/frameworks/library#new-kra')} />
      ) : (
        <FrameworkAnalytics analytics={analytics} sections={canBuild ? ADMIN_SECTIONS : REVIEWER_SECTIONS} />
      )}

      <PrototypeStageSwitch />
    </>
  );
}
