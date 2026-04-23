export const prerender = false;
import type { APIRoute } from 'astro';
import { createAdminClient } from '../../lib/supabase/admin';

export const POST: APIRoute = async ({ request }) => {
  const db = createAdminClient();
  let email = '';
  let name = '';
  let source = 'footer';

  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const body = await request.json();
    email  = body.email?.trim() ?? '';
    name   = body.name?.trim()  ?? '';
    source = body.source        ?? 'footer';
  } else {
    const form = await request.formData();
    email  = form.get('email')?.toString().trim()  ?? '';
    name   = form.get('name')?.toString().trim()   ?? '';
    source = form.get('source')?.toString()        ?? 'footer';
    // Honeypot check
    if (form.get('website')) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
  }

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Invalid email.' }), { status: 400 });
  }

  const { error } = await db.from('subscribers').upsert(
    { email, name: name || null, source, status: 'active' },
    { onConflict: 'email', ignoreDuplicates: false },
  );

  if (error) {
    return new Response(JSON.stringify({ error: 'Subscription failed.' }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
