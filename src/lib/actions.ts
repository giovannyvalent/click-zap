"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireUser, ownerContext } from "./data";
import type { ActionResult } from "./action-result";
import {
  businessSchema,
  categorySchema,
  productSchema,
  zoneSchema,
  subscribeSchema,
} from "./schemas";
import { serverDB, adminDB } from "./supabase/server";
import { PLANS, type PlanKey } from "./types";
import {
  findOrCreateCustomer,
  createSubscription,
  getSubscriptionFirstPayment,
  getSubscriptionPayments,
  getPixQrCode,
  cancelSubscription as asaasCancelSubscription,
} from "./asaas";
// Mensagens padrão do zod em português (validações sem mensagem própria).
z.config(z.locales.ptBR());

class DbError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly details?: string,
  ) {
    super(message);
  }
}
const fail = (
  error: { message: string; code?: string; details?: string } | null,
) => {
  if (error) throw new DbError(error.message, error.code, error.details);
};

const FIELD_LABELS: Record<string, string> = {
  name: "Nome",
  slug: "Endereço",
  whatsapp: "WhatsApp",
  global_shipping_fee: "Valor do frete",
  fee: "Frete",
  price: "Preço",
  sort_order: "Ordem",
  description: "Descrição",
  internal_code: "Código interno",
  tags: "Tags",
  category_id: "Categoria",
  headline: "Chamada principal",
  promo_text: "Texto promocional",
  accent_color: "Cor principal",
  logo_url: "Logo",
};
const CHECK_MESSAGES: Record<string, string> = {
  reserved_slug: "Endereço reservado. Escolha outro.",
  valid_whatsapp: "Informe o WhatsApp com DDI e DDD.",
  fulfillment_enabled: "Ative retirada ou entrega.",
  valid_accent: "Cor principal inválida.",
};
const GENERIC_ERROR = "Não foi possível salvar. Tente novamente.";

function errorMessage(e: unknown): string {
  if (e instanceof z.ZodError) {
    const issue = e.issues[0];
    if (!issue) return "Confira os dados informados.";
    const field = issue.path[0];
    const label = typeof field === "string" ? FIELD_LABELS[field] : undefined;
    return label ? `${label}: ${issue.message}` : issue.message;
  }
  if (e instanceof DbError) {
    const text = e.message + " " + (e.details || "");
    // raise exception dos triggers/RPCs: mensagens já escritas em português.
    if (e.code === "P0001") return e.message;
    if (e.code === "23505")
      return /slug/.test(text)
        ? "Este endereço já está em uso. Escolha outro."
        : "Já existe um registro com esses dados.";
    if (e.code === "23514") {
      const hit = Object.keys(CHECK_MESSAGES).find((k) => text.includes(k));
      return hit ? CHECK_MESSAGES[hit] : "Confira os dados informados.";
    }
    if (e.code === "23503")
      return "Este item está vinculado a outros registros.";
    if (e.code === "42501")
      return "Você não tem permissão para fazer esta alteração.";
    console.error("[action] erro do banco", e.code, e.message);
    return GENERIC_ERROR;
  }
  if (e instanceof Error && e.message) return e.message;
  return GENERIC_ERROR;
}

