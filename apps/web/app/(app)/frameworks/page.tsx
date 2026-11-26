'use client';

import { BarChart3, TriangleAlert } from 'lucide-react';
import { FrameworksEmpty } from '@/components/frameworks/frameworks-empty';
import { PrototypeStageSwitch } from '@/components/frameworks/prototype-stage-switch';
import { PageHeader } from '@/components/page-header';
import type { AnalyticsFilters, AnalyticsScope, FrameworkAnalytics } from '@/lib/frameworks/types';
import { useFrameworkAnalytics } from '@/lib/frameworks/use-framework-analytics';
import { useDemoViewer, useFrameworkLibrary } from '@/lib/frameworks/use-framework-library';
import { useSetup } from '@/lib/setup-store';

const ALL: AnalyticsFilters = { cycle: '2026-h1', kraId: '', departmentId: '' };

// Framework Studio (#79). The page decides who is looking and what they may do; the components below never check roles.
export default function FrameworksPage() {
  const { stage, setStage } = useFrameworkLibrary();
  const { viewer } = useDemoViewer();
  const { employees } = useSetup();
  const canBuild = viewer === 'admin';
  const reviewerId = employees.find((e) => e.isReviewer)?.id ?? 'sample-reviewer';
  const scope: AnalyticsScope = canBuild ? { kind: 'organization' } : { kind: 'reviewer', reviewerId };
  const analytics = useFrameworkAnalytics(scope, ALL);

  return (
    <>
      <PageHeader
        title="Frameworks"
        description={
          canBuild
            ? "Build the KRAs and KPIs your organization appraises against. Drafts don't affect anyone until published."
            : 'Progress on the KRAs and KPIs your team is appraised against.'
        }
      />

      {analytics.state === 'empty' ? (
        <FrameworksEmpty canBuild={canBuild} onStartFromTemplate={() => setStage('built')} />
      ) : (
        <>
          <section className="bg-card text-muted-foreground grid place-items-center gap-2 rounded-xl border px-6 py-12 text-center text-sm">
            <BarChart3 className="size-6" aria-hidden />
            The analytics overview is built in the next step.
          </section>
          {canBuild && (
            <p className="border-warning/30 bg-warning/10 text-warning flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              Weights, maximums and caps are placeholders until scoring policy is approved.
            </p>
          )}
        </>
      )}

      <PrototypeStageSwitch>
        <DataCheck analytics={analytics} stage={stage} />
      </PrototypeStageSwitch>
    </>
  );
}

// Temporary readout so the data layer can be checked on the preview. Replaced by the analytics in step 4.
function DataCheck({ analytics: a, stage }: { analytics: FrameworkAnalytics; stage: string }) {
  const line = [
    `stage: ${stage}`,
    `scope: ${a.scope.kind}`,
    `state: ${a.state}`,
    a.health && `${a.health.kras} KRAs, ${a.health.kpis} KPIs (${a.health.published} published, ${a.health.drafts} drafts), ${a.health.incomplete.length} incomplete`,
    a.participation && `${a.participation.people} people, ${a.participation.submissionRate}% submitted, most submitted ${a.participation.mostSubmitted[0]?.code}`,
    a.review && `most returned ${a.review.mostReturned[0]?.code} (${a.review.mostReturned[0]?.returnRate}%)`,
  ]
    .filter(Boolean)
    .join(' · ');
  return <p className="text-muted-foreground font-mono text-xs break-words">Data check: {line}</p>;
}
