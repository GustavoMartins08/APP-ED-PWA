-- ==============================================================================
-- BACKEND IMPROVEMENTS MIGRATION
-- Perform the following actions in the Supabase SQL Editor.
-- ==============================================================================

-- 1. PERFORMANCE INDICES
-- Speed up Home Feed and Category Filtering
CREATE INDEX IF NOT EXISTS idx_news_published_premium ON news_items (published_at DESC, is_premium);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_items (category);

-- Speed up Video and Editorial feeds
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_editorials_published ON editorials (published_at DESC);


-- 2. SECURITY (RLS)
-- Ensure 'subscription_status' cannot be updated by normal users
-- First, revoke update on specific columns if possible, but RLS applies to rows.
-- We will add a policy that only allows updates to 'subscription_status' by service_role or admin.

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can update their own profile EXCEPT subscription_status and role
-- Note: Supabase doesn't support column-level RLS directly in CREATE POLICY easily without triggers or separate checks.
-- Better approach: Use a specific UPDATE policy using `WITH CHECK`.

CREATE OR REPLACE POLICY "Users can update own basic info" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND (
     -- If the new row's role/subscription_status IS DIFFERENT from the old row, deny.
     -- However, in a pure policy we can't easily access the "OFF" (old) record without functions.
     -- SIMPLER: Only allow updates if the user is NOT trying to change restricted columns.
     -- This is complex in pure SQL Policies.
     -- ALTERNATIVE: Use a Trigger to protect these columns.
     true
  )
);

-- Trigger to protect sensitive columns
CREATE OR REPLACE FUNCTION protect_sensitive_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is NOT admin/service_role and tries to change role
  IF (NEW.role IS DISTINCT FROM OLD.role) AND (auth.role() != 'service_role') THEN
      RAISE EXCEPTION 'You cannot update your own role.';
  END IF;
  
  -- If user is NOT admin/service_role and tries to change subscription_status
  IF (NEW.subscription_status IS DISTINCT FROM OLD.subscription_status) AND (auth.role() != 'service_role') THEN
      RAISE EXCEPTION 'You cannot update your subscription status manually.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_protect_profile_fields ON profiles;

CREATE TRIGGER tr_protect_profile_fields
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION protect_sensitive_columns();


-- 3. AUTOMATIC CLEANUP (pg_cron)
-- Requires pg_cron extension enable in Dashboard > Database > Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule: Delete inquiries older than 90 days every Sunday at 3am
SELECT cron.schedule(
  'cleanup-old-leads',
  '0 3 * * 0', -- Every Sunday at 3:00 AM
  $$DELETE FROM advertiser_inquiries WHERE created_at < now() - INTERVAL '90 days'$$
);

-- Optional: Vacuum analysis for maintenance
SELECT cron.schedule(
  'weekly-vacuum',
  '30 3 * * 0', -- Every Sunday at 3:30 AM
  $$VACUUM ANALYZE news_items$$
);
