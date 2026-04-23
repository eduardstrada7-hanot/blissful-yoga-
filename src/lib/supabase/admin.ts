import { createClient } from '@supabase/supabase-js';

// Service-role client — server-side only, never expose to browser
export function createAdminClient() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
