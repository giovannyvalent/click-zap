import { z } from "zod";
import { phone } from "./utils";
export const phoneSchema = z
  .string()
  .transform(phone)
  .pipe(z.string().regex(/^[1-9]\d{9,14}$/, "Informe telefone com DDI e DDD."));
export const slugSchema = z
  .string()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9-]+$/, "Use letras minúsculas, números e hífen.")
  .refine(
    (s) =>
      ![
        "app",
        "entrar",
        "cadastro",
        "precos",
        "api",
        "admin",
        "loja",
        "suporte",
        "onboarding",
      ].includes(s),
    "Endereço reservado.",
  );
export const businessSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: slugSchema,
  whatsapp: phoneSchema,
});
export const checkoutSchema = z
  .object({
    slug: slugSchema,
    request_key: z.uuid(),
    items: z
      .array(
        z.object({
          product_id: z.uuid(),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1)
      .max(50),
    customer_name: z.string().trim().min(2, "Informe seu nome.").max(100),
    customer_phone: phoneSchema,
    fulfillment: z.enum(["pickup", "delivery"]),
    shipping_zone_id: z.uuid().nullable().optional(),
    delivery_address: z.string().max(500).optional(),
    delivery_complement: z.string().max(200).optional(),
    notes: z.string().max(1000).optional(),
    website: z.string().max(0).optional(),
  })
  .superRefine((v, c) => {
    if (
      v.fulfillment === "delivery" &&
      (!v.delivery_address || v.delivery_address.trim().length < 5)
    )
      c.addIssue({
        code: "custom",
        path: ["delivery_address"],
        message: "Informe o endereço completo.",
      });
    if (new Set(v.items.map((x) => x.product_id)).size !== v.items.length)
      c.addIssue({
        code: "custom",
        path: ["items"],
        message: "Itens duplicados.",
      });
  });
export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
  active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});
export const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  category_id: z.uuid(),
  internal_code: z.string().max(60).nullable(),
  description: z.string().max(4000),
  price: z.number().finite().min(0).max(9999999),
  tags: z.array(z.string().max(40)).max(20),
  featured: z.boolean(),
  active: z.boolean(),
});
export const zoneSchema = z.object({
  name: z.string().trim().min(2).max(100),
  fee: z.number().finite().min(0).max(999999),
  active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});
export const subscribeSchema = z
  .object({
    name: z.string().trim().min(3).max(150),
    email: z.email(),
    cpfCnpj: z
      .string()
      .transform((s) => s.replace(/\D/g, ""))
      .pipe(z.string().regex(/^\d{11}$|^\d{14}$/, "Informe um CPF ou CNPJ válido.")),
    phone: phoneSchema,
    plan: z.enum(["plus", "pro"]),
    billingType: z.enum(["PIX", "CREDIT_CARD"]),
    cardHolderName: z.string().trim().max(150).optional(),
    cardNumber: z
      .string()
      .transform((s) => s.replace(/\D/g, ""))
      .optional(),
    cardExpiryMonth: z.string().trim().max(2).optional(),
    cardExpiryYear: z.string().trim().max(4).optional(),
    cardCcv: z
      .string()
      .transform((s) => s.replace(/\D/g, ""))
      .optional(),
    postalCode: z
      .string()
      .transform((s) => s.replace(/\D/g, ""))
      .optional(),
    addressNumber: z.string().trim().max(20).optional(),
  })
  .superRefine((v, c) => {
    if (v.billingType === "CREDIT_CARD") {
      if (!v.cardHolderName)
        c.addIssue({ code: "custom", path: ["cardHolderName"], message: "Informe o nome impresso no cartão." });
      if (!v.cardNumber || v.cardNumber.length < 13)
        c.addIssue({ code: "custom", path: ["cardNumber"], message: "Número de cartão inválido." });
      if (!v.cardExpiryMonth || !v.cardExpiryYear)
        c.addIssue({ code: "custom", path: ["cardExpiryMonth"], message: "Informe a validade." });
      if (!v.cardCcv || v.cardCcv.length < 3)
        c.addIssue({ code: "custom", path: ["cardCcv"], message: "Código de segurança inválido." });
      if (!v.postalCode || v.postalCode.length !== 8)
        c.addIssue({ code: "custom", path: ["postalCode"], message: "Informe o CEP." });
      if (!v.addressNumber)
        c.addIssue({ code: "custom", path: ["addressNumber"], message: "Informe o número do endereço." });
    }
  });
