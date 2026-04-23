import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  initialContent?: object | null;
  postId?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  status: 'draft' | 'published';
}

const ToolbarButton = ({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      padding: '0.3rem 0.5rem',
      borderRadius: '3px',
      border: 'none',
      background: active ? '#5B3A5B' : 'transparent',
      color: active ? '#fff' : '#2B2420',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: 600,
      lineHeight: 1,
    }}
  >
    {children}
  </button>
);

export default function BlogEditor({ initialContent, postId, slug: initSlug, title: initTitle, excerpt: initExcerpt, coverImageUrl: initCover, status: initStatus }: Props) {
  const [title, setTitle] = useState(initTitle);
  const [slug, setSlug] = useState(initSlug);
  const [excerpt, setExcerpt] = useState(initExcerpt);
  const [coverImageUrl, setCoverImageUrl] = useState(initCover ?? '');
  const [status, setStatus] = useState<'draft' | 'published'>(initStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: 'Start writing your post…' }),
    ],
    content: initialContent ?? undefined,
    editorProps: {
      attributes: {
        style: 'min-height:400px;outline:none;font-size:1rem;line-height:1.75;color:#2B2420;',
      },
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!postId && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [title, postId]);

  const save = useCallback(async (targetStatus?: 'draft' | 'published') => {
    if (!editor) return;
    setSaving(true);
    setMessage('');
    const content = editor.getJSON();
    const finalStatus = targetStatus ?? status;
    try {
      const res = await fetch('/api/admin/blog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, slug, title, excerpt, coverImageUrl, content, status: finalStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Save failed');
      setStatus(finalStatus);
      setMessageType('success');
      setMessage(finalStatus === 'published' ? 'Published!' : 'Draft saved.');
      if (!postId && json.id) {
        window.history.replaceState({}, '', `/admin/blog/${json.id}/edit`);
      }
    } catch (err: any) {
      setMessageType('error');
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }, [editor, postId, slug, title, excerpt, coverImageUrl, status]);

  // Autosave every 30s
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => save('draft'), 30000);
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [editor, save]);

  if (!editor) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, opacity: 0.7, marginBottom: '0.375rem' }}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Post title"
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #D9CDB8', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit' }}
        />
      </div>

      {/* Slug */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, opacity: 0.7, marginBottom: '0.375rem' }}>URL slug *</label>
        <input
          type="text"
          value={slug}
          onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="url-slug"
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #D9CDB8', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'monospace' }}
        />
        <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>/blog/{slug || '…'}</p>
      </div>

      {/* Cover image */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, opacity: 0.7, marginBottom: '0.375rem' }}>Cover image URL</label>
        <input
          type="url"
          value={coverImageUrl}
          onChange={e => setCoverImageUrl(e.target.value)}
          placeholder="https://…"
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #D9CDB8', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit' }}
        />
      </div>

      {/* Excerpt */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, opacity: 0.7, marginBottom: '0.375rem' }}>Excerpt (shown in blog cards & SEO)</label>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          rows={3}
          placeholder="A short summary of this post…"
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #D9CDB8', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical' }}
        />
      </div>

      {/* Editor */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, opacity: 0.7, marginBottom: '0.375rem' }}>Content *</label>
        {/* Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', padding: '0.5rem', background: '#f9f6f2', border: '1px solid #D9CDB8', borderBottom: 'none', borderRadius: '4px 4px 0 0' }}>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><b>B</b></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><i>I</i></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><u>U</u></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><s>S</s></ToolbarButton>
          <span style={{ width: 1, background: '#D9CDB8', margin: '0 0.25rem' }} />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarButton>
          <span style={{ width: 1, background: '#D9CDB8', margin: '0 0.25rem' }} />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">• List</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">1. List</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">" Quote</ToolbarButton>
          <span style={{ width: 1, background: '#D9CDB8', margin: '0 0.25rem' }} />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter URL:');
              if (url) editor.chain().focus().setLink({ href: url }).run();
              else editor.chain().focus().unsetLink().run();
            }}
            active={editor.isActive('link')}
            title="Link"
          >Link</ToolbarButton>
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Image URL:');
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            active={false}
            title="Insert image"
          >Image</ToolbarButton>
          <span style={{ width: 1, background: '#D9CDB8', margin: '0 0.25rem' }} />
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩ Undo</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪ Redo</ToolbarButton>
        </div>
        <div style={{ border: '1px solid #D9CDB8', borderRadius: '0 0 4px 4px', padding: '1rem 1.25rem', background: '#fff' }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Feedback */}
      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.875rem', background: messageType === 'success' ? '#d1fae5' : '#fee2e2', color: messageType === 'success' ? '#065f46' : '#991b1b' }}>
          {message}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #D9CDB8' }}>
        <button type="button" onClick={() => save('draft')} disabled={saving} style={{ padding: '0.625rem 1.25rem', border: '1px solid #5B3A5B', borderRadius: '4px', background: 'transparent', color: '#5B3A5B', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        {status === 'published' ? (
          <button type="button" onClick={() => save('draft')} disabled={saving} style={{ padding: '0.625rem 1.25rem', border: 'none', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Unpublish
          </button>
        ) : (
          <button type="button" onClick={() => save('published')} disabled={saving} style={{ padding: '0.625rem 1.25rem', border: 'none', borderRadius: '4px', background: '#5B3A5B', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Publishing…' : 'Publish'}
          </button>
        )}
      </div>
    </div>
  );
}
