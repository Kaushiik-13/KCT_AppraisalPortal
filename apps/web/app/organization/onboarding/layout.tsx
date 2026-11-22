import { Stepper } from '@/components/org/stepper';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-8">
      <Stepper />
      {children}
    </div>
  );
}
