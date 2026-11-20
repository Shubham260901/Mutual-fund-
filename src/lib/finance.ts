/**
 * Calculator maths. Pure functions, unit-tested in finance.test.ts.
 *
 * Conventions (matching common Indian MF calculators):
 *  - SIP contributions are made at the START of each month (annuity due).
 *  - The annual rate is converted to a monthly rate as r/12.
 *  - Lump sums compound annually.
 * All outputs are hypothetical: a constant assumed rate is not a prediction.
 */

export interface YearPoint {
  year: number;
  invested: number;
  value: number;
}

export interface Projection {
  invested: number;
  value: number;
  gains: number;
  series: YearPoint[];
}

const monthlyRate = (annualPct: number) => annualPct / 12 / 100;

/** Future value of a monthly SIP, annuity-due. */
export function sipFutureValue(monthly: number, annualPct: number, months: number) {
  const i = monthlyRate(annualPct);
  if (months <= 0 || monthly <= 0) return 0;
  if (i === 0) return monthly * months;
  return monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
}

export function projectSip(monthly: number, annualPct: number, years: number): Projection {
  const series: YearPoint[] = [{ year: 0, invested: 0, value: 0 }];
  for (let y = 1; y <= years; y++) {
    series.push({ year: y, invested: monthly * 12 * y, value: sipFutureValue(monthly, annualPct, y * 12) });
  }
  const last = series[series.length - 1];
  return { invested: last.invested, value: last.value, gains: last.value - last.invested, series };
}

export function projectLumpSum(principal: number, annualPct: number, years: number): Projection {
  const r = annualPct / 100;
  const series: YearPoint[] = [];
  for (let y = 0; y <= years; y++) {
    series.push({ year: y, invested: principal, value: principal * Math.pow(1 + r, y) });
  }
  const last = series[series.length - 1];
  return { invested: principal, value: last.value, gains: last.value - principal, series };
}

/**
 * Step-up SIP: the monthly amount rises by `stepUpPct` at the start of every
 * new year. Simulated month by month (annuity-due).
 */
export function projectStepUpSip(
  monthly: number,
  stepUpPct: number,
  annualPct: number,
  years: number,
): Projection & { finalMonthly: number; flatSipValue: number } {
  const i = monthlyRate(annualPct);
  const series: YearPoint[] = [{ year: 0, invested: 0, value: 0 }];
  let value = 0;
  let invested = 0;
  let current = monthly;
  for (let y = 1; y <= years; y++) {
    if (y > 1) current = current * (1 + stepUpPct / 100);
    for (let m = 0; m < 12; m++) {
      value = (value + current) * (1 + i);
      invested += current;
    }
    series.push({ year: y, invested, value });
  }
  return {
    invested,
    value,
    gains: value - invested,
    series,
    finalMonthly: years > 0 ? current : monthly,
    flatSipValue: sipFutureValue(monthly, annualPct, years * 12),
  };
}

export interface GoalPlan {
  /** Cost of the goal after inflation, in the target year. */
  futureCost: number;
  /** What existing savings could grow to by the target year. */
  existingGrowth: number;
  /** Shortfall to be funded by new investments. */
  shortfall: number;
  /** Monthly SIP needed to meet the shortfall. */
  monthlySip: number;
  /** Alternatively, one-time investment needed today. */
  lumpSumToday: number;
  /** Total of all SIP instalments. */
  totalSipInvested: number;
}

export function planGoal(
  costToday: number,
  years: number,
  inflationPct: number,
  annualPct: number,
  existingSavings = 0,
): GoalPlan {
  const futureCost = costToday * Math.pow(1 + inflationPct / 100, years);
  const existingGrowth = existingSavings * Math.pow(1 + annualPct / 100, years);
  const shortfall = Math.max(0, futureCost - existingGrowth);
  const months = years * 12;
  const i = monthlyRate(annualPct);
  const factor = i === 0 ? months : ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  const monthlySip = months > 0 ? shortfall / factor : shortfall;
  const lumpSumToday = shortfall / Math.pow(1 + annualPct / 100, years);
  return {
    futureCost,
    existingGrowth,
    shortfall,
    monthlySip,
    lumpSumToday,
    totalSipInvested: monthlySip * months,
  };
}

/** Year-by-year path of a goal SIP: used to chart progress toward the target. */
export function projectGoalSip(monthlySip: number, annualPct: number, years: number, existingSavings: number) {
  const sip = projectSip(monthlySip, annualPct, years);
  return sip.series.map((p) => ({
    year: p.year,
    invested: p.invested + existingSavings,
    value: p.value + existingSavings * Math.pow(1 + annualPct / 100, p.year),
  }));
}
