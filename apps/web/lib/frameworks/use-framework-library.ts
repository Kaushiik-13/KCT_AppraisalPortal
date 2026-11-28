'use client';

import { useSyncExternalStore } from 'react';
import { SAMPLE_KPIS, SAMPLE_KRAS } from './sample-data';
import type { Kpi, KpiContent, Kra } from './types';
import { allRules, unstartedWorkflow, workflowOf } from './workflow';

/**
 * Prototype store for Framework Studio. Frontend only: there is no backend yet.
 * - stage: empty (nothing built), built (framework exists, no submissions), active (a cycle is running).
 *   The prototype starts empty; "Start from template" or creating a KRA moves it to built.
 * - kras / kpis: the organization's library, editable, kept in sessionStorage like the rest of the prototype
 * One shared store, so every component that reads it updates together. Replaced by API calls later.
 */
export type DemoStage = 'empty' | 'built' | 'active';
type State = { stage: DemoStage; kras: Kra[]; kpis: Kpi[] };

const KEY = 'afpi-frameworks-v3';
const DEFAULT_STAGE: DemoStage = 'empty';

export function libraryFor(stage: DemoStage): { kras: Kra[]; kpis: Kpi[] } {
  return stage === 'empty' ? { kras: [], kpis: [] } : { kras: SAMPLE_KRAS, kpis: SAMPLE_KPIS };
}

const SERVER: State = { stage: DEFAULT_STAGE, ...libraryFor(DEFAULT_STAGE) };
const listeners = new Set<() => void>();
let current: State | null = null;

function read(): State {
  if (current) return current;
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Partial<State> | null;
    const stage: DemoStage = saved?.stage === 'empty' || saved?.stage === 'built' || saved?.stage === 'active' ? saved.stage : DEFAULT_STAGE;
    const lib = Array.isArray(saved?.kras) && Array.isArray(saved?.kpis) ? { kras: saved.kras, kpis: saved.kpis } : libraryFor(stage);
    current = { stage, ...lib };
  } catch {
    current = SERVER;
  }
  return current;
}

