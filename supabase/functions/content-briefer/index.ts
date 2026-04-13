// Content briefer: generates an SEO blog brief from a target keyword.
// POST { keyword, locale?: 'tr'|'de'|'en', audience? }
// Returns: { title, slug, description, outline, faqs, tags, body }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM = `You are an expert SEO content strategist for commercial kitchen equipment (endüstriyel mutfak).
Generate high-quality, E-E-A-T compliant blog briefs optimized for search intent.
Return ONLY valid JSON matching the schema. No markdown fences.`;

function userPrompt(keyword: string, locale: string, audience?: string) {
  const lang = locale === 'de' ? 'German' : locale === 'en' ? 'English' : 'Turkish';
  return `Generate a blog post brief for the keyword: "${keyword}".
Language: ${lang}
${audience ? `Audience: ${audience}` : 'Audience: restaurant owners, hotel F&B managers, catering operators'}

Return JSON with this exact shape:
{
  "title": "SEO-optimized H1 (50-65 chars)",
  "slug": "url-safe-slug",
  "description": "Meta description (140-160 chars)",
  "excerpt": "1-2 sentence hook",
  "category": "Kurulum|Ekipman|Rehber|Karşılaştırma",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "outline": ["H2 section 1", "H2 section 2", "..."],
  "faqs": [{"question": "...", "answer": "..."}, ...6 items],
  "body": "Full article in markdown-lite: ## for H2, - for bullets, paragraphs separated by blank lines. 1200-1800 words. Include practical numbers, product categories, and internal link suggestions to /diamond, /combisteel, /tools/kitchen-calculator.",
  "reading_minutes": 8
}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { keyword, locale = 'tr', audience } = await req.json();
    if (!keyword || typeof keyword !== 'string') {
      return new Response(JSON.stringify({ error: 'keyword required' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: userPrompt(keyword, locale, audience) },
        ],
        temperature: 0.6,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: 'OpenAI error', detail: txt }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const brief = JSON.parse(content);

    return new Response(JSON.stringify({ brief }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
