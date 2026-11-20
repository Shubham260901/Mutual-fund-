/**
 * ───────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION: the single place to edit business details.
 * ───────────────────────────────────────────────────────────────────────────
 *  Every value wrapped in [square brackets] or marked TODO is a PLACEHOLDER.
 *  Replace it with verified information before the site goes live.
 *
 *  Do NOT add registrations, awards, AUM, client counts, years of experience
 *  or testimonials unless they are true and can be documented.
 *  `isPlaceholder()` below flags any value still in [brackets] so the UI can
 *  highlight it during review.
 */

export const site = {
  /** Brand name shown in the logo, page titles and footer. */
  name: 'Deepak Gedam',
  shortName: 'Deepak Gedam',
  tagline: 'Mutual Fund Distributor',
  /** Legal entity name exactly as registered with AMFI. */
  legalName: '[Registered Business Name as per AMFI]',
  url: 'https://www.example.com',

  /** The principal distributor / founder. */
  distributor: {
    name: 'Deepak Gedam',
    title: 'AMFI-registered Mutual Fund Distributor',
    bio: '[Add a short, factual biography: background, qualifications and why you started the practice. Avoid superlatives you cannot substantiate.]',
    /** Path to a photo in /public, e.g. '/images/founder.jpg'. Leave empty to show initials. */
    photo: '/images/deepak-gedam.jpg',
  },

  /** Regulatory credentials, shown in the footer, About page and disclosures. */
  credentials: {
    arn: 'ARN-[XXXXXX]',
    arnValidTill: '[DD/MM/YYYY]',
    euin: 'E[XXXXXX]',
    nism: 'NISM Series V-A: Mutual Fund Distributors [Certificate No. / validity]',
    category: 'AMFI-registered Mutual Fund Distributor',
    gstin: '[GSTIN, if applicable]',
    experience: '[X] years in mutual fund distribution',
  },

  contact: {
    phone: '+91 [XXXXX XXXXX]',
    /** Digits only, with country code, used for tel: and WhatsApp links. */
    phoneE164: '910000000000',
    whatsapp: '919300658007',
    email: 'hello@example.com',
    grievanceEmail: 'grievance@example.com',
    grievanceOfficer: '[Grievance Officer Name]',
    hours: 'Mon – Sat, 10:00 am – 6:30 pm IST',
    address: {
      line1: '[Office No., Building Name]',
      line2: '[Street, Area]',
      city: '[City]',
      state: '[State]',
      pin: '[PIN Code]',
    },
    /** Optional Google Maps link to your office. */
    mapUrl: '',
  },

  /**
   * Form delivery. Set `endpoint` to a form backend (Formspree, Web3Forms,
   * Getform, your own API) that accepts a JSON POST. If it is empty, the form
   * validates and then opens the visitor's email app with a pre-filled draft.
   */
  forms: {
    endpoint: '/api/enquiry',
    /** Optional scheduling link (Calendly, Cal.com, Zoho Bookings). Shown on the Book a Consultation tab. */
    bookingUrl: '',
  },

  social: {
    linkedin: '',
    youtube: '',
    instagram: '',
  },
} as const;

export const nav = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Calculators', to: '/calculators' },
  { label: 'Learn', to: '/education' },
  { label: 'Contact', to: '/contact' },
] as const;

export const isPlaceholder = (value: string) => /\[[^\]]+\]/.test(value);

export const fullAddress = () => {
  const a = site.contact.address;
  return [a.line1, a.line2, `${a.city}, ${a.state} ${a.pin}`].join(', ');
};

export const whatsappLink = (message = `Hello, I would like to know more about investing in mutual funds.`) =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
