# Mutual Fund Distributor Website

A production-ready marketing and lead-generation website for an **AMFI-registered Mutual Fund Distributor (MFD)** in India,
with a built-in **admin panel** for managing enquiries, the photo gallery and the site's content.
Built with React, TypeScript, Tailwind CSS and Framer Motion (frontend) and Express + SQLite (backend).

## Project layout

```
.
├── frontend/      React + Vite + Tailwind site, including the admin panel UI (src/admin)
├── backend/       Express + SQLite API: enquiries, gallery, editable content, admin auth
├── docs/          design-system.md
└── package.json   convenience scripts that run both
```

The two halves are independent packages with their own `package.json`. The frontend talks to the backend only through
`/api/*` and `/uploads/*`. In development Vite proxies those to the backend; in production the backend serves the built
frontend itself.

## Run locally

Requires **Node.js 22.5+** (the backend uses the built-in `node:sqlite`; tested on Node 24).

```bash
npm install                    # root: installs the script runner
npm run install:all            # installs frontend and backend dependencies
cp backend/.env.example backend/.env   # then set ADMIN_PASSWORD (and SESSION_SECRET)
npm run dev                    # web http://localhost:5173  +  api http://localhost:3001
```

Open **http://localhost:5173/admin** and sign in with your `ADMIN_PASSWORD`.

