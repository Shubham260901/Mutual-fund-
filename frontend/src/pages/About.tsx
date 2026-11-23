import { ArrowRight, Check, Compass, Eye, HeartHandshake, Scale, Search, ShieldCheck, X } from 'lucide-react';
import { CtaBanner } from '@/components/home/HomeSections';
import { Button } from '@/components/ui/Button';
import { IconBadge } from '@/components/ui/IconBadge';
import { PageHero } from '@/components/ui/PageHero';
import { Value } from '@/components/ui/Placeholder';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { site } from '@/config/site';
import { usePageMeta } from '@/hooks/usePageMeta';

const approach = [
  { icon: Search, title: 'Understand first', body: 'We start by learning about your goals, income, existing investments, responsibilities and comfort with risk.' },
  { icon: Scale, title: 'Suitability over sales', body: 'Schemes are suggested only when they fit your risk profile and time horizon, with the reasons explained.' },
  { icon: Eye, title: 'Full transparency', body: 'Riskometers, expense ratios, exit loads and our commission are discussed openly before you invest.' },
  { icon: Compass, title: 'Discipline through cycles', body: 'We help you stay focused on long-term goals when markets are volatile, rather than reacting to noise.' },
  { icon: HeartHandshake, title: 'Service that continues', body: 'Statements, KYC updates, nominations, transmission and reviews: support long after the first investment.' },
];

const credentials = [
  { label: 'Registration', value: site.credentials.category },
  { label: 'AMFI Registration Number', value: site.credentials.arn },
  { label: 'ARN valid till', value: site.credentials.arnValidTill },
  { label: 'EUIN', value: site.credentials.euin },
  { label: 'Certification', value: site.credentials.nism },
  { label: 'Experience', value: site.credentials.experience },
  { label: 'Registered entity', value: site.legalName },
];

const weAre = [
  'An AMFI-registered Mutual Fund Distributor',
  'Paid through commission from AMCs on Regular Plans, disclosed upfront',
  'Focused on helping you invest suitably and stay invested',
  'Available for ongoing service and periodic reviews',
];
const weAreNot = [
  'A SEBI-registered Investment Adviser',
  'A source of guaranteed or assured returns',
  'A custodian of your money: payments go directly to the mutual fund',
  'Promoters of any single AMC or scheme',
];

export default function About() {
  usePageMeta(
    'About us',
    `Learn about ${site.name}, an AMFI-registered Mutual Fund Distributor: our mission, approach and credentials.`,
    '/about',
  );

  return (
    <>
      <PageHero
        eyebrow={`About ${site.distributor.name}`}
        title="Helping families invest with clarity and confidence."
        description={`${site.name} is an AMFI-registered Mutual Fund Distributor. We help individuals and families invest in mutual funds with a clear purpose, a suitable approach and honest guidance.`}
      />

      {/* Introduction */}
      <section className="section">
        <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow="Who we are" title="A practice built around one idea: informed investors make better decisions." />
          </div>
          <Reveal className="space-y-5 text-[1.0625rem] leading-relaxed text-ink-muted lg:col-span-6" delay={0.1}>
            <p>
              Investing can feel complicated: thousands of schemes, constant market news and conflicting opinions. Our job is to cut through
              that noise. We take the time to understand what you are investing for, explain your options in plain language, and help you
              put a disciplined plan into action.
            </p>
            <p>
              <Value>[Add 2–3 sentences about the founding story, the communities or clients you serve, and the city or region you operate in. Keep it factual.]</Value>
            </p>
            <p>
              As a Mutual Fund Distributor, we are compensated by Asset Management Companies through commission on Regular Plans. We
              believe you should know this from the first conversation, and we are always happy to explain how it works.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="pb-20 sm:pb-24 lg:pb-28">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="card h-full p-8 sm:p-10">
              <p className="eyebrow">Our mission</p>
              <p className="mt-5 font-display text-2xl font-bold leading-snug text-navy-900">
                To help every investor we serve build long-term financial confidence through suitable, well-understood mutual fund
                investments.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h-full rounded-3xl bg-navy-900 bg-navy-radial p-8 sm:p-10">
              <p className="eyebrow eyebrow-light">Our vision</p>
              <p className="mt-5 font-display text-2xl font-bold leading-snug text-white">
                A future where investing is a confident, everyday habit for Indian families, not a source of anxiety.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Approach */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our approach"
            title="How we approach mutual fund distribution"
            description="Five principles guide every conversation and every recommendation."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {approach.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-navy-900/[0.07] bg-ivory/60 p-6">
                  <IconBadge icon={a.icon} />
                  <h3 className="mt-5 text-base font-bold">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="section">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Experience & credentials"
              title="Registered, certified and accountable"
              description="You can independently verify our registration on the AMFI website at any time."
            />
            <Reveal delay={0.1}>
              <Button
                href="https://www.amfiindia.com/locate-your-nearest-mutual-fund-distributor-details"
                variant="secondary"
                className="mt-8"
                leadingIcon={<ShieldCheck className="h-4 w-4" />}
              >
                Verify on AMFI
              </Button>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7" delay={0.1}>
            <dl className="card divide-y divide-navy-900/[0.06]">
              {credentials.map((c) => (
                <div key={c.label} className="grid gap-1 px-6 py-5 sm:grid-cols-5 sm:gap-6 sm:px-8">
                  <dt className="text-sm text-ink-muted sm:col-span-2">{c.label}</dt>
                  <dd className="text-sm font-semibold text-navy-900 sm:col-span-3">
                    <Value>{c.value}</Value>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* What we are / are not */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="Why investors can work with us"
            title="Clear about what we do, and what we don’t"
            description="Trust starts with clarity about roles. Here is exactly where we stand."
          />
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-brand-600/15 bg-brand-50/50 p-8">
                <h3 className="text-lg font-bold">We are</h3>
                <ul className="mt-6 space-y-4">
                  {weAre.map((t) => (
                    <li key={t} className="flex gap-3 text-ink-muted">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white" aria-hidden>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="h-full rounded-3xl border border-navy-900/[0.08] bg-ivory p-8">
                <h3 className="text-lg font-bold">We are not</h3>
                <ul className="mt-6 space-y-4">
                  {weAreNot.map((t) => (
                    <li key={t} className="flex gap-3 text-ink-muted">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-200 text-navy-800" aria-hidden>
                        <X className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-12 flex justify-center">
            <Button to="/disclosures" variant="ghost" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              Read our full disclosures
            </Button>
          </Reveal>
        </div>
      </section>

      <div className="pt-20 sm:pt-24 lg:pt-28">
        <CtaBanner />
      </div>
    </>
  );
}
