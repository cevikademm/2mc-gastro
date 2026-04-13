-- ============================================================
-- 2MC GASTRO - Eksik Tabloların Oluşturulması
-- Supabase SQL Editor'de çalıştırın
-- Tarih: 2026-04-13
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. profiles tablosuna eksik kolonlar
-- ─────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'b2c';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription TEXT DEFAULT 'free';

-- ─────────────────────────────────────────────
-- 1. diamond_products
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diamond_products (
  id TEXT PRIMARY KEY,
  name TEXT,
  description_tech_spec TEXT,
  popup_info TEXT,
  currency TEXT DEFAULT 'EUR',
  price_catalog NUMERIC,
  price_display NUMERIC,
  price_promo NUMERIC,
  page_catalog_number TEXT,
  page_promo_number TEXT,
  stock TEXT,
  restock_info TEXT,
  supplier_delivery_delay TEXT,
  days_to_restock_avg TEXT,
  length_mm NUMERIC,
  width_mm NUMERIC,
  height_mm NUMERIC,
  volume_m3 NUMERIC,
  weight NUMERIC,
  weight_unit TEXT,
  electric_power_kw TEXT,
  electric_connection TEXT,
  electric_connection_2 TEXT,
  vapor TEXT,
  kcal_power TEXT,
  horse_power TEXT,
  product_category_id TEXT,
  product_range_id TEXT,
  product_subrange_id TEXT,
  product_family_id TEXT,
  product_family_name TEXT,
  product_subfamily_id TEXT,
  product_line_id TEXT,
  image_big TEXT DEFAULT '',
  image_thumb TEXT DEFAULT '',
  image_gallery TEXT DEFAULT '',
  image_full TEXT DEFAULT '',
  is_new BOOLEAN DEFAULT false,
  is_old BOOLEAN DEFAULT false,
  is_good_deal BOOLEAN DEFAULT false,
  product_type TEXT,
  has_accessories BOOLEAN DEFAULT false,
  replacement_product_id TEXT,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diamond_name ON diamond_products(name);
CREATE INDEX IF NOT EXISTS idx_diamond_category ON diamond_products(product_category_id);
CREATE INDEX IF NOT EXISTS idx_diamond_family ON diamond_products(product_family_name);
CREATE INDEX IF NOT EXISTS idx_diamond_price ON diamond_products(price_catalog);

ALTER TABLE diamond_products ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diamond_products' AND policyname = 'diamond_public_read') THEN
    CREATE POLICY diamond_public_read ON diamond_products FOR SELECT USING (true);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 2. combisteel_products
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS combisteel_products (
  id TEXT PRIMARY KEY,
  sku TEXT,
  title TEXT,
  description TEXT,
  long_description TEXT,
  brand TEXT,
  ean TEXT,
  dimensions TEXT,
  length_mm INT,
  width_mm INT,
  height_mm INT,
  depth_mm INT,
  gross_weight NUMERIC,
  net_weight NUMERIC,
  price NUMERIC,
  stock INT,
  product_type TEXT,
  image_url TEXT,
  extra_images JSONB DEFAULT '[]',
  category_id TEXT,
  category_name TEXT,
  tech_specs JSONB DEFAULT '[]',
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_combisteel_sku ON combisteel_products(sku);
CREATE INDEX IF NOT EXISTS idx_combisteel_category ON combisteel_products(category_name);
CREATE INDEX IF NOT EXISTS idx_combisteel_brand ON combisteel_products(brand);
CREATE INDEX IF NOT EXISTS idx_combisteel_price ON combisteel_products(price);

ALTER TABLE combisteel_products ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'combisteel_products' AND policyname = 'combisteel_public_read') THEN
    CREATE POLICY combisteel_public_read ON combisteel_products FOR SELECT USING (true);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 3. sync_logs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT,
  product_name TEXT,
  change_type TEXT,
  details JSONB,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_synced ON sync_logs(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON sync_logs(change_type);

ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sync_logs' AND policyname = 'sync_logs_public_read') THEN
    CREATE POLICY sync_logs_public_read ON sync_logs FOR SELECT USING (true);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 4. gastro_orders
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastro_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  items JSONB DEFAULT '[]',
  total_price NUMERIC DEFAULT 0,
  total_items INT DEFAULT 0,
  notes TEXT,
  shipping_address TEXT,
  tracking_number TEXT,
  tracking_carrier TEXT,
  payment_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gastro_orders_user ON gastro_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_gastro_orders_status ON gastro_orders(status);
CREATE INDEX IF NOT EXISTS idx_gastro_orders_created ON gastro_orders(created_at DESC);

ALTER TABLE gastro_orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_orders' AND policyname = 'gastro_orders_own') THEN
    CREATE POLICY gastro_orders_own ON gastro_orders FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_orders' AND policyname = 'gastro_orders_admin_read') THEN
    CREATE POLICY gastro_orders_admin_read ON gastro_orders FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_orders' AND policyname = 'gastro_orders_admin_update') THEN
    CREATE POLICY gastro_orders_admin_update ON gastro_orders FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 5. gastro_order_events
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastro_order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES gastro_orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order ON gastro_order_events(order_id);

ALTER TABLE gastro_order_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_order_events' AND policyname = 'order_events_own') THEN
    CREATE POLICY order_events_own ON gastro_order_events FOR ALL USING (
      EXISTS (SELECT 1 FROM gastro_orders WHERE gastro_orders.id = order_id AND gastro_orders.user_id = auth.uid())
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 6. gastro_projects
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastro_projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  type TEXT,
  area TEXT DEFAULT '',
  lead TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  progress INT DEFAULT 0,
  client_name TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  deadline TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  room_width_cm INT DEFAULT 500,
  room_height_cm INT DEFAULT 400,
  products JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gastro_projects_user ON gastro_projects(user_id);

ALTER TABLE gastro_projects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_projects' AND policyname = 'gastro_projects_own') THEN
    CREATE POLICY gastro_projects_own ON gastro_projects FOR ALL USING (user_id = auth.uid()::text);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 7. gastro_activities
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastro_activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  activity_time TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gastro_activities_user ON gastro_activities(user_id);

ALTER TABLE gastro_activities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_activities' AND policyname = 'gastro_activities_own') THEN
    CREATE POLICY gastro_activities_own ON gastro_activities FOR ALL USING (user_id = auth.uid()::text);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 8. gastro_floor_plans
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastro_floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  project_id TEXT DEFAULT 'global',
  room_width_cm INT DEFAULT 500,
  room_height_cm INT DEFAULT 400,
  room_shape TEXT DEFAULT 'polygon',
  room_polygon JSONB DEFAULT '[]',
  wall_lengths_cm JSONB DEFAULT '[]',
  placed_items JSONB DEFAULT '[]',
  wall_openings JSONB DEFAULT '[]',
  room_props JSONB DEFAULT '{}',
  selected_item_id TEXT,
  canvas_state JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_gastro_floor_user ON gastro_floor_plans(user_id);

ALTER TABLE gastro_floor_plans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_floor_plans' AND policyname = 'gastro_floor_own') THEN
    CREATE POLICY gastro_floor_own ON gastro_floor_plans FOR ALL USING (user_id = auth.uid()::text);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 9. gastro_sketches
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastro_sketches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  sketch_id TEXT NOT NULL,
  name TEXT,
  segments JSONB DEFAULT '[]',
  saved_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, sketch_id)
);

CREATE INDEX IF NOT EXISTS idx_gastro_sketches_user ON gastro_sketches(user_id);

ALTER TABLE gastro_sketches ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_sketches' AND policyname = 'gastro_sketches_own') THEN
    CREATE POLICY gastro_sketches_own ON gastro_sketches FOR ALL USING (user_id = auth.uid()::text);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 10. gastro_cart
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastro_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id TEXT,
  product_data JSONB,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gastro_cart_user ON gastro_cart(user_id);

ALTER TABLE gastro_cart ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_cart' AND policyname = 'gastro_cart_own') THEN
    CREATE POLICY gastro_cart_own ON gastro_cart FOR ALL USING (user_id = auth.uid()::text);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 11. gastro_user_prefs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastro_user_prefs (
  user_id TEXT PRIMARY KEY,
  favorites JSONB DEFAULT '[]',
  notifications JSONB DEFAULT '[]',
  cookie_consent BOOLEAN,
  language TEXT DEFAULT 'tr',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gastro_user_prefs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gastro_user_prefs' AND policyname = 'gastro_prefs_own') THEN
    CREATE POLICY gastro_prefs_own ON gastro_user_prefs FOR ALL USING (user_id = auth.uid()::text);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 12. blog_posts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  locale TEXT DEFAULT 'tr',
  title TEXT NOT NULL,
  description TEXT,
  excerpt TEXT,
  category TEXT DEFAULT 'Genel',
  tags JSONB DEFAULT '[]',
  author TEXT DEFAULT '2MC Gastro',
  image TEXT,
  body TEXT,
  faq JSONB DEFAULT '[]',
  reading_minutes INT DEFAULT 5,
  status TEXT DEFAULT 'draft',
  date_published TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_slug_locale ON blog_posts(slug, locale);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'blog_public_read') THEN
    CREATE POLICY blog_public_read ON blog_posts FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'blog_admin_all') THEN
    CREATE POLICY blog_admin_all ON blog_posts FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 13. leads
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT,
  meta JSONB DEFAULT '{}',
  captured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_insert_anon') THEN
    CREATE POLICY leads_insert_anon ON leads FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_admin_read') THEN
    CREATE POLICY leads_admin_read ON leads FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 14. product_3d_models
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_3d_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_key TEXT NOT NULL UNIQUE,
  name TEXT,
  source_image_url TEXT,
  meshy_task_id TEXT,
  meshy_preview_id TEXT,
  meshy_refine_id TEXT,
  stage TEXT,
  status TEXT DEFAULT 'pending',
  progress INT DEFAULT 0,
  error TEXT,
  glb_url TEXT,
  usdz_url TEXT,
  fbx_url TEXT,
  obj_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_3d_models_key ON product_3d_models(product_key);
CREATE INDEX IF NOT EXISTS idx_3d_models_status ON product_3d_models(status);

ALTER TABLE product_3d_models ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_3d_models' AND policyname = '3d_models_public_read') THEN
    CREATE POLICY "3d_models_public_read" ON product_3d_models FOR SELECT USING (true);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 15. product_reviews
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  author_name TEXT DEFAULT 'Kullanıcı',
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'reviews_public_read') THEN
    CREATE POLICY reviews_public_read ON product_reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'reviews_auth_insert') THEN
    CREATE POLICY reviews_auth_insert ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- Migration tamamlandı!
-- ============================================================
