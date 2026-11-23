import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app.ts';
import { createLimiter, createSession, verifySession } from './auth.ts';
import { openDb } from './db.ts';
import { createImageStore, detectImageExt } from './images.ts';
import { parseEnquiry } from './validation.ts';

const EMAIL = 'admin@example.com';
const PASSWORD = 'correct horse battery';
const SECRET = 'test-secret';

const enquiry = {
  Name: 'Asha Rao',
  Email: 'asha@example.com',
  Phone: '+91 98765 43210',
  Message: 'I want to start a SIP for my daughter.',
  'Consent to contact': 'Yes',
};
const consultation = {
  ...enquiry,
  Topic: 'Something else',
  'Preferred date': '2099-01-01',
  'Preferred time': '10:00 am – 12:00 pm',
  'Meeting type': 'Phone call',
};

/** Smallest valid-looking PNG / JPEG headers (only the magic bytes matter to the server). */
const png = (tag = 0) => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, tag]), Buffer.alloc(32)]);
const jpg = () => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(32)]);

let server: Server;
let base: string;
let uploadDir: string;
let notify: ReturnType<typeof vi.fn>;

beforeAll(async () => {
  uploadDir = mkdtempSync(join(tmpdir(), 'mfd-uploads-'));
  notify = vi.fn();
  const app = createApp({ db: openDb(':memory:'), images: createImageStore(uploadDir), adminEmail: EMAIL, adminPassword: PASSWORD, sessionSecret: SECRET, notify });
  await new Promise<void>((r) => (server = app.listen(0, '127.0.0.1', r)));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(async () => {
  await new Promise((r) => server.close(r));
  rmSync(uploadDir, { recursive: true, force: true });
});

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });

async function login(): Promise<Record<string, string>> {
  const res = await post('/api/admin/login', { email: EMAIL, password: PASSWORD });
  expect(res.status).toBe(200);
  const cookie = res.headers.get('set-cookie')!.split(';')[0];
  return { cookie, 'x-admin-request': '1' };
}
const send = (method: string, path: string, h: Record<string, string>, body?: BodyInit | null, type?: string) =>
  fetch(base + path, { method, headers: { ...h, ...(type ? { 'content-type': type } : {}) }, body });
const sendJson = (method: string, path: string, h: Record<string, string>, body: unknown) => send(method, path, h, JSON.stringify(body), 'application/json');

describe('validation', () => {
  it('normalises a valid enquiry and consultation', () => {
    const e = parseEnquiry(enquiry);
    expect(e.ok && e.data).toMatchObject({ type: 'enquiry', phone: '9876543210' });
    expect(parseEnquiry(consultation)).toMatchObject({ ok: true, data: { type: 'consultation' } });
  });
  it('rejects bad fields, past dates, unknown slots and non-objects', () => {
    const bad = parseEnquiry({ Name: 'A', Email: 'x', Phone: '1', Message: 'hi' });
    expect(!bad.ok && Object.keys(bad.errors).sort()).toEqual(['Consent to contact', 'Email', 'Message', 'Name', 'Phone']);
    const past = parseEnquiry({ ...consultation, 'Preferred date': '2001-01-01', 'Preferred time': 'midnight' });
    expect(!past.ok && Object.keys(past.errors)).toEqual(['Preferred date', 'Preferred time']);
    for (const x of [null, 'x', []]) expect(parseEnquiry(x).ok).toBe(false);
  });
  it('strips control characters', () => {
    const r = parseEnquiry({ ...enquiry, Name: 'Asha\r\nBcc: x@y.z' });
    expect(r.ok && r.data.name).not.toMatch(/[\r\n]/);
  });
});