// Executa a action e devolve o erro como valor. Lançar dentro de uma server
// action faz o Next.js, em produção, trocar a mensagem por
// "Minified React error #441", que era o que aparecia para o lojista.
async function attempt<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    unstable_rethrow(e); // redirect()/notFound() continuam funcionando
    return { ok: false, error: errorMessage(e) };
  }
}
export async function signOut() {
  const db = await serverDB();
  await db.auth.signOut();
  redirect("/entrar");
}
export async function createBusiness(input: unknown) {
  return attempt(async () => {
    const v = businessSchema.parse(input);
    const { db } = await requireUser();
    const { error } = await db.rpc("create_business", {
      p_name: v.name,
      p_slug: v.slug,
      p_whatsapp: v.whatsapp,
    });
    fail(error);
    revalidatePath("/app");
  });
}
export async function saveCategory(id: string | null, input: unknown) {
  return attempt(async () => {
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
  });
}
export async function deleteCategory(id: string) {
  return attempt(async () => {
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
  });
}
export async function saveProduct(id: string | null, input: unknown) {
  return attempt(async () => {
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
  });
}
export async function archiveProduct(id: string) {
  return attempt(async () => {
    const { db, business } = await ownerContext();
    const { error } = await db
      .from("products")
      .update({ archived_at: new Date().toISOString(), active: false })
      .eq("id", z.uuid().parse(id))
      .eq("business_id", business.id);
    fail(error);
    revalidatePath("/app");
    revalidatePath("/loja/" + business.slug);
  });
}
export async function savePhotos(
  id: string,
  images: { storage_path: string; public_url: string }[],
) {
  return attempt(async () => {
    const { db } = await ownerContext();
    const { error } = await db.rpc("replace_product_images", {
      p_product: z.uuid().parse(id),
      p_images: images,
    });
    fail(error);
    revalidatePath("/app");
  });
}
export async function saveZone(id: string | null, input: unknown) {
  return attempt(async () => {
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
  });
}
export async function deleteZone(id: string) {
  return attempt(async () => {
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
  });
}
export async function saveBusiness(input: unknown) {
  return attempt(async () => {
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
    // O trigger guard_publication barra a publicação sem categoria e produto
    // ativos (ou sem bairro no frete por bairro); a mensagem dele (P0001)
    // volta para a tela via attempt().
    const { error } = await db
      .from("businesses")
      .update(v)
      .eq("id", business.id);
    fail(error);
    revalidatePath("/app");
    revalidatePath("/loja/" + business.slug);
    revalidatePath("/loja/" + v.slug);
  });
}
export async function saveSettings(input: unknown) {
  return attempt(async () => {
    const schema = z.object({
      accent_color: z.string().regex(/^#[a-f0-9]{6}$/i),
      logo_url: z.string().url().nullable(),
      logo_path: z.string().nullable(),
      layout: z.enum(["grid", "list", "showcase"]),
      theme: z.enum(["light", "dark", "soft"]),
      card_style: z.enum(["soft", "bordered", "minimal"]),
      image_ratio: z.enum(["landscape", "square", "portrait"]),
      button_style: z.enum(["rounded", "pill", "square"]),
      font: z.enum(["inter", "poppins", "playfair", "dm_sans"]),
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
  });
}
export async function moveOrder(
  id: string,
  status: "new" | "conversation" | "completed",
  outcome: "sold" | "not_sold" | null,
) {
  return attempt(async () => {
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
  });
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
  const plan = PLANS[v.plan as PlanKey];

  const customer = await findOrCreateCustomer({
    name: v.name,
    email: v.email,
    cpfCnpj: v.cpfCnpj,
    mobilePhone: v.phone,
    externalReference: business.id,
  });

  if (business.asaas_subscription_id) {
    await asaasCancelSubscription(business.asaas_subscription_id).catch(() => {});
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);

  const subscription = await createSubscription({
    customer: customer.id,
    billingType: v.billingType,
    value: plan.price,
    nextDueDate: dueDate.toISOString().slice(0, 10),
    description: `Assinatura ClickZap ${plan.label}`,
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
      pending_plan_key: v.plan,
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
    .update({ plan_key: "start", billing_status: "canceled", pending_plan_key: null })
    .eq("id", business.id);
  revalidatePath("/app");
}
export async function checkProStatus() {
  const { db, user } = await requireUser();
  const { data } = await db
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (!data) return { planKey: "start", billingStatus: "ok" as const };
  const { data: business } = await db
    .from("businesses")
    .select("plan_key,billing_status")
    .eq("id", data.business_id)
    .single();
  return {
    planKey: business?.plan_key || "start",
    billingStatus: (business?.billing_status || "ok") as "ok" | "past_due" | "canceled",
  };
}
export async function getPaymentHistory() {
  const { business } = await ownerContext();
  if (!business.asaas_subscription_id) return [];
  const payments = await getSubscriptionPayments(business.asaas_subscription_id);
  return payments.map((p) => ({
    id: p.id,
    status: p.status,
    value: p.value,
    dueDate: p.dueDate,
    paymentDate: p.paymentDate ?? null,
    billingType: p.billingType,
    invoiceUrl: p.invoiceUrl,
  }));
}
