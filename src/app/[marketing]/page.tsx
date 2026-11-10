import { PremiumLanding } from "@/components/premium-landing";
import { AssinarLanding } from "@/components/assinar-landing";
import { notFound } from "next/navigation";
import { Marketing, marketingPages } from "@/components/marketing";
export function generateStaticParams() {
  return Object.keys(marketingPages).map((marketing) => ({ marketing }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ marketing: string }>;
}) {
  const { marketing } = await params;
  const p = marketingPages[marketing];
  return p
    ? {
        title: p.title,
        description: p.description,
        alternates: { canonical: "/" + marketing },
      }
    : { robots: { index: false } };
}
export default async function Page({
  params,
}: {
  params: Promise<{ marketing: string }>;
}) {
  const { marketing } = await params;
  if (!marketingPages[marketing]) notFound();
  if (marketing === "assinar") return <AssinarLanding />;
  return marketing === "precos" ? <PremiumLanding /> : <Marketing page={marketing} />;
}
