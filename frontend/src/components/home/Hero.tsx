import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck, Check, GraduationCap, Home as HomeIcon, Sunset } from 'lucide-react';
import { site } from '@/config/site';
import { Button } from '../ui/Button';
import { GridTexture } from '../ui/PageHero';
import { Value } from '../ui/Placeholder';

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-900 bg-navy-radial pt-32 sm:pt-40 lg:pt-44">
      <GridTexture />
      <div className="container-page relative grid items-center gap-16 pb-20 lg:grid-cols-12 lg:gap-10 lg:pb-28">
        <div className="lg:col-span-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4 text-xs font-medium text-navy-100"
          >
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-white">
              AMFI-registered
            </span>
            <span className="hidden sm:inline">Mutual Fund Distributor ·</span>
            <span className="sm:hidden">MFD ·</span>
            <Value>{site.credentials.arn}</Value>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease }}
            className="mt-8 text-display-xl font-bold text-white"
          >
            Build financial confidence,{' '}
            <span className="bg-gradient-to-r from-gold-300 via-gold-200 to-gold-400 bg-clip-text text-transparent">one disciplined step</span>{' '}
            at a time.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.16, ease }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-navy-100/80"
          >
            I’m <span className="font-semibold text-white">{site.distributor.name}</span>, an AMFI-registered Mutual Fund
            Distributor. I help individuals and families understand their options, invest with clarity, and stay on course with
            transparent, long-term support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.24, ease }}
            className="mt-10 flex"
          >
            <Button to="/contact?type=enquiry" size="lg" className="w-full sm:w-auto" trailingIcon={<ArrowRight className="h-4 w-4" />}>
              Start Your Investment Journey
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col gap-x-6 gap-y-2.5 text-sm text-navy-100/75 sm:flex-row sm:flex-wrap"
          >
            {['Investments held in your name', 'Commission fully disclosed', 'No guaranteed-return promises'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" aria-hidden />
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="lg:col-span-6">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

const goals = [
  { icon: GraduationCap, name: 'Child’s higher education', year: '2038', pct: 42 },
  { icon: HomeIcon, name: 'Home down payment', year: '2031', pct: 68 },
  { icon: Sunset, name: 'Retirement corpus', year: '2052', pct: 18 },
];

/** An illustrative goal tracker. Clearly labelled as an example, not real client data. */
function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease }}
      className="relative mx-auto max-w-lg lg:ml-auto lg:mr-0"
      aria-label="Illustration of a goal-based investment plan"
      role="img"
    >
      <div className="absolute -inset-8 rounded-[3rem] bg-emerald-600/10 blur-3xl" aria-hidden />

      <div className="relative rounded-4xl border border-white/10 bg-white/[0.06] p-2 shadow-2xl backdrop-blur-xl">
        <div className="rounded-[1.6rem] bg-white p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">Example plan</p>
              <p className="mt-1 font-display text-lg font-bold text-navy-900">Your goals, mapped</p>
            </div>
            <span className="rounded-full bg-gold-100 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-gold-700">
              Illustration
            </span>
          </div>

          <ul className="mt-6 space-y-5">
            {goals.map((g, i) => (
              <li key={g.name}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700" aria-hidden>
                    <g.icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-navy-900">{g.name}</p>
                      <p className="text-xs text-ink-subtle">Target {g.year}</p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
                      <motion.div
                        className="h-full rounded-full bg-emerald-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${g.pct}%` }}
                        transition={{ duration: 1.2, delay: 0.6 + i * 0.15, ease }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-7 rounded-2xl bg-ivory p-4">
            <svg viewBox="0 0 300 80" className="h-20 w-full" aria-hidden>
              <defs>
                <linearGradient id="heroArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#087F5B" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#087F5B" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 72 C 60 70, 90 62, 140 52 S 230 26, 300 8 L300 80 L0 80 Z" fill="url(#heroArea)" />
              <motion.path
                d="M0 72 C 60 70, 90 62, 140 52 S 230 26, 300 8"
                fill="none"
                stroke="#087F5B"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, delay: 0.7, ease }}
              />
              <path d="M0 72 L300 46" fill="none" stroke="#5B7BC0" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="mt-2 text-[0.6875rem] text-ink-subtle">The power of compounding over time · conceptual illustration</p>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-navy-900/[0.07] pt-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700" aria-hidden>
              <CalendarCheck className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xs text-ink-subtle">Monthly SIP · auto-debit</p>
              <p className="font-display text-base font-bold text-navy-900">On the 5th, every month</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
