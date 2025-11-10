-- Create a bucket for publisher logos
insert into storage.buckets (id, name, public)
values ('publisher-logos', 'publisher-logos', true);

-- Set up access controls for the bucket
create policy "Publisher logos are publicly accessible"
on storage.objects for select
using (bucket_id = 'publisher-logos');

create policy "Authenticated users can upload publisher logos"
on storage.objects for insert
with check (bucket_id = 'publisher-logos' and auth.role() = 'authenticated');

create policy "Users can update their own publisher logos"
on storage.objects for update
using (bucket_id = 'publisher-logos' and auth.role() = 'authenticated');

create policy "Users can delete their own publisher logos"
on storage.objects for delete
using (bucket_id = 'publisher-logos' and auth.role() = 'authenticated');