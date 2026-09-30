"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { browserDB } from "@/lib/supabase/client";
import { Brand } from "./brand";
const schema = z.object({
  email: z.email("E-mail inválido."),
  password: z.string().min(8, "Use pelo menos 8 caracteres."),
});
export function AuthForm({
  mode,
}: {
  mode: "login" | "signup" | "recover" | "reset";
}) {
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: mode === "reset" ? "reset@example.com" : "",
      password: mode === "recover" ? "unused-password" : "",
    },
  });
  async function submit(v: z.infer<typeof schema>) {
    setBusy(true);
    setNotice("");
    try {
      const db = browserDB();
      const origin = window.location.origin;
      let error;
      if (mode === "signup") {
        const r = await db.auth.signUp({
          email: v.email,
          password: v.password,
          options: { emailRedirectTo: origin + "/auth/callback" },
        });
        error = r.error;
        if (!error) {
          if (r.data.session) {
            window.location.assign("/onboarding");
            return;
          }
          setNotice("Confira seu e-mail para confirmar a conta.");
        }
      } else if (mode === "login") {
        const r = await db.auth.signInWithPassword(v);
        error = r.error;
        if (!error) {
          window.location.assign("/app");
          return;
        }
      } else if (mode === "recover") {
        const r = await db.auth.resetPasswordForEmail(v.email, {
          redirectTo: origin + "/auth/callback?next=/nova-senha",
        });
        error = r.error;
        if (!error)
          setNotice("Se houver uma conta, você receberá um link por e-mail.");
      } else {
        const r = await db.auth.updateUser({ password: v.password });
        error = r.error;
        if (!error) {
          window.location.assign("/app");
          return;
        }
      }
      if (error)
        setNotice(
          mode === "login"
            ? "Não foi possível entrar. Confira os dados e a confirmação do e-mail."
            : error.message,
        );
    } catch {
      setNotice("Não foi possível conectar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-story">
        <Brand />
        <div>
          <span className="eyebrow">MENOS COMPLICAÇÃO. MAIS CONVERSA.</span>
          <h1>
            Sua próxima venda
            <br />
            começa com
            <br />
            <em>um Click.</em>
          </h1>
          <p>
            Catálogo bonito. Pedido organizado.
            <br />
            Tudo pronto para conversar pelo WhatsApp.
          </p>
        </div>
        <small>ClickZap · Seu negócio, do seu jeito.</small>
      </div>
      <div className="auth-box">
        <Brand />
        <span className="eyebrow">BEM-VINDO AO CLICKZAP</span>
        <h1>
          {mode === "signup"
            ? "Comece sua loja grátis"
            : mode === "recover"
              ? "Recuperar acesso"
              : mode === "reset"
                ? "Defina sua nova senha"
                : "Bom ter você de volta"}
        </h1>
        <p className="muted">
          {mode === "signup"
            ? "Até 10 produtos. Sem cartão de crédito."
            : "Acesse sua loja e mantenha os pedidos em dia."}
        </p>
        <form onSubmit={handleSubmit(submit)}>
          {mode !== "reset" && (
            <label>
              E-mail
              <input type="email" autoComplete="email" {...register("email")} />
              <small className="error">{errors.email?.message}</small>
            </label>
          )}
          {mode !== "recover" && (
            <label>
              Senha
              <input
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                {...register("password")}
              />
              <small className="error">{errors.password?.message}</small>
            </label>
          )}
          {notice && (
            <p role="status" className="notice">
              {notice}
            </p>
          )}
          <button className="btn primary full" disabled={busy}>
            {busy
              ? "Aguarde…"
              : mode === "signup"
                ? "Criar conta gratuita"
                : mode === "recover"
                  ? "Enviar link"
                  : mode === "reset"
                    ? "Salvar nova senha"
                    : "Entrar"}
          </button>
        </form>
        {mode === "login" && (
          <Link href="/recuperar" className="text-link">
            Esqueci minha senha
          </Link>
        )}
        <p className="muted">
          {mode === "signup" ? "Já tem conta? " : "Ainda não tem conta? "}
          <Link href={mode === "signup" ? "/entrar" : "/cadastro"}>
            {mode === "signup" ? "Entrar" : "Criar conta grátis"}
          </Link>
        </p>
      </div>
    </main>
  );
}
