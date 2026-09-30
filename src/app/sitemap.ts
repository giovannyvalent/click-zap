import type { MetadataRoute } from "next";
import { configured, publicDB } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const routes = [
    "",
    "/catalogo-whatsapp",
    "/pedidos-whatsapp",
    "/como-funciona",
    "/precos",
  ].map((path) => ({ url: base + path }));
  if (configured()) {
    const { data } = await publicDB()
      .from("businesses")
      .select("slug,products!inner(id)")
      .eq("published", true);
    if (data)
      routes.push(...data.map((b) => ({ url: base + "/loja/" + b.slug })));
  }
  return routes;
}
