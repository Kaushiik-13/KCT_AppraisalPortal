'use client';

import { useSyncExternalStore } from 'react';
import { SAMPLE_KPIS, SAMPLE_KRAS } from './sample-data';
import type { Kpi, Kra } from './types';

/**
 * Prototype demo stage, so people reviewing the prototype can see every state of the Frameworks page:
 * empty (nothing built), built (framework exists, no submissions yet) and active (a cycle is running).
 * One shared store, kept in sessionStorage like the rest of the prototype, so every component that
 * reads it updates together. Replaced by real data when the API exists.
 */
export type DemoStage = 'empty' | 'built' | 'active';
const KEY = 'afpi-frameworks-demo';
const DEFAULT_STAGE: DemoStage = 'active';

const listeners = new Set<() => void>();
let current: DemoStage | null = null;

function read(): DemoStage {
  if (current) return current;
  try {
    const saved = sessionStorage.getItem(KEY);
    current = saved === 'empty' || saved === 'built' || saved === 'active' ? saved : DEFAULT_STAGE;
  } catch {
    current = DEFAULT_STAGE;
  }
  return current;
}

export function setDemoStage(next: DemoStage) {
  current = next;
  try {
    sessionStorage.setItem(KEY, next);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function libraryFor(stage: DemoStage): { kras: Kra[]; kpis: Kpi[] } {
  return stage === 'empty' ? { kras: [], kpis: [] } : { kras: SAMPLE_KRAS, kpis: SAMPLE_KPIS };
}

export function useFrameworkLibrary() {
  const stage = useSyncExternalStore(subscribe, read, () => DEFAULT_STAGE);
  return { ...libraryFor(stage), stage, setStage: setDemoStage };
}
