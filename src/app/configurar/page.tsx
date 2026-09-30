import { Brand } from "@/components/brand";
export const metadata = {
  title: "Configuração | ClickZap",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main className="setup-page">
      <Brand />
      <h1>Conecte seu Supabase</h1>
      <p>O projeto está instalado. Para ativar contas e lojas reais:</p>
      <ol>
        <li>
          Execute as migrations da pasta <code>supabase/migrations</code>, em
          ordem.
        </li>
        <li>
          Preencha as variáveis do arquivo <code>.env.example</code> no ambiente
          de execução.
        </li>
        <li>Configure os endereços de autenticação no Supabase.</li>
        <li>Reinicie o projeto ou publique um novo deploy.</li>
      </ol>
      <p>
        Consulte o guia <strong>README.md</strong> do projeto.
      </p>
      <a className="btn primary" href="/">
        Ver página inicial
      </a>
    </main>
  );
}
