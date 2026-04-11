# MeshAI 3D Üretim Pipeline'ı

Endüstriyel mutfak ürünlerinin görsellerinden MeshAI (Meshy.ai) üzerinden GLB + USDZ 3D modeller üretir, Supabase Storage'a kaydeder ve cache'ler.

## Mimarinin Özeti

```
Frontend (ProjectDetailPage)
  ↓ supabase.functions.invoke('meshy-3d')
Edge Function meshy-3d (Deno)
  ↓ Meshy API (image-to-3d)
  ↓ GLB + USDZ download
  ↓ Supabase Storage upload (bucket: product-3d)
  ↓ DB upsert (product_3d_models)
Frontend
  ← polling her 5sn
  ← status='done' → <model-viewer> ile gösterim
```

**Kritik:** API key client'ta YOK. Tüm istekler edge function üzerinden gider.

## 1. Migration'ı Uygula

```bash
# Supabase CLI ile
supabase db push

# VEYA Dashboard → SQL Editor'de manuel çalıştır:
# supabase/migrations/004_product_3d_models.sql
```

Bu şunları yaratır:
- `product_3d_models` tablosu (cache)
- `product-3d` storage bucket'ı (public read, 100 MB limit)
- RLS policies (herkes okur, sadece service role yazar)

## 2. Edge Function Secret'ı Ekle

Supabase Dashboard → **Project Settings → Edge Functions → Secrets**:

```
MESHY_API_KEY = msy_uqIHqhCoqTRqQJJgSZOBXdc2bSRwqHhUH3hU
```

`SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` otomatik tanımlıdır.

## 3. Edge Function'ı Deploy Et

```bash
supabase functions deploy meshy-3d --project-ref mnlgbsfarubpvkmqqvff
```

## 4. Frontend Çalışır

`ProjectDetailPage` → ürün kartlarındaki **3D** butonuna bas → seç → **3D Modelle (MeshAI)** → modal açılır, polling başlar. Tamamlanınca:
- Kart üstünde mor "3D" butonu **yeşil "3D ✓"**'ya döner
- Tıklayınca `<model-viewer>` ile döndürülebilir 3D önizleme açılır
- GLB ve USDZ indirme butonları aktif
- iOS'ta USDZ otomatik AR desteği (`ios-src`)

## Cache Mantığı

Aynı ürün için **asla tekrar API çağrısı yapılmaz**. Anahtar olarak ürünün public görsel URL'i kullanılır:

1. Frontend sayfa açılınca `product_3d_models`'ten ilgili anahtarları toplu çeker
2. `done` olanların butonu zaten yeşil görünür
3. Kullanıcı "üret" derse → edge function önce DB'ye bakar → varsa direkt döner
4. Yoksa Meshy task açar, task ID DB'ye yazılır
5. Polling sırasında her çağrıda Meshy'den durumu çeker
6. `SUCCEEDED` olunca GLB + USDZ + thumbnail indirilir, Supabase Storage'a yüklenir, DB güncellenir

## Üretim Parametreleri (edge function içinde)

- `ai_model: meshy-4`
- `topology: triangle`
- `target_polycount: 15000` (boyut/kalite dengesi için düşürüldü)
- `texture_resolution: 1024`
- `enable_pbr: true`

Daha yüksek kalite isterseniz `index.ts` içindeki `meshyCreateTask` fonksiyonunda artırın.

## Sıkıştırma

- GLB Meshy tarafında zaten optimize edilmiş halde (15k poly + 1k texture)
- 100 MB bucket limiti yeterli (tipik dosya 1-5 MB)
- İleride Draco compression eklemek için: `gltf-pipeline` ile post-process step eklenebilir, ancak Deno edge'de wasm yükü yüksek — gerekirse ayrı worker olarak çalıştırılır

## Maliyet (Meshy)

- İmage-to-3D ≈ **10 kredi / model**
- Meshy ücretsiz tier 200 kredi/ay
- Cache sayesinde aynı ürün ikinci kez maliyet üretmez

## Hata Senaryoları

| Durum | Davranış |
|---|---|
| Görsel base64 (URL değil) | Frontend hata gösterir, API'ye gitmez |
| Meshy API hatası | DB'de `status=error`, `error` mesajıyla |
| Polling timeout (10dk) | Frontend hata gösterir, edge function task'ı bırakır |
| Storage upload hatası | DB güncellenmez, sonraki çağrıda tekrar denenir |
| Tekrar üretim talebi | `error` durumundaki satır için yeni task açılır |
