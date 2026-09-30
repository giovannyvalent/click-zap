import type { Metadata } from "next";
import "./globals.css";
const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: "ClickZap | Seu catálogo. Seu carrinho. Seu WhatsApp.",
  description:
    "Crie seu catálogo online, receba pedidos e organize suas vendas pelo WhatsApp. Comece grátis com até 10 produtos.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "ClickZap",
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
