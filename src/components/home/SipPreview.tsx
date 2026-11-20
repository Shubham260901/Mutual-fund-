import { ArrowRight, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { projectSip } from '@/lib/finance';
import { formatINR, formatINRCompact } from '@/lib/format';
import { SliderInput } from '../calculators/SliderInput';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

/** A compact SIP calculator for the homepage. The full version lives on /calculators. */
export function SipPreview() {
  const [monthly, setMonthly] = useState(10_000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const p = useMemo(() => projectSip(monthly, rate, years), [monthly, rate, years]);
  const investedPct = (p.invested / p.value) * 100;

  return (
    <section className="section bg-gradient-to-b from-ivory to-mist/60">
      <div className="container-page grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="SIP calculator"
            title="See how small, regular investments can add up"
            description="Adjust the sliders to explore a hypothetical scenario. Then open our full set of calculators for goal planning, lump sums and step-up SIPs."
          />
          <Reveal delay={0.1}>
            <Button to="/calculators#sip" variant="secondary" className="mt-9" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              Open all calculators
            </Button>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-7" delay={0.1}>
          <div className="card grid overflow-hidden md:grid-cols-2">
            <div className="space-y-7 p-6 sm:p-8">
              <SliderInput label="Monthly SIP" unit="inr" value={monthly} onChange={setMonthly} min={500} max={200_000} step={500} />
              <SliderInput label="Period" unit="years" value={years} onChange={setYears} min={1} max={40} />
              <SliderInput label="Assumed return p.a." unit="pct" value={rate} onChange={setRate} min={1} max={30} step={0.5} />
            </div>
            <div className="flex flex-col justify-between bg-navy-900 bg-navy-radial p-6 text-white sm:p-8">
              <div>
                <p className="text-sm text-navy-100/75">Projected value in {years} years</p>
                <p className="mt-2 font-display text-4xl font-bold tracking-tight tabular" aria-live="polite">
                  {formatINRCompact(p.value)}
                </p>
                <p className="mt-1 text-sm text-navy-100/60 tabular">{formatINR(p.value)}</p>

                <div className="mt-8 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
                  <div className="rounded-l-full bg-[#8FA6D6] transition-[width] duration-500" style={{ width: `${investedPct}%` }} />
                  <div className="flex-1 rounded-r-full bg-emerald-400" />
                </div>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-navy-100/75">
                      <span className="h-2 w-2 rounded-full bg-[#8FA6D6]" aria-hidden /> Invested
                    </dt>
                    <dd className="font-semibold tabular">{formatINR(p.invested)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-navy-100/75">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden /> Estimated gains
                    </dt>
                    <dd className="font-semibold tabular">{formatINR(p.gains)}</dd>
                  </div>
                </dl>
              </div>
              <p className="mt-8 flex gap-2 border-t border-white/10 pt-5 text-xs leading-relaxed text-navy-100/65">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Hypothetical illustration at a constant assumed return. Not a guarantee or indication of any scheme’s performance.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
