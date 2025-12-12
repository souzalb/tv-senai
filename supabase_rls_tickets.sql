-- Enable RLS on tickets table
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Allow Public Read (Anon + Authenticated)
-- Required for: TV Player (Anon) and Queue Kiosk (Anon) to see queue status
CREATE POLICY "Public Read Tickets"
ON tickets FOR SELECT
USING (true);

-- Policy: Allow Public Insert (Anon + Authenticated)
-- Required for: Queue Kiosk to create new tickets
CREATE POLICY "Public Insert Tickets"
ON tickets FOR INSERT
WITH CHECK (true);

-- Policy: Allow Staff Update (Authenticated Only)
-- Required for: Admins calling tickets or completing them
CREATE POLICY "Authenticated Update Tickets"
ON tickets FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Optional: Delete?
-- Only authenticated users can delete (if feature exists)
CREATE POLICY "Authenticated Delete Tickets"
ON tickets FOR DELETE
TO authenticated
USING (true);
