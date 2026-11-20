const inrFull = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const plain = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** ₹12,34,567 (Indian digit grouping) */
export const formatINR = (value: number) => inrFull.format(Math.round(Number.isFinite(value) ? value : 0));

/** 12,34,567 */
export const formatNumber = (value: number) => plain.format(Math.round(value));

/** ₹12.35 L, ₹1.20 Cr, ₹45.0K: compact Indian notation for headlines and axes. */
export const formatINRCompact = (value: number, digits = 2) => {
  const v = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (v >= 1e7) return `${sign}₹${(v / 1e7).toFixed(digits)} Cr`;
  if (v >= 1e5) return `${sign}₹${(v / 1e5).toFixed(digits)} L`;
  if (v >= 1e3) return `${sign}₹${(v / 1e3).toFixed(digits === 0 ? 0 : 1)}K`;
  return `${sign}₹${Math.round(v)}`;
};

/** Axis labels: no trailing zeros. */
export const formatAxisINR = (value: number) => {
  if (value === 0) return '0';
  const v = Math.abs(value);
  const trim = (n: number) => String(Number(n.toFixed(1)));
  if (v >= 1e7) return `${trim(value / 1e7)} Cr`;
  if (v >= 1e5) return `${trim(value / 1e5)} L`;
  if (v >= 1e3) return `${trim(value / 1e3)}K`;
  return String(Math.round(value));
};

/** Spell out a large amount for screen readers and helper text: "12.5 lakh". */
export const inWords = (value: number) => {
  const v = Math.abs(value);
  const trim = (n: number) => String(Number(n.toFixed(2)));
  if (v >= 1e7) return `${trim(value / 1e7)} crore`;
  if (v >= 1e5) return `${trim(value / 1e5)} lakh`;
  if (v >= 1e3) return `${trim(value / 1e3)} thousand`;
  return String(Math.round(value));
};
