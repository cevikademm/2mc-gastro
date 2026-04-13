import { supabase } from "./supabase";

export interface CreatePaymentIntentParams {
  order_id: string;
  amount: number;
  currency?: string;
}

export interface CreatePaymentIntentResult {
  client_secret: string;
  payment_intent_id: string;
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams,
): Promise<CreatePaymentIntentResult> {
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase.functions.invoke("create-payment-intent", {
    body: params,
  });

  if (error) throw new Error(error.message);
  if (!data?.client_secret) throw new Error(data?.error || "Missing client_secret");

  return {
    client_secret: data.client_secret,
    payment_intent_id: data.payment_intent_id,
  };
}
