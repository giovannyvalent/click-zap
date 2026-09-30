// Build-time conversion of the approved static reference. No HTML parser runs in production.
import fs from 'node:fs';
import postcss from 'postcss';
const input=fs.readFileSync(new URL('../references/ClickZap_Landing_Premium_V5_2_WORK.html',import.meta.url),'utf8');
const css=input.match(/<style>([\s\S]*?)<\/style>/i)[1];
const root=postcss.parse(css);
root.walkRules(rule=>{if(rule.parent?.type==='atrule'&&/keyframes$/.test(rule.parent.name))return;rule.selectors=rule.selectors.map(s=>{if(s===':root'||s==='html'||s==='body')return '.premium-landing';return '.premium-landing '+s})});
fs.writeFileSync(new URL('../src/components/premium-landing.css',import.meta.url),root.toString()+'\n.premium-landing .faq { max-width: none; width: auto; margin: 0; }\n');
let body=input.match(/<body>([\s\S]*?)<\/body>/i)[1].replace(/<script>[\s\S]*?<\/script>/gi,'');
body=body.replace('href="#" class="brand"','href="/" class="brand"');
body=body.replace('href="#" class="btn btn-outline" style="width:100%">Começar grátis','href="/cadastro" class="btn btn-outline" style="width:100%">Começar grátis');
body=body.replace('href="#" class="btn btn-primary" style="width:100%">Quero o ClickZap Pro','href="/app/planos" class="btn btn-primary" style="width:100%">Quero o ClickZap Pro');
body=body.replace('href="#" class="btn btn-primary">Criar meu ClickZap','href="/cadastro" class="btn btn-primary">Criar meu ClickZap');
body=body.replace('Quero o ClickZap Pro</a>','Quero o ClickZap Pro</a><p class="billing-notice" style="font-size:12px;margin:12px 0 0">Contratação online em breve. Nenhuma cobrança está ativa.</p>');
fs.writeFileSync(new URL('../src/components/premium-landing.tsx',import.meta.url),`import './premium-landing.css';\nimport {LandingInteractions} from './landing-interactions';\n// Trusted, versioned project asset. Never interpolate user input here.\nconst html = ${JSON.stringify(body)};\nexport function PremiumLanding(){return <><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"/><div className="premium-landing" dangerouslySetInnerHTML={{__html:html}}/><LandingInteractions/></>}\n`);
