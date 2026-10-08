"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  QrCode,
  CreditCard,
  Copy,
  Check,
  Lock,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { Modal, useTask, SaveButton } from "./ui";
import {
  subscribeToPro,
  cancelPro,
  checkProStatus,
  getPaymentHistory,
} from "@/lib/actions";
import { subscribeSchema } from "@/lib/schemas";
import { PLANS, type PlanKey, type Business } from "@/lib/types";
import { money, dateTime } from "@/lib/utils";
import { z } from "zod";

type SubscribeInput = z.input<typeof subscribeSchema>;
type PayablePlan = Exclude<PlanKey, "start">;
type PixResult = { type: "pix"; qrImage: string; payload: string; expirationDate: string };
type CardResult = { type: "card"; confirmed: boolean };

function maskCpfCnpj(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    const [p1, p2, p3, p4] = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9), d.slice(9, 11)];
    return p1 + (p2 ? "." + p2 : "") + (p3 ? "." + p3 : "") + (p4 ? "-" + p4 : "");
  }
  const [p1, p2, p3, p4, p5] = [
    d.slice(0, 2),
    d.slice(2, 5),
    d.slice(5, 8),
    d.slice(8, 12),
    d.slice(12, 14),
  ];
  return p1 + (p2 ? "." + p2 : "") + (p3 ? "." + p3 : "") + (p4 ? "/" + p4 : "") + (p5 ? "-" + p5 : "");
}
function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  let out = ddd ? "(" + ddd : "";
  if (ddd.length === 2) out += ") ";
  const isMobile = d.length > 10;
  const mid = isMobile ? rest.slice(0, 5) : rest.slice(0, 4);
  const end = isMobile ? rest.slice(5, 9) : rest.slice(4, 8);
  out += mid + (end ? "-" + end : "");
  return out;
}
function maskCep(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
}
function maskCardNumber(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 19);
  return d.match(/.{1,4}/g)?.join(" ") || d;
}
function maskDigits(max: number) {
  return (raw: string) => raw.replace(/\D/g, "").slice(0, max);
}

const years = Array.from({ length: 16 }, (_, i) => String(new Date().getFullYear() + i));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

function usePaymentPolling(active: boolean, onConfirmed: () => void) {
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 150) {
        clearInterval(interval);
        return;
      }
      const status = await checkProStatus().catch(() => null);
      if (cancelled || !status) return;
      if (status.planKey === "plus" || status.planKey === "pro") {
        clearInterval(interval);
        onConfirmed();
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [active, onConfirmed]);
}

function PixValidity({ expirationDate }: { expirationDate: string }) {
  const target = new Date(expirationDate.replace(" ", "T"));
  const hoursLeft = (target.getTime() - Date.now()) / 3_600_000;
  if (hoursLeft <= 0) return <span className="countdown expired">Código expirado</span>;
  if (hoursLeft <= 48) {
    const h = Math.floor(hoursLeft);
    const m = Math.floor((hoursLeft - h) * 60);
    return (
      <span className="countdown">
        Expira em {h}h{String(m).padStart(2, "0")}
      </span>
    );
  }
  return <span className="countdown">Válido até {dateTime(target.toISOString())}</span>;
}

