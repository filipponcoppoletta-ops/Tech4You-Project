-- Create files table
create table public.project_files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.project_info(id) on delete cascade not null,
  name text not null,
  size bigint not null,
  type text not null,
  storage_path text not null,
  upload_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.project_files enable row level security;
create policy "Allow public access for now" on public.project_files for all using (true);
