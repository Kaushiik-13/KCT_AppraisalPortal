'use client';

import { useSyncExternalStore } from 'react';

// Tour and getting-started state for the prototype. Kept in localStorage because it is a per-person
// convenience (which tours you have seen, where you paused). Every read and write is guarded: the page
// works the same when storage is unavailable. Moves to the user's account when there is a backend.

export type TourState = {
  /** The running tour and the step it is on. */
  active: { tour: string; index: number } | null;
  /** Tours finished or skipped, so they do not start on their own again. */
  seen: string[];
  /** Getting-started items that cannot be read from the library itself. */
  progress: { tested?: boolean; published?: boolean };
  /** The getting-started checklist was hidden. */
  checklistHidden?: boolean;
};

const KEY = 'afpi-tour-v1';
const EMPTY: TourState = { active: null, seen: [], progress: {} };
const listeners = new Set<() => void>();
let current: TourState | null = null;

function read(): TourState {
  if (current) return current;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<TourState> | null;
    current = { ...EMPTY, ...saved, seen: Array.isArray(saved?.seen) ? saved.seen : [], progress: saved?.progress ?? {} };
  } catch {
    current = EMPTY;
  }
  return current;
}

function write(patch: Partial<TourState>) {
  current = { ...read(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useTourState = () => useSyncExternalStore(subscribe, read, () => EMPTY);

export const tourActions = {
  start(tour: string) {
    write({ active: { tour, index: 0 } });
  },
  go(index: number) {
    const a = read().active;
    if (a) write({ active: { ...a, index } });
  },
  /** Ends the running tour and remembers it, so it does not start on its own again. */
  end() {
    const a = read().active;
    write({ active: null, seen: a && !read().seen.includes(a.tour) ? [...read().seen, a.tour] : read().seen });
  },
  hasSeen: (tour: string) => read().seen.includes(tour),
  isRunning: () => read().active !== null,
  hideChecklist(hidden = true) {
    write({ checklistHidden: hidden });
  },
};

export function markProgress(item: keyof TourState['progress']) {
  if (!read().progress[item]) write({ progress: { ...read().progress, [item]: true } });
}
