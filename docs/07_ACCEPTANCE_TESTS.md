# TESTES DE ACEITE — CLICKZAP V1

## Auth e isolamento

### A01
Criar usuário A e negócio A.

Esperado:
- onboarding concluído;
- business membership owner.

### A02
Criar usuário B e negócio B.

Esperado:
- A nunca acessa dados de B;
- B nunca acessa dados de A.

## Categorias

### C01
Criar categoria "Presentes".

Esperado:
- aparece em Categorias;
- aparece no select do produto.

### C02
Desativar categoria.

Esperado:
- não aparece na loja pública;
- produto não deve quebrar.

## Produtos

### P01
Criar produto com:
- nome;
- categoria;
- preço;
- descrição;
- 5 fotos.

Esperado:
- salva;
- primeira foto vira capa;
- aparece na loja.

### P02
Tentar 6ª foto.

Esperado:
- bloquear com mensagem clara.

### P03
Produto inativo.

Esperado:
- não aparece na loja;
- não pode entrar em novo pedido.

## Minha Loja

### L01
Trocar:
- cor;
- logo;
- layout;
- tema;
- card;
- formato imagem;
- botão.

Esperado:
- preview muda;
- salvar persiste;
- loja pública reflete.

### L02
Desativar descrição/busca/categorias.

Esperado:
- componentes somem da loja.

## Entrega

### E01
Frete global = R$ 10.

Pedido:
- subtotal R$ 100.

Esperado:
- total R$ 110.

### E02
Frete por bairro:
- Centro R$ 8
- Marco R$ 15

Esperado:
- selecionar Marco → frete R$ 15.

### E03
Retirada.

Esperado:
- frete R$ 0.

## Pedido

### O01
Cliente monta carrinho.

Esperado:
- pedido criado antes do WhatsApp;
- order e order_items persistidos;
- número do pedido retornado.

### O02
Alterar preço no DevTools.

Esperado:
- servidor ignora preço do cliente;
- usa preço atual do banco.

### O03
Produto inativado entre carregamento e checkout.

Esperado:
- pedido rejeitado ou item removido com mensagem clara.

## WhatsApp

### W01
Após order criado.

Esperado:
- abrir WhatsApp do lojista;
- mensagem contém número, itens, subtotal, frete, total e dados cliente.

### W02
No Kanban clicar WhatsApp.

Esperado:
- abrir conversa com telefone do cliente;
- mensagem menciona pedido.

## Kanban

### K01
Abrir Pedidos.

Esperado:
- Kanban é padrão.

### K02
Arrastar Novo → Em conversa.

Esperado:
- status persiste após refresh.

### K03
Arrastar Em conversa → Concluído.

Esperado:
- pedir Vendido/Não vendido.

### K04
Marcar Vendido.

Esperado:
- card mostra resultado;
- métricas refletem venda.

### K05
Voltar Concluído → Em conversa.

Esperado:
- resultado volta a null.

## Filtros

### F01
Abrir pedidos sem alterar filtro.

Esperado:
- "Esta semana".

### F02
Hoje.

Esperado:
- somente pedidos de hoje.

### F03
Este mês.

Esperado:
- somente mês corrente.

### F04
Personalizado.

Esperado:
- início/fim inclusivos e válidos.

## SEO

### S01
Homepage.

Esperado:
- title;
- meta description;
- canonical;
- schema.

### S02
Loja publicada.

Esperado:
- metadados do negócio.

### S03
Loja rascunho.

Esperado:
- não indexável.

## Mobile

### M01
Loja pública em 375px.

Esperado:
- sem overflow;
- carrinho acessível;
- CTA legível;
- filtros usáveis;
- imagens otimizadas.
