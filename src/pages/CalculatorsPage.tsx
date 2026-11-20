import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Coins, Repeat, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GoalCalculator, LumpSumCalculator, SipCalculator, StepUpSipCalculator } from '@/components/calculators/Calculators';
import { CtaBanner } from '@/components/home/HomeSections';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn } from '@/lib/cn';

const tabs = [
  { id: 'sip', label: 'SIP', icon: Repeat, title: 'SIP Calculator', Component: SipCalculator },
  { id: 'lumpsum', label: 'Lump Sum', icon: Coins, title: 'Lump Sum Calculator', Component: LumpSumCalculator },
  { id: 'goal', label: 'Goal Planner', icon: Target, title: 'Goal Planning Calculator', Component: GoalCalculator },
  { id: 'stepup', label: 'Step-up SIP', icon: TrendingUp, title: 'Step-up SIP Calculator', Component: StepUpSipCalculator },
] as const;

type TabId = (typeof tabs)[number]['id'];
const isTab = (v: string): v is TabId => tabs.some((t) => t.id === v);

export default function CalculatorsPage() {
  usePageMeta(
    'Investment calculators',
    'Free SIP, lump sum, goal planning and step-up SIP calculators. Results are hypothetical illustrations, not guaranteed returns.',
    '/calculators',
  );
  const { hash } = useLocation();
  const fromHash = hash.slice(1);
  const [active, setActive] = useState<TabId>(isTab(fromHash) ? fromHash : 'sip');

  useEffect(() => {
    if (isTab(fromHash)) setActive(fromHash);
  }, [fromHash]);

  const select = (id: TabId) => {
    setActive(id);
    // Update the URL so the tab can be shared, without triggering a scroll.
    window.history.replaceState(window.history.state, '', `#${id}`);
  };

  const onTabKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = tabs[(idx + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    select(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  const current = tabs.find((t) => t.id === active)!;

  return (
    <>
      <PageHero
        eyebrow="Investment calculators"
        title="Explore what disciplined investing could look like."
        description="Model SIPs, lump sums, goals and step-up SIPs with your own assumptions. Every result is a hypothetical illustration, not a promise of returns."
      />

      <section className="section pt-12 sm:pt-16">
        <div className="container-page">
          {/* Anchor targets for deep links such as /calculators#goal */}
          {tabs.map((t) => (
            <span key={t.id} id={t.id} className="block scroll-mt-28" aria-hidden />
          ))}

          <div
            role="tablist"
            aria-label="Calculators"
            className="mx-auto grid max-w-2xl grid-cols-2 gap-1 rounded-3xl border border-navy-900/[0.08] bg-white p-1.5 shadow-soft sm:flex sm:rounded-full"
          >
            {tabs.map((t, idx) => {
              const selected = t.id === active;
              return (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(t.id)}
                  onKeyDown={(e) => onTabKey(e, idx)}
                  className={cn(
                    'relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors',
                    selected ? 'text-white' : 'text-ink-muted hover:text-navy-900',
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="calc-tab"
                      className="absolute inset-0 rounded-full bg-navy-900"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <t.icon className="relative h-4 w-4" aria-hidden />
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                id={`panel-${current.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${current.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="mb-6 text-2xl font-bold">{current.title}</h2>
                <current.Component />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Assumptions, not predictions',
                body: 'The return you enter is held constant. Real returns vary from year to year and can be negative.',
              },
              {
                title: 'Costs and taxes excluded',
                body: 'Projections do not deduct taxes or exit loads. Expense ratios are already reflected in scheme NAVs.',
              },
              {
                title: 'Use them to start a conversation',
                body: 'Calculators help frame goals. Suitable scheme selection depends on your full financial picture.',
              },
            ].map((c) => (
              <div key={c.title} className="rounded-3xl border border-navy-900/[0.07] bg-white p-6">
                <h3 className="text-base font-bold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button to="/contact?type=consultation" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              Turn these numbers into a plan
            </Button>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
