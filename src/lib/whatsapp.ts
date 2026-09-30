import { money } from "./utils";
import type { Order, OrderItem } from "./types";
export function orderMessage(name: string, o: Order, items: OrderItem[]) {
  return `Olá! Quero fazer um pedido pela ${name}.\n\n*Pedido #${o.order_number}*\n\n${items.map((i) => `${i.quantity}x ${i.product_name_snapshot} — ${money(i.line_total)}`).join("\n")}\n\nSubtotal: ${money(o.subtotal)}\nFrete: ${money(o.shipping_fee)}\n*Total: ${money(o.total)}*\n\nCliente: ${o.customer_name}\nTelefone: ${o.customer_phone}\n${o.fulfillment === "pickup" ? "Retirada na loja" : `Entrega: ${o.neighborhood_name_snapshot || ""}\n${o.delivery_address || ""}\n${o.delivery_complement || ""}`}\n${o.notes ? "Obs.: " + o.notes : ""}\n\nPedido montado pelo ClickZap.`;
}
export const whatsappLink = (number: string, message: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
export const customerLink = (o: Order) =>
  whatsappLink(
    o.customer_phone,
    `Olá, ${o.customer_name}! Estou falando sobre seu pedido #${o.order_number} feito pelo ClickZap.`,
  );
