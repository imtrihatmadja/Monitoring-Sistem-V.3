-- MIGRATION SCRIPT FOR SUPABASE DATABASE (DFW INDONESIA)
-- This script drops the 'issues_severity_check' constraint on the 'issues' table
-- and adds columns matching the React application models to prevent 400 Bad Request/401 Unauthorized errors.
--
-- Instructions:
-- 1. Copy the entire content of this script.
-- 2. Go to your Supabase Dashboard (https://supabase.com).
-- 3. Click on 'SQL Editor' in the left-hand navigation pane.
-- 4. Paste this script into the query editor and click 'Run'.

-- ==========================================
-- 1. UPDATE TABLE: issues (Isu & Pengaduan)
-- ==========================================

-- Disable or drop the check constraints that limits severity or status values to old static values (which was causing error 23514)
ALTER TABLE issues 
DROP CONSTRAINT IF EXISTS issues_severity_check;

ALTER TABLE issues 
DROP CONSTRAINT IF EXISTS issues_status_check;

-- Ensure "date_occurred" column exists for tracking when the issue happened
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS date_occurred TEXT;

-- Ensure "source_type" column exists to track how the issue was reported (e.g. MANUAL, EMAIL, etc.)
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS source_type TEXT;

-- Ensure "updates" JSONB column exists for storing status logs and timelines
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS updates JSONB DEFAULT '[]'::jsonb;


-- ==========================================
-- 2. UPDATE TABLE: beneficiaries (Penerima Manfaat)
-- ==========================================

-- Ensure "full_name" column exists (as renamed from "name" in previous schema enhancements)
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS full_name TEXT;


-- ==========================================
-- 3. VERFICATION STATUS (Optional debug query)
-- ==========================================
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('issues', 'beneficiaries') 
ORDER BY table_name, column_name;
