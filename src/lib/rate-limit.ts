import "server-only";
import { createHmac } from "node:crypto";
import { adminDB } from "./supabase/server";
export async function limit(request: Request, scope: string, max: number) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret) throw new Error("Proteção do servidor não configurada.");
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for") || "unknown"
    : "local";
  const key = createHmac("sha256", secret)
    .update(ip.split(",")[0].trim() + "|" + scope)
    .digest("hex");
  const { data, error } = await adminDB().rpc("consume_limit", {
    p_key: key,
    p_max: max,
    p_seconds: 600,
  });
  if (error) throw new Error("Não foi possível validar a solicitação.");
  if (!data) console.warn("rate_limit_blocked", { scope });
  return data === true;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}
