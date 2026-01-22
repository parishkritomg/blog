-- Create a new storage bucket for site assets (if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- Drop potentially incorrect existing policies to avoid conflicts
drop policy if exists "Allow admin to upload site-assets" on storage.objects;
drop policy if exists "Allow admin to update site-assets" on storage.objects;
drop policy if exists "Allow admin to delete site-assets" on storage.objects;
drop policy if exists "Give public access to site-assets" on storage.objects;

-- Re-create security policies using reliable JWT email check

-- Allow public read access to site-assets
create policy "Give public access to site-assets"
  on storage.objects for select
  using ( bucket_id = 'site-assets' );

-- Allow admin to upload site-assets
create policy "Allow admin to upload site-assets"
  on storage.objects for insert
  with check (
    bucket_id = 'site-assets' and
    auth.role() = 'authenticated' and
    auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com'
  );

-- Allow admin to update site-assets
create policy "Allow admin to update site-assets"
  on storage.objects for update
  using (
    bucket_id = 'site-assets' and
    auth.role() = 'authenticated' and
    auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com'
  );

-- Allow admin to delete site-assets
create policy "Allow admin to delete site-assets"
  on storage.objects for delete
  using (
    bucket_id = 'site-assets' and
    auth.role() = 'authenticated' and
    auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com'
  );
