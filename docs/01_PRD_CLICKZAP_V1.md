> Atualizado em 30/09/2026 pela landing V5.2. Consulte README.md para o estado de billing e permissões Pro.

# PRD — CLICKZAP V1

## 1. Produto

**ClickZap** é um catálogo/loja leve para negócios que vendem por conversa no WhatsApp e não precisam de um e-commerce tradicional.

Proposta:

> Publique seus produtos, deixe o cliente montar o pedido e receba a conversa no WhatsApp já organizada.

## 2. Público-alvo

Pequenos e médios negócios que:
- vendem produtos pelo WhatsApp;
- recebem pedidos manualmente;
- não precisam ou não querem um checkout completo;
- precisam organizar pedidos;
- usam Instagram, WhatsApp, Google ou links diretos como aquisição.

Exemplos:
- lojas de roupas;
- presentes;
- cosméticos;
- artesanato;
- acessórios;
- lojas locais;
- revendedores;
- pequenos distribuidores;
- negócios sob encomenda.

## 3. Jobs to be done

### Para o lojista

- Criar um catálogo rapidamente.
- Compartilhar um único link.
- Reduzir perguntas repetidas sobre preço/produto.
- Receber pedidos estruturados.
- Continuar a venda no WhatsApp.
- Organizar andamento dos pedidos.
- Saber o que virou venda e o que não virou.
- Configurar entrega/frete sem plataforma logística.

### Para o cliente

- Ver produtos sem instalar app ou criar conta.
- Buscar e filtrar produtos.
- Adicionar itens ao carrinho.
- Saber o total aproximado.
- Selecionar entrega/retirada.
- Enviar o pedido para o WhatsApp em poucos cliques.

## 4. Módulos

### Dashboard
- Pedidos do período.
- Valor total dos pedidos.
- Pedidos vendidos.
- Pedidos não vendidos.
- Taxa de conversão comercial.
- Produtos ativos.
- Link público da loja.
- Atalhos.

### Pedidos
Visualização padrão: **Kanban**.

Colunas:
1. Novo
2. Em conversa
3. Concluído

Ações:
- Arrastar e soltar card entre colunas.
- Botão compacto "Voltar".
- Botão compacto "Avançar".
- Abrir detalhes.
- Abrir conversa do WhatsApp do cliente.
- Alternar para visualização em lista.

Resultado comercial:
- `Vendido`
- `Não vendido`

Ao mover para Concluído, solicitar resultado comercial.
Ao retirar um pedido de Concluído, o resultado pode ser limpo automaticamente.

Filtros:
- busca por cliente, telefone ou número do pedido;
- status;
- resultado;
- valor mínimo;
- ordenação;
- período.

Período padrão:
- **Esta semana**

Opções:
- Hoje
- Esta semana
- Este mês
- Personalizado:
  - data inicial
  - data final

### Categorias
Módulo próprio no menu.

CRUD:
- criar;
- editar;
- ativar/desativar;
- excluir quando não houver dependência ou exigir remanejamento dos produtos;
- ordenar.

Campos:
- nome;
- slug;
- ativo;
- ordem.

Produtos selecionam categoria por lista. Não permitir categoria digitada livremente.

### Produtos
Sem estoque.
Sem marca/fabricante.

Campos:
- nome;
- código interno opcional;
- categoria obrigatória;
- descrição;
- preço;
- tags opcionais;
- destaque;
- ativo/inativo;
- até 5 fotos.

Regras:
- primeira foto = capa;
- permitir reordenar fotos;
- permitir remover/substituir;
- formatos: JPG, PNG, WEBP;
- limite sugerido por foto: 5 MB;
- compressão/otimização antes ou durante upload.

### Minha Loja
Menu próprio separado de Configurações.

Campos e opções:

#### Identidade
- logo;
- cor principal.

#### Estrutura
3 modelos:
1. Grade
2. Lista/Catálogo
3. Vitrine com produto em destaque

#### Tema
- Claro
- Escuro
- Soft

#### Cards
- Soft
- Contornado
- Minimal

#### Fotos
- Paisagem
- Quadrado
- Retrato

#### Botões
- Arredondado
- Pílula
- Reto

#### Conteúdo
- título/chamada principal;
- descrição;
- faixa promocional;
- texto da faixa.

#### Elementos visíveis
- busca;
- categorias;
- descrição dos produtos;
- faixa promocional.

#### Preview
- Desktop
- Mobile
- atualização em tempo real.

### Configurações
Somente configurações operacionais.

Dados:
- nome do negócio;
- slug público;
- WhatsApp;
- status publicado/rascunho.

Entrega:
- permitir retirada;
- permitir entrega.

Se entrega estiver ativa:

#### Modo 1 — frete global
- valor único de frete.

#### Modo 2 — frete por bairro
Lista CRUD:
- nome do bairro;
- valor do frete;
- ativo;
- ordem.

Na loja pública:
- cliente seleciona bairro;
- frete entra no total;
- frete aparece na mensagem do WhatsApp.

### Loja pública
Sem login.

Requisitos:
- responsiva;
- mobile-first;
- rápida;
- logo e branding do lojista;
- busca;
- categorias;
- produtos;
- preço;
- fotos;
- carrinho;
- entrega/retirada;
- frete;
- observação;
- dados do cliente;
- CTA para WhatsApp.

### Checkout leve
Campos mínimos:
- nome do cliente;
- telefone;
- entrega ou retirada;
- bairro quando necessário;
- endereço quando entrega;
- complemento opcional;
- observação opcional.

Não cobrar pagamento.

## 5. Pedido e WhatsApp

Antes do redirect:
1. validar loja publicada;
2. validar produtos ativos;
3. buscar preços no banco;
4. recalcular subtotal;
5. validar frete;
6. recalcular total;
7. criar `order`;
8. criar `order_items`;
9. gerar número do pedido;
10. retornar dados para montagem da mensagem.

Mensagem sugerida:

Olá! Quero fazer um pedido pela {LOJA}. 👋

🛍️ *Pedido #{NUMERO}*

{QTD}x {PRODUTO} — {TOTAL_ITEM}
...

Subtotal: {SUBTOTAL}
Frete: {FRETE}
💰 *Total: {TOTAL}*

👤 {CLIENTE}
📱 {TELEFONE}
📍 {TIPO_ENTREGA}
{BAIRRO}
{ENDERECO}

📝 Obs.: {OBSERVACAO}

Pedido montado pelo ClickZap.

## 6. Atalho WhatsApp no painel

Em cada pedido:
- botão/ícone compacto de WhatsApp;
- abrir `wa.me/{telefone_cliente}`;
- incluir texto opcional:
  - "Olá, {nome}! Estou falando sobre seu pedido #{numero} feito pelo ClickZap."

Deve existir:
- no card do Kanban;
- no modal/detalhe;
- na lista.

## 7. Planos

### Start — grátis
- 1 loja;
- até 10 produtos;
- carrinho para WhatsApp;
- marca ClickZap na loja.

### Pro — referência inicial
- R$ 54,90/mês;
- produtos ilimitados;
- personalização completa;
- analytics;
- remover marca ClickZap.

Cobrança pode entrar após o fluxo principal estar 100% estável.
Arquitetura deve estar preparada para planos/limites.

## 8. Fora de escopo da V1

- estoque;
- marca/fabricante;
- checkout de pagamento;
- nota fiscal;
- transportadora;
- API oficial do WhatsApp;
- automações de marketing;
- cupons;
- domínio próprio do lojista;
- multiunidade.
