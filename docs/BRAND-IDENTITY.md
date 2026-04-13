# 2MC Gastro — Marka Kimliği Kılavuzu

> Versiyon 1.0 · 2026-04-11
> Sorumlu: 2MC Gastro Design Ops

Bu doküman; logo, renk, tipografi, görsel dil ve yazım tonunun **tek doğruluk kaynağıdır**. Hem dijital (web, PWA, PDF) hem basılı (katalog, fuar) tüm üretimler bu kılavuza uymak zorundadır.

---

## 1. Marka Özü

**İsim:** 2MC Gastro
**Kategori:** Profesyonel endüstriyel mutfak planlama & ekipman platformu
**Merkez:** Köln, Almanya (Bergisch Gladbacher Str. 172, 51063)
**Hedef kitle:** Restoran, otel, toplu yemek, catering sahip ve işletmecileri; mutfak mühendisleri; B2B alıcılar (DE, TR, NL, FR, EU).

**Marka vaadi:**
> "Endüstriyel mutfağını 3D tasarla, 10.000+ ekipmandan seç, HACCP uyumlu profesyonel teklifi tek tıkla oluştur."

**Marka kişiliği:**
- **Profesyonel** — mühendislik hassasiyeti, ölçülü dil
- **Güvenilir** — net fiyat, net teslimat, net garanti
- **Modern** — 3D, AI destekli planlama, bulut tabanlı iş akışı
- **Endüstriyel** — çelik, hassas tolerans, ağır kullanım

**Farklılaşma:** Rakipler (BigGastro, GGMGastro) kırmızı/siyah yoğunluklu, katalog odaklı bir dil kullanıyor. 2MC Gastro **lacivert + cyan/turuncu vurgu** ile "yazılım ürünü hissi" veren, **3D planlama odaklı** tek oyuncu.

---

## 2. Logo

### 2.1 Primer varlıklar

| Varyant | Kullanım | Dosya |
|---|---|---|
| Ana logo (wordmark + ikon) | Web header, PDF kapak, fuar | `public/logo-2mc-gastro.jpeg` · Supabase: `2mcwerbung/logo4.png` |
| Werbung varyantı (alternatif) | Pazarlama, sosyal medya | `public/logo-werbung.png` · Supabase: `2mcwerbung/logo_werbung.png` |
| Sadece ikon | Favicon, app icon, avatar | `public/logo-icon.png`, `public/favicon.svg` |
| OG / paylaşım | Sosyal medya paylaşımları | `public/logo-2mc-gastro.jpeg` (1200×630) |

