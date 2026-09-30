"use client";
import { useEffect, useState, useRef, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Package,
  X,
  ArrowRight,
  Check,
  MessageCircle,
} from "lucide-react";
import type { StoreData, Product } from "@/lib/types";
import { money } from "@/lib/utils";
import { Modal } from "./ui";
function event(slug: string, event: string) {
  void fetch("/api/public/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, event }),
    keepalive: true,
  }).catch(() => {});
}
export function Store({
  data,
  preview = false,
}: {
  data: StoreData;
  preview?: boolean;
}) {
  const { business: b, settings: s, categories, products, zones } = data;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [photo, setPhoto] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [result, setResult] = useState<{
    order_number: number;
    total: number;
    whatsapp_url: string;
  } | null>(null);
  const requestKey = useRef("");
  const submitted = useRef<unknown>(null);
  const seen = useRef(false);
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      fulfillment: b.allow_pickup ? "pickup" : "delivery",
      shipping_zone_id: "",
      delivery_address: "",
      delivery_complement: "",
      notes: "",
      website: "",
    },
  });
  const fulfillment = watch("fulfillment");
  const zone = watch("shipping_zone_id");
  const items = products.filter((p) => cart[p.id]);
  const subtotal = items.reduce(
    (sum, p) => sum + Number(p.price) * cart[p.id],
    0,
  );
  const shipping =
    fulfillment === "pickup"
      ? 0
      : b.shipping_mode === "global"
        ? Number(b.global_shipping_fee)
        : Number(zones.find((z) => z.id === zone)?.fee || 0);
  const count = Object.values(cart).reduce((s, n) => s + n, 0);
  useEffect(() => {
    if (!preview && !seen.current) {
      seen.current = true;
      event(b.slug, "store_view");
    }
  }, [b.slug, preview]);
  function add(p: Product) {
    if (preview) return;
    if (uncertain) {
      setCheckout(true);
      return;
    }
    setCart((c) => ({ ...c, [p.id]: Math.min(99, (c[p.id] || 0) + 1) }));
    setResult(null);
    submitted.current = null;
    requestKey.current = "";
    event(b.slug, "add_to_cart");
  }
  function change(id: string, delta: number) {
    if (uncertain) return;
    setCart((c) => ({
      ...c,
      [id]: Math.max(0, Math.min(99, (c[id] || 0) + delta)),
    }));
    submitted.current = null;
    requestKey.current = "";
  }
  function openProduct(p: Product) {
    setSelected(p);
    setPhoto(0);
    if (!preview) event(b.slug, "product_view");
  }
  const filtered = products.filter(
    (p) =>
      p.active &&
      categories.some((c) => c.id === p.category_id && c.active) &&
      (!category || p.category_id === category) &&
      `${p.name} ${p.description} ${p.tags.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  async function submit(values: {
    customer_name: string;
    customer_phone: string;
    fulfillment: string;
    shipping_zone_id: string;
    delivery_address: string;
    delivery_complement: string;
    notes: string;
    website: string;
  }) {
    if (preview || busy || !items.length) return;
    setBusy(true);
    setError("");
    try {
      if (!requestKey.current) requestKey.current = crypto.randomUUID();
      const payload = {
        ...values,
        slug: b.slug,
        request_key: requestKey.current,
        shipping_zone_id: values.shipping_zone_id || null,
        items: items.map((p) => ({ product_id: p.id, quantity: cart[p.id] })),
      };
      if (!submitted.current) submitted.current = payload;
      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitted.current),
      });
      const out = await response.json();
      if (!response.ok) {
        if (response.status === 400) {
          submitted.current = null;
          requestKey.current = "";
        }
        throw new Error(out.error || "Não foi possível salvar o pedido.");
      }
      setUncertain(false);
      setResult(out);
      setCart({});
      submitted.current = null;
      requestKey.current = "";
      event(b.slug, "whatsapp_opened");
      window.location.assign(out.whatsapp_url);
    } catch (e) {
      setUncertain(submitted.current !== null);
      setError(
        e instanceof Error ? e.message : "Falha na conexão. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  const images = selected
    ? [...selected.product_images].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
      )
    : [];
  return (
    <div
      className={`store theme-${s.theme} layout-${s.layout} card-${s.card_style} ratio-${s.image_ratio} button-${s.button_style} ${preview ? "is-preview" : ""}`}
      style={{ "--accent": s.accent_color } as CSSProperties}
    >
      {s.show_promo_bar && s.promo_text && (
        <div className="promo-bar">{s.promo_text}</div>
      )}
      <div className="store-inner">
        <header className="store-header">
          <div className="store-brand">
            {s.logo_url ? (
              <img src={s.logo_url} alt={b.name} />
            ) : (
              <span>{b.name.slice(0, 2).toUpperCase()}</span>
            )}
            <div>
              <b>{b.name}</b>
              <small>Catálogo online · Pedido pelo WhatsApp</small>
            </div>
          </div>
          <button
            className="store-cart-icon"
            aria-label="Abrir carrinho"
            onClick={() => {
              if (!preview) {
                setCheckout(true);
                event(b.slug, "begin_order");
              }
            }}
          >
            <ShoppingBag size={20} />
            <span>{count}</span>
          </button>
        </header>
        <section className="store-hero">
          <span className="eyebrow">ESCOLHA. ADICIONE. CONVERSE.</span>
          <h1>{s.headline || b.name}</h1>
          {s.description && <p>{s.description}</p>}
          <div className="store-chips">
            {b.allow_pickup && <span>Retirada disponível</span>}
            {b.allow_delivery && <span>Entrega local</span>}
          </div>
        </section>
        <div className="store-filters">
          {s.show_search && (
            <label className="search">
              <Search size={17} />
              <input
                aria-label="Buscar na loja"
                placeholder="O que você procura hoje?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          )}
          {s.show_categories && (
            <div className="category-pills">
              <button
                className={!category ? "active" : ""}
                onClick={() => setCategory("")}
              >
                Todos
              </button>
              {categories
                .filter((c) => c.active)
                .map((c) => (
                  <button
                    key={c.id}
                    className={category === c.id ? "active" : ""}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          )}
        </div>
        <div className="store-section-title">
          <h2>
            {category
              ? categories.find((c) => c.id === category)?.name
              : "Explore nossos produtos"}
          </h2>
          <span>{filtered.length} produtos</span>
        </div>
        <div className="store-products">
          {filtered.map((p) => (
            <article
              className={"store-product " + (p.featured ? "featured" : "")}
              key={p.id}
            >
              <button
                className="store-product-image"
                onClick={() => openProduct(p)}
                aria-label={"Ver " + p.name}
              >
                {p.product_images.length ? (
                  <img
                    src={
                      [...p.product_images].sort(
                        (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
                      )[0].public_url
                    }
                    alt={p.name}
                    loading="lazy"
                  />
                ) : (
                  <Package size={36} />
                )}{" "}
                {p.featured && <span className="badge">Destaque</span>}
              </button>
              <div className="store-product-body">
                <button className="product-name" onClick={() => openProduct(p)}>
                  {p.name}
                </button>
                {s.show_descriptions && <p>{p.description}</p>}
                <div className="row between">
                  <strong>{money(p.price)}</strong>
                  <button
                    className="store-add"
                    aria-label={"Adicionar " + p.name}
                    onClick={() => add(p)}
                  >
                    <Plus size={17} />
                    {s.layout === "list" ? "Adicionar" : ""}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && (
          <div className="empty">
            <Package size={32} />
            <h3>Nenhum produto encontrado</h3>
            <p>Tente outra busca ou categoria.</p>
          </div>
        )}
        <footer className="store-footer">
          <p>O pedido será confirmado em conversa com a loja.</p>
          <a href="/" target={preview ? "_blank" : undefined}>
            Feito com <b>ClickZap</b> ↗
          </a>
        </footer>
      </div>
      {count > 0 && !preview && (
        <button
          className="floating-cart"
          onClick={() => {
            setCheckout(true);
            event(b.slug, "begin_order");
          }}
        >
          <ShoppingBag size={20} />
          <span>{count} itens · Ver carrinho</span>
          <b>{money(subtotal)}</b>
          <ArrowRight size={18} />
        </button>
      )}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="product-detail-image">
            {images.length ? (
              <img src={images[photo]?.public_url} alt={selected.name} />
            ) : (
              <Package size={60} />
            )}
          </div>
          {images.length > 1 && (
            <div className="photo-thumbs">
              {images.map((img, i) => (
                <button
                  key={img.storage_path}
                  className={i === photo ? "active" : ""}
                  onClick={() => setPhoto(i)}
                  aria-label={"Foto " + (i + 1)}
                >
                  <img src={img.public_url} alt="" />
                </button>
              ))}
            </div>
          )}
          <p className="product-description">{selected.description}</p>
          <div className="row between">
            <strong>{money(selected.price)}</strong>
            <button
              className="btn primary"
              onClick={() => {
                add(selected);
                setSelected(null);
              }}
              disabled={preview}
            >
              <Plus size={16} />
              Adicionar ao carrinho
            </button>
          </div>
        </Modal>
      )}
      {checkout && !preview && (
        <Modal
          title={result ? "Pedido registrado" : "Seu carrinho"}
          onClose={() => setCheckout(false)}
        >
          {result ? (
            <div className="order-success">
              <Check size={40} />
              <h2>Pedido #{result.order_number}</h2>
              <p>
                Seu pedido de {money(result.total)} foi salvo. Continue no
                WhatsApp para combinar a compra.
              </p>
              <a
                className="btn primary"
                href={result.whatsapp_url}
                onClick={() => event(b.slug, "whatsapp_opened")}
              >
                <MessageCircle size={17} />
                Continuar no WhatsApp
              </a>
              <small>Nenhum pagamento foi cobrado pelo ClickZap.</small>
            </div>
          ) : uncertain ? (
            <div className="stack">
              <h3>Vamos confirmar seu pedido.</h3>
              <p>
                A conexão não confirmou o resultado. Verifique novamente para
                recuperar o mesmo pedido, sem criar outro.
              </p>
              <p className="notice error" role="alert">
                {error}
              </p>
              <button
                className="btn primary"
                disabled={busy}
                onClick={() => submit(watch())}
              >
                {busy ? "Verificando…" : "Verificar meu pedido"}
              </button>
            </div>
          ) : !items.length ? (
            <div className="empty">
              <ShoppingBag size={32} />
              <h3>Seu carrinho está vazio</h3>
              <button
                className="btn primary"
                onClick={() => setCheckout(false)}
              >
                Explorar produtos
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(submit)}>
              <fieldset disabled={busy}>
                {items.map((p) => (
                  <div className="cart-item" key={p.id}>
                    <div>
                      <b>{p.name}</b>
                      <small>{money(p.price)} cada</small>
                    </div>
                    <div className="quantity">
                      <button
                        type="button"
                        aria-label={"Diminuir " + p.name}
                        onClick={() => change(p.id, -1)}
                      >
                        <Minus size={13} />
                      </button>
                      <span>{cart[p.id]}</span>
                      <button
                        type="button"
                        aria-label={"Aumentar " + p.name}
                        onClick={() => change(p.id, 1)}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <strong>{money(Number(p.price) * cart[p.id])}</strong>
                  </div>
                ))}
                <hr />
                <h3>Como você quer receber?</h3>
                <label>
                  Entrega ou retirada
                  <select {...register("fulfillment")}>
                    {b.allow_pickup && (
                      <option value="pickup">Retirar na loja</option>
                    )}
                    {b.allow_delivery && (
                      <option value="delivery">Receber em casa</option>
                    )}
                  </select>
                </label>
                {fulfillment === "delivery" && (
                  <>
                    {b.shipping_mode === "neighborhood" && (
                      <label>
                        Bairro
                        <select required {...register("shipping_zone_id")}>
                          <option value="">Selecione seu bairro</option>
                          {zones
                            .filter((z) => z.active)
                            .map((z) => (
                              <option key={z.id} value={z.id}>
                                {z.name} — {money(z.fee)}
                              </option>
                            ))}
                        </select>
                      </label>
                    )}
                    <label>
                      Endereço completo
                      <input
                        required
                        minLength={5}
                        maxLength={500}
                        {...register("delivery_address")}
                      />
                    </label>
                    <label>
                      Complemento
                      <input
                        maxLength={200}
                        {...register("delivery_complement")}
                      />
                    </label>
                  </>
                )}
                <div className="form-grid">
                  <label>
                    Seu nome
                    <input
                      required
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      {...register("customer_name")}
                    />
                  </label>
                  <label>
                    Seu WhatsApp
                    <input
                      required
                      placeholder="DDD + número"
                      autoComplete="tel"
                      type="tel"
                      {...register("customer_phone")}
                    />
                  </label>
                </div>
                <label>
                  Observação (opcional)
                  <textarea rows={2} maxLength={1000} {...register("notes")} />
                </label>
                <label className="honeypot" aria-hidden="true">
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    {...register("website")}
                  />
                </label>
                <div className="checkout-total">
                  <div>
                    <span>Subtotal</span>
                    <b>{money(subtotal)}</b>
                  </div>
                  <div>
                    <span>Frete</span>
                    <b>{money(shipping)}</b>
                  </div>
                  <div>
                    <strong>Total estimado</strong>
                    <strong>{money(subtotal + shipping)}</strong>
                  </div>
                </div>
                <small className="muted">
                  Preços e frete serão conferidos ao registrar o pedido. Seus
                  dados serão compartilhados com {b.name} para atender esta
                  solicitação.
                </small>
                {error && (
                  <p className="notice error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  disabled={busy}
                  className="btn primary full"
                  type="submit"
                >
                  {busy
                    ? "Registrando pedido…"
                    : "Registrar e continuar no WhatsApp"}
                  <ArrowRight size={17} />
                </button>
              </fieldset>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
