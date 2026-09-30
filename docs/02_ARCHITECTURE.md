# ARQUITETURA — CLICKZAP V1

## Stack

### Frontend / Server
- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- React Server Components onde fizer sentido
- Route Handlers / Server Actions para operações seguras

### Backend
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage

### Deploy
- Vercel

### Bibliotecas
- `@supabase/ssr`
- `@supabase/supabase-js`
- `zod`
- `react-hook-form`
- `@hookform/resolvers`
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- biblioteca leve de ícones (Lucide)

## Multi-tenancy

Toda entidade privada deve pertencer a um `business_id`.

Não usar `user_id` como única fronteira de dados.

Estrutura:
- usuário;
- negócio;
- associação usuário ↔ negócio;
- dados do negócio.

Isso permite equipe no futuro sem reescrever banco.

## Rotas sugeridas

### Marketing
- `/`
- `/catalogo-whatsapp`
- `/pedidos-whatsapp`
- `/como-funciona`
- `/precos`

### Auth
- `/entrar`
- `/cadastro`
- `/onboarding`

### App
- `/app`
- `/app/pedidos`
- `/app/categorias`
- `/app/produtos`
- `/app/minha-loja`
- `/app/configuracoes`
- `/app/planos`

### Público
- `/loja/[slug]`

Opcional futuro:
- rewrite `/[slug]` → `/loja/[slug]`

## Estratégia de rendering

### Marketing
SSR/SSG, indexável.

### Loja pública
SSR/ISR quando possível:
- metadados do negócio;
- produtos;
- categorias;
- configurações.

Carrinho no cliente.

### Dashboard
Protegido por auth.
Pode usar server components para carregamento e client components para interação.

## Criação pública de pedido

NÃO permitir que o navegador defina:
- preço;
- subtotal;
- frete;
- total.

Fluxo recomendado:

`POST /api/public/orders`

Payload:
- business slug/id;
- item IDs e quantidades;
- customer data;
- fulfillment;
- neighborhood id quando aplicável;
- observação.

Servidor:
- valida schema com Zod;
- busca negócio publicado;
- busca produtos ativos;
- recalcula preços;
- busca frete;
- calcula total;
- cria pedido e itens em transação;
- retorna order number, total e merchant WhatsApp.

Não expor `SUPABASE_SERVICE_ROLE_KEY` ao browser.

## Rate limit

O endpoint público de pedido precisa de proteção básica contra abuso.

Implementação inicial:
- rate limit por IP e loja;
- limite razoável de pedidos por janela;
- logar tentativas bloqueadas.

Pode usar recurso compatível com Vercel/Upstash quando o Work considerar adequado.

## Estado do carrinho

Pode ser mantido em:
- React state;
- localStorage apenas como cache temporário do carrinho.

Nunca usar localStorage como fonte de verdade para:
- produtos;
- pedidos;
- configurações;
- usuário.

## URLs públicas

Canonical:
`{NEXT_PUBLIC_APP_URL}/loja/{slug}`

Slug:
- único;
- lowercase;
- `[a-z0-9-]`;
- 3–60 caracteres;
- reservado contra palavras do sistema:
  - app
  - entrar
  - cadastro
  - precos
  - api
  - admin
  - loja
  - suporte

## Performance

Loja pública:
- otimizar imagens;
- lazy loading;
- server rendering;
- minimizar JS;
- Lighthouse mobile como referência.

## Analytics

Preparar:
- GA4 opcional por env;
- Vercel Analytics opcional;
- eventos internos:
  - store_view
  - product_view
  - add_to_cart
  - begin_order
  - order_created
  - whatsapp_opened

Não bloquear lançamento caso GA4 não esteja configurado.
