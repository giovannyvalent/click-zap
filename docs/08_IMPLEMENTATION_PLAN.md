# PLANO DE IMPLEMENTAÇÃO

## Fase 1 — Fundação
- criar projeto Next.js;
- configurar Supabase;
- auth SSR;
- layout;
- migrations;
- RLS;
- storage.

Entrega:
- login;
- cadastro;
- onboarding básico;
- tenant isolation.

## Fase 2 — Catálogo
- categorias CRUD;
- produtos CRUD;
- upload até 5 fotos;
- Minha Loja;
- Configurações.

Entrega:
- lojista consegue montar loja real.

## Fase 3 — Loja pública
- rota pública;
- SSR;
- busca;
- categorias;
- carrinho;
- entrega;
- frete.

Entrega:
- cliente consegue montar pedido.

## Fase 4 — Orders + WhatsApp
- endpoint seguro;
- order/order_items;
- cálculo server-side;
- mensagem;
- wa.me.

Entrega:
- pedido fica persistido e WhatsApp abre.

## Fase 5 — Operação comercial
- Kanban;
- drag;
- lista;
- filtros;
- outcome;
- WhatsApp cliente;
- dashboard.

Entrega:
- lojista consegue operar pedidos.

## Fase 6 — Produção
- SEO técnico;
- performance;
- analytics;
- erros;
- loading states;
- empty states;
- testes;
- deploy.

## Fase 7 — Billing
Somente após V1 operacional.

- limites;
- assinatura;
- Pro;
- upgrade/downgrade.

## Regra de execução para Work

Não tentar desenvolver tudo em uma única mudança sem validação.

A cada fase:
1. implementar;
2. rodar migrations;
3. testar;
4. corrigir;
5. avançar.

O HTML de referência não deve ser perdido visualmente, mas o código final deve ser modular e manutenível.
