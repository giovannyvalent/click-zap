# SEO E GOOGLE — PREPARAÇÃO PARA INBOUND

O Google será o motor de aquisição inicial do ClickZap.

A estratégia completa de conteúdo será definida depois, mas a arquitetura não pode prejudicar SEO.

## Marketing indexável

Páginas iniciais recomendadas:

- `/`
- `/catalogo-whatsapp`
- `/pedidos-whatsapp`
- `/como-funciona`
- `/precos`

Possíveis páginas futuras:
- `/catalogo-digital-para-whatsapp`
- `/link-de-produtos-whatsapp`
- `/carrinho-para-whatsapp`
- `/vender-pelo-whatsapp`

## Requisitos técnicos

- metadata por página;
- title/description únicos;
- canonical;
- sitemap.xml;
- robots.txt;
- Open Graph;
- Twitter card;
- favicon/manifest;
- HTML semântico;
- headings corretos;
- Core Web Vitals;
- imagens otimizadas;
- SSR/SSG;
- schema.org:
  - SoftwareApplication
  - Organization
  - WebSite
  - FAQPage quando houver FAQ.

## Loja pública

Cada loja deve ter:
- title;
- description;
- og image se disponível;
- canonical.

Cuidado:
- não gerar páginas vazias/thin automaticamente;
- loja não publicada deve ser `noindex`.

## Analytics

Preparar eventos:
- marketing_cta_signup
- signup_completed
- onboarding_completed
- store_published
- store_view
- product_view
- add_to_cart
- order_created
- whatsapp_opened
- order_sold

## Search Console

Após deploy:
- cadastrar domínio;
- enviar sitemap;
- validar indexação.

Não precisa automatizar Search Console na V1.
