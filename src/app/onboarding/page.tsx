export const dynamic = "force-dynamic";
import { Onboarding } from "@/components/onboarding";
import { requireUser } from "@/lib/data";
import { redirect } from "next/navigation";
export const metadata = {
  title: "Criar loja | ClickZap",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const { db, user } = await requireUser();
  const { data } = await db
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (data) redirect("/app");
  return <Onboarding />;
}
