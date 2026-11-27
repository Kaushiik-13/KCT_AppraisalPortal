'use client';

import type { ReactNode } from 'react';
import { SetupProvider } from '@/lib/setup-store';

// Focus mode for Studio builders (#79): no sidebar or top bar, so the editor gets the whole screen.
// Each page supplies its own top bar with a clear way back.
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <SetupProvider>
      <div className="bg-background min-h-screen">{children}</div>
    </SetupProvider>
  );
}
