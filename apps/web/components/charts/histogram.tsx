'use client';

import { useElementWidth } from './use-element-width';

export type Bin = { label: string; count: number };

/** Vertical bars showing how values spread across ranges, for example marks from 0 to the maximum. */
export function Histogram({ bins, ariaLabel, height = 160 }: { bins: Bin[]; ariaLabel: string; height?: number }) {
  const [ref, W] = useElementWidth<HTMLDivElement>();
  const H = height;
  const T = 16;
  const B = 22;
  const gap = 6;
  const top = Math.max(...bins.map((b) => b.count), 1);
  const bw = bins.length ? (W - gap * (bins.length - 1)) / bins.length : 0;

  return (
    <div ref={ref} className="w-full">
      {W > 0 && (
        <svg width={W} height={H} role="img" aria-label={ariaLabel}>
          <line x1={0} x2={W} y1={H - B} y2={H - B} style={{ stroke: 'var(--border)' }} />
          {bins.map((b, i) => {
            const h = (b.count / top) * (H - T - B);
            const x = i * (bw + gap);
            return (
              <g key={b.label}>
                <rect x={x} y={H - B - h} width={bw} height={h} rx={2} style={{ fill: 'var(--primary)' }} />
                <text x={x + bw / 2} y={H - B - h - 4} textAnchor="middle" fontSize="11" style={{ fill: 'var(--muted-foreground)' }}>
                  {b.count}
                </text>
                <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize="11" style={{ fill: 'var(--muted-foreground)' }}>
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
