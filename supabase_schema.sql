-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- TVs Table
create table tvs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text,
  width integer default 1920,
  height integer default 1080,
  orientation text default 'landscape',
  assigned_playlist_id uuid, -- Foreign key added later to avoid order dependency issues if playlists table doesn't exist yet
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Playlists Table
create table playlists (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Slides Table
create table slides (
  id uuid default uuid_generate_v4() primary key,
  playlist_id uuid references playlists(id) on delete cascade not null,
  type text default 'image',
  url text not null,
  duration integer default 10,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add Foreign Key for TV assignment
alter table tvs add constraint fk_tvs_playlist 
  foreign key (assigned_playlist_id) references playlists(id) on delete set null;

-- STORAGE: Create a public bucket for slides
insert into storage.buckets (id, name, public) values ('slides', 'slides', true);

-- STORAGE POLICIES (Allow public access for now for simplicity)
-- Policy to allow public read access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'slides' );

-- Policy to allow authenticated uploads (anon key is considered authenticated in this context usually, 
-- but for a true public demo without auth we might need to open it up more or assume the app uses anon key)
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'slides' );
  
-- Enable Realtime for all tables
alter publication supabase_realtime add table tvs;
alter publication supabase_realtime add table playlists;
alter publication supabase_realtime add table slides;
