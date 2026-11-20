/**
 * Validation for the editable site content (articles, FAQs, services, settings, SEO).
 *
 * Each document is validated and rebuilt field by field, so only known fields with sane
 * lengths are ever stored. Regulatory material (disclosures, ARN/EUIN, NISM, grievance
 * officer, legal name) is deliberately NOT editable here: it stays in code behind review.
 */
import { clean } from './validation.ts';

export const CONTENT_KEYS = ['articles', 'homeFaqs', 'educationFaqs', 'services', 'whyChooseUs', 'journeySteps', 'settings', 'seo'] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];
export const isContentKey = (k: string): k is ContentKey => (CONTENT_KEYS as readonly string[]).includes(k);

/** Icons the admin may pick (must match the registry in frontend/src/content/runtime.ts). */
export const ICON_NAMES = [
  'Briefcase', 'GraduationCap', 'Layers', 'PiggyBank', 'RefreshCw', 'Repeat', 'Sunset', 'Target',
  'Shield', 'Heart', 'Home', 'Wallet', 'TrendingUp', 'Users', 'Calculator', 'BookOpen', 'Clock', 'Landmark', 'Coins', 'LineChart',
];
export const ARTICLE_CATEGORIES = ['Basics', 'Strategy', 'Risk', 'Planning'];
/** Pages whose title/description can be overridden. */
export const SEO_PATHS = ['/', '/about', '/services', '/calculators', '/education', '/contact', '/disclosures'];

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, max: number) => clean(v, max);
const text = (v: unknown, max: number) => clean(v, max, true);
const list = (v: unknown, max: number): unknown[] | null => (Array.isArray(v) && v.length <= max ? v : null);

/** Internal links must stay on the site; external ones must be http(s). */
const safeUrl = (v: unknown, max = 300): string => {
  const u = str(v, max);
  return u === '' || /^(https?:\/\/|\/(?!\/))/i.test(u) ? u : '';
};

const slugOk = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length <= 80;

/* ── Articles ─────────────────────────────────────────────────────────── */

function parseBlock(b: unknown): { type: string; text?: string; items?: string[] } | null {
  if (!isObj(b)) return null;
  if (b.type === 'p' || b.type === 'h2' || b.type === 'h3' || b.type === 'callout') {
    const t = text(b.text, b.type === 'p' ? 4000 : 600);
    return t ? { type: b.type, text: t } : null;
  }
  if (b.type === 'ul') {
    const items = (list(b.items, 30) ?? []).map((i) => text(i, 500)).filter(Boolean);
    return items.length ? { type: 'ul', items } : null;
  }
  return null;
}

function parseArticles(v: unknown): Result<unknown[]> {
  const arr = list(v, 200);
  if (!arr) return fail('Expected a list of articles.');
  const seen = new Set<string>();
  const out = [];
  for (const [i, a] of arr.entries()) {
    if (!isObj(a)) return fail(`Article ${i + 1} is invalid.`);
    const title = str(a.title, 160);
    const slug = str(a.slug, 80);
    if (!title) return fail(`Article ${i + 1} needs a title.`);
    if (!slugOk(slug)) return fail(`"${title}": the URL slug may only use lowercase letters, numbers and hyphens.`);
    if (seen.has(slug)) return fail(`Two articles use the slug "${slug}". Slugs must be unique.`);
    seen.add(slug);
    const category = String(a.category);
    if (!ARTICLE_CATEGORIES.includes(category)) return fail(`"${title}": choose a valid category.`);
    const excerpt = str(a.excerpt, 400);
    if (!excerpt) return fail(`"${title}" needs a short summary.`);
    const body = (list(a.body, 150) ?? []).map(parseBlock).filter((b): b is NonNullable<typeof b> => !!b);
    const published = a.published !== false;
    if (published && !body.length) return fail(`"${title}" is published but has no content. Add content or save it as a draft.`);
    out.push({
      slug,
      title,
      excerpt,
      category,
      readMinutes: Math.min(Math.max(Math.round(Number(a.readMinutes)) || 1, 1), 120),
      body,
      published,
      seoTitle: str(a.seoTitle, 120),
      seoDescription: str(a.seoDescription, 320),
    });
  }
  return { ok: true, value: out };
}

/* ── FAQs ─────────────────────────────────────────────────────────────── */

function parseFaqs(v: unknown): Result<unknown[]> {
  const arr = list(v, 100);
  if (!arr) return fail('Expected a list of FAQs.');
  const out = [];
  for (const [i, f] of arr.entries()) {
    if (!isObj(f)) return fail(`FAQ ${i + 1} is invalid.`);
    const q = str(f.q, 300);
    const a = text(f.a, 3000);
    if (!q || !a) return fail(`FAQ ${i + 1} needs both a question and an answer.`);
    out.push({ q, a, visible: f.visible !== false });
  }
  return { ok: true, value: out };
}

/* ── Services, why-choose-us, journey ─────────────────────────────────── */

const icon = (v: unknown) => (ICON_NAMES.includes(String(v)) ? String(v) : 'Briefcase');

