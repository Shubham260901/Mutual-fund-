import { AnimatePresence, motion } from 'framer-motion';
import { formatINR, formatINRCompact } from '@/lib/format';

interface ResultSummaryProps {
  headlineLabel: string;
  headline: number;
  rows: { label: string; value: number; color?: string }[];
  /** Shows invested vs. gains split as a proportion bar. */
  split?: { invested: number; gains: number };
  note?: string;
}

export function ResultSummary({ headlineLabel, headline, rows, split, note }: ResultSummaryProps) {
  const total = split ? split.invested + Math.max(0, split.gains) : 0;
  const investedPct = split && total > 0 ? (split.invested / total) * 100 : 0;

  return (
    <div>
      <p className="text-sm font-medium text-ink-muted">{headlineLabel}</p>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={Math.round(headline)}
          initial={{ opacity: 0.4, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-1 font-display text-4xl font-bold tracking-tight text-navy-900 tabular sm:text-5xl"
          aria-live="polite"
        >
          {formatINR(headline)}
        </motion.p>
      </AnimatePresence>
      <p className="mt-1 text-sm text-ink-subtle">≈ {formatINRCompact(headline)} · hypothetical</p>

      {split && total > 0 && (
        <div className="mt-6 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden>
          <div className="h-full rounded-l-full bg-chart-invested transition-[width] duration-500" style={{ width: `${investedPct}%` }} />
          <div className="h-full flex-1 rounded-r-full bg-chart-value" />
        </div>
      )}

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-2.5">
            {r.color && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.color }} aria-hidden />}
            <div>
              <dt className="text-sm text-ink-muted">{r.label}</dt>
              <dd className="mt-0.5 text-lg font-semibold text-navy-900 tabular">{formatINR(r.value)}</dd>
            </div>
          </div>
        ))}
      </dl>
      {note && <p className="mt-4 text-sm text-ink-muted">{note}</p>}
    </div>
  );
}
