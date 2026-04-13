// ai-chat — Claude API chatbot for 2MC Gastro
// ==============================================
// POST /ai-chat
// Body: { messages: [{role, content}], context?: 'catalog' | 'kitchen-planner' | 'support' }
//
// Streams Claude responses using Server-Sent Events. Uses prompt caching:
// the system prompt (brand voice + product rules) is marked ephemeral so
// subsequent turns within 5 min hit the cache.

import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.27.0";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  catalog: `Sen 2MC Gastro'nun katalog asistanısın. Profesyonel endüstriyel mutfak ekipmanlarında uzmansın.

TON:
- Profesyonel, net, saygılı. "Siz" kullan. Emoji yok, ünlem yok, abartı sıfat yok.
- Kısa cümle (≤18 kelime). Fiil öne çıkar.
- Teknik değerleri bağlamla ver: "9 kW — 80 kişilik servis için yeterli".

GÖREV:
- Kullanıcının ihtiyacına göre ekipman öner (kapasite, enerji, yer, bütçe).
- HACCP, DIN, Gastronorm terimlerini açıklayarak kullan.
- Asla uydurma ürün kodu verme; emin değilsen "Katalogtan doğrulamanızı öneririm" de.`,

  "kitchen-planner": `Sen 2MC Gastro'nun mutfak planlama asistanısın.

GÖREV:
- Kullanıcının alan, günlük kapasite, mutfak türü (restoran/otel/toplu yemek) gibi bilgilerini sor.
- HACCP akışına (temiz/kirli ayrımı, soğuk zincir) uygun düzen öner.
- Minimum ekipman listesi: ocak, fırın, buzdolabı, bulaşık, hazırlık, depolama.
- Enerji ve su bağlantı gereksinimlerini özetle.

TON: Profesyonel, "Siz", kısa cümle, bağlamlı teknik bilgi.`,

  support: `Sen 2MC Gastro müşteri destek asistanısın.

GÖREV:
- Sipariş, kargo, iade, fatura sorularını yanıtla.
- Teknik ürün sorularını katalog asistanına yönlendir.
- Emin olmadığın konularda "Ekibimize iletelim" de, uydurma.

TON: Yardımsever ama ölçülü. "Siz". Emoji yok, "hey" yok.`,
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY not set" }, 500);

  try {
    const { messages, context = "catalog" } = (await req.json()) as {
      messages: ChatMessage[];
      context?: keyof typeof SYSTEM_PROMPTS;
    };

    if (!messages?.length) return json({ error: "messages required" }, 400);

    const systemPrompt = SYSTEM_PROMPTS[context] ?? SYSTEM_PROMPTS.catalog;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: [
              {
                type: "text",
                text: systemPrompt,
                cache_control: { type: "ephemeral" },
              },
            ],
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            stream: true,
          });

          for await (const event of response) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`));
            }
            if (event.type === "message_stop") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            }
          }
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
