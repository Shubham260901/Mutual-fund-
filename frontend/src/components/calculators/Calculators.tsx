import { useMemo, useState } from 'react';
import { planGoal, projectGoalSip, projectLumpSum, projectSip, projectStepUpSip } from '@/lib/finance';
import { formatINR } from '@/lib/format';
import { CalculatorShell } from './CalculatorShell';
import { GrowthChart } from './GrowthChart';
import { ResultSummary } from './ResultSummary';
import { SliderInput } from './SliderInput';

const C = { invested: '#C9832F', value: '#1D5BBF' };

/** Shared input ranges, so limits stay consistent across calculators. */
const LIMITS = {
  monthly: { min: 500, max: 1_000_000, step: 500 },
  lump: { min: 1_000, max: 100_000_000, step: 1_000 },
  rate: { min: 1, max: 30, step: 0.5 },
  years: { min: 1, max: 40, step: 1 },
};

export function SipCalculator() {
  const [monthly, setMonthly] = useState(10_000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const p = useMemo(() => projectSip(monthly, rate, years), [monthly, rate, years]);

  return (
    <CalculatorShell
      intro="Estimate what a fixed monthly investment could grow to over time, at an assumed constant rate of return."
      inputs={
        <>
          <SliderInput label="Monthly investment" unit="inr" value={monthly} onChange={setMonthly} {...LIMITS.monthly} />
          <SliderInput label="Expected annual return (assumed)" unit="pct" value={rate} onChange={setRate} {...LIMITS.rate} />
          <SliderInput label="Investment period" unit="years" value={years} onChange={setYears} {...LIMITS.years} />
        </>
      }
      results={
        <ResultSummary
          headlineLabel={`Projected value after ${years} ${years === 1 ? 'year' : 'years'}`}
          headline={p.value}
          split={{ invested: p.invested, gains: p.gains }}
          rows={[
            { label: 'Total invested', value: p.invested, color: C.invested },
            { label: 'Estimated gains', value: p.gains, color: C.value },
          ]}
        />
      }
      chart={<GrowthChart series={p.series} />}
    />
  );
}

export function LumpSumCalculator() {
  const [amount, setAmount] = useState(500_000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const p = useMemo(() => projectLumpSum(amount, rate, years), [amount, rate, years]);

  return (
    <CalculatorShell
      intro="See how a one-time investment could compound over your chosen period, at an assumed constant annual return."
      inputs={
        <>
          <SliderInput label="One-time investment" unit="inr" value={amount} onChange={setAmount} {...LIMITS.lump} step={5_000} />
          <SliderInput label="Expected annual return (assumed)" unit="pct" value={rate} onChange={setRate} {...LIMITS.rate} />
          <SliderInput label="Investment period" unit="years" value={years} onChange={setYears} {...LIMITS.years} />
        </>
      }
      results={
        <ResultSummary
          headlineLabel={`Projected value after ${years} ${years === 1 ? 'year' : 'years'}`}
          headline={p.value}
          split={{ invested: p.invested, gains: p.gains }}
          rows={[
            { label: 'Amount invested', value: p.invested, color: C.invested },
            { label: 'Estimated gains', value: p.gains, color: C.value },
          ]}
        />
      }
      chart={<GrowthChart series={p.series} />}
    />
  );
}

export function GoalCalculator() {
  const [cost, setCost] = useState(2_500_000);
  const [years, setYears] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [rate, setRate] = useState(11);
  const [existing, setExisting] = useState(0);
  const g = useMemo(() => planGoal(cost, years, inflation, rate, existing), [cost, years, inflation, rate, existing]);
  const series = useMemo(() => projectGoalSip(g.monthlySip, rate, years, existing), [g.monthlySip, rate, years, existing]);

  return (
    <CalculatorShell
      intro="Work backwards from a goal: what it may cost in the future after inflation, and the monthly SIP that could help you get there."
      inputs={
        <>
          <SliderInput label="Goal cost in today’s value" unit="inr" value={cost} onChange={setCost} min={10_000} max={100_000_000} step={10_000} />
          <SliderInput label="Years to goal" unit="years" value={years} onChange={setYears} {...LIMITS.years} />
          <SliderInput label="Expected inflation" unit="pct" value={inflation} onChange={setInflation} min={0} max={15} step={0.5} />
          <SliderInput label="Expected annual return (assumed)" unit="pct" value={rate} onChange={setRate} {...LIMITS.rate} />
          <SliderInput
            label="Existing savings for this goal"
            unit="inr"
            value={existing}
            onChange={setExisting}
            min={0}
            max={100_000_000}
            step={10_000}
            hint="Optional: amount already set aside"
          />
        </>
      }
      results={
        g.shortfall === 0 ? (
          <ResultSummary
            headlineLabel="Monthly SIP needed"
            headline={0}
            rows={[
              { label: 'Goal cost in future', value: g.futureCost },
              { label: 'Existing savings could grow to', value: g.existingGrowth },
            ]}
            note="At these assumptions, your existing savings may already cover this goal. Review periodically, because actual returns vary."
          />
        ) : (
          <ResultSummary
            headlineLabel="Monthly SIP needed (hypothetical)"
            headline={g.monthlySip}
            rows={[
              { label: `Goal cost in ${years} years`, value: g.futureCost },
              { label: 'Or one-time investment today', value: g.lumpSumToday },
              { label: 'Total SIP instalments', value: g.totalSipInvested, color: C.invested },
              ...(existing > 0 ? [{ label: 'Existing savings could grow to', value: g.existingGrowth }] : []),
            ]}
            note={`A goal costing ${formatINR(cost)} today may cost about ${formatINR(g.futureCost)} in ${years} years at ${inflation}% inflation.`}
          />
        )
      }
      chart={
        g.shortfall > 0 ? (
          <GrowthChart series={series} target={{ value: g.futureCost, label: 'Goal (inflation-adjusted)' }} />
        ) : undefined
      }
    />
  );
}

export function StepUpSipCalculator() {
  const [monthly, setMonthly] = useState(10_000);
  const [step, setStep] = useState(10);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const p = useMemo(() => projectStepUpSip(monthly, step, rate, years), [monthly, step, rate, years]);
  const extra = p.value - p.flatSipValue;

  return (
    <CalculatorShell
      intro="Increase your SIP by a fixed percentage every year, in line with your income, and compare it with a flat SIP."
      inputs={
        <>
          <SliderInput label="Starting monthly investment" unit="inr" value={monthly} onChange={setMonthly} {...LIMITS.monthly} />
          <SliderInput label="Annual step-up" unit="pct" value={step} onChange={setStep} min={0} max={50} step={1} />
          <SliderInput label="Expected annual return (assumed)" unit="pct" value={rate} onChange={setRate} {...LIMITS.rate} />
          <SliderInput label="Investment period" unit="years" value={years} onChange={setYears} {...LIMITS.years} />
        </>
      }
      results={
        <ResultSummary
          headlineLabel={`Projected value after ${years} ${years === 1 ? 'year' : 'years'}`}
          headline={p.value}
          split={{ invested: p.invested, gains: p.gains }}
          rows={[
            { label: 'Total invested', value: p.invested, color: C.invested },
            { label: 'Estimated gains', value: p.gains, color: C.value },
            { label: `Monthly SIP in year ${years}`, value: p.finalMonthly },
            { label: 'Flat SIP would reach', value: p.flatSipValue },
          ]}
          note={
            step > 0 && years > 1
              ? `Stepping up by ${step}% a year adds about ${formatINR(extra)} compared with a flat ${formatINR(monthly)} SIP, at the same assumed return.`
              : undefined
          }
        />
      }
      chart={<GrowthChart series={p.series} />}
    />
  );
}
