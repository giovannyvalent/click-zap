import { notFound } from "next/navigation";
import { dashboardData } from "@/lib/data";
import { Dashboard } from "@/components/dashboard";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Painel | ClickZap",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section = [] } = await params;
  const page = section.join("/");
  if (
    ![
      "",
      "pedidos",
      "produtos",
      "categorias",
      "minha-loja",
      "configuracoes",
      "planos",
    ].includes(page)
  )
    notFound();
  return <Dashboard data={await dashboardData()} section={page} />;
}
