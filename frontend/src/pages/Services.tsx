import { ArrowRight, Calculator, Check, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CtaBanner } from '@/components/home/HomeSections';
import { Button } from '@/components/ui/Button';
import { IconBadge } from '@/components/ui/IconBadge';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { services } from '@/content/services';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn } from '@/lib/cn';

export default function Services() {
  usePageMeta(
    'Our services',
    'Mutual fund distribution, SIPs, lump sum investments, goal-based investing, retirement and child education planning, and portfolio review support.',
    '/services',
  );

  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Support for every stage of your investing life."
        description="Whether you are starting your first SIP or reorganising years of investments, we help you invest with purpose and stay on track."
      />

      {/* In-page navigation */}
      <nav aria-label="Services" className="sticky top-[4.5rem] z-30 border-b border-navy-900/[0.06] bg-ivory/90 backdrop-blur-xl lg:top-20">
        <div className="container-page">
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
            {services.map((s) => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  className="block rounded-full border border-navy-900/10 bg-white px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-brand-600/30 hover:text-navy-900"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container-page divide-y divide-navy-900/[0.07]">
        {services.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-40 py-16 sm:py-20 lg:py-24" aria-labelledby={`${s.id}-title`}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <Reveal className={cn('lg:col-span-5', i % 2 === 1 && 'lg:order-2')}>
                <div className="flex items-center gap-4">
                  <IconBadge icon={s.icon} size="lg" tone={i % 2 === 0 ? 'brand' : 'navy'} />
                  <span className="font-display text-sm font-bold text-gold-700">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h2 id={`${s.id}-title`} className="mt-7 text-display-md font-bold">
                  {s.title}
                </h2>
                <p className="mt-3 text-lg font-medium text-navy-700">{s.summary}</p>
              </Reveal>
              <Reveal className={cn('lg:col-span-7', i % 2 === 1 && 'lg:order-1')} delay={0.08}>
                <p className="text-[1.0625rem] leading-relaxed text-ink-muted">{s.description}</p>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex gap-3 rounded-2xl border border-navy-900/[0.06] bg-white p-4 text-sm leading-relaxed text-navy-800">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button to={`/contact?type=consultation&topic=${encodeURIComponent(s.title)}`} trailingIcon={<ArrowRight className="h-4 w-4" />}>
                    Discuss this with us
                  </Button>
                  {s.calculator && (
                    <Button to={s.calculator.to} variant="secondary" leadingIcon={<Calculator className="h-4 w-4" />}>
                      {s.calculator.label}
                    </Button>
                  )}
                </div>
              </Reveal>
            </div>
          </section>
        ))}
      </div>

      {/* Transparency */}
      <section className="pb-20 sm:pb-24">
        <div className="container-page">
          <Reveal>
            <div className="flex flex-col gap-6 rounded-3xl border border-gold-400/30 bg-gold-100/40 p-8 sm:flex-row sm:items-center sm:p-10">
              <IconBadge icon={FileText} tone="gold" size="lg" />
              <div className="flex-1">
                <h2 className="text-xl font-bold">How we are paid</h2>
                <p className="mt-2 leading-relaxed text-ink-muted">
                  We do not charge a separate fee for these services. We receive trail commission from AMCs on investments in Regular
                  Plans. Direct Plans of the same schemes have lower expense ratios as no commission is paid.
                </p>
              </div>
              <Link to="/disclosures#commission" className="link-underline shrink-0 text-sm font-semibold text-navy-900">
                Commission disclosure
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
