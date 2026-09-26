/* ─────────────────────────────────────────────────────────────
   Nova · Innovent's on-site assistant — widget

   A floating launcher on every page opens a chat panel. Replies come from
   /api/nova (a Netlify Function that talks to the model with a knowledge pack
   built from this site). Nova can take the visitor to a page and highlight a
   section, offer quick replies, and hand over to the site's own Book-a-call
   dialog or the Request-demo form, pre-filled.

   If the function is not configured (no API key yet) or unreachable, Nova
   falls back to a guided on-site mode: quick paths, a search over the same
   knowledge pack, and the same hand-offs — so the button never dead-ends.

   State lives in sessionStorage only (first-party, cleared when the tab
   closes) so the conversation follows the visitor from page to page.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  if (window.__innvNova) return; window.__innvNova = true;

  var IN_PAGES = /\/pages\/[^/]*$/.test(location.pathname);
  var ROOT = IN_PAGES ? '../' : (location.pathname.replace(/[^/]*$/, '') || '/');
  var API = '/api/nova';
  var KEY = 'innv.nova.v1';
  var SLUG = (function () { var m = location.pathname.match(/\/pages\/([^/.]+)/); return m ? m[1] : (/\/(index\.html)?$/.test(location.pathname) ? 'home' : location.pathname.replace(/^\//, '').replace(/\.html$/, '')); })();
  var TITLE = (document.title || '').replace(/\s*[·|—–-]\s*Innovent\b.*$/, '').trim();
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── the ring — Ali's loader, ids prefixed so it cannot collide with page SVGs ── */
  var RING_DEFS = '<svg width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false"><defs>' +
    '<linearGradient id="nvg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1024" y2="0"><stop offset="0" stop-color="#56c4ff"/><stop offset="0.33" stop-color="#5b6bff"/><stop offset="0.66" stop-color="#8b3dff"/><stop offset="1" stop-color="#c455ff"/></linearGradient>' +
    '<radialGradient id="nvhl"><stop offset="0" stop-color="#fff" stop-opacity="0.8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    '<clipPath id="nvbox"><rect width="1024" height="1024"/></clipPath>' +
    '<clipPath id="nvshape" clip-path="url(#nvbox)"><path clip-rule="evenodd" d="M0 512a512 512 0 1 0 1024 0a512 512 0 1 0-1024 0ZM120 451a452 452 0 1 0 904 0a452 452 0 1 0-904 0Z"/></clipPath>' +
    '<filter id="nvblur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="70"/></filter>' +
    '<filter id="nvblur2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>' +
    '</defs></svg>';
  /* each ring instance carries its own spinning fill so the animation runs in every copy */
  var RING = '<svg class="nv-ring" viewBox="-200 -200 1424 1424" aria-hidden="true" focusable="false">' +
    '<g class="breathe">' +
      '<g class="glow" filter="url(#nvblur)"><g clip-path="url(#nvshape)"><rect class="spin" x="-288" y="-288" width="1600" height="1600" fill="url(#nvg)"/></g></g>' +
      '<g class="glow2" filter="url(#nvblur2)"><g clip-path="url(#nvshape)"><rect class="spin" x="-288" y="-288" width="1600" height="1600" fill="url(#nvg)"/></g></g>' +
      '<g clip-path="url(#nvshape)"><rect class="spin" x="-288" y="-288" width="1600" height="1600" fill="url(#nvg)"/></g>' +
      '<g clip-path="url(#nvshape)" style="mix-blend-mode:screen"><g class="sweep"><circle cx="512" cy="40" r="300" fill="url(#nvhl)" opacity="0.75"/></g></g>' +
    '</g></svg>';
  var ICO = {
    x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>',
    reset: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9"/><path d="M2.5 2.5v3h3"/></svg>',
    send: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8h10M8.5 3.5L13 8l-4.5 4.5"/></svg>'
  };

  /* ── state ── */
  var S = load();
  function load() {
    try { var s = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (s && s.msgs) return s; } catch (e) {}
    return { open: false, msgs: [], lead: {}, chips: [], mode: 'ai', pending: null, seen: false };
  }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ── mount ── */
  var root = document.createElement('div'); root.className = 'nv';
  root.innerHTML = RING_DEFS +
    '<div class="nv-launch" id="nv-launch"><span class="nv-launch__tip">Ask Nova</span>' +
      '<button class="nv-launch__btn" type="button" aria-label="Ask Nova, Innovent\'s assistant" aria-haspopup="dialog" aria-expanded="false">' + RING + '<span class="nv-launch__dot"></span></button></div>' +
    '<section class="nv-panel" id="nv-panel" role="dialog" aria-label="Nova, Innovent\'s assistant" aria-modal="false">' +
      '<div class="nv-head">' + RING + '<div class="nv-head__t"><div class="nv-head__name">Nova</div><div class="nv-head__sub" id="nv-sub"><b>●</b> Innovent guide</div></div>' +
        '<button class="nv-ib" type="button" id="nv-reset" title="Start over" aria-label="Start over">' + ICO.reset + '</button>' +
        '<button class="nv-ib" type="button" id="nv-close" title="Close" aria-label="Close Nova">' + ICO.x + '</button></div>' +
      '<div class="nv-log" id="nv-log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="nv-chips" id="nv-chips"></div>' +
      '<form class="nv-in" id="nv-form"><textarea id="nv-text" rows="1" placeholder="Ask Nova anything…" aria-label="Message Nova" maxlength="1500"></textarea>' +
        '<button class="nv-send" id="nv-send" type="submit" aria-label="Send">' + ICO.send + '</button></form>' +
      '<div class="nv-foot">Nova is an AI assistant and can make mistakes. Conversations are processed to answer you and are not stored after you leave.</div>' +
    '</section>';
  var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = ROOT + 'nova.css?v=20260927b';
  document.head.appendChild(css);
  var $ = function (id) { return root.querySelector('#' + id); };
  var log, chips, text, sendBtn, launch, panel, sub;
  function mount() { document.body.appendChild(root); init(); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  function init() {
    log = $('nv-log'); chips = $('nv-chips'); text = $('nv-text'); sendBtn = $('nv-send'); launch = $('nv-launch'); panel = $('nv-panel'); sub = $('nv-sub');
    launch.querySelector('button').addEventListener('click', open);
    $('nv-close').addEventListener('click', close);
    $('nv-reset').addEventListener('click', function () { S = { open: true, msgs: [], lead: {}, chips: [], mode: S.mode, pending: null, seen: true }; save(); render(); greet(); });
    $('nv-form').addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    text.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
    text.addEventListener('input', grow);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.open) close(); });
    chips.addEventListener('click', function (e) { var b = e.target.closest('.nv-chip'); if (b) { text.value = b.textContent; submit(); } });
    log.addEventListener('click', function (e) {
      var go = e.target.closest('[data-nv-go]'); if (go) { e.preventDefault(); navigate(JSON.parse(go.getAttribute('data-nv-go')), true); }
      var ho = e.target.closest('[data-nv-handoff]'); if (ho) { e.preventDefault(); handoff(JSON.parse(ho.getAttribute('data-nv-handoff'))); }
    });
    // any "Ask Nova" link on the site opens the panel
    document.addEventListener('click', function (e) { var a = e.target.closest('[data-nova-open]'); if (a) { e.preventDefault(); open(); } });

    render();
    if (S.mode === 'guided') setMode('guided');
    if (S.open) { open(true); } else if (!S.seen) { setTimeout(function () { launch.classList.add('nv-launch--tip'); }, 2200); setTimeout(function () { launch.classList.remove('nv-launch--tip'); }, 9000); }
    if (S.pending) { var p = S.pending; S.pending = null; save(); setTimeout(function () { highlight(p.section); }, 350); }
    prefillDemo();
  }

  /* ── open / close ── */
  function open(silent) {
    root.classList.add('nv--open'); S.open = true; S.seen = true; save();
    launch.querySelector('button').setAttribute('aria-expanded', 'true');
    if (!S.msgs.length) greet();
    scrollEnd(); if (!silent && window.innerWidth > 640) setTimeout(function () { text.focus(); }, 80);
    track('nova_open');
  }
  function close() { root.classList.remove('nv--open'); S.open = false; save(); launch.querySelector('button').setAttribute('aria-expanded', 'false'); }

  function greet() {
    var hello = 'Hi, I\'m Nova — Innovent\'s guide. I can explain what Innfini does, point you to the right page for your operation, or connect you with the team.';
    if (SLUG !== 'home' && TITLE) hello += '\n\nYou\'re on ' + TITLE + '. What are you trying to solve?';
    else hello += '\n\nWhat brings you here today?';
    push('a', hello, [], true);
    setChips(['Explore the Innfini platform', 'Command & Control', 'Smart Cities', 'Find my industry', 'Talk to the team']);
  }

  /* ── render ── */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/(https?:\/\/[^\s)]+)/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; });
  }
  function render() {
    log.innerHTML = '';
    S.msgs.forEach(function (m) { log.appendChild(bubble(m)); (m.actions || []).forEach(function (a) { var c = card(a, m); if (c) log.appendChild(c); }); });
    setChips(S.chips || [], true); scrollEnd(true);
  }
  function bubble(m) { var d = document.createElement('div'); d.className = 'nv-m nv-m--' + m.r; d.innerHTML = m.r === 'a' ? fmt(m.t) : esc(m.t); return d; }
  function card(a) {
    if (a.type === 'navigate') {
      var d = document.createElement('a'); d.className = 'nv-card'; d.href = ROOT + a.path + (a.section ? '#' : ''); d.setAttribute('data-nv-go', JSON.stringify(a));
      d.innerHTML = '<span class="nv-card__k">' + (a.section ? 'Section · ' + esc(a.section) : 'Page') + '</span><span class="nv-card__t">' + esc(a.title) + '</span>' +
        (a.why ? '<span class="nv-card__w">' + esc(a.why) + '</span>' : '<span class="nv-card__w">On innovent.io</span>') + '<span class="nv-card__go">Open →</span><span class="nv-card__bar"><i></i></span>';
      return d;
    }
    if (a.type === 'handoff') {
      var h = document.createElement('a'); h.className = 'nv-card'; h.href = '#'; h.setAttribute('data-nv-handoff', JSON.stringify(a));
      h.innerHTML = '<span class="nv-card__k">Hand-off</span><span class="nv-card__t">' + (a.form === 'book-call' ? 'Book a call with the team' : 'Request a demo') + '</span>' +
        '<span class="nv-card__w">' + (a.form === 'book-call' ? 'Thirty minutes, confirmed by email within one business day.' : 'A walkthrough on your systems and sites.') + '</span><span class="nv-card__go">Open →</span>';
      return h;
    }
    return null;
  }
  function push(r, t, actions, quiet) {
    var m = { r: r, t: t, actions: actions || [] }; S.msgs.push(m); if (S.msgs.length > 40) S.msgs.splice(0, S.msgs.length - 40); save();
    log.appendChild(bubble(m)); (m.actions).forEach(function (a) { var c = card(a); if (c) log.appendChild(c); });
    if (!quiet && !S.open) launch.classList.add('nv-launch--new');
    scrollEnd(); return m;
  }
  function setChips(list, quiet) { S.chips = list || []; if (S.err && S.mode === 'guided' && S.chips.length && S.chips.indexOf('Try again') < 0) S.chips = S.chips.concat(['Try again']); if (!quiet) save(); chips.innerHTML = S.chips.map(function (c) { return '<button class="nv-chip" type="button">' + esc(c) + '</button>'; }).join(''); scrollEnd(); }
  function scrollEnd(now) { if (!log) return; var f = function () { log.scrollTop = log.scrollHeight; }; f(); if (!now) { requestAnimationFrame(f); setTimeout(f, 80); setTimeout(f, 320); } }
  function grow() { text.style.height = 'auto'; text.style.height = Math.min(108, text.scrollHeight) + 'px'; }
  var typingEl = null;
  function busy(on) {
    root.classList.toggle('nv--busy', !!on); sendBtn.disabled = !!on;
    if (on && !typingEl) { typingEl = document.createElement('div'); typingEl.className = 'nv-m nv-m--a nv-typing'; typingEl.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(typingEl); scrollEnd(); }
    if (!on && typingEl) { typingEl.remove(); typingEl = null; }
  }
  function setMode(m) { S.mode = m; save(); sub.className = 'nv-head__sub' + (m === 'guided' ? ' is-guided' : ''); sub.innerHTML = m === 'guided' ? '<b>●</b> Guided mode' : '<b>●</b> Innovent guide'; }

  /* ── conversation ── */
  var inflight = false;
  function submit() {
    var v = (text.value || '').trim(); if (!v || inflight) return;
    text.value = ''; grow(); setChips([]);
    if (/^try again$/i.test(v) && S.msgs.length && S.msgs[S.msgs.length - 1].r === 'a') { if (S.mode === 'guided') setMode('ai'); return ask(); }
    push('u', v, [], true);
    if (S.mode === 'guided') return guided(v);
    ask();
  }
  function ask() {
    inflight = true; busy(true);
    var payload = { messages: S.msgs.map(function (m) { return { role: m.r === 'u' ? 'user' : 'assistant', content: m.t }; }), page: { slug: SLUG, title: TITLE }, lead: S.lead };
    var ctrl = window.AbortController ? new AbortController() : null; var tm = setTimeout(function () { if (ctrl) ctrl.abort(); }, 30000);
    fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl && ctrl.signal })
      .then(function (r) {
        if (r.status === 503 || r.status === 404) { return { fallback: true }; }
        return r.json().then(function (j) { j.__status = r.status; return j; }, function () { return { error: 'bad_json', __status: r.status }; });
      })
      .then(function (j) {
        clearTimeout(tm); inflight = false; busy(false);
        if (j.fallback) { setMode('guided'); return guided(lastUser()); }
        if (!j.reply) { S.err = true; setMode('guided'); return guided(lastUser()); }
        S.err = false; handle(j);
      })
      .catch(function () { clearTimeout(tm); inflight = false; busy(false); setMode('guided'); guided(lastUser()); });
  }
  function lastUser() { for (var i = S.msgs.length - 1; i >= 0; i--) if (S.msgs[i].r === 'u') return S.msgs[i].t; return ''; }
  function handle(j) {
    var actions = (j.actions || []).filter(function (a) { return a.type === 'navigate' || a.type === 'handoff'; });
    var sug = (j.actions || []).filter(function (a) { return a.type === 'suggest'; })[0];
    var nav = actions.filter(function (a) { return a.type === 'navigate'; })[0];
    var ho = actions.filter(function (a) { return a.type === 'handoff'; })[0];
    if (ho && ho.prefill) { ['name', 'email', 'company', 'topic'].forEach(function (k) { if (ho.prefill[k]) S.lead[k] = ho.prefill[k]; }); }
    push('a', j.reply, actions, true);
    setChips(sug ? sug.options : []);
    track('nova_reply', { nav: nav ? nav.slug : '', handoff: ho ? ho.form : '' });
    if (nav) setTimeout(function () { navigate(nav, false); }, 1400);
    else if (ho) setTimeout(function () { handoff(ho); }, 900);
  }

  /* ── navigation + highlight ── */
  function navigate(a, immediate) {
    var here = (a.slug === SLUG);
    var cards = log.querySelectorAll('[data-nv-go]'); var cardEl = cards[cards.length - 1]; if (cardEl && !immediate) cardEl.classList.add('nv-card--going');
    var go = function () {
      if (here) { if (a.section) highlight(a.section); else window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); return; }
      S.pending = a.section ? { section: a.section, slug: a.slug } : null; S.open = true; save();
      location.href = ROOT + a.path;
    };
    if (immediate || here) go(); else setTimeout(go, REDUCED ? 0 : 1300);
  }
  function highlight(section) {
    if (!section) return;
    var q = section.toLowerCase().replace(/\s+/g, ' ').trim(); var best = null, bestScore = 0;
    var hs = document.querySelectorAll('h1, h2, h3, h4, [class*="eyebrow"], [class*="kicker"]');
    for (var i = 0; i < hs.length; i++) {
      if (hs[i].closest('.nv')) continue;
      var t = (hs[i].textContent || '').toLowerCase().replace(/^\s*\/\/\s*/, '').replace(/^\s*\d{1,2}\s*[·:.-]\s*/, '').replace(/\s+/g, ' ').trim(); if (!t) continue;
      var sc = t === q ? 3 : (t.indexOf(q) >= 0 || q.indexOf(t) >= 0) ? 2 : overlap(t, q);
      if (sc > bestScore) { bestScore = sc; best = hs[i]; }
    }
    if (!best || bestScore < 0.5) return;
    var SEL = '[class*="split"], [class*="beat"], [class*="-row"], [class*="__dom"], [class*="section-head"], [class*="__hero"], article';
    var box = best.closest(SEL) || best.parentElement;
    if (box.parentElement && box.parentElement.matches(SEL)) box = box.parentElement;
    var y = box.getBoundingClientRect().top + window.pageYOffset - 84;
    window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
    box.classList.remove('nv-hl'); void box.offsetWidth; box.classList.add('nv-hl');
    setTimeout(function () { box.classList.remove('nv-hl'); }, 2800);
  }
  function overlap(a, b) { var A = a.split(' ').filter(function (w) { return w.length > 3; }), B = b.split(' ').filter(function (w) { return w.length > 3; }); if (!A.length || !B.length) return 0; var n = 0; B.forEach(function (w) { if (A.indexOf(w) >= 0) n++; }); return n / B.length; }

  /* ── hand-off to the site's own forms ── */
  function handoff(a) {
    var pre = Object.assign({}, S.lead, a.prefill || {});
    track('nova_handoff', { form: a.form });
    if (a.form === 'book-call') {
      var tries = 0; (function tryOpen() {
        var W = window.InnoventWidgets;
        if (W && typeof W.openBooking === 'function') {
          W.openBooking(launch.querySelector('button'));
          setTimeout(function () {
            fill('#bk-name', pre.name); fill('#bk-email', pre.email); fill('#bk-company', pre.company);
            if (pre.topic) fill('#bk-topic', pre.topic + '\n\n(via Nova)');
          }, 60);
          if (window.innerWidth <= 640) close();
        } else if (++tries < 30) setTimeout(tryOpen, 100);
        else { try { sessionStorage.setItem(KEY + '.prefill', JSON.stringify(pre)); } catch (e) {} location.href = ROOT + 'pages/request-demo.html'; }
      })();
      return;
    }
    try { sessionStorage.setItem(KEY + '.prefill', JSON.stringify(pre)); } catch (e) {}
    if (SLUG === 'request-demo') { prefillDemo(true); return; }
    S.open = true; save(); location.href = ROOT + 'pages/request-demo.html';
  }
  function fill(sel, v) { var el = document.querySelector(sel); if (el && v && !el.value) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } }
  function prefillDemo(force) {
    if (SLUG !== 'request-demo') return;
    var pre; try { pre = JSON.parse(sessionStorage.getItem(KEY + '.prefill') || 'null'); } catch (e) {}
    if (!pre) return; try { sessionStorage.removeItem(KEY + '.prefill'); } catch (e) {}
    var f = document.querySelector('form[name="request-demo"]'); if (!f) return;
    fill('form[name="request-demo"] [name="name"]', pre.name); fill('form[name="request-demo"] [name="email"]', pre.email); fill('form[name="request-demo"] [name="company"]', pre.company);
    if (pre.topic) fill('form[name="request-demo"] [name="notes"]', pre.topic + '\n\n(via Nova)');
    setTimeout(function () { f.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }); if (window.innerWidth <= 640) close(); }, force ? 0 : 400);
  }

  /* ── guided mode (no model available) ── */
  var KB = null;
  function kb(cb) {
    if (KB) return cb(KB);
    fetch(ROOT + 'nova-kb.json', { cache: 'force-cache' }).then(function (r) { return r.json(); }).then(function (j) { KB = j; cb(j); }).catch(function () { cb(null); });
  }
  var PATHS = {
    'explore the innfini platform': { slug: 'platform', reply: 'Innfini is the operational-intelligence layer: it fuses people, assets, locations, processes, sensors, AI and automation into one live picture, with actions taken under policy and logged.' },
    'command & control': { slug: 'command-control', reply: 'Command & Control covers public safety, ports, critical infrastructure, defense, venues and situational awareness — one operating picture across agencies and systems.' },
    'smart cities': { slug: 'smart-city', reply: 'Smart Cities brings mobility, public safety, environment, energy and civic operations onto one canvas.' },
    'talk to the team': { handoff: 'book-call', reply: 'Let\'s set that up — this opens our booking form and the team confirms a slot by email within one business day.' },
    'request a demo': { handoff: 'request-demo', reply: 'Here is the demo request form — tell us about your sites and systems and we tailor the walkthrough.' }
  };
  function guided(q) {
    var k = (q || '').toLowerCase().trim(); var p = PATHS[k];
    if (k === 'find my industry') {
      return kb(function (j) {
        var inds = j ? j.pages.filter(function (x) { return x.family === 'Industry'; }) : [];
        push('a', 'Which of these is closest to your operation?');
        setChips(inds.slice(0, 8).map(function (x) { return x.title.replace(/\s*[—–-].*$/, ''); }).concat(['Talk to the team']));
      });
    }
    if (p && p.slug) return kb(function (j) { var pg = j && j.pages.filter(function (x) { return x.slug === p.slug; })[0]; var nav = pg ? { type: 'navigate', slug: pg.slug, path: pg.path, title: pg.title } : null; push('a', p.reply, nav ? [nav] : []); setChips(['Find my industry', 'Talk to the team']); if (nav) setTimeout(function () { navigate(nav, false); }, 1400); });
    if (p && p.handoff) { var ho = { type: 'handoff', form: p.handoff, prefill: {} }; push('a', p.reply, [ho]); setChips([]); setTimeout(function () { handoff(ho); }, 900); return; }
    if (/demo|walkthrough/.test(k)) return guided('request a demo');
    if (/pric|cost|quote|call|sales|contact|human|person|team/.test(k)) return guided('talk to the team');
    kb(function (j) {
      if (!j) { push('a', 'I can\'t reach the site knowledge right now. The Request demo and Book a call buttons in the header reach the team directly.'); return setChips(['Talk to the team']); }
      var hits = search(j, k, 3);
      if (!hits.length) { push('a', 'I couldn\'t find that on the site. Try a sector or a capability — ports, public safety, asset tracking, computer vision — or ask the team directly.'); return setChips(['Find my industry', 'Command & Control', 'Talk to the team']); }
      var acts = hits.map(function (x) { return { type: 'navigate', slug: x.slug, path: x.path, title: x.title, why: x.description.slice(0, 90) }; });
      push('a', hits.length > 1 ? 'Here is what the site has on that — tap one and I\'ll take you there.' : 'This page covers that — taking you there.', acts);
      setChips(['Find my industry', 'Talk to the team']);
      if (hits.length === 1) setTimeout(function () { navigate(acts[0], false); }, 1400);
    });
  }
  function search(j, q, n) {
    var STOP = { the: 1, and: 1, for: 1, with: 1, what: 1, how: 1, about: 1, your: 1, you: 1, can: 1, does: 1, our: 1, are: 1, have: 1, need: 1, want: 1, tell: 1 };
    var words = q.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 2 && !STOP[w]; }).map(function (w) { return w.length > 4 ? w.replace(/(ies|es|s)$/, function (m) { return m === 'ies' ? 'y' : ''; }) : w; });
    if (!words.length) return [];
    return j.pages.map(function (p) {
      var t = (p.title + ' ' + p.family).toLowerCase(), d = (p.description + ' ' + (p.headings || []).join(' ')).toLowerCase(), b = (p.text || '').toLowerCase(); var s = 0;
      words.forEach(function (w) { if (t.indexOf(w) >= 0) s += 6; if (d.indexOf(w) >= 0) s += 3; if (b.indexOf(w) >= 0) s += 1; });
      if (p.family === 'Open role' || p.family === 'Office') s *= 0.5;
      return [s, p];
    }).filter(function (x) { return x[0] >= 4; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, n).map(function (x) { return x[1]; });
  }

  function track(ev, params) { try { var W = window.InnoventWidgets; if (W && W.track) W.track(ev, params || {}); } catch (e) {} }
  window.InnoventNova = { open: open, close: close, ask: function (q) { open(); text.value = q; submit(); } };
})();
