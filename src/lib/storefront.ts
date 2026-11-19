import type { Settings } from "./types";

// Variações de layout da vitrine pública. Ficam em store_settings.storefront
// (jsonb, migration 010). A coluna antiga `layout` (enum grid/list/showcase)
// continua sendo gravada com o equivalente, então sem a migration a loja
// ainda funciona com o layout base.
export const STOREFRONT_LAYOUTS = [
  "grid2",
  "grid3",
  "list",
  "cards",
  "showcase",
] as const;
export type StorefrontLayout = (typeof STOREFRONT_LAYOUTS)[number];

export const LAYOUT_OPTIONS: {
  value: StorefrontLayout;
  label: string;
  hint: string;
}[] = [
  { value: "grid2", label: "Grade 2 colunas", hint: "2 por linha no celular" },
  { value: "grid3", label: "Grade 3 colunas", hint: "Mais produtos na tela" },
  { value: "list", label: "Lista", hint: "Foto ao lado do preço" },
  { value: "cards", label: "Cards grandes", hint: "1 por linha, foto grande" },
  { value: "showcase", label: "Destaque", hint: "1º destaque em tamanho grande" },
];

export function storefrontLayout(
  s: Pick<Settings, "layout" | "storefront">,
): StorefrontLayout {
  const saved = s.storefront?.layout;
  if (saved && (STOREFRONT_LAYOUTS as readonly string[]).includes(saved))
    return saved as StorefrontLayout;
  return s.layout === "list"
    ? "list"
    : s.layout === "showcase"
      ? "showcase"
      : "grid2";
}

export function baseLayout(v: StorefrontLayout): Settings["layout"] {
  return v === "list" ? "list" : v === "showcase" ? "showcase" : "grid";
}

export const PALETTES: {
  id: string;
  name: string;
  accent: string;
  theme: Settings["theme"];
}[] = [
  { id: "zap", name: "Verde Zap", accent: "#16c784", theme: "light" },
  { id: "oceano", name: "Oceano", accent: "#2563eb", theme: "light" },
  { id: "lavanda", name: "Lavanda", accent: "#7c5cff", theme: "light" },
  { id: "grafite", name: "Grafite", accent: "#1f2937", theme: "light" },
  { id: "rose", name: "Rosé", accent: "#e0457b", theme: "soft" },
  { id: "terracota", name: "Terracota", accent: "#d9623b", theme: "soft" },
  { id: "noite", name: "Noite", accent: "#16c784", theme: "dark" },
  { id: "dourado", name: "Dourado", accent: "#e0b341", theme: "dark" },
];

// Cor do texto sobre a cor de destaque (botões, faixa promocional), para
// continuar legível com cores escuras ou claras.
export function accentInk(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "#072112";
  const n = parseInt(m[1], 16);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const l =
    0.2126 * lin((n >> 16) & 255) +
    0.7152 * lin((n >> 8) & 255) +
    0.0722 * lin(n & 255);
  return l > 0.179 ? "#0b1a10" : "#ffffff";
}
