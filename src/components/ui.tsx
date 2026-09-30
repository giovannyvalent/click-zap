"use client";
import { useState, type ReactNode } from "react";
import { X, PackageOpen, LoaderCircle } from "lucide-react";
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={"modal " + (wide ? "wide" : "")}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button className="iconbtn" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <PackageOpen size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function useTask() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function run(fn: () => Promise<void>, message = "Alterações salvas.") {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await fn();
      setSuccess(message);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return {
    busy,
    error,
    success,
    run,
    feedback: (
      <>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="notice" role="status">
            {success}
          </p>
        )}
      </>
    ),
  };
}
export function SaveButton({
  busy,
  label = "Salvar alterações",
}: {
  busy: boolean;
  label?: string;
}) {
  return (
    <button className="btn primary" disabled={busy} type="submit">
      {busy ? (
        <>
          <LoaderCircle size={16} className="spin" />
          Salvando…
        </>
      ) : (
        label
      )}
    </button>
  );
}
