import { useEffect, useId, useState } from 'react';
import { formatNumber, inWords } from '@/lib/format';
import { cn } from '@/lib/cn';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: 'inr' | 'pct' | 'years';
  hint?: string;
}

const unitLabel = { inr: '₹', pct: '%', years: 'yrs' } as const;

/**
 * A slider paired with a typed input. The typed value is validated against
 * [min, max]: invalid entries show an error and are not applied, and on blur
 * the field snaps back to the nearest valid value.
 */
export function SliderInput({ label, value, onChange, min, max, step = 1, unit, hint }: SliderInputProps) {
  const id = useId();
  const [draft, setDraft] = useState(formatDraft(value, unit));
  const [error, setError] = useState<string | null>(null);

  // Keep the text field in sync when the slider (or a parent) changes the value.
  useEffect(() => {
    setDraft(formatDraft(value, unit));
    setError(null);
  }, [value, unit]);

  const fill = ((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100;
  const rangeText = `${fmt(min, unit)} – ${fmt(max, unit)}`;

  const handleText = (raw: string) => {
    setDraft(raw);
    const cleaned = raw.replace(/[,\s₹%]/g, '');
    if (cleaned === '') {
      setError('Please enter a value.');
      return;
    }
    const n = Number(cleaned);
    if (!Number.isFinite(n)) {
      setError('Please enter a valid number.');
      return;
    }
    if (n < min || n > max) {
      setError(`Enter a value between ${rangeText}.`);
      return;
    }
    setError(null);
    onChange(n);
  };

  const handleBlur = () => {
    const n = Number(draft.replace(/[,\s₹%]/g, ''));
    const clamped = Number.isFinite(n) && draft.trim() !== '' ? Math.min(Math.max(n, min), max) : value;
    onChange(clamped);
    setDraft(formatDraft(clamped, unit));
    setError(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={`${id}-text`} className="text-sm font-medium text-navy-900">
          {label}
        </label>
        <div
          className={cn(
            'flex h-10 items-center gap-1 rounded-xl border bg-ivory px-3 transition-colors focus-within:border-emerald-600 focus-within:bg-white',
            error ? 'border-red-600' : 'border-navy-900/10',
          )}
        >
          {unit === 'inr' && <span className="text-sm text-ink-subtle">₹</span>}
          <input
            id={`${id}-text`}
            inputMode="decimal"
            value={draft}
            onChange={(e) => handleText(e.target.value)}
            onBlur={handleBlur}
            aria-invalid={!!error}
            aria-describedby={`${id}-help`}
            className="tabular w-[6.5rem] bg-transparent text-right text-[0.9375rem] font-semibold text-navy-900 focus:outline-none"
          />
          {unit !== 'inr' && <span className="text-sm text-ink-subtle">{unitLabel[unit]}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(Math.max(value, min), max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-3"
        style={{ ['--fill' as string]: `${fill}%` }}
        aria-label={`${label} slider`}
        aria-valuetext={fmt(value, unit)}
      />
      <p id={`${id}-help`} className={cn('mt-1 text-xs', error ? 'text-red-700' : 'text-ink-subtle')} aria-live="polite">
        {error ?? (unit === 'inr' && value >= 1e5 ? `₹${inWords(value)}` : hint ?? rangeText)}
      </p>
    </div>
  );
}

function formatDraft(value: number, unit: SliderInputProps['unit']) {
  return unit === 'inr' ? formatNumber(value) : String(Number(value.toFixed(2)));
}

function fmt(v: number, unit: SliderInputProps['unit']) {
  if (unit === 'inr') return `₹${formatNumber(v)}`;
  if (unit === 'pct') return `${v}%`;
  return `${v} yrs`;
}
