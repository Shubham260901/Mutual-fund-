import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  checkEmail,
  checkPassword,
  clearCookie,
  COOKIE_NAME,
  createLimiter,
  createResetToken,
  createSession,
  hashPassword,
  hashResetToken,
  MIN_PASSWORD_LENGTH,
  readCookie,
  RESET_TOKEN_TTL_MS,
  sessionCookie,
  verifyPasswordHash,
  verifySession,
} from './auth.ts';
import type { Db, Enquiry, ListFilters } from './db.ts';
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, type ImageStore } from './images.ts';
import { CONTENT_KEYS, isContentKey, parseContent, publicContent, SEO_PATHS } from './content.ts';
import { notifyNewEnquiry, sendPasswordResetEmail } from './notify.ts';
import { clean, isPeriod, isStatus, parseEnquiry, periodRange, todayIST } from './validation.ts';

export interface AppConfig {
  db: Db;
  images: ImageStore;
  /** Admin sign-in email; also where reset links are sent. When empty, admin login is disabled. */
  adminEmail: string;
  /** Admin password from .env. When empty, admin login is disabled. A password set via "Forgot password" overrides it. */
  adminPassword: string;
  sessionSecret: string;
  /** Folder with the built site (vite build output). Served when present. */
  distDir?: string;
  /** Site address for the sitemap when no 'Website address' setting exists yet. */
  publicUrl?: string;
  /** Number of reverse proxies in front of the app (so req.ip and req.secure are right). */
  trustProxy?: number;
  notify?: (e: Enquiry) => Promise<void> | void;
  /** Delivers a password reset link to the admin email (default: Resend, or the console in development). */
  sendResetLink?: (to: string, link: string) => Promise<void> | void;
}

const ADMIN_HEADER = 'x-admin-request';

/** Neutralises spreadsheet formula injection (=, +, -, @) in CSV cells. */
const csvCell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

function enquiriesToCsv(rows: Enquiry[]): string {
  const head = ['ID', 'Received (IST)', 'Type', 'Status', 'Name', 'Email', 'Phone', 'Topic', 'Preferred date', 'Preferred time', 'Meeting type', 'Message', 'Notes'];
  const ist = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3_600_000).toISOString().replace('T', ' ').slice(0, 16);
  const lines = rows.map((r) =>
    [r.id, ist(r.createdAt), r.type, r.status, r.name, r.email, r.phone, r.topic, r.preferredDate, r.preferredTime, r.meetingType, r.message, r.notes]
      .map((c) => csvCell(String(c)))
      .join(','),
  );
  // BOM so Excel opens UTF-8 (₹, en-dashes) correctly.
  return `﻿${[head.join(','), ...lines].join('\r\n')}\r\n`;
}

