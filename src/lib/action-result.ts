// Resultado das server actions de escrita. Em produção o Next.js troca a
// mensagem de qualquer erro lançado dentro de uma server action por um texto
// genérico ("Minified React error #441"), então os erros esperados (validação,
// regras do banco) precisam voltar como valor, não como exceção.
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const GENERIC = "Não foi possível salvar. Tente novamente.";

// Mensagens que não fazem sentido para o lojista (erros internos do React/Next,
// falhas de rede) viram um texto amigável.
export function friendlyMessage(e: unknown, fallback = GENERIC): string {
  const message = e instanceof Error ? e.message : "";
  if (!message) return fallback;
  if (/failed to fetch|networkerror|load failed|fetch failed/i.test(message))
    return "Sem conexão com o servidor. Verifique sua internet e tente novamente.";
  if (
    /minified react error|react\.dev\/errors|server components render|digest|unexpected response|an error occurred in the server/i.test(
      message,
    )
  )
    return fallback;
  return message;
}

// Usado no cliente: devolve o dado ou lança um Error com a mensagem amigável,
// para que useTask/try-catch mostrem o texto certo.
export function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
