-- ============================================================
-- Sample Audit Setup
-- Run this in Supabase SQL Editor (once)
-- ============================================================

-- Step 1: Add is_sample column to audits table
ALTER TABLE audits
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- Step 2: Mark Chiavari as the sample audit
UPDATE audits
  SET is_sample = TRUE
  WHERE property_name ILIKE '%Chiavari%';

-- Step 3: Allow anonymous (public) users to read sample audits
--         This lets the shareable link work without login
CREATE POLICY "Public can read sample audits"
  ON audits
  FOR SELECT
  TO anon
  USING (is_sample = TRUE);

-- Verify: should return 1 row
SELECT audit_id, property_name, is_sample
  FROM audits
  WHERE is_sample = TRUE;
