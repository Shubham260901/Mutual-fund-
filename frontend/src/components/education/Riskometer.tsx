import { useState } from 'react';
import { cn } from '@/lib/cn';

/** SEBI's six Riskometer levels, described generically (not tied to any scheme or category). */
const levels = [
  { name: 'Low', color: '#2F8F6B', example: 'Minimal expected fluctuation in value.' },
  { name: 'Low to Moderate', color: '#7DAA5C', example: 'Small fluctuations; the value is relatively stable.' },
  { name: 'Moderate', color: '#C9B04F', example: 'Some fluctuation in value should be expected.' },
  { name: 'Moderately High', color: '#D9913F', example: 'Noticeable short-term ups and downs are possible.' },
  { name: 'High', color: '#C9673A', example: 'Significant ups and downs in value are possible.' },
  { name: 'Very High', color: '#A83F3A', example: 'Large swings in value are possible, including sizeable temporary losses.' },
];

const CX = 150;
const CY = 150;
const R_OUT = 130;
const R_IN = 82;

function arc(i: number) {
  const gap = 0.012; // radians of surface gap between segments
  const a0 = Math.PI + (i / 6) * Math.PI + gap;
  const a1 = Math.PI + ((i + 1) / 6) * Math.PI - gap;
  const p = (r: number, a: number) => `${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`;
  return `M${p(R_OUT, a0)} A${R_OUT},${R_OUT} 0 0 1 ${p(R_OUT, a1)} L${p(R_IN, a1)} A${R_IN},${R_IN} 0 0 0 ${p(R_IN, a0)} Z`;
}

export function Riskometer() {
  const [active, setActive] = useState(5);
  const angle = -90 + ((active + 0.5) / 6) * 180;

  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      <div className="mx-auto w-full max-w-sm">
        <svg viewBox="0 0 300 170" className="w-full" role="img" aria-label={`Riskometer showing ${levels[active].name} risk`}>
          {levels.map((l, i) => (
            <path
              key={l.name}
              d={arc(i)}
              fill={l.color}
              opacity={i === active ? 1 : 0.35}
              className="cursor-pointer transition-opacity duration-300"
              onClick={() => setActive(i)}
            />
          ))}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
              transformBox: 'view-box',
              transition: 'transform 0.7s cubic-bezier(0.34, 1.4, 0.64, 1)',
            }}
          >
            <path d={`M${CX - 5},${CY} L${CX},${CY - 108} L${CX + 5},${CY} Z`} fill="#101D35" />
          </g>
          <circle cx={CX} cy={CY} r="10" fill="#101D35" />
          <circle cx={CX} cy={CY} r="4" fill="#C7A66A" />
        </svg>
        <p className="mt-2 text-center font-display text-xl font-bold text-navy-900">{levels[active].name}</p>
      </div>

      <div>
        <p className="text-sm text-ink-muted">Select a level to learn more:</p>
        <ul className="mt-4 grid gap-2">
          {levels.map((l, i) => (
            <li key={l.name}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
                  i === active ? 'border-navy-900/15 bg-white shadow-soft' : 'border-transparent hover:bg-white/70',
                )}
              >
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: l.color }} aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-navy-900">{l.name}</span>
                  {i === active && <span className="mt-0.5 block text-sm text-ink-muted">{l.example}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-subtle">
          Descriptions are general. Each scheme’s actual Riskometer is set by its AMC and reviewed monthly; always check the scheme documents.
        </p>
      </div>
    </div>
  );
}
