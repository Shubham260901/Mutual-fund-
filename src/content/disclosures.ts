import { site } from '@/config/site';

/**
 * Regulatory and risk disclosures, kept in one file so a compliance reviewer
 * can check and update all wording in one place.
 *
 * Review this file against current SEBI and AMFI requirements (including the
 * AMFI Code of Conduct for Intermediaries and any circulars on MFD
 * advertisements and websites) before publishing.
 */

export const STANDARD_RISK_WARNING =
  'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.';

export const shortFooterDisclaimer = `${site.name} is an ${site.credentials.category} (${site.credentials.arn}). We distribute mutual fund schemes and earn commission from Asset Management Companies. We are not a SEBI-registered Investment Adviser and do not charge advisory fees.`;

export const calculatorDisclaimer = [
  'Calculator results are hypothetical illustrations based on the inputs you choose. They are not a guarantee, a forecast or an indication of the returns of any mutual fund scheme.',
  'Mutual fund returns are market-linked and can be negative. The assumed rate of return is held constant here for simplicity; actual returns vary year to year.',
  'Results do not account for exit loads, taxes, expense-ratio changes or inflation unless stated. Please consult your distributor and read the scheme documents before investing.',
];

export interface DisclosureSection {
  id: string;
  title: string;
  body: string[];
}

export const disclosureSections: DisclosureSection[] = [
  {
    id: 'status',
    title: 'Who we are',
    body: [
      `${site.legalName}, operating as ${site.name}, is an ${site.credentials.category} holding AMFI Registration Number (ARN) ${site.credentials.arn}, valid till ${site.credentials.arnValidTill}. Employee Unique Identification Number (EUIN): ${site.credentials.euin}.`,
      'We act as a distributor of mutual fund schemes. We are not registered with SEBI as an Investment Adviser or Research Analyst. Any guidance we give is incidental to the distribution of mutual fund products.',
    ],
  },
  {
    id: 'commission',
    title: 'Commission disclosure',
    body: [
      'As a Mutual Fund Distributor, we receive trail commission from the Asset Management Companies (AMCs) whose schemes you invest in through us. The commission is built into the expense ratio of the Regular Plan of the scheme. We do not charge you a separate fee for distribution services.',
      'Commission rates vary across AMCs and schemes. Details of the commission we receive on your investments are available on request, and are also shown in your Consolidated Account Statement (CAS).',
      'Every mutual fund scheme also offers a Direct Plan, which has a lower expense ratio because no distributor commission is paid. Investors can invest in Direct Plans directly with the AMC or through other platforms.',
    ],
  },
  {
    id: 'risk',
    title: 'Risk factors',
    body: [
      STANDARD_RISK_WARNING,
      'Past performance may or may not be sustained in future and is not a guarantee of future returns. The Net Asset Value (NAV) of a scheme can go up or down depending on the factors and forces affecting securities markets.',
      'Each scheme carries a Riskometer that indicates its level of risk, ranging from Low to Very High. Please review the Riskometer, Scheme Information Document (SID), Statement of Additional Information (SAI) and Key Information Memorandum (KIM) before investing.',
    ],
  },
  {
    id: 'calculators',
    title: 'Calculators and illustrations',
    body: calculatorDisclaimer,
  },
  {
    id: 'content',
    title: 'Educational content',
    body: [
      'Articles and explainers on this website are for general investor education only. They do not consider your individual financial situation and are not a recommendation to buy, sell or hold any scheme.',
      'No scheme-specific performance, rankings or ratings are published on this website. Where AMC names, logos or scheme materials are used, they appear only with the approvals required under applicable guidelines.',
    ],
  },
  {
    id: 'money',
    title: 'How your money is handled',
    body: [
      'All investments are made in your name with the respective mutual fund. Payments go directly to the mutual fund or its authorised channels. We never accept cash or ask you to pay into a personal or business account for investment purposes.',
    ],
  },
  {
    id: 'grievance',
    title: 'Grievance redressal',
    body: [
      `For any complaint, please write to our Grievance Officer, ${site.contact.grievanceOfficer}, at ${site.contact.grievanceEmail}. We aim to acknowledge complaints within 2 working days and resolve them as quickly as possible.`,
      'If you are not satisfied with our response, you may approach the concerned AMC, lodge a complaint on SEBI SCORES (https://scores.sebi.gov.in), or use the Online Dispute Resolution (ODR) portal (https://smartodr.in).',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    body: [
      'Information you share through our forms is used only to respond to your enquiry and provide distribution services. We do not sell your data. You may ask us to correct or delete your information at any time by writing to us.',
    ],
  },
];

export const officialLinks = [
  { label: 'AMFI: verify a distributor ARN', href: 'https://www.amfiindia.com/locate-your-nearest-mutual-fund-distributor-details' },
  { label: 'SEBI SCORES: lodge a complaint', href: 'https://scores.sebi.gov.in' },
  { label: 'SMART ODR portal', href: 'https://smartodr.in' },
  { label: 'SEBI investor education', href: 'https://investor.sebi.gov.in' },
];
