import type { AccordionItem } from '@/components/ui/Accordion';

export const homeFaqs: AccordionItem[] = [
  {
    q: 'What does a Mutual Fund Distributor do?',
    a: 'A Mutual Fund Distributor (MFD) is registered with AMFI and helps investors invest in mutual fund schemes. We assist with KYC, scheme selection suited to your goals and risk profile, transactions and ongoing servicing. We are paid through commission from Asset Management Companies, which is included in the expense ratio of Regular Plans.',
  },
  {
    q: 'Do I pay you a fee?',
    a: 'No separate fee is charged for distribution services. We receive trail commission from AMCs on investments made through us in Regular Plans. Commission details are available on request and appear in your Consolidated Account Statement.',
  },
  {
    q: 'Is my money safe with you?',
    a: 'Your investments are held in your own name with the mutual fund, not with us. Payments go directly to the mutual fund through regulated channels. We never accept cash or ask you to transfer money to us for investment.',
  },
  {
    q: 'How much do I need to start a SIP?',
    a: 'Many schemes allow SIPs from relatively small monthly amounts; the exact minimum is set by each scheme and is stated in its documents. We recommend starting with an amount you can sustain comfortably and increasing it as your income grows.',
  },
  {
    q: 'Can mutual funds give guaranteed returns?',
    a: 'No. Mutual fund returns are market-linked and can go up or down, including below the amount invested. Anyone promising guaranteed returns from mutual funds is not following regulations.',
  },
  {
    q: 'How do I verify your registration?',
    a: 'You can verify any distributor’s ARN on the AMFI website using the “Locate Distributor” search. Our ARN is shown in the footer of every page.',
  },
];

export const educationFaqs: AccordionItem[] = [
  {
    q: 'What is NAV?',
    a: 'Net Asset Value is the per-unit value of a mutual fund scheme, calculated as the market value of its assets minus liabilities, divided by the number of units outstanding. NAV is declared at the end of each business day.',
  },
  {
    q: 'What is the difference between Direct and Regular plans?',
    a: 'Both plans invest in the same portfolio. A Regular Plan includes distributor commission in its expense ratio; a Direct Plan does not, so its expense ratio is lower. Investors who choose Regular Plans typically do so for the distributor’s guidance and service.',
  },
  {
    q: 'What is an expense ratio?',
    a: 'It is the annual fee charged by the fund to manage your money, expressed as a percentage of assets. It is deducted from the scheme’s assets daily and is already reflected in the NAV.',
  },
  {
    q: 'What is an exit load?',
    a: 'Some schemes charge a small fee if you redeem units within a specified period. The exit load, if any, is stated in the scheme documents and is meant to discourage short-term redemptions.',
  },
  {
    q: 'Can I stop my SIP at any time?',
    a: 'Yes, SIPs can usually be paused or cancelled. Units already purchased remain invested. Note that some schemes (such as ELSS) have lock-in periods, and exit loads may apply on redemption.',
  },
  {
    q: 'How are mutual funds taxed?',
    a: 'Taxation depends on the type of scheme, holding period and prevailing tax laws, which change from time to time. Please refer to the scheme documents and consult a tax professional for your specific situation.',
  },
];
