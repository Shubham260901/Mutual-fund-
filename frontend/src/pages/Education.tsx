import { BarChart3, Building2, Landmark, Layers, Scale, ShieldCheck, Shuffle, Target, Users } from 'lucide-react';
import { Riskometer } from '@/components/education/Riskometer';
import { ArticleCard, CtaBanner } from '@/components/home/HomeSections';
import { Accordion } from '@/components/ui/Accordion';
import { IconBadge } from '@/components/ui/IconBadge';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { articles } from '@/content/articles';
import { educationFaqs } from '@/content/faqs';
import { usePageMeta } from '@/hooks/usePageMeta';

const toc = [
  { id: 'basics', label: 'Basics' },
  { id: 'types', label: 'Types of funds' },
  { id: 'sip-vs-lumpsum', label: 'SIP vs Lump Sum' },
  { id: 'equity-vs-debt', label: 'Equity vs Debt' },
  { id: 'risk', label: 'Understanding risk' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'articles', label: 'Articles' },
];

const basics = [
  { icon: Users, title: 'Pooled investing', body: 'Many investors pool money, which a fund invests in a diversified portfolio. You own units in proportion to your investment.' },
  { icon: BarChart3, title: 'Net Asset Value', body: 'NAV is the value of one unit, calculated daily. Your investment value = units held × current NAV.' },
  { icon: Building2, title: 'Professional management', body: 'An AMC’s fund manager invests according to the scheme’s stated objective and investment limits.' },
  { icon: ShieldCheck, title: 'Regulated by SEBI', body: 'Mutual funds are regulated by SEBI. Assets are held by an independent custodian, separate from the AMC.' },
];

const fundTypes = [
  { icon: BarChart3, name: 'Equity funds', invests: 'Shares of companies', suited: 'Long-term goals (typically 5+ years)', volatility: 'Higher' },
  { icon: Landmark, name: 'Debt funds', invests: 'Bonds, government securities, money market instruments', suited: 'Short to medium-term goals, stability', volatility: 'Lower to moderate' },
  { icon: Shuffle, name: 'Hybrid funds', invests: 'A mix of equity and debt', suited: 'Investors seeking balance between growth and stability', volatility: 'Moderate' },
  { icon: Target, name: 'Solution-oriented', invests: 'Varies; designed around retirement or children’s goals', suited: 'Specific life goals, with a lock-in', volatility: 'Varies by allocation' },
  { icon: Layers, name: 'Index funds & ETFs', invests: 'Securities that replicate a market index', suited: 'Low-cost, passive market exposure', volatility: 'Mirrors the index' },
  { icon: Scale, name: 'ELSS', invests: 'Predominantly equity, 3-year lock-in', suited: 'Long-term investing with tax benefits under applicable law', volatility: 'Higher' },
];

const sipVsLump = [
  ['How you invest', 'Fixed amount at regular intervals', 'Entire amount at once'],
  ['Best suited for', 'Regular monthly income', 'Bonus, maturity proceeds or windfalls'],
  ['Market timing', 'Spreads purchases across market levels', 'Entry price depends on the day you invest'],
  ['Discipline', 'Builds an automatic investing habit', 'Needs a one-time decision'],
  ['Starting amount', 'Can start small (scheme minimums apply)', 'Usually larger amounts'],
  ['Flexibility', 'Pause, increase or stop anytime', 'Can be staggered via STP'],
];

const equityVsDebt = [
  ['Invests in', 'Shares of companies', 'Bonds and money market instruments'],
  ['Return driver', 'Company earnings and market sentiment', 'Interest income and changes in interest rates'],
  ['Volatility', 'Higher, especially in the short term', 'Generally lower, but not zero'],
  ['Key risks', 'Market risk, concentration risk', 'Interest-rate risk, credit risk, liquidity risk'],
  ['Typical horizon', 'Long term (5+ years)', 'Days to a few years, depending on category'],
  ['Role in portfolio', 'Long-term growth potential', 'Stability, liquidity, regular accrual'],
];

