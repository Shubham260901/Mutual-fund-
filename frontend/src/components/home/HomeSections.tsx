import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarCheck, FileText, Landmark, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { site, whatsappLink } from '@/config/site';
import { articles } from '@/content/articles';
import { homeFaqs } from '@/content/faqs';
import { journeySteps, services, whyChooseUs } from '@/content/services';
import { Accordion } from '../ui/Accordion';
import { Button } from '../ui/Button';
import { IconBadge } from '../ui/IconBadge';
import { GridTexture } from '../ui/PageHero';
import { Value } from '../ui/Placeholder';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

/* ── Trust & credibility ───────────────────────────────────────────────── */

const pillars = [
  { icon: BadgeCheck, title: 'AMFI-registered', body: <>Mutual Fund Distributor, <Value>{site.credentials.arn}</Value>. Verify it on the AMFI website.</> },
  { icon: Landmark, title: 'Your money, your name', body: <>Payments go directly to the mutual fund. Units are held in your name.</> },
  { icon: FileText, title: 'Commission disclosed', body: <>We are paid by AMCs through Regular Plans, and we tell you upfront.</> },
  { icon: ShieldCheck, title: 'Regulated grievance route', body: <>A named grievance officer, plus access to SEBI SCORES and SMART ODR.</> },
];

