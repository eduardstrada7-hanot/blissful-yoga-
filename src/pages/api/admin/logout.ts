export const prerender = false;
import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase/server';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createServerSupabase(request, cookies);
  await supabase.auth.signOut();
  return redirect('/admin/login');
};
