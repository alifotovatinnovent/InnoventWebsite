/* ─────────────────────────────────────────────────────────────
   Innfini story · Scene 02 — operational graph
   Replaces 11 identical dots + 16 unlabelled lines with a typed
   schema view: glyph-per-type nodes (the same shape vocabulary
   used across the site), instance counts, named relationships
   with cardinality, live event pulses, a focal object under
   inspection, and a legend.

   Keeps the original CSS animation hooks — .ifs-edge with
   --ei/--len and .ifs-gnode with --ni — so the existing draw-in
   and pop-in choreography still drives the entrance.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var W = 1280, H = 660;
  var MONO = 'var(--font-mono, ui-monospace, monospace)';

  var NET = '#7dd3fc', OK = '#6ee7b7', AI = '#c4b5fd', WARN = '#fbbf24', CRIT = '#fb7185';
  var INK = 'rgba(230,240,251,0.94)', INK2 = 'rgba(169,189,214,0.66)', INK3 = 'rgba(120,142,170,0.9)';

  /* ── the schema ── */
  var NODES = [
    { id: 'event',    label: 'Event',      n: '860M',  k: 'burst',    c: WARN, x: 566, y: 322, focal: true },
    { id: 'asset',    label: 'Asset',      n: '4.2M',  k: 'square',   c: NET,  x: 352, y: 168 },
    { id: 'location', label: 'Location',   n: '58k',   k: 'hex',      c: NET,  x: 176, y: 344 },
    { id: 'person',   label: 'Person',     n: '184k',  k: 'circle',   c: OK,   x: 664, y: 148 },
    { id: 'sensor',   label: 'Sensor',     n: '1.9M',  k: 'triangle', c: NET,  x: 226, y: 548 },
    { id: 'vehicle',  label: 'Vehicle',    n: '12k',   k: 'square',   c: NET,  x: 466, y: 468 },
    { id: 'workorder',label: 'Work order', n: '2.8M',  k: 'pill',     c: AI,   x: 812, y: 312 },
    { id: 'exception',label: 'Exception',  n: '390k',  k: 'diamond',  c: CRIT, x: 946, y: 166 },
    { id: 'sla',      label: 'SLA',        n: '3.8k',  k: 'shield',   c: AI,   x: 1096, y: 340 },
    { id: 'permit',   label: 'Permit',     n: '21k',   k: 'shield',   c: OK,   x: 962, y: 552 },
    { id: 'checklist',label: 'Checklist',  n: '640k',  k: 'pill',     c: AI,   x: 726, y: 566 }
  ];
  function N(id) { for (var i = 0; i < NODES.length; i++) if (NODES[i].id === id) return NODES[i]; }

  /* relationships: from → to, name, cardinality, whether it is on the live trace */
  var EDGES = [
    { a: 'event', b: 'asset',      r: 'concerns',    card: 'N:1', live: 1 },
    { a: 'event', b: 'location',   r: 'occurred_in', card: 'N:1' },
    { a: 'event', b: 'person',     r: 'reported_by', card: 'N:1' },
    { a: 'event', b: 'vehicle',    r: 'concerns',    card: 'N:1' },
    { a: 'event', b: 'workorder',  r: 'raised',      card: '1:N', live: 2 },
    { a: 'sensor',   b: 'event',   r: 'observed',    card: '1:N', live: 0 },
    { a: 'asset',    b: 'location', r: 'located_in', card: 'N:1' },
    { a: 'asset',    b: 'person',  r: 'in_custody',  card: 'N:1' },
    { a: 'workorder',b: 'exception', r: 'breached',  card: '1:N', live: 3 },
    { a: 'workorder',b: 'checklist', r: 'requires',  card: '1:N' },
    { a: 'workorder',b: 'permit',  r: 'gated_by',    card: 'N:1' },
    { a: 'exception',b: 'sla',     r: 'measured_by', card: 'N:1', live: 4 },
    { a: 'sla',      b: 'permit',  r: 'governs',     card: '1:N' },
    { a: 'vehicle',  b: 'checklist', r: 'requires',  card: '1:N' },
    { a: 'vehicle',  b: 'sensor',  r: 'carries',     card: '1:N' },
    { a: 'asset',    b: 'sensor',  r: 'monitored_by', card: '1:N' }
  ];

  /* ── glyphs · shape encodes type, matching the rest of the site ── */
  function glyph(x, y, kind, col, r, focal) {
    var f = focal ? 'rgba(12,22,40,0.98)' : 'rgba(10,18,36,0.96)';
    var sw = focal ? 2.2 : 1.7;
    switch (kind) {
      case 'square':   return '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + r * 2 + '" height="' + r * 2 + '" rx="2.5" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'diamond':  return '<path d="M' + x + ',' + (y - r) + ' L' + (x + r) + ',' + y + ' L' + x + ',' + (y + r) + ' L' + (x - r) + ',' + y + ' Z" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'triangle': return '<path d="M' + x + ',' + (y - r) + ' L' + (x + r * 0.94) + ',' + (y + r * 0.76) + ' L' + (x - r * 0.94) + ',' + (y + r * 0.76) + ' Z" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'hex':
        var p = [];
        for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; p.push((x + Math.cos(a) * r).toFixed(1) + ',' + (y + Math.sin(a) * r).toFixed(1)); }
        return '<polygon points="' + p.join(' ') + '" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'pill':     return '<rect x="' + (x - r * 1.28) + '" y="' + (y - r * 0.7) + '" width="' + r * 2.56 + '" height="' + r * 1.4 + '" rx="' + r * 0.7 + '" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'shield':   return '<path d="M' + (x - r * 0.86) + ',' + (y - r * 0.82) + ' L' + (x + r * 0.86) + ',' + (y - r * 0.82) +
        ' L' + (x + r * 0.86) + ',' + (y + r * 0.2) + ' Q' + x + ',' + (y + r * 1.16) + ' ' + (x - r * 0.86) + ',' + (y + r * 0.2) + ' Z" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'burst':
        var s = '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.44) + '" fill="' + col + '"/>';
        for (var k = 0; k < 8; k++) {
          var th = k * Math.PI / 4;
          s += '<line x1="' + (x + Math.cos(th) * r * 0.68).toFixed(1) + '" y1="' + (y + Math.sin(th) * r * 0.68).toFixed(1) +
               '" x2="' + (x + Math.cos(th) * r * 1.2).toFixed(1) + '" y2="' + (y + Math.sin(th) * r * 1.2).toFixed(1) +
               '" stroke="' + col + '" stroke-width="' + (focal ? 2 : 1.5) + '" stroke-linecap="round"/>';
        }
        return s;
      default:         return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
    }
  }

  /* mono advance, so label boxes measure their real width */
  function adv(fs, ls) { return fs * 0.6 + fs * (ls || 0); }
  function strW(s, fs, ls) { return s.length * adv(fs, ls || 0); }

  function build() {
    var s = '', keepOut = [];
    function reserve(cx, cy, w, h) { keepOut.push([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]); }
    function hits(x0, y0, x1, y1) {
      for (var i = 0; i < keepOut.length; i++) {
        var k = keepOut[i];
        if (x0 < k[2] && x1 > k[0] && y0 < k[3] && y1 > k[1]) return true;
      }
      return false;
    }

    /* reserve node glyphs and their caption stacks up front */
    var LBL_FS = 15, CNT_FS = 12;
    NODES.forEach(function (nd) {
      var r = nd.focal ? 20 : 15;
      reserve(nd.x, nd.y, r * 3.1, r * 3.1);
      var w = Math.max(strW(nd.label, LBL_FS, 0.01), strW(nd.n + ' records', CNT_FS, 0.06)) + 20;
      nd.capW = w;
      nd.capY = nd.y - r - 30;                       // caption sits above the glyph
      reserve(nd.x, nd.capY + 13, w, 42);
    });
    /* reserve the header and legend rails so nothing drifts into them */
    reserve(W / 2, 26, W, 54);
    reserve(W / 2, H - 34, W, 52);   /* footer band, kept inside H */

    /* ── edges, with the original draw-in hooks ── */
    EDGES.forEach(function (e, i) {
      var a = N(e.a), b = N(e.b);
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / len, uy = dy / len;
      var ar = (a.focal ? 22 : 17), br = (b.focal ? 22 : 17);
      var x1 = a.x + ux * ar, y1 = a.y + uy * ar, x2 = b.x - ux * br, y2 = b.y - uy * br;

      s += '<line class="ifs-edge' + (e.live !== undefined ? ' ifs-edge--live' : '') +
        '" style="--ei:' + i + ';--len:' + Math.ceil(len) + '" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) +
        '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';

      /* direction arrow at the target end */
      var ang = Math.atan2(uy, ux), aw = 5.5;
      s += '<path class="ifs-garrow" style="--ei:' + i + '" d="M' +
        (x2 - Math.cos(ang - 0.42) * aw).toFixed(1) + ',' + (y2 - Math.sin(ang - 0.42) * aw).toFixed(1) + ' L' +
        x2.toFixed(1) + ',' + y2.toFixed(1) + ' L' +
        (x2 - Math.cos(ang + 0.42) * aw).toFixed(1) + ',' + (y2 - Math.sin(ang + 0.42) * aw).toFixed(1) + '"/>';

      /* relationship label, walked along the edge until it clears everything */
      var text = e.r + '  ' + e.card, RFS = 11.5;
      var lw = strW(text, RFS, 0.02) + 16, lh = 18;
      var fr = [0.5, 0.42, 0.58, 0.34, 0.66, 0.28, 0.72];
      var mx = 0, my = 0, ok = false;
      for (var f = 0; f < fr.length; f++) {
        mx = x1 + (x2 - x1) * fr[f]; my = y1 + (y2 - y1) * fr[f];
        if (!hits(mx - lw / 2, my - lh / 2, mx + lw / 2, my + lh / 2)) { ok = true; break; }
      }
      if (!ok) {
        var px = -uy, py = ux;
        mx = x1 + (x2 - x1) * 0.5; my = y1 + (y2 - y1) * 0.5;
        for (var d = 13; d <= 40; d += 6) {
          if (!hits(mx + px * d - lw / 2, my + py * d - lh / 2, mx + px * d + lw / 2, my + py * d + lh / 2)) { mx += px * d; my += py * d; break; }
          if (!hits(mx - px * d - lw / 2, my - py * d - lh / 2, mx - px * d + lw / 2, my - py * d + lh / 2)) { mx -= px * d; my -= py * d; break; }
        }
      }
      keepOut.push([mx - lw / 2, my - lh / 2, mx + lw / 2, my + lh / 2]);

      s += '<g class="ifs-grel" style="--ei:' + i + '">' +
        '<rect class="ifs-grel__bg" x="' + (mx - lw / 2).toFixed(1) + '" y="' + (my - lh / 2).toFixed(1) +
          '" width="' + lw.toFixed(1) + '" height="' + lh + '" rx="4"/>' +
        '<text class="ifs-grel__t" x="' + mx.toFixed(1) + '" y="' + (my + 4.2).toFixed(1) +
          '" text-anchor="middle">' + e.r + '<tspan class="ifs-grel__c" dx="6">' + e.card + '</tspan></text>' +
        '</g>';

      /* live traversal pulse on the traced chain */
      if (e.live !== undefined) {
        s += '<circle class="ifs-gpulse" r="3.6" style="--pi:' + e.live + '">' +
          '<animateMotion dur="5.4s" begin="' + (1.6 + e.live * 0.5) + 's" repeatCount="indefinite" path="M' +
          x1.toFixed(1) + ',' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ',' + y2.toFixed(1) + '"/></circle>';
      }
    });

    /* ── nodes ── */
    NODES.forEach(function (nd, i) {
      var r = nd.focal ? 20 : 15;
      s += '<g class="ifs-gnode' + (nd.focal ? ' ifs-gnode--focal' : '') + '" style="--ni:' + i + '">';

      if (nd.focal) {
        s += '<circle class="ifs-gfocus" cx="' + nd.x + '" cy="' + nd.y + '" r="' + (r + 12) + '"/>';
        s += '<circle class="ifs-gfocus-ring" cx="' + nd.x + '" cy="' + nd.y + '" r="' + (r + 20) + '"/>';
      }
      s += glyph(nd.x, nd.y, nd.k, nd.c, r, nd.focal);

      /* caption: type name, then instance count */
      var w = nd.capW, y = nd.capY;
      s += '<rect class="ifs-glabel-bg" x="' + (nd.x - w / 2).toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="42" rx="7"/>';
      s += '<text class="ifs-glabel" x="' + nd.x + '" y="' + (y + 17) + '" text-anchor="middle">' + nd.label + '</text>';
      s += '<text class="ifs-gcount" x="' + nd.x + '" y="' + (y + 33) + '" text-anchor="middle">' + nd.n + ' records</text>';
      s += '</g>';
    });

    /* ── header ── */
    s += '<text class="ifs-ghead" x="26" y="24">OPERATIONAL GRAPH · 11 OBJECT TYPES · 16 TYPED RELATIONSHIPS</text>';
    s += '<text class="ifs-gsub" x="26" y="42">SCHEMA ENFORCED AT WRITE TIME · 12.4M NODES · 86.2M EDGES · 14,820 EVENTS/S</text>';

    /* focal readout, right-aligned so it cannot collide with the header */
    s += '<text class="ifs-gsub ifs-gsub--focal" x="' + (W - 26) + '" y="24" text-anchor="end">TRACING evt_8f21c04b · 4 HOPS · 23 ms</text>';
    s += '<text class="ifs-gsub" x="' + (W - 26) + '" y="42" text-anchor="end">SENSOR → EVENT → WORK ORDER → EXCEPTION → SLA</text>';

    /* ── legend rail ──
       The legend's cumulative advance is measured BEFORE anything is drawn, and
       the schema note gets its own baseline above the rail. Previously both were
       drawn into one reserved band without being checked against each other, so
       the last legend item rendered inside the note. */
    var LEG = [
      { k: 'burst',    c: WARN, t: 'Event' },
      { k: 'square',   c: NET,  t: 'Physical' },
      { k: 'hex',      c: NET,  t: 'Place' },
      { k: 'circle',   c: OK,   t: 'Person' },
      { k: 'triangle', c: NET,  t: 'Device' },
      { k: 'pill',     c: AI,   t: 'Process' },
      { k: 'diamond',  c: CRIT, t: 'Exception' },
      { k: 'shield',   c: AI,   t: 'Policy' }
    ];
    var LEG_FS = 11.5, LEG_LS = 0.06, GLYPH_W = 22, ITEM_GAP = 26;
    var legW = LEG.reduce(function (t, l) { return t + GLYPH_W + strW(l.t, LEG_FS, LEG_LS) + ITEM_GAP; }, 0) - ITEM_GAP;

    var NOTE = 'SHAPE ENCODES TYPE · ARROWS SHOW DIRECTION · CARDINALITY IS ENFORCED';
    var NOTE_FS = 11, NOTE_LS = 0.09;
    var noteW = strW(NOTE, NOTE_FS, NOTE_LS);

    var legY = H - 22;                       // legend baseline, inside the viewBox
    var noteY = legY - 20;                   // note sits on its own line above it

    /* if the legend somehow still overruns the canvas, tighten its gap rather
       than let it run off the edge */
    var lgap = ITEM_GAP;
    if (30 + legW > W - 30) {
      lgap = Math.max(12, ITEM_GAP - (30 + legW - (W - 30)) / (LEG.length - 1));
    }

    var lx = 30;
    LEG.forEach(function (l) {
      s += '<g class="ifs-gleg">' + glyph(lx + 8, legY - 4, l.k, l.c, 7) +
        '<text class="ifs-gleg__t" x="' + (lx + GLYPH_W).toFixed(1) + '" y="' + legY + '">' + l.t + '</text></g>';
      lx += GLYPH_W + strW(l.t, LEG_FS, LEG_LS) + lgap;
    });

    s += '<text class="ifs-gsub" x="' + (W - 26) + '" y="' + noteY + '" text-anchor="end">' + NOTE + '</text>';

    /* reserve the two bands separately, both inside the canvas */
    reserve(30 + legW / 2, legY - 6, legW, 26);
    reserve(W - 26 - noteW / 2, noteY - 5, noteW, 18);

    return s;
  }

  function boot() {
    var svg = document.querySelector('.ifs-graph');
    if (!svg) return;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = build();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
