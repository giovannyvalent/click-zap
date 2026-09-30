import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ClickZap",
    short_name: "ClickZap",
    description: "Seu catálogo. Seu carrinho. Seu WhatsApp.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f6",
    theme_color: "#16c784",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
