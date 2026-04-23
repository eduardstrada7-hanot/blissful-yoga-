import type { AstroCookies } from 'astro';
import { createServerSupabase } from './supabase/server';

const ADMIN_EMAILS = (import.meta.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export async function getAdminUser(request: Request, cookies: AstroCookies) {
  const supabase = createServerSupabase(request, cookies);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) return null;
  return user;
}

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
