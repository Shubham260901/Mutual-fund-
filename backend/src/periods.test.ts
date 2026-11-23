import { mkdtempSync, rmSync } from 'node:fs';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.ts';
import { openDb } from './db.ts';
import { createImageStore } from './images.ts';
import { periodRange } from './validation.ts';

describe('periodRange (India time)', () => {
  it('today runs from IST midnight, which is 18:30 UTC the day before', () => {
    const r = periodRange('today', '2026-11-20');
    expect(r.from).toBe('2026-11-19T18:30:00.000Z');
    expect(r.to).toBe('2026-11-20T18:30:00.000Z');
    expect(r.previous).toEqual({ from: '2026-11-18T18:30:00.000Z', to: '2026-11-19T18:30:00.000Z' });
  });

  it('week starts on Monday (2026-11-20 is a Friday) and compares with the previous full week', () => {
    const r = periodRange('week', '2026-11-20');
    expect(r.from).toBe('2026-11-15T18:30:00.000Z'); // Mon 16 Nov, IST
    expect(r.previous.from).toBe('2026-11-08T18:30:00.000Z'); // Mon 9 Nov
    expect(r.previous.to).toBe(r.from);
  });

  it('week on a Monday starts that same day; on a Sunday it reaches back six days', () => {
    expect(periodRange('week', '2026-11-16').from).toBe('2026-11-15T18:30:00.000Z');
    expect(periodRange('week', '2026-11-22').from).toBe('2026-11-15T18:30:00.000Z');
  });

  it('month starts on the 1st and the previous month crosses the year boundary', () => {
    expect(periodRange('month', '2026-11-20').from).toBe('2026-10-31T18:30:00.000Z');
    const jan = periodRange('month', '2026-01-15');
    expect(jan.from).toBe('2025-12-31T18:30:00.000Z');
    expect(jan.previous.from).toBe('2025-11-30T18:30:00.000Z'); // 1 Dec 2025, IST
  });
});

describe('period and upcoming filters', () => {
  let server: Server;
  let base: string;
  let dir: string;
  let h: Record<string, string>;
  const db = openDb(':memory:');

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'mfd-periods-'));
    const app = createApp({ db, images: createImageStore(dir), adminEmail: 'admin@example.com', adminPassword: 'pw-for-tests-123', sessionSecret: 's', notify: () => {} });
    await new Promise<void>((r) => (server = app.listen(0, '127.0.0.1', r)));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const res = await fetch(`${base}/api/admin/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'admin@example.com', password: 'pw-for-tests-123' }) });
    h = { cookie: res.headers.get('set-cookie')!.split(';')[0], 'x-admin-request': '1' };

    const post = (b: unknown) => fetch(`${base}/api/enquiry`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
    const c = { Name: 'Asha Rao', Email: 'a@b.co', Phone: '9876543210', 'Consent to contact': 'Yes' };
    await post({ ...c, Message: 'A question about SIPs please' });
    await post({ ...c, Topic: 'SIP Investments', 'Preferred date': '2099-01-01', 'Preferred time': '10:00 am – 12:00 pm', 'Meeting type': 'Phone call' });
  });
  afterAll(async () => {
    await new Promise((r) => server.close(r));
    rmSync(dir, { recursive: true, force: true });
  });

  const get = async (path: string) => (await (await fetch(base + path, { headers: h })).json()) as any;

  it('stats report counts per period with the previous period', async () => {
    const s = await get('/api/admin/stats');
    for (const p of ['today', 'week', 'month']) {
      expect(s.periods[p].count).toBe(2);
      expect(s.periods[p].previous).toBe(0);
    }
  });

  it('period filters list the same enquiries the cards count', async () => {
    for (const p of ['today', 'week', 'month']) expect((await get(`/api/admin/enquiries?period=${p}`)).total).toBe(2);
    expect((await get('/api/admin/enquiries?period=bogus')).total).toBe(2); // unknown period is ignored
  });

  it('upcoming=1 returns only open future consultations and combines with other filters', async () => {
    const up = await get('/api/admin/enquiries?upcoming=1');
    expect(up.total).toBe(1);
    expect(up.items[0].type).toBe('consultation');
    expect((await get('/api/admin/enquiries?upcoming=1&status=closed')).total).toBe(0);
    // Closing it removes it from "upcoming", matching the dashboard card.
    await fetch(`${base}/api/admin/enquiries/${up.items[0].id}`, { method: 'PATCH', headers: { ...h, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'closed' }) });
    expect((await get('/api/admin/enquiries?upcoming=1')).total).toBe(0);
    expect((await get('/api/admin/stats')).upcomingConsultations).toBe(0);
  });

  it('CSV export honours the same filters', async () => {
    const csv = await (await fetch(`${base}/api/admin/export.csv?type=consultation`, { headers: h })).text();
    expect(csv.trim().split('\r\n')).toHaveLength(2); // header + the one consultation
  });
});
