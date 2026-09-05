/* ─────────────────────────────────────────────────────────────
   Innfini · Data-hall floor view (DCIM)
   Top-down raised-floor plan: cabinet rows in hot/cold aisle
   containment, CRAC units, power train, thermal overlay and
   live alarms. Renders into any <svg data-dc-floor>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

  /* four cabinet rows, 12 cabinets each; temp in °C at the inlet */
  var ROWS = [
    { id: 'A', y: 96,  base: 21.4 },
    { id: 'B', y: 168, base: 22.1 },
    { id: 'C', y: 258, base: 22.8 },
    { id: 'D', y: 330, base: 21.9 }
  ];
  var COLS = 12, X0 = 118, CW = 30, CGAP = 4, RH = 46;

  /* the rack that is running hot — matches the alarm cards */
  var HOT = { row: 'C', col: 4, temp: 34.2 };
  var WARM = [{ row: 'C', col: 3 }, { row: 'C', col: 5 }, { row: 'B', col: 4 }];

  function tempColor(t) {
    if (t >= 32) return '#fb7185';
    if (t >= 27) return '#fbbf24';
    if (t >= 24) return '#a3e635';
    return '#7dd3fc';
  }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + (o.size || 8) +
      '" letter-spacing="' + (o.ls || '0.12em') + '" fill="' + (o.fill || 'rgba(169,189,214,0.6)') + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }

  function render(svg, dense) {
    var W = 640, H = 480, s = '';

    s += '<defs>' +
      '<radialGradient id="dcf-hot" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#fb7185" stop-opacity="0.55"/>' +
        '<stop offset="55%" stop-color="#fbbf24" stop-opacity="0.22"/>' +
        '<stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="dcf-cold" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.14"/>' +
        '<stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.03"/></linearGradient>' +
      '<linearGradient id="dcf-warm" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#fb7185" stop-opacity="0.16"/>' +
        '<stop offset="100%" stop-color="#fb7185" stop-opacity="0.04"/></linearGradient>' +
      '</defs>';

    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';

    /* raised-floor tile grid */
    var tiles = '';
    for (var x = 100; x <= 560; x += 20) tiles += '<line x1="' + x + '" y1="70" x2="' + x + '" y2="400"/>';
    for (var y = 70; y <= 400; y += 20) tiles += '<line x1="100" y1="' + y + '" x2="560" y2="' + y + '"/>';
    s += '<g stroke="rgba(125,211,252,0.055)" stroke-width="0.5">' + tiles + '</g>';
    s += '<rect x="100" y="70" width="460" height="330" fill="none" stroke="rgba(125,211,252,0.28)" stroke-width="1"/>';

    /* floor-tile coordinate ruler */
    if (dense) {
      for (var c = 0; c < COLS; c++) {
        s += txt(X0 + c * (CW + CGAP) + CW / 2, 64, String(c + 1).padStart(2, '0'), { size: 6.5, anchor: 'middle', fill: 'rgba(125,211,252,0.34)' });
      }
      ROWS.forEach(function (r) { s += txt(110, r.y + 26, r.id, { size: 7.5, anchor: 'middle', fill: 'rgba(125,211,252,0.4)', w: 700 }); });
    }

    /* containment aisles */
    var aisles = [
      { y: 70,  h: 26, t: 'COLD AISLE 01', cold: true },
      { y: 142, h: 26, t: 'HOT AISLE 01',  cold: false },
      { y: 232, h: 26, t: 'COLD AISLE 02', cold: true },
      { y: 304, h: 26, t: 'HOT AISLE 02',  cold: false },
      { y: 376, h: 24, t: 'COLD AISLE 03', cold: true }
    ];
    aisles.forEach(function (a) {
      s += '<rect x="100" y="' + a.y + '" width="460" height="' + a.h + '" fill="url(#dcf-' + (a.cold ? 'cold' : 'warm') + ')"/>';
      s += txt(106, a.y + a.h - 8, a.t, { size: 6.8, fill: a.cold ? 'rgba(125,211,252,0.6)' : 'rgba(251,113,133,0.6)' });
      // airflow arrows
      for (var ax = 160; ax < 540; ax += 90) {
        var dir = a.cold ? 1 : -1;
        s += '<path d="M' + ax + ',' + (a.y + a.h / 2 + 5 * dir) + ' L' + ax + ',' + (a.y + a.h / 2 - 5 * dir) +
          ' M' + (ax - 3) + ',' + (a.y + a.h / 2 - 2 * dir) + ' L' + ax + ',' + (a.y + a.h / 2 - 5 * dir) +
          ' L' + (ax + 3) + ',' + (a.y + a.h / 2 - 2 * dir) + '" fill="none" stroke="' +
          (a.cold ? 'rgba(125,211,252,0.45)' : 'rgba(251,113,133,0.45)') + '" stroke-width="0.9" stroke-linecap="round"/>';
      }
    });

    /* thermal bloom under the hot cabinet */
    var hotRow = ROWS.filter(function (r) { return r.id === HOT.row; })[0];
    var hx = X0 + HOT.col * (CW + CGAP) + CW / 2, hy = hotRow.y + RH / 2;
    s += '<ellipse cx="' + hx + '" cy="' + hy + '" rx="96" ry="66" fill="url(#dcf-hot)">' +
      '<animate attributeName="rx" values="88;104;88" dur="4s" repeatCount="indefinite"/>' +
      '<animate attributeName="ry" values="60;72;60" dur="4s" repeatCount="indefinite"/></ellipse>';

    /* cabinet rows */
    ROWS.forEach(function (row) {
      for (var c = 0; c < COLS; c++) {
        var cx = X0 + c * (CW + CGAP), cy = row.y;
        var isHot = row.id === HOT.row && c === HOT.col;
        var isWarm = WARM.some(function (w) { return w.row === row.id && w.col === c; });
        var t = isHot ? HOT.temp : isWarm ? row.base + 5.4 : row.base + ((c * 7) % 5) * 0.32;
        var col = tempColor(t);
        var empty = (c === 10 && row.id === 'D') || (c === 11 && row.id === 'A');

        s += '<rect x="' + cx + '" y="' + cy + '" width="' + CW + '" height="' + RH + '" rx="1.5" fill="' +
          (empty ? 'rgba(125,211,252,0.04)' : 'rgba(20,38,64,0.95)') + '" stroke="' +
          (empty ? 'rgba(125,211,252,0.18)' : col) + '" stroke-opacity="' + (empty ? 1 : (isHot ? 0.95 : 0.5)) +
          '" stroke-width="' + (isHot ? 1.5 : 0.8) + '" stroke-dasharray="' + (empty ? '2 2' : 'none') + '"/>';

        if (!empty) {
          // U-slot texture
          for (var u = 0; u < 6; u++) {
            var uy = cy + 5 + u * 6.4;
            s += '<line x1="' + (cx + 4) + '" y1="' + uy + '" x2="' + (cx + CW - 4) + '" y2="' + uy +
              '" stroke="' + col + '" stroke-opacity="' + (0.10 + (u % 2) * 0.10) + '" stroke-width="2.4"/>';
          }
          // load bar
          var load = 0.35 + ((c * 13 + row.y) % 55) / 100;
          if (isHot) load = 0.94;
          s += '<rect x="' + (cx + 3) + '" y="' + (cy + RH - 5) + '" width="' + ((CW - 6) * load).toFixed(1) +
            '" height="2" rx="1" fill="' + col + '" opacity="0.8"/>';
        }

        if (isHot) {
          s += '<rect x="' + (cx - 2) + '" y="' + (cy - 2) + '" width="' + (CW + 4) + '" height="' + (RH + 4) +
            '" rx="2" fill="none" stroke="#fb7185" stroke-width="1.2">' +
            '<animate attributeName="stroke-opacity" values="1;0.25;1" dur="1.5s" repeatCount="indefinite"/></rect>';
        }
      }
      if (dense) s += txt(X0 - 14, row.y + RH / 2 + 3, 'ROW ' + row.id, { size: 6.5, anchor: 'end', fill: 'rgba(125,211,252,0.45)' });
    });

    /* CRAC units down both walls */
    [[100, 'CRAC-1', 0.72], [100, 'CRAC-3', 0.64], [548, 'CRAC-2', 0.81], [548, 'CRAC-4', 0.0]].forEach(function (u, i) {
      var uy = 96 + (i % 2) * 190;
      var ok = u[2] > 0;
      s += '<rect x="' + (u[0] - 8) + '" y="' + uy + '" width="12" height="52" rx="1.5" fill="rgba(20,38,64,0.95)" stroke="' +
        (ok ? '#6ee7b7' : '#fb7185') + '" stroke-opacity="0.7" stroke-width="0.9"/>';
      if (ok) {
        s += '<rect x="' + (u[0] - 6) + '" y="' + (uy + 50 - 46 * u[2]) + '" width="8" height="' + (46 * u[2]).toFixed(1) +
          '" rx="1" fill="#6ee7b7" opacity="0.30"/>';
      }
      if (dense) {
        s += txt(u[0] + (u[0] < 300 ? -14 : 20), uy + 26, u[1], { size: 6.5, anchor: u[0] < 300 ? 'end' : 'start', fill: ok ? 'rgba(110,231,183,0.7)' : '#fb7185' });
        s += txt(u[0] + (u[0] < 300 ? -14 : 20), uy + 35, ok ? Math.round(u[2] * 100) + '%' : 'STANDBY', { size: 6, anchor: u[0] < 300 ? 'end' : 'start', fill: 'rgba(169,189,214,0.45)' });
      }
    });

    /* power train along the bottom */
    var train = [
      { x: 118, t: 'UTILITY', v: '11 kV', c: '#7dd3fc' },
      { x: 206, t: 'ATS', v: 'CLOSED', c: '#6ee7b7' },
      { x: 286, t: 'UPS-1', v: '62% · N+1', c: '#6ee7b7' },
      { x: 372, t: 'UPS-2', v: 'BYPASS', c: '#fbbf24' },
      { x: 458, t: 'PDU-A/B', v: '418 kW', c: '#7dd3fc' }
    ];
    s += '<line x1="118" y1="432" x2="524" y2="432" stroke="rgba(125,211,252,0.22)" stroke-width="1"/>';
    train.forEach(function (n, i) {
      s += '<rect x="' + n.x + '" y="420" width="66" height="24" rx="3" fill="rgba(10,20,36,0.95)" stroke="' + n.c + '" stroke-opacity="0.55" stroke-width="0.9"/>';
      s += txt(n.x + 33, 431, n.t, { size: 6.5, anchor: 'middle', fill: n.c, w: 700 });
      s += txt(n.x + 33, 440, n.v, { size: 6, anchor: 'middle', fill: 'rgba(169,189,214,0.55)' });
      if (i < train.length - 1) {
        s += '<circle r="2" fill="#7dd3fc" opacity="0.9"><animateMotion dur="2.6s" begin="' + (i * 0.5) + 's" repeatCount="indefinite" path="M' +
          (n.x + 66) + ',432 L' + train[i + 1].x + ',432"/></circle>';
      }
    });
    // UPS-2 on bypass — flag it
    s += '<circle cx="405" cy="414" r="4.5" fill="none" stroke="#fbbf24" stroke-width="1.2">' +
      '<animate attributeName="r" values="4;13;4" dur="2.4s" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" repeatCount="indefinite"/></circle>' +
      '<circle cx="405" cy="414" r="3" fill="#fbbf24"/>';

    /* hot-rack alarm marker + leader */
    s += '<g>' +
      '<circle cx="' + hx + '" cy="' + hy + '" r="8" fill="none" stroke="#fb7185" stroke-width="1.4">' +
        '<animate attributeName="r" values="7;26;7" dur="2.2s" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0.9;0;0.9" dur="2.2s" repeatCount="indefinite"/></circle>' +
      '<circle cx="' + hx + '" cy="' + hy + '" r="4.4" fill="#fb7185" stroke="rgba(7,15,30,0.9)" stroke-width="1"/>' +
      '</g>';

    if (dense) {
      s += '<line x1="' + (hx + 8) + '" y1="' + hy + '" x2="' + (hx + 62) + '" y2="' + (hy - 26) + '" stroke="#fb7185" stroke-opacity="0.5" stroke-width="0.9"/>';
      s += '<rect x="' + (hx + 60) + '" y="' + (hy - 44) + '" width="112" height="34" rx="4" fill="rgba(9,16,30,0.96)" stroke="#fb7185" stroke-opacity="0.6" stroke-width="0.9"/>';
      s += txt(hx + 68, hy - 32, 'RACK C-05 · INLET', { size: 6.5, fill: '#fb7185', w: 700 });
      s += txt(hx + 68, hy - 21, HOT.temp + ' °C · +11.4 OVER SET', { size: 6.5, fill: 'rgba(230,240,251,0.8)' });
    }

    /* sensor dots between rows */
    ROWS.forEach(function (row) {
      for (var c = 1; c < COLS; c += 3) {
        var sx = X0 + c * (CW + CGAP) - CGAP / 2;
        s += '<circle cx="' + sx + '" cy="' + (row.y - 5) + '" r="1.5" fill="#7dd3fc" opacity="0.55"/>';
      }
    });

    /* HUD */
    s += txt(16, 24, 'DATA HALL 02 · RAISED FLOOR', { size: 9, fill: '#7dd3fc', ls: '0.18em', w: 700 });
    s += txt(16, 36, '48 CABINETS · 418 kW IT LOAD · N+1', { size: 7.5, fill: 'rgba(169,189,214,0.45)' });

    var kpi = [['PUE', '1.31', '#6ee7b7'], ['INLET AVG', '22.4 °C', '#7dd3fc'], ['HUMIDITY', '46 %RH', '#7dd3fc'], ['ALARMS', '2', '#fb7185']];
    kpi.forEach(function (k, i) {
      var kx = W - 16 - (kpi.length - 1 - i) * 0;
      s += txt(W - 16, 24 + i * 12, k[1] + '  ' + k[0], { size: 7.5, anchor: 'end', fill: k[2] });
    });

    /* thermal legend */
    var lx = 452, ly = 462;
    ['#7dd3fc', '#a3e635', '#fbbf24', '#fb7185'].forEach(function (c, i) {
      s += '<rect x="' + (lx + i * 18) + '" y="' + (ly - 7) + '" width="18" height="5" fill="' + c + '" opacity="0.75"/>';
    });
    s += txt(lx - 6, ly - 2, '18°', { size: 6.5, anchor: 'end', fill: 'rgba(169,189,214,0.5)' });
    s += txt(lx + 78, ly - 2, '36°', { size: 6.5, fill: 'rgba(169,189,214,0.5)' });

    s += '<circle cx="20" cy="462" r="3.2" fill="#6ee7b7"><animate attributeName="opacity" values="1;0.3;1" dur="1.7s" repeatCount="indefinite"/></circle>';
    s += txt(30, 465, 'BMS + SCADA LINKED · 1s POLL', { size: 7, fill: 'rgba(169,189,214,0.5)' });

    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  function boot() {
    var nodes = document.querySelectorAll('[data-dc-floor]');
    Array.prototype.forEach.call(nodes, function (n) {
      render(n, n.getAttribute('data-dc-floor') === 'dense');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
