# DEPLOY — VERCEL + SUPABASE

## Ambientes

- local
- preview
- production

## Variáveis

Usar `.env.example`.

Nunca commitar:
- service role key;
- secrets;
- tokens.

## Supabase

1. Criar projeto.
2. Rodar migration `001_init.sql`.
3. Criar buckets:
   - `product-images`
   - `business-assets`
4. Aplicar políticas.
5. Configurar Auth redirect URLs.
6. Configurar domínio de produção.

## Vercel

1. Importar repositório.
2. Adicionar envs.
3. Build.
4. Testar preview.
5. Configurar domínio.
6. Confirmar redirects de Auth.
7. Confirmar endpoint público de orders.

## Buckets

### product-images
Path:
`{business_id}/{product_id}/{uuid}.{ext}`

### business-assets
Path:
`{business_id}/logo/{uuid}.{ext}`

Leitura pública pode ser habilitada para os arquivos da loja.
Escrita apenas por membros do negócio.

## Checklist pré-produção

- [ ] Auth funcionando
- [ ] RLS testado com 2 negócios
- [ ] Um negócio não enxerga outro
- [ ] Upload de imagens
- [ ] Loja pública publicada
- [ ] Loja rascunho bloqueada
- [ ] Pedido real criado
- [ ] Preço recalculado no servidor
- [ ] Frete recalculado no servidor
- [ ] WhatsApp abre após pedido
- [ ] Kanban atualiza
- [ ] Drag-and-drop persiste
- [ ] Outcome Vendido/Não vendido
- [ ] Filtros de data
- [ ] Link WhatsApp do cliente
- [ ] Mobile da loja
- [ ] sitemap
- [ ] robots
- [ ] metadados
