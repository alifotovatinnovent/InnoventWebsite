/* ─────────────────────────────────────────────────────────────
   Innfini · Object & Event Graph — explanatory figures
   Five generated diagrams, each mounted on [data-oeg-fig="…"]:
     types | edges | temporal | latency | boundary
   Cyan/navy system palette; every label sits in reserved space.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var NET = '#7dd3fc', OK = '#6ee7b7', AI = '#c4b5fd', WARN = '#fbbf24', CRIT = '#fb7185';
  var INK = 'rgba(230,240,251,0.9)', INK2 = 'rgba(169,189,214,0.6)', INK3 = 'rgba(113,133,158,0.75)';

  /* Figures are 900 units wide rendered at ~843px (scale 0.937), so an authored
     size below 9.6 units renders under 9px. The floor lives here rather than at
     each call site, so no label — present or future — can drop below it. */
  var MIN_U = 9.6;
  var LINE = MIN_U * 1.2;                       // line box of clamped type
  function strW(s, u) { return s.length * (u || MIN_U) * 0.62; }   // mono advance
  function txt(x, y, s, o) {
    o = o || {};
    var fs = Math.max(o.size || 9, MIN_U);
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + fs +
      '" letter-spacing="' + (o.ls || '0.1em') + '" fill="' + (o.fill || INK2) + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }

  /* one glyph per object type — shape IS the type */
  function glyph(x, y, kind, col, r) {
    r = r || 13;
    var f = 'rgba(9,17,30,0.95)', sw = 1.5;
    switch (kind) {
      case 'circle': return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'square': return '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + r * 2 + '" height="' + r * 2 + '" rx="2" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'diamond': return '<path d="M' + x + ',' + (y - r) + ' L' + (x + r) + ',' + y + ' L' + x + ',' + (y + r) + ' L' + (x - r) + ',' + y + ' Z" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'triangle': return '<path d="M' + x + ',' + (y - r) + ' L' + (x + r) + ',' + (y + r * 0.8) + ' L' + (x - r) + ',' + (y + r * 0.8) + ' Z" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'hex': var p = [];
        for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; p.push((x + Math.cos(a) * r).toFixed(1) + ',' + (y + Math.sin(a) * r).toFixed(1)); }
        return '<polygon points="' + p.join(' ') + '" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'pill': return '<rect x="' + (x - r * 1.35) + '" y="' + (y - r * 0.72) + '" width="' + r * 2.7 + '" height="' + r * 1.44 + '" rx="' + r * 0.72 + '" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'burst':
        var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r * 0.5 + '" fill="' + col + '"/>';
        for (var k = 0; k < 8; k++) {
          var th = k * Math.PI / 4;
          s += '<line x1="' + (x + Math.cos(th) * r * 0.72) + '" y1="' + (y + Math.sin(th) * r * 0.72) +
               '" x2="' + (x + Math.cos(th) * r * 1.25) + '" y2="' + (y + Math.sin(th) * r * 1.25) +
               '" stroke="' + col + '" stroke-width="1.3"/>';
        }
        return s;
      case 'shield':
        return '<path d="M' + (x - r * 0.85) + ',' + (y - r * 0.8) + ' L' + (x + r * 0.85) + ',' + (y - r * 0.8) +
          ' L' + (x + r * 0.85) + ',' + (y + r * 0.2) + ' Q' + x + ',' + (y + r * 1.15) + ' ' + (x - r * 0.85) + ',' + (y + r * 0.2) +
          ' Z" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
    }
    return '';
  }

  /* ── 1 · the eight typed objects ── */
  function figTypes(svg) {
    var W = 900, H = 348, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    var TYPES = [
      { k: 'square',   c: NET,  n: 'ASSET',    v: '4.2M',  a: 'identity · state · custodian' },
      { k: 'hex',      c: NET,  n: 'PLACE',    v: '58k',   a: 'geometry · capacity · parent' },
      { k: 'circle',   c: OK,   n: 'PERSON',   v: '184k',  a: 'role · cert · clearance' },
      { k: 'triangle', c: NET,  n: 'DEVICE',   v: '1.9M',  a: 'health · firmware · seen' },
      { k: 'burst',    c: WARN, n: 'EVENT',    v: '860M',  a: 'time · source · confidence' },
      { k: 'pill',     c: AI,   n: 'WORKFLOW', v: '2.8M',  a: 'steps · owner · SLA' },
      { k: 'diamond',  c: CRIT, n: 'INCIDENT', v: '390k',  a: 'severity · timeline · units' },
      { k: 'shield',   c: AI,   n: 'RULE',     v: '3.8k',  a: 'trigger · scope · approver' }
    ];
    var cols = 4, cw = W / cols, rh = 138, top = 62;
    s += txt(28, 30, 'EIGHT CORE TYPES · SHAPE ENCODES TYPE · EXTENSIBLE SCHEMA', { size: 9, fill: NET, ls: '0.18em', w: 700 });
    TYPES.forEach(function (t, i) {
      var cx = (i % cols) * cw + cw / 2, cy = top + Math.floor(i / cols) * rh + 26;
      s += glyph(cx, cy, t.k, t.c, 15);
      s += txt(cx, cy + 34, t.n, { size: 9.5, anchor: 'middle', fill: t.c, w: 700, ls: '0.14em' });
      s += txt(cx, cy + 48, t.v, { size: 12, anchor: 'middle', fill: INK, w: 700, ls: '0' });
      s += txt(cx, cy + 62, t.a, { size: 7.2, anchor: 'middle', fill: INK3, ls: '0.04em' });
    });
    return finish(svg, s, W, H);
  }

  /* ── 2 · relationship matrix (schema documentation, not a cartoon) ── */
  function figEdges(svg) {
    var W = 900, H = 470, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(28, 30, 'RELATIONSHIP MATRIX · PERMITTED EDGES BY SOURCE AND TARGET TYPE', { size: 9, fill: NET, ls: '0.18em', w: 700 });

    var T = ['ASSET', 'PLACE', 'PERSON', 'DEVICE', 'EVENT', 'INCIDENT'];
    var R = {
      'ASSET|PLACE':      ['located_in',  'N:1'],
      'ASSET|ASSET':      ['depends_on',  'N:M'],
      'ASSET|PERSON':     ['in_custody',  'N:1'],
      'PLACE|PLACE':      ['parent_of',   '1:N'],
      'PERSON|PLACE':     ['present_in',  'N:1'],
      'DEVICE|PLACE':     ['mounted_in',  'N:1'],
      'DEVICE|ASSET':     ['monitors',    'N:M'],
      'EVENT|DEVICE':     ['observed_by', 'N:1'],
      'EVENT|ASSET':      ['concerns',    'N:1'],
      'EVENT|EVENT':      ['preceded_by', '1:1'],
      'EVENT|PLACE':      ['occurred_in', 'N:1'],
      'INCIDENT|EVENT':   ['caused_by',   '1:N'],
      'INCIDENT|PERSON':  ['assigned_to', 'N:1'],
      'INCIDENT|PLACE':   ['occurs_in',   'N:1']
    };

    var HX = 150, HY = 82, CW = (W - HX - 24) / T.length, RH = 54;

    /* column headers */
    T.forEach(function (t, c) {
      s += txt(HX + c * CW + CW / 2, HY - 10, t, { size: 7.6, anchor: 'middle', fill: INK2, ls: '0.14em', w: 700 });
    });
    s += txt(HX - 12, HY - 10, 'TARGET →', { size: 6.8, anchor: 'end', fill: INK3, ls: '0.14em' });
    s += txt(28, HY + 14, 'SOURCE ↓', { size: 6.8, fill: INK3, ls: '0.14em' });

    /* grid */
    for (var c = 0; c <= T.length; c++) {
      s += '<line x1="' + (HX + c * CW) + '" y1="' + HY + '" x2="' + (HX + c * CW) + '" y2="' + (HY + T.length * RH) +
        '" stroke="rgba(125,211,252,0.10)" stroke-width="0.8"/>';
    }
    for (var r = 0; r <= T.length; r++) {
      s += '<line x1="' + HX + '" y1="' + (HY + r * RH) + '" x2="' + (HX + T.length * CW) + '" y2="' + (HY + r * RH) +
        '" stroke="rgba(125,211,252,0.10)" stroke-width="0.8"/>';
    }

    /* rows */
    T.forEach(function (src, r) {
      var y = HY + r * RH;
      s += txt(HX - 12, y + RH / 2 + 3, src, { size: 7.6, anchor: 'end', fill: INK2, ls: '0.14em', w: 700 });
      T.forEach(function (tgt, c) {
        var x = HX + c * CW, rel = R[src + '|' + tgt];
        if (!rel) {
          s += txt(x + CW / 2, y + RH / 2 + 3, '·', { size: 10, anchor: 'middle', fill: 'rgba(113,133,158,0.35)' });
          return;
        }
        var self = src === tgt;
        s += '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (CW - 6) + '" height="' + (RH - 6) +
          '" rx="3" fill="' + NET + '" fill-opacity="' + (self ? 0.10 : 0.055) + '" stroke="' + NET +
          '" stroke-opacity="' + (self ? 0.42 : 0.24) + '" stroke-width="0.9"' + (self ? ' stroke-dasharray="4 3"' : '') + '/>';
        s += txt(x + CW / 2, y + RH / 2 - 1, rel[0], { size: 7.6, anchor: 'middle', fill: INK, ls: '0.02em', w: 700 });
        s += txt(x + CW / 2, y + RH / 2 + 12, rel[1], { size: 6.8, anchor: 'middle', fill: NET, ls: '0.08em' });
      });
    });

    /* legend */
    var ly2 = HY + T.length * RH + 32;
    s += '<rect x="28" y="' + (ly2 - 9) + '" width="16" height="11" rx="2" fill="' + NET + '" fill-opacity="0.055" stroke="' + NET + '" stroke-opacity="0.24" stroke-width="0.9"/>';
    s += txt(50, ly2, 'PERMITTED EDGE', { size: 7, fill: INK3, ls: '0.12em' });
    s += '<rect x="176" y="' + (ly2 - 9) + '" width="16" height="11" rx="2" fill="' + NET + '" fill-opacity="0.10" stroke="' + NET + '" stroke-opacity="0.42" stroke-width="0.9" stroke-dasharray="4 3"/>';
    s += txt(198, ly2, 'SELF-REFERENTIAL', { size: 7, fill: INK3, ls: '0.12em' });
    s += txt(340, ly2, '·  NOT PERMITTED BY SCHEMA', { size: 7, fill: INK3, ls: '0.12em' });
    s += txt(W - 28, ly2, 'N:1 · N:M · 1:N · 1:1  CARDINALITY', { size: 7, anchor: 'end', fill: NET, ls: '0.1em', w: 700 });
    s += txt(28, H - 14, 'THE SCHEMA IS ENFORCED AT WRITE TIME · AN EDGE THAT IS NOT IN THIS MATRIX CANNOT BE CREATED', { size: 7.2, fill: INK3, ls: '0.1em' });
    return finish(svg, s, W, H);
  }

  /* ── 3 · bi-temporal model ── */
  function figTemporal(svg) {
    var W = 900, H = 356, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(28, 30, 'BI-TEMPORAL · WHEN IT WAS TRUE vs WHEN WE LEARNED IT', { size: 9, fill: NET, ls: '0.18em', w: 700 });

    /* Gutter is derived from the longest axis caption, not hardcoded: under the
       MIN_U clamp a fixed gutter let the caption run into the first time tick. */
    var CAPS = ['when it was true in the world', 'when the platform learned it'];
    var x0 = Math.max(strW(CAPS[0]), strW(CAPS[1])) + 30;
    var x1 = W - 60, vy = 122, ty = 244;
    [[vy, 'VALID TIME', CAPS[0], NET], [ty, 'TRANSACTION TIME', CAPS[1], AI]].forEach(function (ax) {
      s += '<line x1="' + x0 + '" y1="' + ax[0] + '" x2="' + x1 + '" y2="' + ax[0] + '" stroke="' + ax[3] + '" stroke-opacity="0.45" stroke-width="1.4"/>';
      s += txt(14, ax[0] - 4, ax[1], { size: 8, fill: ax[3], ls: '0.14em', w: 700 });
      s += txt(14, ax[0] + 9, ax[2], { size: 6.6, fill: INK3, ls: '0.02em' });
      for (var t = 0; t <= 6; t++) {
        var tx = x0 + t * ((x1 - x0) / 6);
        s += '<line x1="' + tx + '" y1="' + (ax[0] - 4) + '" x2="' + tx + '" y2="' + (ax[0] + 4) + '" stroke="' + ax[3] + '" stroke-opacity="0.3" stroke-width="0.9"/>';
        s += txt(tx, ax[0] + 20, '14:0' + t, { size: 6.8, anchor: 'middle', fill: INK3 });
      }
    });

    /* a fact that was true 14:02 → 14:04 but only arrived at 14:05 */
    var fx0 = x0 + 2 * ((x1 - x0) / 6), fx1 = x0 + 4 * ((x1 - x0) / 6), ax2 = x0 + 5 * ((x1 - x0) / 6);
    s += '<rect x="' + fx0 + '" y="' + (vy - 22) + '" width="' + (fx1 - fx0) + '" height="14" rx="3" fill="' + NET + '" fill-opacity="0.22" stroke="' + NET + '" stroke-width="1"/>';
    s += txt(fx0 + 8, vy - 11.5, 'PALLET IN DOCK-2', { size: 7, fill: NET, w: 700 });
    s += '<circle cx="' + ax2 + '" cy="' + ty + '" r="5" fill="' + AI + '"/>';
    s += txt(ax2 - 10, ty - 9, 'LATE ARRIVAL · INSERTED AT ITS REAL TIME', { size: 7.5, anchor: 'end', fill: AI, w: 700 });
    s += '<path d="M' + ax2 + ',' + (ty - 6) + ' C' + ax2 + ',' + (ty - 60) + ' ' + fx1 + ',' + (vy + 60) + ' ' + fx1 + ',' + (vy + 4) +
      '" fill="none" stroke="' + AI + '" stroke-opacity="0.45" stroke-width="1.1" stroke-dasharray="4 4"/>';

    /* point-in-time query */
    /* 3.5 steps, NOT 3: at 3 the query line coincided with the bar's centred
       caption and both axes' 14:03 ticks, painting over all three. */
    var qx = x0 + 3.5 * ((x1 - x0) / 6);
    s += '<line x1="' + qx + '" y1="' + (vy - 42) + '" x2="' + qx + '" y2="' + (ty + 30) + '" stroke="' + WARN + '" stroke-width="1.3" stroke-dasharray="5 4"/>';
    s += txt(qx, vy - 50, 'POINT-IN-TIME QUERY · “STATE AT 14:03:30”', { size: 7.5, anchor: 'middle', fill: WARN, w: 700 });
    s += '<circle cx="' + qx + '" cy="' + vy + '" r="4" fill="' + WARN + '" stroke="#070f1e" stroke-width="1.2"/>';
    s += '<circle cx="' + qx + '" cy="' + ty + '" r="4" fill="' + WARN + '" stroke="#070f1e" stroke-width="1.2"/>';
    s += txt(x0, H - 16, 'HISTORY IS NEVER OVERWRITTEN · CORRECTIONS ARE NEW VERSIONS WITH AN AUTHOR', { size: 7.5, fill: INK3, ls: '0.1em' });
    return finish(svg, s, W, H);
  }

  /* ── 4 · latency by traversal depth ── */
  function figLatency(svg) {
    var W = 900, H = 372, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(28, 30, 'TRAVERSAL LATENCY · 12M NODES · 86M RELATIONSHIPS · COMMODITY HARDWARE', { size: 9, fill: NET, ls: '0.18em', w: 700 });
    var ROWS = [
      { n: 'Node lookup',       hop: '—',      p50: 2,   p99: 9 },
      { n: 'One hop',           hop: '1 hop',  p50: 6,   p99: 23 },
      { n: 'Three hops',        hop: '3 hops', p50: 23,  p99: 88 },
      { n: 'Five-hop blast radius', hop: '5 hops', p50: 140, p99: 410 },
      { n: 'Point-in-time',     hop: 'temporal', p50: 38, p99: 120 }
    ];
    var bx = 262, bw = W - bx - 128, max = 410, top = 74, rh = 56;
    ROWS.forEach(function (r, i) {
      var y = top + i * rh;
      s += txt(28, y + 4, r.n, { size: 10, fill: INK, ls: '0.02em' });
      s += txt(28, y + 17, r.hop, { size: 7, fill: INK3, ls: '0.12em' });
      /* p99 track then p50 fill */
      s += '<rect x="' + bx + '" y="' + (y - 6) + '" width="' + (r.p99 / max * bw).toFixed(1) + '" height="13" rx="2" fill="' + NET + '" fill-opacity="0.14" stroke="' + NET + '" stroke-opacity="0.3" stroke-width="0.8"/>';
      s += '<rect x="' + bx + '" y="' + (y - 6) + '" width="' + (r.p50 / max * bw).toFixed(1) + '" height="13" rx="2" fill="' + NET + '" fill-opacity="0.75"/>';
      s += txt(bx + (r.p99 / max * bw) + 10, y + 4, r.p50 + ' / ' + r.p99 + ' ms', { size: 9, fill: INK, ls: '0.04em', w: 700 });
    });
    var ly = H - 22;
    s += '<rect x="' + bx + '" y="' + (ly - 8) + '" width="22" height="9" rx="2" fill="' + NET + '" fill-opacity="0.75"/>';
    s += txt(bx + 28, ly, 'p50', { size: 7.5, fill: INK3, ls: '0.12em' });
    s += '<rect x="' + (bx + 70) + '" y="' + (ly - 8) + '" width="22" height="9" rx="2" fill="' + NET + '" fill-opacity="0.14" stroke="' + NET + '" stroke-opacity="0.3" stroke-width="0.8"/>';
    s += txt(bx + 98, ly, 'p99', { size: 7.5, fill: INK3, ls: '0.12em' });
    s += txt(W - 120, ly, 'SUSTAINED INGEST 14,820 EVENTS / S', { size: 7.5, anchor: 'end', fill: OK, ls: '0.1em', w: 700 });
    return finish(svg, s, W, H);
  }

  /* ── 5 · authorisation trace (a real policy decision ledger) ── */
  function figBoundary(svg) {
    var W = 900, H = 480, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(28, 30, 'TRAVERSAL AUTHORISATION TRACE · EVALUATED PER NODE, PER EDGE', { size: 9, fill: NET, ls: '0.18em', w: 700 });

    /* principal + query header */
    s += '<rect x="28" y="44" width="' + (W - 56) + '" height="52" rx="4" fill="rgba(125,211,252,0.03)" stroke="rgba(125,211,252,0.14)" stroke-width="0.9"/>';
    [['PRINCIPAL', 'dispatcher_042'], ['ROLE', 'Dispatcher'], ['CLEARANCE', 'Tier 2'], ['AGENCY', 'A · own subgraph']].forEach(function (f, i) {
      var fx = 44 + i * 200;
      s += txt(fx, 62, f[0], { size: 6.4, fill: INK3, ls: '0.16em' });
      s += txt(fx, 74, f[1], { size: 9, fill: INK, ls: '0.02em', w: 700 });
    });
    s += txt(44, 89, 'QUERY  MATCH (e:Event)-[*1..4]-(n) WHERE e.id = \'evt_8f21c04b\'', { size: 7.2, fill: 'rgba(125,211,252,0.75)', ls: '0.02em' });

    /* column headers */
    var COLS = [
      { x: 34,  w: 34,  t: 'HOP' },
      { x: 74,  w: 172, t: 'NODE REACHED' },
      { x: 250, w: 116, t: 'VIA' },
      { x: 370, w: 172, t: 'POLICY EVALUATED' },
      { x: 546, w: 250, t: 'DECISION' },
      { x: 800, w: 66,  t: 'µs', a: 'end' }
    ];
    var HY = 124;
    COLS.forEach(function (c) {
      s += txt(c.a === 'end' ? c.x + c.w : c.x, HY, c.t, { size: 6.6, fill: INK3, ls: '0.16em', anchor: c.a });
    });
    s += '<line x1="28" y1="' + (HY + 8) + '" x2="' + (W - 28) + '" y2="' + (HY + 8) + '" stroke="rgba(125,211,252,0.2)" stroke-width="0.9"/>';

    var ROWS = [
      { hop: '0', node: 'event · evt_8f21c04b', via: '— focus',       pol: 'tenant.self',        dec: 'ALLOW',  note: 'owned by principal',        c: OK,   us: '41' },
      { hop: '1', node: 'asset · P-8821',       via: 'concerns',      pol: 'asset.read',         dec: 'ALLOW',  note: 'role grants asset read',    c: OK,   us: '63' },
      { hop: '2', node: 'place · DOCK-2',       via: 'occurred_in',   pol: 'place.read',         dec: 'ALLOW',  note: 'within agency boundary',    c: OK,   us: '58' },
      { hop: '3', node: 'person · M. ROSA',     via: 'in_custody',    pol: 'pii.redact',         dec: 'REDACT', note: 'count returned, identity withheld', c: AI, us: '77' },
      { hop: '4', node: 'incident · MIS-ROUTE', via: 'caused_by',     pol: 'share.expired 14:02', dec: 'DENY',  note: 'existence not disclosed',   c: CRIT, us: '12' }
    ];

    var RH = 46, top = HY + 8;
    ROWS.forEach(function (r, i) {
      var y = top + i * RH;
      s += '<rect x="28" y="' + y + '" width="' + (W - 56) + '" height="' + RH + '" fill="' + r.c + '" fill-opacity="' + (i % 2 ? 0.018 : 0.032) + '"/>';
      s += '<rect x="28" y="' + y + '" width="3" height="' + RH + '" fill="' + r.c + '" fill-opacity="0.7"/>';
      s += '<line x1="28" y1="' + (y + RH) + '" x2="' + (W - 28) + '" y2="' + (y + RH) + '" stroke="rgba(125,211,252,0.07)" stroke-width="0.7"/>';

      s += txt(COLS[0].x + 6, y + 28, r.hop, { size: 9.5, fill: INK3, ls: '0', w: 700 });
      s += txt(COLS[1].x, y + 28, r.node, { size: 9.2, fill: INK, ls: '0.02em' });
      s += txt(COLS[2].x, y + 28, r.via, { size: 8.4, fill: 'rgba(125,211,252,0.7)', ls: '0.02em' });
      s += txt(COLS[3].x, y + 28, r.pol, { size: 8.4, fill: INK3, ls: '0.02em' });

      /* decision chip + reason */
      var dw = r.dec.length * 6.4 + 16;
      s += '<rect x="' + COLS[4].x + '" y="' + (y + 15) + '" width="' + dw + '" height="16" rx="3" fill="' + r.c +
        '" fill-opacity="0.16" stroke="' + r.c + '" stroke-opacity="0.55" stroke-width="0.9"/>';
      s += txt(COLS[4].x + dw / 2, y + 26, r.dec, { size: 7.4, anchor: 'middle', fill: r.c, ls: '0.14em', w: 700 });
      s += txt(COLS[4].x + dw + 10, y + 26, r.note, { size: 7.2, fill: INK3, ls: '0.02em' });

      s += txt(COLS[5].x + COLS[5].w, y + 28, r.us, { size: 9, anchor: 'end', fill: INK, ls: '0', w: 700 });
    });

    /* halt marker under the denied hop */
    var haltY = top + ROWS.length * RH;
    s += '<line x1="28" y1="' + haltY + '" x2="' + (W - 28) + '" y2="' + haltY + '" stroke="' + CRIT + '" stroke-opacity="0.4" stroke-width="1" stroke-dasharray="5 4"/>';
    s += txt(COLS[1].x, haltY + 17, 'TRAVERSAL HALTED AT HOP 4 · REMAINING SUBGRAPH NEVER READ, NEVER COUNTED', { size: 7.4, fill: CRIT, ls: '0.08em', w: 700 });

    /* footer ledger */
    s += '<line x1="28" y1="' + (H - 42) + '" x2="' + (W - 28) + '" y2="' + (H - 42) + '" stroke="rgba(125,211,252,0.1)" stroke-width="0.8"/>';
    var note = 'AUDITED · aud_7731c9 · DENIAL INCLUDED';
    var noteW = strW(note) + 18;
    var fields = [['EVALUATED', '5 nodes'], ['ALLOWED', '3'], ['REDACTED', '1'], ['DENIED', '1'], ['TOTAL', '251 µs']];
    var pitch = (W - 56 - noteW) / fields.length;
    fields.forEach(function (f, i) {
      var fx = 28 + i * pitch;
      s += txt(fx, H - 24, f[0], { size: 6.4, fill: INK3, ls: '0.16em' });
      s += txt(fx, H - 24 + LINE, f[1], { size: 9.5, fill: INK, ls: '0.02em', w: 700 });
    });
    s += txt(W - 28, H - 24 + LINE, note, { size: 7.2, anchor: 'end', fill: OK, ls: '0.1em', w: 700 });
    return finish(svg, s, W, H);
  }

  function finish(svg, s, W, H) {
    var host = svg.parentNode;
    if (host && host.classList && host.classList.contains('mk__canvas')) host.style.aspectRatio = W + ' / ' + H;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  var FIGS = { types: figTypes, edges: figEdges, temporal: figTemporal, latency: figLatency, boundary: figBoundary };

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-oeg-fig]'), function (n) {
      var f = FIGS[n.getAttribute('data-oeg-fig')];
      if (f) f(n);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
