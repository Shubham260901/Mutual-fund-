import { useEffect, useMemo, useRef, useState } from 'react';
import type { YearPoint } from '@/lib/finance';
import { formatAxisINR, formatINR } from '@/lib/format';
import { cn } from '@/lib/cn';

interface GrowthChartProps {
  series: YearPoint[];
  valueLabel?: string;
  investedLabel?: string;
  /** Optional horizontal target line (e.g. goal amount). */
  target?: { value: number; label: string };
  height?: number;
}

const COLORS = { value: '#1D5BBF', invested: '#C9832F', grid: '#E9EDF0', surface: '#FFFFFF' };
const PAD = { top: 16, right: 16, bottom: 28, left: 52 };

/** Rounds an axis maximum up to a "nice" number and returns evenly spaced ticks. */
function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

/**
 * Two-series area/line chart: projected value vs amount invested, with a
 * crosshair tooltip (pointer + keyboard) and a table view for accessibility.
 */
export function GrowthChart({
  series,
  valueLabel = 'Projected value',
  investedLabel = 'Amount invested',
  target,
  height = 260,
}: GrowthChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    setWidth(Math.max(280, el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { x, y, ticks, valuePath, areaPath, investedPath, xTicks } = useMemo(() => {
    const maxY = Math.max(...series.map((p) => Math.max(p.value, p.invested)), target?.value ?? 0);
    const ticks = niceTicks(maxY);
    const top = ticks[ticks.length - 1];
    const lastYear = series[series.length - 1]?.year || 1;
    const firstYear = series[0]?.year ?? 0;
    const innerW = width - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;
    const x = (year: number) => PAD.left + ((year - firstYear) / Math.max(1, lastYear - firstYear)) * innerW;
    const y = (v: number) => PAD.top + innerH - (v / top) * innerH;
    const line = (key: 'value' | 'invested') =>
      series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.year).toFixed(2)},${y(p[key]).toFixed(2)}`).join(' ');
    const valuePath = line('value');
    const areaPath = `${valuePath} L${x(lastYear)},${y(0)} L${x(firstYear)},${y(0)} Z`;
    const span = lastYear - firstYear;
    const every = span <= 6 ? 1 : span <= 12 ? 2 : span <= 25 ? 5 : 10;
    const xTicks = series.filter((p) => (p.year - firstYear) % every === 0 || p.year === lastYear).map((p) => p.year);
    // Drop a penultimate tick that would collide with the final one.
    if (xTicks.length > 2 && lastYear - xTicks[xTicks.length - 2] < every / 2) xTicks.splice(xTicks.length - 2, 1);
    return { x, y, ticks, valuePath, areaPath, investedPath: line('invested'), xTicks };
  }, [series, width, height, target?.value]);

  const pick = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = clientX - rect.left;
    let best = 0;
    let bestD = Infinity;
    series.forEach((p, i) => {
      const d = Math.abs(x(p.year) - px);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive((cur) => {
        const start = cur ?? series.length - 1;
        return Math.min(series.length - 1, Math.max(0, start + (e.key === 'ArrowRight' ? 1 : -1)));
      });
    }
    if (e.key === 'Escape') setActive(null);
  };

  const point = active !== null ? series[active] : null;
  const tooltipLeft = point ? Math.min(Math.max(x(point.year), 90), width - 90) : 0;

  return (
    <figure>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
        <LegendSwatch color={COLORS.value} label={valueLabel} />
        <LegendSwatch color={COLORS.invested} label={investedLabel} />
        {target && <LegendSwatch color="#4F6081" label={target.label} dashed />}
      </div>

      <div
        ref={wrapRef}
        className="relative w-full min-w-0 touch-pan-y select-none rounded-xl focus-visible:ring-2"
        tabIndex={0}
        role="img"
        aria-label={`Chart of ${valueLabel.toLowerCase()} and ${investedLabel.toLowerCase()} by year. Use left and right arrow keys to read values.`}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
      >
        <svg width={width} height={height} className="block overflow-visible" aria-hidden>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={COLORS.grid} strokeWidth={1} />
              <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-subtle text-[11px] tabular">
                {formatAxisINR(t)}
              </text>
            </g>
          ))}
          {xTicks.map((yr) => (
            <text key={yr} x={x(yr)} y={height - 6} textAnchor="middle" className="fill-ink-subtle text-[11px] tabular">
              {yr === 0 ? 'Now' : `Yr ${yr}`}
            </text>
          ))}

          <path d={areaPath} fill={COLORS.value} fillOpacity={0.1} />
          <path d={investedPath} fill="none" stroke={COLORS.invested} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <path d={valuePath} fill="none" stroke={COLORS.value} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {target && (
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(target.value)}
              y2={y(target.value)}
              stroke="#4F6081"
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
          )}

          {/* End-point marker on the headline series */}
          {!point && series.length > 0 && (
            <circle
              cx={x(series[series.length - 1].year)}
              cy={y(series[series.length - 1].value)}
              r={4.5}
              fill={COLORS.value}
              stroke={COLORS.surface}
              strokeWidth={2}
            />
          )}

          {point && (
            <g>
              <line x1={x(point.year)} x2={x(point.year)} y1={PAD.top} y2={height - PAD.bottom} stroke="#AEB9CE" strokeWidth={1} />
              <circle cx={x(point.year)} cy={y(point.invested)} r={4.5} fill={COLORS.invested} stroke={COLORS.surface} strokeWidth={2} />
              <circle cx={x(point.year)} cy={y(point.value)} r={4.5} fill={COLORS.value} stroke={COLORS.surface} strokeWidth={2} />
            </g>
          )}
        </svg>

        {point && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-44 -translate-x-1/2 rounded-xl border border-navy-900/10 bg-white p-3 text-xs shadow-lift"
            style={{ left: tooltipLeft }}
            aria-live="polite"
          >
            <p className="font-semibold text-navy-900">{point.year === 0 ? 'Start' : `End of year ${point.year}`}</p>
            <TooltipRow color={COLORS.value} label={valueLabel} value={formatINR(point.value)} />
            <TooltipRow color={COLORS.invested} label={investedLabel} value={formatINR(point.invested)} />
          </div>
        )}
      </div>

      <figcaption className="mt-4 flex items-center justify-between gap-4">
        <span className="text-xs text-ink-subtle">Hypothetical projection at a constant assumed return. Not a guarantee.</span>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="shrink-0 text-xs font-semibold text-brand-700 hover:text-brand-800"
          aria-expanded={showTable}
        >
          {showTable ? 'Hide table' : 'View as table'}
        </button>
      </figcaption>

      {showTable && (
        <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-navy-900/10">
          <table className="w-full text-sm tabular">
            <thead className="sticky top-0 bg-ivory text-left text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Year</th>
                <th className="px-4 py-2.5 text-right font-semibold">{investedLabel}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{valueLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/[0.06]">
              {series.map((p) => (
                <tr key={p.year}>
                  <td className="px-4 py-2 text-ink-muted">{p.year === 0 ? 'Start' : p.year}</td>
                  <td className="px-4 py-2 text-right text-ink-muted">{formatINR(p.invested)}</td>
                  <td className="px-4 py-2 text-right font-medium text-navy-900">{formatINR(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

function LegendSwatch({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn('inline-block h-0.5 w-5 rounded-full', dashed && 'h-0 border-t-2 border-dashed bg-transparent')}
        style={dashed ? { borderColor: color } : { backgroundColor: color }}
        aria-hidden
      />
      {label}
    </span>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="mt-2 flex items-start gap-2">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      <div>
        <p className="text-ink-subtle">{label}</p>
        <p className="font-semibold text-navy-900 tabular">{value}</p>
      </div>
    </div>
  );
}
