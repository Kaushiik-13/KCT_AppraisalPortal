'use client';

import { useSyncExternalStore } from 'react';
import { SAMPLE_KPIS, SAMPLE_KRAS } from './sample-data';
import type { Kpi, Kra } from './types';

/**
 * Prototype demo controls, so people reviewing the prototype can see every state of a Frameworks screen:
 * - stage: empty (nothing built), built (framework exists, no submissions yet), active (a cycle is running)
 * - viewer: admin (can build) or reviewer (read-only, own team only)
 * One shared store, kept in sessionStorage like the rest of the prototype, so every component that reads
 * it updates together. Replaced by real data and the signed-in user's role when the API exists.
 */
export type DemoStage = 'empty' | 'built' | 'active';
export type DemoViewer = 'admin' | 'reviewer';
type Demo = { stage: DemoStage; viewer: DemoViewer };

const KEY = 'afpi-frameworks-demo';
const DEFAULT: Demo = { stage: 'active', viewer: 'admin' };

const listeners = new Set<() => void>();
let current: Demo | null = null;

function read(): Demo {
  if (current) return current;
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Partial<Demo> | null;
    current = {
      stage: saved?.stage === 'empty' || saved?.stage === 'built' || saved?.stage === 'active' ? saved.stage : DEFAULT.stage,
      viewer: saved?.viewer === 'reviewer' ? 'reviewer' : DEFAULT.viewer,
    };
  } catch {
    current = DEFAULT;
  }
  return current;
}

function write(patch: Partial<Demo>) {
  current = { ...read(), ...patch };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current));
  } catch {}
  listeners.forEach((l) => l());
}

export const setDemoStage = (stage: DemoStage) => write({ stage });
export const setDemoViewer = (viewer: DemoViewer) => write({ viewer });

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const useDemo = () => useSyncExternalStore(subscribe, read, () => DEFAULT);

export function libraryFor(stage: DemoStage): { kras: Kra[]; kpis: Kpi[] } {
  return stage === 'empty' ? { kras: [], kpis: [] } : { kras: SAMPLE_KRAS, kpis: SAMPLE_KPIS };
}

/** The organization's KRAs and KPIs (sample data in the prototype). */
export function useFrameworkLibrary() {
  const { stage } = useDemo();
  return { ...libraryFor(stage), stage, setStage: setDemoStage };
}

/** Prototype stand-in for the signed-in person's role on Frameworks screens. */
export function useDemoViewer() {
  const { viewer } = useDemo();
  return { viewer, setViewer: setDemoViewer };
}
