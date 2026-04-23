export const prerender = false;
import type { APIRoute } from 'astro';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { getAdminUser } from '../../../../lib/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  const user = await getAdminUser(request, cookies);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const db = createAdminClient();
  const { data: subscribers = [] } = await db
    .from('subscribers')
    .select('email,name,source,tags,status,created_at')
    .order('created_at', { ascending: false });

  const header = 'email,name,source,tags,status,joined_date';
  const rows = subscribers.map((s: any) =>
    [
      `"${s.email}"`,
      `"${s.name ?? ''}"`,
      `"${s.source ?? ''}"`,
      `"${(s.tags ?? []).join(';')}"`,
      `"${s.status}"`,
      `"${new Date(s.created_at).toLocaleDateString('en-US')}"`,
    ].join(',')
  );

  const csv = [header, ...rows].join('\n');
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
};
