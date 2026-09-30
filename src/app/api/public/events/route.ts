import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDB } from "@/lib/supabase/server";
import { limit, sameOrigin } from "@/lib/rate-limit";
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return new Response(null, { status: 403 });
    const text = await req.text();
    if (text.length > 500) return new Response(null, { status: 413 });
    const p = z
      .object({
        slug: z.string().max(60),
        event: z.enum([
          "store_view",
          "product_view",
          "add_to_cart",
          "begin_order",
          "whatsapp_opened",
        ]),
      })
      .parse(JSON.parse(text));
    if (!(await limit(req, "events:" + p.slug, 90)))
      return new Response(null, { status: 429 });
    const db = adminDB();
    const { data: b } = await db
      .from("businesses")
      .select("id")
      .eq("slug", p.slug)
      .eq("published", true)
      .maybeSingle();
    if (b)
      await db
        .from("analytics_events")
        .insert({ business_id: b.id, event: p.event });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Evento não registrado." },
      { status: 400 },
    );
  }
}
