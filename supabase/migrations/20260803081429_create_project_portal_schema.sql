/*
# Project Portal Schema

1. Purpose
   A single-project public portal with three dynamic sections:
     - Project Info: title, tagline, description, status, and key metrics.
     - Updates: a timeline of project progress posts (title, body, date).
     - Notices: an admin-managed notice board. Pinned/active notices also scroll
       across the top of the site as a "sliding notice" ticker.
   An admin (email/password sign-in) updates all content from a protected panel.
   Public visitors can read everything without signing in.

2. New Tables
   - `project_info` (single row, id=1): title, tagline, description, status,
     status_color, plus four metric slots (label + value). Admin-editable.
   - `notices`: id, title, body, priority (low/normal/high), is_pinned (bool),
       is_active (bool), created_at, updated_at. Active+pinned notices feed the
       sliding ticker; all notices appear in the notice board.
   - `updates`: id, title, body, created_at. Project progress timeline entries.

3. Security
   - RLS enabled on all three tables.
   - Public read for anon + authenticated on all tables (content is public).
   - Writes restricted to `authenticated` (the signed-in admin). Since the
     frontend uses the anon key, only an authenticated admin session can write.
   - No user_id columns: this is a single shared project, not per-user data.
   - project_info uses id=1 fixed row; an UPDATE-only policy plus an INSERT
     policy (admin-only) so the row can be created if missing.

4. Notes
   - Single-tenant: one project, one admin. No per-user isolation needed.
   - created_at/updated_at default to now().
*/

-- Project info (single shared row, id fixed to 1)
CREATE TABLE IF NOT EXISTS project_info (
  id smallint PRIMARY KEY DEFAULT 1,
  title text NOT NULL DEFAULT 'Greenfield Infrastructure Initiative',
  tagline text NOT NULL DEFAULT 'Building sustainable public infrastructure for tomorrow',
  description text NOT NULL DEFAULT 'A multi-phase infrastructure program focused on sustainable development, community impact, and long-term resilience.',
  status text NOT NULL DEFAULT 'In Progress',
  status_color text NOT NULL DEFAULT 'amber',
  metric1_label text NOT NULL DEFAULT 'Phase',
  metric1_value text NOT NULL DEFAULT '2 of 5',
  metric2_label text NOT NULL DEFAULT 'Budget',
  metric2_value text NOT NULL DEFAULT '$48.2M',
  metric3_label text NOT NULL DEFAULT 'Timeline',
  metric3_value text NOT NULL DEFAULT '2024–2027',
  metric4_label text NOT NULL DEFAULT 'Team',
  metric4_value text NOT NULL DEFAULT '120+',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT project_info_single_row CHECK (id = 1)
);

ALTER TABLE project_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_project_info" ON project_info;
CREATE POLICY "public_read_project_info"
  ON project_info FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_project_info" ON project_info;
CREATE POLICY "admin_insert_project_info"
  ON project_info FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_project_info" ON project_info;
CREATE POLICY "admin_update_project_info"
  ON project_info FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Notices
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  is_pinned boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT notices_priority_check CHECK (priority IN ('low','normal','high'))
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_notices" ON notices;
CREATE POLICY "public_read_notices"
  ON notices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_notices" ON notices;
CREATE POLICY "admin_insert_notices"
  ON notices FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_notices" ON notices;
CREATE POLICY "admin_update_notices"
  ON notices FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_notices" ON notices;
CREATE POLICY "admin_delete_notices"
  ON notices FOR DELETE
  TO authenticated USING (true);

-- Updates (project progress timeline)
CREATE TABLE IF NOT EXISTS updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_updates" ON updates;
CREATE POLICY "public_read_updates"
  ON updates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_updates" ON updates;
CREATE POLICY "admin_insert_updates"
  ON updates FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_updates" ON updates;
CREATE POLICY "admin_update_updates"
  ON updates FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_updates" ON updates;
CREATE POLICY "admin_delete_updates"
  ON updates FOR DELETE
  TO authenticated USING (true);

-- updated_at auto-maintenance trigger for notices
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notices_set_updated_at ON notices;
CREATE TRIGGER notices_set_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS project_info_set_updated_at ON project_info;
CREATE TRIGGER project_info_set_updated_at
  BEFORE UPDATE ON project_info
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Seed: project info row
INSERT INTO project_info (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

-- Seed: sample notices
INSERT INTO notices (title, body, priority, is_pinned, is_active) VALUES
  ('Community Town Hall Scheduled', 'Join us for a public town hall on August 15 at the Civic Center to discuss Phase 2 progress and upcoming milestones.', 'high', true, true),
  ('Phase 2 Groundbreaking Complete', 'Groundbreaking for the second phase has officially concluded. Construction begins next week.', 'normal', false, true),
  ('New Environmental Impact Report Published', 'The latest environmental assessment is now available for public review in the documents section.', 'low', false, true)
ON CONFLICT DO NOTHING;

-- Seed: sample updates
INSERT INTO updates (title, body, created_at) VALUES
  ('Phase 2 Groundbreaking', 'Official groundbreaking ceremony for Phase 2 held on July 28. Site preparation and utility relocation now underway.', '2026-07-28T09:00:00Z'),
  ('Environmental Permits Approved', 'All required environmental permits for Phase 2 have been granted by the regulatory board after a 60-day review.', '2026-06-15T09:00:00Z'),
  ('Phase 1 Substantial Completion', 'Phase 1 infrastructure has reached substantial completion, passing all structural and safety inspections.', '2026-04-02T09:00:00Z'),
  ('Project Kickoff', 'The Greenfield Infrastructure Initiative officially launched with a consortium of public and private partners.', '2026-01-10T09:00:00Z')
ON CONFLICT DO NOTHING;
