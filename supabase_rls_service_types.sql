-- Enable RLS on service_types table
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;

-- Policy: Allow Public Read (Anon + Authenticated)
-- Required for: Admin Dashboard (Authenticated) and potentially Kiosks (Anon)
CREATE POLICY "Public Read Service Types"
ON service_types FOR SELECT
USING (true);

-- Policy: Allow Staff Management (Authenticated Only)
-- Required for: Admins to create/delete service types
CREATE POLICY "Authenticated Manage Service Types"
ON service_types FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