| Command (from the root) | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run dev`           | Frontend (hot reload) and backend (auto-restart) together           |
| `npm run build`         | Type-check and build the frontend to `frontend/dist`                |
| `npm start`             | Run the backend, which also serves `frontend/dist` (production)     |
| `npm test`              | Frontend (calculator maths, content layer) and backend (API) tests  |
| `npm run typecheck`     | TypeScript for both packages                                        |

## Admin panel (`/admin`)

One admin signs in with the `ADMIN_PASSWORD` from `backend/.env`. Sessions are signed, HttpOnly cookies (8 hours), login
attempts are rate-limited, and every change is recorded in the activity log.

| Section      | What you can do                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| Dashboard    | Totals, weekly trend, popular consultation topics, upcoming consultations, which content has been edited  |
| Enquiries    | Search and filter, set status, private notes, call / WhatsApp / email shortcuts, delete, CSV export       |
| Activity log | Who did what and when (sign-ins, edits, deletions)                                                        |
| Articles     | Write and edit education articles with a block editor, drafts, ordering, per-article SEO                  |
| FAQs         | Home-page and Learn-page FAQs: add, edit, hide, reorder                                                   |
| Services     | Service cards, "why choose us" points and "how it works" steps                                            |
| Gallery      | Upload (several at once, drag and drop), **change photo**, captions, alt text, categories, hide, reorder, delete |
| Settings     | Business name, contact details, address, WhatsApp, bio and photo, booking and social links                |
| SEO          | Title and description per page (article SEO lives inside each article)                                    |

**How editing works.** The site ships with its content in code (`frontend/src/content/*`, `config/site.ts`). The first time
you save a section it is stored in the database and from then on overrides the code version. "Reset to built-in content"
deletes the override. Until a section is edited nothing changes, and if the backend is unreachable the public site simply
shows the built-in content.

**Deliberately not editable in the panel (compliance):** the Disclosures page, the risk warning, ARN, EUIN, ARN validity,
NISM certificate, legal name and grievance officer. They stay in `config/site.ts` and `content/disclosures.ts` so they
change only after review. The backend rejects these fields even if someone sends them.

### Using the gallery on a page

```tsx
import { useGallery } from '@/lib/gallery';

const { photos, loading, error } = useGallery(); // visible photos, in the admin's order
// photos[i] = { id, url, caption, alt, category }
// <img src={photo.url} alt={photo.alt || photo.caption} />
```

### Backend notes

- Data lives in `backend/data/` (`site.db` and `uploads/`). It is git-ignored: **back this folder up** and keep it on a
  persistent disk in production. Set `DATA_DIR` to move it.
- Uploads accept JPEG, PNG and WebP up to 8 MB. They are verified by their file bytes (not the label) and stored under
  random names. The admin UI shrinks large photos before upload.
- Set `TRUST_PROXY=1` behind a reverse proxy or CDN (Render, Railway, Nginx, Cloudflare) so rate limiting sees real visitor
  IPs and cookies are marked Secure over HTTPS. Always serve the admin over HTTPS.
- `/sitemap.xml` is generated by the backend from the live article list.
- Optional email alert for every enquiry through Resend: set `RESEND_API_KEY` and `ENQUIRY_TO_EMAIL`.
- API: public `POST /api/enquiry`, `GET /api/gallery`, `GET /api/content`. Everything under `/api/admin` needs the session.

## Before going live: checklist

Regulatory details live in **two files**. Everything else can be changed in the admin panel. In development, any value still
in `[square brackets]` is shown with a dashed gold underline so nothing unverified ships unnoticed.

1. **`frontend/src/config/site.ts`**: business name, legal name, ARN, EUIN, ARN validity, NISM certificate, contact details, address, WhatsApp number, grievance officer, distributor bio and photo. (Contact details, bio and photo can then be maintained in Admin → Settings.)
   - The site is branded for **Deepak Gedam**. If you change the name, also update the `<title>`/meta tags in `frontend/index.html`.
2. **`frontend/src/content/disclosures.ts`**: all regulatory and risk wording. Have it reviewed against current SEBI/AMFI requirements (AMFI Code of Conduct, circulars on MFD communication and websites).
3. **Admin password**: set a long, unique `ADMIN_PASSWORD` and a random `SESSION_SECRET` in `backend/.env`.
4. **Forms**: enquiries are saved by the backend (`forms.endpoint` is `/api/enquiry`) and appear in Admin → Enquiries. If you deploy the frontend alone as a static site, point `forms.endpoint` at another JSON form service (Formspree, Web3Forms…); with it empty, forms fall back to the visitor's email app. Set the booking link (Calendly, Cal.com) in Admin → Settings.
5. **Domain**: replace `https://www.example.com` in `site.ts` (or Admin → Settings → Website address) and in `frontend/public/robots.txt`. The backend generates `sitemap.xml` itself.
6. **Disclosures page**: update "Last reviewed" in `frontend/src/pages/Disclosures.tsx`.

### Compliance guardrails built in

- The business is identified as a Mutual Fund Distributor everywhere; it is never called an "adviser", "IFA" or "wealth manager".
- No invented registrations, AUM, client counts, awards, experience or testimonials. Trust signals are structural facts (ARN, money flows to the AMC, commission disclosure, grievance route).
- No scheme names, AMC logos, performance figures or rankings.
- The standard risk warning appears on every page (footer) and in articles.
- Commission and Direct-vs-Regular-plan disclosures are on the Services, Disclosures and FAQ sections.
- Every calculator carries a "hypothetical, not guaranteed" disclaimer, and results are labelled as projections.
- The hero visual is labelled "Example plan · Illustration" and contains no real data.
- Forms collect explicit consent to be contacted.
- Regulatory text and credentials cannot be edited from the admin panel.

> Do not add testimonials or scheme-specific promotional content without checking the applicable AMFI/SEBI rules and AMC approvals. This applies to anything you publish through the admin panel too.

## Frontend structure (`frontend/`)

```
src/
├── config/site.ts            ← business details & credentials
├── content/                  ← all copy, kept out of components
│   ├── disclosures.ts        ← regulatory text (single source of truth)
│   ├── services.ts           ← services, "why us", journey steps
│   ├── faqs.ts
│   ├── articles.ts           ← education articles (structured blocks)
│   └── runtime.ts            ← applies admin-edited content before the first render
├── lib/
│   ├── finance.ts            ← SIP / lump sum / step-up / goal maths (pure)
│   ├── finance.test.ts       ← unit tests
│   ├── format.ts             ← ₹ formatting (Indian grouping, lakh/crore)
│   ├── gallery.ts            ← useGallery() for the public gallery page
│   └── submitEnquiry.ts      ← form delivery (API, endpoint or mailto fallback)
├── components/
│   ├── layout/               ← Navbar, Footer, Layout (scroll + WhatsApp FAB)
│   ├── ui/                   ← Button, Reveal, SectionHeading, Accordion, PageHero…
│   ├── calculators/          ← SliderInput, GrowthChart, ResultSummary, 4 calculators
│   ├── home/                 ← homepage sections
│   ├── education/Riskometer.tsx
│   └── forms/EnquiryForm.tsx ← enquiry + consultation booking
├── admin/                    ← the admin panel (lazy-loaded at /admin)
├── pages/                    ← one file per route (lazy-loaded except Home)
└── hooks/usePageMeta.ts      ← per-page title, description, canonical (honours admin SEO)
```

## Backend structure (`backend/src/`)

```
app.ts        routes: public API, admin API, static hosting of the built frontend
content.ts    validation of every editable document (the single gate for what can be stored)
db.ts         SQLite schema and queries
auth.ts       sessions, password check, rate limiting
images.ts     upload checks and storage
notify.ts     optional email alerts
index.ts      startup and configuration
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
| `/admin`             | Admin panel (not indexed; not linked from the site)   |

## Calculators

All maths is in `frontend/src/lib/finance.ts` and covered by unit tests.

- **SIP**: annuity-due (instalment at the start of each month), monthly rate = annual ÷ 12.
- **Lump sum**: annual compounding.
- **Step-up SIP**: instalment rises by the step-up % at the start of each year; simulated monthly.
- **Goal planner**: inflates today's cost, nets off growth of existing savings, and solves for the SIP (and the one-time equivalent).

Inputs are validated: typed values outside the allowed range show an inline error and are not applied, and they snap back on blur. Charts have hover/touch/keyboard crosshairs and a "View as table" option for accessibility.

## Adding content

Use the admin panel (Articles, FAQs, Services). To change the **built-in** defaults in code instead:

- **Article**: add an object to `frontend/src/content/articles.ts` (blocks: `p`, `h2`, `h3`, `ul`, `callout`).
- **FAQ**: add to `frontend/src/content/faqs.ts`.
- **Service**: add to `frontend/src/content/services.ts`. It appears on Home, Services and as a consultation topic automatically.

## Deployment

The admin panel, enquiries and gallery need the backend, so deploy to a host that runs a Node server with a **persistent
disk** (a VPS, Render, Railway or Fly): `npm run build`, then `npm start`, with the environment variables from
`backend/.env.example`.

Vercel and Netlify have no persistent disk, so they only suit the frontend on its own (SPA fallbacks are included in
`frontend/public/_redirects` and `frontend/vercel.json`). In that setup the admin features are unavailable and the site
shows its built-in content.

See [`docs/design-system.md`](docs/design-system.md) for colours, type and component rules.
