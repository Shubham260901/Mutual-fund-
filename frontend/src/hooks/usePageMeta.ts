import { useEffect } from 'react';
import { site } from '@/config/site';
import { getSeoOverride } from '@/content/runtime';

/** Sets the document title, meta description and canonical URL for each route. */
export function usePageMeta(title: string, description: string, path = '') {
  useEffect(() => {
    // Titles/descriptions set in the admin panel (SEO tab) win over the page's built-in ones.
    const override = getSeoOverride(path);
    if (override?.title) title = override.title;
    if (override?.description) description = override.description;
    document.title = override?.title ? override.title : title ? `${title} | ${site.name}` : `${site.name} | AMFI-registered Mutual Fund Distributor`;

    const setMeta = (selector: string, attr: string, key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', document.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${site.url}${path}`;
  }, [title, description, path]);
}
