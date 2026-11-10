import "./assinar-landing.css";
import { LandingInteractions } from "./landing-interactions";
// Trusted, versioned project asset. Never interpolate user input here.
const waIcon =
  '<svg class="wa-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 017.021 2.91 9.825 9.825 0 012.9 7.028c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.69 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
const check =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const chevron =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
const iconGrid =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>';
const iconKanban =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/></svg>';
const iconPalette =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2a10 10 0 1 0 0 20c.6 0 1-.4 1-1 0-.3-.1-.5-.3-.7-.2-.2-.3-.5-.3-.7 0-.6.4-1 1-1h1.2c2.8 0 5.1-2.3 5.1-5.1C19.7 6 16.3 2 12 2z"/></svg>';
const iconSeedling =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7"/><path d="M9 9a3 3 0 0 0 3 3 3 3 0 0 0-3-3Z"/><path d="M12 12a3 3 0 0 1 3-3h1a4 4 0 0 1-4 4Z"/><path d="M9 9H8a4 4 0 0 1-4-4V4h1a4 4 0 0 1 4 4Z"/></svg>';
const iconTrend =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
const iconRocket =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>';
const iconShield =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>';
const iconRepeat =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
const iconStar =
  '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 9 22 9.5 16.5 14 18 21 12 17.3 6 21 7.5 14 2 9.5 9 9"/></svg>';
const iconTag =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 13 21l-9-9V4h8l9 9.41Z"/><circle cx="7.5" cy="7.5" r="1"/></svg>';
const iconClock =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const iconUser =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
const iconLink =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const iconCloud =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h.79a4.5 4.5 0 1 1 0 9Z"/></svg>';
const iconInstagram =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>';
const iconSearch =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

