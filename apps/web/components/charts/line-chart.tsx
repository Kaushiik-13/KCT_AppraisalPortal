'use client';

import { useElementWidth } from './use-element-width';

export type LinePoint = { label: string; value: number };

type LineChartProps = {
  points: LinePoint[];
  /** Describe the trend in words for screen readers, for example "rising from 3.4 to 3.9". */
  ariaLabel: string;
  min: number;
  max: number;
  /** Values for the horizontal grid lines and y-axis labels. */
  ticks: number[];
  formatTick?: (v: number) => string;
  height?: number;
  /** Optional vertical marker, for example a deadline, drawn at a point's x position. */
  marker?: { index: number; label: string };
};

/** One series over ordered labels. Drawn at real pixel width. */
export function LineChart({ points, ariaLabel, min, max, ticks, formatTick = (v) => String(v), height = 176, marker }: LineChartProps) {
  const [ref, W] = useElementWidth<HTMLDivElement>();
  const H = height;
  const L = 28;
  const R = 20;
  const T = 8;
  const B = 22;
  const n = Math.max(points.length - 1, 1);
  const x = (i: number) => L + (i * (W - L - R)) / n;
  const y = (v: number) => T + ((max - v) / (max - min || 1)) * (H - T - B);

  return (
    <div ref={ref} className="w-full">
      {W > 0 && (
        <svg width={W} height={H} role="img" aria-label={ariaLabel}>
          {ticks.map((g) => (
            <g key={g}>
              <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} style={{ stroke: 'var(--border)' }} />
              <text x={L - 6} y={y(g) + 4} textAnchor="end" fontSize="11" style={{ fill: 'var(--muted-foreground)' }}>
                {formatTick(g)}
              </text>
            </g>
          ))}
          {marker && (
            <g>
              <line
                x1={x(marker.index)}
                x2={x(marker.index)}
                y1={T}
                y2={H - B}
                strokeDasharray="3 3"
                style={{ stroke: 'var(--muted-foreground)' }}
              />
              <text x={x(marker.index) - 4} y={T + 10} textAnchor="end" fontSize="11" style={{ fill: 'var(--muted-foreground)' }}>
                {marker.label}
              </text>
            </g>
          )}
          <polyline
            points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
            fill="none"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ stroke: 'var(--primary)' }}
          />
          {points.map((p, i) => (
            <g key={p.label}>
              <circle cx={x(i)} cy={y(p.value)} r="3" strokeWidth="1.5" style={{ fill: 'var(--primary)', stroke: 'var(--card)' }} />
              <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" style={{ fill: 'var(--muted-foreground)' }}>
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
