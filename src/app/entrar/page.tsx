export const dynamic = "force-dynamic";
import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export const metadata = {
  title: "Entrar | ClickZap",
  robots: { index: false, follow: false },
};
export default function Page() {
  if (!configured()) redirect("/configurar");
  return <AuthForm mode="login" />;
}
