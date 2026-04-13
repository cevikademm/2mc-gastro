-- 006_seed_products_from_diamond.sql
-- Populate the canonical `products` table from `diamond_products` sync cache.
-- Idempotent via ON CONFLICT on sku — safe to re-run to pick up new diamond rows.
-- Data flow: diamond_products (raw sync) → products (canonical catalog)

-- ============================================================
-- 1. Ensure "Diamond" brand exists
-- ============================================================
INSERT INTO brands (slug, name, country, website, is_active, sort_order)
VALUES (
  'diamond',
  'Diamond',
  'IT',
  'https://www.diamond-eu.com',
  true,
  10
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    country = EXCLUDED.country,
    website = EXCLUDED.website,
    is_active = EXCLUDED.is_active;

-- ============================================================
-- 2. Seed products from diamond_products
-- ============================================================
WITH diamond_brand AS (
  SELECT id FROM brands WHERE slug = 'diamond' LIMIT 1
)
INSERT INTO products (
  sku,
  slug,
  name_de,
  name_en,
  name_tr,
  description_de,
  description_en,
  description_tr,
  brand_id,
  price,
  compare_price,
  currency,
  stock,
  is_active,
  weight_kg,
  dimensions,
  images,
  specs
)
SELECT
  'DIAMOND-' || dp.id                                            AS sku,
  lower(regexp_replace('diamond-' || dp.id, '[^a-z0-9-]+', '-', 'g')) AS slug,
  COALESCE(NULLIF(dp.name, ''), 'Diamond ' || dp.id)             AS name_de,
  COALESCE(NULLIF(dp.name, ''), 'Diamond ' || dp.id)             AS name_en,
  COALESCE(NULLIF(dp.name, ''), 'Diamond ' || dp.id)             AS name_tr,
  dp.description_tech_spec                                        AS description_de,
  dp.description_tech_spec                                        AS description_en,
  dp.description_tech_spec                                        AS description_tr,
  (SELECT id FROM diamond_brand)                                  AS brand_id,
  COALESCE(dp.price_display, dp.price_catalog, 0)::numeric(12,2)  AS price,
  CASE
    WHEN dp.price_promo IS NOT NULL
     AND dp.price_promo > 0
     AND dp.price_promo < COALESCE(dp.price_display, dp.price_catalog, 0)
    THEN COALESCE(dp.price_display, dp.price_catalog)::numeric(12,2)
    ELSE NULL
  END                                                             AS compare_price,
  COALESCE(dp.currency, 'EUR')                                    AS currency,
  CASE
    WHEN dp.stock ~ '^[0-9]+$' THEN dp.stock::integer
    ELSE 0
  END                                                             AS stock,
  true                                                            AS is_active,
  dp.weight                                                       AS weight_kg,
  jsonb_strip_nulls(jsonb_build_object(
    'length_mm', NULLIF(dp.length_mm, ''),
    'width_mm',  NULLIF(dp.width_mm, ''),
    'height_mm', NULLIF(dp.height_mm, '')
  ))                                                              AS dimensions,
  ARRAY(
    SELECT x FROM unnest(ARRAY[dp.image_big, dp.image_full, dp.image_thumb]) x
    WHERE x IS NOT NULL AND x <> ''
  )                                                               AS images,
  jsonb_strip_nulls(jsonb_build_object(
    'diamond_id',          dp.id,
    'electric_power_kw',   dp.electric_power_kw,
    'electric_connection', NULLIF(dp.electric_connection, ''),
    'vapor',               NULLIF(dp.vapor, ''),
    'kcal_power',          dp.kcal_power,
    'horse_power',         dp.horse_power,
    'volume_m3',           dp.volume_m3,
    'family_name',         NULLIF(dp.product_family_name, ''),
    'is_new',              dp.is_new,
    'is_good_deal',        dp.is_good_deal,
    'page_catalog',        NULLIF(dp.page_catalog_number, '')
  ))                                                              AS specs
FROM diamond_products dp
WHERE dp.name IS NOT NULL AND dp.name <> ''
ON CONFLICT (sku) DO UPDATE
SET name_de       = EXCLUDED.name_de,
    name_en       = EXCLUDED.name_en,
    name_tr       = EXCLUDED.name_tr,
    description_de = EXCLUDED.description_de,
    description_en = EXCLUDED.description_en,
    description_tr = EXCLUDED.description_tr,
    price         = EXCLUDED.price,
    compare_price = EXCLUDED.compare_price,
    currency      = EXCLUDED.currency,
    stock         = EXCLUDED.stock,
    weight_kg     = EXCLUDED.weight_kg,
    dimensions    = EXCLUDED.dimensions,
    images        = EXCLUDED.images,
    specs         = EXCLUDED.specs,
    updated_at    = now();
