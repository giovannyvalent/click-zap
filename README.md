# ClickZap — V1

Projeto implementado em **Next.js App Router + TypeScript + React + Tailwind CSS + Supabase**, preparado para deploy na Vercel.

**Situação da entrega:** código, migrations e testes locais concluídos. Nenhum projeto Supabase remoto foi conectado e nenhum deploy público foi realizado nesta entrega. Para operação real, execute as migrations, configure as variáveis e valide o fluxo em seu ambiente. Assinaturas e pagamentos não estão ativos.

## O que está implementado

- Páginas públicas de marketing, preços, catálogo, pedidos e funcionamento, com metadados, sitemap, robots, Open Graph e dados estruturados.
- Cadastro, confirmação de e-mail, login, saída e recuperação de senha com Supabase Auth / cookies SSR.
- Criação transacional de empresa + proprietário + configurações, uma loja por conta na V1.
- Painel com pedidos do período, valor solicitado, vendidos, não vendidos, conversão entre concluídos, produtos ativos e mais pedido.
- Categorias: criar, editar, ativar/desativar, excluir com bloqueio de dependências e ordenar pelo campo de ordem.
- Produtos: cadastro, edição, arquivamento, filtros, preço, código, categoria, tags, destaque e até 5 fotos. Sem estoque/fabricante.
- Upload JPG/PNG/WEBP, até 5 MB por foto; conversão para WEBP com lado máximo de 1.600 px. Capa, reordenação e remoção de vínculo.
- Minha Loja com 3 layouts, 3 temas, estilos de card, proporção de foto, botões, logo, cores, textos e preview desktop/mobile.
- Retirada, entrega com frete único ou por bairro; CRUD de bairros, status e ordem.
- Loja pública sem login, busca, categorias, detalhe com galeria, carrinho e checkout leve.
- Pedido e itens salvos em **uma transação**, com preços/frete atuais do banco, snapshots e idempotência. WhatsApp só abre após resposta de sucesso.
- Kanban com dnd-kit, avançar/voltar, lista, detalhes, link de WhatsApp, filtros e resultado obrigatório ao concluir.
- Isolamento por empresa com RLS, limites Start no banco, rate limit persistente por IP/loja e registro de eventos internos.

A V1 libera a personalização existente no Start. O Pro é uma proposta futura exibida como **em breve**, sem botão de cobrança. Não existe checkout financeiro, API oficial do WhatsApp nem envio automático de mensagens.

## 1. Executar localmente

Requisitos: Node.js **22 ou superior**, npm e um projeto Supabase.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. Sem as variáveis do Supabase, o marketing funciona e as rotas privadas exibem instruções de configuração; não há banco fake nem login de demonstração.

## 2. Configurar Supabase

Use um projeto novo. No SQL Editor, execute **`supabase/INSTALL.sql`**, que reúne todas as migrations em uma transação.

Como alternativa, execute os cinco arquivos abaixo **na ordem**. Use uma das opções; não execute INSTALL.sql e depois as migrations novamente:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/migrations/003_security_and_transactions.sql`
4. `supabase/migrations/004_storage_and_events.sql`
5. `supabase/migrations/005_updated_start_plan.sql`

**Não publique apenas 001/002.** O SQL-base enviado no briefing continha uma permissão insegura de autoassociação a empresas. A migration 003 a remove, adiciona chaves compostas entre entidades da mesma empresa, restringe alterações de planos e totais, aplica limites e cria as funções transacionais.

A migration 004 cria os buckets públicos `product-images` e `business-assets`, com tamanho/tipos permitidos e políticas de escrita por empresa. Não é necessário criar buckets manualmente. As migrations são de instalação e não devem ser executadas novamente em um banco já inicializado. Use migrations incrementais para mudanças futuras.

Em Authentication:

- Habilite o provedor de e-mail/senha.
- Mantenha a confirmação de e-mail ativada.
- Configure `Site URL` para a URL da aplicação.
- Autorize `http://localhost:3000/auth/callback` e `http://localhost:3000/auth/callback?next=/nova-senha` durante desenvolvimento.
- Em produção, autorize os equivalentes no domínio final. Cadastre também o domínio de preview que for usar.
- Configure SMTP próprio para enviar confirmações e recuperação de senha ao público. O serviço de testes do Supabase pode limitar destinatários/envios.

Não coloque credenciais reais no repositório, ZIP ou mensagens públicas.

## 3. Variáveis

