import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

const css = `
:root {
  --bg:      #030c05;
  --surface: #091409;
  --lift:    #102010;
  --border:  rgba(0,140,60,0.28);
  --text:    #e8f5eb;
  --muted:   #5d7d62;
  --hi:      #FFD600;
  --hi-dim:  #d4b400;
  --hi-text: #000;
  --hi-bg:   #141200;
  --green:   #00b341;
  --blue:    #002776;
  --r:       10px;
}
@media (prefers-color-scheme: light) {
  :root {
    --bg:#f3fbf4;--surface:#fff;--lift:#e8f5eb;--border:rgba(0,120,50,.22);
    --text:#040f06;--muted:#4a6a50;--hi:#009c3b;--hi-dim:#007a2f;--hi-text:#fff;
    --hi-bg:#f0fdf4;--green:#009c3b;--blue:#002776;
  }
}
:root[data-theme="dark"]  {
  --bg:#030c05;--surface:#091409;--lift:#102010;--border:rgba(0,140,60,.28);
  --text:#e8f5eb;--muted:#5d7d62;--hi:#FFD600;--hi-dim:#d4b400;--hi-text:#000;
  --hi-bg:#141200;--green:#00b341;--blue:#002776;
}
:root[data-theme="light"] {
  --bg:#f3fbf4;--surface:#fff;--lift:#e8f5eb;--border:rgba(0,120,50,.22);
  --text:#040f06;--muted:#4a6a50;--hi:#009c3b;--hi-dim:#007a2f;--hi-text:#fff;
  --hi-bg:#f0fdf4;--green:#009c3b;--blue:#002776;
}
.lp { background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,'Segoe UI',Helvetica,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;min-height:100vh; }
a { color:inherit;text-decoration:none; }

/* NAV */
.lp-nav {
  position:sticky;top:0;z-index:100;
  background:color-mix(in srgb,var(--bg) 82%,transparent);
  backdrop-filter:blur(14px);
  border-bottom:1px solid var(--border);
  padding:0 28px;height:60px;
  display:flex;align-items:center;justify-content:space-between;
}
.lp-logo { font-size:18px;font-weight:900;letter-spacing:-0.03em; }
.lp-logo-br { color:#4d8eff; }
.lp-logo-bo { color:var(--green); }
.lp-nav-actions { display:flex;align-items:center;gap:10px; }
.lp-btn-ghost { font-size:14px;font-weight:600;color:var(--muted);padding:7px 14px;border-radius:var(--r);transition:color .15s,background .15s; }
.lp-btn-ghost:hover { color:var(--text);background:var(--lift); }
.lp-btn-primary { font-size:14px;font-weight:700;color:var(--hi-text);background:var(--hi);padding:8px 18px;border-radius:var(--r);transition:background .15s; }
.lp-btn-primary:hover { background:var(--hi-dim); }

/* HERO */
.lp-hero { max-width:1080px;margin:0 auto;padding:88px 28px 96px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:72px;align-items:center; }
.lp-eyebrow { display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--hi);margin-bottom:22px; }
.lp-eyebrow::before { content:'';display:block;width:22px;height:2px;background:var(--hi);flex-shrink:0; }
.lp-h1 { font-size:clamp(46px,5.6vw,78px);font-weight:900;letter-spacing:-0.04em;line-height:1.02;text-wrap:balance;margin-bottom:22px; }
.lp-h1-em { color:#FFD600; }
.lp-sub { font-size:17px;color:var(--muted);line-height:1.65;max-width:420px;margin-bottom:36px; }
.lp-ctas { display:flex;align-items:center;gap:12px;flex-wrap:wrap; }
.lp-btn-lg { font-size:15px;font-weight:700;color:var(--hi-text);background:var(--hi);padding:13px 26px;border-radius:var(--r);transition:background .15s,transform .1s; }
.lp-btn-lg:hover { background:var(--hi-dim); }
.lp-btn-lg:active { transform:scale(.98); }
.lp-btn-outline { font-size:15px;font-weight:600;color:var(--text);border:1.5px solid var(--border);padding:12px 24px;border-radius:var(--r);transition:border-color .15s,background .15s; }
.lp-btn-outline:hover { border-color:var(--muted);background:var(--lift); }

/* MOCK CARD */
.lp-mock { background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 0 0 1px var(--border),0 28px 56px -8px rgba(0,0,0,.55);transform:rotate(1.8deg);transition:transform .35s ease;user-select:none; }
.lp-mock:hover { transform:rotate(0deg); }
.lp-mock-header { background:#003d1a;border-bottom:1px solid rgba(0,180,70,.25);padding:11px 16px;display:flex;align-items:center;justify-content:space-between; }
.lp-mock-league { font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#FFD600; }
.lp-mock-status { font-size:10px;font-weight:700;color:rgba(255,255,255,.45);letter-spacing:.06em; }
.lp-mock-match { padding:18px 16px;border-bottom:1px solid var(--border); }
.lp-mock-score-row { display:flex;align-items:center;justify-content:center;gap:14px; }
.lp-mock-team { font-size:14px;font-weight:700;flex:1;text-align:center; }
.lp-mock-score { font-size:38px;font-weight:900;letter-spacing:-0.04em;font-variant-numeric:tabular-nums;display:flex;align-items:center;gap:6px; }
.lp-mock-sep { color:var(--muted);font-weight:300;font-size:30px; }
.lp-mock-palpite { padding:11px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px; }
.lp-mp-label { font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted); }
.lp-mp-val { display:flex;align-items:center;gap:8px; }
.lp-mp-score { font-size:14px;font-weight:700;font-variant-numeric:tabular-nums; }
.lp-mp-badge { font-size:10px;font-weight:700;background:#141200;color:#FFD600;border:1px solid rgba(255,214,0,.35);padding:3px 8px;border-radius:20px;white-space:nowrap; }
.lp-mock-ranking { padding:13px 16px; }
.lp-rank-title { font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:9px; }
.lp-rrow { display:flex;align-items:center;gap:9px;padding:5px 7px;border-radius:7px;font-size:13px; }
.lp-rrow-me { background:rgba(255,214,0,.08);border:1px solid rgba(255,214,0,.22); }
.lp-rpos { font-size:12px;font-weight:700;color:var(--muted);width:22px;text-align:center; }
.lp-rpos-medal { font-size:14px; }
.lp-rname { flex:1;font-weight:600;color:var(--muted); }
.lp-rname-me { color:#FFD600; }
.lp-rpts { font-weight:900;font-variant-numeric:tabular-nums;font-size:14px;color:var(--text); }
.lp-rpts-u { font-size:10px;color:var(--muted);font-weight:400;margin-left:1px; }

/* SECTIONS */
.lp-section { max-width:1080px;margin:0 auto;padding:80px 28px; }
.lp-sec-eyebrow { display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--hi);margin-bottom:14px; }
.lp-sec-eyebrow::before { content:'';display:block;width:22px;height:2px;background:var(--hi);flex-shrink:0; }
.lp-sec-title { font-size:clamp(26px,3.2vw,42px);font-weight:900;letter-spacing:-0.03em;line-height:1.1;text-wrap:balance;margin-bottom:44px;max-width:500px; }

/* STEPS */
.lp-steps { display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden; }
.lp-step { background:var(--surface);padding:28px 24px; }
.lp-step-num { font-size:11px;font-weight:700;color:var(--hi);letter-spacing:.1em;margin-bottom:14px; }
.lp-step-title { font-size:16px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;line-height:1.25; }
.lp-step-desc { font-size:14px;color:var(--muted);line-height:1.6; }

/* FEATURES */
.lp-features { display:grid;grid-template-columns:repeat(2,1fr);gap:14px; }
.lp-fcard { background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;transition:border-color .2s,background .2s; }
.lp-fcard:hover { border-color:color-mix(in srgb,var(--green) 50%,transparent);background:var(--lift); }
.lp-ficon { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:14px; }
.lp-ficon-green { background:var(--hi-bg);color:var(--green); }
.lp-ficon-blue { background:rgba(0,39,118,.35);color:#4d8eff; }
.lp-ftitle { font-size:15px;font-weight:800;letter-spacing:-0.02em;margin-bottom:6px; }
.lp-fdesc { font-size:13px;color:var(--muted);line-height:1.58; }

/* CTA STRIP */
.lp-cta { background:#001a52;border-top:1px solid rgba(30,70,180,.5);border-bottom:1px solid rgba(30,70,180,.5);padding:88px 28px;text-align:center; }
.lp-cta-h { font-size:clamp(28px,4vw,50px);font-weight:900;letter-spacing:-0.03em;line-height:1.1;text-wrap:balance;margin-bottom:12px;color:#fff; }
.lp-cta-sub { font-size:16px;color:rgba(255,255,255,.55);margin-bottom:32px; }
.lp-cta-actions { display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap; }
.lp-cta-outline { font-size:15px;font-weight:600;color:#fff;border:1.5px solid rgba(255,255,255,.25);padding:12px 24px;border-radius:var(--r);transition:border-color .15s,background .15s; }
.lp-cta-outline:hover { border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.08); }
.lp-cta-note { margin-top:18px;font-size:12px;color:rgba(255,255,255,.35); }

/* FOOTER */
.lp-footer { max-width:1080px;margin:0 auto;padding:24px 28px;display:flex;align-items:center;justify-content:space-between; }
.lp-footer-copy { font-size:12px;color:var(--muted); }

/* DIVIDER */
.lp-hr { border:none;border-top:1px solid var(--border); }

/* RESPONSIVE */
@media (max-width:760px) {
  .lp-hero { grid-template-columns:1fr;padding:48px 20px 60px;gap:40px; }
  .lp-mock { transform:none!important; }
  .lp-steps { grid-template-columns:1fr; }
  .lp-features { grid-template-columns:1fr; }
  .lp-footer { flex-direction:column;gap:8px;text-align:center; }
  .lp-nav { padding:0 16px; }
  .lp-section { padding:60px 20px; }
}
@media (prefers-reduced-motion:reduce) {
  .lp-mock { transition:none; }
}
`

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="lp">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* NAV */}
      <nav className="lp-nav">
        <span className="lp-logo">
          <span className="lp-logo-br">BR</span>
          <span className="lp-logo-bo">bolões</span>
        </span>
        <div className="lp-nav-actions">
          <Link href="/login" className="lp-btn-ghost">Entrar</Link>
          <Link href="/cadastro" className="lp-btn-primary">Criar conta</Link>
        </div>
      </nav>

      {/* HERO */}
      <section>
        <div className="lp-hero">
          <div>
            <div className="lp-eyebrow">Plataforma de bolões</div>
            <h1 className="lp-h1">
              Seu bolão,<br />do jeito que<br />
              <span className="lp-h1-em">você quer</span>
            </h1>
            <p className="lp-sub">
              Crie bolões para qualquer campeonato. Convide participantes, confirme pagamentos e acompanhe o ranking atualizar a cada resultado.
            </p>
            <div className="lp-ctas">
              <Link href="/cadastro" className="lp-btn-lg">Criar meu bolão</Link>
              <Link href="/login" className="lp-btn-outline">Já tenho conta</Link>
            </div>
          </div>

          <div aria-hidden="true">
            <div className="lp-mock">
              <div className="lp-mock-header">
                <span className="lp-mock-league">Brasileirão 2025 · Rodada 34</span>
                <span className="lp-mock-status">FIM DE JOGO</span>
              </div>
              <div className="lp-mock-match">
                <div className="lp-mock-score-row">
                  <div className="lp-mock-team">Flamengo</div>
                  <div className="lp-mock-score">
                    <span>2</span>
                    <span className="lp-mock-sep">×</span>
                    <span>1</span>
                  </div>
                  <div className="lp-mock-team">Palmeiras</div>
                </div>
              </div>
              <div className="lp-mock-palpite">
                <span className="lp-mp-label">Seu palpite</span>
                <div className="lp-mp-val">
                  <span className="lp-mp-score">2 × 1</span>
                  <span className="lp-mp-badge">Placar exato · +5 pts</span>
                </div>
              </div>
              <div className="lp-mock-ranking">
                <div className="lp-rank-title">Ranking</div>
                <div className="lp-rrow">
                  <span className="lp-rpos lp-rpos-medal">🥇</span>
                  <span className="lp-rname">Ana Lima</span>
                  <span className="lp-rpts">47<span className="lp-rpts-u">pts</span></span>
                </div>
                <div className="lp-rrow">
                  <span className="lp-rpos lp-rpos-medal">🥈</span>
                  <span className="lp-rname">Carlos M.</span>
                  <span className="lp-rpts">44<span className="lp-rpts-u">pts</span></span>
                </div>
                <div className="lp-rrow lp-rrow-me">
                  <span className="lp-rpos lp-rpos-medal">🥉</span>
                  <span className="lp-rname lp-rname-me">Você</span>
                  <span className="lp-rpts">42<span className="lp-rpts-u">pts</span></span>
                </div>
                <div className="lp-rrow">
                  <span className="lp-rpos">4º</span>
                  <span className="lp-rname">Pedro R.</span>
                  <span className="lp-rpts">38<span className="lp-rpts-u">pts</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="lp-hr" />

      {/* COMO FUNCIONA */}
      <section>
        <div className="lp-section">
          <div className="lp-sec-eyebrow">Como funciona</div>
          <h2 className="lp-sec-title">Três passos para começar</h2>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">01</div>
              <div className="lp-step-title">Crie o bolão</div>
              <p className="lp-step-desc">Escolha o campeonato, defina a taxa de entrada, o percentual do prêmio e a pontuação para placar exato e resultado certo.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">02</div>
              <div className="lp-step-title">Convide participantes</div>
              <p className="lp-step-desc">Compartilhe o link pelo WhatsApp. Os participantes criam conta, fazem seus palpites e você confirma o pagamento de cada um.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">03</div>
              <div className="lp-step-title">Acompanhe em tempo real</div>
              <p className="lp-step-desc">Conforme os resultados são lançados, os palpites são pontuados e o ranking atualiza automaticamente para todos verem.</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="lp-hr" />

      {/* FEATURES */}
      <section>
        <div className="lp-section">
          <div className="lp-sec-eyebrow">Para organizadores</div>
          <h2 className="lp-sec-title">Tudo para organizar sem dor de cabeça</h2>
          <div className="lp-features">
            <div className="lp-fcard">
              <div className="lp-ficon lp-ficon-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </div>
              <div className="lp-ftitle">Múltiplos bolões</div>
              <p className="lp-fdesc">Brasileirão, Copa, Libertadores ou qualquer campeonato. Gerencie vários ao mesmo tempo, cada um com ranking e prêmio independentes.</p>
            </div>
            <div className="lp-fcard">
              <div className="lp-ficon lp-ficon-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div className="lp-ftitle">Ranking automático</div>
              <p className="lp-fdesc">Lançou o resultado do jogo? Pontos calculados e ranking atualizado na hora. Sem planilha, sem erro de digitação, sem discussão.</p>
            </div>
            <div className="lp-fcard">
              <div className="lp-ficon lp-ficon-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div className="lp-ftitle">Controle de pagamentos</div>
              <p className="lp-fdesc">Veja quem pagou e quem está pendente. Confirme entradas manualmente ou integre com PIX via Asaas para cobrança automática.</p>
            </div>
            <div className="lp-fcard">
              <div className="lp-ficon lp-ficon-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div className="lp-ftitle">Link de convite</div>
              <p className="lp-fdesc">Um link único por bolão. Compartilhe no WhatsApp e os participantes entram com um toque — sem código de acesso nem formulário complicado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA AZUL */}
      <div className="lp-cta">
        <h2 className="lp-cta-h">Pronto para organizar<br />seu bolão?</h2>
        <p className="lp-cta-sub">Gratuito para começar. Sem cartão de crédito.</p>
        <div className="lp-cta-actions">
          <Link href="/cadastro" className="lp-btn-lg">Criar meu bolão agora</Link>
          <Link href="/login" className="lp-cta-outline">Já tenho conta</Link>
        </div>
        <p className="lp-cta-note">Ou entre com o link de convite que você recebeu pelo WhatsApp</p>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="lp-footer">
          <span className="lp-logo">
            <span className="lp-logo-br">BR</span>
            <span className="lp-logo-bo">bolões</span>
          </span>
          <span className="lp-footer-copy">© 2025 BRbolões. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  )
}
