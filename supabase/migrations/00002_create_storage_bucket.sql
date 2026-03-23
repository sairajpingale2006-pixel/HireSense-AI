-- Create storage bucket for resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Allow public uploads
create policy "Allow public uploads"
on storage.objects for insert
with check (bucket_id = 'resumes');

-- Allow public reads
create policy "Allow public reads"
on storage.objects for select
using (bucket_id = 'resumes');
