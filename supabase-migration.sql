-- ========================================
-- 2MC GASTRO - Supabase Migration
-- Bu SQL'i Supabase Dashboard > SQL Editor'a yapistirin
-- ========================================

-- 1. Projects
CREATE TABLE IF NOT EXISTS gastro_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  name text NOT NULL,
  type text DEFAULT 'commercial',
  area text DEFAULT '',
  lead text DEFAULT '',
  status text DEFAULT 'drafting',
  progress integer DEFAULT 0,
  client_name text DEFAULT '',
  start_date text DEFAULT '',
  deadline text DEFAULT '',
  notes text DEFAULT '',
  room_width_cm numeric DEFAULT 500,
  room_height_cm numeric DEFAULT 400,
  products jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Floor Plans (DesignStudio) - en kritik tablo
CREATE TABLE IF NOT EXISTS gastro_floor_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  project_id text NOT NULL DEFAULT 'global',
  room_width_cm numeric DEFAULT 500,
  room_height_cm numeric DEFAULT 400,
  room_shape text DEFAULT 'polygon',
  room_polygon jsonb DEFAULT '[]'::jsonb,
  wall_lengths_cm jsonb DEFAULT '[]'::jsonb,
  placed_items jsonb DEFAULT '[]'::jsonb,
  wall_openings jsonb DEFAULT '[]'::jsonb,
  room_props jsonb DEFAULT '{}'::jsonb,
  selected_item_id text,
  canvas_state jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- 3. Sketches (Kat Plani)
CREATE TABLE IF NOT EXISTS gastro_sketches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  sketch_id text NOT NULL,
  name text NOT NULL DEFAULT 'Isimsiz',
  segments jsonb DEFAULT '[]'::jsonb,
  saved_at bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sketch_id)
);

-- 4. Cart Items
CREATE TABLE IF NOT EXISTS gastro_cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  product_id text NOT NULL,
  product_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 5. User Preferences & Notifications
CREATE TABLE IF NOT EXISTS gastro_user_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  cookie_consent boolean,
  notifications jsonb DEFAULT '[]'::jsonb,
  favorites jsonb DEFAULT '[]'::jsonb,
  language text DEFAULT 'tr',
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Activity Log
CREATE TABLE IF NOT EXISTS gastro_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  title text NOT NULL,
  description text DEFAULT '',
  activity_time text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_gastro_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['gastro_projects','gastro_floor_plans','gastro_sketches','gastro_cart','gastro_user_prefs'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', tbl);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_gastro_updated_at()', tbl);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE gastro_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_user_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_activities ENABLE ROW LEVEL SECURITY;

-- Allow all policy (anon access)
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['gastro_projects','gastro_floor_plans','gastro_sketches','gastro_cart','gastro_user_prefs','gastro_activities'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS allow_all ON %I', tbl);
    EXECUTE format('CREATE POLICY allow_all ON %I FOR ALL USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;
