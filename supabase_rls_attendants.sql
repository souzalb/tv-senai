-- Enable RLS on attendants table
ALTER TABLE attendants ENABLE ROW LEVEL SECURITY;

-- Policy: Allow Public Read (Anon + Authenticated)
-- Required for: Application to fetch attendant data (even if deprecated, to avoid errors)
CREATE POLICY "Public Read Attendants"
ON attendants FOR SELECT
USING (true);

-- Policy: Allow Staff Management (Authenticated Only)
-- Required for: Admins to create/update/delete attendants (if functionality is used via API/Legacy)
CREATE POLICY "Authenticated Manage Attendants"
ON attendants FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