export function ManageSubscription({ business }: { business: Business }) {
  const router = useRouter();
  const task = useTask();
  const [confirming, setConfirming] = useState(false);
  const [history, setHistory] = useState<
    Awaited<ReturnType<typeof getPaymentHistory>> | null
  >(null);
  useEffect(() => {
    if (business.plan_key === "start") return;
    getPaymentHistory().then(setHistory).catch(() => setHistory([]));
  }, [business.plan_key]);
  if (business.plan_key === "start") return null;
  const plan = PLANS[business.plan_key as PlanKey] ?? PLANS.pro;
  const label =
    business.billing_status === "past_due" ? "Pagamento atrasado" : "Assinatura ativa";
  const statusMap: Record<string, string> = {
    CONFIRMED: "Confirmado",
    RECEIVED: "Recebido",
    PENDING: "Pendente",
    OVERDUE: "Atrasado",
    REFUNDED: "Reembolsado",
  };
  return (
    <div className="panel padded subscription-card">
      <div className="row between">
        <div>
          <b className={business.billing_status === "past_due" ? "danger" : ""}>{label}</b>
          <p className="muted">
            Plano {plan.label} · {money(plan.price)}/mês
          </p>
        </div>
        {!confirming ? (
          <button className="btn secondary small" onClick={() => setConfirming(true)}>
            Cancelar assinatura
          </button>
        ) : (
          <div className="row">
            <button
              className="btn secondary small danger"
              disabled={task.busy}
              onClick={() =>
                task.run(async () => {
                  await cancelPro();
                  router.refresh();
                }, "Assinatura cancelada.")
              }
            >
              Confirmar cancelamento
            </button>
            <button className="btn secondary small" onClick={() => setConfirming(false)}>
              Voltar
            </button>
          </div>
        )}
      </div>
      {task.feedback}
      <div className="payment-history">
        <small className="nav-label">PAGAMENTOS</small>
        {history === null ? (
          <p className="muted">Carregando…</p>
        ) : history.length === 0 ? (
          <p className="muted">Nenhum pagamento registrado ainda.</p>
        ) : (
          <ul>
            {history.map((p) => (
              <li key={p.id}>
                <span>{dateTime(p.paymentDate || p.dueDate)}</span>
                <span>{money(p.value)}</span>
                <span className={"pill " + p.status.toLowerCase()}>
                  {statusMap[p.status] || p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function SubscribeButton({
  business,
  plan,
  defaultName,
  defaultEmail,
  defaultPhone,
}: {
  business: Business;
  plan: PayablePlan;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
}) {
  const [open, setOpen] = useState(false);
  if (business.plan_key === plan) return null;
  return (
    <>
      <button className="btn primary full" onClick={() => setOpen(true)}>
        Quero o {PLANS[plan].label}
      </button>
      {open && (
        <SubscribeModal
          plan={plan}
          defaultName={defaultName}
          defaultEmail={defaultEmail}
          defaultPhone={defaultPhone}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SubscribeModal({
  plan,
  defaultName,
  defaultEmail,
  defaultPhone,
  onClose,
}: {
  plan: PayablePlan;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const task = useTask();
  const planInfo = PLANS[plan];
  const [step, setStep] = useState<"identity" | "card">("identity");
  const [method, setMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [result, setResult] = useState<PixResult | CardResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SubscribeInput>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      phone: defaultPhone,
      plan,
      billingType: "PIX",
    },
  });

  usePaymentPolling(
    !confirmed && (result?.type === "pix" || result?.type === "card"),
    () => setConfirmed(true),
  );

  async function goToCard() {
    const ok = await trigger(["name", "email", "cpfCnpj", "phone"]);
    if (!ok) return;
    if (!getValues("cardHolderName"))
      setValue("cardHolderName", getValues("name").toUpperCase());
    setStep("card");
  }

  async function onSubmit(v: SubscribeInput) {
    await task.run(async () => {
      const res = await subscribeToPro({ ...v, billingType: method });
      setResult(res as PixResult | CardResult);
    });
  }

  function finish() {
    onClose();
    router.refresh();
  }

  async function copyPayload(payload: string) {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o código Pix:", payload);
    }
  }

  if (confirmed) {
    return (
      <Modal title="Assinatura ativada!" onClose={() => (window.location.href = "/app")} fullscreen>
        <div className="stack center-text">
          <CheckCircle2 size={56} color="#0c9d65" />
          <p>
            Seu plano {planInfo.label} já está ativo. Produtos ilimitados dentro do novo
            limite, personalização completa e mais liberado no seu painel.
          </p>
          <button className="btn primary full" onClick={() => (window.location.href = "/app")}>
            Ir para o painel
          </button>
        </div>
      </Modal>
    );
  }

  if (result?.type === "pix") {
    return (
      <Modal title="Pagar com Pix" onClose={finish} fullscreen>
        <div className="stack">
          <div className="pix-box">
            <img
              src={`data:image/png;base64,${result.qrImage}`}
              alt="QR Code Pix"
              width={200}
              height={200}
            />
          </div>
          <PixValidity expirationDate={result.expirationDate} />
          <label>
            Pix copia e cola
            <div className="copy-row">
              <input readOnly value={result.payload} onFocus={(e) => e.target.select()} />
              <button type="button" className="btn secondary" onClick={() => copyPayload(result.payload)}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </label>
          <p className="notice row">
            <LoaderCircle size={15} className="spin" />
            Aguardando confirmação do pagamento — o plano ativa sozinho assim que cair.
          </p>
          <button className="btn secondary full" onClick={finish}>
            Fechar e continuar depois
          </button>
        </div>
      </Modal>
    );
  }
  if (result?.type === "card") {
    return (
      <Modal title={result.confirmed ? "Pagamento aprovado!" : "Processando pagamento"} onClose={finish} fullscreen>
        <div className="stack center-text">
          {result.confirmed ? (
            <CheckCircle2 size={56} color="#0c9d65" />
          ) : (
            <LoaderCircle size={40} className="spin" />
          )}
          <p>
            {result.confirmed
              ? `Seu plano ${planInfo.label} já está ativo.`
              : "Estamos confirmando o pagamento com a operadora do cartão. Isso ativa automaticamente em instantes."}
          </p>
          <button
            className="btn primary full"
            onClick={result.confirmed ? () => (window.location.href = "/app") : finish}
          >
            {result.confirmed ? "Ir para o painel" : "Fechar e acompanhar depois"}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Assinar ClickZap ${planInfo.label}`} onClose={onClose} fullscreen>
      <div className="plan-summary">
        <div>
          <b>
            {planInfo.label} · {money(planInfo.price)}
            <small>/mês</small>
          </b>
          <p className="muted">Até {planInfo.productLimit} produtos · cancele quando quiser</p>
        </div>
      </div>
      <form key={step} onSubmit={handleSubmit(onSubmit)}>
        {step === "identity" ? (
          <>
            <div className="method-grid">
              <button
                type="button"
                className={"choice-card" + (method === "PIX" ? " active" : "")}
                onClick={() => setMethod("PIX")}
              >
                <QrCode size={18} />
                <b>Pix</b>
                <small>Aprova na hora, sem fidelidade.</small>
              </button>
              <button
                type="button"
                className={"choice-card" + (method === "CREDIT_CARD" ? " active" : "")}
                onClick={() => setMethod("CREDIT_CARD")}
              >
                <CreditCard size={18} />
                <b>Cartão de crédito</b>
                <small>Cobrança recorrente mensal.</small>
              </button>
            </div>
            <label>
              Nome completo
              <input {...register("name")} />
              <small className="error">{errors.name?.message}</small>
            </label>
            <label>
              E-mail
              <input type="email" {...register("email")} />
              <small className="error">{errors.email?.message}</small>
            </label>
            <div className="form-grid">
              <label>
                CPF ou CNPJ
                {(() => {
                  const r = register("cpfCnpj");
                  return (
                    <input
                      {...r}
                      onChange={(e) => {
                        e.target.value = maskCpfCnpj(e.target.value);
                        r.onChange(e);
                      }}
                    />
                  );
                })()}
                <small className="error">{errors.cpfCnpj?.message}</small>
              </label>
              <label>
                WhatsApp
                {(() => {
                  const r = register("phone");
                  return (
                    <input
                      {...r}
                      onChange={(e) => {
                        e.target.value = maskPhone(e.target.value);
                        r.onChange(e);
                      }}
                    />
                  );
                })()}
                <small className="error">{errors.phone?.message}</small>
              </label>
            </div>
            {task.feedback}
            {method === "CREDIT_CARD" ? (
              <button type="button" className="btn primary full" onClick={goToCard}>
                Continuar
              </button>
            ) : (
              <SaveButton busy={task.busy} label={`Gerar Pix de ${money(planInfo.price)}`} />
            )}
          </>
        ) : (
          <>
            <button type="button" className="step-back" onClick={() => setStep("identity")}>
              <ArrowLeft size={15} /> Voltar
            </button>
            <label>
              Nome impresso no cartão
              <input {...register("cardHolderName")} />
              <small className="error">{errors.cardHolderName?.message}</small>
            </label>
            <label>
              Número do cartão
              {(() => {
                const r = register("cardNumber");
                return (
                  <input
                    {...r}
                    inputMode="numeric"
                    onChange={(e) => {
                      e.target.value = maskCardNumber(e.target.value);
                      r.onChange(e);
                    }}
                  />
                );
              })()}
              <small className="error">{errors.cardNumber?.message}</small>
            </label>
            <div className="form-grid triple">
              <label>
                Mês
                <select {...register("cardExpiryMonth")} defaultValue="">
                  <option value="" disabled>
                    MM
                  </option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ano
                <select {...register("cardExpiryYear")} defaultValue="">
                  <option value="" disabled>
                    AAAA
                  </option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                CVV
                {(() => {
                  const r = register("cardCcv");
                  return (
                    <input
                      {...r}
                      inputMode="numeric"
                      onChange={(e) => {
                        e.target.value = maskDigits(4)(e.target.value);
                        r.onChange(e);
                      }}
                    />
                  );
                })()}
              </label>
            </div>
            <div className="form-grid">
              <label>
                CEP
                {(() => {
                  const r = register("postalCode");
                  return (
                    <input
                      {...r}
                      onChange={(e) => {
                        e.target.value = maskCep(e.target.value);
                        r.onChange(e);
                      }}
                    />
                  );
                })()}
                <small className="error">{errors.postalCode?.message}</small>
              </label>
              <label>
                Número do endereço
                <input {...register("addressNumber")} />
                <small className="error">{errors.addressNumber?.message}</small>
              </label>
            </div>
            {task.feedback}
            <SaveButton busy={task.busy} label={`Pagar ${money(planInfo.price)}/mês`} />
          </>
        )}
        <p className="trust-line muted">
          <Lock size={13} /> Pagamento processado com segurança pelo Asaas.
        </p>
      </form>
    </Modal>
  );
}
