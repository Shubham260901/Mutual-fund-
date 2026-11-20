import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { calculatorDisclaimer } from '@/content/disclosures';

interface CalculatorShellProps {
  inputs: ReactNode;
  results: ReactNode;
  chart?: ReactNode;
  intro?: string;
}

/** Shared two-column layout for every calculator, with the projection disclaimer. */
export function CalculatorShell({ inputs, results, chart, intro }: CalculatorShellProps) {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="border-b border-navy-900/[0.06] min-w-0 p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
          {intro && <p className="mb-8 text-sm leading-relaxed text-ink-muted">{intro}</p>}
          <div className="space-y-7">{inputs}</div>
        </div>
        <div className="min-w-0 bg-gradient-to-b from-ivory/60 to-white p-6 sm:p-8 lg:col-span-7">
          {results}
          {chart && <div className="mt-8 border-t border-navy-900/[0.06] pt-8">{chart}</div>}
        </div>
      </div>
      <div className="flex gap-3 border-t border-gold-400/30 bg-gold-100/50 px-6 py-5 sm:px-8">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden />
        <div className="space-y-1.5 text-xs leading-relaxed text-ink-muted">
          <p className="font-semibold text-navy-900">Hypothetical illustration, not a guaranteed return.</p>
          {calculatorDisclaimer.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
