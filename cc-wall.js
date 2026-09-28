/* Innfini Command & Control · control-room wall + screen chassis
   Illustrative scenario only — a riverside mall, Zone 4. No live data. */
(function () {
  'use strict';
  var WALL = document.getElementById('ccwall');
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ASSETS = (WALL && WALL.getAttribute('data-assets')) || '../assets/product/';

  /* ───────────── helpers ───────────── */
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  var HEX = '0123456789abcdef';
  function hash(seed) { var s = seed * 2654435761 >>> 0, o = ''; for (var i = 0; i < 12; i++) { s = (s * 1103515245 + 12345) >>> 0; o += HEX[(s >>> 16) & 15]; } return o.slice(0, 4) + '…' + o.slice(8, 12); }
  var T0 = 18 * 3600 + 36 * 60 + 4; // 18:36:04 scenario clock
  function ts(sec) { var t = T0 + sec, hh = Math.floor(t / 3600) % 24, mm = Math.floor(t / 60) % 60, ss = t % 60; return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss; }
  function mmss(sec) { var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  // scripted elapsed seconds per stage (matches the benchmark table further down the page)
  var EL = { detect: 0, verify: 12, assess: 24, recommend: 50, approve: 62, dispatch: 91, debrief: 104 };

  /* ───────────── screen builders (inner box 320×200; map 650×410) ───────────── */
  var HD = function (label, right) { return '<div class="w-hd"><span class="w-hd__l"><i></i>' + label + '</span><span class="w-hd__r">' + (right || '') + '</span></div>'; };

  function buildFeed(el) {
    el.innerHTML = HD('Signal feed', 'ZONE 4 · 6 SOURCES') + '<div class="w-feed"></div>';
    var list = q('.w-feed', el);
    function row(t, tag, txt, cls) { var r = h('div', 'w-feed__row' + (cls ? ' ' + cls : ''), '<span class="w-feed__t">' + t + '</span><span class="w-feed__tag">' + tag + '</span><span class="w-feed__x">' + txt + '</span>'); list.insertBefore(r, list.firstChild); while (list.children.length > 7) list.removeChild(list.lastChild); }
    function reset() {
      list.innerHTML = '';
      row('18:33:40', 'TRAFFIC', 'Flow nominal · Corniche Rd');
      row('18:34:12', 'ACCESS', 'Gate 3 · 1,204 badge events today');
      row('18:35:02', 'WEATHER', '31°C · wind 9 kt NW');
      row('18:35:48', 'CAM', 'CAM-4-11 · healthy · 25 fps');
    }
    return { reset: reset, on: {
      detect: function () { row(ts(0), 'SMK-4-08', 'Smoke detected · Zone 4 · Level 2', 'is-alert'); },
      verify: function () { row(ts(7), 'CAM-4-12', 'Haze confirmed · 0.91', 'is-alert'); setTimeout(function () { row(ts(12), 'CORRELATE', '2 signals agree → INC-0007 opened', 'is-ok'); }, 1400); },
      assess: function () { row(ts(24), 'RISK', 'Occupancy 1,860 · asset critical · HIGH', 'is-warn'); },
      dispatch: function () { row(ts(91), 'DISPATCH', 'Engine-12 en route · Gate 3', 'is-ok'); },
      debrief: function () { row(ts(104), 'INC-0007', 'Contained · after-action ready', 'is-ok'); }
    } };
  }

  function buildCams(el) {
    var ids = ['CAM-4-11', 'CAM-4-12', 'CAM-4-15', 'CAM-G3'];
    el.innerHTML = HD('Camera wall', 'VMS · 4 OF 212') + '<div class="w-cams">' + ids.map(function (id, i) {
      return '<div class="w-cam w-cam--' + (i + 1) + '" style="background-image:url(' + ASSETS + ['cc-sa-hero.webp', 'cc-ad-hero.webp', 'cc-ve-hero.webp', 'cc-po-hero.webp'][i] + ')"><i class="w-cam__scan"></i><span class="w-cam__id">' + id + '</span><span class="w-cam__rec">REC</span><div class="w-cam__box"><span></span></div></div>';
    }).join('') + '</div>';
    var cams = qa('.w-cam', el);
    function reset() { cams.forEach(function (c) { c.className = c.className.replace(/ is-\w+/g, ''); }); q('.w-cam--2 .w-cam__box span', el).textContent = ''; q('.w-cam--4 .w-cam__box span', el).textContent = ''; }
    return { reset: reset, on: {
      detect: function () { cams[1].classList.add('is-watch'); },
      verify: function () { cams[1].classList.add('is-hit'); q('.w-cam--2 .w-cam__box span', el).textContent = 'HAZE 0.91'; },
      dispatch: function () { setTimeout(function () { cams[3].classList.add('is-track'); q('.w-cam--4 .w-cam__box span', el).textContent = 'ENGINE-12'; }, 2600); },
      debrief: function () { cams[1].classList.remove('is-hit'); cams[1].classList.add('is-clear'); }
    } };
  }

  function buildMap(el) {
    var W = 650, Hh = 410; el.classList.add('scr__in--svg');
    var streets = '';
    for (var x = 55; x < W; x += 65) streets += '<line x1="' + x + '" y1="30" x2="' + x + '" y2="' + Hh + '" class="m-st' + (x === 315 ? ' m-st--av' : '') + '"/>';
    for (var y = 60; y < Hh; y += 58) streets += '<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '" class="m-st' + (y === 234 ? ' m-st--av' : '') + '"/>';
    var blocks = '', seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var bx = 55; bx < W - 65; bx += 65) for (var by = 60; by < Hh - 58; by += 58) {
      if (bx > 360 && by > 250) continue; if (bx >= 380 - 65 && bx < 380 + 96 && by >= 150 - 58 && by < 150 + 78 && bx + 65 > 380 && by + 58 > 150) continue;
      var r = rnd();
      if (r < 0.12) { blocks += '<rect x="' + (bx + 6) + '" y="' + (by + 6) + '" width="53" height="46" rx="3" class="m-park"/>'; continue; }
      blocks += '<rect x="' + (bx + 6) + '" y="' + (by + 6) + '" width="53" height="46" rx="2" class="m-bl"/>';
      var n = 2 + Math.floor(rnd() * 4);
      for (var k = 0; k < n; k++) { var w = 10 + rnd() * 18, hh = 8 + rnd() * 16, x = bx + 9 + rnd() * (47 - w), y = by + 9 + rnd() * (40 - hh); blocks += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hh.toFixed(1) + '" class="m-bd' + (rnd() < 0.25 ? ' m-bd--lit' : '') + '"/>'; }
    }
    for (var d = 0; d < 26; d++) blocks += '<circle cx="' + (rnd() * W).toFixed(0) + '" cy="' + (60 + rnd() * (Hh - 80)).toFixed(0) + '" r="1.2" class="m-dot"/>';
    var route = 'M110 346 L110 264 L300 264 L300 236 L378 236';
    el.innerHTML = HD('Live map · Zone 4 · Riverside', '<span class="w-lay">LAYERS <b>8</b></span> <span class="w-ping">INC-0007</span>') +
      '<svg class="w-map" viewBox="0 0 ' + W + ' ' + Hh + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="mGlow" r="0.5"><stop offset="0" stop-color="#7dd3fc" stop-opacity=".25"/><stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="' + W + '" height="' + Hh + '" fill="#06101f"/>' +
      '<path d="M380 410 C 430 340, 520 320, 650 300 L650 410 Z" class="m-river"/>' +
      streets + blocks +
      '<rect x="380" y="150" width="96" height="78" rx="3" class="m-mall"/><g transform="translate(428 223)"><text class="m-lab" text-anchor="middle">RIVERSIDE MALL</text></g><g transform="translate(428 161)"><text class="m-lab m-lab--dim" text-anchor="middle">ZONE 4 · L2</text></g>' +
      '<g transform="translate(323 205) rotate(-90)"><text class="m-lab m-lab--st">AL SALAM ST</text></g><g transform="translate(8 230)"><text class="m-lab m-lab--st">CORNICHE RD</text></g>' +
      '<g transform="translate(70 50)"><text class="m-lab m-lab--dim">Z1</text></g><g transform="translate(330 50)"><text class="m-lab m-lab--dim">Z2</text></g><g transform="translate(70 290)"><text class="m-lab m-lab--dim">Z3</text></g><g transform="translate(600 50)"><text class="m-lab m-lab--dim">Z5</text></g>' +
      '<g class="m-sweep"><path d="M325 205 L325 -20 A225 225 0 0 1 480 40 Z" fill="url(#mGlow)"/></g>' +
      '<path d="' + route + '" class="m-route"/>' +
      '<g class="m-inc" transform="translate(425 189)"><circle r="26" class="m-inc__r1"/><circle r="14" class="m-inc__r2"/><circle r="5" class="m-inc__c"/><text x="32" y="3" class="m-lab m-lab--inc">SMK-4-08</text></g>' +
      '<g class="m-unit m-unit--p" transform="translate(560 90)"><circle r="6"/><text y="-11" text-anchor="middle">PATROL-22</text></g>' +
      '<g class="m-unit m-unit--a" transform="translate(200 80)"><circle r="6"/><text y="-11" text-anchor="middle">AMB-A1</text></g>' +
      '<g class="m-unit m-unit--e"><g transform="translate(110 346)"><circle r="7"/><text y="-12" text-anchor="middle">ENGINE-12</text></g></g>' +
      '<g class="m-mover" opacity="0"><circle r="7" class="m-mover__c"/><circle r="14" class="m-mover__h"/><animateMotion id="mMove" dur="6.2s" begin="indefinite" fill="freeze" path="' + route + '"/></g>' +
      '<g class="m-gate" transform="translate(378 236)"><rect x="-4" y="-4" width="8" height="8" rx="1"/><g transform="translate(10 4)"><text>GATE 3</text></g></g>' +
      '</svg><div class="w-map__st"><span class="w-map__k">STATUS</span><span class="w-map__v">MONITORING</span></div>';
    var svg = q('svg', el), st = q('.w-map__v', el), mover = q('.m-mover', el), motion = q('#mMove', el), unitE = q('.m-unit--e', el);
    function set(cls, v) { svg.className.baseVal = 'w-map ' + cls; st.textContent = v; }
    function reset() { set('', 'MONITORING'); mover.setAttribute('opacity', '0'); unitE.style.opacity = 1; try { motion.endElement(); } catch (e) {} }
    return { reset: reset, on: {
      detect: function () { set('is-detect', 'SIGNAL · ZONE 4'); },
      verify: function () { set('is-verify', '2 SIGNALS · INC-0007'); },
      assess: function () { set('is-assess', 'SEVERITY HIGH · EVAC-2'); },
      recommend: function () { set('is-recommend', 'ROUTE PROPOSED · 3 MIN'); },
      approve: function () { set('is-approve', 'APPROVED · DISPATCHING'); },
      dispatch: function () { set('is-dispatch', 'ENGINE-12 EN ROUTE'); mover.setAttribute('opacity', '1'); unitE.style.opacity = 0.25; try { motion.beginElement(); } catch (e) {} },
      debrief: function () { set('is-debrief', 'CONTAINED · 18:41'); }
    } };
  }

  function buildAI(el) {
    el.innerHTML = HD('Agent · recommendation', 'MODEL v2.4') +
      '<div class="w-ai"><div class="w-ai__inc"><b>INC-0007</b> Fire alarm · Riverside Mall · Zone 4 <span class="w-sev">HIGH</span></div>' +
      '<div class="w-ai__txt"><span class="w-ai__type"></span><i class="w-ai__cur"></i></div>' +
      '<div class="w-ai__ev"><span>SMK-4-08</span><span>CAM-4-12</span><span>EVAC-2</span><span>3 precedents</span></div>' +
      '<div class="w-ai__conf"><span class="w-ai__ck">CONFIDENCE</span><i class="w-ai__bar"><b></b></i><span class="w-ai__cv">—</span></div>' +
      '<div class="w-ai__btns"><span class="w-btn w-btn--ok">Approve dispatch</span><span class="w-btn">Escalate</span></div>' +
      '<div class="w-ai__stamp">APPROVED · A. RAHMAN · DISPATCHER · ' + ts(EL.approve) + '</div></div>';
    var box = q('.w-ai', el), typeEl = q('.w-ai__type', el), bar = q('.w-ai__bar b', el), cv = q('.w-ai__cv', el);
    var TXT = 'Dispatch Engine-12 via Al Salam St to Gate 3. Notify mall ops; begin EVAC-2 on Level 2. Nearest engine, 3 min, route clear.';
    var timer = null;
    function type(i) { typeEl.textContent = TXT.slice(0, i); if (i < TXT.length) timer = setTimeout(function () { type(i + 1); }, RM ? 0 : 22); }
    function reset() { clearTimeout(timer); box.className = 'w-ai'; typeEl.textContent = ''; bar.style.width = '0%'; cv.textContent = '—'; }
    return { reset: reset, on: {
      detect: function () { box.className = 'w-ai is-listen'; typeEl.textContent = ''; },
      assess: function () { box.className = 'w-ai is-think'; },
      recommend: function () { box.className = 'w-ai is-draft'; type(0); var n = 0, iv = setInterval(function () { n += 4; if (n >= 92) { n = 92; clearInterval(iv); } bar.style.width = n + '%'; cv.textContent = '0.' + n; }, RM ? 0 : 60); },
      approve: function () { box.className = 'w-ai is-draft is-approved'; },
      debrief: function () { box.className = 'w-ai is-draft is-approved is-closed'; }
    } };
  }

  function buildSOP(el) {
    var steps = ['Confirm two independent signals', 'Notify mall operations desk', 'Dispatch nearest available engine', 'Evacuate Zone 4 · Level 2', 'Field confirmation · close'];
    el.innerHTML = HD('SOP match', '214 PROCEDURES') + '<div class="w-sop"><div class="w-sop__search"><i></i>Searching procedures…</div><div class="w-sop__hit"><b>EVAC-2</b> Fire alarm · retail · occupied</div><ol class="w-sop__steps">' + steps.map(function (s) { return '<li><i></i>' + s + '</li>'; }).join('') + '</ol></div>';
    var box = q('.w-sop', el), li = qa('li', el);
    function tick(i) { if (li[i]) li[i].classList.add('is-done'); }
    function reset() { box.className = 'w-sop'; li.forEach(function (l) { l.className = ''; }); }
    return { reset: reset, on: {
      detect: function () { box.className = 'w-sop is-search'; },
      assess: function () { box.className = 'w-sop is-match'; setTimeout(function () { tick(0); }, 900); },
      dispatch: function () { tick(1); setTimeout(function () { tick(2); }, 1200); setTimeout(function () { tick(3); }, 4200); },
      debrief: function () { tick(4); box.classList.add('is-complete'); }
    } };
  }

  function buildLedger(el) {
    el.innerHTML = HD('Audit ledger', 'APPEND-ONLY · SHA-256') + '<div class="w-led"><div class="w-led__list"></div><div class="w-led__ft"><span class="w-led__n">0417 entries</span><span class="w-led__ok">CHAIN VERIFIED · 0 GAPS</span></div></div>';
    var list = q('.w-led__list', el), box = q('.w-led', el), n = 417;
    function add(kind, who, sec) { n++; var r = h('div', 'w-led__row', '<span class="w-led__i">#' + n + '</span><span class="w-led__h">' + hash(n) + '</span><span class="w-led__k">' + kind + '</span><span class="w-led__w">' + who + '</span><span class="w-led__t">' + ts(sec) + '</span>'); list.appendChild(r); while (list.children.length > 6) list.removeChild(list.firstChild); q('.w-led__n', el).textContent = n + ' entries'; }
    function reset() { list.innerHTML = ''; n = 417; box.className = 'w-led'; add('HEARTBEAT', 'system', -140); add('SIGNAL', 'CAM-4-11', -70); }
    return { reset: reset, on: {
      detect: function () { add('SIGNAL', 'SMK-4-08', 0); },
      verify: function () { add('SIGNAL', 'CAM-4-12', 7); setTimeout(function () { add('INCIDENT', 'correlator', 12); }, 1400); },
      recommend: function () { add('RECOMMEND', 'agent v2.4 · 0.92', EL.recommend); },
      approve: function () { add('APPROVAL', 'a.rahman · dispatcher', EL.approve); box.classList.add('is-write'); },
      dispatch: function () { add('DISPATCH', 'ENGINE-12', EL.dispatch); },
      debrief: function () { add('RESOLVE', 'field · confirmed', EL.debrief); box.className = 'w-led is-verified'; }
    } };
  }

  function buildUnits(el) {
    var U = [['ENGINE-12', 'Fire', 'AVAILABLE', '3 min'], ['PATROL-22', 'Police', 'AVAILABLE', '2 min'], ['AMB-A1', 'EMS', 'ON CALL', '5 min'], ['ENGINE-7', 'Fire', 'BUSY', '—'], ['MALL-SEC', 'Site', 'ON SITE', '0 min']];
    el.innerHTML = HD('Responders', 'ROLE-AWARE DISPATCH') + '<div class="w-un">' + U.map(function (u, i) { return '<div class="w-un__row w-un__row--' + i + '"><span class="w-un__id">' + u[0] + '</span><span class="w-un__ty">' + u[1] + '</span><span class="w-un__st">' + u[2] + '</span><span class="w-un__eta">' + u[3] + '</span></div>'; }).join('') + '</div>';
    var r0 = q('.w-un__row--0', el), st = q('.w-un__st', r0), eta = q('.w-un__eta', r0), iv = null, secs = 178;
    function reset() { clearInterval(iv); r0.className = 'w-un__row w-un__row--0'; st.textContent = 'AVAILABLE'; eta.textContent = '3 min'; secs = 178; }
    return { reset: reset, on: {
      recommend: function () { r0.className = 'w-un__row w-un__row--0 is-pick'; st.textContent = 'PROPOSED'; },
      approve: function () { st.textContent = 'ASSIGNED'; },
      dispatch: function () { r0.className = 'w-un__row w-un__row--0 is-go'; st.textContent = 'EN ROUTE'; eta.textContent = mmss(secs); clearInterval(iv); iv = setInterval(function () { secs = Math.max(0, secs - 7); eta.textContent = mmss(secs); if (!secs) clearInterval(iv); }, 250); },
      debrief: function () { clearInterval(iv); r0.className = 'w-un__row w-un__row--0 is-scene'; st.textContent = 'ON SCENE'; eta.textContent = '00:00'; }
    } };
  }

  function buildAgencies(el) {
    var A = ['Civil Defence', 'Police', 'EMS', 'Municipality', 'Mall operations'];
    el.innerHTML = HD('Agency comms', 'MCPTT · SMS · CAD-TO-CAD') + '<div class="w-ag">' + A.map(function (a) { return '<div class="w-ag__row"><i></i><span class="w-ag__n">' + a + '</span><span class="w-ag__s">STANDBY</span></div>'; }).join('') + '<div class="w-ag__ft"><span>CROSS-AGENCY NOTIFY</span><b>—</b></div></div>';
    var rows = qa('.w-ag__row', el), ft = q('.w-ag__ft b', el), tm = [];
    function reset() { tm.forEach(clearTimeout); tm = []; rows.forEach(function (r) { r.className = 'w-ag__row'; q('.w-ag__s', r).textContent = 'STANDBY'; }); ft.textContent = '—'; }
    return { reset: reset, on: {
      assess: function () { rows[4].className = 'w-ag__row is-pre'; q('.w-ag__s', rows[4]).textContent = 'ALERTED'; },
      dispatch: function () { rows.forEach(function (r, i) { tm.push(setTimeout(function () { r.className = 'w-ag__row is-sent'; q('.w-ag__s', r).textContent = 'NOTIFIED ' + ts(EL.dispatch + 2 + i * 2).slice(3); }, 500 + i * 550)); }); tm.push(setTimeout(function () { ft.textContent = '9 s'; }, 3400)); },
      debrief: function () { rows.forEach(function (r) { r.classList.add('is-ack'); }); }
    } };
  }

  function buildKPI(el) {
    var R = [['Signal → confirmed incident', 'verify', '12 s'], ['Incident → first recommendation', 'recommend', '38 s'], ['Recommendation → dispatch', 'dispatch', '41 s'], ['Cross-agency notification', 'dispatch', '9 s'], ['After-action report', 'debrief', 'Same shift']];
    el.innerHTML = HD('Response clock', 'MEASURED') + '<div class="w-kpi"><div class="w-kpi__big"><span class="w-kpi__k">T+</span><b class="w-kpi__v">00:00</b><span class="w-kpi__s">SINCE FIRST SIGNAL</span></div><div class="w-kpi__rows">' + R.map(function (r) { return '<div class="w-kpi__row" data-st="' + r[1] + '"><span>' + r[0] + '</span><b>' + r[2] + '</b></div>'; }).join('') + '</div></div>';
    var v = q('.w-kpi__v', el), rows = qa('.w-kpi__row', el), cur = 0, iv = null;
    function roll(to) { clearInterval(iv); iv = setInterval(function () { if (cur >= to) { cur = to; clearInterval(iv); } else cur += Math.max(1, Math.ceil((to - cur) / 12)); v.textContent = mmss(cur); }, 90); }
    function mark(st) { rows.forEach(function (r) { if (r.getAttribute('data-st') === st) r.classList.add('is-on'); }); }
    function reset() { clearInterval(iv); cur = 0; v.textContent = '00:00'; rows.forEach(function (r) { r.className = 'w-kpi__row'; }); }
    var on = {}; Object.keys(EL).forEach(function (k) { on[k] = function () { roll(EL[k]); mark(k); }; });
    return { reset: reset, on: on };
  }

  function buildImage(file, label, sub, ov) {
    return function (el) {
      el.innerHTML = HD(label, sub) + '<div class="w-img"><img src="' + ASSETS + file + '" alt="" loading="lazy" decoding="async"><i class="w-img__scan"></i>' + (ov || '') + '</div>';
      return { reset: function () {}, on: {} };
    };
  }

  /* ───────────── screen catalogue ───────────── */
  var SCREENS = [
    { id: 'feed', t: 'Signal feed', k: 'Situational awareness', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildFeed, d: 'Every sensor, camera, access-control event and weather feed arrives on one timeline. Correlation groups independent signals into a single candidate incident instead of six separate alarms.' },
    { id: 'cams', t: 'Camera wall', k: 'Situational awareness', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildCams, d: 'ONVIF cameras and VMS streams with edge analytics. When a detector fires, the nearest cameras are pulled forward automatically and vision confirms or rejects the signal.' },
    { id: 'map', t: 'Live map', k: 'Situational awareness', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildMap, w: 650, hh: 410, d: 'The geo-temporal canvas. Incidents, responders, routes, zones and layers on one map — the proposed route is drawn before anyone moves, and the unit is tracked once dispatch is approved.' },
    { id: 'ai', t: 'Agent recommendation', k: 'Agentic dispatch', page: 'cc-agentic-dispatch.html', pt: 'Agentic Dispatch', build: buildAI, d: 'The agent drafts the next-best action with the evidence it rests on, the matching SOP and a confidence value. Nothing executes until a named operator approves — and the approval is written to the ledger.' },
    { id: 'sop', t: 'SOP match', k: 'Operational workflows', page: 'command-control.html#lifecycle', pt: 'Incident lifecycle', build: buildSOP, d: 'The matching standard operating procedure is attached automatically and tracked step by step, so SOP compliance is measured rather than assumed.' },
    { id: 'ledger', t: 'Audit ledger', k: 'Audited & sovereign', page: 'cc-audited-sovereign.html', pt: 'Audited & Sovereign', build: buildLedger, d: 'Append-only, cryptographically chained. Every signal, recommendation, approval and dispatch is written with actor, timestamp and originating evidence — and the chain verifies itself.' },
    { id: 'units', t: 'Responders', k: 'Agentic dispatch', page: 'cc-agentic-dispatch.html', pt: 'Agentic Dispatch', build: buildUnits, d: 'Role-aware dispatch. Units are ranked by availability and ETA; the chosen unit moves from proposed to assigned to en route, with the ETA counting down on the same screen.' },
    { id: 'agencies', t: 'Agency comms', k: 'Multi-agency', page: 'command-control.html#agencies', pt: 'Agency coordination', build: buildAgencies, d: 'Partner agencies keep their own systems. What they share is a common operating picture, a shared incident clock and one notification that reaches all of them in seconds.' },
    { id: 'kpi', t: 'Response clock', k: 'Benchmarks', page: 'command-control.html#benchmarks', pt: 'Response-time benchmarks', build: buildKPI, d: 'Each stage is timed against the stopwatch. The figures shown are the indicative benchmarks from the table further down this page.' },
    { id: 'cop', t: 'Common operating picture', k: 'Situational awareness', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildImage('cc-sa-cop.webp', 'Common operating picture', 'ALL AGENCIES · LIVE', '<b class="w-ov w-ov--r" style="left:69%;top:26%"></b>'), d: 'The same live picture for every role and every agency — active incidents, responders and layers on one canvas.' },
    { id: 'playback', t: 'Event playback', k: 'Situational awareness', page: 'cc-situational-awareness.html', pt: 'Situational Awareness', build: buildImage('cc-sa-playback.webp', 'Event playback', 'DETECTED · ASSIGNED · RESOLVED', '<b class="w-ov w-ov--run" style="left:8%;right:8%;bottom:14%"></b>'), d: 'Scrub back through any incident — what was known, when, and who decided what — without reconstructing it from five systems.' },
    { id: 'policies', t: 'Action policies', k: 'Agentic dispatch', page: 'cc-agentic-dispatch.html', pt: 'Agentic Dispatch', build: buildImage('cc-ad-policies.webp', 'Action policies', 'AUTO · ATTENDED · SUPERVISED · BLOCKED', '<b class="w-ov w-ov--hl" style="left:64%;top:29%;width:31%;height:15%"></b>'), d: 'Per action type, how much autonomy the agent has: pre-approved routine tasks run automatically; anything consequential waits for one or two named humans; some actions never automate.' },
    { id: 'port', t: 'Port · yard & gate', k: 'Ports & logistics', page: 'cc-ports.html', pt: 'Ports & Logistics', build: buildImage('cc-po-yard.webp', 'Port · yard & gate', 'TERMINAL OPS', '<b class="w-ov w-ov--r" style="left:47%;top:41%"></b>'), d: 'The same loop on a container terminal — gate events, yard moves, dwell and exceptions on one canvas.' },
    { id: 'venue', t: 'Venue · crowd flow', k: 'Stadium & venue ops', page: 'cc-venues.html', pt: 'Stadium & Venue Ops', build: buildImage('cc-ve-crowd.webp', 'Venue · crowd flow', 'DENSITY · EGRESS', '<b class="w-ov w-ov--r" style="left:46%;top:45%"></b>'), d: 'Crowd density, egress and security posture for stadiums and venues, run from the same command platform.' },
    { id: 'scada', t: 'SCADA · sensor fusion', k: 'Critical infrastructure', page: 'cc-critical-infra.html', pt: 'Critical Infrastructure', build: buildImage('cc-ci-scada.webp', 'SCADA · sensor fusion', 'OPC-UA · MODBUS · MQTT', '<b class="w-ov w-ov--run" style="left:6%;right:38%;bottom:22%"></b>'), d: 'Energy, water and pipelines — SCADA telemetry fused with cameras and access control, with runbooks instead of guesswork.' }
  ];
  var STAGES = [
    { id: 'detect', t: 'Detect', d: 5200, f: ['feed', 'cams', 'map'], c: 'A smoke detector fires in Zone 4. The nearest cameras are pulled forward automatically.' },
    { id: 'verify', t: 'Verify', d: 5200, f: ['cams', 'feed', 'map'], c: 'Camera vision confirms haze. Two independent signals agree — INC-0007 is opened 12 s after the first signal.' },
    { id: 'assess', t: 'Assess', d: 5000, f: ['sop', 'kpi', 'cop', 'agencies'], c: 'Risk is scored from occupancy, asset criticality and precedent. SOP EVAC-2 is attached; mall operations are alerted.' },
    { id: 'recommend', t: 'Recommend', d: 6800, f: ['ai', 'map', 'policies', 'units'], c: 'The agent drafts the response with cited evidence and a confidence value. The route is drawn before anyone moves.' },
    { id: 'approve', t: 'Approve', d: 4600, f: ['ai', 'ledger'], c: 'A named dispatcher approves. The approval is written to the ledger with identity, time and reasoning.' },
    { id: 'dispatch', t: 'Dispatch', d: 8400, f: ['units', 'map', 'agencies', 'cams'], c: 'Engine-12 rolls. Five agencies are notified in 9 s and the Gate 3 camera tracks the unit in.' },
    { id: 'debrief', t: 'Debrief', d: 7000, f: ['ledger', 'kpi', 'playback'], c: 'Contained. The audit chain verifies itself and the after-action record is ready the same shift.' }
  ];

  /* ───────────── build the wall ───────────── */
  var API = {};
  if (WALL) {
    var grid = q('.wall__grid', WALL), stepper = q('.wall__steps', WALL), clock = q('.wall__clock', WALL);
    stepper.innerHTML = STAGES.map(function (s, i) { return '<span class="wall__step" data-st="' + s.id + '"><i>' + (i + 1) + '</i>' + s.t + '</span>'; }).join('');
    var tiles = {};
    SCREENS.forEach(function (s) {
      var tile = h('div', 'scr scr--' + s.id + (s.w ? ' scr--big' : ''));
      tile.style.setProperty('--iw', s.w || 320); tile.style.setProperty('--ih', s.hh || 200);
      tile.setAttribute('role', 'button'); tile.setAttribute('tabindex', '0'); tile.setAttribute('aria-label', s.t + ' — zoom');
      tile.dataset.id = s.id;
      var inner = h('div', 'scr__in');
      tile.appendChild(inner);
      tile.appendChild(h('span', 'scr__tag', s.t));
      grid.appendChild(tile);
      s.api = s.build(inner); s.api.reset();
      tiles[s.id] = tile;
    });
    // scale inner boxes to tile width
    function fit() { SCREENS.forEach(function (s) { var t = tiles[s.id]; t.style.setProperty('--s', (t.clientWidth / (s.w || 320)).toFixed(4)); }); }
    fit(); window.addEventListener('resize', fit); if (window.ResizeObserver) new ResizeObserver(fit).observe(grid);

    // real clock
    (function tick() { var d = new Date(); clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return (n < 10 ? '0' : '') + n; }).join(':'); setTimeout(tick, 1000); })();

    // scenario engine
    var idx = -1, timer = null, running = false, visible = false;
    function setStage(i) {
      idx = i; var st = STAGES[i];
      WALL.setAttribute('data-stage', st.id);
      qa('.wall__step', stepper).forEach(function (e, j) { e.className = 'wall__step' + (j < i ? ' is-done' : j === i ? ' is-now' : ''); });
      SCREENS.forEach(function (s) { tiles[s.id].classList.toggle('is-focus', st.f.indexOf(s.id) >= 0); var fn = s.api.on[st.id]; if (fn) fn(); });
      q('.wall__now', WALL).textContent = st.t;
      var cap = q('.wall__cap span', WALL); if (cap) { cap.classList.remove('is-in'); cap.textContent = st.c; void cap.offsetWidth; cap.classList.add('is-in'); }
    }
    function resetAll() { SCREENS.forEach(function (s) { s.api.reset(); tiles[s.id].classList.remove('is-focus'); }); WALL.removeAttribute('data-stage'); qa('.wall__step', stepper).forEach(function (e) { e.className = 'wall__step'; }); var cap = q('.wall__cap span', WALL); if (cap) { cap.textContent = 'Standing by — one incident, seven steps, every decision on the record.'; cap.classList.add('is-in'); } }
    // click a step: jump there, hold, then resume
    stepper.addEventListener('click', function (e) { var st = e.target.closest('.wall__step'); if (!st) return; var i = qa('.wall__step', stepper).indexOf(st); stop(); resetAll(); for (var k = 0; k <= i; k++) setStage(k); timer = setTimeout(function () { running = true; next(); }, 9000); });
    function next() {
      if (!running) return;
      var i = idx + 1;
      if (i >= STAGES.length) { WALL.classList.add('is-reset'); timer = setTimeout(function () { resetAll(); WALL.classList.remove('is-reset'); idx = -1; timer = setTimeout(next, 600); }, 900); return; }
      setStage(i); timer = setTimeout(next, RM ? 2500 : STAGES[i].d);
    }
    function start() { if (running) return; running = true; if (idx < 0) resetAll(); timer = setTimeout(next, 900); }
    function stop() { running = false; clearTimeout(timer); }
    function sync() { if (visible && !document.hidden) start(); else stop(); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(WALL); else { visible = true; sync(); }
    document.addEventListener('visibilitychange', sync);

    // zoom
    var zoom = null;
    function openZoom(id) {
      var s = SCREENS.filter(function (x) { return x.id === id; })[0]; if (!s) return;
      closeZoom();
      zoom = h('div', 'wall-zoom', '<div class="wall-zoom__bd"></div><div class="wall-zoom__card" role="dialog" aria-modal="true" aria-label="' + s.t + '"><div class="wall-zoom__hd"><span class="wall-zoom__k">' + s.k + '</span><button class="wall-zoom__x" type="button" aria-label="Close">×</button></div><div class="wall-zoom__scr" style="--iw:' + (s.w || 320) + ';--ih:' + (s.hh || 200) + '"></div><h3 class="wall-zoom__t">' + s.t + '</h3><p class="wall-zoom__d">' + s.d + '</p><div class="wall-zoom__btns"><a class="btn btn--primary" href="' + s.page + '">Open ' + s.pt + ' →</a><button class="btn btn--secondary wall-zoom__close" type="button">Back to the wall</button></div></div></div>');
      var holder = q('.wall-zoom__scr', zoom), clone = q('.scr__in', tiles[id]).cloneNode(true); holder.appendChild(clone);
      document.body.appendChild(zoom); document.body.classList.add('wall-zoom-open');
      function fitZ() { holder.style.setProperty('--s', (holder.clientWidth / (s.w || 320)).toFixed(4)); }
      fitZ(); zoom._fit = fitZ; window.addEventListener('resize', fitZ);
      qa('.wall-zoom__x,.wall-zoom__close,.wall-zoom__bd', zoom).forEach(function (b) { b.addEventListener('click', closeZoom); });
      requestAnimationFrame(function () { zoom.classList.add('is-in'); q('.wall-zoom__x', zoom).focus(); });
    }
    function closeZoom() { if (!zoom) return; window.removeEventListener('resize', zoom._fit); var z = zoom; zoom = null; z.classList.remove('is-in'); document.body.classList.remove('wall-zoom-open'); setTimeout(function () { if (z.parentNode) z.parentNode.removeChild(z); }, 260); }
    grid.addEventListener('click', function (e) { var t = e.target.closest('.scr'); if (t) openZoom(t.dataset.id); });
    grid.addEventListener('keydown', function (e) { var t = e.target.closest('.scr'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openZoom(t.dataset.id); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeZoom(); });
    API.openZoom = openZoom; API.setStage = setStage; API.stages = STAGES; API.stop = stop; API.start = start; API.reset = resetAll;
  }

  /* ───────────── page sections as screens ───────────── */
  var scrs = qa('.cc-scr');
  if (scrs.length) {
    // benchmark bars
    qa('.cc-scr--benchmarks tr').forEach(function (tr) { var c = tr.cells; if (!c || c.length < 4) return; var m = /−(\d+)%/.exec(c[3].textContent); if (m) { c[3].insertAdjacentHTML('beforeend', '<i class="cc-bar" style="--w:' + m[1] + '%"><b></b></i>'); } });
    function powerOn(el) { if (!el.classList.contains('is-on')) { el.classList.add('is-on'); } }
    function sweep() { var vh = window.innerHeight || 800; scrs.forEach(function (s) { if (s.classList.contains('is-on')) return; var r = s.getBoundingClientRect(); if (r.top < vh * 0.88 && r.bottom > 0 || r.bottom <= 0) powerOn(s); }); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.bottom < 0) { powerOn(e.target); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      scrs.forEach(function (s) { io.observe(s); });
    }
    var sc = null; window.addEventListener('scroll', function () { if (sc) return; sc = setTimeout(function () { sc = null; sweep(); }, 120); }, { passive: true });
    sweep(); setTimeout(sweep, 600);
  }
  window.InnoventWall = API;
})();