describe('auth helpers', () => {
  it('verifies, rejects tampered and expired sessions', () => {
    const t = createSession(SECRET);
    expect(verifySession(t, SECRET)).toBe(true);
    expect(verifySession(t, 'other')).toBe(false);
    expect(verifySession(`${t}x`, SECRET)).toBe(false);
    expect(verifySession(t, SECRET, Date.now() + 9 * 3600_000)).toBe(false);
    expect(verifySession(undefined, SECRET)).toBe(false);
  });
  it('limiter blocks after max hits', () => {
    const l = createLimiter(2, 1000);
    expect([l.hit('a'), l.hit('a'), l.hit('a'), l.hit('b')]).toEqual([true, true, false, true]);
  });
});

describe('image detection', () => {
  it('trusts bytes, not labels', () => {
    expect(detectImageExt(png())).toBe('png');
    expect(detectImageExt(jpg())).toBe('jpg');
    expect(detectImageExt(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
  });
});

describe('public enquiry endpoint', () => {
  it('stores a valid enquiry and triggers the notification', async () => {
    const res = await post('/api/enquiry', enquiry);
    expect(res.status).toBe(200);
    expect(notify).toHaveBeenCalledOnce();
    expect(notify.mock.calls[0][0]).toMatchObject({ name: 'Asha Rao', status: 'new' });
  });
  it('returns field errors for invalid input', async () => {
    const res = await post('/api/enquiry', {});
    expect(res.status).toBe(400);
    expect((await res.json()).fields).toBeDefined();
  });
});

describe('admin auth', () => {
  it('rejects wrong password and unauthenticated access', async () => {
    expect((await post('/api/admin/login', { email: EMAIL, password: 'nope' })).status).toBe(401);
    expect((await post('/api/admin/login', { email: 'someone@else.com', password: PASSWORD })).status).toBe(401);
    expect((await post('/api/admin/login', { password: PASSWORD })).status).toBe(401);
    expect((await fetch(`${base}/api/admin/enquiries`)).status).toBe(401);
    expect((await fetch(`${base}/api/admin/gallery`)).status).toBe(401);
  });
  it('requires the CSRF header for mutations even with a valid session', async () => {
    const { cookie } = await login();
    expect((await sendJson('PATCH', '/api/admin/enquiries/1', { cookie }, { status: 'closed' })).status).toBe(403);
  });
  it('sets an HttpOnly SameSite=Strict cookie, and logout clears it', async () => {
    const res = await post('/api/admin/login', { email: EMAIL, password: PASSWORD });
    const c = res.headers.get('set-cookie')!;
    expect(c).toMatch(/HttpOnly/);
    expect(c).toMatch(/SameSite=Strict/);
    const out = await post('/api/admin/logout', {});
    expect(out.headers.get('set-cookie')).toMatch(/Max-Age=0/);
  });
  it('accepts the email in any case and with spaces', async () => {
    expect((await post('/api/admin/login', { email: '  Admin@Example.COM ', password: PASSWORD })).status).toBe(200);
  });
});

describe('forgot / reset password', () => {
  // Own app and database, so changing the password doesn't affect the other suites.
  let srv: Server;
  let url: string;
  let db: ReturnType<typeof openDb>;
  const sendResetLink = vi.fn();
  const startApp = async (adminPassword: string) => {
    const app = createApp({
      db,
      images: createImageStore(uploadDir),
      adminEmail: EMAIL,
      adminPassword,
      sessionSecret: SECRET,
      publicUrl: 'https://site.test',
      sendResetLink,
    });
    await new Promise<void>((r) => (srv = app.listen(0, '127.0.0.1', r)));
    url = `http://127.0.0.1:${(srv.address() as AddressInfo).port}`;
  };
  const stopApp = () => new Promise((r) => srv.close(r));
  const p = (path: string, body: unknown) =>
    fetch(url + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const tokenFromLink = () => new URL(String(sendResetLink.mock.lastCall![1])).searchParams.get('reset')!;

  beforeAll(async () => {
    db = openDb(':memory:');
    await startApp(PASSWORD);
  });
  afterAll(stopApp);

  it('answers the same for unknown emails and sends nothing', async () => {
    const res = await p('/api/admin/forgot-password', { email: 'stranger@example.com' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendResetLink).not.toHaveBeenCalled();
  });

  it('emails a one-time link on the configured site address, then resets the password', async () => {
    const before = await p('/api/admin/login', { email: EMAIL, password: PASSWORD });
    const oldCookie = before.headers.get('set-cookie')!.split(';')[0];

    expect((await p('/api/admin/forgot-password', { email: 'ADMIN@example.com' })).status).toBe(200);
    expect(sendResetLink).toHaveBeenCalledOnce();
    const [to, link] = sendResetLink.mock.lastCall!;
    expect(to).toBe(EMAIL);
    expect(link).toMatch(/^https:\/\/site\.test\/admin\?reset=/);
    const token = tokenFromLink();

    expect((await p('/api/admin/reset-password', { token, password: 'short' })).status).toBe(400);
    expect((await p('/api/admin/reset-password', { token: 'forged', password: 'a brand new password' })).status).toBe(400);
    expect((await p('/api/admin/reset-password', { token, password: 'a brand new password' })).status).toBe(200);
    // Single use.
    expect((await p('/api/admin/reset-password', { token, password: 'another new password' })).status).toBe(400);

    expect((await p('/api/admin/login', { email: EMAIL, password: PASSWORD })).status).toBe(401);
    expect((await p('/api/admin/login', { email: EMAIL, password: 'a brand new password' })).status).toBe(200);
    // Sessions from before the reset are signed out.
    expect((await fetch(`${url}/api/admin/me`, { headers: { cookie: oldCookie } })).status).toBe(401);
  });

  it('rejects expired tokens', async () => {
    await p('/api/admin/forgot-password', { email: EMAIL });
    const token = tokenFromLink();
    expect(db.consumeResetToken('x', Date.now())).toBe(false);
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 31 * 60 * 1000);
    try {
      expect((await p('/api/admin/reset-password', { token, password: 'yet another password' })).status).toBe(400);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('changing ADMIN_PASSWORD in .env takes over again', async () => {
    await stopApp();
    await startApp('a password from env');
    expect((await p('/api/admin/login', { email: EMAIL, password: 'a brand new password' })).status).toBe(401);
    expect((await p('/api/admin/login', { email: EMAIL, password: 'a password from env' })).status).toBe(200);
  });
});

describe('admin enquiries', () => {
  let h: Record<string, string>;
  beforeEach(async () => {
    h = await login();
  });

  it('lists, filters, searches, updates and deletes', async () => {
    await post('/api/enquiry', { ...consultation, Name: 'Bharat 100% Kumar' });
    const all = await (await send('GET', '/api/admin/enquiries', h)).json();
    expect(all.total).toBeGreaterThanOrEqual(2);

    const onlyConsult = await (await send('GET', '/api/admin/enquiries?type=consultation', h)).json();
    expect(onlyConsult.items.every((e: { type: string }) => e.type === 'consultation')).toBe(true);

    // LIKE wildcards in the search are literal.
    const search = await (await send('GET', `/api/admin/enquiries?q=${encodeURIComponent('100%')}`, h)).json();
    expect(search.items).toHaveLength(1);
    const id = search.items[0].id;

    const patched = await sendJson('PATCH', `/api/admin/enquiries/${id}`, h, { status: 'contacted', notes: 'Called, will follow up' });
    expect((await patched.json()).enquiry).toMatchObject({ status: 'contacted', notes: 'Called, will follow up' });
    expect((await sendJson('PATCH', `/api/admin/enquiries/${id}`, h, { status: 'bogus' })).status).toBe(400);

    const stats = await (await send('GET', '/api/admin/stats', h)).json();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.byStatus.contacted).toBe(1);
    expect(stats.days).toHaveLength(14);

    expect((await send('DELETE', `/api/admin/enquiries/${id}`, h)).status).toBe(200);
    expect((await send('DELETE', `/api/admin/enquiries/${id}`, h)).status).toBe(404);
  });

  it('exports CSV with formula injection neutralised', async () => {
    await post('/api/enquiry', { ...enquiry, Name: '=HYPERLINK("http://evil")' });
    const res = await send('GET', '/api/admin/export.csv', h);
    expect(res.headers.get('content-type')).toMatch(/text\/csv/);
    const text = await res.text();
    expect(text).toContain("'=HYPERLINK");
    expect(text).not.toMatch(/,=HYPERLINK/);
  });
});

describe('gallery', () => {
  let h: Record<string, string>;
  beforeEach(async () => {
    h = await login();
  });

  it('uploads, serves, edits, hides, replaces, reorders and deletes', async () => {
    const up = await send('POST', '/api/admin/gallery?caption=Office&alt=Our%20office', h, png(1), 'image/png');
    expect(up.status).toBe(201);
    const a = (await up.json()).photo;
    expect(a).toMatchObject({ caption: 'Office', alt: 'Our office', visible: true });
    const b = (await (await send('POST', '/api/admin/gallery', h, jpg(), 'image/jpeg')).json()).photo;

    // Public gallery lists both, in upload order, and serves the file.
    let pub = await (await fetch(`${base}/api/gallery`)).json();
    expect(pub.photos.map((p: { id: number }) => p.id)).toEqual([a.id, b.id]);
    expect(pub.photos[0]).not.toHaveProperty('filename');
    const file = await fetch(base + a.url);
    expect(file.status).toBe(200);
    expect(file.headers.get('x-content-type-options')).toBe('nosniff');

    // Hide, edit caption.
    const patched = await (await sendJson('PATCH', `/api/admin/gallery/${b.id}`, h, { visible: false, caption: 'Hidden' })).json();
    expect(patched.photo).toMatchObject({ visible: false, caption: 'Hidden' });
    pub = await (await fetch(`${base}/api/gallery`)).json();
    expect(pub.photos.map((p: { id: number }) => p.id)).toEqual([a.id]);

    // Reorder.
    const ordered = await (await sendJson('PUT', '/api/admin/gallery/order', h, { ids: [b.id, a.id] })).json();
    expect(ordered.photos.map((p: { id: number }) => p.id)).toEqual([b.id, a.id]);

    // Change photo: new file, same record, old file removed.
    const oldName = a.filename;
    const rep = await send('PUT', `/api/admin/gallery/${a.id}/image`, h, jpg(), 'image/jpeg');
    expect(rep.status).toBe(200);
    const replaced = (await rep.json()).photo;
    expect(replaced.id).toBe(a.id);
    expect(replaced.filename).not.toBe(oldName);
    expect(replaced.caption).toBe('Office');
    expect(existsSync(join(uploadDir, oldName))).toBe(false);
    expect(existsSync(join(uploadDir, replaced.filename))).toBe(true);

    // Delete removes the file.
    expect((await send('DELETE', `/api/admin/gallery/${a.id}`, h)).status).toBe(200);
    expect(existsSync(join(uploadDir, replaced.filename))).toBe(false);
    expect((await send('DELETE', `/api/admin/gallery/${a.id}`, h)).status).toBe(404);
    await send('DELETE', `/api/admin/gallery/${b.id}`, h);
    expect(readdirSync(uploadDir)).toHaveLength(0);
  });

  it('rejects non-images, wrong types, oversize uploads and empty bodies', async () => {
    const fake = Buffer.from('<html><script>alert(1)</script></html>' + ' '.repeat(40));
    expect((await send('POST', '/api/admin/gallery', h, fake, 'image/jpeg')).status).toBe(415); // label lies
    expect((await send('POST', '/api/admin/gallery', h, png(), 'text/html')).status).toBe(415);
    expect((await send('POST', '/api/admin/gallery', h, null, 'image/png')).status).toBe(415);
    expect((await send('POST', '/api/admin/gallery', h, Buffer.alloc(9 * 1024 * 1024), 'image/png')).status).toBe(413);
    expect(readdirSync(uploadDir)).toHaveLength(0);
  });

  it('does not serve path traversal from /uploads', async () => {
    const res = await fetch(`${base}/uploads/..%2f..%2fpackage.json`);
    expect(res.status).not.toBe(200);
  });
});
