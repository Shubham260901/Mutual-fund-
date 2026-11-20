import type { Enquiry } from './db.ts';

/**
 * Optional email alert for each new enquiry, via Resend (https://resend.com).
 * Enabled when RESEND_API_KEY and ENQUIRY_TO_EMAIL are set. The enquiry is already
 * saved by the time this runs, so a failure here is logged and never shown to the visitor.
 */
export async function notifyNewEnquiry(e: Enquiry, env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  const to = env.ENQUIRY_TO_EMAIL;
  if (!apiKey || !to) return;

  const lines = [
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    `Phone: ${e.phone}`,
    ...(e.type === 'consultation'
      ? [`Topic: ${e.topic}`, `Preferred date: ${e.preferredDate}`, `Preferred time: ${e.preferredTime}`, `Meeting type: ${e.meetingType}`]
      : []),
    ...(e.message ? [`Message:\n${e.message}`] : []),
  ];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM_EMAIL || 'Website Enquiries <onboarding@resend.dev>',
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        reply_to: e.email,
        subject: `${e.type === 'consultation' ? 'Consultation request' : 'Website enquiry'}: ${e.name}`,
        text: lines.join('\n'),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`[notify] Resend responded ${res.status}: ${(await res.text()).slice(0, 200)}`);
  } catch (err) {
    console.error('[notify] email failed:', err instanceof Error ? err.message : err);
  }
}
