import { NextResponse } from "next/server";
import { adminDB } from "@/lib/supabase/server";

const CONFIRMED = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
const OVERDUE = new Set(["PAYMENT_OVERDUE", "PAYMENT_DELETED", "PAYMENT_REFUNDED"]);

export async function POST(req: Request) {
  const token = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!token) return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
  if (req.headers.get("asaas-access-token") !== token)
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });

  let payload: { event?: string; payment?: { id?: string; subscription?: string } };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const event = payload.event;
  const payment = payload.payment;
  if (!event || !payment?.id || !payment?.subscription)
    return NextResponse.json({ ok: true, ignored: true });

  const db = adminDB();
  const eventId = `${event}:${payment.id}`;
  const { data: existing } = await db
    .from("asaas_webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, duplicate: true });

  const { data: business } = await db
    .from("businesses")
    .select("id,pending_plan_key")
    .eq("asaas_subscription_id", payment.subscription)
    .maybeSingle();

  if (business) {
    if (CONFIRMED.has(event)) {
      await db
        .from("businesses")
        .update({
          plan_key: business.pending_plan_key || "pro",
          billing_status: "ok",
          pending_plan_key: null,
        })
        .eq("id", business.id);
    } else if (OVERDUE.has(event)) {
      await db
        .from("businesses")
        .update({ billing_status: "past_due" })
        .eq("id", business.id);
    }
  }

  await db.from("asaas_webhook_events").insert({
    id: eventId,
    business_id: business?.id ?? null,
    event_type: event,
    payload: payload as object,
  });

  return NextResponse.json({ ok: true });
}
