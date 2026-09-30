# Entrega ClickZap V1 — 29/09/2026

## Resultado

Implementação modular do briefing para Next.js e Supabase. Build de produção e TypeScript passaram. Migrations executadas em PostgreSQL embarcado de testes. Não foi provisionado um Supabase remoto nem realizado deploy Vercel.

## Correções sobre o SQL fornecido

1. Removida a política que permitia a qualquer usuário inserir a si próprio em qualquer empresa.
2. Criação da empresa/proprietário/configurações passa por RPC autenticada, atômica e com trava por usuário.
3. Vínculos produto/categoria e foto/produto exigem a mesma empresa.
4. Usuários não podem alterar `plan_key`, totais de pedidos, snapshots ou inserir pedidos diretamente.
5. As RPCs de pedido e rate limit são exclusivas da `service_role`, inclusive em instalações que concedem EXECUTE por default a `anon`/`authenticated`.
6. Resultado obrigatório em Concluído; resultado e data de conclusão limpos ao reabrir.
7. Limite Start de 10 produtos não arquivados aplicado com trava no banco.
8. Checkout transacional com preços do banco, validação de categorias/produtos ativos, frete por modalidade, snapshots e chave de idempotência.
9. Função autenticada para reordenar/substituir vínculos de até cinco imagens, validando caminho, arquivo e empresa.
10. Buckets e políticas incluídos nas migrations, além de eventos comerciais por trigger.

## Testes locais executados

19 testes passaram: 14 subtestes de banco dentro de um teste de integração, mais 4 de domínio. Abrangem isolamento, tentativa de autoassociação, alteração de plano/preço, publicação vazia, checkout adulterado, idempotência, acesso público a pedidos, conclusão/reabertura, categorias/produtos inativos, frete global/bairro/retirada, limite de produtos e fotos, rate limit, telefone, datas e mensagem.

A execução usa PGlite para SQL real e shims mínimos de Auth/Storage. Não executa o serviço HTTP de Storage, SMTP ou GoTrue hospedado.

No Chromium:

- Marketing servido pelo Next.js compilado, desktop e mobile; navegação de configuração e loja indisponível.
- Harness isolado de interface: avançar/voltar pedidos; concluir e exigir resultado; drag-and-drop entre colunas; alternar lista; criar categoria/produto; preview em tempo real; checkout com payload de IDs/quantidades seguido de abertura do WhatsApp após resposta do servidor.
- Ausência de erros JavaScript nos fluxos testados.
- Falha simulada de checkout não abre o WhatsApp; tentativa de recuperação reutiliza a chave de idempotência.
- Loja pública a 375 px sem overflow horizontal.

As screenshots em `docs/screenshots` usam dados fictícios somente para inspeção visual. O app de produção não carrega esses dados.

## Pontos que dependem do ambiente do proprietário

Aplicar as cinco migrations; configurar Auth/SMTP e URLs de callback; preencher variáveis; conectar Vercel; testar persistência Auth/Storage/checkout/kanban com duas contas reais em homologação.

O critério de “pronto para produção” do briefing depende dessa homologação real. O ZIP é a implementação para instalar e validar, não uma afirmação de que um serviço já está publicado.
