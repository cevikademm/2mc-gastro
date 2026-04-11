"""
Diamond EU Ürün Senkronizasyon Sunucusu
───────────────────────────────────────
- SQLite veritabanına ürünleri kaydeder
- Her 1 saatte sadece güncellenen ürünleri çeker
- Günde 1 kez tam senkronizasyon yapar
- REST API ile kendi web sitene ürün sunar

Çalıştırma:
    python sync_server.py

API Endpointler:
    GET /api/products              → Tüm ürünler (sayfalı)
    GET /api/products/<id>         → Tek ürün
    GET /api/products?search=xxx   → Ürün ara
    GET /api/products?category=xxx → Kategoriye göre filtrele
    GET /api/products?promo=1      → Promosyondakiler
    GET /api/products?new=1        → Yeni ürünler
    GET /api/products?min_price=x&max_price=y → Fiyat aralığı
    GET /api/categories            → Tüm kategoriler
    GET /api/sync/status           → Senkronizasyon durumu
    POST /api/sync/now             → Manuel senkronizasyon tetikle
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import requests as http_requests
import json
import threading
import time
import re
import sys
import os
from datetime import datetime, timedelta

sys.stdout.reconfigure(encoding='utf-8')

# ─── AYARLAR (.env dosyasından okunur) ──────────────────────────
from dotenv import load_dotenv
load_dotenv()

DIAMOND_BASE_URL = "https://api.diamond-eu.com"
DIAMOND_EMAIL    = os.getenv("DIAMOND_EMAIL", "")
DIAMOND_PASSWORD = os.getenv("DIAMOND_PASSWORD", "")
DIAMOND_LANGUAGE = os.getenv("DIAMOND_LANGUAGE", "tr")

DB_FILE          = "diamond_products.db"
SYNC_INTERVAL    = 3600      # 1 saat (saniye)
FULL_SYNC_HOUR   = 3         # Her gün saat 03:00'te tam senkronizasyon
SERVER_PORT      = 5000
# ────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)  # Tüm domainlerden erişime izin ver

sync_status = {
    "last_sync": None,
    "last_full_sync": None,
    "total_products": 0,
    "last_updated_count": 0,
    "is_syncing": False,
    "errors": []
}


# ════════════════════════════════════════════════════════════════
#  VERİTABANI
# ════════════════════════════════════════════════════════════════

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT,
            description_tech_spec TEXT,
            popup_info TEXT,

            -- Fiyat
            currency TEXT DEFAULT 'EUR',
            price_catalog REAL,
            price_display REAL,
            price_promo REAL,
            page_catalog_number TEXT,
            page_promo_number TEXT,

            -- Stok
            stock TEXT,
            restock_info TEXT,
            supplier_delivery_delay INTEGER,
            days_to_restock_avg INTEGER,

            -- Boyut
            length_mm TEXT,
            width_mm TEXT,
            height_mm TEXT,
            volume_m3 REAL,
            weight REAL,
            weight_unit TEXT,

            -- Teknik
            electric_power_kw REAL,
            electric_connection TEXT,
            electric_connection_2 TEXT,
            vapor TEXT,
            kcal_power REAL,
            horse_power REAL,

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
            is_new BOOLEAN DEFAULT 0,
            is_old BOOLEAN DEFAULT 0,
            is_good_deal BOOLEAN DEFAULT 0,
            product_type INTEGER,
            has_accessories BOOLEAN DEFAULT 0,
            replacement_product_id TEXT,

            -- Meta
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_category ON products(product_category_id);
        CREATE INDEX IF NOT EXISTS idx_family ON products(product_family_id);
        CREATE INDEX IF NOT EXISTS idx_promo ON products(price_promo);
        CREATE INDEX IF NOT EXISTS idx_new ON products(is_new);
        CREATE INDEX IF NOT EXISTS idx_name ON products(name);
    """)
    conn.commit()
    conn.close()
    print("✅ Veritabanı hazır.\n")


# ════════════════════════════════════════════════════════════════
#  DIAMOND API İSTEMLERİ
# ════════════════════════════════════════════════════════════════

