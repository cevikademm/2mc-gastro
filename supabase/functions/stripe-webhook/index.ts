// stripe-webhook — receives PaymentIntent events from Stripe
// ============================================================
// POST /stripe-webhook
// Verifies the signature with STRIPE_WEBHOOK_SECRET, then updates
// gastro_orders.payment_status based on the event type. Also triggers
// transactional emails via the send-email edge function.
//
// Register this URL in Stripe Dashboard → Developers → Webhooks:
// https://<project>.supabase.co/functions/v1/stripe-webhook
// Events: payment_intent.succeeded, payment_intent.payment_failed,
//         payment_intent.processing, charge.refunded

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY") || "";
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateOrder(intentId: string, payment_status: string, orderStatus?: string) {
  const update: Record<string, unknown> = { payment_status };
  if (orderStatus) update.status = orderStatus;
  await supabase.from("gastro_orders").update(update).eq("payment_intent_id", intentId);
}

async function fetchOrderEmail(intentId: string): Promise<{ email: string; orderNumber: string; total: number } | null> {
  const { data: order } = await supabase
    .from("gastro_orders")
    .select("id, user_id, order_number, total_price")
    .eq("payment_intent_id", intentId)
    .single();

  if (!order?.user_id) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", order.user_id)
    .single();

  if (!profile?.email) return null;

  return {
    email: profile.email,
    orderNumber: order.order_number,
    total: Number(order.total_price),
  };
}

async function triggerEmail(template: string, to: string, data: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ template, to, data }),
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!WEBHOOK_SECRET) return new Response("Webhook secret not configured", { status: 500 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await updateOrder(pi.id, "paid", "confirmed");
        const meta = await fetchOrderEmail(pi.id);
        if (meta) {
          await triggerEmail("order-confirmation", meta.email, {
            orderNumber: meta.orderNumber,
            total: `${(pi.amount / 100).toFixed(2)} ${pi.currency.toUpperCase()}`,
          });
        }
        break;
      }
      case "payment_intent.processing": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await updateOrder(pi.id, "processing");
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await updateOrder(pi.id, "failed");
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await updateOrder(String(charge.payment_intent), "refunded", "cancelled");
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(`Webhook handler error: ${(err as Error).message}`, { status: 500 });
  }
});
