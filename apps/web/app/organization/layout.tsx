import type { Metadata } from 'next';
import { OnboardingProvider } from '@/components/org/onboarding-context';
import { OrganizationShell } from '@/components/org/shell';

export const metadata: Metadata = {
  title: 'Organization setup (design prototype) · AFPI',
};

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <OrganizationShell>{children}</OrganizationShell>
    </OnboardingProvider>
  );
}
