import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createRequire } from 'node:module';
import { isStatus, type NewEnquiry, type Period, PERIODS, periodRange, type Status } from './validation.ts';

// Loaded through require so bundlers (Vite/Vitest 5) don't try to resolve the newer `node:sqlite` builtin.
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');

export interface Enquiry {
  id: number;
  createdAt: string;
  updatedAt: string;
  type: 'enquiry' | 'consultation';
  name: string;
  email: string;
  phone: string;
  topic: string;
  preferredDate: string;
  preferredTime: string;
  meetingType: string;
  message: string;
  status: Status;
  notes: string;
}

export interface ListFilters {
  status?: string;
  type?: string;
  q?: string;
  /** Only enquiries received at/after this ISO instant (inclusive) and before `to` (exclusive). */
  from?: string;
  to?: string;
  /** India date (YYYY-MM-DD): only consultations on or after it that are not closed or spam. */
  upcomingFrom?: string;
  page?: number;
  pageSize?: number;
}

type Row = Record<string, string | number | null>;

const toEnquiry = (r: Row): Enquiry => ({
  id: Number(r.id),
  createdAt: String(r.created_at),
  updatedAt: String(r.updated_at),
  type: r.type as Enquiry['type'],
  name: String(r.name),
  email: String(r.email),
  phone: String(r.phone),
  topic: String(r.topic),
  preferredDate: String(r.preferred_date),
  preferredTime: String(r.preferred_time),
  meetingType: String(r.meeting_type),
  message: String(r.message),
  status: r.status as Status,
  notes: String(r.notes),
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS enquiries (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('enquiry','consultation')),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL,
  topic          TEXT NOT NULL DEFAULT '',
  preferred_date TEXT NOT NULL DEFAULT '',
  preferred_time TEXT NOT NULL DEFAULT '',
  meeting_type   TEXT NOT NULL DEFAULT '',
  message        TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','scheduled','closed','spam')),
  notes          TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at);

CREATE TABLE IF NOT EXISTS photos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  filename   TEXT NOT NULL UNIQUE,
  caption    TEXT NOT NULL DEFAULT '',
  alt        TEXT NOT NULL DEFAULT '',
  category   TEXT NOT NULL DEFAULT '',
  visible    INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_order ON photos(sort_order, id);

-- Editable site content: one validated JSON document per key (articles, services, settings...).
CREATE TABLE IF NOT EXISTS content (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  at     TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_activity_at ON activity(at);

-- Admin password set through "Forgot password". Overrides ADMIN_PASSWORD until .env changes.
CREATE TABLE IF NOT EXISTS admin_auth (
  id            INTEGER PRIMARY KEY CHECK (id = 1),
  password_hash TEXT NOT NULL,
  env_hash      TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
`;

export interface AdminAuth {
  passwordHash: string;
  /** Hash of the ADMIN_PASSWORD in .env when this password was set; a different .env password takes over again. */
  envHash: string;
  updatedAt: string;
}

export interface ActivityEntry {
  id: number;
  at: string;
  action: string;
  detail: string;
}

export interface Photo {
  id: number;
  filename: string;
  /** Public URL path, e.g. /uploads/ab12cd.jpg */
  url: string;
  caption: string;
  alt: string;
  category: string;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoPatch {
  caption?: string;
  alt?: string;
  category?: string;
  visible?: boolean;
}

const toPhoto = (r: Row): Photo => ({
  id: Number(r.id),
  filename: String(r.filename),
  url: `/uploads/${r.filename}`,
  caption: String(r.caption),
  alt: String(r.alt),
  category: String(r.category),
  visible: Number(r.visible) === 1,
  sortOrder: Number(r.sort_order),
  createdAt: String(r.created_at),
  updatedAt: String(r.updated_at),
});

/** Escape LIKE wildcards so a search for "100%" matches literally. */
const likeEscape = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export function openDb(path: string) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);

  function where(f: ListFilters) {
    const clauses: string[] = [];
    const params: string[] = [];
    if (f.status && isStatus(f.status)) {
      clauses.push('status = ?');
      params.push(f.status);
    }
    if (f.type === 'enquiry' || f.type === 'consultation') {
      clauses.push('type = ?');
      params.push(f.type);
    }
    if (f.from) {
      clauses.push('created_at >= ?');
      params.push(f.from);
    }
    if (f.to) {
      clauses.push('created_at < ?');
      params.push(f.to);
    }
    if (f.upcomingFrom) {
      clauses.push("type = 'consultation' AND preferred_date >= ? AND status NOT IN ('closed','spam')");
      params.push(f.upcomingFrom);
    }
    const q = f.q?.trim();
    if (q) {
      const like = `%${likeEscape(q)}%`;
      clauses.push(`(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\' OR topic LIKE ? ESCAPE '\\')`);
      params.push(like, like, like, like, like);
    }
    return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
  }

  return {
    insert(e: NewEnquiry): Enquiry {
      const now = new Date().toISOString();
      const res = db
        .prepare(
          `INSERT INTO enquiries (created_at, updated_at, type, name, email, phone, topic, preferred_date, preferred_time, meeting_type, message)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(now, now, e.type, e.name, e.email, e.phone, e.topic, e.preferredDate, e.preferredTime, e.meetingType, e.message);
      return this.get(Number(res.lastInsertRowid))!;
    },

    get(id: number): Enquiry | null {
      const r = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(id) as Row | undefined;
      return r ? toEnquiry(r) : null;
    },

    list(f: ListFilters = {}) {
      const pageSize = Math.min(Math.max(Math.trunc(f.pageSize ?? 20), 1), 100);
      const page = Math.max(Math.trunc(f.page ?? 1), 1);
      const w = where(f);
      const total = Number((db.prepare(`SELECT COUNT(*) AS n FROM enquiries ${w.sql}`).get(...w.params) as Row).n);
      const rows = db
        .prepare(`SELECT * FROM enquiries ${w.sql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
        .all(...w.params, pageSize, (page - 1) * pageSize) as Row[];
      return { items: rows.map(toEnquiry), total, page, pageSize };
    },

    /** Every row matching the filters, for CSV export. */
    all(f: ListFilters = {}): Enquiry[] {
      const w = where(f);
      return (db.prepare(`SELECT * FROM enquiries ${w.sql} ORDER BY created_at DESC, id DESC`).all(...w.params) as Row[]).map(toEnquiry);
    },

    update(id: number, patch: { status?: Status; notes?: string }): Enquiry | null {
      const sets: string[] = [];
      const params: string[] = [];
      if (patch.status !== undefined) {
        sets.push('status = ?');
        params.push(patch.status);
      }
      if (patch.notes !== undefined) {
        sets.push('notes = ?');
        params.push(patch.notes);
      }
      if (!sets.length) return this.get(id);
      sets.push('updated_at = ?');
      params.push(new Date().toISOString());
      const res = db.prepare(`UPDATE enquiries SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
      return res.changes ? this.get(id) : null;
    },

    remove(id: number): boolean {
      return Number(db.prepare('DELETE FROM enquiries WHERE id = ?').run(id).changes) > 0;
    },

    stats(todayIST: string) {
      const count = (sql: string, ...p: string[]) => Number((db.prepare(sql).get(...p) as Row).n);
      const byStatus = Object.fromEntries(STATUS_KEYS.map((s) => [s, 0])) as Record<Status, number>;
      for (const r of db.prepare('SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status').all() as Row[]) byStatus[r.status as Status] = Number(r.n);

      // Submissions per day for the last 14 days (India time), oldest first.
      const days: { date: string; count: number }[] = [];
      const base = new Date(`${todayIST}T00:00:00Z`).getTime();
      for (let i = 13; i >= 0; i--) days.push({ date: new Date(base - i * 86_400_000).toISOString().slice(0, 10), count: 0 });
      const since = new Date(base - 13 * 86_400_000 - 5.5 * 3_600_000).toISOString();
      for (const r of db.prepare('SELECT created_at FROM enquiries WHERE created_at >= ?').all(since) as Row[]) {
        const d = new Date(new Date(String(r.created_at)).getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10);
        const day = days.find((x) => x.date === d);
        if (day) day.count++;
      }

      // Received today / this week / this month (India time), each with the full previous period to compare against.
      const inRange = (r: { from: string; to: string }) => count('SELECT COUNT(*) AS n FROM enquiries WHERE created_at >= ? AND created_at < ?', r.from, r.to);
      const periods = Object.fromEntries(
        PERIODS.map((p) => {
          const r = periodRange(p, todayIST);
          return [p, { count: inRange(r), previous: inRange(r.previous) }];
        }),
      ) as Record<Period, { count: number; previous: number }>;

      return {
        total: count('SELECT COUNT(*) AS n FROM enquiries'),
        periods,
        byStatus,
        consultations: count("SELECT COUNT(*) AS n FROM enquiries WHERE type = 'consultation'"),
        upcomingConsultations: count(
          "SELECT COUNT(*) AS n FROM enquiries WHERE type = 'consultation' AND preferred_date >= ? AND status NOT IN ('closed','spam')",
          todayIST,
        ),
        days,
      };
    },

    /* ── Gallery ─────────────────────────────────────────────────────── */

    addPhoto(filename: string, meta: PhotoPatch = {}): Photo {
      const now = new Date().toISOString();
      // New photos go to the end of the gallery.
      const next = Number((db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM photos').get() as Row).n);
      const res = db
        .prepare('INSERT INTO photos (filename, caption, alt, category, visible, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(filename, meta.caption ?? '', meta.alt ?? '', meta.category ?? '', meta.visible === false ? 0 : 1, next, now, now);
      return this.getPhoto(Number(res.lastInsertRowid))!;
    },

    getPhoto(id: number): Photo | null {
      const r = db.prepare('SELECT * FROM photos WHERE id = ?').get(id) as Row | undefined;
      return r ? toPhoto(r) : null;
    },

    listPhotos(opts: { onlyVisible?: boolean } = {}): Photo[] {
      const sql = `SELECT * FROM photos ${opts.onlyVisible ? 'WHERE visible = 1' : ''} ORDER BY sort_order ASC, id ASC`;
      return (db.prepare(sql).all() as Row[]).map(toPhoto);
    },

    updatePhoto(id: number, patch: PhotoPatch): Photo | null {
      const sets: string[] = [];
      const params: (string | number)[] = [];
      if (patch.caption !== undefined) (sets.push('caption = ?'), params.push(patch.caption));
      if (patch.alt !== undefined) (sets.push('alt = ?'), params.push(patch.alt));
      if (patch.category !== undefined) (sets.push('category = ?'), params.push(patch.category));
      if (patch.visible !== undefined) (sets.push('visible = ?'), params.push(patch.visible ? 1 : 0));
      if (!sets.length) return this.getPhoto(id);
      sets.push('updated_at = ?');
      params.push(new Date().toISOString());
      const res = db.prepare(`UPDATE photos SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
      return res.changes ? this.getPhoto(id) : null;
    },

    /** Swaps the stored file for a photo (used by "Change photo"); returns the old filename so the caller can delete it. */
    replacePhotoFile(id: number, filename: string): { photo: Photo; oldFilename: string } | null {
      const old = this.getPhoto(id);
      if (!old) return null;
      db.prepare('UPDATE photos SET filename = ?, updated_at = ? WHERE id = ?').run(filename, new Date().toISOString(), id);
      return { photo: this.getPhoto(id)!, oldFilename: old.filename };
    },

    /** Persists a new order. `ids` is the full desired order; unknown ids are ignored. */
    reorderPhotos(ids: number[]): void {
      const stmt = db.prepare('UPDATE photos SET sort_order = ? WHERE id = ?');
      db.exec('BEGIN');
      try {
        ids.forEach((id, i) => stmt.run(i + 1, id));
        db.exec('COMMIT');
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    /** Deletes the row; returns the filename so the caller can delete the file. */
    removePhoto(id: number): string | null {
      const p = this.getPhoto(id);
      if (!p) return null;
      db.prepare('DELETE FROM photos WHERE id = ?').run(id);
      return p.filename;
    },

    /* ── Site content documents ──────────────────────────────────────── */

    getContent(key: string): { value: unknown; updatedAt: string } | null {
      const r = db.prepare('SELECT value, updated_at FROM content WHERE key = ?').get(key) as Row | undefined;
      return r ? { value: JSON.parse(String(r.value)), updatedAt: String(r.updated_at) } : null;
    },

    allContent(): Record<string, unknown> {
      const out: Record<string, unknown> = {};
      for (const r of db.prepare('SELECT key, value FROM content').all() as Row[]) out[String(r.key)] = JSON.parse(String(r.value));
      return out;
    },

    /** Which keys have been customised, and when (for the admin overview). */
    contentMeta(): Record<string, string> {
      const out: Record<string, string> = {};
      for (const r of db.prepare('SELECT key, updated_at FROM content').all() as Row[]) out[String(r.key)] = String(r.updated_at);
      return out;
    },

    setContent(key: string, value: unknown): void {
      db.prepare(
        'INSERT INTO content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
      ).run(key, JSON.stringify(value), new Date().toISOString());
    },

    /** Removes the customisation so the site falls back to its built-in default. */
    deleteContent(key: string): boolean {
      return Number(db.prepare('DELETE FROM content WHERE key = ?').run(key).changes) > 0;
    },

    /* ── Admin password & reset tokens ───────────────────────────────── */

    getAdminAuth(): AdminAuth | null {
      const r = db.prepare('SELECT * FROM admin_auth WHERE id = 1').get() as Row | undefined;
      return r ? { passwordHash: String(r.password_hash), envHash: String(r.env_hash), updatedAt: String(r.updated_at) } : null;
    },

    setAdminAuth(passwordHash: string, envHash: string): void {
      db.prepare(
        'INSERT INTO admin_auth (id, password_hash, env_hash, updated_at) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET password_hash = excluded.password_hash, env_hash = excluded.env_hash, updated_at = excluded.updated_at',
      ).run(passwordHash, envHash, new Date().toISOString());
    },

    clearAdminAuth(): void {
      db.prepare('DELETE FROM admin_auth').run();
    },

    addResetToken(tokenHash: string, expiresAt: number): void {
      db.prepare('DELETE FROM password_resets WHERE expires_at <= ?').run(Date.now());
      db.prepare('INSERT INTO password_resets (token_hash, expires_at) VALUES (?, ?)').run(tokenHash, expiresAt);
    },

    /** Deletes the token and reports whether it existed and had not expired. */
    consumeResetToken(tokenHash: string, now = Date.now()): boolean {
      const r = db.prepare('SELECT expires_at FROM password_resets WHERE token_hash = ?').get(tokenHash) as Row | undefined;
      db.prepare('DELETE FROM password_resets WHERE token_hash = ?').run(tokenHash);
      return !!r && Number(r.expires_at) > now;
    },

    clearResetTokens(): void {
      db.prepare('DELETE FROM password_resets').run();
    },

    /* ── Activity log ────────────────────────────────────────────────── */

    log(action: string, detail = ''): void {
      db.prepare('INSERT INTO activity (at, action, detail) VALUES (?, ?, ?)').run(new Date().toISOString(), action.slice(0, 80), detail.slice(0, 300));
      // Keep the log bounded: drop everything but the newest 5,000 entries.
      db.prepare('DELETE FROM activity WHERE id <= (SELECT MAX(id) - 5000 FROM activity)').run();
    },

    listActivity(page = 1, pageSize = 30): { items: ActivityEntry[]; total: number; page: number; pageSize: number } {
      const size = Math.min(Math.max(Math.trunc(pageSize), 1), 100);
      const p = Math.max(Math.trunc(page), 1);
      const total = Number((db.prepare('SELECT COUNT(*) AS n FROM activity').get() as Row).n);
      const rows = db.prepare('SELECT * FROM activity ORDER BY id DESC LIMIT ? OFFSET ?').all(size, (p - 1) * size) as Row[];
      return { items: rows.map((r) => ({ id: Number(r.id), at: String(r.at), action: String(r.action), detail: String(r.detail) })), total, page: p, pageSize: size };
    },

    /** Charts for the dashboard: weekly trend, topics, types, statuses and upcoming consultations. */
    analytics(todayIST: string) {
      const all = db.prepare('SELECT created_at, type, topic, status FROM enquiries').all() as Row[];
      const ist = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3_600_000);

      // Last 12 weeks (weeks start Monday, India time), oldest first.
      const today = new Date(`${todayIST}T00:00:00Z`);
      const monday = new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * 86_400_000);
      const weeks = Array.from({ length: 12 }, (_, i) => {
        const start = new Date(monday.getTime() - (11 - i) * 7 * 86_400_000);
        return { weekStart: start.toISOString().slice(0, 10), enquiries: 0, consultations: 0 };
      });
      const topics = new Map<string, number>();
      for (const r of all) {
        const d = ist(String(r.created_at));
        const dayStr = d.toISOString().slice(0, 10);
        const wk = [...weeks].reverse().find((w) => w.weekStart <= dayStr);
        if (wk) r.type === 'consultation' ? wk.consultations++ : wk.enquiries++;
        if (r.type === 'consultation' && r.topic) topics.set(String(r.topic), (topics.get(String(r.topic)) ?? 0) + 1);
      }

      const upcoming = (
        db
          .prepare(
            "SELECT * FROM enquiries WHERE type = 'consultation' AND preferred_date >= ? AND status NOT IN ('closed','spam') ORDER BY preferred_date ASC, preferred_time ASC LIMIT 10",
          )
          .all(todayIST) as Row[]
      ).map(toEnquiry);

      const handled = all.filter((r) => r.status !== 'spam');
      return {
        weeks,
        topics: [...topics.entries()].map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count),
        upcoming,
        /** Share of non-spam enquiries that have moved past "new". */
        responseRate: handled.length ? Math.round((handled.filter((r) => r.status !== 'new').length / handled.length) * 100) : null,
        total: all.length,
      };
    },

    close: () => db.close(),
  };
}

const STATUS_KEYS: Status[] = ['new', 'contacted', 'scheduled', 'closed', 'spam'];

export type Db = ReturnType<typeof openDb>;
