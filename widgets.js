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
    /* e.g. 'https://calendly.com/ali-innovent/30min' — leave '' to hide the
       booking buttons entirely. */
    CALENDLY: '',

    /* The chatbot ID from Chatbase → Connect → Embed. Leave '' for no agent. */
    CHATBASE_ID: '',

    /* Chat is a marketing/analytics-class third party. 'analytics' matches the
       category the cookie banner already asks about; set to null to load it
       without waiting for consent (not recommended for EU/UK visitors). */
    CHAT_CONSENT_CATEGORY: 'analytics'
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
      if (!url) { els[i].hidden = true; continue; }
      els[i].hidden = false;
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

  ready(function () { wireBooking(); wireChat(); });

  window.InnoventWidgets = {
    config: CONFIG,
    calendlyUrl: calendlyUrl,
    loadChat: loadChat
  };
})();
