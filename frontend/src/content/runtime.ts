/**
 * Runtime content layer.
 *
 * The site ships with its content in code (articles.ts, faqs.ts, services.ts, config/site.ts).
 * Content edited in the admin panel is stored by the backend and fetched once at startup
 * (before the first render). `applyContent` then swaps it into those same exports IN PLACE,
 * so no page component needs to know where the content came from.
 *
 * - Nothing edited, or backend unreachable (e.g. a static-only deploy): the built-in
 *   content is used, so the public site never breaks because of the API.
 * - Regulatory material (disclosures, ARN/EUIN, NISM, grievance officer, legal name) is
 *   never overridden: the backend does not accept it and this file never touches it.
 */
import {
  BookOpen,
  Briefcase,
  Calculator,
  Clock,
  Coins,
  GraduationCap,
  Heart,
  Home,
  Landmark,
  Layers,
  LineChart,
  type LucideIcon,
  PiggyBank,
  RefreshCw,
  Repeat,
  Shield,
  Sunset,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { site } from '@/config/site';
import { type Article, articles } from './articles';
import { educationFaqs, homeFaqs } from './faqs';
import { journeySteps, type Service, services, whyChooseUs } from './services';

/** Icons the admin can choose from. Keep in sync with ICON_NAMES in backend/src/content.ts. */
export const ICONS: Record<string, LucideIcon> = {
  Briefcase, GraduationCap, Layers, PiggyBank, RefreshCw, Repeat, Sunset, Target,
  Shield, Heart, Home, Wallet, TrendingUp, Users, Calculator, BookOpen, Clock, Landmark, Coins, LineChart,
};
export const ICON_NAMES = Object.keys(ICONS);
const iconName = (icon: LucideIcon) => ICON_NAMES.find((n) => ICONS[n] === icon) ?? 'Briefcase';

/* ── Editable document types (what the admin edits and the API stores) ─── */

export type ArticleDoc = Article & { published: boolean; seoTitle: string; seoDescription: string };
export interface FaqDoc {
  q: string;
  a: string;
  visible: boolean;
}
export interface ServiceDoc {
  id: string;
  icon: string;
  title: string;
  summary: string;
  description: string;
  points: string[];
  calculator?: { label: string; to: string };
  visible: boolean;
}
export interface WhyDoc {
  icon: string;
  title: string;
  body: string;
}
export interface StepDoc {
  title: string;
  body: string;
}
export interface SettingsDoc {
  name: string;
  shortName: string;
  tagline: string;
  url: string;
  distributor: { name: string; title: string; bio: string; photo: string };
  contact: {
    phone: string;
    phoneE164: string;
    whatsapp: string;
    email: string;
    hours: string;
    address: { line1: string; line2: string; city: string; state: string; pin: string };
    mapUrl: string;
  };
  forms: { bookingUrl: string };
  social: { linkedin: string; youtube: string; instagram: string };
}
export type SeoDoc = Record<string, { title: string; description: string }>;

export interface ContentMap {
  articles: ArticleDoc[];
  homeFaqs: FaqDoc[];
  educationFaqs: FaqDoc[];
  services: ServiceDoc[];
  whyChooseUs: WhyDoc[];
  journeySteps: StepDoc[];
  settings: SettingsDoc;
  seo: SeoDoc;
}
export type ContentKey = keyof ContentMap;

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const editableSettings = (): SettingsDoc => {
  const s = site;
  return clone({
    name: s.name,
    shortName: s.shortName,
    tagline: s.tagline,
    url: s.url,
    distributor: { name: s.distributor.name, title: s.distributor.title, bio: s.distributor.bio, photo: s.distributor.photo },
    contact: {
      phone: s.contact.phone,
      phoneE164: s.contact.phoneE164,
      whatsapp: s.contact.whatsapp,
      email: s.contact.email,
      hours: s.contact.hours,
      address: { ...s.contact.address },
      mapUrl: s.contact.mapUrl,
    },
    forms: { bookingUrl: s.forms.bookingUrl },
    social: { ...s.social },
  });
};

/**
 * The code's built-in content in editable form. Captured when this module first loads, i.e.
 * before `applyContent` mutates anything, so "Reset to default" in the admin is always exact.
 */
export const DEFAULTS: ContentMap = {
  articles: articles.map((a) => ({ ...clone(a), published: true, seoTitle: '', seoDescription: '' })),
  homeFaqs: homeFaqs.map((f) => ({ ...f, visible: true })),
  educationFaqs: educationFaqs.map((f) => ({ ...f, visible: true })),
  services: services.map((s) => ({
    id: s.id,
    icon: iconName(s.icon),
    title: s.title,
    summary: s.summary,
    description: s.description,
    points: [...s.points],
    ...(s.calculator ? { calculator: { ...s.calculator } } : {}),
    visible: true,
  })),
  whyChooseUs: whyChooseUs.map((w) => ({ icon: iconName(w.icon), title: w.title, body: w.body })),
  journeySteps: clone(journeySteps),
  settings: editableSettings(),
  seo: {},
};

/* ── Applying content to the live site ─────────────────────────────────── */

let seoOverrides: SeoDoc = {};
/** Admin-set title/description for a page path, if any. */
export const getSeoOverride = (path: string) => seoOverrides[path || '/'];

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => !!v && typeof v === 'object' && !Array.isArray(v);

/** Recursively copies `src` onto `dst` (objects merge, everything else replaces). */
function deepAssign(dst: Json, src: Json) {
  for (const [k, v] of Object.entries(src)) {
    if (isObj(v) && isObj(dst[k])) deepAssign(dst[k] as Json, v);
    else dst[k] = v;
  }
}

const replaceAll = <T>(target: T[], next: T[]) => void target.splice(0, target.length, ...next);

export function applyContent(c: Partial<ContentMap>) {
  if (c.articles) replaceAll<Article>(articles, c.articles);
  if (c.homeFaqs) replaceAll(homeFaqs, c.homeFaqs.map(({ q, a }) => ({ q, a })));
  if (c.educationFaqs) replaceAll(educationFaqs, c.educationFaqs.map(({ q, a }) => ({ q, a })));
  if (c.services) {
    replaceAll<Service>(
      services,
      c.services.map((s) => ({
        id: s.id,
        icon: ICONS[s.icon] ?? Briefcase,
        title: s.title,
        summary: s.summary,
        description: s.description,
        points: s.points,
        ...(s.calculator ? { calculator: s.calculator } : {}),
      })),
    );
  }
  if (c.whyChooseUs) replaceAll(whyChooseUs, c.whyChooseUs.map((w) => ({ icon: ICONS[w.icon] ?? Briefcase, title: w.title, body: w.body })));
  if (c.journeySteps) replaceAll(journeySteps, c.journeySteps);
  if (c.settings) deepAssign(site as unknown as Json, c.settings as unknown as Json);
  if (c.seo) seoOverrides = c.seo;
}

/**
 * Fetches admin-edited content and applies it. Never throws and never waits long:
 * if the API is missing or slow, the site simply renders with its built-in content.
 */
export async function loadContent(timeoutMs = 2500): Promise<void> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/content', { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const data = (await res.json()) as { content?: Partial<ContentMap> };
    if (data.content && isObj(data.content)) applyContent(data.content);
  } catch {
    /* backend unreachable or returned non-JSON (static hosting): keep the built-in content */
  } finally {
    clearTimeout(timer);
  }
}
