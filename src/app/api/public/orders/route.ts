import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/schemas";
import { adminDB } from "@/lib/supabase/server";
import { limit, sameOrigin } from "@/lib/rate-limit";
import { orderMessage, whatsappLink } from "@/lib/whatsapp";
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req))
      return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
    const text = await req.text();
    if (text.length > 16000)
      return NextResponse.json(
        { error: "Pedido muito grande." },
        { status: 413 },
      );
    const parsed = checkoutSchema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    const p = parsed.data;
    if (!(await limit(req, "orders:" + p.slug, 10)))
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    const db = adminDB();
    const { data, error } = await db.rpc("place_order", { p });
    if (error)
      return NextResponse.json(
        {
          error:
            error.code === "P0001"
              ? error.message
              : "Não foi possível registrar o pedido. Revise os itens e tente novamente.",
        },
        { status: 400 },
      );
    return NextResponse.json(
      {
        order_number: data.order.order_number,
        total: data.order.total,
        subtotal: data.order.subtotal,
        shipping_fee: data.order.shipping_fee,
        whatsapp_url: whatsappLink(
          data.whatsapp,
          orderMessage(data.business_name, data.order, data.items),
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível processar o pedido. Tente novamente." },
      { status: 503 },
    );
  }
}
