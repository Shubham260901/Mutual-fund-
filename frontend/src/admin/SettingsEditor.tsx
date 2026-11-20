import { Loader2, ShieldCheck, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { SettingsDoc } from '@/content/runtime';
import { adminApi, prepareImage } from './api';
import { DocView, Section, SaveBar, TextArea, TextField, useDoc } from './editor';
import { Alert, btnSecondary } from './ui';

function PhotoField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await adminApi.uploadMedia(await prepareImage(file)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div>
      <p className="field-label">Photo</p>
      <div className="flex items-center gap-4">
        {value ? (
          <img src={value} alt="Current distributor photo" className="h-20 w-20 rounded-2xl object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-mist text-xs text-ink-subtle">No photo</span>
        )}
        <div className="space-y-2">
          <button type="button" className={btnSecondary} disabled={busy} onClick={() => ref.current?.click()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
            {value ? 'Change photo' : 'Upload photo'}
          </button>
          {value && (
            <button type="button" className="block text-sm font-medium text-ink-muted underline" onClick={() => onChange('')}>
              Remove (the site shows initials instead)
            </button>
          )}
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-label="Choose a photo" onChange={(e) => void pick(e.target.files?.[0])} />
        </div>
      </div>
      {error && (
        <div className="mt-2">
          <Alert>{error}</Alert>
        </div>
      )}
    </div>
  );
}

export function SettingsEditor() {
  const doc = useDoc('settings');
  return (
    <DocView doc={doc}>
      {(s) => {
        const set = (next: SettingsDoc) => doc.setValue(next);
        const contact = (patch: Partial<SettingsDoc['contact']>) => set({ ...s, contact: { ...s.contact, ...patch } });
        const addr = (patch: Partial<SettingsDoc['contact']['address']>) => contact({ address: { ...s.contact.address, ...patch } });
        const dist = (patch: Partial<SettingsDoc['distributor']>) => set({ ...s, distributor: { ...s.distributor, ...patch } });
        const social = (patch: Partial<SettingsDoc['social']>) => set({ ...s, social: { ...s.social, ...patch } });

        return (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-2xl border border-gold-300 bg-gold-100/50 p-4 text-sm text-navy-900">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden />
              <p>
                <strong>Regulatory details are not editable here.</strong> ARN, EUIN, NISM certificate, legal name, grievance officer and the disclosure text live in the code (
                <code className="rounded bg-white px-1">config/site.ts</code> and <code className="rounded bg-white px-1">content/disclosures.ts</code>) so they only change after a compliance review.
              </p>
            </div>

            <Section title="Business">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Business name" hint="Logo, page titles, footer" maxLength={80} value={s.name} onChange={(v) => set({ ...s, name: v })} />
                <TextField label="Short name" maxLength={80} value={s.shortName} onChange={(v) => set({ ...s, shortName: v })} />
                <TextField label="Tagline" maxLength={120} value={s.tagline} onChange={(v) => set({ ...s, tagline: v })} />
                <TextField label="Website address" hint="Used in the sitemap, e.g. https://www.yoursite.in" maxLength={200} value={s.url} onChange={(v) => set({ ...s, url: v })} />
              </div>
            </Section>

            <Section title="About the distributor">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Name" maxLength={80} value={s.distributor.name} onChange={(v) => dist({ name: v })} />
                <TextField label="Title" maxLength={120} value={s.distributor.title} onChange={(v) => dist({ title: v })} />
                <TextArea className="sm:col-span-2" label="Short biography" hint="Factual only: background and qualifications" rows={5} maxLength={2000} counter value={s.distributor.bio} onChange={(v) => dist({ bio: v })} />
              </div>
              <PhotoField value={s.distributor.photo} onChange={(url) => dist({ photo: url })} />
            </Section>

            <Section title="Contact details">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Phone (as displayed)" maxLength={40} value={s.contact.phone} onChange={(v) => contact({ phone: v })} />
                <TextField label="Phone for call links" hint="Digits with country code, e.g. 919876543210" maxLength={20} value={s.contact.phoneE164} onChange={(v) => contact({ phoneE164: v })} />
                <TextField label="WhatsApp number" hint="Digits with country code" maxLength={20} value={s.contact.whatsapp} onChange={(v) => contact({ whatsapp: v })} />
                <TextField label="Email" type="email" maxLength={254} value={s.contact.email} onChange={(v) => contact({ email: v })} />
                <TextField className="sm:col-span-2" label="Opening hours" maxLength={120} value={s.contact.hours} onChange={(v) => contact({ hours: v })} />
              </div>
            </Section>

            <Section title="Office address">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Address line 1" maxLength={120} value={s.contact.address.line1} onChange={(v) => addr({ line1: v })} />
                <TextField label="Address line 2" maxLength={120} value={s.contact.address.line2} onChange={(v) => addr({ line2: v })} />
                <TextField label="City" maxLength={60} value={s.contact.address.city} onChange={(v) => addr({ city: v })} />
                <TextField label="State" maxLength={60} value={s.contact.address.state} onChange={(v) => addr({ state: v })} />
                <TextField label="PIN code" maxLength={12} value={s.contact.address.pin} onChange={(v) => addr({ pin: v })} />
                <TextField label="Google Maps link" hint="Optional" maxLength={300} value={s.contact.mapUrl} onChange={(v) => contact({ mapUrl: v })} />
              </div>
            </Section>

            <Section title="Booking & social links" defaultOpen={false}>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField className="sm:col-span-2" label="Booking link" hint="Calendly, Cal.com… shown on the consultation tab" maxLength={300} value={s.forms.bookingUrl} onChange={(v) => set({ ...s, forms: { bookingUrl: v } })} />
                <TextField label="LinkedIn" maxLength={300} value={s.social.linkedin} onChange={(v) => social({ linkedin: v })} />
                <TextField label="YouTube" maxLength={300} value={s.social.youtube} onChange={(v) => social({ youtube: v })} />
                <TextField label="Instagram" maxLength={300} value={s.social.instagram} onChange={(v) => social({ instagram: v })} />
              </div>
            </Section>

            <SaveBar doc={doc} resetLabel="Reset to built-in settings" />
          </div>
        );
      }}
    </DocView>
  );
}
