import { DocView, SaveBar, TextArea, TextField, useDoc } from './editor';

const PAGES = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/calculators', label: 'Calculators' },
  { path: '/education', label: 'Learn / Education' },
  { path: '/contact', label: 'Contact' },
  { path: '/disclosures', label: 'Disclosures' },
];

export function SeoEditor() {
  const doc = useDoc('seo');
  return (
    <DocView doc={doc}>
      {(seo) => (
        <>
          <p className="mb-5 max-w-prose text-sm text-ink-muted">
            The title and description search engines show for each page. Leave a field blank to keep the page's built-in text. Article pages are edited inside each article (Articles → Search engine preview).
          </p>
          <ul className="space-y-4">
            {PAGES.map(({ path, label }) => {
              const e = seo[path] ?? { title: '', description: '' };
              const set = (patch: Partial<typeof e>) => doc.setValue({ ...seo, [path]: { ...e, ...patch } });
              const tl = e.title.length;
              const dl = e.description.length;
              return (
                <li key={path} className="card p-5 sm:p-6">
                  <h2 className="mb-4 flex items-baseline gap-3 text-base font-bold">
                    {label} <span className="text-sm font-normal text-ink-subtle">{path}</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <TextField label="Page title" maxLength={120} value={e.title} onChange={(v) => set({ title: v })} />
                      <p className={`tabular mt-1 text-xs ${tl > 60 ? 'text-amber-700' : 'text-ink-subtle'}`}>
                        {tl} characters · about 60 or fewer displays fully in Google{tl > 60 ? ' (may be cut off)' : ''}
                      </p>
                    </div>
                    <div>
                      <TextArea label="Description" rows={2} maxLength={320} value={e.description} onChange={(v) => set({ description: v })} />
                      <p className={`tabular mt-1 text-xs ${dl > 160 ? 'text-amber-700' : 'text-ink-subtle'}`}>
                        {dl} characters · about 160 or fewer displays fully{dl > 160 ? ' (may be cut off)' : ''}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <SaveBar doc={doc} resetLabel="Clear all SEO overrides" />
        </>
      )}
    </DocView>
  );
}
