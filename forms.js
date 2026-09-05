/* ─────────────────────────────────────────────────────────────
   Innovent · form delivery

   Static hosting has no backend, so before this file the demo form called
   preventDefault() and rendered its success screen WITHOUT sending anything —
   every lead was silently discarded. That is the bug this fixes.

   Two delivery paths, chosen by configuration rather than by page:

   1. ENDPOINT set   → POST JSON there (Formspree, HubSpot, a Cloudflare
                       Worker, your CRM's inbound webhook).
   2. ENDPOINT null  → POST url-encoded to the current path including
                       `form-name`, which Netlify Forms captures with no extra
                       configuration, provided the <form> carries
                       data-netlify="true" and a name (Netlify detects forms in
                       the static HTML at deploy time).

   A failure is always SURFACED to the visitor with a mailto fallback, never
   swallowed. Losing a government procurement enquiry to a network blip is a
   worse outcome than showing an error.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var CONFIG = {
    /* Set this when the form service is chosen. Leave null to use Netlify Forms. */
    ENDPOINT: null,

    /* Shown as the fallback if delivery fails. careers@ and press@ are the
       addresses already published on the site; CONFIRM this one before launch. */
    FALLBACK_EMAIL: 'hello@innovent.io',

    TIMEOUT_MS: 12000
  };

  function encode(obj) {
    return Object.keys(obj).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k] == null ? '' : obj[k]);
    }).join('&');
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error('timeout')); }, ms);
      })
    ]);
  }

  /* Resolves { ok: true } or { ok: false, error: string } — never throws, so a
     caller can always decide what to show. */
  function submit(formName, data) {
    var payload = {};
    Object.keys(data).forEach(function (k) { payload[k] = data[k]; });
    payload['form-name'] = formName;
    payload['submitted-at'] = new Date().toISOString();
    payload['page'] = location.pathname;

    var request;
    if (CONFIG.ENDPOINT) {
      request = fetch(CONFIG.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      request = fetch(location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(payload)
      });
    }

    return withTimeout(request, CONFIG.TIMEOUT_MS).then(function (res) {
      if (res && (res.ok || res.status === 200 || res.status === 303)) return { ok: true };
      return { ok: false, error: 'Server responded ' + (res ? res.status : 'unknown') };
    }).catch(function (err) {
      return { ok: false, error: err && err.message === 'timeout' ? 'Request timed out' : 'Network error' };
    });
  }

  /* A mailto that carries the answers, so a failed submission is still a lead. */
  function mailtoFallback(subject, data) {
    var lines = Object.keys(data).filter(function (k) { return data[k]; })
      .map(function (k) { return k + ': ' + data[k]; });
    return 'mailto:' + CONFIG.FALLBACK_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  window.InnoventForms = {
    config: CONFIG,
    submit: submit,
    mailtoFallback: mailtoFallback
  };
})();
