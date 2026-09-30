import { NextResponse } from "next/server";
import { serverDB } from "@/lib/supabase/server";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next =
    url.searchParams.get("next") === "/nova-senha" ? "/nova-senha" : "/app";
  if (code) {
    const db = await serverDB();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/entrar?erro=link", url.origin));
}
