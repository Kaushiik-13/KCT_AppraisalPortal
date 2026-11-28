'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, MousePointerClick, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tourActions, useTourState } from '@/lib/tour/progress';
import { onPage, pageTourFor, tourById, type TourStep } from '@/lib/tour/tours';

const CARD_W = 320;
const GAP = 12;
const PAD = 6;

/** The first visible element matching any of the step's selectors. */
function findTarget(step: TourStep): HTMLElement | null {
  if (!step.target) return null;
  for (const sel of step.target.split(',').map((s) => s.trim())) {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return el;
    }
  }
  return null;
}

type Box = { top: number; left: number; width: number; height: number };

/**
 * Runs the guided tours across every page: a spotlight on the current step's control and a small card
 * beside it. It never blocks the page, so the person can do what a step asks. Steps that wait for a click
 * move on by themselves; a tour started on one page pauses on others with a "Go there" pill.
 * Mounted once in the root layout.
 */
export function TourHost() {
  const pathname = usePathname();
  const router = useRouter();
  const { active } = useTourState();
  const tour = active ? tourById(active.tour) : undefined;
  const step = tour && active ? tour.steps[active.index] : undefined;
  const here = !!step && onPage(step, pathname);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  // The visible part of the screen. On phones a page wider than the screen widens the layout viewport,
  // so the card is placed against the visual viewport instead.
  const [view, setView] = useState({ x: 0, y: 0, w: 1280, h: 800 });
  const [searching, setSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // The first visit to a page starts its tour, once: the main tour on Frameworks, the page tour elsewhere.
  // The KPI editor starts a tour per step itself. Reads the saved state directly: while the page hydrates,
  // the hook still holds the empty server snapshot. Runs on page changes only, so ending a tour does not
  // start another one on the same page.
  useEffect(() => {
    if (tourActions.isRunning() || pathname.startsWith('/frameworks/kpis/')) return;
    if (pathname === '/frameworks' && !tourActions.hasSeen('first-kpi')) {
      tourActions.start('first-kpi');
      tourActions.go(1);
      return;
    }
    const t = pageTourFor(pathname);
    if (t) tourActions.startOnce(t.id);
  }, [pathname]);

  // Someone who goes ahead of the tour (opens the library while it still talks about the overview)
  // is met by the first later step for the page they are on, instead of a paused tour.
  useEffect(() => {
    if (!tour || !active || here) return;
    const ahead = tour.steps.findIndex((s, i) => i > active.index && onPage(s, pathname));
    if (ahead > 0) tourActions.go(ahead);
  }, [tour, active, here, pathname]);

  const next = () => {
    if (!tour || !active) return;
    if (active.index >= tour.steps.length - 1) return tourActions.end(true);
    tourActions.go(active.index + 1);
  };
  const back = () => active && active.index > 0 && tourActions.go(active.index - 1);

  // Find the step's control. Controls can appear late (data loading, a dialog opening), so look for a while.
  useEffect(() => {
    setTarget(null);
    setBox(null);
    if (!step || !here) return;
    if (!step.target) return;
    setSearching(true);
    let tries = 0;
    const t = setInterval(() => {
      const el = findTarget(step);
      tries++;
      if (el) {
        clearInterval(t);
        setSearching(false);
        setTarget(el);
        el.scrollIntoView({ block: window.innerWidth < 640 ? 'center' : 'nearest', inline: 'nearest', behavior: 'smooth' });
      } else if (tries > (step.optional ? 5 : 15)) {
        clearInterval(t);
        setSearching(false);
        // A control that is not on screen in this layout or state: skip it, or show the note on its own.
        if (step.optional) next();
      }
    }, 200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.tour, active?.index, here, pathname]);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      const vv = window.visualViewport;
      const next = { x: vv?.offsetLeft ?? 0, y: vv?.offsetTop ?? 0, w: vv?.width ?? window.innerWidth, h: vv?.height ?? window.innerHeight };
      setView((v) => (v.x === next.x && v.y === next.y && v.w === next.w && v.h === next.h ? v : next));
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Keep the spotlight on the control as the page scrolls, resizes or re-renders.
  useLayoutEffect(() => {
    if (!target) return;
    let raf = 0;
    const tick = () => {
      if (!target.isConnected) {
        const again = step ? findTarget(step) : null;
        if (again) setTarget(again);
        else setBox(null);
      } else {
        const r = target.getBoundingClientRect();
        setBox((b) => (b && b.top === r.top && b.left === r.left && b.width === r.width && b.height === r.height ? b : { top: r.top, left: r.left, width: r.width, height: r.height }));
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [target, step]);

  // Steps that wait for the person to do something move on when they do it.
  useEffect(() => {
    if (!step?.advanceOn || !here) return;
    const sel = step.advanceOn === true ? step.target : step.advanceOn;
    if (!sel) return;
    const onClick = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (el?.closest?.(sel)) setTimeout(next, 60);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.tour, active?.index, here]);

  // Escape ends the tour.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.querySelector('[role="dialog"][data-state="open"]') && tourActions.end();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  if (!mounted || !tour || !active || !step) return null;
  const n = `${active.index + 1} of ${tour.steps.length}`;

  // Paused: the step is on another page.
  if (!here) {
    return createPortal(
      <div className="bg-card fixed bottom-4 left-4 z-[1000] flex items-center gap-3 rounded-xl border px-3 py-2 text-sm shadow-lg" onPointerDown={(e) => e.stopPropagation()}>
        <span className="text-muted-foreground">
          {tour.name} · step {n}
        </span>
        <Button size="sm" onClick={() => router.push(step.href)}>
          Go there
        </Button>
        <button type="button" onClick={() => tourActions.end()} className="text-muted-foreground hover:text-foreground text-xs">
          End tour
        </button>
      </div>,
      document.body,
    );
  }

  if (step.target && searching && !box) return null;

  const vw = view.w;
  const vh = view.h;
  const docked = vw < 640;
  // On phones the card docks at the top or bottom, whichever side the control is not on.
  const dockTop = !!box && box.top + box.height / 2 - view.y > vh / 2;
  let style: React.CSSProperties = {};
  if (!docked) {
    if (box) {
      const below = box.top + box.height + GAP;
      const placeBelow = below + 220 < vh || box.top < 240;
      const left = Math.min(Math.max(box.left, GAP), vw - CARD_W - GAP);
      style = placeBelow ? { top: Math.min(below, vh - 240), left } : { bottom: vh - box.top + GAP, left };
    } else {
      style = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  }

  return createPortal(
    <>
      {box ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[999] rounded-lg transition-all duration-200"
          style={{
            top: box.top - PAD,
            left: box.left - PAD,
            width: box.width + PAD * 2,
            height: box.height + PAD * 2,
            boxShadow: '0 0 0 2px var(--foreground), 0 0 0 9999px rgb(0 0 0 / 0.35)',
          }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[999] bg-black/35" />
      )}
      <div
        ref={cardRef}
        role="dialog"
        aria-label={`${tour.name}: ${step.title}`}
        onPointerDown={(e) => e.stopPropagation()}
        className="bg-card text-card-foreground pointer-events-auto fixed z-[1000] grid gap-2 rounded-xl border p-4 shadow-xl"
        style={
          docked
            ? { left: view.x + GAP, width: vw - GAP * 2, ...(dockTop ? { top: view.y + GAP } : { bottom: window.innerHeight - (view.y + vh) + GAP }) }
            : { ...style, width: CARD_W }
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {tour.name} · {n}
          </span>
          <button type="button" onClick={() => tourActions.end()} aria-label="End tour" className="text-muted-foreground hover:text-foreground ml-auto">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <h2 className="text-sm font-semibold">{step.title}</h2>
        <p className="text-muted-foreground text-sm">{step.body}</p>
        {step.action && (
          <p className="bg-muted flex items-start gap-2 rounded-md px-2.5 py-1.5 text-xs">
            <MousePointerClick className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {step.action}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          {active.index > 0 && (
            <Button variant="ghost" size="sm" onClick={back}>
              <ArrowLeft aria-hidden data-icon="inline-start" /> Back
            </Button>
          )}
          <button type="button" onClick={() => tourActions.end()} className="text-muted-foreground hover:text-foreground text-xs">
            Skip tour
          </button>
          <Button size="sm" className="ml-auto" onClick={next} autoFocus>
            {active.index >= tour.steps.length - 1 ? 'Finish' : step.advanceOn ? 'Skip this step' : 'Next'}
            {active.index < tour.steps.length - 1 && <ArrowRight aria-hidden data-icon="inline-end" />}
          </Button>
        </div>
      </div>
    </>,
    document.body,
  );
}
