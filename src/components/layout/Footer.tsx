import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fullAddress, site } from '@/config/site';
import { STANDARD_RISK_WARNING, shortFooterDisclaimer, officialLinks } from '@/content/disclosures';
import { Value } from '../ui/Placeholder';
import { Logo } from './Logo';

const columns = [
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Our services', to: '/services' },
      { label: 'Contact', to: '/contact' },
      { label: 'Book a consultation', to: '/contact?type=consultation' },
    ],
  },
  {
    title: 'Tools & learning',
    links: [
      { label: 'SIP calculator', to: '/calculators#sip' },
      { label: 'Goal planner', to: '/calculators#goal' },
      { label: 'Mutual fund basics', to: '/education' },
      { label: 'Articles', to: '/education#articles' },
    ],
  },
  {
    title: 'Investor information',
    links: [
      { label: 'Disclosures', to: '/disclosures' },
      { label: 'Commission disclosure', to: '/disclosures#commission' },
      { label: 'Grievance redressal', to: '/disclosures#grievance' },
      { label: 'Privacy', to: '/disclosures#privacy' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-navy-950 text-navy-100/80">
      {/* Standard risk warning: kept prominent, as required for MF communication. */}
      <div className="border-b border-white/[0.07] bg-navy-900">
        <div className="container-page py-5">
          <p className="text-center text-sm font-medium text-white">{STANDARD_RISK_WARNING}</p>
        </div>
      </div>

      <div className="container-page grid gap-14 py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
        <div className="lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-navy-100/70">
            Disciplined, goal-based mutual fund investing for individuals and families, with transparent disclosures at every step.
          </p>
          <dl className="mt-8 grid max-w-sm grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.07] text-sm">
            {[
              ['AMFI ARN', site.credentials.arn],
              ['EUIN', site.credentials.euin],
              ['ARN valid till', site.credentials.arnValidTill],
              ['Registration', 'Mutual Fund Distributor'],
            ].map(([k, v]) => (
              <div key={k} className="bg-navy-950 p-4">
                <dt className="text-xs uppercase tracking-wider text-navy-100/50">{k}</dt>
                <dd className="mt-1 font-medium text-white">
                  <Value>{v}</Value>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-gold-300">{col.title}</h2>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-gold-300">Get in touch</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
              <a href={`tel:+${site.contact.phoneE164}`} className="hover:text-white">
                <Value>{site.contact.phone}</Value>
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
              <a href={`mailto:${site.contact.email}`} className="break-all hover:text-white">
                {site.contact.email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
              <address className="not-italic leading-relaxed">
                <Value>{fullAddress()}</Value>
              </address>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
              <span>{site.contact.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.07]">
        <div className="container-page space-y-6 py-10 text-xs leading-relaxed text-navy-100/60">
          <p>{shortFooterDisclaimer}</p>
          <p>
            Past performance may or may not be sustained in future. Calculators on this site show hypothetical illustrations only
            and are not a guarantee of returns. Investors can also invest through Direct Plans, which carry a lower expense ratio
            as no distributor commission is paid.{' '}
            <Link to="/disclosures" className="font-medium text-white underline underline-offset-4 hover:text-gold-300">
              Read full disclosures
            </Link>
            .
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {officialLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                  {l.label}
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col justify-between gap-2 border-t border-white/[0.07] pt-6 sm:flex-row">
            <p>
              © {year} <Value>{site.legalName}</Value>. All rights reserved.
            </p>
            <p>
              {site.credentials.category} · <Value>{site.credentials.arn}</Value>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
