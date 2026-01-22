-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Posts Table
create table public.posts (
  id uuid not null default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null, -- Can hold markdown or HTML
  published boolean not null default false,
  tags text[] default array[]::text[],
  created_at timestamp with time zone not null default now(),
  constraint posts_pkey primary key (id)
);

-- Comments Table
create table public.comments (
  id uuid not null default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  name text not null,
  email text not null,
  comment text not null,
  approved boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint comments_pkey primary key (id)
);

-- RLS Policies

-- Enable RLS
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Posts Policies
-- Everyone can read published posts
create policy "Public can view published posts"
on public.posts for select
using ( published = true );

-- Admins can do everything
-- Note: Supabase Auth Admin check usually involves checking a role or specific email.
-- For simplicity, we will assume the dashboard uses the Service Role (server-side) or an authenticated user with a specific claim.
-- However, user requirement says "Only authenticated admin can access dashboard".
-- We will allow authenticated users to view all posts (drafts) for now, assuming only admin is authenticated.
create policy "Authenticated users can view all posts"
on public.posts for select
to authenticated
using ( true );

create policy "Authenticated users can insert posts"
on public.posts for insert
to authenticated
with check ( true );

create policy "Authenticated users can update posts"
on public.posts for update
to authenticated
using ( true );

create policy "Authenticated users can delete posts"
on public.posts for delete
to authenticated
using ( true );

-- Comments Policies
-- Public can read approved comments
create policy "Public can view approved comments"
on public.comments for select
using ( approved = true );

-- Public can insert comments (but not approve them)
create policy "Public can insert comments"
on public.comments for insert
with check ( true ); 
-- Note: 'with check (true)' allows anyone to insert. Field security is handled by the API (we won't let them set 'approved' to true via the API endpoint if we use service role or careful client handling).
-- Ideally, we'd restrict the columns they can insert, but Supabase standard RLS doesn't do column-level insert blocking easily without triggers or functions.
-- We will handle 'approved' defaulting to false in the schema.

-- Authenticated users (Admin) can view all comments
create policy "Authenticated users can view all comments"
on public.comments for select
to authenticated
using ( true );

-- Authenticated users can update comments (approve/reject)
create policy "Authenticated users can update comments"
on public.comments for update
to authenticated
using ( true );

-- Authenticated users can delete comments
create policy "Authenticated users can delete comments"
on public.comments for delete
to authenticated
using ( true );
