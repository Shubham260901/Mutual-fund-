import { motion } from 'framer-motion';
import { CalendarCheck, Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { EnquiryForm, type FormMode } from '@/components/forms/EnquiryForm';
import { Button } from '@/components/ui/Button';
import { IconBadge } from '@/components/ui/IconBadge';
import { PageHero } from '@/components/ui/PageHero';
import { Value } from '@/components/ui/Placeholder';
import { Reveal } from '@/components/ui/Reveal';
import { fullAddress, site, whatsappLink } from '@/config/site';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn } from '@/lib/cn';

const modes: { id: FormMode; label: string; icon: typeof Send }[] = [
  { id: 'enquiry', label: 'Send an enquiry', icon: Send },
  { id: 'consultation', label: 'Book a consultation', icon: CalendarCheck },
];

export default function Contact() {
  usePageMeta(
    'Contact us',
    `Get in touch with ${site.name}. Send an enquiry, book a consultation or chat with us on WhatsApp.`,
    '/contact',
  );
  const [params, setParams] = useSearchParams();
  const mode: FormMode = params.get('type') === 'consultation' ? 'consultation' : 'enquiry';
  const topic = params.get('topic') ?? '';

  const setMode = (m: FormMode) => {
    const next = new URLSearchParams(params);
    next.set('type', m);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const channels = [
    {
      icon: Phone,
      title: 'Call us',
      value: site.contact.phone,
      href: `tel:+${site.contact.phoneE164}`,
      cta: 'Call now',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: 'Quick questions, answered on chat',
      href: whatsappLink(),
      cta: 'Start a chat',
    },
    {
      icon: Mail,
      title: 'Email',
      value: site.contact.email,
      href: `mailto:${site.contact.email}`,
      cta: 'Write to us',
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Let’s talk about your goals."
        description="Send us a message, book a no-obligation consultation, or reach us directly. We usually respond within one working day."
      />

      <section className="section pt-12 sm:pt-16">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7" id="form">
            <div className="card p-6 sm:p-10">
              <div role="tablist" aria-label="Contact options" className="grid grid-cols-2 gap-1 rounded-2xl bg-mist/70 p-1.5">
                {modes.map((m) => {
                  const selected = m.id === mode;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setMode(m.id)}
                      className={cn(
                        'relative flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-colors',
                        selected ? 'text-navy-900' : 'text-ink-muted hover:text-navy-900',
                      )}
                    >
                      {selected && (
                        <motion.span
                          layoutId="contact-tab"
                          className="absolute inset-0 rounded-xl bg-white shadow-soft"
                          transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        />
                      )}
                      <m.icon className="relative h-4 w-4" aria-hidden />
                      <span className="relative">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold">{mode === 'consultation' ? 'Request a consultation' : 'Send us a message'}</h2>
                <p className="mt-2 text-ink-muted">
                  {mode === 'consultation'
                    ? 'Choose a topic and a preferred slot. We will confirm the time with you by phone or email.'
                    : 'Tell us a little about what you are looking for and we will get back to you.'}
                </p>
                {mode === 'consultation' && site.forms.bookingUrl && (
                  <p className="mt-4 text-sm">
                    Prefer to pick a slot yourself?{' '}
                    <a href={site.forms.bookingUrl} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1 font-semibold text-navy-900">
                      Open our booking calendar <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </p>
                )}
              </div>

              <div className="mt-8">
                {/* Keyed by mode so switching tabs resets the form cleanly. */}
                <EnquiryForm key={mode} mode={mode} defaultTopic={topic} />
              </div>
            </div>
          </Reveal>

          <div className="space-y-5 lg:col-span-5">
            {channels.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06}>
                <a
                  href={c.href}
                  {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center gap-5 rounded-3xl border border-navy-900/[0.07] bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <IconBadge icon={c.icon} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-bold text-navy-900">{c.title}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-muted">
                      <Value>{c.value}</Value>
                    </p>
                  </div>
                  <span className="hidden text-sm font-semibold text-emerald-700 transition-transform group-hover:translate-x-0.5 sm:block">
                    {c.cta} →
                  </span>
                </a>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <div className="rounded-3xl bg-navy-900 bg-navy-radial p-7 text-white">
                <div className="flex gap-4">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-300" aria-hidden />
                  <div>
                    <p className="font-display text-base font-bold">Office</p>
                    <address className="mt-1 text-sm not-italic leading-relaxed text-navy-100/80">
                      <Value>{site.legalName}</Value>
                      <br />
                      <Value>{fullAddress()}</Value>
                    </address>
                    {site.contact.mapUrl && (
                      <a href={site.contact.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-300 hover:text-gold-200">
                        Get directions <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex gap-4 border-t border-white/10 pt-6">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-gold-300" aria-hidden />
                  <div>
                    <p className="font-display text-base font-bold">Hours</p>
                    <p className="mt-1 text-sm text-navy-100/80">{site.contact.hours}</p>
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <Button href={whatsappLink()} variant="light" leadingIcon={<MessageCircle className="h-4 w-4" />}>
                    WhatsApp
                  </Button>
                  <Button onClick={() => setMode('consultation')} variant="outline-light" leadingIcon={<CalendarCheck className="h-4 w-4" />}>
                    Book
                  </Button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="rounded-3xl border border-navy-900/[0.07] bg-white p-7">
                <p className="font-display text-base font-bold text-navy-900">What to expect from a consultation</p>
                <ol className="mt-4 space-y-3 text-sm text-ink-muted">
                  {[
                    'A 30–45 minute conversation about your goals and current situation',
                    'A plain-language explanation of options suited to your risk profile',
                    'Full clarity on costs, risks and how we are paid',
                    'No obligation to invest',
                  ].map((t, i) => (
                    <li key={t} className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[0.6875rem] font-bold text-emerald-800">
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
