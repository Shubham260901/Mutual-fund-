import { describe, expect, it } from 'vitest';
import { site } from '@/config/site';
import { articles } from './articles';
import { educationFaqs, homeFaqs } from './faqs';
import { applyContent, DEFAULTS, getSeoOverride, ICON_NAMES, ICONS } from './runtime';
import { services } from './services';

describe('runtime content layer', () => {
  // These tests share module state (applyContent mutates the live exports), so order matters.

  it('captures built-in content in editable form before anything is applied', () => {
    expect(DEFAULTS.articles.length).toBe(articles.length);
    expect(DEFAULTS.articles.every((a) => a.published === true)).toBe(true);
    expect(DEFAULTS.services.map((s) => s.id)).toEqual(services.map((s) => s.id));
    // Icons are stored by name, and every built-in icon must be one the admin can pick.
    for (const s of DEFAULTS.services) expect(ICON_NAMES).toContain(s.icon);
    for (const w of DEFAULTS.whyChooseUs) expect(ICON_NAMES).toContain(w.icon);
    expect(Object.keys(DEFAULTS.settings).sort()).toEqual(['contact', 'distributor', 'forms', 'name', 'shortName', 'social', 'tagline', 'url']);
  });

  it('never exposes regulatory fields as editable settings', () => {
    const json = JSON.stringify(DEFAULTS.settings);
    for (const secret of [site.credentials.arn, site.credentials.euin, site.credentials.nism, site.legalName, site.contact.grievanceEmail]) {
      expect(json).not.toContain(secret);
    }
  });

  it('replaces arrays in place so existing imports see the new content', () => {
    const ref = articles; // an importer's reference
    applyContent({ articles: [{ slug: 'x', title: 'X', excerpt: 'e', category: 'Basics', readMinutes: 1, body: [], published: true, seoTitle: '', seoDescription: '' }] });
    expect(ref).toBe(articles);
    expect(articles).toHaveLength(1);
    expect(articles[0].slug).toBe('x');
  });

  it('maps icon names to components, falling back safely', () => {
    applyContent({ services: [{ id: 'a', icon: 'Heart', title: 'A', summary: 's', description: 'd', points: ['p'], visible: true }, { id: 'b', icon: 'Nope', title: 'B', summary: 's', description: 'd', points: [], visible: true }] });
    expect(services[0].icon).toBe(ICONS.Heart);
    expect(services[1].icon).toBe(ICONS.Briefcase);
  });

  it('strips admin-only fields from FAQs', () => {
    applyContent({ homeFaqs: [{ q: 'Q', a: 'A', visible: true }], educationFaqs: [{ q: 'Q2', a: 'A2', visible: true }] });
    expect(homeFaqs).toEqual([{ q: 'Q', a: 'A' }]);
    expect(educationFaqs).toEqual([{ q: 'Q2', a: 'A2' }]);
  });

  it('merges settings without touching credentials, and exposes SEO overrides', () => {
    const arn = site.credentials.arn;
    const grievance = site.contact.grievanceEmail;
    applyContent({ settings: { ...DEFAULTS.settings, name: 'New Name', contact: { ...DEFAULTS.settings.contact, email: 'new@example.com' } }, seo: { '/about': { title: 'About us', description: 'Desc' } } });
    expect(site.name).toBe('New Name');
    expect(site.contact.email).toBe('new@example.com');
    expect(site.credentials.arn).toBe(arn);
    expect(site.contact.grievanceEmail).toBe(grievance);
    expect(getSeoOverride('/about')?.title).toBe('About us');
    expect(getSeoOverride('/contact')).toBeUndefined();
  });

  it('ignores absent keys', () => {
    const before = services.length;
    applyContent({});
    expect(services).toHaveLength(before);
  });
});
