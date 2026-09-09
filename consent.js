/* ═══════════════════════════════════════════════════════════════════════════
   Innovent · cookie consent
   ---------------------------------------------------------------------------
   Self-contained: injects its own styles, so a page only needs this one script.
   Included from pages/_chrome.js for every sub-page, and directly by index.html.

   The site currently sets no analytics or advertising cookies at all. This is
   the gate for when it does: anything added later is declared with

       <script type="text/plain" data-consent="analytics" data-src="..."></script>

   and stays inert until the visitor allows that category. Nothing here fires a
   tracker on its own, and the copy says only what is actually true today.

   Refusing is exactly as easy as accepting — one button, same size, same row —
   which is what the GDPR and UK PECR require and what the closing X does too.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var NAME    = 'innv_consent';
  var VERSION = 1;            // bump to re-ask when the categories change
  var DAYS    = 180;

  var CATEGORIES = [
    { id: 'essential', name: 'Strictly necessary', locked: true,
      desc: 'Remembers this cookie choice and keeps the site working. It is a single first-party cookie and cannot be switched off.' },
    { id: 'analytics', name: 'Analytics', locked: false,
      desc: 'Would let us count visits and see which pages are read, so we can improve them. Nothing of this kind is running today — this switch is here so it cannot start without your say-so.' },
    { id: 'marketing', name: 'Marketing', locked: false,
      desc: 'Would let us measure campaigns and show relevant ads elsewhere. Nothing of this kind is running today either.' }
  ];

  /* ── storage ─────────────────────────────────────────────────────────── */

  function readCookie(n) {
    var m = document.cookie.match('(?:^|; )' + n.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }
  function writeCookie(n, v, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = n + '=' + encodeURIComponent(v) + '; expires=' + d.toUTCString() +
                      '; path=/; SameSite=Lax' + secure;
  }

  var state = null;
  function load() {
    try {
      var raw = readCookie(NAME);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || o.v !== VERSION) return null;   // categories changed — ask again
      return o;
    } catch (e) { return null; }
  }
  function save(prefs) {
    state = {
      v: VERSION,
      ts: new Date().toISOString(),
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing
    };
    writeCookie(NAME, JSON.stringify(state), DAYS);
    release();
    document.dispatchEvent(new CustomEvent('innovent:consent', { detail: api.get() }));
  }

  /* ── the gate ────────────────────────────────────────────────────────── */
  /* Scripts parked as type="text/plain" are activated once their category is
     allowed. Re-running is harmless: each node is marked as it is released. */
  function release() {
    if (!state) return;
    var parked = document.querySelectorAll('script[type="text/plain"][data-consent]');
    Array.prototype.forEach.call(parked, function (node) {
      var cat = node.getAttribute('data-consent');
      if (!state[cat]) return;
      var s = document.createElement('script');
      Array.prototype.forEach.call(node.attributes, function (a) {
        if (a.name === 'type' || a.name === 'data-consent' || a.name === 'data-src') return;
        s.setAttribute(a.name, a.value);
      });
      if (node.getAttribute('data-src')) s.src = node.getAttribute('data-src');
      else s.text = node.textContent;
      node.parentNode.replaceChild(s, node);
    });
  }

  /* ── where trust.html lives, from wherever we are ────────────────────── */
  function policyHref() {
    var inPages = /\/pages\//.test(location.pathname);
    return (inPages ? 'trust.html' : 'pages/trust.html') + '#cookies';
  }

  /* ── styles ──────────────────────────────────────────────────────────── */

  var CSS = [
    '.cq,.cq *{box-sizing:border-box}',
    '.cq{position:fixed;left:0;right:0;bottom:0;z-index:9000;font-family:var(--font-body,Inter,system-ui,sans-serif);',
      'background:rgba(9,13,22,.97);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);',
      'border-top:1px solid rgba(125,211,252,.22);box-shadow:0 -24px 60px -30px rgba(0,0,0,.9);',
      'transform:translateY(100%);transition:transform .42s cubic-bezier(.22,1,.36,1)}',
    '.cq.is-in{transform:translateY(0)}',
    '.cq__in{max-width:1280px;margin:0 auto;padding:22px 32px 24px;display:grid;',
      'grid-template-columns:minmax(0,1fr) auto;gap:28px 40px;align-items:center}',
    '.cq__h{font-family:var(--font-display,Sora,system-ui,sans-serif);font-size:15px;font-weight:600;',
      'color:var(--ink-100,#f1f5f9);margin:0 0 8px;letter-spacing:-.005em}',
    '.cq__p{font-size:13.5px;line-height:1.6;color:var(--ink-70,#94a3b8);margin:0;max-width:78ch}',
    '.cq__p a,.cq__link{color:#7dd3fc;text-decoration:underline;text-underline-offset:2px}',
    '.cq__p a:hover,.cq__link:hover{color:#bfe9ff}',
    '.cq__acts{display:flex;gap:10px;align-items:center;flex-wrap:wrap}',
    /* all three actions are the same size and weight — refusing must not be
       harder than accepting */
    '.cq__b{font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:13px;font-weight:600;',
      'padding:11px 20px;border-radius:3px;cursor:pointer;white-space:nowrap;border:1px solid transparent;',
      'transition:background .18s ease,border-color .18s ease,color .18s ease}',
    '.cq__b--a{background:#7dd3fc;color:#08121f;border-color:#7dd3fc}',
    '.cq__b--a:hover{background:#a5e0ff;border-color:#a5e0ff}',
    '.cq__b--r{background:transparent;color:#e2e8f0;border-color:rgba(255,255,255,.28)}',
    '.cq__b--r:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.5)}',
    '.cq__b--p{background:transparent;color:#94a3b8;border-color:transparent;padding-left:8px;padding-right:8px;text-decoration:underline;text-underline-offset:3px}',
    '.cq__b--p:hover{color:#e2e8f0}',
    '.cq__x{position:absolute;top:12px;right:14px;width:30px;height:30px;display:flex;align-items:center;',
      'justify-content:center;background:none;border:0;color:#64748b;cursor:pointer;border-radius:3px;font-size:18px;line-height:1}',
    '.cq__x:hover{color:#e2e8f0;background:rgba(255,255,255,.06)}',
    '.cq :focus-visible,.cqm :focus-visible{outline:2px solid #7dd3fc;outline-offset:2px}',

    /* preference centre */
    '.cqm{position:fixed;inset:0;z-index:9100;display:flex;align-items:center;justify-content:center;padding:24px;',
      'background:rgba(4,7,13,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
      'font-family:var(--font-body,Inter,system-ui,sans-serif);opacity:0;transition:opacity .25s ease}',
    '.cqm.is-in{opacity:1}',
    '.cqm__box{width:min(660px,100%);max-height:min(86vh,760px);display:flex;flex-direction:column;',
      'background:#0a0f1a;border:1px solid rgba(125,211,252,.2);border-radius:4px;',
      'box-shadow:0 40px 100px -40px rgba(0,0,0,.95)}',
    '.cqm__hd{padding:24px 28px 18px;border-bottom:1px solid rgba(255,255,255,.09);display:flex;',
      'align-items:flex-start;justify-content:space-between;gap:16px}',
    '.cqm__t{font-family:var(--font-display,Sora,system-ui,sans-serif);font-size:19px;font-weight:600;',
      'color:#f1f5f9;margin:0 0 7px;letter-spacing:-.012em}',
    '.cqm__s{font-size:13px;line-height:1.55;color:#94a3b8;margin:0;max-width:62ch}',
    '.cqm__body{padding:6px 28px;overflow-y:auto;flex:1}',
    '.cqm__row{padding:20px 0;border-bottom:1px solid rgba(255,255,255,.07);display:grid;',
      'grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:start}',
    '.cqm__row:last-child{border-bottom:0}',
    '.cqm__n{font-size:14px;font-weight:600;color:#f1f5f9;margin:0 0 6px}',
    '.cqm__d{font-size:12.5px;line-height:1.55;color:#94a3b8;margin:0}',
    '.cqm__lock{font-family:var(--font-mono,ui-monospace,monospace);font-size:9.5px;letter-spacing:.16em;',
      'text-transform:uppercase;color:#64748b;white-space:nowrap;padding-top:4px}',
    '.cqm__sw{position:relative;width:44px;height:24px;flex:0 0 auto;border:0;padding:0;cursor:pointer;',
      'border-radius:999px;background:rgba(255,255,255,.14);transition:background .2s ease}',
    '.cqm__sw[aria-checked="true"]{background:#7dd3fc}',
    '.cqm__sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;',
      'background:#0a0f1a;transition:transform .2s cubic-bezier(.22,1,.36,1)}',
    '.cqm__sw[aria-checked="true"]::after{transform:translateX(20px)}',
    '.cqm__ft{padding:18px 28px 22px;border-top:1px solid rgba(255,255,255,.09);display:flex;',
      'gap:10px;justify-content:flex-end;flex-wrap:wrap}',

    '@media (max-width:900px){',
      '.cq__in{grid-template-columns:1fr;gap:20px;padding:20px 20px 22px}',
      '.cq__more{display:none}',
      '.cq__acts{width:100%}',
      '.cq__b--a,.cq__b--r{flex:1 1 auto;text-align:center}',
      '.cqm__row{grid-template-columns:1fr;gap:12px}',
      '.cqm__hd,.cqm__body,.cqm__ft{padding-left:20px;padding-right:20px}',
      '.cqm__ft .cq__b{flex:1 1 auto;text-align:center}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
      '.cq,.cqm,.cqm__sw::after{transition:none!important}',
    '}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('cq-css')) return;
    var st = document.createElement('style');
    st.id = 'cq-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ── banner ──────────────────────────────────────────────────────────── */

  var banner = null;

  function showBanner() {
    if (banner) return;
    injectCSS();
    banner = document.createElement('section');
    banner.className = 'cq';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<button class="cq__x" type="button" aria-label="Close and decline non-essential cookies">&times;</button>' +
      '<div class="cq__in">' +
        '<div>' +
          '<h2 class="cq__h">Cookies on innovent.io</h2>' +
          '<p class="cq__p">We use one cookie, and only to remember the choice you make here. ' +
          'We run no analytics and no advertising cookies on this site today.' +
          '<span class="cq__more"> If that ever changes, nothing will load until you allow it, ' +
          'and you can change your mind at any time from the footer.</span> ' +
          '<a href="' + policyHref() + '">Cookie policy</a>.</p>' +
        '</div>' +
        '<div class="cq__acts">' +
          '<button class="cq__b cq__b--a" type="button" data-cq="accept">Accept all</button>' +
          '<button class="cq__b cq__b--r" type="button" data-cq="reject">Reject all</button>' +
          '<button class="cq__b cq__b--p" type="button" data-cq="prefs">Preferences</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('is-in'); });

    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cq]');
      if (b) {
        if (b.dataset.cq === 'accept') { save({ analytics: true,  marketing: true  }); hideBanner(); }
        if (b.dataset.cq === 'reject') { save({ analytics: false, marketing: false }); hideBanner(); }
        if (b.dataset.cq === 'prefs')  { openModal(); }
        return;
      }
      /* dismissing is a refusal, never a silent acceptance */
      if (e.target.closest('.cq__x')) { save({ analytics: false, marketing: false }); hideBanner(); }
    });
  }

  function hideBanner() {
    if (!banner) return;
    var el = banner; banner = null;
    el.classList.remove('is-in');
    setTimeout(function () { el.remove(); }, 460);
  }

  /* ── preference centre ───────────────────────────────────────────────── */

  var modal = null, lastFocus = null;

  function openModal() {
    if (modal) return;
    injectCSS();
    lastFocus = document.activeElement;
    var cur = state || { analytics: false, marketing: false };

    modal = document.createElement('div');
    modal.className = 'cqm';
    modal.innerHTML =
      '<div class="cqm__box" role="dialog" aria-modal="true" aria-labelledby="cqm-t">' +
        '<div class="cqm__hd">' +
          '<div>' +
            '<h2 class="cqm__t" id="cqm-t">Cookie preferences</h2>' +
            '<p class="cqm__s">Only the first category is in use on innovent.io today. The other two are listed so that ' +
            'your choice is already on record if we ever add them.</p>' +
          '</div>' +
          '<button class="cq__x" type="button" data-cq="close" aria-label="Close preferences" style="position:static">&times;</button>' +
        '</div>' +
        '<div class="cqm__body">' +
          CATEGORIES.map(function (c) {
            return '<div class="cqm__row">' +
              '<div><p class="cqm__n">' + c.name + '</p><p class="cqm__d">' + c.desc + '</p></div>' +
              (c.locked
                ? '<span class="cqm__lock">Always on</span>'
                : '<button class="cqm__sw" type="button" role="switch" data-cat="' + c.id + '" ' +
                  'aria-checked="' + (cur[c.id] ? 'true' : 'false') + '" ' +
                  'aria-label="' + c.name + '"></button>') +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="cqm__ft">' +
          '<button class="cq__b cq__b--r" type="button" data-cq="reject">Reject all</button>' +
          '<button class="cq__b cq__b--a" type="button" data-cq="save">Save choices</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    requestAnimationFrame(function () { modal.classList.add('is-in'); });

    var box = modal.querySelector('.cqm__box');
    box.querySelector('.cq__x').focus();

    modal.addEventListener('click', function (e) {
      var sw = e.target.closest('.cqm__sw');
      if (sw) {
        sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
        return;
      }
      var b = e.target.closest('[data-cq]');
      if (b) {
        if (b.dataset.cq === 'close') { closeModal(); return; }
        if (b.dataset.cq === 'reject') { save({ analytics: false, marketing: false }); }
        if (b.dataset.cq === 'save') {
          var out = {};
          Array.prototype.forEach.call(box.querySelectorAll('.cqm__sw'), function (s) {
            out[s.dataset.cat] = s.getAttribute('aria-checked') === 'true';
          });
          save(out);
        }
        closeModal(); hideBanner(); return;
      }
      if (e.target === modal) closeModal();     // click the scrim
    });

    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab') return;
      var f = box.querySelectorAll('button');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function closeModal() {
    if (!modal) return;
    var el = modal; modal = null;
    el.classList.remove('is-in');
    setTimeout(function () { el.remove(); }, 280);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ── public API ──────────────────────────────────────────────────────── */

  var api = {
    get: function () {
      return state
        ? { essential: true, analytics: !!state.analytics, marketing: !!state.marketing, decidedAt: state.ts }
        : { essential: true, analytics: false, marketing: false, decidedAt: null };
    },
    has: function (cat) { return cat === 'essential' ? true : !!(state && state[cat]); },
    open: openModal,
    /* clears the record and asks again — for testing, and for a "withdraw
       consent" control if one is ever needed */
    reset: function () {
      writeCookie(NAME, '', -1);
      state = null;
      showBanner();
    },
    onChange: function (fn) {
      document.addEventListener('innovent:consent', function (e) { fn(e.detail); });
    }
  };
  window.InnoventConsent = api;

  /* ── boot ────────────────────────────────────────────────────────────── */

  function boot() {
    state = load();
    if (state) release();
    else showBanner();

    /* any control anywhere can reopen the centre */
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-cookie-prefs]');
      if (t) { e.preventDefault(); openModal(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
