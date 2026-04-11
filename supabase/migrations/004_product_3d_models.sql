-- Product 3D Models — MeshAI ile üretilen GLB/USDZ modellerinin cache tablosu
-- Aynı ürün için tekrar API çağrısı yapılmaz; sonuçlar Supabase Storage'da kalıcıdır.

create table if not exists public.product_3d_models (
  id uuid primary key default gen_random_uuid(),

  -- Ürünün benzersiz tanımlayıcısı (image_url veya equipmentId)
  product_key text not null unique,

  -- Görsel meta
  name text not null,
  source_image_url text not null,

  -- MeshAI task takibi
  meshy_task_id text,
  status text not null default 'pending'
    check (status in ('pending','processing','done','error')),
  progress int not null default 0,
  error text,

  -- Storage'a yüklenen final dosyalar
  glb_url text,
  usdz_url text,
  thumbnail_url text,

  -- Üretim parametreleri (debug/audit için)
  target_polycount int default 15000,
  texture_resolution int default 1024,
  ai_model text default 'meshy-4',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists product_3d_models_status_idx on public.product_3d_models(status);
create index if not exists product_3d_models_created_at_idx on public.product_3d_models(created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists product_3d_models_updated_at on public.product_3d_models;
create trigger product_3d_models_updated_at
  before update on public.product_3d_models
  for each row execute function public.set_updated_at();

-- RLS: herkes okuyabilir, sadece service role yazabilir
alter table public.product_3d_models enable row level security;

drop policy if exists "3d models readable by all" on public.product_3d_models;
create policy "3d models readable by all"
  on public.product_3d_models for select
  using (true);

drop policy if exists "3d models writable by service" on public.product_3d_models;
create policy "3d models writable by service"
  on public.product_3d_models for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Storage bucket: GLB/USDZ public okunabilir
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-3d',
  'product-3d',
  true,
  104857600, -- 100 MB
  array['model/gltf-binary','model/vnd.usdz+zip','image/png','image/jpeg','image/webp','application/octet-stream']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Bucket policies
drop policy if exists "product-3d public read" on storage.objects;
create policy "product-3d public read"
  on storage.objects for select
  using (bucket_id = 'product-3d');

drop policy if exists "product-3d service write" on storage.objects;
create policy "product-3d service write"
  on storage.objects for all
  using (bucket_id = 'product-3d' and auth.role() = 'service_role')
  with check (bucket_id = 'product-3d' and auth.role() = 'service_role');
