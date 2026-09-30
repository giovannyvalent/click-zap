"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-page">
      <h1>Não foi possível carregar.</h1>
      <p>Verifique sua conexão e tente novamente.</p>
      <button className="btn primary" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