class DiamondSync:
    def __init__(self):
        self.token = None
        self.token_expires_at = None

    def login(self):
        print("🔐 Diamond API'ye giriş yapılıyor...")
        r = http_requests.post(
            f"{DIAMOND_BASE_URL}/auth/login",
            json={"email": DIAMOND_EMAIL, "password": DIAMOND_PASSWORD},
            timeout=15
        )
        r.raise_for_status()
        data = r.json()
        self.token = data["access_token"]
        self.token_expires_at = datetime.now() + timedelta(seconds=data.get("expires_in", 7200) - 60)
        print("✅ Giriş başarılı.\n")

    def ensure_token(self):
        if not self.token or datetime.now() >= self.token_expires_at:
            self.login()

    def get_headers(self):
        self.ensure_token()
        return {
            "Authorization": f"Bearer {self.token}",
            "Accept-Language": DIAMOND_LANGUAGE
        }

    def fetch_all_products(self):
        """Tüm ürünleri çeker"""
        print("📦 Tüm ürünler çekiliyor...")
        products = []
        url = f"{DIAMOND_BASE_URL}/products-export?filter[is_old][value]=0"

        while url:
            r = http_requests.get(url, headers=self.get_headers(), timeout=30)
            r.raise_for_status()
            data = r.json()
            products.extend(data.get("data", []))
            print(f"   → {len(products)} ürün...")
            url = data.get("links", {}).get("next")

        print(f"✅ Toplam {len(products)} ürün çekildi.\n")
        return products

    def fetch_updated_products(self, since: str):
        """Belirli tarihten sonra güncellenen ürünleri çeker"""
        print(f"🔄 {since} tarihinden sonra güncellenenler çekiliyor...")
        products = []
        url = (
            f"{DIAMOND_BASE_URL}/products-export"
            f"?filter[is_old][value]=0"
            f"&filter[products.updated_at][value]={since}"
            f"&filter[products.updated_at][op]=gt"
        )

        while url:
            r = http_requests.get(url, headers=self.get_headers(), timeout=30)
            r.raise_for_status()
            data = r.json()
            products.extend(data.get("data", []))
            url = data.get("links", {}).get("next")

        print(f"✅ {len(products)} güncellenmiş ürün bulundu.\n")
        return products


def save_products_to_db(products):
    """Ürünleri veritabanına kaydet/güncelle"""
    illegal_chars = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f]')

    def clean(val):
        if isinstance(val, str):
            return illegal_chars.sub("", val)
        return val

    conn = get_db()
    now = datetime.now().isoformat()

    for p in products:
        attr = p.get("attributes", {})
        price = attr.get("price", {})
        media = attr.get("media", {})
        images = media.get("images", [])

        img_big = images[0].get("Big", "") if images else ""
        img_thumb = images[0].get("thumb", "") if images else ""
        img_gallery = images[0].get("Thumb-gallery", "") if images else ""
        img_full = images[0].get("full", "") if images else ""

        conn.execute("""
            INSERT OR REPLACE INTO products VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?
            )
        """, (
            clean(p.get("id", "")),
            clean(attr.get("name", "")),
            clean(attr.get("description_tech_spec", "")),
            clean(attr.get("popup_info", "")),

            price.get("currency", "EUR"),
            price.get("catalog"),
            price.get("display"),
            price.get("promo"),
            attr.get("page_catalog_number"),
            attr.get("page_promo_number"),

            str(attr.get("stock", "")),
            attr.get("restock_info"),
            attr.get("supplier_delivery_delay"),
            attr.get("days_to_restock_avg"),

            attr.get("length_mm"),
            attr.get("width_mm"),
            attr.get("height_mm"),
            attr.get("volume_m3"),
            attr.get("weight"),
            attr.get("weight_unit"),

            attr.get("electric_power_kw"),
            attr.get("electric_connection"),
            attr.get("electric_connection_2"),
            attr.get("vapor"),
            attr.get("kcal_power"),
            attr.get("horse_power"),

            attr.get("product_category_id"),
            attr.get("product_range_id"),
            attr.get("product_subrange_id"),
            attr.get("product_family_id"),
            attr.get("product_family_name"),
            attr.get("product_subfamily_id"),
            attr.get("product_line_id"),

            img_big,
            img_thumb,
            img_gallery,
            img_full,

            1 if attr.get("is_new") else 0,
            1 if attr.get("is_old") else 0,
            1 if attr.get("is_good_deal") else 0,
            attr.get("product_type"),
            1 if attr.get("has_accessories") else 0,
            attr.get("replacement_product_id"),

            now,
            now,
        ))

    conn.commit()
    total = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    conn.close()
    return total


# ════════════════════════════════════════════════════════════════
#  SENKRONIZASYON DÖNGÜSÜ
# ════════════════════════════════════════════════════════════════

diamond = DiamondSync()


