// sync-meilisearch — sync products table to Meilisearch
// =======================================================
// POST /sync-meilisearch
// Body: { mode?: 'full' | 'incremental', since?: ISO8601 }
//
// Pulls rows from `products` joined with `brands` and `categories`, flattens
// for search, and pushes them to Meilisearch. Admin API key is server-side.
//
// Schedule from Supabase cron (every 10 min) or trigger on product updates.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MeiliSearch } from "https://esm.sh/meilisearch@0.38.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const MEILI_HOST = Deno.env.get("MEILI_HOST") || "";
const MEILI_ADMIN_KEY = Deno.env.get("MEILI_ADMIN_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const meili = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_ADMIN_KEY });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function ensureIndex() {
  const index = meili.index("products");
  await index.updateSettings({
    searchableAttributes: [
      "sku",
      "name_tr",
      "name_de",
      "name_en",
      "name_fr",
      "name_nl",
      "brand_name",
      "category_name",
    ],
    filterableAttributes: ["brand_id", "category_id", "energy_rating", "is_active", "price"],
    sortableAttributes: ["price", "created_at"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
    typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
  });
  return index;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!MEILI_HOST || !MEILI_ADMIN_KEY) return json({ error: "Meilisearch env vars missing" }, 500);

  try {
    const body = (await req.json().catch(() => ({}))) as { mode?: "full" | "incremental"; since?: string };
    const mode = body.mode ?? "incremental";

    let query = supabase
      .from("products")
      .select(`
        id, sku, slug, name_tr, name_de, name_en, name_fr, name_nl,
        price, currency, stock, is_active, energy_rating, images, created_at, updated_at,
        brand_id, category_id,
        brand:brands(name),
        category:categories(name_tr, name_de, name_en)
      `)
      .eq("is_active", true);

    if (mode === "incremental") {
      const since = body.since ?? new Date(Date.now() - 15 * 60 * 1000).toISOString();
      query = query.gte("updated_at", since);
    }

    const { data: rows, error } = await query.limit(10000);
    if (error) return json({ error: error.message }, 500);
    if (!rows || rows.length === 0) return json({ ok: true, synced: 0 });

    const documents = rows.map((r: any) => ({
      id: r.id,
      sku: r.sku,
      slug: r.slug,
      name_tr: r.name_tr,
      name_de: r.name_de,
      name_en: r.name_en,
      name_fr: r.name_fr,
      name_nl: r.name_nl,
      price: Number(r.price),
      currency: r.currency,
      stock: r.stock,
      is_active: r.is_active,
      energy_rating: r.energy_rating,
      image: r.images?.[0] ?? null,
      brand_id: r.brand_id,
      brand_name: r.brand?.name ?? null,
      category_id: r.category_id,
      category_name: r.category?.name_tr ?? null,
      created_at: r.created_at,
    }));

    const index = await ensureIndex();
    const task = await index.addDocuments(documents, { primaryKey: "id" });

    return json({ ok: true, synced: documents.length, task_uid: task.taskUid });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
