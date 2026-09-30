import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { configured, serverDB, publicDB } from "./supabase/server";
import type { DashboardData, StoreData, Business } from "./types";
export async function requireUser() {
  if (!configured()) redirect("/configurar");
  const db = await serverDB();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/entrar");
  return { db, user };
}
export const ownerContext = cache(async () => {
  const { db, user } = await requireUser();
  const { data, error } = await db
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar sua empresa.");
  if (!data) redirect("/onboarding");
  const { data: business, error: err } = await db
    .from("businesses")
    .select("*")
    .eq("id", data.business_id)
    .single();
  if (err) throw new Error("Empresa indisponível.");
  return { db, user, business: business as Business };
});
async function allOrders(
  db: Awaited<ReturnType<typeof serverDB>>,
  businessId: string,
) {
  const rows: unknown[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await db
      .from("orders")
      .select("*,order_items(*)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .order("id")
      .range(offset, offset + 999);
    if (result.error) return result;
    rows.push(...(result.data || []));
    if ((result.data || []).length < 1000) return { data: rows, error: null };
  }
}
export async function dashboardData(): Promise<DashboardData> {
  const { db, user, business } = await ownerContext();
  const results = await Promise.all([
    db
      .from("store_settings")
      .select("*")
      .eq("business_id", business.id)
      .single(),
    db
      .from("categories")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order"),
    db
      .from("products")
      .select("*,product_images!image_product_tenant(*)")
      .eq("business_id", business.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    db
      .from("shipping_zones")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order"),
    allOrders(db, business.id),
    db
      .from("user_preferences")
      .select("orders_view")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (results.some((r) => r.error))
    throw new Error("Não foi possível carregar os dados.");
  return {
    business,
    settings: results[0].data,
    categories: results[1].data || [],
    products: results[2].data || [],
    zones: results[3].data || [],
    orders: results[4].data || [],
    email: user.email || "",
    view: results[5].data?.orders_view || "kanban",
  } as DashboardData;
}
export const getStore = cache(
  async (slug: string): Promise<StoreData | null> => {
    if (!configured()) return null;
    const db = publicDB();
    const { data: business, error } = await db
      .from("businesses")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error || !business) return null;
    const results = await Promise.all([
      db
        .from("store_settings")
        .select("*")
        .eq("business_id", business.id)
        .single(),
      db
        .from("categories")
        .select("*")
        .eq("business_id", business.id)
        .eq("active", true)
        .order("sort_order"),
      db
        .from("products")
        .select("*,product_images!image_product_tenant(*)")
        .eq("business_id", business.id)
        .eq("active", true)
        .is("archived_at", null)
        .order("featured", { ascending: false }),
      db
        .from("shipping_zones")
        .select("*")
        .eq("business_id", business.id)
        .eq("active", true)
        .order("sort_order"),
    ]);
    if (results.some((r) => r.error)) return null;
    return {
      business,
      settings: results[0].data,
      categories: results[1].data || [],
      products: results[2].data || [],
      zones: results[3].data || [],
    } as StoreData;
  },
);
