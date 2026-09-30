import Link from "next/link";
import {
  ArrowRight,
  Check,
  ShoppingBag,
  MessageCircle,
  Layers,
  Palette,
  Truck,
  BarChart3,
  Plus,
  Zap,
} from "lucide-react";
import { Brand } from "./brand";
export const marketingPages: Record<
  string,
  { title: string; description: string; heading: string; lead: string }
> = {
  "catalogo-whatsapp": {
    title: "Catálogo para WhatsApp grátis | ClickZap",
    description:
      "Organize produtos, fotos e preços em um catálogo online com carrinho para WhatsApp.",
    heading: "Um catálogo que faz a conversa começar.",
    lead: "Apresente seus produtos em uma loja leve, com fotos, categorias e preços. Seu cliente escolhe e chega ao WhatsApp com o pedido organizado.",
  },
  "pedidos-whatsapp": {
    title: "Organize pedidos do WhatsApp | ClickZap",
    description:
      "Receba pedidos com itens e frete e acompanhe cada conversa em um Kanban simples.",
    heading: "Cada pedido no seu lugar.",
    lead: "Acompanhe do primeiro contato ao resultado comercial. O pedido fica registrado antes de a conversa abrir no WhatsApp.",
  },
  "como-funciona": {
    title: "Como funciona o ClickZap | Catálogo e pedidos",
    description:
      "Veja como criar sua loja, cadastrar produtos e receber pedidos pelo WhatsApp.",
    heading: "Da sua vitrine para o WhatsApp.",
    lead: "Crie sua conta, organize os produtos, configure entrega e publique. Seu cliente monta o carrinho e você continua a venda por conversa.",
  },
  precos: {
    title: "Planos ClickZap | Comece grátis",
    description:
      "Comece com uma loja e até 10 produtos no plano Start gratuito. Sem cartão de crédito.",
    heading: "Sua primeira loja começa grátis.",
    lead: "Use o plano Start para publicar até 10 produtos, receber pedidos e organizar suas conversas. Sem pagamento online ou cobrança automática.",
  },
};
const faq = [
  [
    "O cliente precisa criar conta?",
    "Não. Ele acessa sua loja, escolhe os produtos e informa os dados necessários para o pedido.",
  ],
  [
    "O ClickZap cobra o pagamento do pedido?",
    "Não. A negociação e o pagamento são combinados diretamente entre você e o cliente.",
  ],
  [
    "Preciso da API oficial do WhatsApp?",
    "Não. O ClickZap registra o pedido e gera um link para abrir uma conversa no seu WhatsApp.",
  ],
  [
    "Posso configurar entrega por bairro?",
    "Sim. Use um valor único de frete ou cadastre bairros com valores diferentes.",
  ],
  [
    "Quando um pedido vira venda?",
    "Quando você concluir a conversa e marcar o resultado como Vendido no painel.",
  ],
];
export function Marketing({ page = "" }: { page?: string }) {
  const content = marketingPages[page];
  return (
    <div className="marketing">
      <header className="marketing-nav container">
        <Brand />
        <nav>
          <Link href="/como-funciona">Como funciona</Link>
          <Link href="/catalogo-whatsapp">Recursos</Link>
          <Link href="/precos">Planos</Link>
        </nav>
        <div className="row">
          <Link className="nav-login" href="/entrar">
            Entrar
          </Link>
          <Link className="btn primary" href="/cadastro">
            Começar grátis <ArrowRight size={15} />
          </Link>
        </div>
      </header>
      <section className="marketing-hero">
        <div className="container hero-grid">
          <div>
            <span className="hero-tag">
              <span /> SUA LOJA, A UMA CONVERSA DE DISTÂNCIA
            </span>
            <h1>
              {content ? (
                content.heading
              ) : (
                <>
                  Seu catálogo.
                  <br />
                  Seu carrinho.
                  <br />
                  <em>Seu WhatsApp.</em>
                </>
              )}
            </h1>
            <p>
              {content?.lead ||
                "Transforme seu link em uma vitrine. Deixe o cliente escolher e receba o pedido pronto para conversar. Simples assim."}
            </p>
            <div className="row wrap hero-actions">
              <Link href="/cadastro" className="btn primary">
                Criar minha loja grátis <ArrowRight size={17} />
              </Link>
              <a href="#como-funciona" className="btn hero-secondary">
                Veja como funciona
              </a>
            </div>
            <div className="hero-checks">
              <span>
                <Check size={14} />
                Sem cartão de crédito
              </span>
              <span>
                <Check size={14} />
                Até 10 produtos grátis
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit" />
            <div className="demo-phone">
              <div className="phone-notch" />
              <div className="demo-shop-head">
                <span>V</span>
                <div>
                  <b>Viva Studio</b>
                  <small>Objetos para o seu dia.</small>
                </div>
                <ShoppingBag size={17} />
              </div>
              <div className="demo-shop-copy">
                <small>COLEÇÃO ESSENCIAL</small>
                <h2>
                  Pequenos detalhes.
                  <br />
                  Grandes favoritos.
                </h2>
              </div>
              <div className="demo-product-grid">
                {[
                  ["cup", "Caneca Essencial", "39,90"],
                  ["bag", "Bolsa Natural", "89,90"],
                  ["vase", "Vaso Orgânico", "59,90"],
                  ["bottle", "Garrafa Daily", "49,90"],
                ].map(([art, name, price]) => (
                  <div className="demo-product" key={art}>
                    <div className={"demo-art " + art}>
                      <div />
                    </div>
                    <b>{name}</b>
                    <div>
                      <span>R$ {price}</span>
                      <Plus size={13} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="demo-cart">
                <ShoppingBag size={14} />
                <b>Ver meu carrinho</b>
                <ArrowRight size={14} />
              </div>
              <small className="demo-caption">Vitrine ilustrativa</small>
            </div>
            <div className="hero-floating">
              <span>
                <MessageCircle size={22} />
              </span>
              <div>
                <b>Um pedido. Tudo organizado.</b>
                <small>Pronto para continuar no WhatsApp.</small>
              </div>
              <Check size={16} />
            </div>
            <div className="hero-sticker">
              <Zap size={18} />
              <b>
                Seu negócio.
                <br />
                Seu ritmo.
              </b>
            </div>
          </div>
        </div>
      </section>
      <div className="benefit-strip">
        <div className="container">
          <span>PARA QUEM VENDE POR CONVERSA</span>
          <b>Moda & acessórios</b>
          <b>Presentes</b>
          <b>Beleza</b>
          <b>Artesanato</b>
          <b>Negócios locais</b>
        </div>
      </div>
      <section id="como-funciona" className="container marketing-section">
        <div className="section-heading">
          <span className="eyebrow">SEM COMPLICAÇÃO</span>
          <h2>Da ideia à sua próxima conversa.</h2>
          <p>
            Você cuida do negócio. O ClickZap organiza o caminho até o pedido.
          </p>
        </div>
        <div className="feature-grid">
          {[
            [
              "01",
              "Monte sua vitrine",
              "Cadastre produtos, fotos e categorias. Escolha o estilo que combina com sua marca.",
            ],
            [
              "02",
              "Compartilhe seu link",
              "Coloque na bio, no status ou envie para seus clientes. Sua loja abre direto no navegador.",
            ],
            [
              "03",
              "Receba e converse",
              "O cliente monta o pedido. Você recebe os detalhes e acompanha cada oportunidade no painel.",
            ],
          ].map(([n, t, p]) => (
            <article className="feature-card" key={n}>
              <span className="step-number">{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="feature-section">
        <div className="container marketing-section">
          <div className="section-heading">
            <span className="eyebrow">TUDO NO LUGAR CERTO</span>
            <h2>
              Leve para vender.
              <br />
              Completo para organizar.
            </h2>
          </div>
          <div className="feature-grid six">
            {[
              [
                ShoppingBag,
                "Carrinho para WhatsApp",
                "Itens, quantidades, dados e frete em uma mensagem organizada.",
              ],
              [
                Layers,
                "Pedidos em Kanban",
                "Novo, em conversa e concluído. Visualize o que precisa de atenção.",
              ],
              [
                Palette,
                "A sua marca",
                "Personalize cores, formatos, fotos e a apresentação da loja.",
              ],
              [
                Truck,
                "Entrega sem mistério",
                "Retirada, frete único ou valores por bairro. Você decide.",
              ],
              [
                BarChart3,
                "Resultado comercial",
                "Saiba quais pedidos se tornaram vendas e quais não avançaram.",
              ],
              [
                MessageCircle,
                "Conversa humana",
                "Continue atendendo pelo WhatsApp que você já usa.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof ShoppingBag;
              return (
                <article className="feature-card" key={String(title)}>
                  <I size={23} />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="container marketing-section" id="planos">
        <div className="section-heading">
          <span className="eyebrow">COMECE PELO SIMPLES</span>
          <h2>Uma loja. Muitas possibilidades.</h2>
        </div>
        <div className="plans">
          <article className="panel padded">
            <span className="badge green">DISPONÍVEL AGORA</span>
            <h3>Start</h3>
            <strong className="price">Grátis</strong>
            <p>O essencial para começar a vender por conversa.</p>
            <ul>
              <li>1 loja e até 10 produtos</li>
              <li>Fotos, categorias e personalização</li>
              <li>Carrinho com entrega e retirada</li>
              <li>Pedidos e Kanban</li>
              <li>Marca ClickZap na loja</li>
            </ul>
            <Link className="btn primary full" href="/cadastro">
              Criar minha loja <ArrowRight size={15} />
            </Link>
          </article>
          <article className="panel padded">
            <span className="badge">EM BREVE</span>
            <h3>Pro</h3>
            <strong className="price">
              R$ 54,90<small>/mês</small>
            </strong>
            <p>Pro por R$ 54,90 ao mês.</p>
            <ul>
              <li>Produtos ilimitados</li>
              <li>Personalização completa</li>
              <li>Central de pedidos e indicadores comerciais</li>
              <li>Frete por bairro</li>
              <li>Remoção da marca ClickZap</li>
            </ul>
            <p className="notice">
              Plano em planejamento. Nenhuma assinatura ou cobrança está ativa.
            </p>
          </article>
        </div>
      </section>
      <section className="container marketing-section faq">
        <div className="section-heading">
          <span className="eyebrow">AINDA TEM DÚVIDAS?</span>
          <h2>Vamos simplificar.</h2>
        </div>
        {faq.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <Plus size={17} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <section className="cta-section">
        <div className="container">
          <h2>
            Seu próximo pedido
            <br />
            pode começar por aqui.
          </h2>
          <Link href="/cadastro" className="btn primary">
            Começar gratuitamente <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <footer className="marketing-footer container">
        <Brand />
        <p>Seu catálogo. Seu carrinho. Seu WhatsApp.</p>
        <div>
          <Link href="/catalogo-whatsapp">Catálogo</Link>
          <Link href="/pedidos-whatsapp">Pedidos</Link>
          <Link href="/precos">Planos</Link>
        </div>
        <small>© {new Date().getFullYear()} ClickZap</small>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map(([q, a]) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }),
        }}
      />
    </div>
  );
}
