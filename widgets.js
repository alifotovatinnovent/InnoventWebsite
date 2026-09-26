/* ─────────────────────────────────────────────────────────────
   Innovent · site widgets — booking and the chat agent

   Both are OFF until an ID is filled in below, and both fail closed: an empty
   value means the button never renders and no third-party script is loaded, so
   shipping this file unconfigured changes nothing about the site.

   Every "Book a call" placement opens the site's own booking dialog (no Calendly).
   Set CHATBASE_ID and the agent appears on all 112 pages.

   Consent: the chat widget is third-party and sets its own storage, so it
   waits for the site's cookie banner to report consent rather than loading on
   sight. If consent is declined it never loads.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var CONFIG = {
    /* No third-party scheduler: "Book a call" is the site's own dialog (below).
       Kept for the enquiry form's optional "book a time" button; '' hides it. */
    CALENDLY: '',

    /* The chatbot ID from Chatbase → Connect → Embed. Leave '' for no agent. */
    CHATBASE_ID: '',

    /* Chat is a marketing/analytics-class third party. 'analytics' matches the
       category the cookie banner already asks about; set to null to load it
       without waiting for consent (not recommended for EU/UK visitors). */
    CHAT_CONSENT_CATEGORY: 'analytics',

    /* Google Tag Manager container, e.g. 'GTM-XXXXXXX'. One container is the
       whole measurement stack: GA4, Clarity and anything after it get deployed
       inside GTM rather than by editing 114 pages again. Leave '' for none. */
    GTM_ID: ''
  };

  function calendlyUrl() {
    return CONFIG.CALENDLY || '';
  }

  /* ── booking ────────────────────────────────────────────────────────────
     "Book a call" is our own form, not a third-party scheduler: any element
     carrying data-innv-book opens a dialog styled like the enquiry form. The
     request is captured by Netlify Forms (form name "book-call", registered by
     the static copy in index.html) and emailed to the notification address;
     the team confirms the slot by email. */
  var BOOK_HTML =
    '<div class="bk" id="innv-book" role="dialog" aria-modal="true" aria-labelledby="bk-title" hidden>' +
      '<div class="bk__backdrop" data-bk-close></div>' +
      '<div class="bk__card">' +
        '<button class="bk__x" type="button" aria-label="Close" data-bk-close>&times;</button>' +
        '<form class="bk__form" id="bk-form" name="book-call" method="POST" novalidate>' +
          '<input type="hidden" name="form-name" value="book-call">' +
          '<p hidden aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>' +
          '<div class="bk__eyebrow">Book a call</div>' +
          '<h3 id="bk-title">Pick a time that suits you</h3>' +
          '<p class="bk__lead">Thirty minutes with our team, on your agenda. We confirm the slot by email within one business day.</p>' +
          '<div class="bk__row">' +
            '<div class="bk__field"><label for="bk-name">Full name</label><input class="bk__input" id="bk-name" name="name" type="text" autocomplete="name" placeholder="Ada Lovelace" required></div>' +
            '<div class="bk__field"><label for="bk-email">Work email</label><input class="bk__input" id="bk-email" name="email" type="email" autocomplete="email" placeholder="ada@company.com" required></div>' +
          '</div>' +
          '<div class="bk__row">' +
            '<div class="bk__field"><label for="bk-company">Company</label><input class="bk__input" id="bk-company" name="company" type="text" autocomplete="organization" placeholder="Company"></div>' +
            '<div class="bk__field"><label for="bk-phone">Phone <span>optional</span></label><input class="bk__input" id="bk-phone" name="phone" type="tel" autocomplete="tel" placeholder="+971 …"></div>' +
          '</div>' +
          '<div class="bk__row">' +
            '<div class="bk__field"><label for="bk-date">Preferred date</label><input class="bk__input" id="bk-date" name="date" type="date" required></div>' +
            '<div class="bk__field"><label for="bk-slot">Preferred time <span>GST, UTC+4</span></label>' +
              '<select class="bk__input" id="bk-slot" name="slot">' +
                '<option>09:00 – 11:00</option><option>11:00 – 13:00</option><option selected>14:00 – 16:00</option><option>16:00 – 18:00</option><option>Other — tell us below</option>' +
              '</select></div>' +
          '</div>' +
          '<div class="bk__field"><label for="bk-topic">What should we cover? <span>optional</span></label>' +
            '<textarea class="bk__input" id="bk-topic" name="topic" rows="3" placeholder="Sites, systems, the problem you want gone…"></textarea></div>' +
          '<div class="bk__msg" id="bk-msg" role="alert" hidden></div>' +
          '<button class="btn btn--primary bk__submit" type="submit" id="bk-submit">Request this slot' +
            '<svg class="arrow" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>' +
          '</button>' +
          '<p class="bk__fine">No account, no scheduler pop-up. Your details go to our team only.</p>' +
        '</form>' +
      '</div>' +
    '</div>';

  var bookEl = null, bookOpener = null;

  function encodeForm(obj) {
    return Object.keys(obj).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k] == null ? '' : obj[k]);
    }).join('&');
  }

  function mountBooking() {
    if (bookEl) return bookEl;
    var host = document.createElement('div');
    host.innerHTML = BOOK_HTML;
    bookEl = host.firstChild;
    document.body.appendChild(bookEl);

    var form = bookEl.querySelector('#bk-form');
    var msg = bookEl.querySelector('#bk-msg');
    var date = bookEl.querySelector('#bk-date');
    var d = new Date(); d.setDate(d.getDate() + 1);
    date.min = d.toISOString().slice(0, 10);

    Array.prototype.forEach.call(bookEl.querySelectorAll('[data-bk-close]'), function (b) {
      b.addEventListener('click', closeBooking);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !bookEl.hidden) closeBooking();
    });

    function say(text, kind) {
      msg.textContent = text; msg.className = 'bk__msg bk__msg--' + kind; msg.hidden = false;
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.name) data[el.name] = el.value.trim ? el.value.trim() : el.value;
      });
      if (!data.name || !data.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email) || !data.date) {
        say('Please add your name, a work email and a preferred date.', 'err'); return;
      }
      if (data['bot-field']) return;
      data['submitted-at'] = new Date().toISOString();
      data['page'] = location.pathname;

      var btn = form.querySelector('#bk-submit'); var label = btn.innerHTML;
      msg.hidden = true; btn.disabled = true; btn.textContent = 'Sending…';
      track('booking_submit', {});

      var timer = new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 12000); });
      var req = fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encodeForm(data) });
      Promise.race([req, timer]).then(function (res) {
        if (!(res && (res.ok || res.status === 200 || res.status === 303))) throw new Error('Server responded ' + (res ? res.status : 'unknown'));
        track('booking_request', {});
        form.innerHTML =
          '<div class="bk__eyebrow">Booked &mdash; pending confirmation</div>' +
          '<h3>Thank you, ' + escapeHtml(data.name.split(' ')[0]) + '.</h3>' +
          '<p class="bk__lead">We have your request for <strong>' + escapeHtml(niceDate(data.date)) + '</strong>, ' + escapeHtml(data.slot) + '. ' +
          'A calendar invitation will reach <strong>' + escapeHtml(data.email) + '</strong> within one business day.</p>' +
          '<p class="bk__fine">Need it sooner? Call <a href="tel:+971564457947">+971 56 445 7947</a>.</p>' +
          '<button class="btn btn--secondary bk__submit" type="button" data-bk-close>Done</button>';
        form.querySelector('[data-bk-close]').addEventListener('click', closeBooking);
      }).catch(function (err) {
        btn.disabled = false; btn.innerHTML = label;
        var lines = Object.keys(data).filter(function (k) { return data[k] && k !== 'form-name' && k !== 'bot-field'; })
          .map(function (k) { return k + ': ' + data[k]; }).join('\n');
        say('That did not send (' + (err.message === 'timeout' ? 'request timed out' : err.message) + '). ', 'err');
        var a = document.createElement('a');
        a.href = 'mailto:info@innovent.io?subject=' + encodeURIComponent('Call request from innovent.io') + '&body=' + encodeURIComponent(lines);
        a.textContent = 'Email us the request instead';
        msg.appendChild(a);
      });
    });
    return bookEl;
  }

  function niceDate(iso) {
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function openBooking(opener) {
    var el = mountBooking();
    bookOpener = opener || document.activeElement;
    el.hidden = false;
    document.documentElement.classList.add('bk-open');
    var first = el.querySelector('#bk-name');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }

  function closeBooking() {
    if (!bookEl) return;
    bookEl.hidden = true;
    document.documentElement.classList.remove('bk-open');
    if (bookOpener && bookOpener.focus) bookOpener.focus();
  }

  function wireBooking() {
    var els = document.querySelectorAll('[data-innv-book]');
    for (var i = 0; i < els.length; i++) {
      els[i].hidden = false; els[i].style.removeProperty('display');
      if (els[i].tagName === 'A') { els[i].setAttribute('href', '#book-a-call'); els[i].removeAttribute('target'); }
      els[i].addEventListener('click', function (ev) { ev.preventDefault(); openBooking(this); });
    }
    if (location.hash === '#book-a-call') openBooking();
  }

  /* ── chat agent ─────────────────────────────────────────────────────────
     Loaded once, after consent. The embed is Chatbase's documented snippet;
     swapping vendor means replacing this function and nothing else. */
  var chatLoaded = false;
  function loadChat() {
    if (chatLoaded || !CONFIG.CHATBASE_ID) return;
    chatLoaded = true;
    window.chatbaseConfig = { chatbotId: CONFIG.CHATBASE_ID };
    var s = document.createElement('script');
    s.src = 'https://www.chatbase.co/embed.min.js';
    s.id = CONFIG.CHATBASE_ID;
    s.defer = true;
    document.body.appendChild(s);
  }

  /* The consent banner publishes its decision; until it does, nothing loads.
     Both the event and the already-granted case are handled, because a
     returning visitor's consent is restored before this script runs. */
  function wireChat() {
    if (!CONFIG.CHATBASE_ID) return;
    var cat = CONFIG.CHAT_CONSENT_CATEGORY;
    if (!cat) { loadChat(); return; }

    /* consent.js publishes window.InnoventConsent.get() -> { essential,
       analytics, marketing, decidedAt } and fires 'innovent:consent' on every
       decision. A returning visitor's choice is restored before this runs, so
       both the already-granted case and the event are handled. */
    var c = window.InnoventConsent;
    if (c && typeof c.get === 'function' && c.get()[cat]) { loadChat(); return; }

    document.addEventListener('innovent:consent', function (e) {
      if (e && e.detail && e.detail[cat]) loadChat();
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ── measurement ────────────────────────────────────────────────────────
     The site measured nothing: no GA4, no tag manager, no session analytics.
     Rather than hard-code one vendor into 114 pages, this loads GTM — after
     Analytics consent, same rule as the chat agent — and pushes a named event
     for every action worth counting. The team then wires GA4 and anything else
     inside GTM without touching the site again. */
  var gtmLoaded = false;
  function loadGtm() {
    if (gtmLoaded || !CONFIG.GTM_ID) return;
    gtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.GTM_ID);
    document.head.appendChild(s);
  }

  /* Queued whether or not GTM is live, so nothing is lost while it is being
     set up and so a different vendor can read the same queue later. */
  function track(name, detail) {
    window.dataLayer = window.dataLayer || [];
    var e = { event: name, page_path: location.pathname };
    if (detail) for (var k in detail) if (detail.hasOwnProperty(k)) e[k] = detail[k];
    window.dataLayer.push(e);
  }

  /* One delegated listener rather than a handler per button: new CTAs are
     measured automatically as long as they are links or buttons. */
  function wireTracking() {
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a, button');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var label = (a.textContent || '').trim().slice(0, 60);

      if (a.hasAttribute('data-innv-book'))            return track('booking_click', { label: label });
      if (/calendly\.com/.test(href))                  return track('booking_click', { label: label });
      if (/request-demo/.test(href))                   return track('demo_request_click', { label: label });
      if (/^mailto:/.test(href))                       return track('email_click', { email_to: href.slice(7, 60) });
      if (/^tel:/.test(href))                          return track('phone_click', {});
      if (/\/cs-/.test(href))                          return track('case_study_open', { label: label });
      if (/trust|privacy|terms/.test(href))            return track('trust_page_click', { label: label });
      if (/platform-architecture|cap-|plat-/.test(href)) return track('architecture_click', { label: label });
      if (/\/pt-|product\.html/.test(href))            return track('product_tour_click', { label: label });
      if (/\.(pdf|docx?|xlsx?|pptx?|zip)$/i.test(href)) return track('file_download', { file: href.split('/').pop() });
    }, true);

    /* Form intent: first keystroke is the start, delivery is the conversion.
       Started-but-not-submitted is the number worth watching. */
    ['ctab-form', 'rq-form'].forEach(function (id) {
      var f = document.getElementById(id);
      if (!f) return;
      var started = false;
      f.addEventListener('input', function () {
        if (started) return;
        started = true;
        track('form_start', { form_id: id });
      });
      f.addEventListener('submit', function () { track('form_submit', { form_id: id }); });
    });
  }

  function wireMeasurement() {
    if (!CONFIG.GTM_ID) { wireTracking(); return; }   /* queue events regardless */
    var c = window.InnoventConsent;
    if (c && typeof c.get === 'function' && c.get().analytics) loadGtm();
    else document.addEventListener('innovent:consent', function (e) {
      if (e && e.detail && e.detail.analytics) loadGtm();
    });
    wireTracking();
  }

  /* ── Nova, the site's own assistant ─────────────────────────────────────
     First-party (our Netlify Function, sessionStorage only, no cookies), so it
     does not wait for consent. One script, loaded once, on every page. */
  function loadNova() {
    if (document.querySelector('script[data-innv-nova]')) return;
    var IN_PAGES = /\/pages\/[^/]*$/.test(location.pathname);
    var s = document.createElement('script');
    s.src = (IN_PAGES ? '../' : '/') + 'nova.js?v=20260927c';
    s.defer = true; s.setAttribute('data-innv-nova', '');
    document.head.appendChild(s);
  }

  ready(function () { wireBooking(); wireChat(); wireMeasurement(); loadNova(); });

  window.InnoventWidgets = {
    config: CONFIG,
    calendlyUrl: calendlyUrl,
    loadChat: loadChat,
    openBooking: openBooking,
    track: track
  };
})();
