import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { services } from '@/content/services';
import { submitEnquiry, type SubmitResult } from '@/lib/submitEnquiry';
import { cn } from '@/lib/cn';
import { Button } from '../ui/Button';

export type FormMode = 'enquiry' | 'consultation';

interface Values {
  name: string;
  email: string;
  phone: string;
  message: string;
  topic: string;
  date: string;
  slot: string;
  meeting: string;
  consent: boolean;
  /** Honeypot: real visitors never see or fill this field. */
  company: string;
}

type Errors = Partial<Record<keyof Values, string>>;

const TOPICS = [...services.map((s) => s.title), 'Something else'];
const SLOTS = ['10:00 am – 12:00 pm', '12:00 pm – 2:00 pm', '2:00 pm – 4:00 pm', '4:00 pm – 6:00 pm'];
const MEETING = ['Phone call', 'Video call', 'In-person meeting'];

const empty: Values = {
  name: '',
  email: '',
  phone: '',
  message: '',
  topic: '',
  date: '',
  slot: '',
  meeting: MEETING[0],
  consent: false,
  company: '',
};

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  // Local date (not UTC) so the minimum is correct in IST at any hour.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function validate(v: Values, mode: FormMode): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  const digits = v.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) e.phone = 'Please enter a valid 10-digit Indian mobile number.';
  if (mode === 'enquiry' && v.message.trim().length < 10) e.message = 'Please tell us a little more (at least 10 characters).';
  if (mode === 'consultation') {
    if (!v.topic) e.topic = 'Please choose what you would like to discuss.';
    if (!v.date) e.date = 'Please choose a preferred date.';
    else if (v.date < tomorrow()) e.date = 'Please choose a date from tomorrow onwards.';
    if (!v.slot) e.slot = 'Please choose a preferred time.';
  }
  if (!v.consent) e.consent = 'Please confirm you agree to be contacted.';
  return e;
}

