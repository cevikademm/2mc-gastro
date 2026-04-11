-- Diamond EU Ürün Tablosu
CREATE TABLE IF NOT EXISTS diamond_products (
    id TEXT PRIMARY KEY,
    name TEXT,
    description_tech_spec TEXT,
    popup_info TEXT,

    -- Fiyat
    currency TEXT DEFAULT 'EUR',
    price_catalog NUMERIC,
    price_display NUMERIC,
    price_promo NUMERIC,
    page_catalog_number TEXT,
    page_promo_number TEXT,

    -- Stok
    stock TEXT,
    restock_info TEXT,
    supplier_delivery_delay INTEGER,
    days_to_restock_avg INTEGER,

    -- Boyut / Ağırlık
    length_mm TEXT,
    width_mm TEXT,
    height_mm TEXT,
    volume_m3 NUMERIC,
    weight NUMERIC,
    weight_unit TEXT,

    -- Teknik
    electric_power_kw NUMERIC,
    electric_connection TEXT,
    electric_connection_2 TEXT,
    vapor TEXT,
    kcal_power NUMERIC,
    horse_power NUMERIC,

    -- Kategori
    product_category_id TEXT,
    product_range_id TEXT,
    product_subrange_id TEXT,
    product_family_id TEXT,
    product_family_name TEXT,
    product_subfamily_id TEXT,
    product_line_id TEXT,

    -- Medya
    image_big TEXT,
    image_thumb TEXT,
    image_gallery TEXT,
    image_full TEXT,

    -- Durum
    is_new BOOLEAN DEFAULT false,
    is_old BOOLEAN DEFAULT false,
    is_good_deal BOOLEAN DEFAULT false,
    product_type INTEGER,
    has_accessories BOOLEAN DEFAULT false,
    replacement_product_id TEXT,

    -- Meta
    synced_at TIMESTAMPTZ DEFAULT now()
);

-- İndeksler (filtreleme hızı için)
CREATE INDEX IF NOT EXISTS idx_dp_category ON diamond_products(product_category_id);
CREATE INDEX IF NOT EXISTS idx_dp_family ON diamond_products(product_family_name);
CREATE INDEX IF NOT EXISTS idx_dp_promo ON diamond_products(price_promo);
CREATE INDEX IF NOT EXISTS idx_dp_new ON diamond_products(is_new);
CREATE INDEX IF NOT EXISTS idx_dp_name ON diamond_products(name);
CREATE INDEX IF NOT EXISTS idx_dp_stock ON diamond_products(stock);

-- RLS (Row Level Security) - herkese okuma izni
ALTER TABLE diamond_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes ürünleri okuyabilir"
    ON diamond_products FOR SELECT
    USING (true);

-- Sadece service_role yazabilir (Edge Function)
CREATE POLICY "Sadece service_role yazabilir"
    ON diamond_products FOR ALL
    USING (auth.role() = 'service_role');
