"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Search,
  Columns3,
  List,
  Eye,
} from "lucide-react";
import type { DashboardData, Order } from "@/lib/types";
import { moveOrder, saveView } from "@/lib/actions";
import { money, dayKey, periodStart, dateTime, statusLabel } from "@/lib/utils";
import { customerLink } from "@/lib/whatsapp";
import { Modal, Empty, useTask } from "./ui";
type Status = Order["status"];
const stages: Status[] = ["new", "conversation", "completed"];
export function Orders({ data }: { data: DashboardData }) {
  const router = useRouter();
  const task = useTask();
  const [view, setView] = useState(data.view);
  const [period, setPeriod] = useState("week");
  const [start, setStart] = useState(dayKey(new Date()));
  const [end, setEnd] = useState(dayKey(new Date()));
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [outcome, setOutcome] = useState("");
  const [min, setMin] = useState("");
  const [sort, setSort] = useState("newest");
  const [detail, setDetail] = useState<Order | null>(null);
  const [complete, setComplete] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );
  const from = period === "custom" ? start : periodStart(period);
  const to = period === "custom" ? end : dayKey(new Date());
  const filtered = data.orders
    .filter(
      (o) =>
        dayKey(o.created_at) >= from &&
        dayKey(o.created_at) <= to &&
        (!status || o.status === status) &&
        (!outcome || o.outcome === outcome) &&
        Number(o.total) >= Number(min || 0) &&
        `${o.customer_name} ${o.customer_phone} ${o.order_number}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "value"
        ? Number(b.total) - Number(a.total)
        : sort === "oldest"
          ? a.created_at.localeCompare(b.created_at)
          : b.created_at.localeCompare(a.created_at),
    );
  function move(id: string, next: Status) {
    if (task.busy) return;
    if (next === "completed") {
      setComplete(id);
      return;
    }
    task.run(async () => {
      await moveOrder(id, next, null);
      router.refresh();
    });
  }
  function dropped(e: DragEndEvent) {
    if (e.over && stages.includes(e.over.id as Status))
      move(String(e.active.id), e.over.id as Status);
  }
  function card(o: Order) {
    return (
      <OrderCard
        key={o.id}
        order={o}
        disabled={task.busy}
        move={move}
        open={() => setDetail(o)}
      />
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">DA INTENÇÃO À VENDA</span>
          <h1>Pedidos</h1>
          <p>Organize cada conversa e acompanhe os resultados.</p>
        </div>
        <div className="segmented">
          <button
            className={view === "kanban" ? "active" : ""}
            onClick={() => {
              setView("kanban");
              task.run(() => saveView("kanban"), "");
            }}
          >
            <Columns3 size={15} />
            Kanban
          </button>
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => {
              setView("list");
              task.run(() => saveView("list"), "");
            }}
          >
            <List size={15} />
            Lista
          </button>
        </div>
      </div>
      <div className="toolbar wrap">
        <label className="search">
          <Search size={16} />
          <input
            aria-label="Buscar pedidos"
            placeholder="Cliente, telefone ou pedido"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Período dos pedidos"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="today">Hoje</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mês</option>
          <option value="custom">Personalizado</option>
        </select>
        <select
          aria-label="Status do pedido"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          {stages.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
        <select
          aria-label="Resultado"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        >
          <option value="">Todos os resultados</option>
          <option value="sold">Vendido</option>
          <option value="not_sold">Não vendido</option>
        </select>
        <input
          className="min-value"
          aria-label="Valor mínimo"
          placeholder="Mínimo R$"
          min="0"
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <select
          aria-label="Ordenação"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
          <option value="value">Maior valor</option>
        </select>
        {period === "custom" && (
          <>
            <label>
              De
              <input
                type="date"
                value={start}
                max={end}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              Até
              <input
                type="date"
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </>
        )}
      </div>
      {start > end && period === "custom" && (
        <p className="error">A data inicial deve ser anterior à final.</p>
      )}
      {task.feedback}
      <div className="orders-summary">
        <span>
          <b>{filtered.length}</b> pedidos no período
        </span>
        <span>
          {money(filtered.reduce((s, o) => s + Number(o.total), 0))} em pedidos
        </span>
      </div>
      {view === "kanban" ? (
        <DndContext sensors={sensors} onDragEnd={dropped}>
          <div className="kanban">
            {stages.map((s) => (
              <Column
                key={s}
                status={s}
                count={filtered.filter((o) => o.status === s).length}
              >
                {filtered.filter((o) => o.status === s).map(card)}
              </Column>
            ))}
          </div>
        </DndContext>
      ) : (
        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Resultado</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <b>#{o.order_number}</b>
                      <small>{dateTime(o.created_at)}</small>
                    </td>
                    <td>
                      {o.customer_name}
                      <small>{o.customer_phone}</small>
                    </td>
                    <td>{statusLabel[o.status]}</td>
                    <td>
                      {o.outcome === "sold"
                        ? "Vendido"
                        : o.outcome === "not_sold"
                          ? "Não vendido"
                          : "—"}
                    </td>
                    <td>{money(o.total)}</td>
                    <td>
                      <div className="row">
                        <a
                          className="iconbtn"
                          aria-label="WhatsApp do cliente"
                          href={customerLink(o)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle size={16} />
                        </a>
                        <button
                          className="iconbtn"
                          aria-label="Detalhes do pedido"
                          onClick={() => setDetail(o)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && (
            <Empty
              title="Nenhum pedido neste período"
              description="Tente outro período ou compartilhe o link da sua loja."
            />
          )}
        </section>
      )}
      {complete && (
        <Modal
          title="Qual foi o resultado da conversa?"
          onClose={() => setComplete(null)}
        >
          <p className="muted">
            O pedido só será concluído depois que você registrar o resultado.
          </p>
          {task.feedback}
          <div className="row modal-actions">
            <button
              disabled={task.busy}
              className="btn primary"
              onClick={() =>
                task.run(async () => {
                  await moveOrder(complete, "completed", "sold");
                  setComplete(null);
                  setDetail(null);
                  router.refresh();
                })
              }
            >
              Vendido
            </button>
            <button
              disabled={task.busy}
              className="btn secondary"
              onClick={() =>
                task.run(async () => {
                  await moveOrder(complete, "completed", "not_sold");
                  setComplete(null);
                  setDetail(null);
                  router.refresh();
                })
              }
            >
              Não vendido
            </button>
          </div>
        </Modal>
      )}
      {detail && !complete && (
        <Modal
          title={"Pedido #" + detail.order_number}
          onClose={() => setDetail(null)}
        >
          <p>
            <b>{detail.customer_name}</b> · {detail.customer_phone}
          </p>
          <p className="muted">
            {dateTime(detail.created_at)} · {statusLabel[detail.status]}
          </p>
          <hr />
          {detail.order_items.map((i, n) => (
            <div className="order-line" key={n}>
              <span>
                {i.quantity}× {i.product_name_snapshot}
                <small>{money(i.unit_price_snapshot)} / unidade</small>
              </span>
              <b>{money(i.line_total)}</b>
            </div>
          ))}
          <hr />
          <div className="order-line">
            <span>Subtotal</span>
            <b>{money(detail.subtotal)}</b>
          </div>
          <div className="order-line">
            <span>Frete</span>
            <b>{money(detail.shipping_fee)}</b>
          </div>
          <div className="order-line">
            <strong>Total</strong>
            <strong>{money(detail.total)}</strong>
          </div>
          <div className="notice">
            <b>
              {detail.fulfillment === "pickup" ? "Retirada na loja" : "Entrega"}
            </b>
            <p>
              {detail.neighborhood_name_snapshot} {detail.delivery_address}{" "}
              {detail.delivery_complement}
            </p>
            {detail.notes && <p>Observação: {detail.notes}</p>}
          </div>
          <a
            className="btn primary"
            target="_blank"
            rel="noreferrer"
            href={customerLink(detail)}
          >
            <MessageCircle size={16} />
            Conversar no WhatsApp
          </a>
          <div className="row modal-actions">
            {stages
              .filter((s) => s !== detail.status)
              .map((s) => (
                <button
                  key={s}
                  className="btn secondary small"
                  onClick={() => {
                    move(detail.id, s);
                    if (s !== "completed") setDetail(null);
                  }}
                >
                  {statusLabel[s]}
                </button>
              ))}
          </div>
        </Modal>
      )}
    </>
  );
}
function Column({
  status,
  count,
  children,
}: {
  status: Status;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={"kanban-column " + (isOver ? "drag-over" : "")}
    >
      <header>
        <span className={"stage-dot " + status} />
        <h2>{statusLabel[status]}</h2>
        <span className="count">{count}</span>
      </header>
      <div className="kanban-cards">
        {children}
        {!count && (
          <div className="drop-empty">
            Os pedidos desta etapa aparecem aqui.
          </div>
        )}
      </div>
    </section>
  );
}
function OrderCard({
  order: o,
  move,
  open,
  disabled,
}: {
  order: Order;
  move: (id: string, s: Status) => void;
  open: () => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: o.id, disabled });
  return (
    <article
      ref={setNodeRef}
      className={"order-card " + (isDragging ? "dragging" : "")}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <div className="row between">
        <span className="order-number">#{o.order_number}</span>
        <button
          className="drag-handle"
          aria-label={"Arrastar pedido " + o.order_number}
          {...listeners}
          {...attributes}
        >
          <GripVertical size={17} />
        </button>
      </div>
      <button className="order-title" onClick={open}>
        {o.customer_name}
      </button>
      <small className="muted">{o.customer_phone}</small>
      <div className="order-value">
        <b>{money(o.total)}</b>
        <small>{o.order_items.reduce((s, i) => s + i.quantity, 0)} itens</small>
      </div>
      {o.outcome && (
        <span className={"badge " + (o.outcome === "sold" ? "green" : "")}>
          {o.outcome === "sold" ? "Vendido" : "Não vendido"}
        </span>
      )}
      <small className="order-date">{dateTime(o.created_at)}</small>
      <footer>
        <a
          className="iconbtn whatsapp"
          aria-label="WhatsApp do cliente"
          href={customerLink(o)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={15} />
        </a>
        <button className="iconbtn" aria-label="Detalhes" onClick={open}>
          <Eye size={15} />
        </button>
        <div className="row">
          {o.status !== "new" && (
            <button
              disabled={disabled}
              className="btn secondary tiny"
              onClick={() =>
                move(o.id, o.status === "completed" ? "conversation" : "new")
              }
            >
              <ArrowLeft size={12} />
              Voltar
            </button>
          )}
          {o.status !== "completed" && (
            <button
              disabled={disabled}
              className="btn secondary tiny"
              onClick={() =>
                move(o.id, o.status === "new" ? "conversation" : "completed")
              }
            >
              Avançar
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