**Supabase CDN (canlı URL'ler — PDF/e-posta için):**
- `https://ohcytmzyjvpfsqejujzs.supabase.co/storage/v1/object/public/2mcwerbung/logo4.png`
- `https://ohcytmzyjvpfsqejujzs.supabase.co/storage/v1/object/public/2mcwerbung/logo_werbung.png`

### 2.2 Güvenli alan (clear space)

Logonun her yönünde, logo yüksekliğinin **½'si kadar** boşluk bırakılır. Bu alana metin, ikon, kenar veya resim girmez.

### 2.3 Minimum boyut

- Dijital: yükseklik ≥ **24 px** (ikon), ≥ **32 px** (wordmark)
- Basılı: yükseklik ≥ **10 mm** (wordmark)

Bu boyutun altında sadece ikon varyantı kullanılır.

### 2.4 Yapılmayacaklar ❌

- Logoyu germe, eğme, döndürme
- Renklerini değiştirme (onaylı varyantlar dışında)
- Gölge, outline, glow efekti ekleme
- Düşük kontrastlı arka plana (ör. açık gri üzerine beyaz) yerleştirme
- Fotoğraf üzerine saydam katman olmadan yerleştirme
- Wordmark ile ikonu birbirinden koparma (hizalı varyant varken)

---

## 3. Renk Paleti

Kaynağın-doğruluğu: [src/index.css](../src/index.css) içindeki `@theme` bloğu. Bu doküman yalnızca **semantik açıklamasıdır**. Renk değeri değiştiğinde önce `index.css`, sonra bu doküman güncellenir.

### 3.1 Primer — Lacivert (Deep Navy)

| Token | Hex | Kullanım |
|---|---|---|
| `--color-primary` | `#001f65` | Birincil buton, ana vurgu, header |
| `--color-primary-container` | `#183585` | Gradient ikinci durak, kart vurgusu |
| `--color-primary-fixed` | `#dce1ff` | Light-mode primary arka plan |
| `--color-primary-fixed-dim` | `#b6c4ff` | Hover/seçili açık arka plan |

**Marka mesajı:** Güven, mühendislik, kurumsal derinlik. Ana marka rengi budur; hiçbir alternatif "2MC mavisi" yoktur.

### 3.2 Sekonder & Tersiyer

| Token | Hex | Kullanım |
|---|---|---|
| `--color-secondary` | `#515f74` | Yardımcı UI, subdued metin, ikincil buton |
| `--color-secondary-container` | `#d5e3fc` | Bilgilendirme kartı arka planı |
| `--color-tertiary` | `#1e2539` | Koyu UI yüzeyi, footer |
| `--color-tertiary-fixed` | `#dae2fd` | Light-mode tertiary arka plan |

### 3.3 Yüzey (nötr)

| Token | Hex | Rol |
|---|---|---|
| `--color-surface` | `#f7f9fb` | Sayfa zemini (light) |
| `--color-surface-container-lowest` | `#ffffff` | Kart zemini |
| `--color-surface-container-low` | `#f2f4f6` | Hafif vurgu |
| `--color-surface-container` | `#eceef0` | Panel arka planı |
| `--color-surface-container-high` | `#e6e8ea` | Yüksek vurgu panel |
| `--color-surface-container-highest` | `#e0e3e5` | En yüksek panel |
| `--color-on-surface` | `#191c1e` | Birincil metin |
| `--color-on-surface-variant` | `#43474c` | İkincil metin |
| `--color-outline-variant` | `#c4c6cd` | Kenar, ayraç, grid |

### 3.4 Durum

| Token | Hex | Rol |
|---|---|---|
| `--color-success` | `#1b7f3a` | Başarı, onay |
| `--color-success-container` | `#c8f2d4` | Başarı arka plan |
| `--color-warning` | `#9a6700` | Dikkat, bekleyen işlem |
| `--color-warning-container` | `#ffe8b0` | Uyarı arka plan |
| `--color-info` | `#1e5fbf` | Bilgi, ipucu |
| `--color-info-container` | `#dbe9ff` | Bilgi arka plan |
| `--color-error` | `#ba1a1a` | Hata, kritik uyarı |
| `--color-error-container` | `#ffdad6` | Hata arka plan |

Tailwind'in `emerald-*`, `amber-*`, `blue-*` sabitleri doğrudan kullanılmaz — durum renkleri yalnızca bu token'lar üzerinden tüketilir.

### 3.5 Kontrast kuralı

WCAG AA (4.5:1) metin minimum. Primer buton zemininde (`#001f65`) yalnızca **beyaz (`#ffffff`) metin** kullanılır. `--color-surface-container` üzerinde en az `on-surface-variant` (`#43474c`) kullanılır, daha açık gri metin yasaktır.

### 3.6 Gradient kullanımı

- `brushed-metal` utility → `primary → primary-container` — CTA butonlar ve kart vurguları için.
- Rastgele iki-renk gradyan (ör. mor→pembe) **yasaktır**. Tüm gradyanlar brand paletinden türer.

---

## 4. Tipografi

### 4.1 Font aileleri

| Rol | Font | Ağırlıklar | CSS değişkeni |
|---|---|---|---|
| Başlık + Gövde / UI | **Inter** | 400, 500, 600, 700, 800 | `--font-headline`, `--font-body` |
| Mono / kod / token | **JetBrains Mono** | 400, 500, 700 | `--font-mono` |

Her ikisi de [src/index.css:1](../src/index.css#L1) içinden Google Fonts üzerinden yüklenir. Üçüncü bir font ailesi eklenmez.

Başlık ve gövde aynı aile (Inter) üzerinde farklı ağırlıklarla ayrışır: başlıklar **700/800**, gövde **400/500**. Tek-aile yaklaşımı "yazılım ürünü" hissini güçlendirir, yükleme süresini düşürür.

### 4.2 Ölçek

| Rol | Sınıf | Boyut | Ağırlık | Line-height |
|---|---|---|---|---|
| Display | `text-5xl font-extrabold` | 48 px | 800 | 1.05 |
| H1 | `text-4xl font-bold` | 36 px | 700 | 1.1 |
| H2 | `text-3xl font-bold` | 30 px | 700 | 1.15 |
| H3 | `text-2xl font-semibold` | 24 px | 600 | 1.2 |
| H4 | `text-xl font-semibold` | 20 px | 600 | 1.3 |
| Body Lg | `text-lg` | 18 px | 400 | 1.6 |
| Body | `text-base` | 16 px | 400 | 1.6 |
| Small | `text-sm` | 14 px | 400 | 1.5 |
| Caption | `text-xs` | 12 px | 500 | 1.4 |

**Başlıklarda Space Grotesk**, **gövde + UI'de Inter** kullanılır. Sayısal değerler (fiyat, ölçü, ağırlık) her zaman **Inter tabular-nums** ile hizalanır (`font-feature-settings: "tnum"`).

### 4.3 Yazım kuralları

- Marka adı her zaman **"2MC Gastro"** — "2mc gastro", "2MC-Gastro", "2MCGastro" yanlıştır.
- İlk harf büyük; hiçbir yerde "2mc" küçük yazılmaz.
- UI'de "Projeler", "Sepet", "Ayarlar" gibi sayfa adları i18n anahtarı üzerinden gelir; manuel yazılmaz.

---

## 5. İkonografi & Görsel Dil

- **İkon kütüphanesi:** [lucide-react](https://lucide.dev). Başka kütüphane karıştırılmaz.
- **Stroke:** 1.5-2 px. Dolgulu ikon kullanılmaz (rozet/badge hariç).
- **Boyut:** UI'de 16 / 20 / 24 px. Button içi 16 px, nav 20 px, header 24 px.
- **3D görseller:** Ekipman modelleri `public/models/` altında glTF. Zemin: nötr gri, gölge yumuşak. Stüdyo render dışında fotoğraf kullanılmaz.
- **Fotoğraf:** Mutfak fotoğrafları net, iyi aydınlatılmış, **paslanmaz çelik odaklı**. Eğitim görselleri ≠ stok fotoğraf hissi.
- **Illüstrasyon:** Soyut geometrik (`GradientDots`, `QuantumFluxBackground`, `ParticlesSwarm`) arka planlar sadece landing + welcome sayfalarında. Uygulama içinde yasaktır.

---

## 6. Bileşen davranışı (özet)

| Bileşen | Kural |
|---|---|
| Primary button | `brushed-metal` gradient + beyaz metin + 12 px radius |
| Secondary button | `surface-container` zemin + `on-surface` metin + `outline-variant` kenar |
| Kart | `surface-container-lowest` + 16 px radius + `outline-variant` 1px kenar |
| Panel | `glass-panel` utility (blur 20 px) sadece overlay'larda |
| Form input | `surface-container-low` zemin, focus: `primary` outline |

---

## 7. Marka Sesi & Ton

**Dil öncelik sırası:** TR → DE → EN → FR → NL. i18n anahtarları [src/i18n/](../src/i18n/) altında.

### 7.1 Ton konumu

> **Profesyonel ama sıcak · Uzman ama ulaşılabilir**

Bir mühendisle değil, sahası olan bir meslektaşla konuşur gibi. Soğuk kurumsal dil (bankacılık, hukuk) değil; aşırı samimi start-up dili (emoji, ünlem, "hey!") hiç değil. İkisinin arasında, teknik güven veren ama insanı duvara dayamayan bir ses.

**Dört marka kişiliği ekseninde ton:**

| Eksen | Az | Çok |
|---|---|---|
| Resmiyet | kurumsal tebligat ❌ | **net, saygılı, ölçülü** ✅ |
| Sıcaklık | robotik ❌ | **yardımsever, ulaşılabilir** ✅ · aşırı içten ❌ |
| Otorite | çekingen ❌ | **mühendis güveni** ✅ · küstah ❌ |
| Mizah | — | **yok veya çok ince** (iş aracı, eğlence değil) |

### 7.2 Hitap — "Siz" kuralı

| Dil | Biçim | Örnek |
|---|---|---|
| TR | **"Siz" · resmi ikinci çoğul** | "Mutfağınızı 3D olarak tasarlayın." |
| DE | **"Sie" · Höflichkeitsform** | "Gestalten Sie Ihre Küche in 3D." |
| EN | **"you" (doğası gereği nötr)** — ancak "yo!", "hey" gibi samimiyet işaretleri yok | "Design your kitchen in 3D." |
| FR | **"vous" · vouvoiement** | "Concevez votre cuisine en 3D." |
| NL | **"u" · formele aanspreekvorm** | "Ontwerp uw keuken in 3D." |

**Yasak:** DE "du/dein", TR "sen/senin", FR "tu/ton", NL "je/jouw". Hitap hatası brand-level bir hatadır — bir B2B alıcısına "sen" denmez.

### 7.3 Dil karakteri

- **Teknik ama anlaşılır.** kW, cm, L, °C değerlerini saklamayın; ama yanına bağlam koyun: "9 kW — 80 kişilik servis için yeterli" ✅ vs. "9 kW" ✅ (yalın). "9000 watt'lık muhteşem güç" ❌.
- **Jargon, pazarlama süsü değil eğitimdir.** HACCP, DIN 18866, Gastronorm gibi terimler açıklanarak geçer, süs için kullanılmaz.
- **Kısa cümle.** Ortalama ≤ 18 kelime. Virgülle uzatılmış "ama aynı zamanda" cümleleri kırılır.
- **Fiil öne çıkar.** CTA'da her zaman fiil: "Teklif oluşturun", "Projeye ekleyin", "3D planlayın".
- **Fiyat söylemi değer odaklı.** "En ucuz" ❌ — "En uygun fiyat" / "Bester Preis" / "Best Value" ✅. 2MC Gastro ucuzcu değil; mühendisliğe değer verir.
- **Emoji yoktur.** Bildirim, hata, başarı, boş-durum, her yerde yok.
- **Ünlem işareti yoktur** — "Kaydedildi." ✅ · "Kaydedildi!" ❌. Tek istisna: gerçek kritik uyarı ("Dikkat! Veri kaybı olabilir." → hatta burada bile tercihen "Dikkat:").
- **Abartı kelimeler yoktur.** "devrim niteliğinde", "harika", "inanılmaz", "muhteşem", "revolutionary", "amazing", "awesome", "wahnsinnig", "unglaublich" — hepsi dışarıda.

### 7.4 "Söyle / Söyleme" — kısa sözlük

| ✅ Söyle | ❌ Söyleme | Neden |
|---|---|---|
| "Mutfağınızı dönüştürün." | "En ucuz fiyatlar!" | Değer > fiyat savaşı |
| "Teklif oluşturun." | "Hadi başlayalım!" | Fiil + net eylem |
| "3D planlayın." | "Mutfağını büyüle!" | Hitap + abartı |
| "Sepete ekleyin." | "Harika seçim!" | Yorum değil, eylem |
| "9 kW — 80 kişilik servise uygun." | "9000 watt muazzam güç!" | Bağlamlı teknik bilgi |
| "Kaydedildi." | "Başardık! 🎉" | Sakin onay, emoji yok |
| "Bir hata oluştu. Lütfen tekrar deneyin." | "Aaa, bir şeyler ters gitti!" | Nötr, saygılı hata |
| "Ekipman bulunamadı." | "Maalesef elimizde yok 😢" | Kuru gerçek > duygu sömürüsü |
| "Teslimat 5–7 iş günü." | "Süper hızlı teslimat!" | Net sayı > sıfat |
| "Gestalten Sie Ihre Küche." | "Lass uns loslegen!" | Sie + fiil, du-duyurusu değil |

### 7.5 Mikro-copy kuralları

- **Buton etiketi:** Fiil + nesne. 1–3 kelime. "Teklifi indir", "Projeye ekle", "3D'ye geç".
- **Boş durum:** Ne eksik + tek eylem. "Henüz proje yok. İlk projenizi oluşturun." — "Burası çok sessiz 🌙" ❌.
- **Onay mesajı:** Geçmiş zaman, kısa. "Kaydedildi." / "Gönderildi." / "Sepete eklendi."
- **Hata mesajı:** Ne oldu + ne yapılmalı. Suçlama yok. "Bağlantı kesildi. Lütfen tekrar deneyin." ✅ · "Yanlış bir şey yaptınız" ❌.
- **Bildirim (toast):** ≤ 10 kelime. Tek cümle. Emoji yok.
- **Placeholder:** Örnek veri, talimat değil. "ör. Otel Kaya — Ana Mutfak" ✅ · "Proje adı giriniz!" ❌.

### 7.6 Uygulama notu

- Tüm UI metinleri [src/i18n/](../src/i18n/) üzerinden geçer; bileşen içine sabit metin yazılmaz.
- Yeni bir metin eklerken §7.4 tablosunu kontrol edin; şüphedeyseniz "Söyle" sütunuyla eşleşene kadar düzenleyin.
- Bir çeviri bu tona uymuyorsa, çeviri değil **yeniden yazım** gerekir — kelime-kelime eşleme değil, eşdeğer ton.

---

## 8. Uygulama alanları

| Varlık | Dosya / konum | Durum |
|---|---|---|
| Favicon | [public/favicon.svg](../public/favicon.svg) | ✅ |
| Apple touch icon | [public/logo-icon.png](../public/logo-icon.png) | ✅ |
| PWA manifest | [public/site.webmanifest](../public/site.webmanifest) | ✅ |
| OG image | [index.html:36](../index.html#L36) | ✅ (1200×630) |
| Twitter card | [index.html:47-53](../index.html#L47-L53) | ✅ |
| PDF watermark | [src/lib/pdfWatermark.ts](../src/lib/pdfWatermark.ts) | ✅ |
| PDF kapak logosu | [src/pages/projects/ProjectDetailPage.tsx](../src/pages/projects/ProjectDetailPage.tsx) | ✅ |
| Sepet/sipariş header | [src/components/Cart.tsx](../src/components/Cart.tsx) | ✅ |
| E-posta şablonu | — | ⏳ (yok) |
| Fuar / basılı şablon | — | ⏳ (yok) |

---

## 9. Güncelleme süreci

1. Renk / font değişikliği önce [src/index.css](../src/index.css) `@theme` bloğunda yapılır.
2. Ardından bu doküman güncellenir (tablolar + versiyon numarası).
3. Logo değişikliği Supabase `2mcwerbung` bucket'ına yeni dosya olarak yüklenir; eski dosya silinmez (geriye dönük PDF'ler için).
4. Her değişiklik commit mesajında `brand:` prefix'i alır.

---

## 10. Hızlı referans

```
Primary      #001f65   lacivert
Primary Alt  #183585   lacivert açık
Tertiary     #1e2539   koyu UI
Surface      #f7f9fb   sayfa zemini
On-surface   #191c1e   metin
Error        #ba1a1a   hata

Başlık       Inter 700/800
Gövde        Inter 400/500/600
Mono         JetBrains Mono 400/500/700
İkon         lucide-react, 1.5px stroke
Radius       12 px (buton), 16 px (kart)
```