const html = `

<div class="anav-wrap">
  <div class="acontainer">
    <header class="anav">
      <a href="/" class="abrand">
        <span class="abrand-mark" aria-label="CZ">C<span class="z">Z</span></span>
        <span class="abrand-text">ClickZap</span>
      </a>
      <nav class="anav-links">
        <a href="#como-funciona">Como funciona</a>
        <a href="#recursos">Recursos</a>
        <a href="#planos">Planos</a>
        <a href="#faq">Dúvidas</a>
      </nav>
      <div class="anav-actions">
        <a class="anav-login" href="/entrar">Entrar</a>
        <a class="abtn abtn-primary" href="/cadastro">Criar minha conta</a>
      </div>
    </header>
  </div>
</div>

<main>

<section class="ahero-section">
  <div class="acontainer">
    <div class="ahero-panel">
      <span class="ablob ablob-mint" style="width:340px;height:340px;top:-100px;right:-60px"></span>
      <span class="ablob ablob-mint" style="width:220px;height:220px;bottom:-60px;left:30%"></span>
      <div class="ahero-grid">
        <div class="ahero">
          <span class="atrust">${iconStar}${iconStar}${iconStar}${iconStar}${iconStar}&nbsp;Feito para quem vende pelo WhatsApp</span>
          <h1>Crie seu catálogo online e venda mais pelo WhatsApp</h1>
          <p class="ahero-copy">O ClickZap organiza seu catálogo, o carrinho e o pedido — e leva tudo pronto para a conversa continuar no seu WhatsApp, sem precisar montar um e-commerce completo.</p>
          <div class="ahero-actions">
            <a href="/cadastro" class="abtn abtn-primary abtn-glow">Começar grátis agora</a>
            <a href="#planos" class="abtn abtn-outline">Ver planos</a>
          </div>
          <div class="ahero-note">${check} Grátis para sempre no Start · Sem cartão de crédito</div>
        </div>
        <div class="ahero-visual">
          <div class="ahero-browser">
            <div class="ahero-browser-top"><i></i><i></i><i></i></div>
            <div style="padding:16px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <b style="font-size:12px">Minha Loja</b>
                <span style="background:#111;color:#fff;font-size:9px;font-weight:700;padding:7px 9px;border-radius:8px">Sacola · 2</span>
              </div>
              <div style="margin-top:12px;background:#111;border-radius:14px;padding:16px;color:#fff">
                <small style="font-size:9px;font-weight:700;color:#9ae8c3">COLEÇÃO NOVA</small>
                <div style="font-size:18px;font-weight:800;margin-top:4px;letter-spacing:-0.03em">Escolha.<br>Peça no WhatsApp.</div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
                <div style="border:1px solid #eef1ec;border-radius:12px;padding:8px">
                  <div style="height:70px;border-radius:9px;background:linear-gradient(135deg,#dcebe1,#f3f5f2)"></div>
                  <b style="display:block;font-size:10px;margin-top:8px">Kit Essencial</b>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><strong style="font-size:11px">R$ 89</strong><span style="background:#0f4d33;color:#fff;font-size:8px;padding:5px 7px;border-radius:7px">Adicionar</span></div>
                </div>
                <div style="border:1px solid #eef1ec;border-radius:12px;padding:8px">
                  <div style="height:70px;border-radius:9px;background:linear-gradient(135deg,#eef1ee,#dde3dd)"></div>
                  <b style="display:block;font-size:10px;margin-top:8px">Bolsa Minimal</b>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><strong style="font-size:11px">R$ 129</strong><span style="background:#0f4d33;color:#fff;font-size:8px;padding:5px 7px;border-radius:7px">Adicionar</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="ahero-phone">
            <div class="ahero-phone-screen">
              <div style="text-align:center;font-size:9px;color:#8a938c;font-weight:700">Seu pedido</div>
              <div style="text-align:center;font-size:24px;font-weight:800;margin:6px 0 10px;letter-spacing:-0.03em">R$ 218</div>
              <div style="background:#f3f5f2;border-radius:10px;padding:9px;font-size:9px;font-weight:700;display:flex;justify-content:space-between;margin-top:6px"><span>1x Kit Essencial</span><b>R$ 89</b></div>
              <div style="background:#f3f5f2;border-radius:10px;padding:9px;font-size:9px;font-weight:700;display:flex;justify-content:space-between;margin-top:6px"><span>1x Bolsa Minimal</span><b>R$ 129</b></div>
              <div style="background:#0f4d33;color:#fff;border-radius:10px;padding:11px;text-align:center;font-size:9px;font-weight:700;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px">${waIcon} Enviar no WhatsApp</div>
            </div>
          </div>
          <div class="achips">
            <span class="achip">${check} Sem taxas sobre as vendas</span>
            <span class="achip">${check} Fácil de montar sozinho</span>
            <span class="achip">${check} Funciona direto no WhatsApp</span>
            <span class="achip">${check} Sem precisar de app</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="achannels-section">
  <div class="acontainer">
    <div class="achannels-row">
      <span class="achannel">${waIcon} WhatsApp</span>
      <span class="achannel">${iconInstagram} Instagram</span>
      <span class="achannel">${iconSearch} Google</span>
      <span class="achannel">${iconLink} Linktree / bio</span>
      <span class="achannel">${iconUser} Indicação</span>
    </div>
  </div>
</section>

<section class="asteps-section" id="como-funciona">
  <div class="acontainer acenter">
    <span class="akicker" data-reveal>Como funciona</span>
    <h2 class="atitle" data-reveal>Comece a vender em <span class="accent">3 passos simples</span></h2>
    <p class="acopy" data-reveal>Sem equipe técnica, sem integração complicada. Publique, compartilhe o link e receba o pedido já organizado.</p>
    <div class="asteps-row" data-reveal-stagger>
      <div class="astep">
        <span class="astep-num">1</span>
        <div class="astep-icon">${iconGrid}</div>
        <h3>Monte seu catálogo</h3>
        <p>Cadastre seus produtos com fotos, preços e variações em poucos minutos.</p>
      </div>
      <div class="astep-line"></div>
      <div class="astep">
        <span class="astep-num">2</span>
        <div class="astep-icon">${iconLink}</div>
        <h3>Compartilhe o link</h3>
        <p>Divulgue o link da sua loja no WhatsApp, Instagram ou onde seus clientes já estão.</p>
      </div>
      <div class="astep-line"></div>
      <div class="astep">
        <span class="astep-num">3</span>
        <div class="astep-icon">${waIcon}</div>
        <h3>Receba o pedido pronto</h3>
        <p>O cliente monta o carrinho sozinho e o pedido chega organizado direto no seu WhatsApp.</p>
      </div>
    </div>
    <div class="acenter-cta"><a href="/cadastro" class="abtn abtn-primary abtn-glow">Começar grátis agora</a></div>
  </div>
</section>

<section class="afeatures-section">
  <div class="acontainer acenter">
    <span class="akicker" data-reveal>Tudo incluso, em qualquer plano</span>
    <h2 class="atitle" data-reveal>O que você ganha <span class="accent">desde o primeiro dia</span></h2>
    <div class="acards-row" data-reveal-stagger>
      <article class="acard-sm">${iconClock}<p>Venda com seu catálogo disponível a qualquer hora, todo dia.</p></article>
      <article class="acard-sm">${iconUser}<p>Autonomia para o cliente montar o pedido sozinho, sem precisar te chamar antes.</p></article>
      <article class="acard-sm">${iconLink}<p>Divulgue o link do seu catálogo onde e como quiser.</p></article>
      <article class="acard-sm">${iconCloud}<p>Plataforma segura, com seus dados guardados na nuvem.</p></article>
      <article class="acard-sm">${iconPalette}<p>Personalize com a cor, o tema e a fonte da sua marca.</p></article>
    </div>
  </div>
</section>

<section class="acompare-section">
  <div class="acontainer acenter">
    <span class="akicker" data-reveal>Antes e depois</span>
    <h2 class="atitle" data-reveal>Pare de perder pedido no <span class="accent">meio da conversa</span></h2>
  </div>
  <div class="acontainer acompare-grid" data-reveal-stagger>
    <div class="acompare-col acompare-bad">
      <b>Sem o ClickZap</b>
      <ul>
        <li>Cliente manda foto por foto perguntando preço</li>
        <li>Você perde o fio de vários pedidos ao mesmo tempo</li>
        <li>Soma o pedido na mão e às vezes erra o valor</li>
        <li>Catálogo em PDF ou álbum, difícil de manter atualizado</li>
      </ul>
    </div>
    <div class="acompare-col acompare-good">
      <b>Com o ClickZap</b>
      <ul>
        <li>${check} Cliente monta o carrinho sozinho na sua loja</li>
        <li>${check} Pedido chega pronto, com itens e total já calculados</li>
        <li>${check} Central de pedidos organiza tudo em um só lugar</li>
        <li>${check} Catálogo online, você atualiza em segundos</li>
      </ul>
    </div>
  </div>
</section>

<section class="amint-section" id="recursos">
  <div class="acenter">
    <h2 class="atitle" data-reveal>Uma solução completa para você vender <span class="accent">pelo WhatsApp</span></h2>
  </div>

  <div class="aalt-panel" data-reveal>
    <span class="aicon-badge">${iconKanban}</span>
    <div class="aalt-grid">
      <div class="aalt-text">
        <h3>Catálogo + carrinho pra WhatsApp</h3>
        <p>Seu cliente escolhe os produtos, monta o carrinho e vê subtotal, entrega e total antes de falar com você. O pedido chega pronto para a conversa continuar.</p>
      </div>
      <div class="aalt-media">
        <div style="width:100%;max-width:280px;background:#fff;border-radius:16px;padding:14px;box-shadow:0 20px 40px rgba(10,30,20,.12)">
          <div style="background:#111;border-radius:10px;padding:10px;color:#fff;font-size:9px;font-weight:700">Subtotal <b style="float:right">R$ 218</b></div>
          <div style="margin-top:8px;font-size:9px;font-weight:700;display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eef1ec"><span>1x Kit Essencial</span><b>R$ 89</b></div>
          <div style="font-size:9px;font-weight:700;display:flex;justify-content:space-between;padding:6px 0"><span>1x Bolsa Minimal</span><b>R$ 129</b></div>
          <div style="margin-top:8px;background:#0f4d33;color:#fff;text-align:center;border-radius:9px;padding:9px;font-size:9px;font-weight:700">${waIcon} Enviar pedido</div>
        </div>
      </div>
    </div>
  </div>

  <div class="aalt-panel" data-reveal>
    <span class="aicon-badge">${iconGrid}</span>
    <div class="aalt-grid reverse">
      <div class="aalt-media">
        <div style="width:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          <div style="background:#fff;border-radius:12px;padding:8px;box-shadow:0 10px 24px rgba(10,30,20,.08)"><small style="font-size:7px;font-weight:800;color:#8a938c;text-transform:uppercase">Novo</small><div style="margin-top:6px;background:#f3f5f2;border-radius:8px;padding:7px;font-size:8px;font-weight:700">#1048 · Bianca<br><span style="color:#677069;font-weight:600">R$ 218</span></div></div>
          <div style="background:#fff;border-radius:12px;padding:8px;box-shadow:0 10px 24px rgba(10,30,20,.08)"><small style="font-size:7px;font-weight:800;color:#8a938c;text-transform:uppercase">Em conversa</small><div style="margin-top:6px;background:#f3f5f2;border-radius:8px;padding:7px;font-size:8px;font-weight:700">#1047 · Marcos<br><span style="color:#677069;font-weight:600">R$ 129</span></div></div>
          <div style="background:#fff;border-radius:12px;padding:8px;box-shadow:0 10px 24px rgba(10,30,20,.08)"><small style="font-size:7px;font-weight:800;color:#8a938c;text-transform:uppercase">Concluído</small><div style="margin-top:6px;background:#dcebe1;border-radius:8px;padding:7px;font-size:8px;font-weight:700">#1045 · Vendido<br><span style="color:#677069;font-weight:600">R$ 180</span></div></div>
        </div>
      </div>
      <div class="aalt-text">
        <h3>Central de pedidos em formato Kanban</h3>
        <p>Acompanhe novos pedidos, conversas em andamento e concluídos. Avance, volte e marque se a negociação virou venda.</p>
      </div>
    </div>
  </div>
</section>

<section class="aaudience-section">
  <div class="acontainer">
    <div class="aaudience-panel" data-reveal>
      <span class="ablob ablob-dark" style="width:300px;height:300px;top:-80px;right:10%"></span>
      <div class="aaudience-grid">
        <div>
          <span class="akicker" style="color:#9ae8c3">Um plano para cada momento</span>
          <h2>Para quem está começando. Para quem já escalou.</h2>
          <p>A loja pública, o carrinho e a central de pedidos valem para todos os planos. O que muda é quantos produtos você pode publicar.</p>
          <div style="margin-top:22px"><a href="#planos" class="abtn abtn-white">Escolher meu plano</a></div>
        </div>
        <div class="aaudience-cards">
          <article class="aaudience-card">${iconSeedling}<b>Para validar sua ideia</b><p>Plano Start, grátis. Até 10 produtos pra colocar sua loja no ar sem gastar nada.</p></article>
          <article class="aaudience-card">${iconTrend}<b>Para o catálogo crescer</b><p>Plano Plus, R$ 29,90/mês. Até 100 produtos pra quem já tem clientes.</p></article>
          <article class="aaudience-card">${iconRocket}<b>Para operar em escala</b><p>Plano Pro, R$ 59,90/mês. Até 1000 produtos pra operações maiores.</p></article>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="apricing-section" id="planos">
  <div class="acontainer acenter">
    <span class="akicker" data-reveal>Comece simples, suba quando precisar</span>
    <h2 class="atitle" data-reveal>Selecione um plano e <span class="accent">comece a vender hoje mesmo</span></h2>
    <p class="acopy" data-reveal>Todos sem taxa sobre suas vendas. A loja, o carrinho e a central de pedidos são os mesmos em qualquer plano.</p>

    <div class="aplans-grid" data-reveal-stagger>
      <article class="aplan">
        <div class="aplan-top">
          <div class="aplan-name-row"><span class="aplan-name">Start</span></div>
          <p class="aplan-desc">Para colocar sua primeira vitrine no ar.</p>
          <div class="aplan-price">Grátis</div>
          <span class="aplan-limit">${iconGrid} Até 10 produtos</span>
          <a href="/cadastro" class="abtn abtn-outline">Começar grátis</a>
        </div>
        <div class="aplan-feats">
          <b>Recursos inclusos:</b>
          <ul>
            <li>${check} Loja pública sem login</li>
            <li>${check} Carrinho com pedido pro WhatsApp</li>
            <li>${check} Central de pedidos (Kanban)</li>
            <li>${check} Entrega por bairro ou retirada</li>
          </ul>
        </div>
      </article>

      <article class="aplan featured">
        <div class="aplan-top">
          <div class="aplan-name-row"><span class="aplan-name">Plus</span><span class="atag">Recomendado</span></div>
          <p class="aplan-desc">Para quem já tem clientes e precisa de mais espaço.</p>
          <div class="aplan-price">R$ 29,90 <small>/ mês</small></div>
          <span class="aplan-limit">${iconGrid} Até 100 produtos</span>
          <a href="/app/planos" class="abtn abtn-primary abtn-glow">Assinar o Plus</a>
        </div>
        <div class="aplan-feats">
          <b>Tudo do Start, mais:</b>
          <ul>
            <li>${check} Catálogo bem maior</li>
            <li>${check} Tema e fonte da loja personalizáveis</li>
            <li>${check} Cancele quando quiser</li>
          </ul>
        </div>
      </article>

      <article class="aplan">
        <div class="aplan-top">
          <div class="aplan-name-row"><span class="aplan-name">Pro</span></div>
          <p class="aplan-desc">Para operações com catálogo grande.</p>
          <div class="aplan-price">R$ 59,90 <small>/ mês</small></div>
          <span class="aplan-limit">${iconGrid} Até 1000 produtos</span>
          <a href="/app/planos" class="abtn abtn-outline">Assinar o Pro</a>
        </div>
        <div class="aplan-feats">
          <b>Tudo do Plus, mais:</b>
          <ul>
            <li>${check} Espaço para catálogos extensos</li>
            <li>${check} Pensado para operações em escala</li>
            <li>${check} Cancele quando quiser</li>
          </ul>
        </div>
      </article>
    </div>

    <div class="aguarantee-row">
      <div class="aguarantee-item">${iconShield}<div><b>Comece de graça, sem cartão</b><span>O plano Start é gratuito de verdade, sem teste nem cobrança escondida.</span></div></div>
      <div class="aguarantee-item">${iconRepeat}<div><b>Mude quando quiser</b><span>Suba ou desça de plano direto no painel, em Minha Loja.</span></div></div>
    </div>
  </div>
</section>

<section class="afaq-section" id="faq">
  <div class="acontainer afaq-grid">
    <div data-reveal>
      <span class="akicker">Perguntas frequentes</span>
      <h2 class="atitle">Tire todas as suas dúvidas</h2>
      <p class="acopy">O ClickZap foi pensado para ser mais simples que um e-commerce e mais organizado que vender apenas pela conversa.</p>
    </div>
    <div class="afaq-list" data-reveal>
      <article class="faq-item open"><button class="faq-q">O ClickZap substitui meu WhatsApp? ${chevron}</button><div class="faq-a">Não. O ClickZap prepara o pedido antes da conversa e abre o WhatsApp com as informações organizadas. O atendimento continua no canal que você já utiliza.</div></article>
      <article class="faq-item"><button class="faq-q">Meu cliente precisa criar uma conta? ${chevron}</button><div class="faq-a">Não. A loja pública foi pensada para o comprador navegar, montar o carrinho e iniciar o pedido sem login.</div></article>
      <article class="faq-item"><button class="faq-q">Posso trocar de plano depois? ${chevron}</button><div class="faq-a">Sim. Você pode fazer upgrade ou downgrade a qualquer momento direto no painel, em Minha Loja.</div></article>
      <article class="faq-item"><button class="faq-q">Consigo cobrar frete diferente por bairro? ${chevron}</button><div class="faq-a">Sim. Você pode trabalhar com retirada, taxa global de entrega ou cadastrar bairros e valores diferentes.</div></article>
      <article class="faq-item"><button class="faq-q">O ClickZap controla estoque? ${chevron}</button><div class="faq-a">Na versão inicial, não. O foco é catálogo, pedido, WhatsApp e organização comercial.</div></article>
      <article class="faq-item"><button class="faq-q">O pedido fica salvo mesmo indo para o WhatsApp? ${chevron}</button><div class="faq-a">Sim. O pedido é criado no ClickZap antes de abrir o WhatsApp. Isso permite acompanhar o funil e os resultados da operação.</div></article>
    </div>
  </div>
</section>

<section class="afinal-section">
  <div class="acontainer">
    <div class="afinal-panel" data-reveal>
      <span class="ablob ablob-mint" style="width:260px;height:260px;top:-80px;right:10%"></span>
      <div>
        <span class="akicker">Seu próximo pedido pode chegar melhor</span>
        <h2 class="atitle">Comece a vender pelo <span class="accent">WhatsApp</span> hoje mesmo.</h2>
        <div class="afinal-note">${check} Grátis para sempre no Start · Sem cartão de crédito · Cancele quando quiser</div>
      </div>
      <div class="afinal-actions">
        <a href="/cadastro" class="abtn abtn-primary abtn-glow">Criar minha conta grátis</a>
        <a href="#planos" class="abtn abtn-outline">Ver planos</a>
      </div>
    </div>
  </div>
</section>

</main>

<footer class="afooter">
  <div class="acontainer">
    <div class="afooter-grid">
      <div class="afooter-col">
        <b>ClickZap</b>
        <a href="#como-funciona">Como funciona</a>
        <a href="#recursos">Recursos</a>
      </div>
      <div class="afooter-col">
        <b>Conta</b>
        <a href="/cadastro">Criar uma conta</a>
        <a href="/entrar">Já sou cliente</a>
      </div>
      <div class="afooter-brand">
        <span class="abrand-mark" aria-label="CZ">C<span class="z">Z</span></span>
        <b>ClickZap</b>
      </div>
      <div class="afooter-col">
        <b>Comercial</b>
        <a href="#planos">Planos</a>
        <a href="#faq">Dúvidas</a>
      </div>
    </div>
    <div class="afooter-bottom">© ClickZap · Todos os direitos reservados</div>
  </div>
</footer>

<div class="asticky-cta">
  <span>Grátis para sempre no Start<br>Sem cartão de crédito</span>
  <a href="/cadastro" class="abtn abtn-primary">Criar conta</a>
</div>

`;
export function AssinarLanding() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      />
      <noscript>
        <style>{`.assinar-landing [data-reveal],.assinar-landing [data-reveal-stagger] > *{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <div
        className="assinar-landing"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <LandingInteractions root=".assinar-landing" />
    </>
  );
}
