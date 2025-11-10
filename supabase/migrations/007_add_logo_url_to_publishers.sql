-- Add logo_url column to publishers table
alter table public.publishers
add column if not exists logo_url text;

-- Add a comment to the column
comment on column public.publishers.logo_url is 'URL of the publisher logo stored in Supabase storage';