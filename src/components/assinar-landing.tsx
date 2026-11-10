import "./premium-landing.css";
import "./assinar-landing.css";
import { LandingInteractions } from "./landing-interactions";
// Trusted, versioned project asset. Never interpolate user input here.
const waIcon =
  '<svg class="wa-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 017.021 2.91 9.825 9.825 0 012.9 7.028c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.69 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
const html = `

<header class="nav">
  <div class="container nav-inner">
    <a href="/" class="brand">
      <span class="brand-box" aria-label="CZ"><span class="c">C</span><span class="z">Z</span></span>
      <span class="brand-word"><span class="click">Click</span><span class="zap">Zap</span></span>
    </a>
    <nav class="nav-links">
      <a href="#como-funciona">Como funciona</a>
      <a href="#recursos">Recursos</a>
      <a href="#planos">Planos</a>
      <a href="#faq">Dúvidas</a>
    </nav>
    <div class="nav-actions">
      <a class="nav-login" href="/entrar">Entrar</a>
      <a class="btn btn-outline" href="#como-funciona">Ver como funciona</a>
      <a class="btn btn-primary" href="/cadastro">Criar minha conta</a>
    </div>
  </div>
</header>

<main>

<section class="hero">
  <div class="container hero-grid">
    <div class="hero-intro">
      <span class="kicker">Loja para WhatsApp, sem complicação</span>
      <h1>Crie seu catálogo.<br>Venda mais pelo<br><span class="green">WhatsApp.</span></h1>
      <p class="hero-copy">O ClickZap organiza seu catálogo, o carrinho e o pedido — e leva tudo pronto para a conversa continuar no seu WhatsApp, sem precisar montar um e-commerce completo.</p>
      <div class="hero-actions">
        <a href="/cadastro" class="btn btn-primary">Começar grátis agora</a>
        <a href="#como-funciona" class="btn btn-outline">Ver como funciona</a>
      </div>
      <div class="hero-note"><i></i> Sem cartão de crédito no plano grátis. Loja pública sem login para o cliente.</div>
    </div>

    <div class="hero-visual" id="demo">
      <div class="hero-glow"></div>
      <div class="browser">
        <div class="browser-top">
          <i class="dot"></i><i class="dot"></i><i class="dot"></i>
          <div class="browser-url">clickzap.com.br/loja/minhaloja</div>
        </div>
        <div class="store-demo">
          <div class="demo-top">
            <div class="demo-logo"><span class="demo-logo-mark" aria-label="CZ"><span>C</span><span class="z">Z</span></span> Minha Loja</div>
            <div class="demo-cart">Sacola · 2</div>
          </div>
          <div class="demo-hero">
            <div><small>COLEÇÃO NOVA</small><h3>Escolha.<br><span>Peça pelo WhatsApp.</span></h3></div>
            <small>Entrega local</small>
          </div>
          <div class="demo-search">Buscar produtos...</div>
          <div class="demo-cats"><span>Todos</span><span>Mais vendidos</span><span>Presentes</span><span>Acessórios</span></div>
          <div class="demo-products">
            <article class="demo-product"><div class="demo-photo"><span class="emoji">🎁</span></div><b>Kit Essencial</b><small>Presente, pronta entrega</small><div class="demo-price"><strong>R$ 89</strong><span class="demo-add">Adicionar</span></div></article>
            <article class="demo-product"><div class="demo-photo"><span class="emoji">👜</span></div><b>Bolsa Minimal</b><small>Acessórios, lançamento</small><div class="demo-price"><strong>R$ 129</strong><span class="demo-add">Adicionar</span></div></article>
          </div>
        </div>
      </div>
      <div class="whatsapp-badge" aria-label="WhatsApp">${waIcon}</div>
      <div class="phone">
        <div class="phone-screen">
          <div class="phone-notch"></div>
          <div class="phone-title">Seu pedido</div>
          <div class="phone-total">R$ 218</div>
          <div class="order-line"><span>1x Kit Essencial</span><b>R$ 89</b></div>
          <div class="order-line"><span>1x Bolsa Minimal</span><b>R$ 129</b></div>
          <div class="order-line"><span>Retirada</span><b>R$ 0</b></div>
          <div class="phone-btn">${waIcon} Enviar pedido no WhatsApp</div>
        </div>
      </div>
      <div class="float-card">
        <small>Pedido recebido</small>
        <strong>#1048</strong>
        <span>● Novo pedido na central de pedidos</span>
      </div>
    </div>
  </div>
</section>

<section class="proof">
  <div class="container proof-grid">
    <div class="proof-item"><strong>1 link</strong><span>para divulgar seu catálogo no WhatsApp, Instagram, Google e onde quiser.</span></div>
    <div class="proof-item"><strong>3 passos</strong><span>o cliente escolhe, monta o carrinho e continua a conversa com você.</span></div>
    <div class="proof-item"><strong>0 login</strong><span>para o comprador navegar pela loja pública e iniciar o pedido.</span></div>
    <div class="proof-item"><strong>1 painel</strong><span>para acompanhar novos pedidos, conversas e vendas concluídas.</span></div>
  </div>
</section>

<section class="steps-section" id="como-funciona">
  <div class="container">
    <div class="steps-header">
      <span class="kicker">Com o ClickZap, vender por catálogo é rápido</span>
      <h2 class="section-title">Do cadastro do produto ao pedido pronto em 3 passos.</h2>
      <p class="section-copy">Sem equipe técnica, sem integração complicada. Publique, compartilhe o link e receba o pedido já organizado.</p>
    </div>
    <div class="steps-grid">
      <article class="step-card">
        <span class="step-badge">01</span>
        <span class="step-emoji emoji">🧩</span>
        <h3>Monte você mesmo</h3>
        <p>Cadastre nome, fotos, preço e categoria. Em poucos minutos sua vitrine está no ar, sem precisar de desenvolvedor.</p>
      </article>
      <article class="step-card">
        <span class="step-badge">02</span>
        <span class="step-emoji emoji">📈</span>
        <h3>Cresça quando precisar</h3>
        <p>Comece de graça no Start. Suba para o Plus ou o Pro só quando o catálogo pedir mais espaço.</p>
      </article>
      <article class="step-card">
        <span class="step-badge">03</span>
        <span class="step-emoji emoji">💬</span>
        <h3>Atendimento continua humano</h3>
        <p>O pedido chega pronto, mas a conversa e o fechamento continuam no seu WhatsApp, do seu jeito.</p>
      </article>
    </div>
  </div>
</section>

<section class="light">
  <div class="container">
    <span class="kicker">Funciona em qualquer canal que você já usa</span>
    <h2 class="section-title">Um link. Vários lugares para divulgar.</h2>
    <p class="section-copy">Coloque o link da sua loja na bio, nos stories, em anúncios ou mande direto para o cliente. O catálogo abre igual em qualquer um deles.</p>
    <div class="channels-row">
      <span class="channel-chip">${waIcon} WhatsApp</span>
      <span class="channel-chip">📷 Instagram</span>
      <span class="channel-chip">🔍 Google</span>
      <span class="channel-chip">🔗 Linktree / bio</span>
      <span class="channel-chip">💬 Status e grupos</span>
    </div>
  </div>
</section>

<section class="bento-section" id="recursos">
  <div class="container">
    <span class="kicker">Produto completo sem ficar pesado</span>
    <h2 class="section-title">Tudo que você precisa para vender por conversa.</h2>
    <p class="section-copy">A loja é simples para o cliente. Nos bastidores, você ganha organização para operar os pedidos e cuidar da marca.</p>
    <div class="bento">
      <div class="bento-col">
        <article class="feature feature-big">
          <span class="pill pill-soft">Central de pedidos</span>
          <h3 style="margin-top:14px">Um funil para saber exatamente onde cada pedido está.</h3>
          <p>Novos pedidos, conversas em andamento e concluídos. Avance, volte e marque se a negociação virou venda.</p>
          <div class="central-grid">
            <div class="central-box"><div class="central-title">Novo</div><div class="central-item green-card"><b>#1048 · Bianca</b><span>2 itens, R$ 218</span></div><div class="central-item"><b>#1047 · Marcos</b><span>1 item, R$ 129</span></div></div>
            <div class="central-box"><div class="central-title">Em conversa</div><div class="central-item"><b>#1046 · Ana</b><span>3 itens, R$ 327</span></div></div>
            <div class="central-box"><div class="central-title">Concluído</div><div class="central-item"><b>#1045 · Lucas</b><span>Vendido, R$ 180</span></div></div>
          </div>
        </article>
        <article class="feature green feature-half">
          <span class="pill" style="background:rgba(0,0,0,.08)">WhatsApp</span>
          <h3 style="margin-top:14px">A conversa continua onde seu cliente já está.</h3>
          <p>O ClickZap organiza o pedido e leva o cliente até o WhatsApp no momento certo.</p>
        </article>
      </div>
      <div class="bento-col">
        <article class="feature feature-half">
          <span class="pill pill-soft">Minha Loja</span>
          <h3 style="margin-top:14px">Seu catálogo com a cara do seu negócio.</h3>
          <p>Logo, cor, tema, fonte, estilo dos cards, formato das fotos, botões e faixa promocional.</p>
          <div class="customizer"><div class="custom-options"><span></span><span></span><span></span><span></span></div><div class="custom-preview"><div class="preview-hero"></div><div class="preview-products"><i></i><i></i></div></div></div>
        </article>
        <article class="feature dark feature-half">
          <span class="pill pill-green">Entrega</span>
          <h3 style="margin-top:14px">Frete simples ou valor por bairro.</h3>
          <p>Configure retirada, taxa única de entrega ou bairros com preços diferentes. O valor entra automaticamente no pedido.</p>
          <div class="delivery-list"><div class="delivery-row"><span>Centro</span><b>R$ 8</b></div><div class="delivery-row"><span>Marco</span><b>R$ 15</b></div></div>
        </article>
        <article class="feature dark feature-half">
          <span class="pill pill-green">Visão comercial</span>
          <h3 style="margin-top:14px">Dados que nascem dos pedidos reais.</h3>
          <p>Ao registrar o pedido antes do WhatsApp, o ClickZap mostra volume, valor e comportamento da operação.</p>
          <div class="metrics"><div class="metric"><strong>24</strong><small>pedidos</small></div><div class="metric"><strong>68%</strong><small>vendidos</small></div></div>
        </article>
      </div>
    </div>
  </div>
</section>

<section class="usecases">
  <div class="container">
    <span class="kicker">Um plano para cada momento do seu negócio</span>
    <h2 class="section-title">Para quem está começando. Para quem já escalou.</h2>
    <p class="section-copy">A loja é a mesma loja completa em qualquer plano. O que muda é quantos produtos você pode publicar.</p>
    <div class="case-grid" style="grid-template-columns:repeat(3,1fr)">
      <article class="case"><span class="emoji">🌱</span><h3>Para validar sua ideia</h3><p>Plano Start, grátis. Publique até 10 produtos e comece a vender sem gastar nada.</p></article>
      <article class="case"><span class="emoji">📦</span><h3>Para o catálogo crescer</h3><p>Plano Plus, R$ 29,90/mês. Até 100 produtos para quem já tem uma base de clientes.</p></article>
      <article class="case"><span class="emoji">🚀</span><h3>Para operar em escala</h3><p>Plano Pro, R$ 59,90/mês. Até 1000 produtos para operações maiores.</p></article>
    </div>
  </div>
</section>

<section class="pricing" id="planos">
  <div class="container">
    <span class="kicker">Comece simples, suba quando precisar</span>
    <h2 class="section-title">Um plano para cada momento do seu negócio.</h2>
    <p class="section-copy">A loja pública, o carrinho, a central de pedidos e a personalização da marca valem para todos os planos. O que muda é o limite de produtos.</p>

    <div class="pricing-grid plan3-grid">
      <article class="plan">
        <span class="pill pill-soft">Start</span>
        <div class="price">Grátis</div>
        <p>Para colocar sua primeira vitrine no ar.</p>
        <div class="limit">Até 10 produtos</div>
        <ul>
          <li>Loja pública sem login</li>
          <li>Carrinho com pedido pro WhatsApp</li>
          <li>Central de pedidos (Kanban)</li>
          <li>Entrega por bairro ou retirada</li>
        </ul>
        <a href="/cadastro" class="btn btn-outline" style="width:100%">Começar grátis</a>
      </article>

      <article class="plan pro">
        <span class="recommended">Recomendado</span>
        <span class="pill pill-soft">Plus</span>
        <div class="price">R$ 29,90 <small>/ mês</small></div>
        <p>Para quem já tem clientes e precisa de mais espaço.</p>
        <div class="limit">Até 100 produtos</div>
        <ul>
          <li>Tudo do Start, mais:</li>
          <li>Catálogo bem maior</li>
          <li>Tema e fonte da loja personalizáveis</li>
          <li>Cancele quando quiser</li>
        </ul>
        <a href="/app/planos" class="btn btn-primary" style="width:100%">Assinar o Plus</a>
      </article>

      <article class="plan">
        <span class="pill pill-soft">Pro</span>
        <div class="price">R$ 59,90 <small>/ mês</small></div>
        <p>Para operações com catálogo grande.</p>
        <div class="limit">Até 1000 produtos</div>
        <ul>
          <li>Tudo do Plus, mais:</li>
          <li>Espaço para catálogos extensos</li>
          <li>Pensado para operações em escala</li>
          <li>Cancele quando quiser</li>
        </ul>
        <a href="/app/planos" class="btn btn-outline" style="width:100%">Assinar o Pro</a>
      </article>
    </div>
  </div>
</section>

<section class="guarantee">
  <div class="container guarantee-inner">
    <div class="guarantee-item">🆓<div><b>Comece de graça, sem cartão</b><span>O plano Start é gratuito de verdade, sem período de teste nem cobrança escondida.</span></div></div>
    <div class="guarantee-item">🔁<div><b>Mude quando quiser</b><span>Suba ou desça de plano direto no painel, em Minha Loja. Cancele quando quiser.</span></div></div>
  </div>
</section>

<section class="faq" id="faq">
  <div class="container faq-grid">
    <div>
      <span class="kicker">Perguntas frequentes</span>
      <h2 class="section-title">O essencial antes de começar.</h2>
      <p class="section-copy" style="color:#69716b">O ClickZap foi pensado para ser mais simples que um e-commerce e mais organizado que vender apenas pela conversa.</p>
    </div>
    <div class="faq-list">
      <article class="faq-item open"><button class="faq-q">O ClickZap substitui meu WhatsApp? <span>+</span></button><div class="faq-a">Não. O ClickZap prepara o pedido antes da conversa e abre o WhatsApp com as informações organizadas. O atendimento continua no canal que você já utiliza.</div></article>
      <article class="faq-item"><button class="faq-q">Meu cliente precisa criar uma conta? <span>+</span></button><div class="faq-a">Não. A loja pública foi pensada para o comprador navegar, montar o carrinho e iniciar o pedido sem login.</div></article>
      <article class="faq-item"><button class="faq-q">Posso trocar de plano depois? <span>+</span></button><div class="faq-a">Sim. Você pode fazer upgrade ou downgrade a qualquer momento direto no painel, em Minha Loja.</div></article>
      <article class="faq-item"><button class="faq-q">Consigo cobrar frete diferente por bairro? <span>+</span></button><div class="faq-a">Sim. Você pode trabalhar com retirada, taxa global de entrega ou cadastrar bairros e valores diferentes.</div></article>
      <article class="faq-item"><button class="faq-q">O ClickZap controla estoque? <span>+</span></button><div class="faq-a">Na versão inicial, não. O foco é catálogo, pedido, WhatsApp e organização comercial.</div></article>
      <article class="faq-item"><button class="faq-q">O pedido fica salvo mesmo indo para o WhatsApp? <span>+</span></button><div class="faq-a">Sim. O pedido é criado no ClickZap antes de abrir o WhatsApp. Isso permite acompanhar o funil e os resultados da operação.</div></article>
    </div>
  </div>
</section>

<section class="final-cta">
  <div class="container">
    <div class="final-box">
      <div class="final-inner">
        <div>
          <span class="kicker">Seu próximo pedido pode chegar melhor</span>
          <h2>Comece a vender pelo <span>WhatsApp</span> hoje mesmo.</h2>
        </div>
        <div class="final-actions">
          <a href="/cadastro" class="btn btn-primary">Criar minha conta grátis</a>
          <a href="#planos" class="btn btn-outline">Ver planos</a>
        </div>
      </div>
    </div>
  </div>
</section>

</main>

<footer class="footer">
  <div class="container footer-inner">
    <div class="brand">
      <span class="brand-box" aria-label="CZ"><span class="c">C</span><span class="z">Z</span></span>
      <span class="brand-word"><span class="click">Click</span><span class="zap">Zap</span></span>
    </div>
    <div class="footer-links"><a href="#como-funciona">Como funciona</a><a href="#recursos">Recursos</a><a href="#planos">Planos</a><a href="#faq">FAQ</a></div>
    <span class="small">© ClickZap</span>
  </div>
</footer>

`;
export function AssinarLanding() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      />
      <div
        className="premium-landing assinar-landing"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <LandingInteractions />
    </>
  );
}
