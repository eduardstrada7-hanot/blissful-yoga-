-- Blissful Butterfly Yoga — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table if not exists subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text,
  source        text,           -- 'mini-course' | 'footer' | 'manual'
  tags          text[] default '{}',
  status        text not null default 'active' check (status in ('active','unsubscribed','bounced')),
  created_at    timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table if not exists messages (
  id            uuid primary key default gen_random_uuid(),
  sender_name   text not null,
  sender_email  text not null,
  subject       text,
  body          text not null,
  source        text default 'contact-form',
  status        text not null default 'unread' check (status in ('unread','read','replied','archived')),
  created_at    timestamptz not null default now()
);

create table if not exists message_replies (
  id            uuid primary key default gen_random_uuid(),
  message_id    uuid not null references messages(id) on delete cascade,
  body          text not null,
  sent_at       timestamptz not null default now(),
  sent_by       uuid references auth.users(id)
);

create table if not exists blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  content         jsonb,
  content_html    text,
  cover_image_url text,
  status          text not null default 'draft' check (status in ('draft','published')),
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  author_id       uuid references auth.users(id)
);

-- Auto-update updated_at on blog_posts
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists blog_posts_updated_at on blog_posts;
create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────────

alter table subscribers enable row level security;
alter table messages enable row level security;
alter table message_replies enable row level security;
alter table blog_posts enable row level security;

-- Admin helper: checks if the current user is an allowed admin email
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
    and email = any(string_to_array(current_setting('app.admin_emails', true), ','))
  );
$$;

-- subscribers
create policy "Public can insert subscribers"
  on subscribers for insert to anon with check (true);
create policy "Admins manage subscribers"
  on subscribers for all to authenticated using (is_admin());

-- messages
create policy "Public can insert messages"
  on messages for insert to anon with check (true);
create policy "Admins manage messages"
  on messages for all to authenticated using (is_admin());

-- message_replies
create policy "Admins manage replies"
  on message_replies for all to authenticated using (is_admin());

-- blog_posts
create policy "Public can read published posts"
  on blog_posts for select to anon
  using (status = 'published');
create policy "Admins manage all posts"
  on blog_posts for all to authenticated using (is_admin());

-- ─── Storage bucket for uploads ───────────────────────────────────────────────
-- Run in Supabase Dashboard → Storage → New bucket
-- Name: "uploads", Public: true
-- Or uncomment below if using CLI:
-- insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
-- on conflict do nothing;
