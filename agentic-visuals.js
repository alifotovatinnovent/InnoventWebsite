/* ─────────────────────────────────────────────────────────────
   Innfini · Agentic Orchestration — animated figures
   Mounted on [data-ao-fig="…"]:
     loop     · the plan/act/explain cycle, animated
     gate     · the policy guardrail, actions sorted live
     autonomy · the four autonomy modes as a ladder
     ledger   · the decision audit trace
     agents   · multi-agent contention on the object graph
   Conventions shared with the other renderers: a MIN_U type floor
   so nothing renders below ~9px, layout derived from measured
   text, and each drawing stamps its own aspect ratio.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var NET = '#7dd3fc', OK = '#6ee7b7', AI = '#c4b5fd', WARN = '#fbbf24', CRIT = '#fb7185';
  var INK = 'rgba(230,240,251,0.92)', INK2 = 'rgba(169,189,214,0.62)', INK3 = 'rgba(113,133,158,0.85)';

  var MIN_U = 9.4;
  function txt(x, y, s, o) {
    o = o || {};
    var fs = Math.max(o.size || 9, MIN_U);
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + fs +
      '" letter-spacing="' + (o.ls || '0.08em') + '" fill="' + (o.fill || INK2) + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }
  function adv(fs, ls) { return fs * 0.6 + fs * (ls || 0); }
  function strW(s, fs, ls) { return s.length * adv(Math.max(fs || MIN_U, MIN_U), ls || 0); }

  function finish(svg, s, W, H) {
    svg.style.aspectRatio = W + ' / ' + H;
    svg.style.width = '100%';
    svg.style.height = 'auto';
    var host = svg.parentNode;
    if (host && host.classList && host.classList.contains('mk__canvas')) host.style.aspectRatio = W + ' / ' + H;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  /* ── 1 · the decision loop, animated ── */
  function figLoop(svg) {
    var W = 900, H = 430, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(24, 30, 'THE AGENT LOOP · ONE CYCLE, UNDER 1 SECOND', { size: 10, fill: AI, ls: '0.18em', w: 700 });
    s += txt(24, 47, 'EVERY PASS PRODUCES A PLAN, A POLICY VERDICT AND AN AUDIT RECORD', { size: 9.4, fill: INK3, ls: '0.05em' });

    var STEPS = [
      { id: 'PERCEIVE', ms: '40 ms',  note: 'graph + live state', c: NET },
      { id: 'PLAN',     ms: '310 ms', note: 'HTN grounds the LLM', c: AI },
      { id: 'CHECK',    ms: '18 ms',  note: 'typed policy gate',   c: WARN },
      { id: 'ACT',      ms: '95 ms',  note: 'typed tool calls',    c: OK },
      { id: 'EXPLAIN',  ms: '22 ms',  note: 'reasoning trace',     c: NET },
      { id: 'LEARN',    ms: 'async',  note: 'overrides feed back', c: INK3 }
    ];

    /* ring geometry */
    var CX = W / 2, CY = 244, RX = 300, RY = 118;
    s += '<ellipse cx="' + CX + '" cy="' + CY + '" rx="' + RX + '" ry="' + RY +
      '" fill="none" stroke="' + AI + '" stroke-opacity="0.16" stroke-width="1.2" stroke-dasharray="4 6"/>';

    /* the travelling token — one full lap per cycle */
    var lap = 'M' + (CX + RX) + ',' + CY +
      ' A' + RX + ',' + RY + ' 0 1 1 ' + (CX - RX) + ',' + CY +
      ' A' + RX + ',' + RY + ' 0 1 1 ' + (CX + RX) + ',' + CY;
    s += '<circle r="5" fill="' + AI + '" opacity="0.95">' +
      '<animateMotion dur="6s" repeatCount="indefinite" path="' + lap + '"/></circle>';
    s += '<circle r="12" fill="' + AI + '" opacity="0.18">' +
      '<animateMotion dur="6s" repeatCount="indefinite" path="' + lap + '"/></circle>';

    STEPS.forEach(function (st, i) {
      var a = -Math.PI / 2 + (i / STEPS.length) * Math.PI * 2;
      var x = CX + Math.cos(a) * RX, y = CY + Math.sin(a) * RY;
      var w = Math.max(strW(st.id, 10.5, 0.14), strW(st.note, 9.4, 0.02)) + 26;
      var h = 46;
      s += '<rect x="' + (x - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h +
        '" rx="4" fill="#0a1424" stroke="' + st.c + '" stroke-opacity="0.55" stroke-width="1.1"/>';
      s += txt(x, y - 8, st.id, { size: 10.5, anchor: 'middle', fill: st.c, ls: '0.14em', w: 700 });
      s += txt(x, y + 5, st.note, { size: 9.4, anchor: 'middle', fill: INK3, ls: '0.02em' });
      s += txt(x, y + 17, st.ms, { size: 9.4, anchor: 'middle', fill: INK, ls: '0.02em', w: 700 });
      /* step index on the ring */
      s += '<circle cx="' + (x - w / 2 - 11) + '" cy="' + (y - h / 2 + 6) + '" r="9" fill="#0a1424" stroke="' + st.c + '" stroke-opacity="0.5" stroke-width="0.9"/>';
      s += txt(x - w / 2 - 11, y - h / 2 + 9.5, String(i + 1), { size: 9.4, anchor: 'middle', fill: st.c, ls: '0', w: 700 });
    });

    /* the centre states the invariant the ring enforces */
    s += txt(CX, CY - 8, 'NO ACTION LEAVES THIS LOOP', { size: 10, anchor: 'middle', fill: INK, ls: '0.14em', w: 700 });
    s += txt(CX, CY + 8, 'WITHOUT A POLICY VERDICT AGAINST IT', { size: 9.4, anchor: 'middle', fill: INK3, ls: '0.06em' });

    s += txt(24, H - 14, 'HTN PLANNER GROUNDS THE MODEL · THE MODEL NEVER CALLS A TOOL DIRECTLY', { size: 9.4, fill: INK3, ls: '0.1em' });
    return finish(svg, s, W, H);
  }

  /* ── 2 · policy gate ── */
  function figGate(svg) {
    var W = 900, H = 430, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(24, 30, 'THE POLICY GATE · EVERY PROPOSED ACTION IS SORTED BEFORE IT RUNS', { size: 10, fill: WARN, ls: '0.16em', w: 700 });

    var GX = 388, GW = 96, GY = 70, GH = 300;
    /* inbound proposals */
    var PROPS = [
      { t: 'Open work order',        v: 'AUTO',     c: OK,   y: 108 },
      { t: 'Re-time signal corridor', v: 'ATTENDED', c: NET,  y: 168 },
      { t: 'Notify supervisor',      v: 'AUTO',     c: OK,   y: 228 },
      { t: 'Evacuate zone 4',        v: 'SUPERVISED', c: WARN, y: 288 },
      { t: 'Disable feeder F-5',     v: 'DENIED',   c: CRIT, y: 348 }
    ];

    s += txt(24, 62, 'PROPOSED BY AGENT', { size: 9.4, fill: INK3, ls: '0.16em' });
    s += txt(W - 24, 62, 'OUTCOME', { size: 9.4, anchor: 'end', fill: INK3, ls: '0.16em' });

    /* the gate itself */
    s += '<rect x="' + GX + '" y="' + GY + '" width="' + GW + '" height="' + GH + '" rx="4" fill="' + WARN +
      '" fill-opacity="0.05" stroke="' + WARN + '" stroke-opacity="0.42" stroke-width="1.1"/>';
    s += txt(GX + GW / 2, GY + 26, 'POLICY', { size: 10, anchor: 'middle', fill: WARN, ls: '0.16em', w: 700 });
    s += txt(GX + GW / 2, GY + 40, 'GATE', { size: 10, anchor: 'middle', fill: WARN, ls: '0.16em', w: 700 });
    ['scope', 'threshold', 'rate limit', 'clearance', 'reversibility'].forEach(function (r, i) {
      s += txt(GX + GW / 2, GY + 74 + i * 18, r, { size: 9.4, anchor: 'middle', fill: INK3, ls: '0.02em' });
    });
    s += '<line x1="' + (GX + 14) + '" y1="' + (GY + GH - 42) + '" x2="' + (GX + GW - 14) + '" y2="' + (GY + GH - 42) + '" stroke="' + WARN + '" stroke-opacity="0.25" stroke-width="0.8"/>';
    s += txt(GX + GW / 2, GY + GH - 24, 'TYPED', { size: 9.4, anchor: 'middle', fill: WARN, ls: '0.14em', w: 700 });

    PROPS.forEach(function (p, i) {
      /* inbound */
      s += '<rect x="24" y="' + (p.y - 17) + '" width="300" height="34" rx="3" fill="rgba(125,211,252,0.03)" stroke="rgba(125,211,252,0.16)" stroke-width="0.8"/>';
      s += txt(38, p.y + 4, p.t, { size: 10, fill: INK, ls: '0.02em' });
      s += '<line x1="324" y1="' + p.y + '" x2="' + GX + '" y2="' + p.y + '" stroke="' + NET + '" stroke-opacity="0.3" stroke-width="1"/>';
      s += '<circle r="2.6" fill="' + NET + '" opacity="0.9"><animateMotion dur="2.8s" begin="' + (i * 0.45) + 's" repeatCount="indefinite" path="M324,' + p.y + ' L' + GX + ',' + p.y + '"/></circle>';

      /* outbound */
      var ox = GX + GW;
      s += '<line x1="' + ox + '" y1="' + p.y + '" x2="' + (ox + 64) + '" y2="' + p.y + '" stroke="' + p.c + '" stroke-opacity="0.35" stroke-width="1"' + (p.v === 'DENIED' ? ' stroke-dasharray="4 4"' : '') + '/>';
      if (p.v !== 'DENIED') {
        s += '<circle r="2.6" fill="' + p.c + '" opacity="0.9"><animateMotion dur="2.8s" begin="' + (i * 0.45 + 1.2) + 's" repeatCount="indefinite" path="M' + ox + ',' + p.y + ' L' + (ox + 64) + ',' + p.y + '"/></circle>';
      } else {
        s += '<circle cx="' + (ox + 32) + '" cy="' + p.y + '" r="9" fill="#0a1424" stroke="' + CRIT + '" stroke-width="1.3"/>';
        s += '<line x1="' + (ox + 27) + '" y1="' + (p.y - 5) + '" x2="' + (ox + 37) + '" y2="' + (p.y + 5) + '" stroke="' + CRIT + '" stroke-width="1.5"/>';
        s += '<line x1="' + (ox + 37) + '" y1="' + (p.y - 5) + '" x2="' + (ox + 27) + '" y2="' + (p.y + 5) + '" stroke="' + CRIT + '" stroke-width="1.5"/>';
      }
      var cw = strW(p.v, 9.4, 0.14) + 18;
      s += '<rect x="' + (ox + 74) + '" y="' + (p.y - 11) + '" width="' + cw.toFixed(1) + '" height="22" rx="3" fill="' + p.c +
        '" fill-opacity="0.16" stroke="' + p.c + '" stroke-opacity="0.55" stroke-width="0.9"/>';
      s += txt(ox + 74 + cw / 2, p.y + 4, p.v, { size: 9.4, anchor: 'middle', fill: p.c, ls: '0.14em', w: 700 });
    });

    s += txt(24, H - 14, 'THE AGENT CANNOT WIDEN ITS OWN AUTHORITY · THE GATE IS EVALUATED SERVER-SIDE', { size: 9.4, fill: INK3, ls: '0.1em' });
    return finish(svg, s, W, H);
  }

  /* ── 3 · autonomy ladder ── */
  function figAutonomy(svg) {
    var W = 900, H = 400, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(24, 30, 'AUTONOMY LADDER · SET PER ACTION TYPE, NEVER GLOBALLY', { size: 10, fill: NET, ls: '0.16em', w: 700 });

    var MODES = [
      { id: 'AUTO',       c: OK,   who: 'Agent acts, then reports',        ex: 'Open a work order · notify an owner · publish a status', rev: 'Reversible' },
      { id: 'ATTENDED',   c: NET,  who: 'Agent acts, operator can abort',  ex: 'Re-time a corridor · reroute a vehicle · raise a case',  rev: 'Reversible' },
      { id: 'SUPERVISED', c: WARN, who: 'Operator approves before action', ex: 'Evacuate a zone · dispatch response · shed load',       rev: 'Hard to undo' },
      { id: 'ADVISORY',   c: AI,   who: 'Agent recommends only',           ex: 'Armed response · utility isolation · public warning',   rev: 'Irreversible' }
    ];

    var top = 66, RH = 76;
    MODES.forEach(function (m, i) {
      var y = top + i * RH;
      /* the bar length encodes how much authority is delegated */
      var authority = [0.94, 0.72, 0.42, 0.16][i];
      s += '<rect x="24" y="' + y + '" width="' + (W - 48) + '" height="' + (RH - 10) + '" rx="4" fill="' + m.c + '" fill-opacity="0.03" stroke="' + m.c + '" stroke-opacity="0.28" stroke-width="0.9"/>';
      s += txt(42, y + 26, m.id, { size: 11, fill: m.c, ls: '0.16em', w: 700 });
      s += txt(42, y + 44, m.who, { size: 9.4, fill: INK, ls: '0.02em' });
      s += txt(42, y + 58, m.ex, { size: 9.4, fill: INK3, ls: '0.02em' });

      /* authority meter */
      var mx = 560, mw = 210;
      s += txt(mx, y + 20, 'DELEGATED AUTHORITY', { size: 9.4, fill: INK3, ls: '0.14em' });
      s += '<rect x="' + mx + '" y="' + (y + 28) + '" width="' + mw + '" height="7" rx="3.5" fill="' + m.c + '" fill-opacity="0.12"/>';
      s += '<rect x="' + mx + '" y="' + (y + 28) + '" width="' + (mw * authority).toFixed(1) + '" height="7" rx="3.5" fill="' + m.c + '" fill-opacity="0.8"/>';
      s += txt(mx, y + 52, m.rev, { size: 9.4, fill: m.c, ls: '0.1em', w: 700 });
      s += txt(W - 42, y + 52, Math.round(authority * 100) + '%', { size: 12, anchor: 'end', fill: m.c, ls: '0', w: 700 });
    });

    s += txt(24, H - 14, 'AUTONOMY IS EARNED PER ACTION TYPE AFTER A SHADOW PERIOD · IT IS NOT A GLOBAL SWITCH', { size: 9.4, fill: INK3, ls: '0.1em' });
    return finish(svg, s, W, H);
  }

  /* ── 4 · decision ledger ── */
  function figLedger(svg) {
    var W = 900, H = 400, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(24, 30, 'DECISION LEDGER · ONE AGENT CYCLE, WRITTEN IMMUTABLY', { size: 10, fill: NET, ls: '0.16em', w: 700 });
    s += txt(24, 47, 'AGENT dispatch_agent_02 · RUN run_4c81f9 · POLICY SET v7.3', { size: 9.4, fill: INK3, ls: '0.05em' });

    var COLS = [{ x: 34, t: 'T+' }, { x: 108, t: 'STEP' }, { x: 250, t: 'DETAIL' }, { x: 660, t: 'EVIDENCE' }];
    var HY = 78;
    COLS.forEach(function (c) { s += txt(c.x, HY, c.t, { size: 9.4, fill: INK3, ls: '0.16em' }); });
    s += '<line x1="24" y1="' + (HY + 8) + '" x2="' + (W - 24) + '" y2="' + (HY + 8) + '" stroke="rgba(125,211,252,0.22)" stroke-width="0.9"/>';

    var ROWS = [
      { t: '000 ms', st: 'PERCEIVE', c: NET,  d: '3 signals correlated to one candidate incident',       e: 'SD-412 · CAM-77 · heat' },
      { t: '040 ms', st: 'PLAN',     c: AI,   d: 'HTN selected SOP EVAC-2 · LLM drafted 4 actions',      e: 'plan_9d21 · v7.3' },
      { t: '350 ms', st: 'CHECK',    c: WARN, d: 'Policy gate · 3 auto, 1 requires supervision',         e: 'pol_evac · tier 2' },
      { t: '368 ms', st: 'ACT',      c: OK,   d: 'Dispatched Engine-12 · notified SUP-04 · signage set', e: 'tool calls ×3' },
      { t: '463 ms', st: 'HOLD',     c: CRIT, d: 'Zone evacuation held for named operator approval',     e: 'awaiting op_042' },
      { t: '485 ms', st: 'EXPLAIN',  c: NET,  d: 'Reasoning trace with cited signals and thresholds',    e: 'trace_1188' }
    ];

    var RH = 44, top = HY + 8;
    ROWS.forEach(function (r, i) {
      var y = top + i * RH;
      s += '<rect x="24" y="' + y + '" width="' + (W - 48) + '" height="' + RH + '" fill="' + r.c + '" fill-opacity="' + (i % 2 ? 0.018 : 0.032) + '"/>';
      s += '<rect x="24" y="' + y + '" width="2.5" height="' + RH + '" fill="' + r.c + '" fill-opacity="0.75"/>';
      s += '<line x1="24" y1="' + (y + RH) + '" x2="' + (W - 24) + '" y2="' + (y + RH) + '" stroke="rgba(125,211,252,0.06)" stroke-width="0.7"/>';
      s += txt(COLS[0].x, y + 27, r.t, { size: 9.4, fill: INK3, ls: '0.02em' });
      var cw = strW(r.st, 9.4, 0.14) + 16;
      s += '<rect x="' + COLS[1].x + '" y="' + (y + 14) + '" width="' + cw.toFixed(1) + '" height="18" rx="3" fill="' + r.c + '" fill-opacity="0.16" stroke="' + r.c + '" stroke-opacity="0.5" stroke-width="0.9"/>';
      s += txt(COLS[1].x + cw / 2, y + 27, r.st, { size: 9.4, anchor: 'middle', fill: r.c, ls: '0.14em', w: 700 });
      s += txt(COLS[2].x, y + 27, r.d, { size: 10, fill: INK, ls: '0.02em' });
      s += txt(COLS[3].x, y + 27, r.e, { size: 9.4, fill: 'rgba(125,211,252,0.7)', ls: '0.02em' });
    });

    s += '<circle cx="34" cy="' + (H - 18) + '" r="3.4" fill="' + OK + '"><animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/></circle>';
    s += txt(46, H - 15, 'APPEND-ONLY · CRYPTOGRAPHICALLY CHAINED · EXPORTABLE AS AN AFTER-ACTION RECORD', { size: 9.4, fill: INK3, ls: '0.1em' });
    return finish(svg, s, W, H);
  }

  /* ── 5 · multi-agent contention ── */
  function figAgents(svg) {
    var W = 900, H = 400, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(24, 30, 'MULTI-AGENT COORDINATION · SHARED STATE, EXPLICIT CONFLICT', { size: 10, fill: AI, ls: '0.16em', w: 700 });

    /* the shared object graph as a spine */
    var SY = 232, SX0 = 60, SX1 = W - 60;
    s += '<rect x="' + SX0 + '" y="' + (SY - 22) + '" width="' + (SX1 - SX0) + '" height="44" rx="5" fill="' + NET + '" fill-opacity="0.05" stroke="' + NET + '" stroke-opacity="0.34" stroke-width="1"/>';
    s += txt((SX0 + SX1) / 2, SY + 4, 'SHARED OBJECT GRAPH · SINGLE SOURCE OF TRUTH', { size: 10, anchor: 'middle', fill: NET, ls: '0.14em', w: 700 });

    var AGENTS = [
      { id: 'dispatch_agent', task: 'assign responder', x: 150, c: OK },
      { id: 'traffic_agent',  task: 'divert corridor',  x: 380, c: NET },
      { id: 'facility_agent', task: 'lock zone 4',      x: 610, c: WARN },
      { id: 'comms_agent',    task: 'notify public',    x: 810, c: AI }
    ];
    AGENTS.forEach(function (a, i) {
      var y = 96, w = Math.max(strW(a.id, 10, 0.06), strW(a.task, 9.4, 0.02)) + 28;
      s += '<rect x="' + (a.x - w / 2) + '" y="' + y + '" width="' + w + '" height="48" rx="4" fill="#0a1424" stroke="' + a.c + '" stroke-opacity="0.5" stroke-width="1.1"/>';
      s += txt(a.x, y + 20, a.id, { size: 10, anchor: 'middle', fill: a.c, ls: '0.06em', w: 700 });
      s += txt(a.x, y + 35, a.task, { size: 9.4, anchor: 'middle', fill: INK3, ls: '0.02em' });
      /* claim line down to the graph */
      s += '<line x1="' + a.x + '" y1="' + (y + 48) + '" x2="' + a.x + '" y2="' + (SY - 22) + '" stroke="' + a.c + '" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="4 4"/>';
      s += '<circle r="2.4" fill="' + a.c + '" opacity="0.9"><animateMotion dur="3s" begin="' + (i * 0.6) + 's" repeatCount="indefinite" path="M' + a.x + ',' + (y + 48) + ' L' + a.x + ',' + (SY - 22) + '"/></circle>';
    });

    /* contention between two agents over the same object */
    var c1 = AGENTS[1].x, c2 = AGENTS[2].x, cm = (c1 + c2) / 2;
    s += '<rect x="' + (cm - 132) + '" y="' + (SY + 46) + '" width="264" height="52" rx="4" fill="' + CRIT + '" fill-opacity="0.07" stroke="' + CRIT + '" stroke-opacity="0.45" stroke-width="1"/>';
    s += txt(cm, SY + 66, 'CONFLICT · ZONE 4 CLAIMED TWICE', { size: 9.8, anchor: 'middle', fill: CRIT, ls: '0.1em', w: 700 });
    s += txt(cm, SY + 82, 'surfaced as an event · operator arbitrates', { size: 9.4, anchor: 'middle', fill: INK3, ls: '0.02em' });
    s += '<line x1="' + c1 + '" y1="' + (SY + 22) + '" x2="' + cm + '" y2="' + (SY + 46) + '" stroke="' + CRIT + '" stroke-opacity="0.4" stroke-width="1"/>';
    s += '<line x1="' + c2 + '" y1="' + (SY + 22) + '" x2="' + cm + '" y2="' + (SY + 46) + '" stroke="' + CRIT + '" stroke-opacity="0.4" stroke-width="1"/>';
    s += '<circle cx="' + cm + '" cy="' + (SY + 34) + '" r="7" fill="none" stroke="' + CRIT + '" stroke-width="1.3">' +
      '<animate attributeName="r" values="6;18;6" dur="2.4s" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" repeatCount="indefinite"/></circle>';

    s += txt(24, H - 14, 'AGENTS NEVER MESSAGE EACH OTHER DIRECTLY · THEY READ AND CLAIM THROUGH THE GRAPH, SO EVERY RACE IS VISIBLE', { size: 9.4, fill: INK3, ls: '0.08em' });
    return finish(svg, s, W, H);
  }

  var FIGS = { loop: figLoop, gate: figGate, autonomy: figAutonomy, ledger: figLedger, agents: figAgents };

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-ao-fig]'), function (n) {
      var f = FIGS[n.getAttribute('data-ao-fig')];
      if (f) f(n);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