export function EnquiryForm({ mode, defaultTopic = '' }: { mode: FormMode; defaultTopic?: string }) {
  const uid = useId();
  const initial: Values = { ...empty, topic: TOPICS.includes(defaultTopic) ? defaultTopic : '' };
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [result, setResult] = useState<SubmitResult | null>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched) setErrors(validate(next, mode));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(values, mode);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    if (values.company) {
      // Bot filled the honeypot; pretend success.
      setStatus('done');
      return;
    }
    setStatus('submitting');
    const payload: Record<string, string> = {
      Name: values.name.trim(),
      Email: values.email.trim(),
      Phone: values.phone.trim(),
      ...(mode === 'consultation'
        ? { Topic: values.topic, 'Preferred date': values.date, 'Preferred time': values.slot, 'Meeting type': values.meeting }
        : {}),
      Message: values.message.trim(),
      'Consent to contact': 'Yes',
    };
    const res = await submitEnquiry(
      mode === 'consultation' ? `Consultation request: ${values.name.trim()}` : `Website enquiry: ${values.name.trim()}`,
      payload,
    );
    setResult(res);
    setStatus(res.ok ? 'done' : 'idle');
  };

  const field = (key: keyof Values) => ({
    id: `${uid}-${key}`,
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `${uid}-${key}-error` : undefined,
  });

  const FieldError = ({ k }: { k: keyof Values }) =>
    errors[k] ? (
      <p id={`${uid}-${k}-error`} className="field-error">
        {errors[k]}
      </p>
    ) : null;

  return (
    <AnimatePresence mode="wait">
      {status === 'done' ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-12 text-center"
          role="status"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h3 className="mt-6 text-2xl font-bold">
            {result?.ok && result.via === 'email' ? 'Your email is ready to send' : 'Thank you, we have received your request'}
          </h3>
          <p className="mt-3 max-w-md text-ink-muted">
            {result?.ok && result.via === 'email'
              ? 'We have opened your email app with your details filled in. Please press send to complete your request. If nothing opened, write to us directly or reach us on WhatsApp.'
              : mode === 'consultation'
                ? 'We will call or email you within one working day to confirm your consultation slot.'
                : 'We will get back to you within one working day.'}
          </p>
          <Button
            variant="secondary"
            className="mt-8"
            onClick={() => {
              setValues(initial);
              setErrors({});
              setTouched(false);
              setStatus('idle');
              setResult(null);
            }}
          >
            Send another request
          </Button>
        </motion.div>
      ) : (
        <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} noValidate onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor={`${uid}-name`}>
                Full name
              </label>
              <input className="field-input" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} {...field('name')} />
              <FieldError k="name" />
            </div>
            <div>
              <label className="field-label" htmlFor={`${uid}-email`}>
                Email
              </label>
              <input
                className="field-input"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                {...field('email')}
              />
              <FieldError k="email" />
            </div>
            <div>
              <label className="field-label" htmlFor={`${uid}-phone`}>
                Mobile number
              </label>
              <input
                className="field-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                value={values.phone}
                onChange={(e) => set('phone', e.target.value)}
                {...field('phone')}
              />
              <FieldError k="phone" />
            </div>

            {mode === 'consultation' && (
              <>
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={`${uid}-topic`}>
                    What would you like to discuss?
                  </label>
                  <select className="field-input" value={values.topic} onChange={(e) => set('topic', e.target.value)} {...field('topic')}>
                    <option value="">Select a topic</option>
                    {TOPICS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <FieldError k="topic" />
                </div>
                <div>
                  <label className="field-label" htmlFor={`${uid}-date`}>
                    Preferred date
                  </label>
                  <input
                    className="field-input"
                    type="date"
                    min={tomorrow()}
                    value={values.date}
                    onChange={(e) => set('date', e.target.value)}
                    {...field('date')}
                  />
                  <FieldError k="date" />
                </div>
                <div>
                  <label className="field-label" htmlFor={`${uid}-slot`}>
                    Preferred time
                  </label>
                  <select className="field-input" value={values.slot} onChange={(e) => set('slot', e.target.value)} {...field('slot')}>
                    <option value="">Select a time</option>
                    {SLOTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <FieldError k="slot" />
                </div>
                <fieldset className="sm:col-span-2">
                  <legend className="field-label">How would you like to meet?</legend>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {MEETING.map((m) => (
                      <label
                        key={m}
                        className={cn(
                          'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600',
                          values.meeting === m
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-navy-900/15 text-ink-muted hover:border-navy-900/30',
                        )}
                      >
                        <input
                          type="radio"
                          name={`${uid}-meeting`}
                          className="sr-only"
                          checked={values.meeting === m}
                          onChange={() => set('meeting', m)}
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor={`${uid}-message`}>
                {mode === 'consultation' ? 'Anything we should know beforehand? (optional)' : 'How can we help?'}
              </label>
              <textarea
                className="field-input min-h-[8rem] resize-y"
                value={values.message}
                onChange={(e) => set('message', e.target.value)}
                placeholder={
                  mode === 'consultation'
                    ? 'For example, your goals or existing investments you would like reviewed'
                    : 'Tell us about your goals or questions'
                }
                {...field('message')}
              />
              <FieldError k="message" />
            </div>
          </div>

          {/* Honeypot */}
          <div className="absolute -left-[9999px]" aria-hidden>
            <label>
              Company
              <input tabIndex={-1} autoComplete="off" value={values.company} onChange={(e) => set('company', e.target.value)} />
            </label>
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-muted">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 rounded border-navy-900/30 accent-brand-600"
                checked={values.consent}
                onChange={(e) => set('consent', e.target.checked)}
                {...field('consent')}
              />
              <span>
                I agree to be contacted by phone, email or WhatsApp about my enquiry. I understand my details will be used only to
                respond to this request, as described in the{' '}
                <Link to="/disclosures#privacy" className="link-underline font-medium text-navy-900">
                  privacy note
                </Link>
                .
              </span>
            </label>
            <FieldError k="consent" />
          </div>

          {result && !result.ok && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {result.error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={status === 'submitting'}
            leadingIcon={status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            trailingIcon={status === 'submitting' ? undefined : <ArrowRight className="h-4 w-4" />}
          >
            {status === 'submitting' ? 'Sending…' : mode === 'consultation' ? 'Request consultation' : 'Send enquiry'}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
