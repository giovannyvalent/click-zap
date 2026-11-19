"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  Package,
  Palette,
  Settings,
  ArrowUpRight,
  Link as LinkIcon,
  LogOut,
  Check,
  TrendingUp,
  MessageCircle,
  MoreHorizontal,
  X,
  Share2,
  ArrowRight,
} from "lucide-react";
import { Brand } from "./brand";
import { signOut, saveBusiness } from "@/lib/actions";
import { unwrap } from "@/lib/action-result";
import { useTask } from "./ui";
import type { DashboardData, PlanKey } from "@/lib/types";
import { PLANS } from "@/lib/types";
import { money, dayKey, periodStart, dateTime, statusLabel } from "@/lib/utils";
import { Categories, Products } from "./catalog";
import { BusinessSettings, StoreDesigner } from "./settings";
import { Orders } from "./orders";
import { SubscribeButton, ManageSubscription } from "./billing";
const nav = [
  ["", "Visão geral", LayoutDashboard],
  ["pedidos", "Pedidos", ShoppingBag],
  ["produtos", "Produtos", Package],
  ["categorias", "Categorias", Tags],
  ["minha-loja", "Minha Loja", Palette],
  ["configuracoes", "Configurações", Settings],
] as const;
// Itens da barra inferior no celular; o restante fica no menu "Mais".
const mobileNav = [
  ["", "Início", LayoutDashboard],
  ["pedidos", "Pedidos", ShoppingBag],
  ["produtos", "Produtos", Package],
  ["minha-loja", "Loja", Palette],
] as const;
// "Copiar o link" não fica no banco: guardamos no navegador que o lojista já
// copiou/compartilhou o link, só para concluir o passo do onboarding.
function useLinkShared(businessId: string) {
  const key = "clickzap:link-shared:" + businessId;
  const [shared, setShared] = useState(false);
  useEffect(() => {
    try {
      setShared(localStorage.getItem(key) === "1");
    } catch {}
  }, [key]);
  const mark = useCallback(() => {
    setShared(true);
    try {
      localStorage.setItem(key, "1");
    } catch {}
  }, [key]);
  return [shared, mark] as const;
}
export function Dashboard({
  data,
  section,
}: {
  data: DashboardData;
  section: string;
}) {
  const [mobile, setMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkShared, markLinkShared] = useLinkShared(data.business.id);
  useEffect(() => {
    const idleMinutes = 30;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => signOut(), idleMinutes * 60 * 1000);
    };
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobile(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile]);
  async function copy() {
    const url = location.origin + "/loja/" + data.business.slug;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copie o endereço:", url);
    }
    markLinkShared();
  }
  const newOrders = data.orders.filter((o) => o.status === "new").length;
  const planKey = data.business.plan_key as PlanKey;
  const plan = PLANS[planKey] ?? PLANS.start;
  const isPaid = planKey !== "start";
  const pastDue = data.business.billing_status === "past_due";
  const inMore = !mobileNav.some(([p]) => p === section);
  return (
    <div className="dashboard">
      {mobile && (
        <div
          className="sidebar-backdrop"
          aria-hidden="true"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        className={"sidebar " + (mobile ? "open" : "")}
        aria-label="Menu do painel"
      >
        <div className="sidebar-top">
          <Brand />
          <button
            className="iconbtn sidebar-close mobile-only"
            aria-label="Fechar menu"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace">
          <span>{data.business.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <b title={data.business.name}>{data.business.name}</b>
            <small className={data.business.published ? "live" : ""}>
              {data.business.published ? "Loja publicada" : "Rascunho"}
            </small>
          </div>
        </div>
        <nav>
          {nav.map(([path, label, Icon]) => (
            <Link
              key={path}
              onClick={() => setMobile(false)}
              className={section === path ? "active" : ""}
              aria-current={section === path ? "page" : undefined}
              href={"/app" + (path ? "/" + path : "")}
            >
              <Icon size={17} />
              {label}
              {path === "pedidos" && newOrders > 0 && <small>{newOrders}</small>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link
            href="/app/planos"
            className="plan-card"
            onClick={() => setMobile(false)}
          >
            <div className="plan-card-row">
              <span className="badge">{plan.label.toUpperCase()}</span>
              <small>
                {isPaid && pastDue
                  ? "Pagamento pendente"
                  : `${data.products.length}/${plan.productLimit} produtos`}
              </small>
              <ArrowUpRight size={14} />
            </div>
            <div className="plan-meter" aria-hidden="true">
              <i
                style={{
                  width:
                    Math.min(
                      100,
                      Math.round(
                        (data.products.length / plan.productLimit) * 100,
                      ),
                    ) + "%",
                }}
              />
            </div>
            <b>{isPaid ? "Minha assinatura" : "Conhecer os planos"}</b>
          </Link>
          <button className="logout" onClick={() => signOut()}>
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </aside>
      <div className="app-area">
        <header className="app-top">
          <div>
            <span className="muted">Seu negócio / </span>
            <b>{nav.find((n) => n[0] === section)?.[1] || "Planos"}</b>
          </div>
          <div className="row">
            <span
              className={
                "badge top-status " + (data.business.published ? "green" : "")
              }
            >
              {data.business.published ? "Loja publicada" : "Rascunho"}
            </span>
            <Link
              className="btn secondary small"
              href={"/loja/" + data.business.slug}
              target="_blank"
            >
              Ver loja <ArrowUpRight size={15} />
            </Link>
            <span className="avatar">{data.email[0]?.toUpperCase()}</span>
          </div>
        </header>
        <main className="app-main">
          {section === "" ? (
            <Overview
              data={data}
              copy={copy}
              copied={copied}
              linkShared={linkShared}
              markLinkShared={markLinkShared}
            />
          ) : section === "pedidos" ? (
            <Orders data={data} />
          ) : section === "categorias" ? (
            <Categories data={data} />
          ) : section === "produtos" ? (
            <Products data={data} />
          ) : section === "minha-loja" ? (
            <StoreDesigner data={data} />
          ) : section === "configuracoes" ? (
            <BusinessSettings data={data} />
          ) : (
            <Plans data={data} />
          )}
        </main>
        <footer className="app-footer">
          ClickZap · Menos trabalho. Mais conversa.
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Navegação principal">
        {mobileNav.map(([path, label, Icon]) => (
          <Link
            key={path}
            href={"/app" + (path ? "/" + path : "")}
            className={section === path ? "active" : ""}
            aria-current={section === path ? "page" : undefined}
          >
            <span className="bottom-nav-icon">
              <Icon size={21} />
              {path === "pedidos" && newOrders > 0 && (
                <small>{newOrders > 99 ? "99+" : newOrders}</small>
              )}
            </span>
            {label}
          </Link>
        ))}
        <button
          className={inMore || mobile ? "active" : ""}
          aria-label="Mais opções do menu"
          aria-expanded={mobile}
          onClick={() => setMobile(!mobile)}
        >
          <span className="bottom-nav-icon">
            <MoreHorizontal size={21} />
          </span>
          Mais
        </button>
      </nav>
    </div>
  );
}
function Overview({
  data,
  copy,
  copied,
  linkShared,
  markLinkShared,
}: {
  data: DashboardData;
  copy: () => void;
  copied: boolean;
  linkShared: boolean;
  markLinkShared: () => void;
}) {
  const [period, setPeriod] = useState("week");
  const orders = data.orders.filter(
    (o) => dayKey(o.created_at) >= periodStart(period),
  );
  const sold = orders.filter((o) => o.outcome === "sold");
  const lost = orders.filter((o) => o.outcome === "not_sold");
  const won = sold.length + lost.length;
  const popular = new Map<string, number>();
  orders.forEach((o) =>
    o.order_items.forEach((i) =>
      popular.set(
        i.product_name_snapshot,
        (popular.get(i.product_name_snapshot) || 0) + i.quantity,
      ),
    ),
  );
  const best = [...popular].sort((a, b) => b[1] - a[1])[0];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEU NEGÓCIO EM MOVIMENTO</span>
          <h1>
            Visão geral
            <span className="green-dot" />
          </h1>
          <p>Um lugar para acompanhar cada oportunidade.</p>
        </div>
        <select
          aria-label="Período"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="today">Hoje</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mês</option>
        </select>
      </div>
      <GettingStarted
        data={data}
        copy={copy}
        copied={copied}
        linkShared={linkShared}
        markLinkShared={markLinkShared}
      />
      <div className="stats">
        {[
          ["Pedidos recebidos", orders.length, "Pedidos criados no período"],
          [
            "Valor dos pedidos",
            money(orders.reduce((s, o) => s + Number(o.total), 0)),
            "Intenção de compra, não receita",
          ],
          ["Vendidos", sold.length, `${lost.length} não vendidos`],
          [
            "Conversão comercial",
            `${won ? Math.round((sold.length / won) * 100) : 0}%`,
            "Vendidos ÷ pedidos concluídos",
          ],
        ].map(([label, value, note]) => (
          <div className="stat" key={label}>
            <span>
              {label}
              <TrendingUp size={16} />
            </span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <div className="overview-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Últimos pedidos</h2>
              <p>A conversa começa aqui.</p>
            </div>
            <Link href="/app/pedidos" className="text-link">
              Ver todos ↗
            </Link>
          </div>
          {orders.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pedido / Cliente</th>
                    <th>Status</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o.id}>
                      <td>
                        <b>
                          #{o.order_number} · {o.customer_name}
                        </b>
                        <small>{dateTime(o.created_at)}</small>
                      </td>
                      <td>
                        <span
                          className={
                            "badge " + (o.outcome === "sold" ? "green" : "")
                          }
                        >
                          {o.outcome === "sold"
                            ? "Vendido"
                            : o.outcome === "not_sold"
                              ? "Não vendido"
                              : statusLabel[o.status]}
                        </span>
                      </td>
                      <td>
                        <b>{money(o.total)}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              <MessageCircle size={30} />
              <h3>Pronto para a primeira conversa?</h3>
              <p>
                Publique sua loja e compartilhe o link para receber pedidos.
              </p>
              <Link href="/app/configuracoes" className="btn secondary">
                Configurar loja
              </Link>
            </div>
          )}
        </section>
        <div className="stack">
          <section className="share-card">
            <span className="badge">SEU LINK, SUAS VENDAS</span>
            <h2>
              Leve sua loja
              <br />
              para todo lugar.
            </h2>
            <p>
              Compartilhe na bio, no status ou diretamente com seus clientes.
            </p>
            <div className="link-box">/loja/{data.business.slug}</div>
            <button className="btn primary full" onClick={copy}>
              {copied ? <Check size={16} /> : <LinkIcon size={16} />}{" "}
              {copied ? "Link copiado" : "Copiar link da loja"}
            </button>
          </section>
          <section className="panel padded">
            <span className="eyebrow">MAIS PEDIDO NO PERÍODO</span>
            <h3>{best?.[0] || "Seu próximo destaque"}</h3>
            <p className="muted">
              {best
                ? `${best[1]} unidades solicitadas`
                : "Os produtos mais pedidos aparecerão aqui."}
            </p>
            <hr />
            <b>
              {data.products.filter((p) => p.active).length} produtos ativos
            </b>
          </section>
        </div>
      </div>
    </>
  );
}
// Passos do primeiro uso, calculados com os dados reais da loja.
function GettingStarted({
  data,
  copy,
  copied,
  linkShared,
  markLinkShared,
}: {
  data: DashboardData;
  copy: () => void;
  copied: boolean;
  linkShared: boolean;
  markLinkShared: () => void;
}) {
  const task = useTask();
  const router = useRouter();
  const b = data.business;
  const activeCategories = data.categories.filter((c) => c.active);
  const activeProducts = data.products.filter(
    (p) => p.active && activeCategories.some((c) => c.id === p.category_id),
  );
  const hasCategory = activeCategories.length > 0;
  const hasProduct = activeProducts.length > 0;
  const steps = [
    {
      key: "categoria",
      title: "Crie uma categoria",
      text: "Categorias organizam a vitrine (ex.: Roupas, Bolos, Acessórios).",
      done: hasCategory,
    },
    {
      key: "produto",
      title: "Cadastre seu primeiro produto",
      text: "Foto, nome e preço. Dá para criar a categoria no mesmo formulário.",
      done: hasProduct,
    },
    {
      key: "publicar",
      title: "Publique a loja",
      text: "Com a loja publicada, o catálogo fica visível para os clientes.",
      done: b.published,
    },
    {
      key: "link",
      title: "Copie o link e compartilhe",
      text: "Coloque na bio, no status do WhatsApp ou mande para os clientes.",
      done: b.published && linkShared,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const current = steps.find((s) => !s.done);
  function publish() {
    task.run(async () => {
      unwrap(
        await saveBusiness({
          name: b.name,
          slug: b.slug,
          whatsapp: b.whatsapp,
          published: true,
          allow_pickup: b.allow_pickup,
          allow_delivery: b.allow_delivery,
          shipping_mode: b.shipping_mode,
          global_shipping_fee: Number(b.global_shipping_fee),
        }),
      );
      router.refresh();
    }, "Loja publicada! Agora compartilhe o link.");
  }
  async function share() {
    const storeUrl = location.origin + "/loja/" + b.slug;
    const text = `Conheça a ${b.name}: ${storeUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: b.name, text, url: storeUrl });
        markLinkShared();
      } catch {}
      return;
    }
    window.open(
      "https://wa.me/?text=" + encodeURIComponent(text),
      "_blank",
      "noopener",
    );
    markLinkShared();
  }
  function action(key: string) {
    switch (key) {
      case "categoria":
        return (
          <Link className="btn primary" href="/app/categorias">
            Criar categoria <ArrowRight size={16} />
          </Link>
        );
      case "produto":
        return (
          <Link className="btn primary" href="/app/produtos?novo=1">
            Cadastrar produto <ArrowRight size={16} />
          </Link>
        );
      case "publicar":
        return (
          <button
            className="btn primary"
            disabled={task.busy || !hasCategory || !hasProduct}
            onClick={publish}
          >
            {task.busy ? "Publicando…" : "Publicar agora"}
          </button>
        );
      default:
        return (
          <div className="row wrap-row">
            <button className="btn primary" onClick={copy}>
              {copied ? <Check size={16} /> : <LinkIcon size={16} />}
              {copied ? "Link copiado" : "Copiar link"}
            </button>
            <button className="btn secondary" onClick={share}>
              <Share2 size={16} />
              Compartilhar
            </button>
          </div>
        );
    }
  }
  if (!current) {
    // Tudo pronto. Com poucos produtos, um lembrete discreto para completar.
    if (activeProducts.length >= 3) return null;
    return (
      <div className="tip-banner">
        <div>
          <b>
            {activeProducts.length === 1
              ? "Sua loja tem 1 produto ativo."
              : `Sua loja tem ${activeProducts.length} produtos ativos.`}
          </b>
          <p>Cadastre mais produtos para seus clientes terem mais opções.</p>
        </div>
        <Link className="btn secondary small" href="/app/produtos?novo=1">
          Cadastrar produto
        </Link>
      </div>
    );
  }
  return (
    <section className="getting-started" aria-label="Primeiros passos">
      <div className="gs-head">
        <div>
          <span className="eyebrow">PRIMEIROS PASSOS</span>
          <h2>
            {hasProduct
              ? "Falta pouco para receber pedidos."
              : "Cadastre seu primeiro produto para começar a vender."}
          </h2>
        </div>
        <span className="gs-count">
          {doneCount} de {steps.length}
        </span>
      </div>
      <div
        className="gs-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={doneCount}
        aria-label="Progresso dos primeiros passos"
      >
        <i style={{ width: (doneCount / steps.length) * 100 + "%" }} />
      </div>
      <div className="gs-current">
        <span className="gs-step-number">
          {steps.indexOf(current) + 1}
        </span>
        <div>
          <b>{current.title}</b>
          <p>{current.text}</p>
          {current.key === "publicar" && (!hasCategory || !hasProduct) && (
            <p className="muted">Conclua os passos anteriores para publicar.</p>
          )}
        </div>
        <div className="gs-action">{action(current.key)}</div>
      </div>
      {task.feedback}
      <ol className="gs-steps">
        {steps.map((step, i) => (
          <li
            key={step.key}
            className={
              step.done ? "done" : step === current ? "current" : undefined
            }
          >
            <span>{step.done ? <Check size={13} /> : i + 1}</span>
            {step.title}
          </li>
        ))}
      </ol>
    </section>
  );
}
function Plans({ data }: { data: DashboardData }) {
  const current = data.business.plan_key as PlanKey;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CRESÇA NO SEU RITMO</span>
          <h1>Simples desde o começo.</h1>
          <p>Comece gratuitamente. Evolua quando precisar.</p>
        </div>
      </div>
      <div className="plans plans-3">
        <section className="panel padded">
          <span className="badge">{current === "start" ? "SEU PLANO" : "PLANO ANTERIOR"}</span>
          <h2>Start</h2>
          <strong className="price">Grátis</strong>
          <p>1 loja · até 10 produtos · carrinho para WhatsApp · pedidos registrados · entrega ou retirada.</p>
          <button className="btn secondary full" disabled>
            {current === "start" ? "Seu plano atual" : "Plano anterior"}
          </button>
        </section>
        <section className="panel padded">
          <span className="badge green">{current === "plus" ? "SEU PLANO" : "MAIS POPULAR"}</span>
          <h2>Plus</h2>
          <strong className="price">
            {money(PLANS.plus.price)}
            <small>/mês</small>
          </strong>
          <p>Até 100 produtos · personalização completa · central de pedidos · frete por bairro.</p>
          {current === "plus" ? (
            <button className="btn secondary full" disabled>
              Seu plano atual
            </button>
          ) : (
            <SubscribeButton
              business={data.business}
              plan="plus"
              defaultName={data.business.name}
              defaultEmail={data.email}
              defaultPhone={data.business.whatsapp}
            />
          )}
        </section>
        <section className="panel padded">
          <span className="badge green">{current === "pro" ? "SEU PLANO" : "PARA QUEM ESCALA"}</span>
          <h2>Pro</h2>
          <strong className="price">
            {money(PLANS.pro.price)}
            <small>/mês</small>
          </strong>
          <p>Até 1.000 produtos · indicadores comerciais · sem marca ClickZap · suporte prioritário.</p>
          {current === "pro" ? (
            <button className="btn secondary full" disabled>
              Seu plano atual
            </button>
          ) : (
            <SubscribeButton
              business={data.business}
              plan="pro"
              defaultName={data.business.name}
              defaultEmail={data.email}
              defaultPhone={data.business.whatsapp}
            />
          )}
        </section>
      </div>
      <ManageSubscription business={data.business} />
    </>
  );
}
