/* ─────────────────────────────────────────────────────────────
   Innfini · Object & Event Graph — typed lanes, time flows right
   A causality trace, not a node cloud. Each object type owns a
   horizontal lane; every node sits at its real timestamp; edges
   are orthogonal connectors between lanes, so the eye follows a
   chain of consequence instead of untangling spaghetti.
   Animation: a token travelling the causal chain + a now playhead.
   Renders into <svg data-oeg-explorer>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var NET = '#7dd3fc', OK = '#6ee7b7', AI = '#c4b5fd', WARN = '#fbbf24', CRIT = '#fb7185';
  var INK = 'rgba(230,240,251,0.92)', INK3 = 'rgba(113,133,158,0.85)';

  /* Authored at the width this panel actually gives us (~786px), NOT wider:
     a 960-unit viewBox in a 786px box scaled every font to 0.82, rendering
     annotations at 4.9-6.7px. Floor: no text below 9px effective. */
  var W = 780, H = 560;
  var GUT = 170, X0 = GUT + 26, X1 = W - 34;      // lane-label gutter, then the time field
  var TOP = 92, LANE_H = 66, SPAN = 8;            // 8 half-minute steps

  var LANES = [
    { id: 'EVENT',    k: 'burst',    c: WARN, n: '860M' },
    { id: 'DEVICE',   k: 'triangle', c: NET,  n: '1.9M' },
    { id: 'ASSET',    k: 'square',   c: NET,  n: '4.2M' },
    { id: 'PLACE',    k: 'hex',      c: NET,  n: '58k'  },
    { id: 'INCIDENT', k: 'diamond',  c: CRIT, n: '390k' },
    { id: 'WORKFLOW', k: 'pill',     c: AI,   n: '2.8M' }
  ];
  function ly(i) { return TOP + i * LANE_H; }
  function tx(t) { return X0 + (t / SPAN) * (X1 - X0); }

  /* lane index, time, label, and whether it is on the causal chain */
  var NODES = [
    { l: 1, t: 0.4, id: 'GW-07 UP',      sub: 'online' },
    { l: 0, t: 1.4, id: 'RFID SCAN',     sub: 'R-04 · 0.94', chain: 0 },
    { l: 2, t: 2.1, id: 'ASSET MOVED',   sub: 'P-8821',      chain: 1 },
    { l: 3, t: 2.7, id: 'DOCK-2 IN',     sub: 'geofence',    chain: 2 },
    { l: 0, t: 3.5, id: 'GEOFENCE EXIT', sub: 'unexpected',  chain: 3 },
    { l: 4, t: 4.2, id: 'MIS-ROUTE',     sub: 'sev med',     chain: 4 },
    { l: 5, t: 5.2, id: 'R-AUTO-FIX',    sub: 'rule fired',  chain: 5 },
    { l: 5, t: 6.2, id: 'SOP-114 OPEN',  sub: 'workflow',    chain: 6 },
    { l: 2, t: 7.0, id: 'REROUTED',      sub: 'P-8821',      chain: 7 },
    { l: 0, t: 7.7, id: 'CONFIRM SCAN',  sub: 'R-11 · 0.97', chain: 8 },
    { l: 3, t: 1.9, id: 'BAY 12',        sub: 'dwell 40s' },
    { l: 1, t: 6.1, id: 'GW-07 ACK',     sub: 'ack ok' }
  ];

  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + (o.size || 9) +
      '" letter-spacing="' + (o.ls || '0.08em') + '" fill="' + (o.fill || INK3) + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }

  function glyph(x, y, kind, col, r) {
    var f = 'rgba(9,17,30,0.97)', sw = 1.4;
    switch (kind) {
      case 'square':   return '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + r * 2 + '" height="' + r * 2 + '" rx="2" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'diamond':  return '<path d="M' + x + ',' + (y - r) + ' L' + (x + r) + ',' + y + ' L' + x + ',' + (y + r) + ' L' + (x - r) + ',' + y + ' Z" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'triangle': return '<path d="M' + x + ',' + (y - r) + ' L' + (x + r) + ',' + (y + r * 0.8) + ' L' + (x - r) + ',' + (y + r * 0.8) + ' Z" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'hex': var p = [];
        for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; p.push((x + Math.cos(a) * r).toFixed(1) + ',' + (y + Math.sin(a) * r).toFixed(1)); }
        return '<polygon points="' + p.join(' ') + '" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'pill':     return '<rect x="' + (x - r * 1.3) + '" y="' + (y - r * 0.7) + '" width="' + r * 2.6 + '" height="' + r * 1.4 + '" rx="' + r * 0.7 + '" fill="' + f + '" stroke="' + col + '" stroke-width="' + sw + '"/>';
      case 'burst':
        var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r * 0.45 + '" fill="' + col + '"/>';
        for (var k = 0; k < 8; k++) {
          var th = k * Math.PI / 4;
          s += '<line x1="' + (x + Math.cos(th) * r * 0.7) + '" y1="' + (y + Math.sin(th) * r * 0.7) +
               '" x2="' + (x + Math.cos(th) * r * 1.2) + '" y2="' + (y + Math.sin(th) * r * 1.2) +
               '" stroke="' + col + '" stroke-width="1.2"/>';
        }
        return s;
    }
    return '';
  }

  function render(svg) {
    var s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';

    /* header */
    s += txt(24, 32, 'CAUSALITY TRACE · TYPED LANES · TIME FLOWS RIGHT', { size: 10, fill: NET, ls: '0.18em', w: 700 });
    s += txt(24, 50, 'ONE CHAIN OF CONSEQUENCE · SIX OBJECT TYPES · 90 SECONDS', { size: 9, fill: INK3, ls: '0.06em' });

    /* lane rails + gutter labels */
    LANES.forEach(function (L, i) {
      var y = ly(i);
      s += '<rect x="' + X0 + '" y="' + (y - LANE_H / 2 + 4) + '" width="' + (X1 - X0) + '" height="' + (LANE_H - 8) +
        '" fill="' + L.c + '" fill-opacity="' + (i % 2 ? 0.018 : 0.032) + '"/>';
      s += '<line x1="' + X0 + '" y1="' + y + '" x2="' + X1 + '" y2="' + y + '" stroke="' + L.c + '" stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 5"/>';
      /* gutter */
      s += glyph(44, y, L.k, L.c, 11);
      s += txt(64, y - 3, L.id, { size: 10, fill: L.c, ls: '0.16em', w: 700 });
      s += txt(64, y + 11, L.n + ' nodes', { size: 9, fill: INK3, ls: '0.02em' });
      s += '<line x1="' + (GUT + 2) + '" y1="' + (y - LANE_H / 2 + 6) + '" x2="' + (GUT + 2) + '" y2="' + (y + LANE_H / 2 - 6) + '" stroke="' + L.c + '" stroke-opacity="0.2" stroke-width="1"/>';
    });
    s += '<line x1="' + (GUT + 10) + '" y1="' + (TOP - 34) + '" x2="' + (GUT + 10) + '" y2="' + (ly(LANES.length - 1) + 34) + '" stroke="rgba(125,211,252,0.14)" stroke-width="1"/>';

    /* time axis */
    var axisY = ly(LANES.length - 1) + 44;
    s += '<line x1="' + X0 + '" y1="' + axisY + '" x2="' + X1 + '" y2="' + axisY + '" stroke="rgba(125,211,252,0.28)" stroke-width="1"/>';
    for (var t = 0; t <= SPAN; t++) {
      var x = tx(t);
      s += '<line x1="' + x + '" y1="' + axisY + '" x2="' + x + '" y2="' + (axisY + 5) + '" stroke="rgba(125,211,252,0.28)" stroke-width="0.9"/>';
      if (t % 2 === 0) s += txt(x, axisY + 18, '14:3' + (1 + t / 2), { size: 9, anchor: 'middle', fill: INK3 });
    }

    var chainOrder = [];
    NODES.forEach(function (n, i) { if (n.chain !== undefined) chainOrder[n.chain] = i; });
    function sideFor(n, idx) {
      if (n.chain === undefined) return idx % 2 === 0;
      var nx = chainOrder[n.chain + 1], pv = chainOrder[n.chain - 1];
      if (nx !== undefined) return ly(NODES[nx].l) > ly(n.l);      // hop goes down → caption up
      if (pv !== undefined) return !(ly(n.l) > ly(NODES[pv].l));   // arrived downward → caption down
      return true;
    }
    /* Mono advance derived from the SAME size + letter-spacing the txt() calls
       use, plus a gutter pad: the hardcoded 6.2 / 5.6 under-measured real glyph
       width, so overlapping captions tested as non-overlapping and were never
       reconciled — and the blockers built from them under-reserved too. */
    function advance(fontSize, lsEm) { return fontSize * 0.6 + fontSize * lsEm; }
    var ID_ADV = advance(10, 0.04), SUB_ADV = advance(9, 0.02), CAP_PAD = 4;

    function makeCap(n, idx, up) {
      var x = tx(n.t), y = ly(n.l), r = n.chain !== undefined ? 10 : 8;
      var cy = up ? y - r - 9 : y + r + 13;
      var w = Math.max(n.id.length * ID_ADV, n.sub.length * SUB_ADV) + CAP_PAD * 2;
      var y0 = up ? cy - 12 - 11 : cy - 11;
      return { up: up, cy: cy, r: r, x: x, y: y, w: w, box: [x - w / 2, y0, x + w / 2, y0 + 25] };
    }
    var capBox = NODES.map(function (n, idx) { return makeCap(n, idx, sideFor(n, idx)); });

    /* INVARIANT: no two caption boxes on the same side may overlap.
       Direction-derived sides can put two same-lane neighbours on the same side
       with no room between them; flipping the shorter caption is safe because a
       same-lane hop has a degenerate vertical band, so neither side can be struck. */
    (function reconcile() {
      for (var pass = 0; pass < 4; pass++) {
        var moved = false;
        for (var i = 0; i < capBox.length; i++) {
          for (var j = i + 1; j < capBox.length; j++) {
            var A = capBox[i], B = capBox[j];
            if (A.up !== B.up) continue;
            if (A.box[0] >= B.box[2] || A.box[2] <= B.box[0]) continue;
            if (A.box[1] >= B.box[3] || A.box[3] <= B.box[1]) continue;
            var k = A.w <= B.w ? i : j;                       // flip the shorter one
            var flipped = makeCap(NODES[k], k, !capBox[k].up);
            capBox[k] = flipped;
            moved = true;
          }
        }
        if (!moved) return;
      }
    })();
    function badgeHits(bx, by, all) {
      for (var i = 0; i < all.length; i++) {
        var k = all[i].box;
        if (bx - 9 < k[2] && bx + 9 > k[0] && by - 9 < k[3] && by + 9 > k[1]) return true;
      }
      return false;
    }

    /* ── the causal chain, orthogonal routing ── */
    var chain = NODES.map(function (n, idx) { return { n: n, i: idx }; })
      .filter(function (o) { return o.n.chain !== undefined; })
      .sort(function (x, y) { return x.n.chain - y.n.chain; })
      .map(function (o) { return { x: tx(o.n.t), y: ly(o.n.l), i: o.i }; });

    /* The vertical leg used to sit at the x-midpoint of the two nodes, which
       falls inside a caption box whenever chained nodes are close in time —
       striking through the label. Route it through the GAP between the two
       endpoints' caption boxes, falling back to a scan that clears them all. */
    /* Blockers = every caption box PLUS a reserved column on each side of a chain
       node where its step badge may land. The badge boxes were missing before,
       so a leg could strike a numeral. */
    var HALO = 4;
    var blockers = capBox.map(function (c) { return c.box; });
    chainIdx().forEach(function (ci) {
      var c = capBox[ci], r = c.r;
      [c.x + r + 8, c.x - r - 8].forEach(function (bx) {
        blockers.push([bx - 9, c.y - r - 15, bx + 9, c.y + r + 15]);
      });
    });
    function chainIdx() {
      var out = [];
      NODES.forEach(function (n, i) { if (n.chain !== undefined) out.push(i); });
      return out;
    }

    /* A leg is legal at x when it crosses no blocker inside its own y-band.
       The search is NOT confined to the span between the two nodes: when both
       endpoint captions cover that span entirely there is no legal x inside it,
       which is what left legs sitting on top of the source caption. */
    function legX(p, q) {
      var yTop = Math.min(p.y, q.y), yBot = Math.max(p.y, q.y);
      function clear(x) {
        if (x < X0 + 6 || x > X1 - 6) return false;
        for (var k = 0; k < blockers.length; k++) {
          var box = blockers[k];
          if (box[1] > yBot || box[3] < yTop) continue;
          if (x + HALO > box[0] && x - HALO < box[2]) return false;
        }
        return true;
      }
      /* INVARIANT: the leg never leaves the span between the two nodes. Time
         flows right in this diagram, so a leg outside the span reads as the
         chain of consequence travelling backwards. */
      var lo = Math.min(p.x, q.x), hi = Math.max(p.x, q.x);
      var best = null, bestD = Infinity, midX = (lo + hi) / 2;
      for (var t = 0; t <= 40; t++) {
        var x = lo + (hi - lo) * (t / 40);
        if (clear(x) && Math.abs(x - midX) < bestD) { best = x; bestD = Math.abs(x - midX); }
      }
      if (best !== null) return best;
      /* no fully clear interior x: take the one with least overlap, still inside */
      var least = midX, leastPen = Infinity;
      for (var t2 = 0; t2 <= 40; t2++) {
        var x2 = lo + (hi - lo) * (t2 / 40), pen = 0;
        for (var k2 = 0; k2 < blockers.length; k2++) {
          var bx2 = blockers[k2];
          if (bx2[1] > yBot || bx2[3] < yTop) continue;
          var ov = Math.min(x2 + HALO, bx2[2]) - Math.max(x2 - HALO, bx2[0]);
          if (ov > 0) pen += ov;
        }
        if (pen < leastPen) { leastPen = pen; least = x2; }
      }
      return least;
    }

    var d = 'M' + chain[0].x.toFixed(1) + ',' + chain[0].y.toFixed(1);
    for (var i = 1; i < chain.length; i++) {
      var a = chain[i - 1], b = chain[i], mx = legX(a, b);
      if (Math.abs(a.y - b.y) < 0.6) {
        d += ' L' + b.x.toFixed(1) + ',' + b.y.toFixed(1);       // same lane: straight run
      } else if (Math.abs(mx - a.x) < 0.6) {
        d += ' L' + a.x.toFixed(1) + ',' + b.y.toFixed(1) + ' L' + b.x.toFixed(1) + ',' + b.y.toFixed(1);
      } else if (Math.abs(mx - b.x) < 0.6) {
        d += ' L' + b.x.toFixed(1) + ',' + a.y.toFixed(1) + ' L' + b.x.toFixed(1) + ',' + b.y.toFixed(1);
      } else {
        d += ' L' + mx.toFixed(1) + ',' + a.y.toFixed(1) + ' L' + mx.toFixed(1) + ',' + b.y.toFixed(1) +
             ' L' + b.x.toFixed(1) + ',' + b.y.toFixed(1);
      }
    }
    s += '<path d="' + d + '" fill="none" stroke="' + WARN + '" stroke-opacity="0.20" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + WARN + '" stroke-opacity="0.9" stroke-width="1.8" stroke-linejoin="round"/>';
    /* travelling token */
    s += '<circle r="4.2" fill="' + WARN + '" stroke="#070f1e" stroke-width="1.2">' +
      '<animateMotion dur="7s" repeatCount="indefinite" path="' + d + '" keyPoints="0;1" keyTimes="0;1" calcMode="linear"/></circle>';

    /* faint non-chain relationships */
    [[10, 3], [11, 7]].forEach(function (pair) {
      var n = NODES[pair[0]], m = NODES[pair[1]];
      if (!n || !m) return;
      var ax = tx(n.t), ay = ly(n.l), bx = tx(m.t), by = ly(m.l), mid = ((ax + bx) / 2).toFixed(1);
      s += '<path d="M' + ax + ',' + ay + ' L' + mid + ',' + ay + ' L' + mid + ',' + by + ' L' + bx + ',' + by +
        '" fill="none" stroke="' + NET + '" stroke-opacity="0.16" stroke-width="1" stroke-dasharray="3 4"/>';
    });

    /* ── nodes ──
       Captions alternate above/below the rail. Badges are then placed against a
       keep-out set built from EVERY caption first: per-node parity alone was not
       enough, because two nodes sharing a lane with opposite parity put one's
       badge into the other's caption band. */

    NODES.forEach(function (n, idx) {
      var c = capBox[idx], x = c.x, y = c.y, L = LANES[n.l], onChain = n.chain !== undefined, r = c.r;
      if (onChain) s += '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 7) + '" fill="' + WARN + '" fill-opacity="0.10"/>';
      s += glyph(x, y, L.k, L.c, r);
      s += txt(x, c.cy, n.id, { size: 10, anchor: 'middle', fill: onChain ? INK : 'rgba(230,240,251,0.55)', ls: '0.04em', w: onChain ? 700 : 400 });
      s += txt(x, c.cy + (c.up ? -12 : 12), n.sub, { size: 9, anchor: 'middle', fill: INK3, ls: '0.02em' });

      if (!onChain) return;
      /* candidates: opposite side first, then same side, then further out */
      var cands = c.up
        ? [[x + r + 8, y + r + 6], [x - r - 8, y + r + 6], [x + r + 8, y - r - 6], [x - r - 8, y - r - 6]]
        : [[x + r + 8, y - r - 6], [x - r - 8, y - r - 6], [x + r + 8, y + r + 6], [x - r - 8, y + r + 6]];
      var bx = cands[0][0], by = cands[0][1];
      for (var k = 0; k < cands.length; k++) {
        if (!badgeHits(cands[k][0], cands[k][1], capBox)) { bx = cands[k][0]; by = cands[k][1]; break; }
      }
      s += '<circle cx="' + bx + '" cy="' + by + '" r="8.5" fill="#0a1424" stroke="' + WARN + '" stroke-opacity="0.6" stroke-width="0.8"/>';
      s += txt(bx, by + 3.2, String(n.chain + 1), { size: 9, anchor: 'middle', fill: WARN, ls: '0', w: 700 });
    });

    /* now playhead sweeping the field */
    s += '<g><line x1="' + X0 + '" y1="' + (TOP - 30) + '" x2="' + X0 + '" y2="' + (axisY + 2) +
      '" stroke="' + NET + '" stroke-opacity="0.5" stroke-width="1.4">' +
      '<animate attributeName="x1" values="' + X0 + ';' + X1 + '" dur="7s" repeatCount="indefinite"/>' +
      '<animate attributeName="x2" values="' + X0 + ';' + X1 + '" dur="7s" repeatCount="indefinite"/></line></g>';

    /* Footer: the mount already carries .oeg__panel-foot with nodes /
       relationships / events-per-second / latency, so the drawing reports only
       what is unique to it. Both rails printed the same numbers twice. */
    s += '<line x1="24" y1="' + (H - 40) + '" x2="' + (W - 24) + '" y2="' + (H - 40) + '" stroke="rgba(125,211,252,0.1)" stroke-width="0.8"/>';
    s += '<circle cx="28" cy="' + (H - 17) + '" r="3.4" fill="' + WARN + '"/>';
    s += txt(38, H - 14, 'CAUSAL CHAIN · RFID SCAN → ASSET REROUTED · 9 STEPS', { size: 9, fill: WARN, ls: '0.1em', w: 700 });

    /* The drawing owns its ratio, whatever it is mounted in: stamp the SVG
       itself (works in any wrapper) and the wrapper when it is a sized canvas.
       A hardcoded ratio in CSS goes stale the moment the concept changes. */
    svg.style.aspectRatio = W + ' / ' + H;
    svg.style.width = '100%';
    svg.style.height = 'auto';
    var host = svg.parentNode;
    if (host && host.classList && (host.classList.contains('mk__canvas') || host.classList.contains('oeg__graph-wrap'))) {
      host.style.aspectRatio = W + ' / ' + H;
    }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-oeg-explorer]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
