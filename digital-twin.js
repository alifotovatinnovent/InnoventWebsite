/* ─────────────────────────────────────────────────────────────
   Innfini · Community Digital Twin
   Procedural isometric city block — buildings, streets, parks,
   water, rooftop plant, traffic, sensor coverage and live alerts.
   Renders into <svg id="dt-city">.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var W2 = 41, H2 = 20.5;            // isometric half-width / half-height per grid unit
  var OX = 452, OY = 132;            // screen origin
  var VW = 904, VH = 540;

  function iso(x, y, z) {
    return [OX + (x - y) * W2, OY + (x + y) * H2 - (z || 0)];
  }
  function pts(list) {
    return list.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
  }
  // deterministic PRNG so the skyline never reshuffles between loads
  function rng(seed) {
    var s = seed;
    return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  }

  /* ── the parcel plan: 8×8 community grid ──
     t: tower | mid | low | park | water | plaza | lot   */
  var PLAN = [
    ['mid',  'mid',  'road', 'tower','mid',  'road', 'low',  'low'  ],
    ['mid',  'low',  'road', 'mid',  'mid',  'road', 'low',  'park' ],
    ['road', 'road', 'road', 'road', 'road', 'road', 'road', 'road' ],
    ['tower','mid',  'road', 'plaza','plaza','road', 'mid',  'mid'  ],
    ['mid',  'mid',  'road', 'plaza','tower','road', 'mid',  'low'  ],
    ['road', 'road', 'road', 'road', 'road', 'road', 'road', 'road' ],
    ['park', 'park', 'road', 'low',  'mid',  'road', 'lot',  'lot'  ],
    ['water','water','road', 'low',  'low',  'road', 'lot',  'mid'  ]
  ];

  /* named assets that carry live alerts, keyed to a parcel */
  var ALERTS = [
    { gx: 0, gy: 3, label: 'TOWER A', kind: 'UNAUTH', color: '#fda4af' },
    { gx: 3, gy: 0, label: 'TOWER C', kind: 'FIRE',   color: '#fb7185' },
    { gx: 6, gy: 3, label: 'BLOCK G', kind: 'HVAC',   color: '#fbbf24' },
    { gx: 4, gy: 7, label: 'BLOCK J', kind: 'LEAK',   color: '#38bdf8' }
  ];
  function alertAt(gx, gy) {
    for (var i = 0; i < ALERTS.length; i++) if (ALERTS[i].gx === gx && ALERTS[i].gy === gy) return ALERTS[i];
    return null;
  }

  var FILL = {
    top:   '#2b4d7d',
    right: '#1a3358',
    left:  '#122744',
    topHot:'#3a5c8e'
  };

  function box(x0, y0, x1, y1, h, o) {
    o = o || {};
    var s = '';
    var top   = [iso(x0, y0, h), iso(x1, y0, h), iso(x1, y1, h), iso(x0, y1, h)];
    var right = [iso(x1, y0, h), iso(x1, y1, h), iso(x1, y1, 0), iso(x1, y0, 0)];
    var left  = [iso(x1, y1, h), iso(x0, y1, h), iso(x0, y1, 0), iso(x1, y1, 0)];
    s += '<polygon points="' + pts(left)  + '" fill="' + (o.left  || FILL.left)  + '" stroke="rgba(125,211,252,0.30)" stroke-width="0.6"/>';
    s += '<polygon points="' + pts(right) + '" fill="' + (o.right || FILL.right) + '" stroke="rgba(125,211,252,0.30)" stroke-width="0.6"/>';
    s += '<polygon points="' + pts(top)   + '" fill="' + (o.top   || FILL.top)   + '" stroke="rgba(125,211,252,0.45)" stroke-width="0.7"/>';
    return s;
  }

  /* window grid painted onto both visible faces */
  function windows(x0, y0, x1, y1, h, rand, lit) {
    var s = '', floors = Math.max(2, Math.floor(h / 13)), cols = 3;
    var fh = h / floors;
    for (var f = 0; f < floors; f++) {
      var z0 = f * fh + fh * 0.28, z1 = f * fh + fh * 0.78;
      for (var c = 0; c < cols; c++) {
        var t0 = c / cols + 0.09, t1 = (c + 1) / cols - 0.09;
        // right face (constant x = x1, varying y)
        var ya = y0 + (y1 - y0) * t0, yb = y0 + (y1 - y0) * t1;
        var on = rand() < lit;
        s += '<polygon points="' + pts([iso(x1, ya, z1), iso(x1, yb, z1), iso(x1, yb, z0), iso(x1, ya, z0)]) +
          '" fill="' + (on ? '#fbbf24' : '#7dd3fc') + '" opacity="' + (on ? 0.75 : 0.20) + '"/>';
        // left face (constant y = y1, varying x)
        var xa = x1 - (x1 - x0) * t0, xb = x1 - (x1 - x0) * t1;
        on = rand() < lit;
        s += '<polygon points="' + pts([iso(xa, y1, z1), iso(xb, y1, z1), iso(xb, y1, z0), iso(xa, y1, z0)]) +
          '" fill="' + (on ? '#fbbf24' : '#7dd3fc') + '" opacity="' + (on ? 0.62 : 0.14) + '"/>';
      }
    }
    return s;
  }

  function roofPlant(x0, y0, x1, y1, h, rand, big) {
    var s = '', n = big ? 3 : 2;
    for (var i = 0; i < n; i++) {
      var px = x0 + 0.16 + rand() * (x1 - x0 - 0.34);
      var py = y0 + 0.16 + rand() * (y1 - y0 - 0.34);
      var w = 0.13, ph = 4 + rand() * 4;
      s += box(px, py, px + w, py + w, h + ph, { top: '#3d6395', right: '#25436d', left: '#1b3255' });
    }
    if (big) {
      // helipad
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      var r = Math.min(x1 - x0, y1 - y0) * 0.22;
      var ring = [];
      for (var a = 0; a < 16; a++) {
        var th = a / 16 * Math.PI * 2;
        ring.push(iso(cx + Math.cos(th) * r, cy + Math.sin(th) * r, h + 0.4));
      }
      s += '<polygon points="' + pts(ring) + '" fill="none" stroke="rgba(251,191,36,0.55)" stroke-width="1"/>';
    }
    return s;
  }

  function render(svg) {
    var rand = rng(20260821);
    var s = '';

    s += '<defs>' +
      '<radialGradient id="dt-glow" cx="50%" cy="45%" r="60%">' +
        '<stop offset="0%" stop-color="#3b82f6" stop-opacity="0.20"/>' +
        '<stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="dt-water" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#0e3a5c"/><stop offset="100%" stop-color="#0a2742"/></linearGradient>' +
      '</defs>';

    s += '<rect width="' + VW + '" height="' + VH + '" fill="#070f1e"/>';
    s += '<ellipse cx="' + OX + '" cy="' + (OY + 150) + '" rx="430" ry="250" fill="url(#dt-glow)"/>';

    /* ground plate */
    var g0 = iso(0, 0, 0), g1 = iso(8, 0, 0), g2 = iso(8, 8, 0), g3 = iso(0, 8, 0);
    s += '<polygon points="' + pts([g0, g1, g2, g3]) + '" fill="#0b1727" stroke="rgba(125,211,252,0.28)" stroke-width="1"/>';

    /* street grid lines on the plate */
    var grid = '';
    for (var i = 0; i <= 8; i++) {
      grid += '<line x1="' + iso(i, 0)[0] + '" y1="' + iso(i, 0)[1] + '" x2="' + iso(i, 8)[0] + '" y2="' + iso(i, 8)[1] + '"/>';
      grid += '<line x1="' + iso(0, i)[0] + '" y1="' + iso(0, i)[1] + '" x2="' + iso(8, i)[0] + '" y2="' + iso(8, i)[1] + '"/>';
    }
    s += '<g stroke="rgba(125,211,252,0.11)" stroke-width="0.7">' + grid + '</g>';

    /* parcels, drawn back-to-front */
    var cells = [];
    for (var gy = 0; gy < 8; gy++) for (var gx = 0; gx < 8; gx++) cells.push([gx, gy]);
    cells.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });

    var markers = '';

    cells.forEach(function (c) {
      var gx = c[0], gy = c[1], kind = PLAN[gy][gx];
      var pad = 0.12;
      var x0 = gx + pad, y0 = gy + pad, x1 = gx + 1 - pad, y1 = gy + 1 - pad;
      var al = alertAt(gx, gy);

      if (kind === 'road') {
        s += '<polygon points="' + pts([iso(gx, gy), iso(gx + 1, gy), iso(gx + 1, gy + 1), iso(gx, gy + 1)]) +
          '" fill="#0d1c30" stroke="rgba(125,211,252,0.10)" stroke-width="0.5"/>';
        // lane dashes + streetlights
        var m0 = iso(gx + 0.5, gy + 0.08), m1 = iso(gx + 0.5, gy + 0.92);
        s += '<line x1="' + m0[0] + '" y1="' + m0[1] + '" x2="' + m1[0] + '" y2="' + m1[1] +
          '" stroke="rgba(125,211,252,0.22)" stroke-width="0.7" stroke-dasharray="3 4"/>';
        if ((gx + gy) % 3 === 0) {
          var lp = iso(gx + 0.08, gy + 0.08, 0), lt = iso(gx + 0.08, gy + 0.08, 8);
          s += '<line x1="' + lp[0] + '" y1="' + lp[1] + '" x2="' + lt[0] + '" y2="' + lt[1] + '" stroke="rgba(125,211,252,0.35)" stroke-width="0.8"/>';
          s += '<circle cx="' + lt[0] + '" cy="' + lt[1] + '" r="1.7" fill="#fbbf24" opacity="0.85"/>';
        }
        return;
      }

      if (kind === 'water') {
        s += '<polygon points="' + pts([iso(x0, y0), iso(x1, y0), iso(x1, y1), iso(x0, y1)]) +
          '" fill="url(#dt-water)" stroke="rgba(56,189,248,0.45)" stroke-width="0.8"/>';
        for (var w = 0; w < 3; w++) {
          var wy = y0 + (y1 - y0) * (0.25 + w * 0.25);
          var a = iso(x0 + 0.08, wy), b = iso(x1 - 0.08, wy);
          s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] +
            '" stroke="rgba(125,211,252,0.30)" stroke-width="0.7"><animate attributeName="stroke-opacity" values="0.15;0.5;0.15" dur="' +
            (3 + w) + 's" repeatCount="indefinite"/></line>';
        }
        return;
      }

      if (kind === 'park') {
        s += '<polygon points="' + pts([iso(x0, y0), iso(x1, y0), iso(x1, y1), iso(x0, y1)]) +
          '" fill="#10301f" stroke="rgba(110,231,183,0.35)" stroke-width="0.7"/>';
        for (var t = 0; t < 5; t++) {
          var tx = x0 + 0.12 + rand() * (x1 - x0 - 0.24);
          var ty = y0 + 0.12 + rand() * (y1 - y0 - 0.24);
          var tb = iso(tx, ty, 0), tt = iso(tx, ty, 5 + rand() * 4);
          s += '<line x1="' + tb[0] + '" y1="' + tb[1] + '" x2="' + tt[0] + '" y2="' + tt[1] + '" stroke="#1f6b45" stroke-width="1.1"/>';
          s += '<circle cx="' + tt[0] + '" cy="' + tt[1] + '" r="' + (3 + rand() * 1.6).toFixed(1) + '" fill="#2f8f5b" opacity="0.85"/>';
        }
        return;
      }

      if (kind === 'plaza') {
        s += '<polygon points="' + pts([iso(x0, y0), iso(x1, y0), iso(x1, y1), iso(x0, y1)]) +
          '" fill="#132842" stroke="rgba(125,211,252,0.30)" stroke-width="0.7"/>';
        // crowd density heat + people dots
        if (al) {
          var cc = iso((x0 + x1) / 2, (y0 + y1) / 2, 0);
          s += '<ellipse cx="' + cc[0] + '" cy="' + cc[1] + '" rx="30" ry="15" fill="' + al.color + '" opacity="0.16">' +
            '<animate attributeName="opacity" values="0.08;0.26;0.08" dur="2.6s" repeatCount="indefinite"/></ellipse>';
        }
        for (var p = 0; p < 9; p++) {
          var px = x0 + 0.1 + rand() * (x1 - x0 - 0.2), py = y0 + 0.1 + rand() * (y1 - y0 - 0.2);
          var pp = iso(px, py, 1.5);
          s += '<circle cx="' + pp[0] + '" cy="' + pp[1] + '" r="1.3" fill="#93c5fd" opacity="0.7"/>';
        }
        return;
      }

      if (kind === 'lot') {
        s += '<polygon points="' + pts([iso(x0, y0), iso(x1, y0), iso(x1, y1), iso(x0, y1)]) +
          '" fill="#0f2036" stroke="rgba(125,211,252,0.22)" stroke-width="0.7"/>';
        for (var v = 0; v < 4; v++) {
          var vx = x0 + 0.12 + (v % 2) * 0.42, vy = y0 + 0.14 + Math.floor(v / 2) * 0.42;
          s += box(vx, vy, vx + 0.26, vy + 0.18, 3, { top: '#33557f', right: '#1d3a5e', left: '#152c48' });
        }
        return;
      }

      /* buildings */
      var h = kind === 'tower' ? 96 + rand() * 58 : kind === 'mid' ? 46 + rand() * 26 : 22 + rand() * 14;
      var hot = !!al;
      s += box(x0, y0, x1, y1, h, hot ? { top: FILL.topHot } : null);
      s += windows(x0, y0, x1, y1, h, rand, kind === 'tower' ? 0.30 : 0.20);
      s += roofPlant(x0, y0, x1, y1, h, rand, kind === 'tower');

      // sensor node on every building roof
      var sp = iso(x1 - 0.14, y0 + 0.14, h + 2);
      s += '<circle cx="' + sp[0] + '" cy="' + sp[1] + '" r="1.6" fill="#7dd3fc" opacity="0.85"/>';

      if (al) {
        var mp = iso((x0 + x1) / 2, (y0 + y1) / 2, h + 16);
        markers += '<g class="dt-alert">' +
          '<line x1="' + mp[0] + '" y1="' + (mp[1] + 12) + '" x2="' + mp[0] + '" y2="' + (mp[1] + 4) + '" stroke="' + al.color + '" stroke-width="1" stroke-opacity="0.5"/>' +
          '<circle cx="' + mp[0] + '" cy="' + mp[1] + '" r="7" fill="none" stroke="' + al.color + '" stroke-width="1.4">' +
            '<animate attributeName="r" values="6;22;6" dur="2.6s" repeatCount="indefinite"/>' +
            '<animate attributeName="opacity" values="0.85;0;0.85" dur="2.6s" repeatCount="indefinite"/></circle>' +
          '<circle cx="' + mp[0] + '" cy="' + mp[1] + '" r="14" fill="' + al.color + '" opacity="0.14"/>' +
          '<circle cx="' + mp[0] + '" cy="' + mp[1] + '" r="4.6" fill="' + al.color + '" stroke="rgba(7,15,30,0.9)" stroke-width="1.1"/>' +
          '<text x="' + mp[0] + '" y="' + (mp[1] - 12) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="8" letter-spacing="0.12em" fill="' + al.color + '">' +
            al.label + ' · ' + al.kind + '</text>' +
          '</g>';
      }
    });

    /* traffic: vehicles running the avenues */
    var routes = [
      { path: [iso(0.5, 2.5), iso(7.5, 2.5)], c: '#6ee7b7', dur: 9 },
      { path: [iso(7.5, 5.5), iso(0.5, 5.5)], c: '#7dd3fc', dur: 11 },
      { path: [iso(2.5, 0.5), iso(2.5, 7.5)], c: '#c4b5fd', dur: 10 },
      { path: [iso(5.5, 7.5), iso(5.5, 0.5)], c: '#fbbf24', dur: 12 }
    ];
    routes.forEach(function (r, i) {
      var d = 'M' + r.path[0][0].toFixed(1) + ',' + r.path[0][1].toFixed(1) +
              ' L' + r.path[1][0].toFixed(1) + ',' + r.path[1][1].toFixed(1);
      s += '<path d="' + d + '" fill="none" stroke="' + r.c + '" stroke-opacity="0.18" stroke-width="1" stroke-dasharray="3 5"/>';
      for (var k = 0; k < 2; k++) {
        s += '<circle r="2.4" fill="' + r.c + '" opacity="0.9">' +
          '<animateMotion dur="' + r.dur + 's" begin="' + (i * 0.7 + k * r.dur / 2) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
      }
    });

    s += markers;

    /* scan sweep across the twin */
    s += '<g opacity="0.5"><line x1="' + (OX - 300) + '" y1="' + (OY - 40) + '" x2="' + (OX - 300) + '" y2="' + (OY + 300) +
      '" stroke="#7dd3fc" stroke-width="1.6" stroke-opacity="0.35">' +
      '<animate attributeName="x1" values="' + (OX - 300) + ';' + (OX + 300) + ';' + (OX - 300) + '" dur="9s" repeatCount="indefinite"/>' +
      '<animate attributeName="x2" values="' + (OX - 300) + ';' + (OX + 300) + ';' + (OX - 300) + '" dur="9s" repeatCount="indefinite"/>' +
      '</line></g>';

    /* HUD */
    var MONO = 'ui-monospace, Menlo, monospace';
    function hud(x, y, t, o) {
      o = o || {};
      return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + (o.size || 9) +
        '" letter-spacing="' + (o.ls || '0.14em') + '" fill="' + (o.fill || 'rgba(207,224,245,0.55)') + '"' +
        (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + '>' + t + '</text>';
    }
    s += hud(20, 26, 'DIGITAL TWIN · MARINA DISTRICT', { fill: '#7dd3fc', size: 9.5, ls: '0.18em' });
    s += hud(20, 40, 'LOD 3 · 42 ASSETS · 1,860 SENSORS · SYNC 1.2s', { size: 8.5, fill: 'rgba(207,224,245,0.42)' });

    var legend = [
      ['#fb7185', 'Fire'], ['#fda4af', 'Security'], ['#fbbf24', 'Facility'], ['#38bdf8', 'Utility'], ['#6ee7b7', 'Units']
    ];
    legend.forEach(function (l, i) {
      var ly = VH - 62 + i * 13;
      s += '<circle cx="24" cy="' + (ly - 3) + '" r="3.2" fill="' + l[0] + '"/>';
      s += hud(34, ly, l[1], { size: 8.5, ls: '0.1em' });
    });

    s += hud(VW - 20, VH - 36, '5 ACTIVE ALERTS · 12 UNITS DEPLOYED', { anchor: 'end', size: 8.5, fill: 'rgba(207,224,245,0.5)' });
    s += hud(VW - 20, VH - 22, 'TWIN SYNC NOMINAL', { anchor: 'end', size: 8.5, fill: '#6ee7b7' });

    svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  function boot() {
    var svg = document.getElementById('dt-city');
    if (svg) render(svg);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
