-- Ensure Profiles has Name and Desk info
-- (Assuming profiles table exists based on app/admin/users/page.tsx, if not we create it or alter it)
-- Note: Often profiles is a view or a table linked to auth.users. 
-- We'll assume it's a table for this migration to add columns.
alter table profiles add column if not exists name text;
alter table profiles add column if not exists desk_info text;

-- Update Tickets to link to Profiles (Users) instead of Attendants (deprecated)
-- We keep 'attendant_id' name or change it? Let's use 'attendant_user_id' to be clear.
alter table tickets add column if not exists attendant_user_id uuid references profiles(id) on delete set null;

-- Migration script to move existing attendant IDs? 
-- Since we are switching systems, we might just leave old data as is or null.
-- But the user wants "Attendant selected is the logged in user".

-- Realtime
alter publication supabase_realtime add table profiles;
