import { test } from "node:test";
import assert from "node:assert/strict";
import { checkoutSchema, businessSchema } from "../src/lib/schemas";
import { periodStart, dayKey, phone } from "../src/lib/utils";
import { whatsappLink, orderMessage } from "../src/lib/whatsapp";
import type { Order } from "../src/lib/types";
test("Brazilian phone normalization and reserved slug", () => {
  assert.equal(phone("(91) 99999-9999"), "5591999999999");
  assert.equal(
    businessSchema.safeParse({
      name: "Loja",
      slug: "admin",
      whatsapp: "5591999999999",
    }).success,
    false,
  );
});
test("Period uses Fortaleza date around UTC midnight", () => {
  assert.equal(dayKey("2026-09-29T01:00:00Z"), "2026-09-28");
  assert.equal(
    periodStart("week", new Date("2026-09-27T18:00Z")),
    "2026-09-21",
  );
  assert.equal(
    periodStart("month", new Date("2026-09-29T18:00Z")),
    "2026-09-01",
  );
});
test("Checkout rejects duplicate items and missing delivery address; strips browser price", () => {
  const id = crypto.randomUUID();
  const v = {
    slug: "loja-a",
    request_key: crypto.randomUUID(),
    items: [{ product_id: id, quantity: 1, price: 0 }],
    customer_name: "Maria",
    customer_phone: "91999999999",
    fulfillment: "pickup",
    total: 0,
  };
  const parsed = checkoutSchema.parse(v);
  assert.equal("total" in parsed, false);
  assert.equal("price" in parsed.items[0], false);
  assert.equal(
    checkoutSchema.safeParse({ ...v, items: [...v.items, ...v.items] }).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({ ...v, fulfillment: "delivery" }).success,
    false,
  );
});
test("WhatsApp message includes persisted amounts and customer address", () => {
  const o = {
    order_number: 123,
    subtotal: 100,
    shipping_fee: 15,
    total: 115,
    customer_name: "Maria",
    customer_phone: "5591999999999",
    fulfillment: "delivery",
    neighborhood_name_snapshot: "Marco",
    delivery_address: "Rua A 100",
    notes: "Presente",
  } as Order;
  const text = orderMessage("Loja A", o, [
    {
      product_id: "x",
      product_name_snapshot: "Caneca",
      unit_price_snapshot: 100,
      quantity: 1,
      line_total: 100,
      product_image_snapshot: null,
    },
  ]);
  assert.match(text, /#123/);
  assert.match(text, /115,00/);
  assert.match(text, /Marco/);
  assert.match(
    whatsappLink("5591999999999", text),
    /^https:\/\/wa.me\/5591999999999\?text=/,
  );
});
