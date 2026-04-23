export const prerender = false;
import type { APIRoute } from 'astro';
import { createAdminClient } from '../../lib/supabase/admin';
import { notifyNewMessage } from '../../lib/resend';

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();

  // Honeypot
  if (form.get('website')) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const name    = form.get('name')?.toString().trim()    ?? '';
  const email   = form.get('email')?.toString().trim()   ?? '';
  const topic   = form.get('topic')?.toString()          ?? '';
  const message = form.get('message')?.toString().trim() ?? '';

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Please fill in all required fields.' }), { status: 400 });
  }

  const db = createAdminClient();
  const { data, error } = await db.from('messages').insert({
    sender_name:  name,
    sender_email: email,
    subject:      topic || undefined,
    body:         message,
    source:       'contact-form',
  }).select('id').single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to send message. Please try email directly.' }), { status: 500 });
  }

  // Notify Veronica (fire-and-forget — don't block response)
  notifyNewMessage(name, data.id).catch(() => {});

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
