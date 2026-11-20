# Mutual Fund Distributor Website

A production-ready marketing and lead-generation website for an **AMFI-registered Mutual Fund Distributor (MFD)** in India.
Built with React, TypeScript, Tailwind CSS, Framer Motion and Lucide icons.

## Run locally

Requires **Node.js 18+** (tested on Node 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Start the dev server with hot reload            |
| `npm run build`     | Type-check and build to `dist/`                 |
| `npm run preview`   | Serve the production build locally              |
| `npm test`          | Run calculator maths unit tests (Vitest)        |
| `npm run typecheck` | TypeScript only                                 |

## Before going live: checklist

Everything you must personalise lives in **two files**. In development, any value still in `[square brackets]` is shown with a dashed gold underline so nothing unverified ships unnoticed.

1. **`src/config/site.ts`**: business name, legal name, ARN, EUIN, ARN validity, NISM certificate, contact details, address, WhatsApp number, grievance officer, distributor bio and photo.
   - The site is branded for **Deepak Gedam**. If you change the name, also update the `<title>`/meta tags in `index.html`.
2. **`src/content/disclosures.ts`**: all regulatory and risk wording. Have it reviewed against current SEBI/AMFI requirements (AMFI Code of Conduct, circulars on MFD communication and websites).
3. **Forms**: set `forms.endpoint` in `site.ts` to a form backend that accepts a JSON POST (Formspree, Web3Forms, Getform or your own API). Until then, forms validate and then open the visitor's email app with a pre-filled draft. Optionally set `forms.bookingUrl` (Calendly or Cal.com).
4. **Domain**: replace `https://www.example.com` in `site.ts`, `public/robots.txt` and `public/sitemap.xml`.
5. **Disclosures page**: update "Last reviewed" in `src/pages/Disclosures.tsx`.

### Compliance guardrails built in

- The business is identified as a Mutual Fund Distributor everywhere; it is never called an "adviser", "IFA" or "wealth manager".
- No invented registrations, AUM, client counts, awards, experience or testimonials. Trust signals are structural facts (ARN, money flows to the AMC, commission disclosure, grievance route).
- No scheme names, AMC logos, performance figures or rankings.
- The standard risk warning appears on every page (footer) and in articles.
- Commission and Direct-vs-Regular-plan disclosures are on the Services, Disclosures and FAQ sections.
- Every calculator carries a "hypothetical, not guaranteed" disclaimer, and results are labelled as projections.
- The hero visual is labelled "Example plan · Illustration" and contains no real data.
- Forms collect explicit consent to be contacted.

> Do not add testimonials or scheme-specific promotional content without checking the applicable AMFI/SEBI rules and AMC approvals.

## Project structure

```
src/
├── config/site.ts            ← business details & credentials (edit me)
├── content/                  ← all copy, kept out of components
│   ├── disclosures.ts        ← regulatory text (single source of truth)
│   ├── services.ts           ← services, "why us", journey steps
│   ├── faqs.ts
│   └── articles.ts           ← education articles (structured blocks)
├── lib/
│   ├── finance.ts            ← SIP / lump sum / step-up / goal maths (pure)
│   ├── finance.test.ts       ← unit tests
│   ├── format.ts             ← ₹ formatting (Indian grouping, lakh/crore)
│   └── submitEnquiry.ts      ← form delivery (endpoint or mailto fallback)
├── components/
│   ├── layout/               ← Navbar, Footer, Layout (scroll + WhatsApp FAB)
│   ├── ui/                   ← Button, Reveal, SectionHeading, Accordion, PageHero…
│   ├── calculators/          ← SliderInput, GrowthChart, ResultSummary, 4 calculators
│   ├── home/                 ← homepage sections
│   ├── education/Riskometer.tsx
│   └── forms/EnquiryForm.tsx ← enquiry + consultation booking
├── pages/                    ← one file per route (lazy-loaded except Home)
└── hooks/usePageMeta.ts      ← per-page title, description, canonical
```

### Routes

| Path                 | Page                                                  |
| -------------------- | ----------------------------------------------------- |
| `/`                  | Home                                                  |
| `/about`             | About us                                              |
| `/services`          | Services (anchors: `#sip`, `#retirement`, …)          |
| `/calculators`       | Calculators (`#sip`, `#lumpsum`, `#goal`, `#stepup`)  |
| `/education`         | Investor education                                    |
| `/education/:slug`   | Article                                               |
| `/contact`           | Contact (`?type=consultation&topic=…`)                |
| `/disclosures`       | Regulatory disclosures                                |

## Calculators

All maths is in `src/lib/finance.ts` and covered by unit tests.

- **SIP**: annuity-due (instalment at the start of each month), monthly rate = annual ÷ 12.
- **Lump sum**: annual compounding.
- **Step-up SIP**: instalment rises by the step-up % at the start of each year; simulated monthly.
- **Goal planner**: inflates today's cost, nets off growth of existing savings, and solves for the SIP (and the one-time equivalent).

Inputs are validated: typed values outside the allowed range show an inline error and are not applied, and they snap back on blur. Charts have hover/touch/keyboard crosshairs and a "View as table" option for accessibility.

## Adding content

- **Article**: add an object to `src/content/articles.ts` (blocks: `p`, `h2`, `h3`, `ul`, `callout`), then add the URL to `public/sitemap.xml`.
- **FAQ**: add to `src/content/faqs.ts`.
- **Service**: add to `src/content/services.ts`. It appears on Home, Services and as a consultation topic automatically.

## Deployment

The output in `dist/` is a static site. SPA fallbacks are included for **Netlify** (`public/_redirects`) and **Vercel** (`vercel.json`). On other hosts, rewrite all paths to `/index.html`.

See [`docs/design-system.md`](docs/design-system.md) for colours, type and component rules.
