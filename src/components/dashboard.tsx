"use client";
import { useState } from "react";
import Link from "next/link";
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
  Menu,
  Check,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { Brand } from "./brand";
import { signOut } from "@/lib/actions";
import type { DashboardData } from "@/lib/types";
import { money, dayKey, periodStart, dateTime, statusLabel } from "@/lib/utils";
import { Categories, Products } from "./catalog";
import { BusinessSettings, StoreDesigner } from "./settings";
import { Orders } from "./orders";
const nav = [
  ["", "Visão geral", LayoutDashboard],
  ["pedidos", "Pedidos", ShoppingBag],
  ["produtos", "Produtos", Package],
  ["categorias", "Categorias", Tags],
  ["minha-loja", "Minha Loja", Palette],
  ["configuracoes", "Configurações", Settings],
] as const;
export function Dashboard({
  data,
  section,
}: {
  data: DashboardData;
  section: string;
}) {
  const [mobile, setMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        location.origin + "/loja/" + data.business.slug,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(
        "Copie o endereço:",
        location.origin + "/loja/" + data.business.slug,
      );
    }
  }
  return (
    <div className="dashboard">
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <Brand />
        <div className="workspace">
          <span>{data.business.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <b>{data.business.name}</b>
            <small>Seu espaço de vendas</small>
          </div>
        </div>
        <small className="nav-label">PRINCIPAL</small>
        <nav>
          {nav.map(([path, label, Icon]) => (
            <Link
              key={path}
              onClick={() => setMobile(false)}
              className={section === path ? "active" : ""}
              href={"/app" + (path ? "/" + path : "")}
            >
              <Icon size={18} />
              {label}
              {path === "pedidos" && (
                <small>
                  {data.orders.filter((o) => o.status === "new").length}
                </small>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <span className="badge">PLANO START</span>
            <b>Sua loja está começando.</b>
            <p>{data.products.length} de 10 produtos no plano grátis.</p>
            <Link href="/app/planos">
              Conhecer os planos <ArrowUpRight size={14} />
            </Link>
          </div>
          <button className="logout" onClick={() => signOut()}>
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </aside>
      <div className="app-area">
        <header className="app-top">
          <div>
            <button
              className="iconbtn mobile-only"
              aria-label="Abrir menu"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={18} />
            </button>
            <span className="muted">Seu negócio / </span>
            <b>{nav.find((n) => n[0] === section)?.[1] || "Planos"}</b>
          </div>
          <div className="row">
            <span
              className={"badge " + (data.business.published ? "green" : "")}
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
            <Overview data={data} copy={copy} copied={copied} />
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
            <Plans />
          )}
        </main>
        <footer className="app-footer">
          ClickZap · Menos trabalho. Mais conversa.
        </footer>
      </div>
    </div>
  );
}
function Overview({
  data,
  copy,
  copied,
}: {
  data: DashboardData;
  copy: () => void;
  copied: boolean;
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
      {!data.business.published && (
        <div className="onboarding-card">
          <div>
            <span className="eyebrow">SUA LOJA EM 5 PASSOS</span>
            <h2>Falta pouco para receber pedidos.</h2>
          </div>
          <div className="steps-inline">
            {[
              ["Negócio", true, "/app/configuracoes"],
              ["Entrega", true, "/app/configuracoes"],
              [
                "Categoria",
                data.categories.some((c) => c.active),
                "/app/categorias",
              ],
              ["Produto", data.products.some((p) => p.active), "/app/produtos"],
              ["Publicação", false, "/app/configuracoes"],
            ].map(([l, ok, url], i) => (
              <Link
                href={url as string}
                key={String(l)}
                className={ok ? "done" : ""}
              >
                <span>{ok ? <Check size={14} /> : i + 1}</span>
                {l}
              </Link>
            ))}
          </div>
        </div>
      )}
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
function Plans() {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CRESÇA NO SEU RITMO</span>
          <h1>Simples desde o começo.</h1>
          <p>Comece gratuitamente. Sem cobrança automática.</p>
        </div>
      </div>
      <div className="plans">
        <section className="panel padded">
          <span className="badge green">DISPONÍVEL AGORA</span>
          <h2>Start</h2>
          <strong className="price">Grátis</strong>
          <p>
            1 loja · até 10 produtos · carrinho para WhatsApp · pedidos
            registrados · entrega ou retirada · marca ClickZap.
          </p>
          <button className="btn secondary full" disabled>
            Seu plano atual
          </button>
        </section>
        <section className="panel padded">
          <span className="badge">EM BREVE</span>
          <h2>Pro</h2>
          <strong className="price">
            R$ 54,90<small>/mês</small>
          </strong>
          <p>
            Produtos ilimitados · personalização completa · central de pedidos ·
            indicadores comerciais · frete por bairro · sem marca ClickZap.
          </p>
          <p className="notice">
            Valor atualizado: R$ 54,90/mês. A contratação online ainda não está
            disponível; nenhuma cobrança está ativa.
          </p>
        </section>
      </div>
    </>
  );
}
