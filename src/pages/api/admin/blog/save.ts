export const prerender = false;
import type { APIRoute } from 'astro';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { getAdminUser } from '../../../../lib/auth';
import { tiptapToHtml } from '../../../../lib/tiptap/render';

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getAdminUser(request, cookies);
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { id, slug, title, excerpt, coverImageUrl, content, status } = await request.json();

  if (!slug || !title) {
    return new Response(JSON.stringify({ error: 'Title and slug are required.' }), { status: 400 });
  }

  const content_html = content ? tiptapToHtml(content) : '';
  const db = createAdminClient();

  const payload = {
    slug,
    title,
    excerpt:         excerpt    || null,
    cover_image_url: coverImageUrl || null,
    content:         content    || null,
    content_html,
    status,
    author_id:       user.id,
    published_at:    status === 'published' ? new Date().toISOString() : null,
  };

  if (id) {
    // Update existing
    if (status !== 'published') {
      // Don't clear published_at if we're just editing a published post's content
      // Only clear it on explicit unpublish
      delete (payload as any).published_at;
    }
    const { data, error } = await db.from('blog_posts').update(payload).eq('id', id).select('id').single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ ok: true, id: data.id }), { status: 200 });
  } else {
    // Insert new
    const { data, error } = await db.from('blog_posts').insert(payload).select('id').single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ ok: true, id: data.id }), { status: 200 });
  }
};