export function createApp(cfg: AppConfig) {
  const { db, images } = cfg;

  /** Until articles are edited in the admin panel, the built-in ones are those in the site's own sitemap.xml. */
  const builtInArticleSlugs = (): string[] => {
    const file = cfg.distDir && join(cfg.distDir, 'sitemap.xml');
    if (!file || !existsSync(file)) return [];
    return [...readFileSync(file, 'utf8').matchAll(/\/education\/([a-z0-9-]+)</g)].map((m) => m[1]);
  };
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', cfg.trustProxy ?? false);

  const enquiryLimiter = createLimiter(5, 10 * 60 * 1000);
  const loginLimiter = createLimiter(5, 15 * 60 * 1000);
  const forgotLimiter = createLimiter(3, 15 * 60 * 1000);
  /** Caps reset emails overall, so nobody can flood the admin's inbox from many IPs. */
  const resetEmailLimiter = createLimiter(5, 60 * 60 * 1000);
  const resetLimiter = createLimiter(10, 15 * 60 * 1000);

  // A password saved through "Forgot password" stays in force until ADMIN_PASSWORD in .env is changed;
  // editing .env is the owner's fallback if the email inbox is ever lost.
  {
    const stored = db.getAdminAuth();
    if (stored && !verifyPasswordHash(cfg.adminPassword, stored.envHash)) db.clearAdminAuth();
  }
  const loginEnabled = () => !!cfg.adminEmail && !!cfg.adminPassword;
  const passwordMatches = (given: unknown) => {
    const stored = db.getAdminAuth();
    return stored ? verifyPasswordHash(given, stored.passwordHash) : checkPassword(given, cfg.adminPassword);
  };
  /** Sessions are signed with a key that changes whenever the password does, so a reset signs out every device. */
  const sessionKey = () => `${cfg.sessionSecret}:${db.getAdminAuth()?.updatedAt ?? 'env'}`;
  /** Never built from request headers: a forged Host/Origin would put the reset token in a link to someone else's site. */
  const siteBaseUrl = () => {
    const settings = db.getContent('settings')?.value as { url?: string } | undefined;
    return (settings?.url || cfg.publicUrl || 'http://localhost:5173').replace(/\/+$/, '');
  };

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  const json = express.json({ limit: '32kb' });

  /* ── Public: enquiry form ───────────────────────────────────────────── */

  app.post('/api/enquiry', json, (req, res) => {
    if (!enquiryLimiter.hit(req.ip ?? 'unknown')) {
      return void res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' });
    }
    const parsed = parseEnquiry(req.body);
    if (!parsed.ok) return void res.status(400).json({ ok: false, error: 'Please check the highlighted details.', fields: parsed.errors });
    const saved = db.insert(parsed.data);
    // Fire and forget: the enquiry is safely stored whether or not the alert email works.
    void Promise.resolve((cfg.notify ?? notifyNewEnquiry)(saved)).catch(() => {});
    res.json({ ok: true });
  });

  /* ── Public: gallery (consumed by the gallery page) ─────────────────── */

  app.get('/api/gallery', (_req, res) => {
    const photos = db.listPhotos({ onlyVisible: true }).map(({ id, url, caption, alt, category }) => ({ id, url, caption, alt, category }));
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({ ok: true, photos });
  });

  /* ── Public: editable site content (articles, FAQs, services, settings, SEO) ── */

  app.get('/api/content', (_req, res) => {
    const stored = db.allContent();
    const content: Record<string, unknown> = {};
    for (const key of CONTENT_KEYS) if (key in stored) content[key] = publicContent(key, stored[key]);
    // Short cache: edits show up quickly, but traffic spikes don't hammer the database.
    res.setHeader('Cache-Control', 'public, max-age=15');
    res.json({ ok: true, content });
  });

  /** Sitemap built from the live article list, so new articles are discoverable without a redeploy. */
  app.get('/sitemap.xml', (req, res) => {
    const settings = db.getContent('settings')?.value as { url?: string } | undefined;
    const base = (settings?.url || cfg.publicUrl || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    const articles = (db.getContent('articles')?.value as { slug: string; published?: boolean }[] | undefined)?.filter((a) => a.published !== false);
    const slugs = articles ? articles.map((a) => a.slug) : builtInArticleSlugs();
    const urls = [...SEO_PATHS, ...slugs.map((s) => `/education/${s}`)];
    const esc = (u: string) => u.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const entries = urls.map((u) => `  <url><loc>${esc(base + u)}</loc></url>`).join('\n');
    res
      .type('application/xml')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
  });

  // Uploaded files have random names and never change, so they can be cached for a long time.
  app.use('/uploads', express.static(images.dir, { immutable: true, maxAge: '365d', index: false, dotfiles: 'deny' }));

  /* ── Admin auth ─────────────────────────────────────────────────────── */

  const isAuthed = (req: Request) => verifySession(readCookie(req.headers.cookie, COOKIE_NAME), sessionKey());
  const notConfigured = (res: Response) =>
    void res.status(503).json({ ok: false, error: 'Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env.' });

  app.post('/api/admin/login', json, (req, res) => {
    if (!loginEnabled()) return notConfigured(res);
    const ip = req.ip ?? 'unknown';
    if (loginLimiter.blocked(ip)) return void res.status(429).json({ ok: false, error: 'Too many attempts. Try again in 15 minutes.' });
    // Check both every time, so a wrong email takes as long as a wrong password.
    const emailOk = checkEmail(req.body?.email, cfg.adminEmail);
    const passwordOk = passwordMatches(req.body?.password);
    if (!emailOk || !passwordOk) {
      loginLimiter.hit(ip);
      db.log('Failed sign-in attempt');
      return void res.status(401).json({ ok: false, error: 'Incorrect email or password.' });
    }
    loginLimiter.reset(ip);
    db.log('Signed in');
    res.setHeader('Set-Cookie', sessionCookie(createSession(sessionKey()), req.secure));
    res.json({ ok: true });
  });

  /** Always answers the same way, so it can't be used to discover the admin email. */
  app.post('/api/admin/forgot-password', json, (req, res) => {
    if (!loginEnabled()) return notConfigured(res);
    if (!forgotLimiter.hit(req.ip ?? 'unknown')) {
      return void res.status(429).json({ ok: false, error: 'Too many requests. Try again in 15 minutes.' });
    }
    if (checkEmail(req.body?.email, cfg.adminEmail) && resetEmailLimiter.hit('admin')) {
      const { token, tokenHash } = createResetToken();
      db.addResetToken(tokenHash, Date.now() + RESET_TOKEN_TTL_MS);
      db.log('Password reset requested');
      const link = `${siteBaseUrl()}/admin?reset=${encodeURIComponent(token)}`;
      void Promise.resolve((cfg.sendResetLink ?? sendPasswordResetEmail)(cfg.adminEmail, link)).catch(() => {});
    }
    res.json({ ok: true });
  });

  app.post('/api/admin/reset-password', json, (req, res) => {
    if (!loginEnabled()) return notConfigured(res);
    if (!resetLimiter.hit(req.ip ?? 'unknown')) return void res.status(429).json({ ok: false, error: 'Too many attempts. Try again in 15 minutes.' });
    const { token, password } = (req.body ?? {}) as { token?: unknown; password?: unknown };
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH || password.length > 200) {
      return void res.status(400).json({ ok: false, error: `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.` });
    }
    if (typeof token !== 'string' || token.length > 100 || !db.consumeResetToken(hashResetToken(token))) {
      return void res.status(400).json({ ok: false, error: 'This reset link is invalid or has expired. Request a new one.' });
    }
    db.setAdminAuth(hashPassword(password), hashPassword(cfg.adminPassword));
    db.clearResetTokens();
    db.log('Password changed with a reset link');
    res.json({ ok: true });
  });

  app.post('/api/admin/logout', (req, res) => {
    res.setHeader('Set-Cookie', clearCookie(req.secure));
    res.json({ ok: true });
  });

  /** Everything below requires a valid session. State-changing calls also need a custom header, which a cross-site form cannot send. */
  const admin = express.Router();
  admin.use((req: Request, res: Response, next: NextFunction) => {
    if (!isAuthed(req)) return void res.status(401).json({ ok: false, error: 'Please sign in.' });
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.headers[ADMIN_HEADER] !== '1') {
      return void res.status(403).json({ ok: false, error: 'Forbidden.' });
    }
    next();
  });

  const idParam = (req: Request): number | null => {
    const id = Number(req.params.id);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  };

  admin.get('/me', (_req, res) => void res.json({ ok: true }));

  admin.get('/stats', (_req, res) => res.json({ ok: true, ...db.stats(todayIST()) }));

  const filtersFrom = (req: Request): ListFilters => {
    const period = String(req.query.period ?? '');
    const range = isPeriod(period) ? periodRange(period, todayIST()) : null;
    return {
      status: String(req.query.status ?? ''),
      type: String(req.query.type ?? ''),
      q: String(req.query.q ?? '').slice(0, 100),
      from: range?.from,
      to: range?.to,
      upcomingFrom: req.query.upcoming === '1' ? todayIST() : undefined,
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
    };
  };

  admin.get('/enquiries', (req, res) => res.json({ ok: true, ...db.list(filtersFrom(req)) }));

  admin.get('/export.csv', (req, res) => {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="enquiries-${todayIST()}.csv"`);
    res.send(enquiriesToCsv(db.all(filtersFrom(req))));
  });

  admin.patch('/enquiries/:id', json, (req, res) => {
    const id = idParam(req);
    if (!id) return void res.status(400).json({ ok: false, error: 'Bad id.' });
    const { status, notes } = req.body ?? {};
    if (status !== undefined && !isStatus(status)) return void res.status(400).json({ ok: false, error: 'Invalid status.' });
    if (notes !== undefined && typeof notes !== 'string') return void res.status(400).json({ ok: false, error: 'Invalid notes.' });
    const updated = db.update(id, { status, notes: notes === undefined ? undefined : notes.slice(0, 5000) });
    if (!updated) return void res.status(404).json({ ok: false, error: 'Not found.' });
    db.log('Updated enquiry', `#${id} ${updated.name}${status ? ` → ${status}` : ''}${notes !== undefined ? ' (notes)' : ''}`);
    res.json({ ok: true, enquiry: updated });
  });

  admin.delete('/enquiries/:id', (req, res) => {
    const id = idParam(req);
    const gone = id ? db.get(id) : null;
    if (!id || !db.remove(id)) return void res.status(404).json({ ok: false, error: 'Not found.' });
    db.log('Deleted enquiry', `#${id} ${gone?.name ?? ''}`);
    res.json({ ok: true });
  });

  /* ── Admin: gallery ─────────────────────────────────────────────────── */

  const rawImage = express.raw({ type: IMAGE_MIME_TYPES, limit: MAX_IMAGE_BYTES });
  /** Maps body-parser failures (too large, etc.) and a missing/invalid body to clear errors. */
  const requireImage = (req: Request, res: Response, next: NextFunction) =>
    rawImage(req, res, (err?: unknown) => {
      const status = (err as { status?: number } | undefined)?.status;
      if (status === 413) return void res.status(413).json({ ok: false, error: `Image is too large (max ${MAX_IMAGE_BYTES / 1024 / 1024} MB).` });
      if (err) return void res.status(400).json({ ok: false, error: 'Could not read the upload.' });
      if (!Buffer.isBuffer(req.body) || !req.body.length) {
        return void res.status(415).json({ ok: false, error: 'Upload a JPEG, PNG or WebP image.' });
      }
      next();
    });

  const photoMeta = (src: Record<string, unknown> | undefined) => {
    const out: { caption?: string; alt?: string; category?: string; visible?: boolean } = {};
    if (!src) return out;
    if (src.caption !== undefined) out.caption = clean(src.caption, 200);
    if (src.alt !== undefined) out.alt = clean(src.alt, 200);
    if (src.category !== undefined) out.category = clean(src.category, 60);
    if (typeof src.visible === 'boolean') out.visible = src.visible;
    return out;
  };

  admin.get('/gallery', (_req, res) => res.json({ ok: true, photos: db.listPhotos() }));

  // Upload: raw image bytes in the body; optional ?caption=&alt=&category= in the query string.
  admin.post('/gallery', requireImage, async (req, res) => {
    const filename = await images.save(req.body as Buffer);
    if (!filename) return void res.status(415).json({ ok: false, error: 'That file is not a valid JPEG, PNG or WebP image.' });
    const photo = db.addPhoto(filename, photoMeta(req.query as Record<string, unknown>));
    db.log('Added gallery photo', `#${photo.id}`);
    res.status(201).json({ ok: true, photo });
  });

  // "Change photo": replace the image file, keeping caption, position and visibility.
  admin.put('/gallery/:id/image', requireImage, async (req, res) => {
    const id = idParam(req);
    if (!id || !db.getPhoto(id)) return void res.status(404).json({ ok: false, error: 'Not found.' });
    const filename = await images.save(req.body as Buffer);
    if (!filename) return void res.status(415).json({ ok: false, error: 'That file is not a valid JPEG, PNG or WebP image.' });
    const swapped = db.replacePhotoFile(id, filename);
    if (!swapped) {
      await images.remove(filename);
      return void res.status(404).json({ ok: false, error: 'Not found.' });
    }
    await images.remove(swapped.oldFilename);
    db.log('Changed gallery photo', `#${id}`);
    res.json({ ok: true, photo: swapped.photo });
  });

  // Must be registered before '/gallery/:id' so "order" is not read as an id.
  admin.put('/gallery/order', json, (req, res) => {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || !ids.every((n) => Number.isSafeInteger(n) && n > 0)) {
      return void res.status(400).json({ ok: false, error: 'Expected { ids: number[] }.' });
    }
    db.reorderPhotos(ids);
    db.log('Reordered gallery');
    res.json({ ok: true, photos: db.listPhotos() });
  });

  admin.patch('/gallery/:id', json, (req, res) => {
    const id = idParam(req);
    const updated = id ? db.updatePhoto(id, photoMeta(req.body)) : null;
    if (!updated) return void res.status(404).json({ ok: false, error: 'Not found.' });
    db.log('Edited gallery photo', `#${updated.id}${updated.visible ? '' : ' (hidden)'}`);
    res.json({ ok: true, photo: updated });
  });

  admin.delete('/gallery/:id', async (req, res) => {
    const id = idParam(req);
    const filename = id ? db.removePhoto(id) : null;
    if (!filename) return void res.status(404).json({ ok: false, error: 'Not found.' });
    await images.remove(filename);
    db.log('Deleted gallery photo', `#${id}`);
    res.json({ ok: true });
  });

  /* ── Admin: site content ────────────────────────────────────────────── */

  // Which documents are customised (the rest use the built-in defaults).
  admin.get('/content', (_req, res) => res.json({ ok: true, customised: db.contentMeta() }));

  admin.get('/content/:key', (req, res) => {
    const key = req.params.key;
    if (!isContentKey(key)) return void res.status(404).json({ ok: false, error: 'Unknown content.' });
    const row = db.getContent(key);
    res.json({ ok: true, value: row?.value ?? null, updatedAt: row?.updatedAt ?? null });
  });

  admin.put('/content/:key', express.json({ limit: '2mb' }), (req, res) => {
    const key = req.params.key;
    if (!isContentKey(key)) return void res.status(404).json({ ok: false, error: 'Unknown content.' });
    const parsed = parseContent(key, req.body?.value);
    if (!parsed.ok) return void res.status(400).json({ ok: false, error: parsed.error });
    db.setContent(key, parsed.value);
    db.log('Saved content', key);
    res.json({ ok: true, value: parsed.value });
  });

  // Reset to the built-in default.
  admin.delete('/content/:key', (req, res) => {
    const key = req.params.key;
    if (!isContentKey(key)) return void res.status(404).json({ ok: false, error: 'Unknown content.' });
    db.deleteContent(key);
    db.log('Reset content to default', key);
    res.json({ ok: true });
  });

  // A standalone image for content (e.g. the distributor photo); not added to the gallery.
  admin.post('/media', requireImage, async (req, res) => {
    const filename = await images.save(req.body as Buffer);
    if (!filename) return void res.status(415).json({ ok: false, error: 'That file is not a valid JPEG, PNG or WebP image.' });
    db.log('Uploaded image');
    res.status(201).json({ ok: true, url: `/uploads/${filename}` });
  });

  /* ── Admin: analytics & activity ────────────────────────────────────── */

  admin.get('/analytics', (_req, res) => res.json({ ok: true, ...db.analytics(todayIST()) }));

  admin.get('/activity', (req, res) => res.json({ ok: true, ...db.listActivity(Number(req.query.page) || 1, 30) }));

  app.use('/api/admin', admin);

  app.use('/api', (_req, res) => void res.status(404).json({ ok: false, error: 'Not found.' }));

  /* ── Built site (production) ────────────────────────────────────────── */

  const dist = cfg.distDir;
  if (dist && existsSync(join(dist, 'index.html'))) {
    app.use(express.static(dist, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/admin')) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.sendFile(join(dist, 'index.html'));
    });
  }

  // Last-resort error handler: never leak stack traces.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number })?.status;
    if (status === 400 || status === 413) return void res.status(status).json({ ok: false, error: 'Bad request.' });
    console.error('[server] unhandled error:', err);
    res.status(500).json({ ok: false, error: 'Something went wrong.' });
  });

  return app;
}
