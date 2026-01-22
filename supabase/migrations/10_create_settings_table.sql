create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table settings enable row level security;

create policy "Allow public read access to settings"
  on settings for select
  using (true);

create policy "Allow admin full access to settings"
  on settings for all
  using (
    auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com'
  )
  with check (
    auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com'
  );

-- Insert initial empty announcement if not exists
insert into settings (key, value)
values ('announcement', '')
on conflict (key) do nothing;
