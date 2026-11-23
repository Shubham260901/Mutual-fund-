import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { site } from '@/config/site';
import { disclosureSections, officialLinks, STANDARD_RISK_WARNING } from '@/content/disclosures';
import { usePageMeta } from '@/hooks/usePageMeta';

/** Linkify bare https:// URLs inside disclosure text. */
function withLinks(text: string) {
  return text.split(/(https?:\/\/[^\s)]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="link-underline font-medium text-navy-900">
        {part.replace(/^https?:\/\//, '')}
      </a>
    ) : (
      part
    ),
  );
}

export default function Disclosures() {
  usePageMeta(
    'Disclosures',
    `Regulatory disclosures, commission disclosure, risk factors and grievance redressal for ${site.name}, an AMFI-registered Mutual Fund Distributor.`,
    '/disclosures',
  );

  return (
    <>
      <PageHero
        eyebrow="Investor information"
        title="Disclosures & investor charter"
        description="Who we are, how we are paid, the risks of investing and how to raise a concern, all in one place."
      />

      <section className="section pt-12 sm:pt-16">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <nav aria-label="Disclosure sections" className="lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">On this page</p>
              <ul className="mt-4 space-y-1 border-l border-navy-900/10">
                {disclosureSections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-ink-muted transition-colors hover:border-brand-600 hover:text-navy-900">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="lg:col-span-9">
            <div className="rounded-2xl border border-gold-400/40 bg-gold-100/50 px-6 py-5 font-semibold text-navy-900">{STANDARD_RISK_WARNING}</div>

            <div className="mt-10 space-y-12">
              {disclosureSections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-28">
                  <h2 className="text-2xl font-bold">{s.title}</h2>
                  <div className="mt-4 space-y-4">
                    {s.body.map((p) => (
                      <p key={p} className="leading-relaxed text-ink-muted">
                        {withLinks(p)}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-14 rounded-3xl border border-navy-900/[0.07] bg-white p-7">
              <h2 className="text-lg font-bold">Official resources</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {officialLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-2xl border border-navy-900/[0.07] px-4 py-3 text-sm font-medium text-navy-900 transition-colors hover:border-brand-600/30 hover:bg-brand-50/40"
                    >
                      {l.label}
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-8 text-xs text-ink-subtle">
              Last reviewed: [DD Month YYYY]. Update this date whenever disclosures are revised (src/pages/Disclosures.tsx).
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