function CompareTable({ caption, headers, rows }: { caption: string; headers: [string, string, string]; rows: string[][] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-navy-900 text-white">
              {headers.map((h, i) => (
                <th key={h} scope="col" className={i === 0 ? 'w-1/4 px-6 py-4 font-medium text-navy-100/70' : 'px-6 py-4 font-display text-base font-bold'}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/[0.06]">
            {rows.map(([label, a, b]) => (
              <tr key={label} className="transition-colors hover:bg-ivory/70">
                <th scope="row" className="px-6 py-4 font-semibold text-navy-900">
                  {label}
                </th>
                <td className="px-6 py-4 text-ink-muted">{a}</td>
                <td className="px-6 py-4 text-ink-muted">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Education() {
  usePageMeta(
    'Investor education',
    'Learn mutual fund basics, types of funds, SIP vs lump sum, equity vs debt, and how to understand risk, in plain language.',
    '/education',
  );

  return (
    <>
      <PageHero
        eyebrow="Learning centre"
        title="Mutual funds, explained simply."
        description="Clear, unbiased guides to help you understand how mutual funds work, so you can invest with confidence."
      />

      <nav aria-label="On this page" className="sticky top-[4.5rem] z-30 border-b border-navy-900/[0.06] bg-ivory/90 backdrop-blur-xl lg:top-20">
        <div className="container-page">
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
            {toc.map((t) => (
              <li key={t.id} className="shrink-0">
                <a
                  href={`#${t.id}`}
                  className="block rounded-full border border-navy-900/10 bg-white px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-brand-600/30 hover:text-navy-900"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <section id="basics" className="section scroll-mt-32">
        <div className="container-page">
          <SectionHeading eyebrow="Mutual fund basics" title="What is a mutual fund?" description="A mutual fund is a professionally managed investment vehicle that pools money from many investors to buy a diversified portfolio of securities." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {basics.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.06}>
                <div className="card h-full p-6">
                  <IconBadge icon={b.icon} />
                  <h3 className="mt-5 text-base font-bold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="types" className="section scroll-mt-32 bg-white">
        <div className="container-page">
          <SectionHeading eyebrow="Types of mutual funds" title="Different funds for different goals" description="SEBI groups schemes into categories so investors can compare like with like. Here are the main families." />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {fundTypes.map((f, i) => (
              <Reveal key={f.name} delay={(i % 3) * 0.06}>
                <div className="h-full rounded-3xl border border-navy-900/[0.07] bg-ivory/50 p-7 transition-all duration-300 hover:bg-white hover:shadow-lift">
                  <div className="flex items-center gap-4">
                    <IconBadge icon={f.icon} tone="navy" />
                    <h3 className="text-lg font-bold">{f.name}</h3>
                  </div>
                  <dl className="mt-6 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Invests in</dt>
                      <dd className="mt-1 text-ink-muted">{f.invests}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Often used for</dt>
                      <dd className="mt-1 text-ink-muted">{f.suited}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Relative volatility</dt>
                      <dd className="mt-1 font-medium text-navy-900">{f.volatility}</dd>
                    </div>
                  </dl>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="sip-vs-lumpsum" className="section scroll-mt-32">
        <div className="container-page">
          <SectionHeading eyebrow="SIP vs Lump Sum" title="Two ways to invest, each with a purpose" description="Neither is universally better. The right choice depends on your cash flows, time horizon and comfort with volatility." />
          <Reveal className="mt-12">
            <CompareTable caption="Comparison of SIP and lump sum investing" headers={['', 'SIP', 'Lump Sum']} rows={sipVsLump} />
          </Reveal>
        </div>
      </section>

      <section id="equity-vs-debt" className="section scroll-mt-32 bg-white">
        <div className="container-page">
          <SectionHeading eyebrow="Equity vs Debt" title="The two building blocks of most portfolios" description="Understanding how they behave helps you combine them sensibly across goals." />
          <Reveal className="mt-12">
            <CompareTable caption="Comparison of equity and debt funds" headers={['', 'Equity funds', 'Debt funds']} rows={equityVsDebt} />
          </Reveal>
        </div>
      </section>

      <section id="risk" className="section scroll-mt-32">
        <div className="container-page">
          <SectionHeading eyebrow="Understanding risk" title="Every scheme carries a Riskometer" description="SEBI requires each mutual fund scheme to show its risk level on a six-step scale. It’s one of the first things to check before investing." />
          <Reveal className="mt-12">
            <div className="card p-6 sm:p-10">
              <Riskometer />
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Market risk', 'Prices fall due to economic or market-wide events.'],
              ['Interest-rate risk', 'Bond prices fall when interest rates rise.'],
              ['Credit risk', 'A borrower may fail to repay interest or principal.'],
              ['Liquidity risk', 'Securities may be hard to sell quickly at a fair price.'],
            ].map(([t, b]) => (
              <div key={t} className="rounded-3xl border border-navy-900/[0.07] bg-white p-6">
                <h3 className="text-base font-bold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faqs" className="section scroll-mt-32 bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="FAQs" title="Common questions, clear answers" />
          </div>
          <Reveal className="lg:col-span-8">
            <Accordion items={educationFaqs} />
          </Reveal>
        </div>
      </section>

      <section id="articles" className="section scroll-mt-32">
        <div className="container-page">
          <SectionHeading eyebrow="Articles & guides" title="Read, learn, invest better" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 3) * 0.06}>
                <ArticleCard article={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
