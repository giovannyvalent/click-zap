"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Modal, useTask, SaveButton } from "./ui";
import { subscribeToPro, cancelPro } from "@/lib/actions";
import type { Business } from "@/lib/types";

type SubscribeInput = {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  cardHolderName: string;
  cardNumber: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCcv: string;
  postalCode: string;
  addressNumber: string;
};
type PixResult = { type: "pix"; qrImage: string; payload: string; expirationDate: string };
type CardResult = { type: "card"; confirmed: boolean };

export function ManageSubscription({ business }: { business: Business }) {
  const router = useRouter();
  const task = useTask();
  const [confirming, setConfirming] = useState(false);
  if (business.plan_key !== "pro") return null;
  const label =
    business.billing_status === "past_due" ? "Pagamento atrasado" : "Assinatura ativa";
  return (
    <div className="panel padded" style={{ marginTop: 16 }}>
      <div className="row between">
        <div>
          <b>{label}</b>
          <p className="muted">Plano Pro · R$ 54,90/mês</p>
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
    </div>
  );
}

export function SubscribeButton({ business }: { business: Business }) {
  const [open, setOpen] = useState(false);
  if (business.plan_key === "pro") return null;
  return (
    <>
      <button className="btn primary full" onClick={() => setOpen(true)}>
        Quero o ClickZap Pro
      </button>
      {open && <SubscribeModal onClose={() => setOpen(false)} />}
    </>
  );
}

function SubscribeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const task = useTask();
  const [method, setMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [result, setResult] = useState<PixResult | CardResult | null>(null);
  const { register, handleSubmit } = useForm<SubscribeInput>();

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

  if (result?.type === "pix") {
    return (
      <Modal title="Pagar com Pix" onClose={finish}>
        <div className="stack">
          <img
            src={`data:image/png;base64,${result.qrImage}`}
            alt="QR Code Pix"
            style={{ width: 220, height: 220, margin: "0 auto", display: "block" }}
          />
          <label>
            Pix copia e cola
            <textarea
              readOnly
              rows={3}
              value={result.payload}
              onClick={(e) => e.currentTarget.select()}
            />
          </label>
          <p className="muted">
            Após o pagamento, seu plano Pro é ativado automaticamente em poucos segundos.
          </p>
          <button className="btn primary full" onClick={finish}>
            Já paguei, fechar
          </button>
        </div>
      </Modal>
    );
  }
  if (result?.type === "card") {
    return (
      <Modal title={result.confirmed ? "Pagamento aprovado!" : "Processando pagamento"} onClose={finish}>
        <p>
          {result.confirmed
            ? "Seu plano Pro já está ativo."
            : "Estamos confirmando o pagamento com a operadora do cartão. Isso pode levar alguns instantes — o plano é liberado assim que confirmar."}
        </p>
        <button className="btn primary full" onClick={finish}>
          Fechar
        </button>
      </Modal>
    );
  }

  return (
    <Modal title="Assinar ClickZap Pro" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={"btn " + (method === "PIX" ? "primary" : "secondary")}
            onClick={() => setMethod("PIX")}
          >
            Pix
          </button>
          <button
            type="button"
            className={"btn " + (method === "CREDIT_CARD" ? "primary" : "secondary")}
            onClick={() => setMethod("CREDIT_CARD")}
          >
            Cartão de crédito
          </button>
        </div>
        <label>
          Nome completo
          <input required {...register("name")} />
        </label>
        <label>
          E-mail
          <input type="email" required {...register("email")} />
        </label>
        <div className="form-grid">
          <label>
            CPF ou CNPJ
            <input required {...register("cpfCnpj")} />
          </label>
          <label>
            WhatsApp
            <input required {...register("phone")} />
          </label>
        </div>
        {method === "CREDIT_CARD" && (
          <>
            <hr />
            <label>
              Nome impresso no cartão
              <input required {...register("cardHolderName")} />
            </label>
            <label>
              Número do cartão
              <input required inputMode="numeric" {...register("cardNumber")} />
            </label>
            <div className="form-grid">
              <label>
                Mês de validade
                <input required placeholder="MM" maxLength={2} {...register("cardExpiryMonth")} />
              </label>
              <label>
                Ano de validade
                <input required placeholder="AAAA" maxLength={4} {...register("cardExpiryYear")} />
              </label>
            </div>
            <div className="form-grid">
              <label>
                CVV
                <input required maxLength={4} {...register("cardCcv")} />
              </label>
              <label>
                CEP
                <input required {...register("postalCode")} />
              </label>
            </div>
            <label>
              Número do endereço
              <input required {...register("addressNumber")} />
            </label>
          </>
        )}
        {task.feedback}
        <SaveButton busy={task.busy} label={method === "PIX" ? "Gerar Pix" : "Confirmar assinatura"} />
      </form>
    </Modal>
  );
}
