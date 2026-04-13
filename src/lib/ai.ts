// AI client — streams Claude responses from the ai-chat edge function
// =====================================================================
// Usage:
//   const stream = chatWithAI({ messages, context: 'catalog' });
//   for await (const chunk of stream) setAnswer(prev => prev + chunk);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type AIContext = "catalog" | "kitchen-planner" | "support";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatParams {
  messages: ChatMessage[];
  context?: AIContext;
}

export async function* chatWithAI(params: ChatParams): AsyncGenerator<string, void, unknown> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase env vars not set");
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok || !response.body) {
    throw new Error(`AI chat failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const payload = JSON.parse(line.slice(6));
        if (payload.error) throw new Error(payload.error);
        if (payload.done) return;
        if (payload.delta) yield payload.delta as string;
      } catch {
        // skip malformed chunks
      }
    }
  }
}
