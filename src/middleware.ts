import { defineMiddleware } from 'astro:middleware';
import { createServerSupabase } from './lib/supabase/server';

const ADMIN_EMAILS = (import.meta.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  // Only guard /admin/* routes; let /admin/login and reset-password through
  if (!pathname.startsWith('/admin')) return next();
  if (pathname === '/admin/login' || pathname === '/admin/reset-password') return next();

  const supabase = createServerSupabase(context.request, context.cookies);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
    return context.redirect('/admin/login');
  }

  return next();
});
