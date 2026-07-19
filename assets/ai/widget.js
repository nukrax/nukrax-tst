// ═══════════════════════════════════════════════
// NUKRAX AI — widget.js
// Self-contained floating chat widget. Injects its own markup/CSS
// at runtime — does not modify existing page layout, sections,
// colors, spacing, or breakpoints. Reuses the page's existing
// design tokens (--black, --panel, --accent, etc.) and fonts.
// ═══════════════════════════════════════════════

import { QUICK_PROMPTS, TUTORIAL_STEPS } from './ai-data.js';
import { getNukraxResponse, NUKRAX_OFFLINE_FALLBACK } from './responder.js';
import * as History from './history.js';

const ROOT_ID = 'nkx-ai-root';
if (!document.getElementById(ROOT_ID)) {

  const css = `
  #${ROOT_ID}, #${ROOT_ID} * { box-sizing:border-box; }
  #${ROOT_ID} {
    position:fixed; z-index:9500; right:22px; bottom:22px;
    font-family:var(--font-b, sans-serif); color:var(--text,#D3DBDD);
  }
  @media(max-width:600px){ #${ROOT_ID}{ right:14px; bottom:14px; } }

  /* ── Back to top ── */
  .nkx-top-btn{
    position:absolute; right:2px; bottom:80px;
    width:38px; height:38px; border-radius:50%;
    background:var(--panel,#0A0F13); border:1px solid var(--line,#1B2328);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; opacity:0; pointer-events:none; transform:translateY(6px);
    transition:opacity .35s var(--ease,ease), transform .35s var(--ease,ease), border-color .3s;
  }
  .nkx-top-btn.show{ opacity:1; pointer-events:auto; transform:translateY(0); }
  .nkx-top-btn:hover{ border-color:var(--line-lit,#2A353C); }
  .nkx-top-btn svg{ width:14px; height:14px; stroke:var(--accent,#8FB8C4); }

  /* ── FAB ── */
  .nkx-fab-wrap{ display:flex; align-items:center; gap:11px; }
  .nkx-fab-label{
    font-family:var(--font-m,monospace); font-size:11px; letter-spacing:.08em; text-transform:uppercase;
    color:var(--white,#F2F5F5); background:var(--panel,#0A0F13); border:1px solid var(--line-lit,#2A353C);
    padding:9px 14px; border-radius:3px; white-space:nowrap; box-shadow:0 6px 20px rgba(0,0,0,.4);
    animation:nkx-label-in .4s var(--ease-out,ease) .3s both;
  }
  @keyframes nkx-label-in{ from{ opacity:0; transform:translateX(6px);} to{ opacity:1; transform:translateX(0);} }
  @media(max-width:520px){ .nkx-fab-label{ display:none; } }

  .nkx-fab{
    position:relative; width:60px; height:60px; border-radius:50%;
    background:var(--accent,#8FB8C4); border:1px solid var(--accent,#8FB8C4);
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    box-shadow:0 10px 32px rgba(143,184,196,.35), 0 4px 14px rgba(0,0,0,.5);
    transition:transform .3s var(--ease-out,ease), box-shadow .3s;
  }
  .nkx-fab:hover{ transform:translateY(-2px); box-shadow:0 14px 38px rgba(143,184,196,.5), 0 4px 14px rgba(0,0,0,.5); }
  .nkx-fab-inner{
    width:42px; height:42px; border-radius:50%; background:var(--black,#030507);
    display:flex; align-items:center; justify-content:center; overflow:hidden;
  }
  .nkx-fab img{ width:26px; height:26px; border-radius:50%; object-fit:cover; }
  .nkx-fab-ring{
    position:absolute; inset:-6px; border-radius:50%;
    border:1px solid var(--accent,#8FB8C4); opacity:0;
    animation:nkx-pulse 2.6s var(--ease-out,ease) infinite;
  }
  .nkx-fab-ring.r2{ animation-delay:1.3s; }
  @keyframes nkx-pulse{
    0%{ transform:scale(.85); opacity:.65; }
    100%{ transform:scale(1.4); opacity:0; }
  }
  .nkx-fab-dot{
    position:absolute; top:1px; right:1px; width:10px; height:10px; border-radius:50%;
    background:var(--white,#F2F5F5); border:2px solid var(--black,#030507);
  }

  /* ── Popup panel ── */
  .nkx-panel{
    position:absolute; right:0; bottom:78px;
    width:368px; max-width:calc(100vw - 28px); height:min(560px, 76vh);
    background:var(--panel,#0A0F13); border:1px solid var(--line,#1B2328);
    border-radius:3px; display:flex; flex-direction:column; overflow:hidden;
    opacity:0; transform:translateY(14px) scale(.98); pointer-events:none;
    transition:opacity .3s var(--ease-out,ease), transform .3s var(--ease-out,ease);
    box-shadow:0 20px 60px rgba(0,0,0,.55);
  }
  .nkx-panel.open{ opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }
  @media(max-width:600px){
    .nkx-panel{ width:calc(100vw - 28px); height:min(520px, 72vh); }
  }

  .nkx-head{
    display:flex; align-items:center; justify-content:space-between;
    padding:13px 14px; border-bottom:1px solid var(--line,#1B2328);
    background:var(--black,#030507);
  }
  .nkx-head-left{ display:flex; align-items:center; gap:9px; }
  .nkx-head-dot{ width:6px; height:6px; border-radius:50%; background:var(--accent,#8FB8C4); }
  .nkx-head-title{ font-size:13px; font-weight:500; color:var(--white,#F2F5F5); letter-spacing:.01em; }
  .nkx-head-mode{ font-family:var(--font-m,monospace); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted,#8A9BA3); }
  .nkx-head-right{ display:flex; align-items:center; gap:6px; }
  .nkx-head-btn{
    font-family:var(--font-b,sans-serif); font-size:11.5px; font-weight:500;
    color:var(--accent,#8FB8C4); background:transparent; border:1px solid var(--line-lit,#2A353C);
    padding:6px 10px; border-radius:2px; cursor:pointer; display:flex; align-items:center; gap:5px;
    transition:border-color .25s, color .25s;
  }
  .nkx-head-btn:hover{ border-color:var(--accent,#8FB8C4); color:var(--white,#F2F5F5); }
  .nkx-icon-btn{
    width:26px; height:26px; border-radius:2px; background:transparent; border:1px solid transparent;
    color:var(--muted,#8A9BA3); cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:border-color .2s, color .2s;
  }
  .nkx-icon-btn:hover{ border-color:var(--line-lit,#2A353C); color:var(--white,#F2F5F5); }

  /* ── Body / messages ── */
  .nkx-body{ position:relative; flex:1; overflow-y:auto; padding:16px 14px; display:flex; flex-direction:column; gap:12px; }
  .nkx-body::-webkit-scrollbar{ width:3px; }
  .nkx-body::-webkit-scrollbar-thumb{ background:var(--line-lit,#2A353C); }

  .nkx-msg{ max-width:86%; font-size:13.5px; line-height:1.55; }
  .nkx-msg-user{ align-self:flex-end; background:rgba(143,184,196,0.09); border:1px solid rgba(143,184,196,0.18); padding:9px 12px; border-radius:2px; color:var(--white,#F2F5F5); }
  .nkx-msg-ai{ align-self:flex-start; }
  .nkx-msg-ai-label{ font-family:var(--font-m,monospace); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent,#8FB8C4); margin-bottom:4px; display:block; }
  .nkx-msg-ai-text{ color:var(--text,#D3DBDD); }

  .nkx-typing{ display:flex; gap:4px; align-self:flex-start; padding:6px 0; }
  .nkx-typing span{ width:5px; height:5px; border-radius:50%; background:var(--muted,#8A9BA3); animation:nkx-bounce 1.1s ease-in-out infinite; }
  .nkx-typing span:nth-child(2){ animation-delay:.15s; }
  .nkx-typing span:nth-child(3){ animation-delay:.3s; }
  @keyframes nkx-bounce{ 0%,60%,100%{ transform:translateY(0); opacity:.4; } 30%{ transform:translateY(-4px); opacity:1; } }

  .nkx-empty{ display:flex; flex-direction:column; gap:14px; align-items:flex-start; padding-top:10px; }
  .nkx-empty-title{ font-size:14px; color:var(--white,#F2F5F5); font-weight:500; }
  .nkx-empty-sub{ font-size:12.5px; color:var(--muted,#8A9BA3); }
  .nkx-chip-row{ display:flex; flex-wrap:wrap; gap:7px; }
  .nkx-chip{
    font-size:12px; color:var(--text,#D3DBDD); background:var(--black,#030507);
    border:1px solid var(--line,#1B2328); padding:7px 11px; border-radius:2px; cursor:pointer;
    transition:border-color .2s, color .2s;
  }
  .nkx-chip:hover{ border-color:var(--accent,#8FB8C4); color:var(--white,#F2F5F5); }

  /* ── Input ── */
  .nkx-input-wrap{ border-top:1px solid var(--line,#1B2328); padding:10px 12px; background:var(--black,#030507); position:relative; }
  .nkx-menu-row{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .nkx-dots-btn{ width:24px; height:24px; border-radius:2px; background:transparent; border:1px solid var(--line,#1B2328); color:var(--muted,#8A9BA3); cursor:pointer; font-size:13px; line-height:1; display:flex; align-items:center; justify-content:center; transition:border-color .2s,color .2s; }
  .nkx-dots-btn:hover{ border-color:var(--accent,#8FB8C4); color:var(--accent,#8FB8C4); }
  .nkx-mode-label{ font-family:var(--font-m,monospace); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted,#8A9BA3); }

  .nkx-mode-menu{
    position:absolute; bottom:100%; left:12px; margin-bottom:6px;
    background:var(--panel,#0A0F13); border:1px solid var(--line-lit,#2A353C); border-radius:2px;
    min-width:190px; overflow:hidden; opacity:0; transform:translateY(6px); pointer-events:none;
    transition:opacity .2s, transform .2s; z-index:10;
  }
  .nkx-mode-menu.open{ opacity:1; transform:translateY(0); pointer-events:auto; }
  .nkx-mode-item{ padding:10px 12px; font-size:12.5px; cursor:pointer; display:flex; flex-direction:column; gap:2px; border-bottom:1px solid var(--line,#1B2328); }
  .nkx-mode-item:last-child{ border-bottom:none; }
  .nkx-mode-item:hover{ background:rgba(143,184,196,0.07); }
  .nkx-mode-item.active{ color:var(--accent,#8FB8C4); }
  .nkx-mode-item-desc{ font-size:11px; color:var(--muted,#8A9BA3); }

  .nkx-input-row{ display:flex; align-items:flex-end; gap:8px; }
  .nkx-textarea{
    flex:1; resize:none; background:var(--panel,#0A0F13); border:1px solid var(--line,#1B2328);
    border-radius:2px; color:var(--white,#F2F5F5); font-family:var(--font-b,sans-serif); font-size:13px;
    padding:9px 11px; max-height:90px; outline:none; transition:border-color .2s;
  }
  .nkx-textarea:focus{ border-color:var(--accent,#8FB8C4); }
  .nkx-send-btn{
    width:34px; height:34px; flex-shrink:0; border-radius:2px; background:var(--accent,#8FB8C4);
    border:1px solid var(--accent,#8FB8C4); color:var(--black,#030507); cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:background .2s,transform .15s;
  }
  .nkx-send-btn:hover{ background:var(--white,#F2F5F5); }
  .nkx-send-btn:active{ transform:scale(.94); }
  .nkx-send-btn:disabled{ opacity:.4; cursor:default; }

  /* ── Tutorial overlay ── */
  .nkx-tutorial{
    position:absolute; inset:0; background:var(--panel,#0A0F13); z-index:20;
    display:flex; flex-direction:column; justify-content:space-between; padding:22px 20px;
    opacity:1; transition:opacity .35s var(--ease,ease);
  }
  .nkx-tutorial.fade-out{ opacity:0; pointer-events:none; }
  .nkx-tut-step{ display:flex; flex-direction:column; gap:14px; }
  .nkx-tut-icon{
    width:44px; height:44px; border-radius:2px; border:1px solid var(--line-lit,#2A353C);
    display:flex; align-items:center; justify-content:center; font-size:18px; color:var(--accent,#8FB8C4);
    background:var(--black,#030507);
  }
  .nkx-tut-title{ font-size:16.5px; font-weight:500; color:var(--white,#F2F5F5); }
  .nkx-tut-body{ font-size:13px; line-height:1.6; color:var(--muted,#8A9BA3); }
  .nkx-tut-step-inner{ animation:nkx-step-in .4s var(--ease-out,ease); }
  @keyframes nkx-step-in{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:translateY(0); } }

  .nkx-tut-footer{ display:flex; flex-direction:column; gap:14px; }
  .nkx-tut-dots{ display:flex; gap:6px; }
  .nkx-tut-dot{ width:16px; height:3px; border-radius:2px; background:var(--line,#1B2328); transition:background .3s, width .3s; }
  .nkx-tut-dot.active{ background:var(--accent,#8FB8C4); width:26px; }
  .nkx-tut-dot.done{ background:var(--accent-dim,#46626B); }
  .nkx-tut-actions{ display:flex; align-items:center; justify-content:space-between; }
  .nkx-tut-skip{ font-size:12px; color:var(--muted,#8A9BA3); cursor:pointer; }
  .nkx-tut-skip:hover{ color:var(--text,#D3DBDD); }
  .nkx-tut-continue{
    font-size:13px; font-weight:600; color:var(--black,#030507); background:var(--accent,#8FB8C4);
    border:1px solid var(--accent,#8FB8C4); padding:10px 18px; border-radius:2px; cursor:pointer;
    transition:background .2s;
  }
  .nkx-tut-continue:hover{ background:var(--white,#F2F5F5); }
  `;

  const style = document.createElement('style');
  style.id = ROOT_ID + '-style';
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.innerHTML = `
    <button class="nkx-top-btn" aria-label="Back to top" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
    </button>
    <div class="nkx-panel" role="dialog" aria-label="Lanux chat">
      <div class="nkx-head">
        <div class="nkx-head-left">
          <span class="nkx-head-dot"></span>
          <div>
            <div class="nkx-head-title">Lanux</div>
            <div class="nkx-head-mode" data-mode-label>Nukrax Assistant</div>
          </div>
        </div>
        <div class="nkx-head-right">
          <button class="nkx-head-btn" data-expand type="button">Chat <span>→</span></button>
          <button class="nkx-icon-btn" data-close type="button" aria-label="Close">✕</button>
        </div>
      </div>
      <div class="nkx-body" data-body></div>
      <div class="nkx-input-wrap">
        <div class="nkx-menu-row">
          <button class="nkx-dots-btn" data-dots type="button" aria-label="AI mode menu">⋮</button>
          <span class="nkx-mode-label" data-mode-pill>NUKRAX ASSISTANT</span>
        </div>
        <div class="nkx-mode-menu" data-mode-menu>
          <div class="nkx-mode-item" data-mode-choice="nukrax">
            <span>Nukrax Assistant</span>
            <span class="nkx-mode-item-desc">Site, EAs, setup, contact — anything NUKRAX</span>
          </div>
          <div class="nkx-mode-item" data-mode-choice="general">
            <span>General AI</span>
            <span class="nkx-mode-item-desc">A normal AI assistant, any topic</span>
          </div>
        </div>
        <div class="nkx-input-row">
          <textarea class="nkx-textarea" rows="1" placeholder="Ask anything…" data-input></textarea>
          <button class="nkx-send-btn" data-send type="button" aria-label="Send">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>
    </div>
    <div class="nkx-fab-wrap">
      <span class="nkx-fab-label">Ask Lanux</span>
      <button class="nkx-fab" data-fab type="button" aria-label="Open Lanux chat">
        <span class="nkx-fab-ring"></span>
        <span class="nkx-fab-ring r2"></span>
        <span class="nkx-fab-dot"></span>
        <span class="nkx-fab-inner">
          <img src="${location.pathname.includes('/ea/') ? '../assets/logo.png' : 'assets/logo.png'}" alt="" onerror="this.style.display='none'"/>
        </span>
      </button>
    </div>
  `;
  document.body.appendChild(root);

  // ── Elements ──
  const fab = root.querySelector('[data-fab]');
  const panel = root.querySelector('.nkx-panel');
  const closeBtn = root.querySelector('[data-close]');
  const expandBtn = root.querySelector('[data-expand]');
  const body = root.querySelector('[data-body]');
  const input = root.querySelector('[data-input]');
  const sendBtn = root.querySelector('[data-send]');
  const dotsBtn = root.querySelector('[data-dots]');
  const modeMenu = root.querySelector('[data-mode-menu]');
  const modeLabel = root.querySelector('[data-mode-label]');
  const modePill = root.querySelector('[data-mode-pill]');
  const topBtn = root.querySelector('.nkx-top-btn');

  const basePath = location.pathname.includes('/ea/') ? '../' : '';

  // ── Back to top ──
  window.addEventListener('scroll', () => {
    if (window.scrollY > 420) topBtn.classList.add('show');
    else topBtn.classList.remove('show');
  }, { passive: true });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── Open / close ──
  let convo = History.getOrCreateActiveConversation(History.getMode());
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      if (!History.hasTutorialBeenSeen()) renderTutorial();
      else renderMessages();
      setTimeout(() => input.focus(), 300);
    }
  });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  expandBtn.addEventListener('click', () => { window.location.href = basePath + 'chat.html'; });

  // ── Mode menu ──
  function refreshModeUI() {
    const mode = History.getMode();
    const label = mode === 'nukrax' ? 'Nukrax Assistant' : 'General AI';
    modeLabel.textContent = label;
    modePill.textContent = label.toUpperCase();
    modeMenu.querySelectorAll('[data-mode-choice]').forEach(el => {
      el.classList.toggle('active', el.dataset.modeChoice === mode);
    });
  }
  refreshModeUI();

  dotsBtn.addEventListener('click', (e) => { e.stopPropagation(); modeMenu.classList.toggle('open'); });
  document.addEventListener('click', () => modeMenu.classList.remove('open'));
  modeMenu.querySelectorAll('[data-mode-choice]').forEach(el => {
    el.addEventListener('click', () => {
      const newMode = el.dataset.modeChoice;
      if (newMode === History.getMode()) { modeMenu.classList.remove('open'); return; }
      History.setMode(newMode);
      if (convo.messages.length > 0) {
        convo = History.createConversation(newMode);
      } else {
        convo.mode = newMode;
      }
      refreshModeUI();
      modeMenu.classList.remove('open');
      renderMessages();
    });
  });

  // ── Tutorial ──
  function renderTutorial() {
    let step = 0;
    const overlay = document.createElement('div');
    overlay.className = 'nkx-tutorial';
    body.parentElement.insertBefore(overlay, body.nextSibling);
    // Put overlay over body region only: absolute within panel, covering body+input area is enough (body already position:relative not needed since panel is relative)
    overlay.style.position = 'absolute';
    overlay.style.left = '0'; overlay.style.right = '0'; overlay.style.bottom = '0';
    overlay.style.top = '53px'; // below header

    function draw() {
      const s = TUTORIAL_STEPS[step];
      const isLast = step === TUTORIAL_STEPS.length - 1;
      overlay.innerHTML = `
        <div class="nkx-tut-step">
          <div class="nkx-tut-step-inner" style="display:flex;flex-direction:column;gap:14px;">
            <div class="nkx-tut-icon">${s.icon}</div>
            <div class="nkx-tut-title">${s.title}</div>
            <div class="nkx-tut-body">${s.body}</div>
          </div>
        </div>
        <div class="nkx-tut-footer">
          <div class="nkx-tut-dots">
            ${TUTORIAL_STEPS.map((_, i) => `<div class="nkx-tut-dot ${i === step ? 'active' : i < step ? 'done' : ''}"></div>`).join('')}
          </div>
          <div class="nkx-tut-actions">
            <span class="nkx-tut-skip" data-skip>Skip tour</span>
            <button class="nkx-tut-continue" data-continue type="button">${isLast ? "Let's chat" : 'Continue'}</button>
          </div>
        </div>
      `;
      overlay.querySelector('[data-skip]').addEventListener('click', finish);
      overlay.querySelector('[data-continue]').addEventListener('click', () => {
        if (isLast) { finish(); return; }
        step++;
        draw();
      });
    }
    function finish() {
      History.markTutorialSeen();
      overlay.classList.add('fade-out');
      setTimeout(() => { overlay.remove(); renderMessages(); }, 350);
    }
    draw();
  }

  // ── Messages ──
  function renderMessages() {
    body.innerHTML = '';
    if (!convo.messages.length) {
      const mode = History.getMode();
      const prompts = QUICK_PROMPTS[mode === 'nukrax' ? 'nukrax' : 'general'];
      const empty = document.createElement('div');
      empty.className = 'nkx-empty';
      empty.innerHTML = `
        <div class="nkx-empty-title">Ask me anything${mode === 'nukrax' ? ' about NUKRAX' : ''}.</div>
        <div class="nkx-empty-sub">${mode === 'nukrax' ? 'EAs, setup, risk, contact — I\u2019ve got the details.' : 'General assistant mode \u2014 ask about anything.'}</div>
        <div class="nkx-chip-row">${prompts.map(p => `<div class="nkx-chip" data-prompt="${p.replace(/"/g, '&quot;')}">${p}</div>`).join('')}</div>
      `;
      empty.querySelectorAll('[data-prompt]').forEach(chip => {
        chip.addEventListener('click', () => { input.value = chip.dataset.prompt; sendMessage(); });
      });
      body.appendChild(empty);
      return;
    }
    convo.messages.forEach(m => body.appendChild(renderMsg(m)));
    body.scrollTop = body.scrollHeight;
  }

  function renderMsg(m) {
    const el = document.createElement('div');
    if (m.role === 'user') {
      el.className = 'nkx-msg nkx-msg-user';
      el.textContent = m.content;
    } else {
      el.className = 'nkx-msg nkx-msg-ai';
      el.innerHTML = `<span class="nkx-msg-ai-label">LANUX</span><span class="nkx-msg-ai-text"></span>`;
      el.querySelector('.nkx-msg-ai-text').textContent = m.content;
    }
    return el;
  }

  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 90) + 'px';
  }
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener('click', sendMessage);

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = ''; autoGrow();
    convo = History.addMessage(convo.id, 'user', text);
    renderMessages();

    const typing = document.createElement('div');
    typing.className = 'nkx-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
    sendBtn.disabled = true;

    const mode = History.getMode();

    // Nukrax Assistant: try the instant, free, no-limit local match first.
    if (mode === 'nukrax') {
      const delay = 280 + Math.random() * 220;
      await new Promise(r => setTimeout(r, delay));
      const localReply = getNukraxResponse(text);
      if (localReply) {
        typing.remove();
        convo = History.addMessage(convo.id, 'assistant', localReply);
        renderMessages();
        sendBtn.disabled = false;
        return;
      }
      // No confident local match — fall back to the free Workers AI model,
      // still grounded in NUKRAX facts, so specific questions get a real answer.
    }

    try {
      const history = convo.messages.slice(-12).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(basePath + 'api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, messages: history })
      });
      const data = await res.json();
      typing.remove();
      const reply = data.reply || "Sorry — I couldn't get a response just now. Please try again in a moment.";
      convo = History.addMessage(convo.id, 'assistant', reply);
      renderMessages();
    } catch (err) {
      typing.remove();
      const fallback = mode === 'nukrax' ? NUKRAX_OFFLINE_FALLBACK : "I'm having trouble connecting right now. Please try again shortly, or reach out on Telegram (@CosmoLanex).";
      convo = History.addMessage(convo.id, 'assistant', fallback);
      renderMessages();
    } finally {
      sendBtn.disabled = false;
    }
  }
}
