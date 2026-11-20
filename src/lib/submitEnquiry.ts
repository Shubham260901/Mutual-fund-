import { site } from '@/config/site';

export type EnquiryPayload = Record<string, string>;

export type SubmitResult = { ok: true; via: 'endpoint' | 'email' } | { ok: false; error: string };

/**
 * Delivers an enquiry. With `site.forms.endpoint` configured, POSTs JSON to it.
 * Otherwise, opens the visitor's email client with a pre-filled message, so the
 * form still works before a backend is connected.
 */
export async function submitEnquiry(subject: string, payload: EnquiryPayload): Promise<SubmitResult> {
  if (site.forms.endpoint) {
    try {
      const res = await fetch(site.forms.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ subject, ...payload }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return { ok: true, via: 'endpoint' };
    } catch {
      return { ok: false, error: 'We could not send your message right now. Please try again, or reach us on WhatsApp or by phone.' };
    }
  }

  const body = Object.entries(payload)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { ok: true, via: 'email' };
}
