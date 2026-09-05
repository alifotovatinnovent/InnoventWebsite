/* ─────────────────────────────────────────────────────────────
   Innfini · Public-safety CAD map
   Street network with police beats, stations, live incidents,
   responding units on routed paths and camera coverage.
   Renders into <svg data-cad-map>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var W = 900, H = 520;
  var PAD_L = 58, PAD_T = 40, PAD_R = 58, PAD_B = 50;

  var AVE = ['1st', '3rd', '5th', '7th', '9th', '11th'];
  var ST  = ['Main', 'Oak', 'Park', 'Lake', 'Bay'];
  function ax(i) { return PAD_L + i * ((W - PAD_L - PAD_R) / (AVE.length - 1)); }
  function sy(i) { return PAD_T + i * ((H - PAD_T - PAD_B) / (ST.length - 1)); }

  var CRIT = '#fb7185', WARN = '#fbbf24', INFO = '#7dd3fc', UNIT = '#6ee7b7';

  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + (o.size || 8.5) +
      '" letter-spacing="' + (o.ls || '0.1em') + '" fill="' + (o.fill || 'rgba(169,189,214,0.55)') + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }

  function render(svg) {
    var s = '';
    s += '<defs>' +
      '<radialGradient id="cad-inc" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#fb7185" stop-opacity="0.40"/>' +
        '<stop offset="100%" stop-color="#fb7185" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="cad-cam" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.20"/>' +
        '<stop offset="100%" stop-color="#7dd3fc" stop-opacity="0"/></radialGradient>' +
      '</defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';

    /* beats — three response districts */
    var BEATS = [
      { x0: 0, y0: 0, x1: 2, y1: 2, id: 'BEAT 1', col: INFO },
      { x0: 2, y0: 0, x1: 5, y1: 2, id: 'BEAT 2', col: WARN },
      { x0: 0, y0: 2, x1: 5, y1: 4, id: 'BEAT 3', col: INFO }
    ];
    BEATS.forEach(function (b) {
      var x = ax(b.x0) - 8, y = sy(b.y0) - 8, w = ax(b.x1) - ax(b.x0) + 16, hh = sy(b.y1) - sy(b.y0) + 16;
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="4" fill="' + b.col +
        '" fill-opacity="0.03" stroke="' + b.col + '" stroke-opacity="0.22" stroke-width="0.9" stroke-dasharray="6 5"/>';
      s += txt(x + 8, y + 14, b.id, { size: 7, fill: b.col, ls: '0.16em' });
    });

    /* blocks + park */
    for (var r = 0; r < ST.length - 1; r++) {
      for (var c = 0; c < AVE.length - 1; c++) {
        var bx = ax(c) + 9, by = sy(r) + 9, bw = ax(c + 1) - ax(c) - 18, bh = sy(r + 1) - sy(r) - 18;
        var park = (r === 1 && c === 1);
        s += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="2" fill="' +
          (park ? 'rgba(45,138,90,0.16)' : 'rgba(125,211,252,0.035)') + '" stroke="' +
          (park ? 'rgba(110,231,183,0.28)' : 'rgba(125,211,252,0.08)') + '" stroke-width="0.6"/>';
        if (park) s += txt(bx + bw / 2, by + bh / 2 + 3, 'CIVIC PARK', { size: 7.5, anchor: 'middle', fill: 'rgba(110,231,183,0.6)' });
      }
    }

    /* roadways */
    AVE.forEach(function (n, i) {
      s += '<line x1="' + ax(i) + '" y1="' + (PAD_T - 14) + '" x2="' + ax(i) + '" y2="' + (H - PAD_B + 14) +
        '" stroke="rgba(125,211,252,' + (i === 2 ? 0.36 : 0.2) + ')" stroke-width="' + (i === 2 ? 2.6 : 1.5) + '"/>';
      s += txt(ax(i), PAD_T - 22, n, { size: 7.5, anchor: 'middle', fill: 'rgba(125,211,252,0.42)' });
    });
    ST.forEach(function (n, i) {
      s += '<line x1="' + (PAD_L - 16) + '" y1="' + sy(i) + '" x2="' + (W - PAD_R + 16) + '" y2="' + sy(i) +
        '" stroke="rgba(125,211,252,0.2)" stroke-width="1.5"/>';
      s += txt(PAD_L - 22, sy(i) + 3, n, { size: 7.5, anchor: 'end', fill: 'rgba(125,211,252,0.42)' });
    });

    /* stations */
    var STATIONS = [
      { x: ax(4) + 22, y: sy(0) + 20, id: 'POLICE HQ', col: INFO },
      { x: ax(1) - 4,  y: sy(3) + 18, id: 'FIRE ST-3', col: CRIT },
      { x: ax(3) + 20, y: sy(3) + 18, id: 'HOSPITAL',  col: UNIT }
    ];
    STATIONS.forEach(function (st) {
      s += '<rect x="' + (st.x - 6) + '" y="' + (st.y - 6) + '" width="12" height="12" rx="2" fill="rgba(10,20,36,0.95)" stroke="' + st.col + '" stroke-width="1.2"/>';
      s += '<circle cx="' + st.x + '" cy="' + st.y + '" r="2.4" fill="' + st.col + '"/>';
      s += txt(st.x + 11, st.y + 3, st.id, { size: 7, fill: st.col });
    });

    /* camera coverage */
    [[ax(2), sy(1)], [ax(4), sy(2)], [ax(1), sy(2)]].forEach(function (c) {
      s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="46" fill="url(#cad-cam)"/>';
      s += '<rect x="' + (c[0] - 4) + '" y="' + (c[1] - 3) + '" width="8" height="6" rx="1" fill="rgba(10,20,36,0.9)" stroke="' + INFO + '" stroke-width="0.9"/>';
    });

    /* incidents */
    var INC = [
      { x: ax(3), y: sy(1), col: CRIT, id: 'INC-0412', label: 'COLLISION · 7TH &amp; OAK', lx: 12, ly: -6, an: 'start' },
      { x: ax(1), y: sy(2), col: WARN, id: 'INC-0409', label: 'CROWD · CIVIC PARK',      lx: 12, ly: 16, an: 'start' },
      { x: ax(4), y: sy(3), col: INFO, id: 'INC-0405', label: 'ALARM · 9TH &amp; LAKE',      lx: -12, ly: -6, an: 'end' }
    ];
    INC.forEach(function (n, i) {
      s += '<ellipse cx="' + n.x + '" cy="' + n.y + '" rx="52" ry="34" fill="url(#cad-inc)" opacity="' + (n.col === CRIT ? 1 : 0.5) + '"/>';
      s += '<circle cx="' + n.x + '" cy="' + n.y + '" r="7" fill="none" stroke="' + n.col + '" stroke-width="1.4">' +
        '<animate attributeName="r" values="6;24;6" dur="2.4s" begin="' + (i * 0.5) + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" begin="' + (i * 0.5) + 's" repeatCount="indefinite"/></circle>';
      s += '<circle cx="' + n.x + '" cy="' + n.y + '" r="4.6" fill="' + n.col + '" stroke="rgba(7,15,30,0.9)" stroke-width="1"/>';
      s += '<g transform="translate(' + n.lx + ',' + n.ly + ')" text-anchor="' + n.an + '">' +
        '<text x="' + n.x + '" y="' + n.y + '" font-family="' + MONO + '" font-size="7.5" letter-spacing="0.1em" fill="' + n.col + '" font-weight="700">' + n.id + '</text>' +
        '<text x="' + n.x + '" y="' + (n.y + 10) + '" font-family="' + MONO + '" font-size="7" letter-spacing="0.06em" fill="rgba(230,240,251,0.6)">' + n.label + '</text></g>';
    });

    /* responding units on routed paths */
    var ROUTES = [
      { d: 'M' + ax(4) + ',' + sy(0) + ' L' + ax(3) + ',' + sy(0) + ' L' + ax(3) + ',' + sy(1), id: 'P-22', dur: 7 },
      { d: 'M' + ax(1) + ',' + sy(3) + ' L' + ax(1) + ',' + sy(2), id: 'M-04', dur: 5 },
      { d: 'M' + ax(3) + ',' + sy(3) + ' L' + ax(4) + ',' + sy(3), id: 'E-11', dur: 6 }
    ];
    ROUTES.forEach(function (rt, i) {
      s += '<path d="' + rt.d + '" fill="none" stroke="' + UNIT + '" stroke-opacity="0.45" stroke-width="1.6" stroke-dasharray="5 4"/>';
      s += '<g><rect x="-7" y="-3.5" width="14" height="7" rx="1.5" fill="' + UNIT + '" opacity="0.9"/>' +
        '<text x="0" y="-7" font-family="' + MONO + '" font-size="6.5" text-anchor="middle" fill="' + UNIT + '">' + rt.id + '</text>' +
        '<animateMotion dur="' + rt.dur + 's" repeatCount="indefinite" path="' + rt.d + '"/></g>';
    });

    /* AI dispatch proposal — bottom gutter, clear of the network */
    var rx = PAD_L, ry = H - PAD_B + 24;
    s += '<rect x="' + rx + '" y="' + (ry - 15) + '" width="248" height="22" rx="5" fill="rgba(196,181,253,0.10)" stroke="rgba(196,181,253,0.45)" stroke-width="0.9"/>';
    s += '<circle cx="' + (rx + 11) + '" cy="' + (ry - 4) + '" r="3" fill="#c4b5fd"><animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/></circle>';
    s += txt(rx + 20, ry - 1, 'AI DISPATCH · M-04 + P-22 &rarr; 7TH &amp; OAK', { size: 7.2, fill: '#c4b5fd', w: 700 });

    /* legend */
    var lx = W - PAD_R - 268;
    [[CRIT, 'Critical'], [WARN, 'Elevated'], [INFO, 'Routine'], [UNIT, 'Unit en route']].forEach(function (l, i) {
      s += '<circle cx="' + (lx + i * 70) + '" cy="' + (H - PAD_B + 20) + '" r="3" fill="' + l[0] + '"/>';
      s += txt(lx + i * 70 + 8, H - PAD_B + 23, l[1], { size: 6.8, fill: 'rgba(169,189,214,0.5)' });
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
    Array.prototype.forEach.call(document.querySelectorAll('[data-cad-map]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