| Variável | Onde obter / usar |
|---|---|
| `NEXT_PUBLIC_APP_URL` | URL canônica da aplicação, com `https://` em produção, sem barra final |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública `anon` do projeto; RLS protege dados privados |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role`, **somente servidor**; usada no checkout público e eventos |
| `RATE_LIMIT_SECRET` | Segredo aleatório para hash dos IPs, **somente servidor** |

Gere o último valor, por exemplo, com `openssl rand -hex 32`. Os arquivos de ambiente estão ignorados pelo Git.

## 4. Publicar na Vercel

1. Extraia este projeto, crie um repositório e envie o código.
2. Na Vercel, importe o repositório. Se este projeto estiver dentro de outra pasta, selecione-a como **Root Directory**.
3. Framework: **Next.js**. Node: **22.x ou superior compatível**.
4. Comando de instalação: `npm ci`. Build: `npm run build`. Output: padrão do Next.js.
5. Configure as cinco variáveis em Production e no Preview desejado. Preferencialmente use um Supabase separado para homologação.
6. Faça o deploy. Atualize `NEXT_PUBLIC_APP_URL` com o domínio definitivo e os redirects de Auth no Supabase; faça novo deploy após alterar variáveis públicas.
7. Execute o roteiro de homologação abaixo antes de divulgar.
8. Cadastre o domínio no Search Console e envie `/sitemap.xml`.

Não existe `vercel.json` porque a configuração padrão do Next.js já atende às rotas. O código não depende de disco local persistente nem de memória de uma instância para pedidos/rate limiting.

## 5. Homologação real obrigatória

- Criar duas contas com e-mails distintos e confirmar o acesso.
- Criar lojas A/B. Conferir que pedidos, produtos privados e configurações de uma não aparecem para a outra.
- Configurar frete, categoria, produto com 5 fotos, personalizar e publicar A.
- Em janela anônima, montar pedido com entrega por bairro; conferir total e WhatsApp.
- Confirmar que o pedido aparece no painel; recarregar a página.
- Arrastar entre colunas, concluir com resultado, recarregar e confirmar persistência.
- Testar retirada com frete zero e um produto inativado entre carrinho/checkout.
- Testar recuperação de senha e upload pelo celular.

Os testes locais descritos abaixo **não substituem** a verificação do Auth, Storage, SMTP e cookies no domínio real.

## 6. Validação automatizada

```bash
npm test
npm run typecheck
npm run build
```

- Banco: PostgreSQL embarcado via **PGlite somente nos testes**, com schemas de Auth/Storage mínimos de teste. Não é o banco da aplicação.
- Testes executam as cinco migrations e exercitam RLS, cross-tenant, planos, publicação, transação de pedidos, preços, fretes, idempotência, status e limites.
- Testes de domínio: datas de Fortaleza, telefone, validação e mensagem WhatsApp.
- Revisão visual em Chromium a 1.440 px e 375 px. Fluxos de interface foram exercitados com fixtures isoladas e respostas controladas; não houve chamada a um Supabase de produção nem mensagem enviada.

Consulte `docs/IMPLEMENTADO_E_VALIDADO.md` para limites e evidências.

## Estrutura

```text
src/app/                    Rotas Next.js, SEO e endpoints públicos
src/components/             Marketing, auth, dashboard, catálogo, pedidos, loja e personalização
src/lib/                    Supabase SSR, actions, schemas, tipos, uploads e utilitários
supabase/migrations/        Instalação SQL, segurança, transações, storage e eventos
tests/                      Testes SQL e regras de domínio
docs/                       Briefing original e relatório de implementação
references/                 HTML visual original, sem uso como backend
```

## Operação e limites conhecidos

- Valores no dashboard são intenções de compra; só `completed + sold` representa uma venda registrada pelo lojista. Conversão = vendidos / concluídos no período, com base na data de criação do pedido.
- Datas e início da semana (segunda-feira) usam `America/Fortaleza`. Número do pedido usa sequência global; não promete numeração contínua por loja.
- Rate limit: 10 tentativas de pedido e 90 eventos por IP/loja em 10 minutos. IP é transformado em HMAC; o IP bruto não é salvo. Em Vercel, usa o header de origem da plataforma; em desenvolvimento, compartilha a chave local.
- O WhatsApp recebe uma mensagem preenchida. O usuário ainda precisa enviá-la. `whatsapp_opened` registra a tentativa de abrir, não confirma envio/leitura.
- As fotos são públicas por URL; não use esses buckets para documentos privados. Ao remover/substituir fotos, o vínculo no catálogo é removido, mas os arquivos anteriores podem continuar no bucket. Uma rotina de limpeza de arquivos órfãos pode ser adicionada posteriormente.
- O painel carrega pedidos em lotes do banco e filtra na interface. Antes de operar lojas com histórico muito grande, evolua para paginação e agregações por período no servidor; não há teste de carga nesta entrega.
- Eventos públicos servem como telemetria básica, não como contagem antifraude. Eventos comerciais são registrados por triggers do banco. GA4/Vercel Analytics não foram ativados.
- Não há cobrança, convite de equipe, multiunidade, estoque, nota fiscal ou integração logística.
- A estrutura suporta associações entre usuários e empresas; a UI da V1 opera a primeira empresa do usuário, e o onboarding cria somente uma.

## Referências técnicas

- https://nextjs.org/docs/app
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Atualização de 30/09: landing V5.2 e planos

A homepage e `/precos` usam a nova landing aprovada, preservando margens, navbar em negrito, exemplos visuais e ausência de travessões no conteúdo importado. FAQs e demonstração de fluxo são interativas. Os CTAs gratuitos levam ao cadastro.

- **Start:** grátis, 1 loja, até 10 produtos, carrinho para WhatsApp, pedidos registrados, entrega/retirada e marca ClickZap.
- **Pro:** R$ 54,90/mês, produtos ilimitados, personalização completa, central de pedidos, indicadores comerciais, frete por bairro e remoção da marca.
- O botão Pro leva à página de planos do painel. A landing informa que a contratação online ainda está indisponível. Não concede upgrade nem realiza cobrança.
- As restrições exclusivas de funcionalidades Pro ainda dependem da etapa de billing/entitlements. Na V1, os recursos já disponíveis no Start não foram bloqueados. O limite de produtos, porém, é aplicado no banco.

**Se você já aplicou as migrations da entrega anterior, execute somente `005_updated_start_plan.sql`.** Ela preserva produtos existentes acima de 10 e permite editá-los; impede novas inclusões enquanto o total estiver no limite ou acima dele. Não apaga nem oculta catálogo existente.
