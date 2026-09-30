> Atualizado em 30/09/2026 pela landing V5.2. Consulte README.md para o estado de billing e permissões Pro.

# REGRAS DE NEGÓCIO

## Negócio

- Um usuário pode pertencer a um ou mais negócios.
- Na V1, onboarding cria um negócio e o usuário vira `owner`.
- Uma loja só fica pública se `published = true`.

## Categorias

- Produto deve referenciar categoria válida do mesmo negócio.
- Categoria inativa não aparece na loja.
- Categoria com produtos não pode ser apagada silenciosamente.
- Ao excluir:
  - bloquear e pedir remanejamento, OU
  - oferecer "mover produtos para outra categoria".
- Ordem manual suportada.

## Produtos

- Sem controle de estoque.
- Sem fabricante/marca.
- Um preço único obrigatório.
- `price >= 0`.
- Até 5 imagens.
- Primeira imagem ordenada é a capa.
- Produto inativo:
  - não aparece na loja;
  - não pode entrar em novo pedido.
- Produto já usado em pedido nunca deve ser apagado fisicamente de `order_items`.
- Ao criar pedido, copiar snapshot:
  - nome;
  - preço unitário;
  - imagem de capa opcional.

## Loja

- Slug único.
- WhatsApp obrigatório antes de publicar.
- Pelo menos:
  - 1 categoria ativa;
  - 1 produto ativo;
  para publicar.

## Entrega

`fulfillment`:
- pickup
- delivery

Se retirada desativada:
- não mostrar pickup.

Se entrega desativada:
- não mostrar delivery.

Se entrega = global:
- usar `global_shipping_fee`.

Se entrega = neighborhood:
- exigir bairro ativo;
- usar fee da zona selecionada.

O cliente não pode alterar o frete no client.

## Pedido

Estados de workflow:
- `new`
- `conversation`
- `completed`

Resultado:
- `sold`
- `not_sold`
- `null`

Regras:
- pedido novo nasce em `new`;
- ao mover para `completed`, pedir resultado;
- se mover para fora de `completed`, resultado volta para `null`;
- `completed + sold` conta como venda;
- `completed + not_sold` conta como perda;
- pedido não deve ser deletado na V1.

## Kanban

Padrão ao abrir Pedidos: Kanban.

Ações:
- drag-and-drop;
- avançar;
- voltar;
- abrir detalhe;
- WhatsApp.

Drag:
- `new → conversation`;
- `conversation → new`;
- `conversation → completed`;
- `completed → conversation`;
- permitir drop direto entre colunas, mas ao entrar em completed exigir outcome.

## Lista

Alternância persistente por usuário:
- Kanban
- Lista

Pode armazenar preferência no navegador ou perfil.

## Filtros de pedidos

Padrão:
- `Esta semana`.

Opções:
- Hoje;
- Esta semana;
- Este mês;
- Personalizado.

Personalizado:
- start_date;
- end_date.

Demais:
- texto;
- status;
- resultado;
- valor mínimo;
- ordenação.

## WhatsApp

Merchant WhatsApp:
- usar número configurado em business.
- normalizar para dígitos.
- DDI obrigatório.

Customer WhatsApp shortcut:
- usar customer phone do pedido.
- DDI pode ser normalizado conforme país/default do negócio.

## Cálculo

Subtotal:
Σ `unit_price_snapshot * quantity`

Total:
`subtotal + shipping_fee`

Nunca confiar no total do navegador.

## Fotos

- até 5;
- ordenar;
- excluir;
- tipos permitidos;
- sanitizar nomes;
- paths por business/product.

## Plano Start

Se limite de 10 produtos for aplicado:
- contar produtos não arquivados;
- impedir criação acima do limite;
- nunca ocultar/remover produto automaticamente.

## Publicação

Rascunho:
- lojista pode configurar;
- rota pública retorna loja indisponível/não publicada.

Publicada:
- loja indexável conforme configuração geral do produto.