def run_sync(full=False):
    global sync_status
    if sync_status["is_syncing"]:
        print("⏳ Senkronizasyon zaten çalışıyor, atlanıyor.\n")
        return

    sync_status["is_syncing"] = True
    try:
        if full or sync_status["last_full_sync"] is None:
            # TAM SENKRONİZASYON
            print("=" * 50)
            print("🔄 TAM SENKRONİZASYON BAŞLIYOR")
            print("=" * 50)
            products = diamond.fetch_all_products()
            total = save_products_to_db(products)
            sync_status["last_full_sync"] = datetime.now().isoformat()
            sync_status["last_updated_count"] = len(products)
        else:
            # ARTIMSAL SENKRONİZASYON (sadece güncellenenleri çek)
            since = sync_status["last_sync"] or (datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")
            products = diamond.fetch_updated_products(since)
            if products:
                total = save_products_to_db(products)
            else:
                conn = get_db()
                total = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
                conn.close()
            sync_status["last_updated_count"] = len(products)

        sync_status["last_sync"] = datetime.now().isoformat()
        sync_status["total_products"] = total
        print(f"✅ Senkronizasyon tamamlandı. Toplam: {total} ürün\n")

    except Exception as e:
        error_msg = f"{datetime.now().isoformat()} - {str(e)}"
        sync_status["errors"].append(error_msg)
        sync_status["errors"] = sync_status["errors"][-10:]  # Son 10 hata
        print(f"❌ Senkronizasyon hatası: {e}\n")

    finally:
        sync_status["is_syncing"] = False


def sync_loop():
    """Arka planda çalışan senkronizasyon döngüsü"""
    # İlk çalışmada tam senkronizasyon
    run_sync(full=True)

    while True:
        time.sleep(SYNC_INTERVAL)
        now = datetime.now()

        # Her gün belirli saatte tam senkronizasyon
        if now.hour == FULL_SYNC_HOUR and now.minute < 5:
            run_sync(full=True)
        else:
            run_sync(full=False)


# ════════════════════════════════════════════════════════════════
#  REST API ENDPOINTLERI (Kendi siten için)
# ════════════════════════════════════════════════════════════════

@app.route("/api/products", methods=["GET"])
def get_products():
    conn = get_db()

    # Filtreler
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))
    search   = request.args.get("search", "")
    category = request.args.get("category", "")
    family   = request.args.get("family", "")
    promo    = request.args.get("promo", "")
    new_only = request.args.get("new", "")
    min_price = request.args.get("min_price", "")
    max_price = request.args.get("max_price", "")
    sort     = request.args.get("sort", "name")
    order    = request.args.get("order", "asc")

    where_clauses = ["is_old = 0"]
    params = []

    if search:
        where_clauses.append("(name LIKE ? OR id LIKE ? OR description_tech_spec LIKE ?)")
        params.extend([f"%{search}%"] * 3)

    if category:
        where_clauses.append("product_category_id = ?")
        params.append(category)

    if family:
        where_clauses.append("product_family_id = ?")
        params.append(family)

    if promo == "1":
        where_clauses.append("price_promo IS NOT NULL AND price_promo > 0")

    if new_only == "1":
        where_clauses.append("is_new = 1")

    if min_price:
        where_clauses.append("CAST(price_catalog AS REAL) >= ?")
        params.append(float(min_price))

    if max_price:
        where_clauses.append("CAST(price_catalog AS REAL) <= ?")
        params.append(float(max_price))

    where_sql = " AND ".join(where_clauses)

    # Güvenli sıralama
    allowed_sorts = ["name", "price_catalog", "price_promo", "stock", "id", "updated_at"]
    if sort not in allowed_sorts:
        sort = "name"
    order_dir = "DESC" if order.lower() == "desc" else "ASC"

    # Toplam sayı
    count = conn.execute(f"SELECT COUNT(*) FROM products WHERE {where_sql}", params).fetchone()[0]

    # Sayfalı sonuç
    offset = (page - 1) * per_page
    rows = conn.execute(
        f"SELECT * FROM products WHERE {where_sql} ORDER BY {sort} {order_dir} LIMIT ? OFFSET ?",
        params + [per_page, offset]
    ).fetchall()

    products = [dict(row) for row in rows]
    conn.close()

    return jsonify({
        "success": True,
        "data": products,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": count,
            "total_pages": (count + per_page - 1) // per_page
        }
    })


@app.route("/api/products/<product_id>", methods=["GET"])
def get_product(product_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()

    if row:
        return jsonify({"success": True, "data": dict(row)})
    return jsonify({"success": False, "error": "Ürün bulunamadı"}), 404


@app.route("/api/categories", methods=["GET"])
def get_categories():
    conn = get_db()
    rows = conn.execute("""
        SELECT product_category_id, product_family_name,
               COUNT(*) as product_count
        FROM products
        WHERE is_old = 0
        GROUP BY product_category_id, product_family_name
        ORDER BY product_family_name
    """).fetchall()
    conn.close()

    return jsonify({
        "success": True,
        "data": [dict(row) for row in rows]
    })


@app.route("/api/sync/status", methods=["GET"])
def get_sync_status():
    return jsonify({"success": True, "data": sync_status})


@app.route("/api/sync/now", methods=["POST"])
def trigger_sync():
    full = request.args.get("full", "0") == "1"
    thread = threading.Thread(target=run_sync, kwargs={"full": full})
    thread.daemon = True
    thread.start()
    return jsonify({"success": True, "message": "Senkronizasyon başlatıldı"})


# ════════════════════════════════════════════════════════════════
#  ANA AKIŞ
# ════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 50)
    print("  Diamond EU Senkronizasyon Sunucusu")
    print("=" * 50)
    print(f"  Port:            {SERVER_PORT}")
    print(f"  Sync aralığı:    {SYNC_INTERVAL // 60} dakika")
    print(f"  Tam sync saati:  {FULL_SYNC_HOUR:02d}:00")
    print(f"  Veritabanı:      {DB_FILE}")
    print("=" * 50 + "\n")

    # Veritabanını başlat
    init_db()

    # Arka planda senkronizasyon başlat
    sync_thread = threading.Thread(target=sync_loop, daemon=True)
    sync_thread.start()

    # API sunucusunu başlat
    print(f"🚀 API sunucusu başlatılıyor: http://localhost:{SERVER_PORT}\n")
    app.run(host="0.0.0.0", port=SERVER_PORT, debug=False)
