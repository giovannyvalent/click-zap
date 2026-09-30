import Link from "next/link";
import { Brand } from "@/components/brand";
export default function NotFound() {
  return (
    <main className="setup-page">
      <Brand />
      <h1>Página indisponível.</h1>
      <p>
        O endereço pode estar incorreto ou esta loja ainda não foi publicada.
      </p>
      <Link href="/" className="btn primary">
        Ir para o início
      </Link>
    </main>
  );
}
