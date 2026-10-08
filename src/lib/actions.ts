"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, ownerContext } from "./data";
import {
  businessSchema,
  categorySchema,
  productSchema,
  zoneSchema,
  subscribeSchema,
} from "./schemas";
import { serverDB, adminDB } from "./supabase/server";
import {
  findOrCreateCustomer,
  createSubscription,
  getSubscriptionFirstPayment,
  getPixQrCode,
  cancelSubscription as asaasCancelSubscription,
} from "./asaas";
const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};
export async function signOut() {
  const db = await serverDB();
  await db.auth.signOut();
  redirect("/entrar");
}
export async function createBusiness(input: unknown) {
  const v = businessSchema.parse(input);
  const { db } = await requireUser();
  const { error } = await db.rpc("create_business", {
    p_name: v.name,
    p_slug: v.slug,
    p_whatsapp: v.whatsapp,
  });
  fail(error);
  revalidatePath("/app");
  return { ok: true };
}
export async function saveCategory(id: string | null, input: unknown) {
  const v = categorySchema.parse(input);
  const { db, business } = await ownerContext();
  const query = id
    ? db
        .from("categories")
        .update(v)
        .eq("id", z.uuid().parse(id))
        .eq("business_id", business.id)
    : db.from("categories").insert({ ...v, business_id: business.id });
  const { error } = await query;
  fail(error);
  revalidatePath("/app");
  revalidatePath("/loja/" + business.slug);
}
export async function deleteCategory(id: string) {
  const { db, business } = await ownerContext();
  const { error } = await db
    .from("categories")
    .delete()
    .eq("id", z.uuid().parse(id))
    .eq("business_id", business.id);
  if (error)
    throw new Error(
      "Esta categoria possui produtos. Transfira os produtos antes de excluir.",
    );
  revalidatePath("/app");
}
export async function saveProduct(id: string | null, input: unknown) {
  const v = productSchema.parse(input);
  const { db, business } = await ownerContext();
  const q = id
    ? db
        .from("products")
        .update(v)
        .eq("id", z.uuid().parse(id))
        .eq("business_id", business.id)
    : db.from("products").insert({ ...v, business_id: business.id });
  const { data, error } = await q.select("id").single();
  fail(error);
  revalidatePath("/app");
  revalidatePath("/loja/" + business.slug);
  return data!.id as string;
}
export async function archiveProduct(id: string) {
  const { db, business } = await ownerContext();
  const { error } = await db
    .from("products")
    .update({ archived_at: new Date().toISOString(), active: false })
    .eq("id", z.uuid().parse(id))
    .eq("business_id", business.id);
  fail(error);
  revalidatePath("/app");
  revalidatePath("/loja/" + business.slug);
}
export async function savePhotos(
  id: string,
  images: { storage_path: string; public_url: string }[],
) {
  const { db } = await ownerContext();
  const { error } = await db.rpc("replace_product_images", {
    p_product: z.uuid().parse(id),
    p_images: images,
  });
  fail(error);
  revalidatePath("/app");
}
export async function saveZone(id: string | null, input: unknown) {
  const v = zoneSchema.parse(input);
  const { db, business } = await ownerContext();
  const q = id
    ? db
        .from("shipping_zones")
        .update(v)
        .eq("id", z.uuid().parse(id))
        .eq("business_id", business.id)
    : db.from("shipping_zones").insert({ ...v, business_id: business.id });
  const { error } = await q;
  fail(error);
  revalidatePath("/app");
}
export async function deleteZone(id: string) {
  const { db, business } = await ownerContext();
  const { error } = await db
    .from("shipping_zones")
    .delete()
    .eq("id", z.uuid().parse(id))
    .eq("business_id", business.id);
  if (error)
    throw new Error(
      "Bairro utilizado em pedidos. Desative-o para preservar o histórico.",
    );
  revalidatePath("/app");
}
export async function saveBusiness(input: unknown) {
  const schema = businessSchema
    .extend({
      published: z.boolean(),
      allow_pickup: z.boolean(),
      allow_delivery: z.boolean(),
      shipping_mode: z.enum(["global", "neighborhood"]),
      global_shipping_fee: z.number().finite().min(0).max(999999),
    })
    .refine(
      (v) => v.allow_pickup || v.allow_delivery,
      "Ative retirada ou entrega.",
    );
  const v = schema.parse(input);
  const { db, business } = await ownerContext();
  const { error } = await db.from("businesses").update(v).eq("id", business.id);
  fail(error);
  revalidatePath("/app");
  revalidatePath("/loja/" + business.slug);
  revalidatePath("/loja/" + v.slug);
}
export async function saveSettings(input: unknown) {
  const schema = z.object({
    accent_color: z.string().regex(/^#[a-f0-9]{6}$/i),
    logo_url: z.string().url().nullable(),
    logo_path: z.string().nullable(),
    layout: z.enum(["grid", "list", "showcase"]),
    theme: z.enum(["light", "dark", "soft"]),
    card_style: z.enum(["soft", "bordered", "minimal"]),
    image_ratio: z.enum(["landscape", "square", "portrait"]),
    button_style: z.enum(["rounded", "pill", "square"]),
    headline: z.string().max(160),
    description: z.string().max(600),
    show_search: z.boolean(),
    show_categories: z.boolean(),
    show_descriptions: z.boolean(),
    show_promo_bar: z.boolean(),
    promo_text: z.string().max(160),
  });
  const v = schema.parse(input);
  const { db, business } = await ownerContext();
  const { error } = await db
    .from("store_settings")
    .update(v)
    .eq("business_id", business.id);
  fail(error);
  revalidatePath("/app");
  revalidatePath("/loja/" + business.slug);
}
export async function moveOrder(
  id: string,
  status: "new" | "conversation" | "completed",
  outcome: "sold" | "not_sold" | null,
) {
  z.uuid().parse(id);
  z.enum(["new", "conversation", "completed"]).parse(status);
  if (status === "completed") z.enum(["sold", "not_sold"]).parse(outcome);
  const { db, business } = await ownerContext();
  const { error } = await db
    .from("orders")
    .update({ status, outcome: status === "completed" ? outcome : null })
    .eq("id", id)
    .eq("business_id", business.id);
  fail(error);
  revalidatePath("/app");
}
export async function saveView(view: "kanban" | "list") {
  z.enum(["kanban", "list"]).parse(view);
  const { db, user } = await requireUser();
  const { error } = await db
    .from("user_preferences")
    .upsert({ user_id: user.id, orders_view: view });
  fail(error);
}
export async function subscribeToPro(input: unknown) {
  const v = subscribeSchema.parse(input);
  const { business } = await ownerContext();

  const customer = await findOrCreateCustomer({
    name: v.name,
    email: v.email,
    cpfCnpj: v.cpfCnpj,
    mobilePhone: v.phone,
    externalReference: business.id,
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);

  const subscription = await createSubscription({
    customer: customer.id,
    billingType: v.billingType,
    value: 54.9,
    nextDueDate: dueDate.toISOString().slice(0, 10),
    description: "Assinatura ClickZap Pro",
    externalReference: business.id,
    creditCard:
      v.billingType === "CREDIT_CARD"
        ? {
            holderName: v.cardHolderName!,
            number: v.cardNumber!,
            expiryMonth: v.cardExpiryMonth!,
            expiryYear: v.cardExpiryYear!,
            ccv: v.cardCcv!,
          }
        : undefined,
    creditCardHolderInfo:
      v.billingType === "CREDIT_CARD"
        ? {
            name: v.name,
            email: v.email,
            cpfCnpj: v.cpfCnpj,
            postalCode: v.postalCode || "",
            addressNumber: v.addressNumber || "",
            phone: v.phone,
          }
        : undefined,
  });

  const admin = adminDB();
  await admin
    .from("businesses")
    .update({
      asaas_customer_id: customer.id,
      asaas_subscription_id: subscription.id,
    })
    .eq("id", business.id);

  if (v.billingType === "PIX") {
    let payment = await getSubscriptionFirstPayment(subscription.id);
    if (!payment) {
      await new Promise((r) => setTimeout(r, 1500));
      payment = await getSubscriptionFirstPayment(subscription.id);
    }
    if (!payment) throw new Error("Não foi possível gerar a cobrança Pix. Tente novamente.");
    const qr = await getPixQrCode(payment.id);
    return {
      type: "pix" as const,
      qrImage: qr.encodedImage,
      payload: qr.payload,
      expirationDate: qr.expirationDate,
    };
  }
  let cardPayment = await getSubscriptionFirstPayment(subscription.id);
  if (!cardPayment) {
    await new Promise((r) => setTimeout(r, 1500));
    cardPayment = await getSubscriptionFirstPayment(subscription.id);
  }
  return {
    type: "card" as const,
    confirmed: cardPayment ? ["CONFIRMED", "RECEIVED"].includes(cardPayment.status) : false,
  };
}
export async function cancelPro() {
  const { business } = await ownerContext();
  if (!business.asaas_subscription_id) throw new Error("Nenhuma assinatura ativa.");
  await asaasCancelSubscription(business.asaas_subscription_id);
  const admin = adminDB();
  await admin
    .from("businesses")
    .update({ plan_key: "start", billing_status: "canceled" })
    .eq("id", business.id);
  revalidatePath("/app");
}
