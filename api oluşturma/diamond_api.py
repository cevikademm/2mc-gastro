import requests
import json
from datetime import datetime

BASE_URL = "https://api.diamond-eu.com"

# ─── KİMLİK BİLGİLERİ (.env dosyasından okunur) ─────────────────
import os
from dotenv import load_dotenv
load_dotenv()

EMAIL    = os.getenv("DIAMOND_EMAIL", "")
PASSWORD = os.getenv("DIAMOND_PASSWORD", "")
LANGUAGE = os.getenv("DIAMOND_LANGUAGE", "tr")
# ────────────────────────────────────────────────────────────────


class DiamondAPI:
    def __init__(self):
        self.session = requests.Session()
        self.token   = None
        self.session.headers.update({"Accept-Language": LANGUAGE})

    # ── 1. GİRİŞ ────────────────────────────────────────────────
    def login(self):
        print("🔐 Giriş yapılıyor...")
        response = self.session.post(
            f"{BASE_URL}/auth/login",
            json={"email": EMAIL, "password": PASSWORD}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        print(f"✅ Giriş başarılı! Token alındı (geçerlilik: {data.get('expires_in', 3600)} sn)\n")
        return self.token

    # ── 2. TÜM ÜRÜNLERİ ÇEK ────────────────────────────────────
    def get_all_products(self):
        print("📦 Tüm ürünler çekiliyor...")
        all_products = []
        url = f"{BASE_URL}/products-export?filter[is_old][value]=0"

        while url:
            response = self.session.get(url)
            response.raise_for_status()
            data = response.json()
            products = data.get("data", [])
            all_products.extend(products)
            print(f"   → {len(all_products)} ürün alındı...")

            # Sonraki sayfa varsa devam et
            url = data.get("links", {}).get("next")

        print(f"✅ Toplam {len(all_products)} ürün alındı.\n")
        return all_products

    # ── 3. PROMOSYONDAKI ÜRÜNLERİ ÇEK ──────────────────────────
    def get_promo_products(self):
        print("🏷️  Promosyondaki ürünler çekiliyor...")
        url = (
            f"{BASE_URL}/products-export"
            f"?filter[is_old][value]=0"
            f"&filter[page_promo_number][value]=null"
            f"&filter[page_promo_number][op]=ne"
        )
        response = self.session.get(url)
        response.raise_for_status()
        data = response.json()
        products = data.get("data", [])
        print(f"✅ {len(products)} promosyon ürünü alındı.\n")
        return products

    # ── 4. BELİRLİ TARİHTEN SONRA GÜNCELLENEN ÜRÜNLER ──────────
    def get_updated_products(self, since_date: str):
        """since_date formatı: 'YYYY-MM-DD' veya 'YYYY-MM-DD HH:MM:SS'"""
        print(f"🔄 {since_date} tarihinden sonra güncellenen ürünler çekiliyor...")
        encoded_date = since_date.replace(" ", "%2520")
        url = (
            f"{BASE_URL}/products-export"
            f"?filter[is_old][value]=0"
            f"&filter[products.updated_at][value]={encoded_date}"
            f"&filter[products.updated_at][op]=gt"
        )
        response = self.session.get(url)
        response.raise_for_status()
        data = response.json()
        products = data.get("data", [])
        print(f"✅ {len(products)} güncellenmiş ürün alındı.\n")
        return products

    # ── 5. KATEGORİ / MENÜ AĞACI ────────────────────────────────
    def get_menu_trees(self):
        print("🌳 Kategori ağacı çekiliyor...")
        response = self.session.get(f"{BASE_URL}/menu-trees")
        response.raise_for_status()
        data = response.json()
        print("✅ Kategori ağacı alındı.\n")
        return data

    # ── 6. SİPARİŞ OLUŞTUR ──────────────────────────────────────
    def create_order(self, reference: str, items: list,
                     equipment_delivery: dict, spare_parts_delivery: dict,
                     comments: str = ""):
        """
        items örneği:
        [
            {"type": "products",    "id": "CAR-1M/B",   "qty": 1},
            {"type": "spare-parts", "id": "10000859",   "qty": 2},
        ]

        equipment_delivery / spare_parts_delivery örneği:
        {
            "date": "2024-06-01 10:00:00",
            "type": "STORE",           # UPS | HOME | STORE
            "address": {
                "company": "Firma Adı",
                "address": "Adres",
                "address2": None,
                "postal_code": "34000",
                "city": "Istanbul",
                "country": "TR",
                "contact_name": "Ad Soyad",
                "telephone_number": "+905001234567",
                "deliverToCompanyAddress": True
            }
        }
        """
        print(f"🛒 Sipariş oluşturuluyor... (Referans: {reference})")
        payload = {
            "comments":              comments,
            "is_draft":              0,
            "reference":             reference,
            "items":                 items,
            "equipment_delivery":    equipment_delivery,
            "spare_parts_delivery":  spare_parts_delivery,
        }
        response = self.session.post(f"{BASE_URL}/orders", json=payload)
        response.raise_for_status()
        data = response.json()
        print("✅ Sipariş oluşturuldu!\n")
        return data

    # ── YARDIMCI: JSON dosyasına kaydet ─────────────────────────
    @staticmethod
    def save_to_file(data, filename: str):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 Kaydedildi: {filename}")


# ════════════════════════════════════════════════════════════════
#  ANA AKIŞ
# ════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    api = DiamondAPI()

    # 1. Giriş yap
    api.login()

    # 2. Tüm ürünleri çek ve kaydet
    products = api.get_all_products()
    DiamondAPI.save_to_file(products, "products_all.json")

    # 3. Promosyondaki ürünleri çek
    promo = api.get_promo_products()
    DiamondAPI.save_to_file(promo, "products_promo.json")

    # 4. Son 7 günde güncellenen ürünleri çek
    updated = api.get_updated_products("2024-03-29")
    DiamondAPI.save_to_file(updated, "products_updated.json")

    # 5. Kategori ağacını çek
    menu = api.get_menu_trees()
    DiamondAPI.save_to_file(menu, "menu_trees.json")

    # 6. Örnek sipariş oluştur (gerçek sipariş olacak, dikkatli kullan!)
    # order = api.create_order(
    #     reference="MY-ORDER-001",
    #     comments="Test siparişi",
    #     items=[
    #         {"type": "products",    "id": "CAR-1M/B", "qty": 1},
    #         {"type": "spare-parts", "id": "10000859", "qty": 1},
    #     ],
    #     equipment_delivery={
    #         "date": "2024-06-01 10:00:00",
    #         "type": "STORE",
    #         "address": {
    #             "company": "Firma Adım",
    #             "address": "Adresim",
    #             "address2": None,
    #             "postal_code": "34000",
    #             "city": "Istanbul",
    #             "country": "TR",
    #             "contact_name": "Ad Soyad",
    #             "telephone_number": "+905001234567",
    #             "deliverToCompanyAddress": True
    #         }
    #     },
    #     spare_parts_delivery={
    #         "date": "2024-06-01 10:00:00",
    #         "type": "STORE",
    #         "address": {
    #             "company": "Firma Adım",
    #             "address": "Adresim",
    #             "address2": None,
    #             "postal_code": "34000",
    #             "city": "Istanbul",
    #             "country": "TR",
    #             "contact_name": "Ad Soyad",
    #             "telephone_number": "+905001234567",
    #             "deliverToCompanyAddress": True
    #         }
    #     }
    # )
    # DiamondAPI.save_to_file(order, "order_result.json")

    print("\n🎉 Tüm işlemler tamamlandı!")
