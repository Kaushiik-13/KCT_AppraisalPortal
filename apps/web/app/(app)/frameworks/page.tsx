'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsFilters } from '@/components/frameworks/analytics-filters';
import { FrameworkAnalytics } from '@/components/frameworks/framework-analytics';
import { FrameworksEmpty } from '@/components/frameworks/frameworks-empty';
import type { AnalyticsFilters as Filters, AnalyticsSection } from '@/lib/frameworks/types';
import { useFrameworkAnalytics } from '@/lib/frameworks/use-framework-analytics';
import { useFrameworkLibrary } from '@/lib/frameworks/use-framework-library';
import { useSetup } from '@/lib/setup-store';

const SECTIONS: AnalyticsSection[] = ['participation', 'review', 'outcomes', 'health'];

// Framework Studio overview (#79), administrators only for now. The header and tabs come from frameworks/layout.tsx.
// The components below never check roles, so a reviewer view can reuse them later.
export default function FrameworksPage() {
  const router = useRouter();
  const { kras, setStage } = useFrameworkLibrary();
  const { departments } = useSetup();
  const [filters, setFilters] = useState<Filters>({ cycle: '2026-h1', kraId: '', departmentId: '' });
  const analytics = useFrameworkAnalytics({ kind: 'organization' }, filters);

  if (analytics.state === 'empty') {
    return <FrameworksEmpty canBuild onStartFromTemplate={() => setStage('built')} onCreateFromScratch={() => router.push('/frameworks/library#new-kra')} />;
  }

  return (
    <>
      <div className="-mt-3 flex justify-end">
        <AnalyticsFilters
          value={filters}
          onChange={setFilters}
          kras={kras.filter((k) => !k.archived).map((k) => ({ id: k.id, name: k.name }))}
          departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        />
      </div>
      <FrameworkAnalytics analytics={analytics} sections={SECTIONS} />
    </>
  );
}
