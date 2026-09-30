import { notFound } from "next/navigation";
import { getStore } from "@/lib/data";
import { Store } from "@/components/store";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStore(slug);
  if (!data)
    return {
      title: "Loja indisponível",
      robots: { index: false, follow: false },
    };
  return {
    title: data.business.name + " | ClickZap",
    robots: { index: data.products.length > 0, follow: true },
    description:
      data.settings.description ||
      "Explore o catálogo e faça seu pedido pelo WhatsApp.",
    alternates: { canonical: "/loja/" + slug },
    openGraph: {
      title: data.business.name,
      description: data.settings.description,
      images: data.settings.logo_url ? [data.settings.logo_url] : [],
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStore(slug);
  if (!data) notFound();
  return <Store data={data} />;
}
