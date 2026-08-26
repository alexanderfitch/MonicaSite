// Cloudflare Pages Function — handles the newsletter + contact forms.
//
// Sends a plain-text email via Resend (https://resend.com) for every valid
// submission. Requires these to be set as Cloudflare Pages environment
// variables (Settings → Environment variables) on this project:
//
//   RESEND_API_KEY   (required, encrypted)  — from resend.com/api-keys
//   CONTACT_TO_EMAIL (optional) — where submissions are delivered; defaults to monica@monicamesser.com
//   CONTACT_FROM     (optional) — verified sender; defaults to Resend's shared
//                                  onboarding@resend.dev address, which works
//                                  immediately with no domain verification.
//
// See README.md for the one-time Resend + DNS setup.

const DEFAULT_TO = 'monica@monicamesser.com';
const DEFAULT_FROM = 'Monica Messer Website <onboarding@resend.dev>';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Honeypot — real visitors never fill this in. Pretend it worked so bots
  // can't tell they were caught.
  if (formData.get('bot-field')) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const kind = formData.get('form-name') === 'contact' ? 'contact' : 'newsletter';
  const name = (formData.get('name') || '').toString().trim();
  const email = (formData.get('email') || '').toString().trim();
  const message = (formData.get('message') || '').toString().trim();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (kind === 'contact' && !message) {
    return new Response(JSON.stringify({ ok: false, error: 'missing_message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!env.RESEND_API_KEY) {
    // Fail loudly server-side (visible in Pages Function logs) but keep the
    // response generic so we don't leak configuration state to the client.
    console.error('submit: RESEND_API_KEY is not set');
    return new Response(JSON.stringify({ ok: false, error: 'not_configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const subject = kind === 'contact'
    ? `New contact form message from ${name || email}`
    : `New newsletter signup: ${email}`;

  const textLines = kind === 'contact'
    ? [`Name: ${name || '(not provided)'}`, `Email: ${email}`, '', 'Message:', message]
    : [`Name: ${name || '(not provided)'}`, `Email: ${email}`];
  const text = textLines.join('\n');

  const html = kind === 'contact'
    ? `<p><strong>Name:</strong> ${escapeHtml(name || '(not provided)')}</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>
       <p><strong>Message:</strong></p>
       <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`
    : `<p><strong>Name:</strong> ${escapeHtml(name || '(not provided)')}</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>`;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM || DEFAULT_FROM,
      to: [env.CONTACT_TO_EMAIL || DEFAULT_TO],
      reply_to: email,
      subject,
      text,
      html,
    }),
  });

  if (!resendRes.ok) {
    const detail = await resendRes.text().catch(() => '');
    console.error('submit: Resend API error', resendRes.status, detail);
    return new Response(JSON.stringify({ ok: false, error: 'send_failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
