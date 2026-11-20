import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const COOKIE_NAME = 'admin_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('base64url');

const safeEqual = (a: string, b: string) => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
};

/** Constant-time password check (hashing first hides the length of the real password). */
export function checkPassword(given: unknown, expected: string): boolean {
  if (typeof given !== 'string') return false;
  const h = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(given), h(expected));
}

/** Stateless signed session token: `<base64url({exp})>.<hmac>`. */
export function createSession(secret: string, now = Date.now()): string {
  const payload = b64(JSON.stringify({ exp: now + SESSION_TTL_MS, n: randomBytes(8).toString('hex') }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySession(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload, secret))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp?: number };
    return typeof exp === 'number' && exp > now;
  } catch {
    return false;
  }
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

export function sessionCookie(token: string, secure: boolean): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}${secure ? '; Secure' : ''}`;
}

export function clearCookie(secure: boolean): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

/** Fixed-window attempt limiter keyed by string (IP). Best-effort, in memory. */
export function createLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  const recent = (key: string, now: number) => (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  return {
    /** Records an attempt; returns false when the key is over the limit. */
    hit(key: string, now = Date.now()): boolean {
      const r = recent(key, now);
      if (r.length >= max) {
        hits.set(key, r);
        return false;
      }
      r.push(now);
      hits.set(key, r);
      if (hits.size > 5000) for (const [k] of hits) if (!recent(k, now).length) hits.delete(k);
      return true;
    },
    /** True when the key is already at the limit (without recording). */
    blocked: (key: string, now = Date.now()) => recent(key, now).length >= max,
    reset: (key: string) => void hits.delete(key),
  };
}