function parseServices(v: unknown): Result<unknown[]> {
  const arr = list(v, 30);
  if (!arr) return fail('Expected a list of services.');
  const seen = new Set<string>();
  const out = [];
  for (const [i, s] of arr.entries()) {
    if (!isObj(s)) return fail(`Service ${i + 1} is invalid.`);
    const title = str(s.title, 120);
    const id = str(s.id, 80);
    if (!title) return fail(`Service ${i + 1} needs a title.`);
    if (!slugOk(id)) return fail(`"${title}": the ID may only use lowercase letters, numbers and hyphens (it becomes the #link on the Services page).`);
    if (seen.has(id)) return fail(`Two services use the ID "${id}". IDs must be unique.`);
    seen.add(id);
    const summary = str(s.summary, 300);
    const description = text(s.description, 2000);
    if (!summary || !description) return fail(`"${title}" needs a summary and a description.`);
    const points = (list(s.points, 15) ?? []).map((p) => str(p, 300)).filter(Boolean);
    let calculator: { label: string; to: string } | undefined;
    if (isObj(s.calculator) && str(s.calculator.label, 100) && safeUrl(s.calculator.to)) {
      calculator = { label: str(s.calculator.label, 100), to: safeUrl(s.calculator.to) };
    }
    out.push({ id, icon: icon(s.icon), title, summary, description, points, ...(calculator ? { calculator } : {}), visible: s.visible !== false });
  }
  return { ok: true, value: out };
}

function parseWhy(v: unknown): Result<unknown[]> {
  const arr = list(v, 12);
  if (!arr) return fail('Expected a list.');
  const out = [];
  for (const [i, w] of arr.entries()) {
    if (!isObj(w)) return fail(`Item ${i + 1} is invalid.`);
    const title = str(w.title, 100);
    const body = text(w.body, 500);
    if (!title || !body) return fail(`Item ${i + 1} needs a title and a description.`);
    out.push({ icon: icon(w.icon), title, body });
  }
  return { ok: true, value: out };
}

function parseJourney(v: unknown): Result<unknown[]> {
  const arr = list(v, 10);
  if (!arr) return fail('Expected a list.');
  const out = [];
  for (const [i, w] of arr.entries()) {
    if (!isObj(w)) return fail(`Step ${i + 1} is invalid.`);
    const title = str(w.title, 80);
    const body = text(w.body, 500);
    if (!title || !body) return fail(`Step ${i + 1} needs a title and a description.`);
    out.push({ title, body });
  }
  return { ok: true, value: out };
}

/* ── Site settings (non-regulatory only) ──────────────────────────────── */

function parseSettings(v: unknown): Result<Record<string, unknown>> {
  if (!isObj(v)) return fail('Expected an object.');
  const d = isObj(v.distributor) ? v.distributor : {};
  const c = isObj(v.contact) ? v.contact : {};
  const a = isObj(c.address) ? c.address : {};
  const f = isObj(v.forms) ? v.forms : {};
  const so = isObj(v.social) ? v.social : {};

  const email = str(c.email, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('The contact email is not valid.');
  const whatsapp = str(c.whatsapp, 20).replace(/\D/g, '');
  const phoneE164 = str(c.phoneE164, 20).replace(/\D/g, '');
  const url = str(v.url, 200).replace(/\/+$/, '');
  if (url && !/^https?:\/\/[^\s/]+/i.test(url)) return fail('The website address must start with https://');
  const name = str(v.name, 80);
  if (!name) return fail('The business name is required.');
  for (const [label, link] of [['Booking link', f.bookingUrl], ['Map link', c.mapUrl], ['LinkedIn', so.linkedin], ['YouTube', so.youtube], ['Instagram', so.instagram]] as const) {
    const raw = str(link, 300);
    if (raw && !/^https?:\/\//i.test(raw)) return fail(`${label} must start with https://`);
  }

  return {
    ok: true,
    value: {
      name,
      shortName: str(v.shortName, 80) || name,
      tagline: str(v.tagline, 120),
      url,
      distributor: { name: str(d.name, 80), title: str(d.title, 120), bio: text(d.bio, 2000), photo: safeUrl(d.photo) },
      contact: {
        phone: str(c.phone, 40),
        phoneE164,
        whatsapp,
        email,
        hours: str(c.hours, 120),
        address: { line1: str(a.line1, 120), line2: str(a.line2, 120), city: str(a.city, 60), state: str(a.state, 60), pin: str(a.pin, 12) },
        mapUrl: str(c.mapUrl, 300),
      },
      forms: { bookingUrl: str(f.bookingUrl, 300) },
      social: { linkedin: str(so.linkedin, 300), youtube: str(so.youtube, 300), instagram: str(so.instagram, 300) },
    },
  };
}

/* ── SEO overrides ────────────────────────────────────────────────────── */

function parseSeo(v: unknown): Result<Record<string, { title: string; description: string }>> {
  if (!isObj(v)) return fail('Expected an object.');
  const out: Record<string, { title: string; description: string }> = {};
  for (const path of SEO_PATHS) {
    const e = v[path];
    if (!isObj(e)) continue;
    const title = str(e.title, 120);
    const description = str(e.description, 320);
    if (title || description) out[path] = { title, description };
  }
  return { ok: true, value: out };
}

export function parseContent(key: ContentKey, value: unknown): Result<unknown> {
  switch (key) {
    case 'articles': return parseArticles(value);
    case 'homeFaqs':
    case 'educationFaqs': return parseFaqs(value);
    case 'services': return parseServices(value);
    case 'whyChooseUs': return parseWhy(value);
    case 'journeySteps': return parseJourney(value);
    case 'settings': return parseSettings(value);
    case 'seo': return parseSeo(value);
  }
}

/** What visitors get: drafts and hidden items removed, admin-only flags dropped. */
export function publicContent(key: ContentKey, value: unknown): unknown {
  const arr = Array.isArray(value) ? (value as Record<string, unknown>[]) : null;
  switch (key) {
    case 'articles':
      return arr!.filter((a) => a.published !== false).map(({ published: _p, ...rest }) => rest);
    case 'homeFaqs':
    case 'educationFaqs':
    case 'services':
      return arr!.filter((x) => x.visible !== false).map(({ visible: _v, ...rest }) => rest);
    default:
      return value;
  }
}
