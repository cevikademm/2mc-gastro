-- 005_catalog_schema.sql
-- Canonical multi-brand catalog: brands, categories, products
-- Extends: profiles (role, language, addresses, vat_number, newsletter)
-- Extends: gastro_orders (structured addresses, payment + shipping fields)
-- Does NOT touch diamond_products (brand-specific sync cache, kept as-is)

-- ============================================================
-- 1. BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  logo_url    TEXT,
  website     TEXT,
  country     TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug   ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);

-- ============================================================
-- 2. CATEGORIES  (hierarchical, i18n)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  slug        TEXT NOT NULL UNIQUE,
  name_de     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  name_tr     TEXT NOT NULL,
  name_fr     TEXT,
  name_nl     TEXT,
  icon        TEXT,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  seo_title   TEXT,
  seo_desc    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug   ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- ============================================================
-- 3. PRODUCTS  (canonical, multi-brand)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,

  -- i18n names
  name_de         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  name_tr         TEXT NOT NULL,
  name_fr         TEXT,
  name_nl         TEXT,

  -- i18n descriptions
  description_de  TEXT,
  description_en  TEXT,
  description_tr  TEXT,
  description_fr  TEXT,
  description_nl  TEXT,

  -- Relations
  brand_id        UUID REFERENCES brands(id) ON DELETE SET NULL,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Commerce
  price           NUMERIC(12,2) NOT NULL,
  compare_price   NUMERIC(12,2),
  currency        TEXT NOT NULL DEFAULT 'EUR',
  stock           INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,

  -- Physical
  weight_kg       NUMERIC(10,3),
  dimensions      JSONB,    -- { length_mm, width_mm, height_mm }

  -- Technical specs + gallery
  images          TEXT[] NOT NULL DEFAULT '{}',
  specs           JSONB NOT NULL DEFAULT '{}'::jsonb,
  energy_rating   TEXT,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_brand      ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku        ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price      ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_specs_gin  ON products USING gin(specs);

-- ============================================================
-- 4. PROFILES — extend with role, language, vat, addresses
-- ============================================================
-- Role enum: b2c | b2b | admin
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('b2c', 'b2b', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role         user_role NOT NULL DEFAULT 'b2c',
  ADD COLUMN IF NOT EXISTS email        TEXT,
  ADD COLUMN IF NOT EXISTS vat_number   TEXT,
  ADD COLUMN IF NOT EXISTS language     TEXT NOT NULL DEFAULT 'tr',
  ADD COLUMN IF NOT EXISTS newsletter   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS addresses    JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Admins can read all profiles (needed for approval workflow + admin tools)
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update any profile (approval, role changes)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- 5. GASTRO_ORDERS — extend with structured payment + shipping
-- ============================================================
ALTER TABLE gastro_orders
  ADD COLUMN IF NOT EXISTS subtotal              NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS tax                   NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_cost         NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_address_json JSONB,
  ADD COLUMN IF NOT EXISTS billing_address_json  JSONB,
  ADD COLUMN IF NOT EXISTS payment_intent_id     TEXT,
  ADD COLUMN IF NOT EXISTS payment_method        TEXT,
  ADD COLUMN IF NOT EXISTS payment_status        TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS tracking_number       TEXT,
  ADD COLUMN IF NOT EXISTS tracking_carrier      TEXT,
  ADD COLUMN IF NOT EXISTS currency              TEXT NOT NULL DEFAULT 'EUR';

CREATE INDEX IF NOT EXISTS idx_orders_status          ON gastro_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent  ON gastro_orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking        ON gastro_orders(tracking_number);

-- ============================================================
-- 6. updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_brands_updated_at     ON brands;
CREATE TRIGGER trg_brands_updated_at     BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at   ON products;
CREATE TRIGGER trg_products_updated_at   BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at   ON profiles;
CREATE TRIGGER trg_profiles_updated_at   BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at     ON gastro_orders;
CREATE TRIGGER trg_orders_updated_at     BEFORE UPDATE ON gastro_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 7. RLS — brands, categories, products = public read, admin write
-- ============================================================
ALTER TABLE brands     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;

-- Public read (active rows only)
DROP POLICY IF EXISTS "Public read active brands"     ON brands;
CREATE POLICY "Public read active brands"     ON brands
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read active categories" ON categories;
CREATE POLICY "Public read active categories" ON categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read active products"   ON products;
CREATE POLICY "Public read active products"   ON products
  FOR SELECT USING (is_active = true);

-- Admin write (all operations)
DROP POLICY IF EXISTS "Admins manage brands"     ON brands;
CREATE POLICY "Admins manage brands"     ON brands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins manage categories" ON categories;
CREATE POLICY "Admins manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins manage products"   ON products;
CREATE POLICY "Admins manage products"   ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
