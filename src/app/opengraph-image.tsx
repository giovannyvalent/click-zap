import { ImageResponse } from "next/og";
export const alt = "ClickZap — Seu catálogo. Seu carrinho. Seu WhatsApp.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#090909",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 80,
        justifyContent: "center",
      }}
    >
      <div style={{ fontSize: 38, color: "#16c784", marginBottom: 40 }}>
        ClickZap
      </div>
      <div style={{ fontSize: 76, fontWeight: 700 }}>
        Seu catálogo. Seu carrinho.
      </div>
      <div style={{ fontSize: 76, color: "#16c784", fontWeight: 700 }}>
        Seu WhatsApp.
      </div>
      <div style={{ fontSize: 28, marginTop: 40, color: "#b7beb9" }}>
        Comece sua loja grátis.
      </div>
    </div>,
    size,
  );
}
