-- Create publishers table
create table if not exists public.publishers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text,
  city text,
  location text,
  place_name text,
  street_name text,
  state text,
  zip_code text,
  website_url text,
  instagram_url text,
  twitter_url text,
  facebook_url text,
  contact_name text,
  contact_email text,
  contact_phone text,
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.publishers enable row level security;

-- Create policies
create policy "Publishers are viewable by everyone" on public.publishers
  for select using (true);

create policy "Authenticated users can insert publishers" on public.publishers
  for insert with check (auth.role() = 'authenticated');

create policy "Publishers can be updated by their creators" on public.publishers
  for update using (true);

create policy "Publishers can be deleted by their creators" on public.publishers
  for delete using (true);

-- Create indexes
create index if not exists publishers_category_idx on public.publishers (category);
create index if not exists publishers_city_idx on public.publishers (city);
create index if not exists publishers_tags_idx on public.publishers using gin (tags);