import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDB } from "@/lib/supabase/server";
import { limit, sameOrigin } from "@/lib/rate-limit";

const signupSchema = z.object({
  email: z.email("E-mail inválido.").max(254),
  password: z.string().min(8, "Use pelo menos 8 caracteres.").max(72),
});

// Accounts are created already confirmed: email confirmation is not part of the signup flow.
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req))
      return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
    const parsed = signupSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    if (!(await limit(req, "signup", 5)))
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    const { email, password } = parsed.data;
    const { error } = await adminDB().auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });
    if (error) {
      const exists = error.code === "email_exists" || /already/i.test(error.message);
      return NextResponse.json(
        {
          error: exists
            ? "Já existe uma conta com este e-mail. Entre para continuar."
            : "Não foi possível criar a conta. Tente novamente.",
        },
        { status: exists ? 409 : 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar a conta. Tente novamente." },
      { status: 500 },
    );
  }
}
