import { describe, expect, it } from 'vitest';
import { planGoal, projectLumpSum, projectSip, projectStepUpSip, sipFutureValue } from './finance';

describe('sipFutureValue', () => {
  it('matches the standard annuity-due formula (₹10,000 × 10y @ 12%)', () => {
    // Widely published reference value: ≈ ₹23,23,391
    expect(sipFutureValue(10_000, 12, 120)).toBeCloseTo(2_323_391, -1);
  });

  it('returns simple total at 0% return', () => {
    expect(sipFutureValue(5_000, 0, 24)).toBe(120_000);
  });

  it('returns 0 for zero months', () => {
    expect(sipFutureValue(5_000, 12, 0)).toBe(0);
  });
});

describe('projectSip', () => {
  it('builds a yearly series with invested = monthly × 12 × years', () => {
    const p = projectSip(1_000, 10, 5);
    expect(p.series).toHaveLength(6);
    expect(p.invested).toBe(60_000);
    expect(p.gains).toBeCloseTo(p.value - p.invested);
  });
});

describe('projectLumpSum', () => {
  it('compounds annually', () => {
    const p = projectLumpSum(100_000, 10, 2);
    expect(p.value).toBeCloseTo(121_000, 5);
  });
});

describe('projectStepUpSip', () => {
  it('equals a flat SIP when step-up is 0%', () => {
    const p = projectStepUpSip(10_000, 0, 12, 10);
    expect(p.value).toBeCloseTo(sipFutureValue(10_000, 12, 120), 4);
    expect(p.finalMonthly).toBe(10_000);
  });

  it('raises the instalment every year', () => {
    const p = projectStepUpSip(10_000, 10, 12, 3);
    expect(p.finalMonthly).toBeCloseTo(12_100, 6);
    expect(p.invested).toBeCloseTo(12 * (10_000 + 11_000 + 12_100), 6);
    expect(p.value).toBeGreaterThan(p.flatSipValue);
  });
});

describe('planGoal', () => {
  it('a SIP of the computed amount reaches the inflated goal', () => {
    const g = planGoal(1_000_000, 10, 6, 12, 0);
    expect(g.futureCost).toBeCloseTo(1_000_000 * Math.pow(1.06, 10), 4);
    expect(sipFutureValue(g.monthlySip, 12, 120)).toBeCloseTo(g.futureCost, 2);
  });

  it('has no shortfall when existing savings already cover the goal', () => {
    const g = planGoal(100_000, 5, 6, 12, 1_000_000);
    expect(g.shortfall).toBe(0);
    expect(g.monthlySip).toBe(0);
  });
});
