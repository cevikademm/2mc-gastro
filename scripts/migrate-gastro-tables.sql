-- ============================================================
-- 2MC Gastro — Supabase tablo migration
-- Tabloları drop edip text id ile yeniden oluşturur.
-- Supabase Dashboard > SQL Editor'dan çalıştırın.
-- ============================================================

-- 1. Mevcut tabloları sil (veri yoksa sorun yok)
DROP TABLE IF EXISTS gastro_cart CASCADE;
DROP TABLE IF EXISTS gastro_floor_plans CASCADE;
DROP TABLE IF EXISTS gastro_sketches CASCADE;
DROP TABLE IF EXISTS gastro_activities CASCADE;
DROP TABLE IF EXISTS gastro_user_prefs CASCADE;
DROP TABLE IF EXISTS gastro_projects CASCADE;

-- 2. gastro_projects
CREATE TABLE gastro_projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'commercial',
  area TEXT DEFAULT '',
  lead TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'drafting',
  progress INTEGER DEFAULT 0,
  client_name TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  deadline TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  room_width_cm INTEGER DEFAULT 500,
  room_height_cm INTEGER DEFAULT 400,
  products JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gastro_projects_user ON gastro_projects(user_id);

-- 3. gastro_activities
CREATE TABLE gastro_activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  activity_time TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gastro_activities_user ON gastro_activities(user_id);

-- 4. gastro_floor_plans
CREATE TABLE gastro_floor_plans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  project_id TEXT NOT NULL DEFAULT 'global',
  room_width_cm INTEGER DEFAULT 500,
  room_height_cm INTEGER DEFAULT 400,
  room_shape TEXT DEFAULT 'polygon',
  room_polygon JSONB DEFAULT '[]'::jsonb,
  wall_lengths_cm JSONB DEFAULT '[]'::jsonb,
  placed_items JSONB DEFAULT '[]'::jsonb,
  wall_openings JSONB DEFAULT '[]'::jsonb,
  room_props JSONB DEFAULT '{}'::jsonb,
  selected_item_id TEXT,
  canvas_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- 5. gastro_cart
CREATE TABLE gastro_cart (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  product_id TEXT DEFAULT 'unknown',
  product_data JSONB DEFAULT '{}'::jsonb,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gastro_cart_user ON gastro_cart(user_id);

-- 6. gastro_user_prefs
CREATE TABLE gastro_user_prefs (
  user_id TEXT PRIMARY KEY,
  favorites JSONB DEFAULT '[]'::jsonb,
  notifications JSONB DEFAULT '[]'::jsonb,
  cookie_consent BOOLEAN,
  language TEXT DEFAULT 'tr',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. gastro_sketches
CREATE TABLE gastro_sketches (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  sketch_id TEXT NOT NULL,
  name TEXT DEFAULT '',
  segments JSONB DEFAULT '[]'::jsonb,
  saved_at BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, sketch_id)
);

-- 8. RLS (Row Level Security) — opsiyonel, şimdilik devre dışı
-- Anonimous key ile erişim sağlamak için RLS kapalı bırakıyoruz
ALTER TABLE gastro_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_user_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_sketches ENABLE ROW LEVEL SECURITY;

-- Herkesin okuma/yazma yapabilmesi için policy (development)
CREATE POLICY "Allow all for gastro_projects" ON gastro_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for gastro_activities" ON gastro_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for gastro_floor_plans" ON gastro_floor_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for gastro_cart" ON gastro_cart FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for gastro_user_prefs" ON gastro_user_prefs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for gastro_sketches" ON gastro_sketches FOR ALL USING (true) WITH CHECK (true);

-- updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gastro_projects_updated
  BEFORE UPDATE ON gastro_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_gastro_floor_plans_updated
  BEFORE UPDATE ON gastro_floor_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_gastro_user_prefs_updated
  BEFORE UPDATE ON gastro_user_prefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