export function TrustStrip() {
  return (
    <section aria-label="Why investors can trust us" className="relative border-b border-navy-900/[0.06] bg-white">
      <div className="container-page grid gap-px overflow-hidden py-4 sm:grid-cols-2 lg:grid-cols-4 lg:py-0">
        {pillars.map((p, i) => (
          <Reveal
            key={p.title}
            delay={i * 0.06}
            className="flex gap-4 py-6 lg:border-l lg:border-navy-900/[0.06] lg:px-8 lg:py-10 lg:first:border-l-0 lg:first:pl-0"
          >
            <IconBadge icon={p.icon} />
            <div>
              <h2 className="font-sans text-[0.9375rem] font-semibold text-navy-900">{p.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Distributor introduction ──────────────────────────────────────────── */

export function DistributorIntro() {
  const initials = site.distributor.name.replace(/[[\]]/g, '').split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <section className="section">
      <div className="container-page grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <Reveal className="lg:col-span-5">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-4xl bg-gradient-to-br from-navy-800 to-navy-950">
              {site.distributor.photo ? (
                <img src={site.distributor.photo} alt={site.distributor.name} className="h-full w-full object-cover object-[50%_20%]" loading="lazy" decoding="async" />
              ) : (
                <div className="relative flex h-full items-center justify-center">
                  <GridTexture />
                  <span className="font-display text-8xl font-bold text-gold-300/80">{initials}</span>
                  <span className="absolute bottom-6 left-6 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    Add a photo in src/config/site.ts
                  </span>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <div className="pt-6 lg:col-span-7 lg:pt-0">
          <SectionHeading
            eyebrow="Meet your distributor"
            title={<>Personal guidance, grounded in <span className="text-brand-700">clarity and discipline</span>.</>}
          />
          <Reveal delay={0.1}>
            <p className="lead mt-6">
              Hello, I am <span className="font-semibold text-navy-900">{site.distributor.name}</span>, an{' '}
              {site.distributor.title}. <Value>{site.distributor.bio}</Value>
            </p>
            <p className="mt-5 leading-relaxed text-ink-muted">
              My role is simple: help you understand mutual funds well enough to invest with confidence, choose schemes that fit your
              goals and risk profile, and stay invested through market ups and downs. Every recommendation comes with a clear explanation
              of risks, costs and how I am paid.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button to="/about" variant="secondary" trailingIcon={<ArrowRight className="h-4 w-4" />}>
                More about us
              </Button>
              <Button to="/contact?type=consultation" variant="ghost" leadingIcon={<CalendarCheck className="h-4 w-4" />}>
                Schedule a conversation
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Services overview ─────────────────────────────────────────────────── */

export function ServicesGrid() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our services"
          title="Everything you need to invest with purpose"
          description="From your first SIP to a full review of existing holdings, we support each stage of your investing life."
          action={
            <Button to="/services" variant="secondary" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              All services
            </Button>
          }
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 4) * 0.06}>
              <Link
                to={`/services#${s.id}`}
                className="group flex h-full flex-col rounded-3xl border border-navy-900/[0.07] bg-ivory/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-600/20 hover:bg-white hover:shadow-lift"
              >
                <IconBadge icon={s.icon} />
                <h3 className="mt-6 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{s.summary}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  Learn more
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={0.18}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-navy-900 bg-navy-radial p-6 text-white">
              <p className="font-display text-lg font-bold text-white">Not sure where to begin?</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-100/75">
                A short, no-obligation conversation is often the best first step.
              </p>
              <Button to="/contact?type=consultation" variant="light" className="mt-6 self-start" trailingIcon={<ArrowRight className="h-4 w-4" />}>
                Book a call
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Why choose us ─────────────────────────────────────────────────────── */

export function WhyChooseUs() {
  return (
    <section className="section relative overflow-hidden bg-navy-900 bg-navy-radial">
      <GridTexture />
      <div className="container-page relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            tone="light"
            eyebrow="Why investors work with us"
            title="A relationship built on transparency, not transactions."
            description="We believe trust is earned through clear communication, honest disclosures and consistent support over many years."
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          {whyChooseUs.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 transition-colors duration-300 hover:border-gold-400/30 hover:bg-white/[0.05]">
                <IconBadge icon={w.icon} tone="glass" />
                <h3 className="mt-6 text-lg font-bold text-white">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-100/75">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Investment journey ────────────────────────────────────────────────── */

export function Journey() {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title="Your investment journey, in four clear steps"
          description="A simple, structured process, so you always know what happens next."
        />
        <div className="relative mt-16">
          <div
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-gradient-to-r from-gold-400/0 via-gold-400/60 to-gold-400/0 md:block"
            aria-hidden
          />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {journeySteps.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/50 bg-white font-display text-lg font-bold text-navy-900 shadow-soft transition-transform duration-300 hover:scale-105">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-ink-muted">{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ── Education preview ─────────────────────────────────────────────────── */

export function EducationPreview() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Investor education"
          title="Understand before you invest"
          description="Plain-language guides to help you make informed decisions, written for first-time and experienced investors alike."
          action={
            <Button to="/education" variant="secondary" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              Visit the learning centre
            </Button>
          }
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {articles.slice(0, 3).map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.08}>
              <ArticleCard article={a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ArticleCard({ article }: { article: (typeof articles)[number] }) {
  return (
    <Link
      to={`/education/${article.slug}`}
      className="group flex h-full flex-col rounded-3xl border border-navy-900/[0.07] bg-ivory/50 p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lift"
    >
      <div className="flex items-center gap-3 text-xs">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-800">{article.category}</span>
        <span className="text-ink-subtle">{article.readMinutes} min read</span>
      </div>
      <h3 className="mt-5 text-xl font-bold leading-snug transition-colors group-hover:text-brand-800">{article.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{article.excerpt}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
        Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/* ── FAQ ───────────────────────────────────────────────────────────────── */

export function FaqSection() {
  return (
    <section className="section">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="FAQs" title="Questions investors often ask" />
          <Reveal delay={0.1}>
            <p className="mt-5 leading-relaxed text-ink-muted">
              Can’t find what you are looking for?{' '}
              <Link to="/contact" className="link-underline font-semibold text-navy-900">
                Send us a question
              </Link>{' '}
              and we will reply within one working day.
            </p>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-8" delay={0.1}>
          <Accordion items={homeFaqs} />
        </Reveal>
      </div>
    </section>
  );
}

/* ── Closing CTA ───────────────────────────────────────────────────────── */

export function CtaBanner() {
  return (
    <section className="pb-20 sm:pb-24 lg:pb-28">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-navy-900 bg-navy-radial px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
            <GridTexture />
            <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="eyebrow eyebrow-light mb-4">Take the first step</p>
                <h2 className="text-display-md font-bold text-white sm:text-display-lg">
                  Let’s build a plan you can stay with for the long run.
                </h2>
                <p className="mt-4 text-navy-100/75">
                  A no-obligation conversation about your goals. No pressure and no jargon, just clarity.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
                <Button to="/contact?type=consultation" size="lg" trailingIcon={<ArrowRight className="h-4 w-4" />}>
                  Book a Consultation
                </Button>
                <Button href={whatsappLink()} size="lg" variant="outline-light" leadingIcon={<MessageCircle className="h-4 w-4" />}>
                  Chat on WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
