/* ─────────────────────────────────────────────────────────────
   Innovent · site widgets — booking and the chat agent

   Both are OFF until an ID is filled in below, and both fail closed: an empty
   value means the button never renders and no third-party script is loaded, so
   shipping this file unconfigured changes nothing about the site.

   Set CALENDLY once and every "Book a call" placement on the site points at it.
   Set CHATBASE_ID and the agent appears on all 112 pages.

   Consent: the chat widget is third-party and sets its own storage, so it
   waits for the site's cookie banner to report consent rather than loading on
   sight. If consent is declined it never loads.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var CONFIG = {
    /* Ali's Calendly profile rather than one event type, so the visitor picks
       the meeting length. Leave '' to hide the booking buttons entirely. */
    CALENDLY: 'https://calendly.com/alifotovat',

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
     Any element carrying data-innv-book becomes a booking link. Elements are
     hidden while CALENDLY is empty so an unconfigured site shows no dead
     button. */
  function wireBooking() {
    var els = document.querySelectorAll('[data-innv-book]');
    if (!els.length) return;
    var url = calendlyUrl();
    for (var i = 0; i < els.length; i++) {
      /* display is set explicitly as well as the hidden attribute: .btn sets
         display with !important, so the attribute alone loses and the button
         renders as a dead control. */
      if (!url) { els[i].hidden = true; els[i].style.display = 'none'; continue; }
      els[i].hidden = false; els[i].style.removeProperty('display');
      if (els[i].tagName === 'A') {
        els[i].setAttribute('href', url);
        els[i].setAttribute('target', '_blank');
        els[i].setAttribute('rel', 'noopener');
      } else {
        els[i].addEventListener('click', function () {
          window.open(url, '_blank', 'noopener');
        });
      }
    }
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

  ready(function () { wireBooking(); wireChat(); wireMeasurement(); });

  window.InnoventWidgets = {
    config: CONFIG,
    calendlyUrl: calendlyUrl,
    loadChat: loadChat,
    track: track
  };
})();
