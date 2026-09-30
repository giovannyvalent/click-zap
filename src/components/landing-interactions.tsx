"use client";
import { useEffect } from "react";
export function LandingInteractions() {
  useEffect(() => {
    const root = document.querySelector(".premium-landing");
    if (!root) return;
    const titles: Record<string, string> = {
      catalogo: "Catálogo público em um único link",
      carrinho: "Carrinho simples, direto e sem login",
      central: "Pedido salvo na central de pedidos antes do WhatsApp",
      whatsapp: "Conversa pronta para avançar",
    };
    function click(e: Event) {
      const target = e.target as Element;
      const flow = target.closest<HTMLElement>("[data-flow]");
      if (flow) {
        const key = flow.dataset.flow!;
        root!.querySelectorAll("[data-flow]").forEach((x) => {
          x.classList.toggle("active", x === flow);
          x.setAttribute("aria-pressed", String(x === flow));
        });
        root!
          .querySelectorAll<HTMLElement>("[data-slide]")
          .forEach((x) =>
            x.classList.toggle("active", x.dataset.slide === key),
          );
        const title = root!.querySelector("#flowTitle");
        if (title) title.textContent = titles[key] || "";
      }
      const faq = target.closest(".faq-q");
      if (faq) {
        const item = faq.closest(".faq-item")!;
        root!.querySelectorAll(".faq-item").forEach((x) => {
          if (x !== item) x.classList.remove("open");
        });
        item.classList.toggle("open");
        root!
          .querySelectorAll(".faq-q")
          .forEach((x) =>
            x.setAttribute(
              "aria-expanded",
              String(x.closest(".faq-item")!.classList.contains("open")),
            ),
          );
      }
    }
    root.addEventListener("click", click);
    return () => root.removeEventListener("click", click);
  }, []);
  return null;
}