function write(patch: Partial<State>) {
  current = { ...read(), ...patch };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const useState_ = () => useSyncExternalStore(subscribe, read, () => SERVER);

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const now = () => new Date().toISOString();

/** Fields kept in step with the content, so analytics and lists never disagree with the editor. */
function derived(c: KpiContent) {
  return { evidenceRequired: c.evidenceRequired, hasScoringRules: allRules(workflowOf(c)).length > 0 };
}

export function contentOf(k: Kpi): KpiContent {
  return {
    name: k.name,
    description: k.description,
    kraId: k.kraId,
    appliesTo: k.appliesTo,
    inputs: k.inputs,
    evidenceRequired: k.evidenceRequired,
    evidence: k.evidence,
    rules: k.rules,
    workflow: workflowOf(k),
  };
}

/** The content the editor works on: pending draft changes for a published KPI, otherwise the KPI itself. */
export function editableContent(k: Kpi): KpiContent {
  return k.status === 'published' && k.draft ? k.draft : contentOf(k);
}

/** Next free code in a KRA, for example "TL-6". */
export function nextCode(kra: Kra | undefined, kpis: Kpi[]): string {
  if (!kra) return '';
  const nums = kpis.filter((k) => k.code.startsWith(`${kra.code}-`)).map((k) => Number(k.code.split('-')[1]) || 0);
  return `${kra.code}-${Math.max(0, ...nums) + 1}`;
}

const setKpis = (fn: (kpis: Kpi[]) => Kpi[]) => write({ kpis: fn(read().kpis) });
const setKras = (fn: (kras: Kra[]) => Kra[]) => write({ kras: fn(read().kras) });

export const frameworkActions = {
  setStage(stage: DemoStage) {
    write({ stage, ...libraryFor(stage) });
  },

  addKra(kra: Omit<Kra, 'id'>): string {
    const id = uid('kra');
    setKras((list) => [...list, { ...kra, id }]);
    // Building the first KRA moves the prototype out of the empty state.
    if (read().stage === 'empty') write({ stage: 'built' });
    return id;
  },
  updateKra(id: string, patch: Partial<Omit<Kra, 'id'>>) {
    setKras((list) => list.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  },

  /** Creates a draft KPI and returns its id. Its workflow waits for a starting point. */
  createKpi(kraId: string, details: { name?: string; appliesTo?: string; description?: string } = {}): string {
    const { kras, kpis } = read();
    const kra = kras.find((k) => k.id === kraId);
    const id = uid('kpi');
    const kpi: Kpi = {
      id,
      code: nextCode(kra, kpis),
      name: details.name?.trim() || 'Untitled KPI',
      kraId,
      status: 'draft',
      version: 1,
      hasDraftChanges: false,
      inputs: [],
      evidenceRequired: false,
      appliesTo: details.appliesTo ?? 'All teaching staff',
      hasScoringRules: false,
      description: details.description ?? '',
      evidence: { fileTypes: [], guidance: '' },
      rules: [],
      workflow: unstartedWorkflow(),
      updatedAt: now(),
      versions: [],
    };
    setKpis((list) => [...list, kpi]);
    return id;
  },

  /** Saves editor content: straight into a draft KPI, or as pending changes beside a published one. */
  saveContent(id: string, content: KpiContent) {
    setKpis((list) =>
      list.map((k) => {
        if (k.id !== id) return k;
        if (k.status === 'published') return { ...k, draft: content, hasDraftChanges: true, updatedAt: now() };
        return { ...k, ...content, ...derived(content), updatedAt: now() };
      }),
    );
  },

  updateCode(id: string, code: string) {
    setKpis((list) => list.map((k) => (k.id === id ? { ...k, code, updatedAt: now() } : k)));
  },

  /** Publishes: a draft becomes v1; pending changes on a published KPI become the next version. */
  publish(id: string, note: string) {
    setKpis((list) =>
      list.map((k) => {
        if (k.id !== id) return k;
        const content = editableContent(k);
        const version = k.status === 'published' ? k.version + 1 : 1;
        return {
          ...k,
          ...content,
          ...derived(content),
          status: 'published',
          version,
          hasDraftChanges: false,
          draft: undefined,
          updatedAt: now(),
          versions: [...k.versions, { version, publishedAt: now(), note: note.trim() || (version === 1 ? 'First version' : 'Updated') }],
        };
      }),
    );
  },

  discardChanges(id: string) {
    setKpis((list) => list.map((k) => (k.id === id ? { ...k, draft: undefined, hasDraftChanges: false } : k)));
  },

  duplicate(id: string): string | undefined {
    const { kras, kpis } = read();
    const src = kpis.find((k) => k.id === id);
    if (!src) return;
    const content = editableContent(src);
    const newId = uid('kpi');
    const copy: Kpi = {
      ...src,
      ...content,
      ...derived(content),
      id: newId,
      code: nextCode(kras.find((k) => k.id === content.kraId), kpis),
      name: `${content.name} (copy)`,
      status: 'draft',
      version: 1,
      hasDraftChanges: false,
      draft: undefined,
      versions: [],
      updatedAt: now(),
    };
    setKpis((list) => [...list, copy]);
    return newId;
  },

  archive(id: string) {
    setKpis((list) => list.map((k) => (k.id === id ? { ...k, status: 'archived', draft: undefined, hasDraftChanges: false, updatedAt: now() } : k)));
  },

  /** Restores an archived KPI as a draft, so it is checked again before going live. */
  restore(id: string) {
    setKpis((list) => list.map((k) => (k.id === id ? { ...k, status: 'draft', updatedAt: now() } : k)));
  },
};

/** The organization's KRAs and KPIs (sample data in the prototype). */
export function useFrameworkLibrary() {
  const { stage, kras, kpis } = useState_();
  return { kras, kpis, stage, setStage: frameworkActions.setStage };
}

export const setDemoStage = frameworkActions.setStage;
