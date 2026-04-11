"""
Genel Amaçlı Web Scraper
─────────────────────────
Herhangi bir web sayfasından bilgi çeker.

Kullanım:
    python web_scraper.py "https://example.com" --output sonuc.json
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import re
import argparse
from urllib.parse import urljoin, urlparse
import time


# ─── AYARLAR ────────────────────────────────────────────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}
TIMEOUT = 15  # saniye
# ────────────────────────────────────────────────────────────────


class WebScraper:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.soup = None

    # ── SAYFA YÜKLE ──────────────────────────────────────────────
    def fetch(self, url: str = None):
        url = url or self.base_url
        print(f"🌐 Sayfa yükleniyor: {url}")
        response = self.session.get(url, timeout=TIMEOUT)
        response.raise_for_status()
        response.encoding = response.apparent_encoding
        self.soup = BeautifulSoup(response.text, "lxml")
        print(f"✅ Yüklendi ({len(response.text)} karakter)\n")
        return self.soup

    # ── SAYFA BAŞLIĞI ────────────────────────────────────────────
    def get_title(self) -> str:
        tag = self.soup.find("title")
        return tag.get_text(strip=True) if tag else ""

    # ── META BİLGİLERİ ──────────────────────────────────────────
    def get_meta(self) -> dict:
        meta = {}
        for tag in self.soup.find_all("meta"):
            name = tag.get("name") or tag.get("property", "")
            content = tag.get("content", "")
            if name and content:
                meta[name] = content
        return meta

    # ── TÜM METİNLERİ ÇEK ──────────────────────────────────────
    def get_all_text(self) -> str:
        for tag in self.soup(["script", "style", "noscript"]):
            tag.decompose()
        return self.soup.get_text(separator="\n", strip=True)

    # ── BAŞLIKLARI ÇEK (h1-h6) ─────────────────────────────────
    def get_headings(self) -> list:
        headings = []
        for level in range(1, 7):
            for tag in self.soup.find_all(f"h{level}"):
                headings.append({
                    "level": f"h{level}",
                    "text": tag.get_text(strip=True)
                })
        return headings

    # ── LİNKLERİ ÇEK ───────────────────────────────────────────
    def get_links(self, internal_only: bool = False) -> list:
        links = []
        domain = urlparse(self.base_url).netloc
        for tag in self.soup.find_all("a", href=True):
            href = urljoin(self.base_url, tag["href"])
            text = tag.get_text(strip=True)
            if internal_only and urlparse(href).netloc != domain:
                continue
            links.append({"text": text, "url": href})
        return links

    # ── GÖRSELLERİ ÇEK ─────────────────────────────────────────
    def get_images(self) -> list:
        images = []
        for tag in self.soup.find_all("img"):
            src = tag.get("src") or tag.get("data-src", "")
            if src:
                images.append({
                    "src": urljoin(self.base_url, src),
                    "alt": tag.get("alt", "")
                })
        return images

    # ── TABLOLARI ÇEK ───────────────────────────────────────────
    def get_tables(self) -> list:
        tables = []
        for table in self.soup.find_all("table"):
            rows = []
            for tr in table.find_all("tr"):
                cells = [td.get_text(strip=True)
                         for td in tr.find_all(["td", "th"])]
                if cells:
                    rows.append(cells)
            if rows:
                tables.append(rows)
        return tables

    # ── CSS SEÇİCİ İLE ÖĞE ÇEK ────────────────────────────────
    def select(self, css_selector: str) -> list:
        """İstediğin CSS seçici ile öğe çek. Örn: 'div.product', '#price'"""
        elements = self.soup.select(css_selector)
        return [el.get_text(strip=True) for el in elements]

    # ── SAYFA ÖZETİ ─────────────────────────────────────────────
    def get_summary(self) -> dict:
        return {
            "url":       self.base_url,
            "title":     self.get_title(),
            "meta":      self.get_meta(),
            "headings":  self.get_headings(),
            "links":     len(self.get_links()),
            "images":    len(self.get_images()),
            "tables":    len(self.get_tables()),
        }

    # ── TÜM VERİYİ ÇEK ─────────────────────────────────────────
    def scrape_all(self) -> dict:
        return {
            "url":       self.base_url,
            "title":     self.get_title(),
            "meta":      self.get_meta(),
            "headings":  self.get_headings(),
            "links":     self.get_links(),
            "images":    self.get_images(),
            "tables":    self.get_tables(),
            "text":      self.get_all_text(),
        }

    # ── BİRDEN FAZLA SAYFA TARA ─────────────────────────────────
    def scrape_multiple(self, urls: list, delay: float = 1.0) -> list:
        results = []
        for i, url in enumerate(urls, 1):
            print(f"[{i}/{len(urls)}]")
            self.base_url = url
            self.fetch(url)
            results.append(self.scrape_all())
            time.sleep(delay)
        return results

    # ── KAYDET ───────────────────────────────────────────────────
    @staticmethod
    def save_json(data, filename: str):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 JSON kaydedildi: {filename}")

    @staticmethod
    def save_csv(data: list, filename: str):
        if not data:
            return
        with open(filename, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        print(f"💾 CSV kaydedildi: {filename}")


# ════════════════════════════════════════════════════════════════
#  KOMUT SATIRINDAN ÇALIŞTIRMA
# ════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Web Scraper")
    parser.add_argument("url", help="Taranacak URL")
    parser.add_argument("--output", "-o", default="scrape_result.json",
                        help="Çıktı dosyası (varsayılan: scrape_result.json)")
    parser.add_argument("--selector", "-s", default=None,
                        help="CSS seçici ile belirli öğeleri çek")
    args = parser.parse_args()

    scraper = WebScraper(args.url)
    scraper.fetch()

    if args.selector:
        result = scraper.select(args.selector)
        print(f"\n📋 '{args.selector}' sonuçları ({len(result)} öğe):")
        for item in result:
            print(f"  → {item}")
        WebScraper.save_json(result, args.output)
    else:
        result = scraper.scrape_all()
        summary = scraper.get_summary()
        print(f"\n📊 Sayfa Özeti:")
        print(f"   Başlık:   {summary['title']}")
        print(f"   Linkler:  {summary['links']}")
        print(f"   Görseller:{summary['images']}")
        print(f"   Tablolar: {summary['tables']}")
        WebScraper.save_json(result, args.output)

    print("\n🎉 Tamamlandı!")
