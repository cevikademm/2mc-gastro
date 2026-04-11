// Vercel Serverless Function — CombiSteel PIM Senkronizasyon
// Her gün saat 06:00 UTC'de Vercel Cron tarafından tetiklenir

import { createClient } from "@supabase/supabase-js";

const COMBISTEEL_API =
  "https://pim.combisteel.com/pimcore-graphql-webservices/Combisteel";
const COMBISTEEL_KEY = process.env.COMBISTEEL_API_KEY!;
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || "";
const PIM_BASE = "https://pim.combisteel.com";

export const config = { maxDuration: 300 };

const PRODUCT_QUERY = `
query GetProducts($first: Int!, $after: Int!) {
  getProductListing(first: $first, after: $after, sortBy: "sku") {
    totalCount
    edges {
      node {
        id
        sku
        title
        description
        longDescription
        brand
        ean
        dimensions
        length
        width
        height
        depth
        grossWeight
        netWeight
        price
        stock
        productType
        defaultImage { fullpath }
        extraImages { image { fullpath } }
        category {
          ... on object_Category { id name }
        }
        technicalSpecification {
          name
          features {
            ... on csFeatureInput { name text }
            ... on csFeatureNumeric { name number }
            ... on csFeatureSelect { name selection }
            ... on csFeatureQuantityValue { name quantityvalue { value unit { abbreviation } } }
            ... on csFeatureInputQuantityValue { name inputquantityvalue { value unit { abbreviation } } }
            ... on csFeatureCheckbox { name checked }
            ... on csFeatureBooleanSelect { name checked }
          }
        }
      }
    }
  }
}`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST" && !req.headers["x-vercel-cron"]) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const isVercelCron = req.headers["x-vercel-cron"] === "1";
  const hasValidSecret =
    CRON_SECRET && req.headers["authorization"] === `Bearer ${CRON_SECRET}`;

  if (!isVercelCron && !hasValidSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!COMBISTEEL_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const start = Date.now();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const now = new Date().toISOString();

    // 1. Tüm ürünleri çek
    const allProducts: any[] = [];
    const pageSize = 50;
    let after = 0;
    let totalCount = 0;

    do {
      const url = `${COMBISTEEL_API}?apikey=${COMBISTEEL_KEY}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: PRODUCT_QUERY,
          variables: { first: pageSize, after },
        }),
      });

      const json = await r.json();
      if (json.errors) {
        throw new Error(`GraphQL errors: ${json.errors.map((e: any) => e.message).join(", ")}`);
      }

      const listing = json.data.getProductListing;
      totalCount = listing.totalCount;
      const edges = listing.edges || [];

      for (const { node } of edges) {
        const cats = (node.category || []).filter(Boolean);
        const firstCat = cats[0] || {};
        const imgPath = node.defaultImage?.fullpath;

        const techSpecs: any[] = [];
        for (const group of node.technicalSpecification || []) {
          for (const feat of group.features || []) {
            const spec: any = { group: group.name, name: feat.name };
            if ("text" in feat && feat.text) spec.value = feat.text;
            else if ("number" in feat && feat.number) spec.value = feat.number;
            else if ("selection" in feat && feat.selection) spec.value = feat.selection;
            else if ("checked" in feat) spec.value = feat.checked ? "Yes" : "No";
            else if ("quantityvalue" in feat && feat.quantityvalue) {
              spec.value = feat.quantityvalue.value;
              spec.unit = feat.quantityvalue.unit?.abbreviation || "";
            } else if ("inputquantityvalue" in feat && feat.inputquantityvalue) {
              spec.value = feat.inputquantityvalue.value;
              spec.unit = feat.inputquantityvalue.unit?.abbreviation || "";
            } else continue;
            if (spec.value !== null && spec.value !== undefined) {
              techSpecs.push(spec);
            }
          }
        }

        const extraImgs = (node.extraImages || [])
          .filter((ei: any) => ei?.image?.fullpath)
          .map((ei: any) => `${PIM_BASE}${ei.image.fullpath}`);

        allProducts.push({
          id: node.id,
          sku: node.sku || "",
          title: node.title || "",
          description: node.description || "",
          long_description: node.longDescription || null,
          brand: node.brand || "",
          ean: node.ean || null,
          dimensions: node.dimensions || null,
          length_mm: node.length || null,
          width_mm: node.width || null,
          height_mm: node.height || null,
          depth_mm: node.depth || null,
          gross_weight: node.grossWeight || null,
          net_weight: node.netWeight || null,
          price: node.price || null,
          stock: node.stock ?? null,
          product_type: node.productType || null,
          image_url: imgPath ? `${PIM_BASE}${imgPath}` : null,
          extra_images: extraImgs,
          category_id: firstCat.id || null,
          category_name: firstCat.name || null,
          tech_specs: techSpecs,
          synced_at: now,
        });
      }

      after += pageSize;
    } while (after < totalCount);

    // 2. Supabase'e upsert (100'er batch)
    let upserted = 0;
    for (let i = 0; i < allProducts.length; i += 100) {
      const batch = allProducts.slice(i, i + 100);
      const { error } = await supabase
        .from("combisteel_products")
        .upsert(batch, { onConflict: "id" });
      if (error) throw new Error(`Upsert error: ${error.message}`);
      upserted += batch.length;
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    return res.status(200).json({
      success: true,
      products_synced: upserted,
      total_from_api: totalCount,
      duration_seconds: duration,
      synced_at: now,
    });
  } catch (error: any) {
    console.error("[sync-combisteel] Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Sync failed. Check server logs for details.",
    });
  }
}
