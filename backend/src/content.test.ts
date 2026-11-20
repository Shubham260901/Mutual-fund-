import { mkdtempSync, rmSync } from 'node:fs';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.ts';
import { parseContent, publicContent } from './content.ts';
import { openDb } from './db.ts';
import { createImageStore } from './images.ts';

const PASSWORD = 'pw-for-tests-123';
let server: Server;
let base: string;
let dir: string;
let h: Record<string, string>;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'mfd-content-'));
  const app = createApp({ db: openDb(':memory:'), images: createImageStore(dir), adminPassword: PASSWORD, sessionSecret: 's', notify: () => {} });
  await new Promise<void>((r) => (server = app.listen(0, '127.0.0.1', r)));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const res = await fetch(`${base}/api/admin/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: PASSWORD }) });
  h = { cookie: res.headers.get('set-cookie')!.split(';')[0], 'x-admin-request': '1' };
});
afterAll(async () => {
  await new Promise((r) => server.close(r));
  rmSync(dir, { recursive: true, force: true });
});

const call = (method: string, path: string, body?: unknown) =>
  fetch(base + path, { method, headers: { ...h, ...(body !== undefined ? { 'content-type': 'application/json' } : {}) }, body: body !== undefined ? JSON.stringify(body) : undefined });

const article = (over: Record<string, unknown> = {}) => ({
  slug: 'my-first-article',
  title: 'My first article',
  excerpt: 'A short summary.',
  category: 'Basics',
  readMinutes: 3,
  body: [
    { type: 'h2', text: 'Heading' },
    { type: 'p', text: 'Paragraph.' },
    { type: 'ul', items: ['one', 'two', ''] },
  ],
  ...over,
});

describe('content validation', () => {
  it('accepts a valid article and drops empty list items and unknown blocks', () => {
    const r = parseContent('articles', [article({ body: [...article().body, { type: 'script', text: 'x' }, { type: 'p', text: '  ' }] })]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const a = (r.value as { body: { type: string; items?: string[] }[] }[])[0];
      expect(a.body).toHaveLength(3);
      expect(a.body[2].items).toEqual(['one', 'two']);
    }
  });

  it('rejects bad slugs, duplicates, bad categories and empty published articles', () => {
    expect(parseContent('articles', [article({ slug: 'Bad Slug!' })]).ok).toBe(false);
    expect(parseContent('articles', [article(), article()]).ok).toBe(false);
    expect(parseContent('articles', [article({ category: 'Hacks' })]).ok).toBe(false);
    expect(parseContent('articles', [article({ body: [] })]).ok).toBe(false);
    expect(parseContent('articles', [article({ body: [], published: false })]).ok).toBe(true); // drafts may be empty
  });

  it('validates services: unique ids, safe calculator links, known icons', () => {
    const svc = (over = {}) => ({ id: 'sip', icon: 'Nope', title: 'SIP', summary: 's', description: 'd', points: ['a'], ...over });
    const ok = parseContent('services', [svc({ calculator: { label: 'Try', to: '/calculators#sip' } })]);
    expect(ok.ok && (ok.value as { icon: string }[])[0].icon).toBe('Briefcase');
    const bad = parseContent('services', [svc({ calculator: { label: 'x', to: 'javascript:alert(1)' } })]);
    expect(bad.ok && 'calculator' in (bad.value as object[])[0]).toBe(false);
    expect(parseContent('services', [svc(), svc()]).ok).toBe(false);
  });

  it('settings: whitelists fields, never stores regulatory data, checks urls and email', () => {
    const r = parseContent('settings', {
      name: 'Deepak Gedam',
      credentials: { arn: 'ARN-FAKE' },
      legalName: 'Hacked Ltd',
      contact: { email: 'a@b.co', whatsapp: '+91 93006 58007', grievanceEmail: 'x@y.z' },
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const v = r.value as Record<string, any>;
      expect(v).not.toHaveProperty('credentials');
      expect(v).not.toHaveProperty('legalName');
      expect(v.contact).not.toHaveProperty('grievanceEmail');
      expect(v.contact.whatsapp).toBe('919300658007');
    }
    expect(parseContent('settings', { name: 'X', contact: { email: 'nope' } }).ok).toBe(false);
    expect(parseContent('settings', { name: 'X', social: { linkedin: 'javascript:alert(1)' } }).ok).toBe(false);
    expect(parseContent('settings', { name: '' }).ok).toBe(false);
  });

  it('seo: keeps only known pages and non-empty entries', () => {
    const r = parseContent('seo', { '/': { title: 'Home', description: '' }, '/evil': { title: 'x' }, '/about': { title: '', description: '' } });
    expect(r.ok && r.value).toEqual({ '/': { title: 'Home', description: '' } });
  });

  it('public view hides drafts and hidden items', () => {
    const out = publicContent('articles', [{ slug: 'a', published: true }, { slug: 'b', published: false }]) as object[];
    expect(out).toEqual([{ slug: 'a' }]);
    expect(publicContent('homeFaqs', [{ q: 'x', a: 'y', visible: false }, { q: 'p', a: 'q', visible: true }])).toEqual([{ q: 'p', a: 'q' }]);
  });
});

describe('content API', () => {
  it('requires admin auth for editing but not for public reads', async () => {
    expect((await fetch(`${base}/api/admin/content/articles`)).status).toBe(401);
    expect((await fetch(`${base}/api/content`)).status).toBe(200);
  });

  it('saves, serves publicly (drafts hidden), and resets to default', async () => {
    expect((await (await fetch(`${base}/api/content`)).json() as any).content).toEqual({});

    const draft = article({ slug: 'draft-one', title: 'Draft', published: false });
    const put = await call('PUT', '/api/admin/content/articles', { value: [article(), draft] });
    expect(put.status).toBe(200);

    const admin = (await (await call('GET', '/api/admin/content/articles')).json()) as any;
    expect(admin.value).toHaveLength(2); // admin sees drafts

    const pub = (await (await fetch(`${base}/api/content`)).json()) as any;
    expect(pub.content.articles).toHaveLength(1);
    expect(pub.content.articles[0]).not.toHaveProperty('published');

    expect((await call('GET', '/api/admin/content')).status).toBe(200);
    expect((await call('DELETE', '/api/admin/content/articles')).status).toBe(200);
    expect(((await (await call('GET', '/api/admin/content/articles')).json()) as any).value).toBeNull();
  });

  it('rejects invalid content with a clear message and unknown keys', async () => {
    const bad = await call('PUT', '/api/admin/content/articles', { value: [article({ slug: 'BAD' })] });
    expect(bad.status).toBe(400);
    expect(((await bad.json()) as any).error).toMatch(/slug/);
    expect((await call('PUT', '/api/admin/content/nonsense', { value: [] })).status).toBe(404);
    expect((await call('PUT', '/api/admin/content/seo')).status).toBe(400);
  });

  it('sitemap lists static pages and published articles', async () => {
    await call('PUT', '/api/admin/content/articles', { value: [article({ slug: 'live-one' }), article({ slug: 'draft-two', published: false })] });
    const xml = await (await fetch(`${base}/sitemap.xml`)).text();
    expect(xml).toContain('/education/live-one');
    expect(xml).not.toContain('draft-two');
    expect(xml).toContain('/about');
  });
});

describe('media, analytics and activity', () => {
  it('uploads a standalone image and returns its url', async () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 1]), Buffer.alloc(32)]);
    const res = await fetch(`${base}/api/admin/media`, { method: 'POST', headers: { ...h, 'content-type': 'image/png' }, body: png });
    expect(res.status).toBe(201);
    const { url } = (await res.json()) as { url: string };
    expect((await fetch(base + url)).status).toBe(200);
    // Not part of the gallery.
    expect(((await (await fetch(`${base}/api/gallery`)).json()) as any).photos).toEqual([]);
  });

  it('analytics reports weekly trend, topics and upcoming consultations', async () => {
    const post = (b: unknown) => fetch(`${base}/api/enquiry`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
    const base1 = { Name: 'Asha Rao', Email: 'a@b.co', Phone: '9876543210', 'Consent to contact': 'Yes' };
    await post({ ...base1, Message: 'Tell me about SIPs please' });
    await post({ ...base1, Topic: 'SIP Investments', 'Preferred date': '2099-01-01', 'Preferred time': '10:00 am – 12:00 pm', 'Meeting type': 'Phone call' });
    const a = (await (await call('GET', '/api/admin/analytics')).json()) as any;
    expect(a.weeks).toHaveLength(12);
    const last = a.weeks[11];
    expect(last.enquiries).toBe(1);
    expect(last.consultations).toBe(1);
    expect(a.topics).toEqual([{ topic: 'SIP Investments', count: 1 }]);
    expect(a.upcoming).toHaveLength(1);
    expect(a.responseRate).toBe(0);
  });

  it('activity log records admin actions, newest first', async () => {
    const log = (await (await call('GET', '/api/admin/activity')).json()) as any;
    expect(log.total).toBeGreaterThan(0);
    const actions = log.items.map((i: { action: string }) => i.action);
    expect(actions).toContain('Signed in');
    expect(actions).toContain('Saved content');
    expect(actions).toContain('Reset content to default');
    expect(log.items[0].id).toBeGreaterThan(log.items[log.items.length - 1].id);
  });
});
