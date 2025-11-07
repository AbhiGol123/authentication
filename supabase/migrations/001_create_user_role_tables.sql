-- Create roles table
create table if not exists public.roles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default now()
);

-- Create users table
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  role text references public.roles(name),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.roles enable row level security;
alter table public.users enable row level security;

-- Create policies
create policy "Roles are viewable by everyone" on public.roles
  for select using (true);

create policy "Users are viewable by everyone" on public.users
  for select using (true);

create policy "Admins can insert roles" on public.roles
  for insert with check (true);

create policy "Admins can update roles" on public.roles
  for update using (true);

create policy "Admins can delete roles" on public.roles
  for delete using (true);

create policy "Admins can insert users" on public.users
  for insert with check (true);

create policy "Admins can update users" on public.users
  for update using (true);

create policy "Admins can delete users" on public.users
  for delete using (true);

-- Insert default roles
insert into public.roles (name, description) values 
  ('admin', 'Administrator with full access'),
  ('user', 'Regular user with limited access'),
  ('moderator', 'Moderator with content management access')
on conflict (name) do nothing;