/* ─────────────────────────────────────────────────────────────
   Innfini · Downtown mobility map
   Street grid with signal phases, transit lines, congestion,
   parking, EV chargers and a live incident. Labels are placed
   on a reserved gutter so nothing overlaps the network.
   Renders into <svg data-mobility-map>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var W = 900, H = 520;
  var PAD_L = 54, PAD_T = 34, PAD_R = 54, PAD_B = 46;

  /* 6 avenues (vertical) × 5 streets (horizontal) */
  var AVE = ['1st', '3rd', '5th', '7th', '9th', '11th'];
  var ST  = ['Main', 'Oak', 'Park', 'Lake', 'Bay'];

  function ax(i) { return PAD_L + i * ((W - PAD_L - PAD_R) / (AVE.length - 1)); }
  function sy(i) { return PAD_T + i * ((H - PAD_T - PAD_B) / (ST.length - 1)); }

  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + (o.size || 8.5) +
      '" letter-spacing="' + (o.ls || '0.1em') + '" fill="' + (o.fill || 'rgba(169,189,214,0.55)') + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }

  function render(svg) {
    var s = '';

    s += '<defs>' +
      '<linearGradient id="mob-cong" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#fb7185" stop-opacity="0.55"/>' +
        '<stop offset="100%" stop-color="#fb7185" stop-opacity="0.05"/></linearGradient>' +
      '<radialGradient id="mob-inc" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#fb7185" stop-opacity="0.45"/>' +
        '<stop offset="100%" stop-color="#fb7185" stop-opacity="0"/></radialGradient>' +
      '</defs>';

    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';

    /* city blocks */
    for (var r = 0; r < ST.length - 1; r++) {
      for (var c = 0; c < AVE.length - 1; c++) {
        var bx = ax(c) + 9, by = sy(r) + 9, bw = ax(c + 1) - ax(c) - 18, bh = sy(r + 1) - sy(r) - 18;
        var park = (r === 2 && c === 3);
        s += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="2" fill="' +
          (park ? 'rgba(45,138,90,0.16)' : 'rgba(125,211,252,0.035)') + '" stroke="' +
          (park ? 'rgba(110,231,183,0.3)' : 'rgba(125,211,252,0.08)') + '" stroke-width="0.6"/>';
        if (park) s += txt(bx + bw / 2, by + bh / 2 + 3, 'CIVIC PARK', { size: 7.5, anchor: 'middle', fill: 'rgba(110,231,183,0.6)' });
      }
    }

    /* congestion band on 5th Ave (index 2) before the roadway is drawn */
    s += '<rect x="' + (ax(2) - 11) + '" y="' + sy(1) + '" width="22" height="' + (sy(3) - sy(1)) +
      '" fill="url(#mob-cong)"><animate attributeName="opacity" values="0.65;1;0.65" dur="3s" repeatCount="indefinite"/></rect>';

    /* roadways */
    AVE.forEach(function (n, i) {
      var x = ax(i), major = (i === 2);
      s += '<line x1="' + x + '" y1="' + (PAD_T - 14) + '" x2="' + x + '" y2="' + (H - PAD_B + 14) +
        '" stroke="rgba(125,211,252,' + (major ? 0.4 : 0.2) + ')" stroke-width="' + (major ? 3 : 1.6) + '"/>';
      s += txt(x, PAD_T - 20, n, { size: 7.5, anchor: 'middle', fill: major ? '#fb7185' : 'rgba(125,211,252,0.45)' });
    });
    ST.forEach(function (n, i) {
      var y = sy(i);
      s += '<line x1="' + (PAD_L - 16) + '" y1="' + y + '" x2="' + (W - PAD_R + 16) + '" y2="' + y +
        '" stroke="rgba(125,211,252,0.2)" stroke-width="1.6"/>';
      s += txt(PAD_L - 22, y + 3, n, { size: 7.5, anchor: 'end', fill: 'rgba(125,211,252,0.45)' });
    });

    /* transit line B12 — runs Oak street then turns down 9th */
    var tRoute = 'M' + (PAD_L - 10) + ',' + sy(1) + ' L' + ax(4) + ',' + sy(1) + ' L' + ax(4) + ',' + (H - PAD_B + 10);
    s += '<path d="' + tRoute + '" fill="none" stroke="#c4b5fd" stroke-opacity="0.5" stroke-width="2.4" stroke-dasharray="7 5"/>';
    for (var v = 0; v < 2; v++) {
      s += '<circle r="3.6" fill="#c4b5fd"><animateMotion dur="14s" begin="' + (v * 7) + 's" repeatCount="indefinite" path="' + tRoute + '"/></circle>';
    }

    /* signals at every junction, phase-coloured */
    var phases = ['#6ee7b7', '#fbbf24', '#fb7185'];
    AVE.forEach(function (an, i) {
      ST.forEach(function (sn, j) {
        var p = phases[(i + j * 2) % 3];
        var hot = (i === 2 && j === 2);
        s += '<circle cx="' + ax(i) + '" cy="' + sy(j) + '" r="' + (hot ? 6 : 4.4) + '" fill="#0a1424" stroke="' + p +
          '" stroke-width="' + (hot ? 1.8 : 1.1) + '"/>';
        s += '<circle cx="' + ax(i) + '" cy="' + sy(j) + '" r="1.9" fill="' + p + '"><animate attributeName="opacity" values="1;0.35;1" dur="' +
          (2.2 + ((i + j) % 3) * 0.6) + 's" repeatCount="indefinite"/></circle>';
      });
    });

    /* traffic particles on the avenues */
    AVE.forEach(function (n, i) {
      var slow = (i === 2);
      for (var k = 0; k < (slow ? 5 : 3); k++) {
        var d = 'M' + ax(i) + ',' + (PAD_T - 12) + ' L' + ax(i) + ',' + (H - PAD_B + 12);
        s += '<circle r="1.9" fill="' + (slow ? '#fbbf24' : '#7dd3fc') + '" opacity="0.85">' +
          '<animateMotion dur="' + (slow ? 16 : 8 + i) + 's" begin="' + (k * 1.7) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
      }
    });

    /* EV chargers, parking structures */
    [[0, 3, 'EV · 3/3'], [4, 0, 'EV · 2/2']].forEach(function (e) {
      var x = ax(e[0]) + 26, y = sy(e[1]) + 22;
      s += '<rect x="' + x + '" y="' + y + '" width="9" height="12" rx="1.5" fill="rgba(10,20,36,0.95)" stroke="#6ee7b7" stroke-width="0.9"/>';
      s += '<circle cx="' + (x + 4.5) + '" cy="' + (y + 6) + '" r="1.6" fill="#6ee7b7"/>';
      s += txt(x + 14, y + 10, e[2], { size: 7, fill: 'rgba(110,231,183,0.7)' });
    });
    [[1, 1, '84%'], [3, 3, '61%']].forEach(function (p) {
      var x = ax(p[0]) + 24, y = sy(p[1]) + 20;
      s += '<rect x="' + x + '" y="' + y + '" width="13" height="13" rx="2" fill="rgba(10,20,36,0.95)" stroke="#fbbf24" stroke-width="0.9"/>';
      s += txt(x + 6.5, y + 9.5, 'P', { size: 8, anchor: 'middle', fill: '#fbbf24', w: 700 });
      s += txt(x + 18, y + 9.5, p[2], { size: 7, fill: 'rgba(251,191,36,0.75)' });
    });

    /* the incident on 5th & Park */
    var ix = ax(2), iy = sy(2);
    s += '<ellipse cx="' + ix + '" cy="' + iy + '" rx="62" ry="40" fill="url(#mob-inc)"/>';
    s += '<circle cx="' + ix + '" cy="' + iy + '" r="8" fill="none" stroke="#fb7185" stroke-width="1.5">' +
      '<animate attributeName="r" values="7;28;7" dur="2.4s" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" repeatCount="indefinite"/></circle>' +
      '<circle cx="' + ix + '" cy="' + iy + '" r="4.6" fill="#fb7185" stroke="rgba(7,15,30,0.9)" stroke-width="1"/>';

    /* incident callout — placed in the right gutter, leader back to the pin */
    var cx = W - PAD_R - 138, cy = iy - 62;
    s += '<line x1="' + (ix + 9) + '" y1="' + iy + '" x2="' + cx + '" y2="' + (cy + 22) + '" stroke="#fb7185" stroke-opacity="0.45" stroke-width="0.9"/>';
    s += '<rect x="' + cx + '" y="' + cy + '" width="150" height="44" rx="5" fill="rgba(9,16,30,0.96)" stroke="#fb7185" stroke-opacity="0.55" stroke-width="0.9"/>';
    s += txt(cx + 10, cy + 15, 'COLLISION · 5TH &amp; PARK', { size: 7.5, fill: '#fb7185', w: 700 });
    s += txt(cx + 10, cy + 27, '12:14 · 2 lanes blocked', { size: 7, fill: 'rgba(230,240,251,0.75)' });
    s += txt(cx + 10, cy + 38, 'EMS-04 engaged · 4:08', { size: 7, fill: 'rgba(169,189,214,0.6)' });

    /* AI re-route proposal — left gutter, clear of the grid */
    var rx = PAD_L + 6, ry = H - PAD_B + 20;
    s += '<rect x="' + rx + '" y="' + (ry - 15) + '" width="212" height="22" rx="5" fill="rgba(196,181,253,0.10)" stroke="rgba(196,181,253,0.45)" stroke-width="0.9"/>';
    s += '<circle cx="' + (rx + 11) + '" cy="' + (ry - 4) + '" r="3" fill="#c4b5fd"><animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/></circle>';
    s += txt(rx + 20, ry - 1, 'AI RE-ROUTE · DIVERT 5TH &rarr; 7TH', { size: 7.5, fill: '#c4b5fd', w: 700 });

    /* scale + legend in the bottom gutter */
    var lx = W - PAD_R - 250;
    [['#6ee7b7', 'Free flow'], ['#fbbf24', 'Slowing'], ['#fb7185', 'Congested'], ['#c4b5fd', 'Transit']].forEach(function (l, i) {
      s += '<circle cx="' + (lx + i * 64) + '" cy="' + (H - PAD_B + 24) + '" r="3" fill="' + l[0] + '"/>';
      s += txt(lx + i * 64 + 8, H - PAD_B + 27, l[1], { size: 7, fill: 'rgba(169,189,214,0.55)' });
    });


    // the drawing owns its ratio — stamp it on the wrapping canvas so the
    // SVG fills it exactly instead of letterboxing inside a preset modifier
    var host = svg.parentNode;
    if (host && host.classList && host.classList.contains('mk__canvas')) {
      host.style.aspectRatio = W + ' / ' + H;
    }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-mobility-map]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
