'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAdminUser } from '@/lib/admin-user';
import { useSetupProgress } from '@/lib/setup-progress';
import { useSetup } from '@/lib/setup-store';

// Prototype only: appraisal scores and review counts come from Framework Studio, which is not built.
// Everything below except the people counts is sample data.
const CYCLES = ['23 H1', '23 H2', '24 H1', '24 H2', '26 H1'];
const SCORES = [3.4, 3.5, 3.7, 3.6, 3.9];
const DEPT_SCORES = [4.1, 3.8, 3.6, 3.9, 3.7, 4.0, 3.5, 3.8];
const REVIEW_STATUS = [
  { label: 'Submitted', n: 18, tone: 'var(--primary)' },
  { label: 'In review', n: 14, tone: 'color-mix(in oklab, var(--primary) 45%, var(--background))' },
  { label: 'Released', n: 18, tone: 'var(--success)' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function Tile({ label, value, note, tone }: { label: string; value: string; note: string; tone?: 'up' | 'down' }) {
  return (
    <div className="bg-card grid gap-1 p-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span className={tone === 'up' ? 'text-success text-xs' : tone === 'down' ? 'text-destructive text-xs' : 'text-muted-foreground text-xs'}>
        {note}
      </span>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-card grid content-start gap-3 rounded-lg border p-4 h-full">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.floor(el.clientWidth)));
    ro.observe(el);
    setW(Math.floor(el.clientWidth));
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// Drawn at its real pixel width so text and dots keep their size instead of scaling with the panel.
function TrendChart() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const H = 176;
  const L = 28;
  const R = 20;
  const T = 8;
  const B = 22;
  const min = 3;
  const max = 4;
  const x = (i: number) => L + (i * (W - L - R)) / (SCORES.length - 1);
  const y = (v: number) => T + ((max - v) / (max - min)) * (H - T - B);
  return (
    <div ref={ref} className="w-full">
      {W > 0 && (
        <svg width={W} height={H} role="img" aria-label="Average score by cycle, rising from 3.4 to 3.9">
          {[3, 3.5, 4].map((g) => (
            <g key={g}>
              <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} style={{ stroke: 'var(--border)' }} />
              <text x={L - 6} y={y(g) + 4} textAnchor="end" fontSize="11" style={{ fill: 'var(--muted-foreground)' }}>
                {g.toFixed(1)}
              </text>
            </g>
          ))}
          <polyline
            points={SCORES.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            fill="none"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ stroke: 'var(--primary)' }}
          />
          {SCORES.map((v, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(v)} r="3" strokeWidth="1.5" style={{ fill: 'var(--primary)', stroke: 'var(--card)' }} />
              <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" style={{ fill: 'var(--muted-foreground)' }}>
                {CYCLES[i]}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

export default function HomePage() {
  const { departments, employees, invitesSent } = useSetup();
  const { allDone } = useSetupProgress();
  const user = useAdminUser();

  const participation = employees.length === 0 || !invitesSent ? 0 : allDone ? 100 : 60;
  const reviewTotal = REVIEW_STATUS.reduce((a, s) => a + s.n, 0);

  return (
    <>
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()}, {user.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground text-sm">
          Appraisal cycle 2026 H1 · scores and reviews are sample data until Framework Studio is built
        </p>
      </header>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
        <Tile label="Appraisal completion" value="72%" note="▲ 8 pts vs last cycle" tone="up" />
        <Tile label="Average score" value="3.9" note="▲ 0.3 vs last cycle" tone="up" />
        <Tile label="Reviews pending" value="14" note="3 overdue" tone="down" />
        <Tile
          label="Participation"
          value={`${participation}%`}
          note={invitesSent ? `${Math.round((participation / 100) * employees.length)} of ${employees.length} joined` : 'Invitations not sent'}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Average score by cycle">
            <TrendChart />
          </Panel>
        </div>
        <Panel title="Review status">
          <div
            className="flex h-2 gap-0.5 overflow-hidden rounded-[3px]"
            role="img"
            aria-label={REVIEW_STATUS.map((s) => `${s.label} ${s.n}`).join(', ')}
          >
            {REVIEW_STATUS.map((s) => (
              <div key={s.label} style={{ flex: s.n, background: s.tone }} />
            ))}
          </div>
          <ul className="grid gap-2.5 text-sm">
            {REVIEW_STATUS.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-[2px]" style={{ background: s.tone }} aria-hidden />
                  <span className="text-muted-foreground">{s.label}</span>
                </span>
                <span className="tabular-nums">
                  {s.n} <span className="text-muted-foreground text-xs">({Math.round((s.n / reviewTotal) * 100)}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Average score by department">
        {departments.length === 0 ? (
          <p className="text-muted-foreground text-sm">Add departments to compare scores.</p>
        ) : (
          <ul className="grid gap-2.5">
            {departments.map((d, i) => {
              const score = DEPT_SCORES[i % DEPT_SCORES.length];
              return (
                <li key={d.id} className="grid grid-cols-[minmax(120px,200px)_minmax(0,1fr)_32px] items-center gap-3 text-sm">
                  <span className="truncate">{d.name}</span>
                  <div className="bg-secondary h-1.5 overflow-hidden rounded-[3px]">
                    <div className="bg-primary h-full rounded-[3px]" style={{ width: `${(score / 5) * 100}%` }} />
                  </div>
                  <span className="text-right tabular-nums">{score.toFixed(1)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
