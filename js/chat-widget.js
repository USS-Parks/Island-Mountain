/* ============================================================
   Island Mountain — AI chat widget (vanilla, drop-in)
   No framework. Self-injects scoped styles. Lazy-builds the panel
   on first open so it never sits in the critical render path.

   Config (optional), set before this script loads:
     window.IM_CHAT_CONFIG = { apiBase: "https://your-worker.example.workers.dev" };
   On localhost the widget auto-targets http://localhost:8787.
   ============================================================ */
(function () {
  'use strict';
  if (window.__imChatLoaded) return;
  window.__imChatLoaded = true;

  // --- Config ---------------------------------------------------------------
  var CFG = window.IM_CHAT_CONFIG || {};
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API_BASE =
    CFG.apiBase ||
    (isLocal ? 'http://localhost:8787' : 'https://island-mountain-funnel.basho-parks.workers.dev');
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Tracking -------------------------------------------------------------
  // Standard funnel events: chat_open, chat_first_message (client) +
  // qualify_started, generate_lead, schedule_call, voice_session (server-side MP).
  function track(event, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', event, Object.assign({}, attrParams(), params || {}));
      }
    } catch (e) {}
  }
  function attrParams() {
    return {
      utm_source: META.utm_source || '',
      utm_medium: META.utm_medium || '',
      utm_campaign: META.utm_campaign || '',
      landing_page: META.landing_page || '',
    };
  }

  // --- Attribution captured once at load ------------------------------------
  function captureMeta() {
    var q = new URLSearchParams(location.search);
    return {
      utm_source: q.get('utm_source') || undefined,
      utm_medium: q.get('utm_medium') || undefined,
      utm_campaign: q.get('utm_campaign') || undefined,
      landing_page: location.pathname,
      referrer: document.referrer || undefined,
    };
  }
  var META = captureMeta();

  // --- Session id (per tab) -------------------------------------------------
  function getSessionId() { try { return sessionStorage.getItem('im_chat_sid') || ''; } catch (e) { return ''; } }
  function setSessionId(id) { try { sessionStorage.setItem('im_chat_sid', id); } catch (e) {} }

  // --- Visible conversation log (persists across same-tab page navigations) --
  var MAX_LOG = 60;
  function loadLog() {
    try { return JSON.parse(sessionStorage.getItem('im_chat_log') || '[]') || []; } catch (e) { return []; }
  }
  function saveLog() {
    try {
      if (chatLog.length > MAX_LOG) chatLog = chatLog.slice(-MAX_LOG);
      sessionStorage.setItem('im_chat_log', JSON.stringify(chatLog));
    } catch (e) {}
  }
  function logMsg(who, text) { chatLog.push({ who: who, text: text }); saveLog(); }
  var chatLog = loadLog();

  var GREETING = 'Hi — I’m the Island Mountain AI specialist. I can help you figure out whether an on-premises AI server fits your compliance and budget, and answer questions about the Summit lineup. What brings you in today?';

  // Remember whether the panel is open, so it stays open across page changes.
  function setOpenFlag(v) { try { sessionStorage.setItem('im_chat_open', v ? '1' : '0'); } catch (e) {} }
  function isOpenFlag() { try { return sessionStorage.getItem('im_chat_open') === '1'; } catch (e) { return false; } }

  // --- Styles (scoped under .imchat-root) -----------------------------------
  var CSS = [
    '.imchat-root{--c:var(--copper,#f59e0b);--cd:var(--copper-deep,#d97706);--bg:var(--primary-dark,#0f172a);--bg2:var(--secondary-dark,#1e293b);--bd:rgba(148,163,184,.18);--tx:var(--text-light,#f1f5f9);--mut:var(--text-muted,#94a3b8);font-family:inherit;}',
    '.imchat-launch{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:10px;padding:12px 18px;border:none;border-radius:999px;cursor:pointer;color:#0f172a;font-weight:700;font-size:15px;background:linear-gradient(135deg,var(--c),var(--cd));box-shadow:0 6px 20px rgba(245,158,11,.35);transition:transform .2s ease,box-shadow .2s ease;}',
    '.imchat-launch:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(245,158,11,.45);}',
    '.imchat-launch:focus-visible{outline:3px solid #fff;outline-offset:2px;}',
    '.imchat-launch svg{width:20px;height:20px;}',
    '.imchat-panel{position:fixed;right:20px;bottom:20px;z-index:2147483001;width:380px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 40px);display:none;flex-direction:column;background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.5);}',
    '.imchat-panel.imchat-open{display:flex;animation:imchat-pop .18s ease;}',
    '@keyframes imchat-pop{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}',
    '.imchat-reduced .imchat-panel.imchat-open{animation:none;}',
    '.imchat-head{display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(135deg,rgba(245,158,11,.16),rgba(217,119,6,.06));border-bottom:1px solid var(--bd);}',
    '.imchat-head .imchat-dot{width:9px;height:9px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;}',
    '.imchat-head h3{margin:0;font-size:15px;font-weight:700;color:var(--tx);}',
    '.imchat-head p{margin:1px 0 0;font-size:12px;color:var(--mut);}',
    '.imchat-x{margin-left:auto;background:none;border:none;color:var(--mut);font-size:22px;line-height:1;cursor:pointer;padding:4px 8px;border-radius:8px;}',
    '.imchat-x:hover{color:var(--tx);background:rgba(255,255,255,.06);}',
    '.imchat-x:focus-visible{outline:2px solid var(--c);}',
    '.imchat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}',
    '.imchat-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;}',
    '.imchat-bot{align-self:flex-start;background:var(--bg2);border:1px solid var(--bd);border-bottom-left-radius:4px;}',
    '.imchat-user{align-self:flex-end;background:linear-gradient(135deg,var(--c),var(--cd));color:#0f172a;border-bottom-right-radius:4px;font-weight:500;}',
    '.imchat-typing{align-self:flex-start;display:flex;gap:4px;padding:12px 14px;}',
    '.imchat-typing span{width:7px;height:7px;border-radius:50%;background:var(--mut);animation:imchat-bounce 1.2s infinite;}',
    '.imchat-typing span:nth-child(2){animation-delay:.2s;}.imchat-typing span:nth-child(3){animation-delay:.4s;}',
    '@keyframes imchat-bounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-5px);opacity:1;}}',
    '.imchat-foot{padding:12px;border-top:1px solid var(--bd);}',
    '.imchat-inrow{display:flex;gap:8px;align-items:flex-end;}',
    '.imchat-in{flex:1;resize:none;max-height:96px;min-height:42px;padding:10px 12px;border-radius:12px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx);font-family:inherit;font-size:14px;line-height:1.4;}',
    '.imchat-in:focus{outline:none;border-color:var(--c);}',
    '.imchat-in::placeholder{color:var(--mut);}',
    '.imchat-send{flex:none;width:42px;height:42px;border:none;border-radius:12px;cursor:pointer;color:#0f172a;background:linear-gradient(135deg,var(--c),var(--cd));display:flex;align-items:center;justify-content:center;}',
    '.imchat-send:disabled{opacity:.5;cursor:not-allowed;}',
    '.imchat-send:focus-visible{outline:3px solid #fff;outline-offset:1px;}',
    '.imchat-send svg{width:18px;height:18px;}',
    '.imchat-note{margin:8px 2px 0;font-size:11px;color:var(--mut);text-align:center;}',
    '.imchat-voice{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-bottom:8px;padding:9px 12px;border-radius:12px;cursor:pointer;font-weight:600;font-size:13px;color:var(--c);background:transparent;border:1px solid var(--bd);}',
    '.imchat-voice:hover{border-color:var(--c);}',
    '.imchat-voice:focus-visible{outline:2px solid var(--c);}',
    '.imchat-voice[data-state="incall"]{color:#22c55e;border-color:#22c55e;}',
    '.imchat-book{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;margin-top:2px;padding:10px 16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;color:#0f172a;background:linear-gradient(135deg,var(--c),var(--cd));box-shadow:0 4px 14px rgba(245,158,11,.3);}',
    '.imchat-book:hover{filter:brightness(1.05);}',
    '.imchat-book:focus-visible{outline:3px solid #fff;outline-offset:2px;}',
    '.imchat-hidden{display:none!important;}',
  ].join('');

  function injectStyles() {
    if (document.getElementById('imchat-styles')) return;
    var s = document.createElement('style');
    s.id = 'imchat-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // --- DOM refs ---
  var root, launcher, panel, msgsEl, inputEl, sendBtn, builtPanel = false, isOpen = false, busy = false;

  var CHAT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  var SEND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  function init() {
    injectStyles();
    root = document.createElement('div');
    root.className = 'imchat-root' + (REDUCED ? ' imchat-reduced' : '');
    launcher = document.createElement('button');
    launcher.className = 'imchat-launch';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Chat with an Island Mountain AI specialist');
    launcher.innerHTML = CHAT_ICON + '<span>Chat with us</span>';
    launcher.addEventListener('click', function () { openPanel(); });
    root.appendChild(launcher);
    document.body.appendChild(root);
    // Stay open across page changes: if it was open on the previous page, reopen.
    if (isOpenFlag()) openPanel(true);
  }

  function buildPanel() {
    if (builtPanel) return;
    builtPanel = true;
    panel = document.createElement('div');
    panel.className = 'imchat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Island Mountain AI specialist chat');
    panel.innerHTML =
      '<div class="imchat-head">' +
        '<span class="imchat-dot" aria-hidden="true"></span>' +
        '<div><h3>Island Mountain</h3><p>AI specialist · no pressure, no spam</p></div>' +
        '<button class="imchat-x" type="button" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="imchat-msgs" role="log" aria-live="polite" aria-atomic="false"></div>' +
      '<div class="imchat-foot">' +
        voiceButtonHtml() +
        '<div class="imchat-inrow">' +
          '<textarea class="imchat-in" rows="1" placeholder="Ask about Summit servers, compliance, pricing…" aria-label="Type your message"></textarea>' +
          '<button class="imchat-send" type="button" aria-label="Send message">' + SEND_ICON + '</button>' +
        '</div>' +
        '<p class="imchat-note">Answers from Island Mountain’s AI. For anything urgent: 1-341-441-8740</p>' +
      '</div>';
    root.appendChild(panel);
    msgsEl = panel.querySelector('.imchat-msgs');
    inputEl = panel.querySelector('.imchat-in');
    sendBtn = panel.querySelector('.imchat-send');
    wireVoiceButton(panel);

    panel.querySelector('.imchat-x').addEventListener('click', closePanel);
    sendBtn.addEventListener('click', send);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    inputEl.addEventListener('input', autoGrow);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

    // Re-draw the prior conversation (carries across same-tab page navigations),
    // or show the greeting on a fresh session.
    if (chatLog.length) {
      chatLog.forEach(function (m) { addMsg(m.text, m.who); });
    } else {
      addMsg(GREETING, 'bot');
      logMsg('bot', GREETING);
    }
    // Reconcile with the server's stored conversation — this recovers a reply
    // that finished server-side after the visitor changed pages mid-response.
    syncHistory();
  }

  // Pull the authoritative conversation from the Worker and re-render it.
  function renderConversation(serverMsgs) {
    msgsEl.innerHTML = '';
    addMsg(GREETING, 'bot');
    chatLog = [{ who: 'bot', text: GREETING }];
    serverMsgs.forEach(function (m) {
      var who = m.role === 'user' ? 'user' : 'bot';
      if (!m.content) return;
      addMsg(m.content, who);
      chatLog.push({ who: who, text: m.content });
    });
    saveLog();
    scrollDown();
  }
  function syncHistory() {
    var sid = getSessionId();
    if (!sid) return;
    fetch(API_BASE + '/api/history?sessionId=' + encodeURIComponent(sid))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var msgs = (j && j.data && j.data.messages) || [];
        if (msgs.length && !busy) renderConversation(msgs);
      })
      .catch(function () {});
  }

  // --- Voice (Vapi) — in-page web call (no third-party tab) -----------------
  // Defaults baked in for islandmountain.io; override via window.IM_CHAT_CONFIG.voice.
  // vapiPublicKey is a public, client-safe key.
  var VOICE = CFG.voice || {
    vapiPublicKey: '89dd9bb1-c257-45e7-ad3a-5cef31a61e9c',
    vapiAssistantId: '08eba87f-acff-4004-b44e-9860472475a9',
  };
  function voiceButtonHtml() {
    if (!VOICE || (!VOICE.phone && !(VOICE.vapiPublicKey && VOICE.vapiAssistantId))) return '';
    return '<button class="imchat-voice" type="button" aria-label="Talk to an AI specialist by voice">🎙️ Talk to an AI specialist</button>';
  }
  var vapi = null;
  function wireVoiceButton(p) {
    var btn = p.querySelector('.imchat-voice');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (VOICE.vapiPublicKey && VOICE.vapiAssistantId) startWebCall(btn);
      else if (VOICE.phone) { track('voice_call_click', { mode: 'tel' }); location.href = 'tel:' + VOICE.phone; }
    });
  }
  function startWebCall(btn) {
    if (vapi) { try { vapi.stop(); } catch (e) {} vapi = null; btn.textContent = '🎙️ Talk to an AI specialist'; btn.removeAttribute('data-state'); return; }
    btn.textContent = 'Connecting…';
    addBot('Connecting you to our AI voice specialist. This call is handled by an AI assistant — please don’t share anything you wouldn’t put in writing.');
    track('voice_session', { mode: 'web' });
    import('https://esm.sh/@vapi-ai/web@2').then(function (mod) {
      var Vapi = mod.default || mod;
      vapi = new Vapi(VOICE.vapiPublicKey);
      vapi.on('call-start', function () { btn.textContent = '● In call — tap to end'; btn.setAttribute('data-state', 'incall'); });
      vapi.on('call-end', function () { btn.textContent = '🎙️ Talk to an AI specialist'; btn.removeAttribute('data-state'); vapi = null; });
      vapi.on('error', function () { btn.textContent = '🎙️ Talk to an AI specialist'; btn.removeAttribute('data-state'); addBot(fallbackText()); vapi = null; });
      vapi.start(VOICE.vapiAssistantId);
    }).catch(function () {
      btn.textContent = '🎙️ Talk to an AI specialist';
      addBot('I couldn’t start the voice call. Please call 1-341-441-8740 instead.');
    });
  }

  function autoGrow() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 96) + 'px';
  }

  function openPanel(auto) {
    buildPanel();
    launcher.classList.add('imchat-hidden');
    isOpen = true;
    setOpenFlag(true);
    panel.classList.add('imchat-open');
    setTimeout(function () { try { inputEl.focus(); } catch (e) {} }, REDUCED ? 0 : 220);
    if (auto !== true) track('chat_open', { page: location.pathname });
  }

  function closePanel() {
    isOpen = false;
    setOpenFlag(false);
    panel.classList.remove('imchat-open');
    var done = function () { launcher.classList.remove('imchat-hidden'); try { launcher.focus(); } catch (e) {} };
    if (REDUCED) done(); else setTimeout(done, 220);
  }

  // --- Messages ---
  function addMsg(text, who) {
    var el = document.createElement('div');
    el.className = 'imchat-msg ' + (who === 'user' ? 'imchat-user' : 'imchat-bot');
    el.textContent = text;
    msgsEl.appendChild(el);
    scrollDown();
    return el;
  }
  function addBot(t) { return addMsg(t, 'bot'); }
  function scrollDown() { msgsEl.scrollTop = msgsEl.scrollHeight; }

  var bookingShown = false;
  function addBooking(url) {
    if (bookingShown || !url) return;
    bookingShown = true;
    var a = document.createElement('a');
    a.className = 'imchat-book';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = '📅 Book a scoping call';
    a.addEventListener('click', function () { track('booking_offer_click', { page: location.pathname }); });
    msgsEl.appendChild(a);
    scrollDown();
  }

  function showTyping() {
    var t = document.createElement('div');
    t.className = 'imchat-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgsEl.appendChild(t);
    scrollDown();
    return t;
  }

  var firstMessageSent = false;
  function send() {
    if (busy) return;
    var text = (inputEl.value || '').trim();
    if (!text) return;
    inputEl.value = '';
    autoGrow();
    addMsg(text, 'user');
    logMsg('user', text);
    if (!firstMessageSent) { firstMessageSent = true; track('chat_first_message', { page: location.pathname }); }
    streamReply(text);
  }

  function payload(text) {
    var body = { message: text };
    var sid = getSessionId();
    if (sid) body.sessionId = sid;
    else body.meta = META; // only on first message of a session
    return body;
  }

  function streamReply(text) {
    busy = true; sendBtn.disabled = true;
    var typing = showTyping();
    var bubble = null;
    function ensureBubble() { if (!bubble) { if (typing && typing.parentNode) typing.remove(); bubble = addBot(''); } return bubble; }

    var headers = { 'Content-Type': 'application/json', Accept: 'text/event-stream' };
    // Optional Cloudflare Turnstile: if the page sets a token, pass it through.
    if (window.IM_TURNSTILE_TOKEN) headers['X-Turnstile-Token'] = window.IM_TURNSTILE_TOKEN;
    fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload(text)),
    })
      .then(function (res) {
        var ctype = res.headers.get('Content-Type') || '';
        if (ctype.indexOf('text/event-stream') === -1) {
          return res.json().then(function (j) {
            var d = (j && j.data) || {};
            if (d.sessionId) setSessionId(d.sessionId);
            ensureBubble().textContent = d.reply || fallbackText();
            scrollDown();
            if (d.booking && d.booking.url) addBooking(d.booking.url);
          });
        }
        return readSSE(res, ensureBubble);
      })
      .catch(function () {
        ensureBubble().textContent = fallbackText();
        scrollDown();
      })
      .finally(function () {
        if (typing && typing.parentNode) typing.remove();
        if (bubble && bubble.textContent) logMsg('bot', bubble.textContent);
        busy = false; sendBtn.disabled = false;
        try { inputEl.focus(); } catch (e) {}
      });
  }

  function readSSE(res, ensureBubble) {
    var reader = res.body.getReader();
    var dec = new TextDecoder();
    var buf = '';
    function pump() {
      return reader.read().then(function (r) {
        if (r.done) return;
        buf += dec.decode(r.value, { stream: true });
        var parts = buf.split('\n\n');
        buf = parts.pop();
        parts.forEach(function (chunk) {
          var line = chunk.split('\n').find(function (l) { return l.indexOf('data:') === 0; });
          if (!line) return;
          var evt;
          try { evt = JSON.parse(line.slice(5).trim()); } catch (e) { return; }
          if (evt.type === 'meta' && evt.sessionId) setSessionId(evt.sessionId);
          else if (evt.type === 'text') { ensureBubble().textContent += evt.text; scrollDown(); }
          else if (evt.type === 'done' && evt.booking && evt.booking.url) addBooking(evt.booking.url);
        });
        return pump();
      });
    }
    return pump();
  }

  function fallbackText() {
    return "I'm having a little trouble connecting right now. You can reach Basho directly at 1-341-441-8740 or basho@islandmountain.io.";
  }

  // Public API: let on-page CTAs open the chat (e.g. contact.html bot-lead button).
  window.imChatOpen = function () { if (!root) init(); openPanel(); };

  // --- Deferred init: never block first paint --------------------------------
  function boot() {
    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init, { once: true });
  }
  if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 3000 });
  else setTimeout(boot, 1200);
})();
