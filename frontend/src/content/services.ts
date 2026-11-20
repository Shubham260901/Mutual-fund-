import {
  Briefcase,
  GraduationCap,
  Layers,
  type LucideIcon,
  PiggyBank,
  RefreshCw,
  Repeat,
  Sunset,
  Target,
} from 'lucide-react';

export interface Service {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  description: string;
  points: string[];
  /** Optional link to the most relevant calculator. */
  calculator?: { label: string; to: string };
}

/**
 * Service copy is written for a Mutual Fund Distributor: guidance is
 * incidental to distribution, and no scheme-specific promotion is made.
 */
export const services: Service[] = [
  {
    id: 'mutual-fund-distribution',
    icon: Layers,
    title: 'Mutual Fund Distribution',
    summary: 'Access to schemes across AMCs, with paperwork and KYC handled for you.',
    description:
      'We help you invest in mutual fund schemes from multiple Asset Management Companies through regulated transaction platforms. From completing your KYC to setting up your folios and nominations, we take care of the operational detail so you can focus on your goals.',
    points: [
      'KYC, FATCA and nomination assistance',
      'Scheme selection support matched to your risk profile',
      'Transactions placed in your name, with payments made directly to the mutual fund',
      'Clear explanation of riskometer, expense ratio and exit load before you invest',
    ],
  },
  {
    id: 'sip',
    icon: Repeat,
    title: 'SIP Investments',
    summary: 'Invest a fixed amount every month and build the habit of disciplined investing.',
    description:
      'A Systematic Investment Plan lets you invest a fixed amount at regular intervals. It spreads your purchases across market cycles and makes investing a routine. We help you choose a comfortable amount, set up auto-debit mandates and review your SIPs as your income grows.',
    points: [
      'SIPs starting from small monthly amounts (scheme minimums apply)',
      'Auto-debit mandate setup via NACH / UPI AutoPay',
      'Step-up SIP options that rise with your income',
      'Pause, modify or stop SIPs with guidance on the implications',
    ],
    calculator: { label: 'Try the SIP calculator', to: '/calculators#sip' },
  },
  {
    id: 'lump-sum',
    icon: PiggyBank,
    title: 'Lump Sum Investments',
    summary: 'Put a bonus, maturity amount or windfall to work thoughtfully.',
    description:
      'When you have a larger amount to invest, such as a bonus, an FD maturity or proceeds from a sale, we help you decide how to deploy it. Depending on your timeline and comfort with volatility, that may be a one-time investment or a staggered approach using a Systematic Transfer Plan (STP).',
    points: [
      'Assessment of time horizon and liquidity needs',
      'Option to stagger entry through STP',
      'Allocation across fund categories aligned to your risk profile',
      'Clear view of applicable exit loads and lock-ins',
    ],
    calculator: { label: 'Try the lump sum calculator', to: '/calculators#lumpsum' },
  },
  {
    id: 'goal-based',
    icon: Target,
    title: 'Goal-Based Investment Planning',
    summary: 'Link every investment to a purpose: a home, a car, a sabbatical.',
    description:
      'Investing works best when it has a purpose. We help you put a number and a date on each goal, account for inflation, and map a monthly investment to it, so you always know what you are investing for and whether you are on track.',
    points: [
      'Goal costing with inflation adjustment',
      'Separate investment buckets for short, medium and long-term goals',
      'Periodic progress check-ins',
      'Rebalancing support as goals approach',
    ],
    calculator: { label: 'Try the goal planner', to: '/calculators#goal' },
  },
  {
    id: 'retirement',
    icon: Sunset,
    title: 'Retirement Planning',
    summary: 'Build a corpus for the years when work becomes optional.',
    description:
      'Retirement is often the largest and longest goal you will plan for. We help you estimate the corpus you may need, start investing toward it early, and gradually shift toward lower-volatility options as retirement approaches. Closer to retirement, we can discuss Systematic Withdrawal Plans (SWP) for a regular cash flow.',
    points: [
      'Corpus estimation based on expenses and inflation',
      'Long-term SIP strategy with periodic step-ups',
      'Gradual de-risking as retirement nears',
      'SWP setup for post-retirement cash flow',
    ],
    calculator: { label: 'Estimate with the goal planner', to: '/calculators#goal' },
  },
  {
    id: 'child-education',
    icon: GraduationCap,
    title: 'Child Education Planning',
    summary: 'Prepare for rising education costs well before admission day.',
    description:
      'Education costs in India have historically risen faster than general inflation. Starting early gives your investments more time to compound. We help you estimate future costs for school, graduation or post-graduation, and set up dedicated investments for each milestone.',
    points: [
      'Milestone-wise cost estimates (school, UG, PG, overseas study)',
      'Dedicated SIPs per child and per milestone',
      'Shift toward stability in the final years before the goal',
      'Nominee and guardian documentation for minor folios',
    ],
    calculator: { label: 'Plan with the goal calculator', to: '/calculators#goal' },
  },
  {
    id: 'portfolio-review',
    icon: RefreshCw,
    title: 'Portfolio Review & Investment Support',
    summary: 'A clear, consolidated view of what you own and why you own it.',
    description:
      'Many investors accumulate schemes over the years without a clear structure. We review your existing mutual fund holdings using your Consolidated Account Statement, flag overlaps and gaps relative to your goals, and support you with ongoing service: statements, address and bank changes, nominations and transmission.',
    points: [
      'Holdings review using your CAS',
      'Identification of overlap and concentration',
      'Alignment check against goals and risk profile',
      'Ongoing service requests and documentation support',
    ],
  },
];

export const whyChooseUs: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Briefcase,
    title: 'Transparent by design',
    body: 'We are a Mutual Fund Distributor and say so clearly. We earn commission from AMCs and disclose it. You will always know how we are paid.',
  },
  {
    icon: Target,
    title: 'Goals before products',
    body: 'Conversations start with what you want to achieve and how much risk you can take, not with a scheme to sell.',
  },
  {
    icon: GraduationCap,
    title: 'Education first',
    body: 'We explain riskometers, expense ratios and exit loads in plain language, so every decision you make is an informed one.',
  },
  {
    icon: RefreshCw,
    title: 'With you for the long term',
    body: 'Investing is a multi-year journey. We stay available for reviews, service requests and the questions that come up along the way.',
  },
];

export const journeySteps = [
  {
    title: 'Understand',
    body: 'A conversation about your goals, timelines, existing investments and comfort with risk.',
  },
  {
    title: 'Plan',
    body: 'We map each goal to a suitable investment approach and explain the risks and costs involved.',
  },
  {
    title: 'Invest',
    body: 'KYC, paperwork and transactions handled smoothly, with every investment held in your own name.',
  },
  {
    title: 'Review',
    body: 'Periodic check-ins to track progress, rebalance when needed and adapt as your life changes.',
  },
];
