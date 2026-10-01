"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createBusiness } from "@/lib/actions";
import { slugify } from "@/lib/utils";
import { Brand } from "./brand";
export function Onboarding() {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<{ name: string; slug: string; whatsapp: string }>();
  return (
    <main className="setup-page">
      <Brand />
      <span className="eyebrow">PASSO 1 DE 5 · SEU NEGÓCIO</span>
      <h1>
        Vamos dar um endereço
        <br />
        para sua loja.
      </h1>
      <p className="muted">
        Depois, configure entrega, categoria, produto e publicação.
      </p>
      <form
        onSubmit={handleSubmit(async (v) => {
          try {
            await createBusiness(v);
            window.location.assign("/app/configuracoes?onboarding=1");
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Não foi possível criar a loja.",
            );
          }
        })}
      >
        <label>
          Nome do negócio
          <input
            required
            maxLength={100}
            {...register("name", {
              onChange: (e) => setValue("slug", slugify(e.target.value)),
            })}
          />
        </label>
        <label>
          Endereço da loja
          <input required pattern="[-a-z0-9]{3,60}" {...register("slug")} />
          <small>clickzap / loja / seu-endereco</small>
        </label>
        <label>
          WhatsApp com DDD
          <input
            required
            placeholder="55 91 99999-9999"
            {...register("whatsapp")}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? "Criando…" : "Criar minha loja"}
        </button>
      </form>
    </main>
  );
}
