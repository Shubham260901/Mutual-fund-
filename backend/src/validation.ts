/** Server-side validation for the public enquiry form. Never trust the browser's checks. */

export const STATUSES = ['new', 'contacted', 'scheduled', 'closed', 'spam'] as const;
export type Status = (typeof STATUSES)[number];
export const isStatus = (v: unknown): v is Status => typeof v === 'string' && (STATUSES as readonly string[]).includes(v);

export const MEETING_TYPES = ['Phone call', 'Video call', 'In-person meeting'];
export const SLOTS = ['10:00 am – 12:00 pm', '12:00 pm – 2:00 pm', '2:00 pm – 4:00 pm', '4:00 pm – 6:00 pm'];

const MAX_BODY_FIELDS = 20;

/**
 * Strips control characters, trims and caps the length. Newlines are removed too unless
 * `multiline` is set, so single-line fields (name, email, caption...) can never inject
 * extra lines into an email header or a CSV row.
 */
export const clean = (v: unknown, max: number, multiline = false): string => {
  const keep = (ch: string) => {
    const c = ch.charCodeAt(0);
    return c === 10 ? multiline : c >= 32 && c !== 127;
  };
  return Array.from(typeof v === 'string' ? v : '')
    .filter(keep)
    .join('')
    .trim()
    .slice(0, max);
};

/** Today's date in India (UTC+5:30) as YYYY-MM-DD. */
export function todayIST(now = Date.now()): string {
  return new Date(now + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export const PERIODS = ['today', 'week', 'month'] as const;
export type Period = (typeof PERIODS)[number];
export const isPeriod = (v: unknown): v is Period => typeof v === 'string' && (PERIODS as readonly string[]).includes(v);

/** The UTC instant at which a given India calendar day (YYYY-MM-DD) begins. */
export const istStart = (ymd: string): string => new Date(`${ymd}T00:00:00+05:30`).toISOString();

const addDays = (ymd: string, n: number) => new Date(new Date(`${ymd}T00:00:00Z`).getTime() + n * 86_400_000).toISOString().slice(0, 10);

/**
 * Time range for a dashboard period in India time. `from` is inclusive, `to` exclusive.
 * "week" starts on Monday; "month" on the 1st. `previous` is the full period before it.
 */
export function periodRange(period: Period, todayIST: string): { from: string; to: string; previous: { from: string; to: string } } {
  const tomorrow = addDays(todayIST, 1);
  let start: string;
  let prevStart: string;
  if (period === 'today') {
    start = todayIST;
    prevStart = addDays(todayIST, -1);
  } else if (period === 'week') {
    const dow = (new Date(`${todayIST}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
    start = addDays(todayIST, -dow);
    prevStart = addDays(start, -7);
  } else {
    start = `${todayIST.slice(0, 8)}01`;
    const prevMonth = new Date(Date.UTC(Number(todayIST.slice(0, 4)), Number(todayIST.slice(5, 7)) - 2, 1));
    prevStart = prevMonth.toISOString().slice(0, 10);
  }
  return { from: istStart(start), to: istStart(tomorrow), previous: { from: istStart(prevStart), to: istStart(start) } };
}

export interface NewEnquiry {
  type: 'enquiry' | 'consultation';
  name: string;
  email: string;
  phone: string;
  topic: string;
  preferredDate: string;
  preferredTime: string;
  meetingType: string;
  message: string;
}

export type ParseResult = { ok: true; data: NewEnquiry } | { ok: false; errors: Record<string, string> };

export function parseEnquiry(input: unknown, now = Date.now()): ParseResult {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length > MAX_BODY_FIELDS) {
    return { ok: false, errors: { _: 'Invalid request.' } };
  }
  const raw = input as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const name = clean(raw.Name, 100);
  const email = clean(raw.Email, 254);
  const phoneRaw = clean(raw.Phone, 30);
  const message = clean(raw.Message, 2000, true);
  const topic = clean(raw.Topic, 120);
  const type = topic ? 'consultation' : 'enquiry';

  if (name.length < 2) errors.Name = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.Email = 'Please enter a valid email address.';
  const phone = phoneRaw.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(phone)) errors.Phone = 'Please enter a valid 10-digit Indian mobile number.';
  if (type === 'enquiry' && message.length < 10) errors.Message = 'Please tell us a little more (at least 10 characters).';
  if (clean(raw['Consent to contact'], 10) !== 'Yes') errors['Consent to contact'] = 'Consent to be contacted is required.';

  let preferredDate = '';
  let preferredTime = '';
  let meetingType = '';
  if (type === 'consultation') {
    preferredDate = clean(raw['Preferred date'], 10);
    preferredTime = clean(raw['Preferred time'], 30);
    meetingType = clean(raw['Meeting type'], 30);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || Number.isNaN(Date.parse(preferredDate))) errors['Preferred date'] = 'Please choose a valid date.';
    else if (preferredDate < todayIST(now)) errors['Preferred date'] = 'Please choose a date in the future.';
    if (!SLOTS.includes(preferredTime)) errors['Preferred time'] = 'Please choose a time slot.';
    if (!MEETING_TYPES.includes(meetingType)) errors['Meeting type'] = 'Please choose how you would like to meet.';
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: { type, name, email, phone, topic, preferredDate, preferredTime, meetingType, message } };
}
