/* ─────────────────────────────────────────────────────────────
   Innfini · Incident response map (venue floor)
   Zone geofence, incident origin, sensor and camera nodes,
   responding unit on a routed path, egress routes. Cyan/navy
   palette matching the mockup system; labels sit in reserved
   gutters so nothing collides with a marker.
   Renders into <svg data-incident-map>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var W = 640, H = 480;
  var PAD = 34, GUTTER = 26;           // gutter reserved for labels

  var CRIT = '#fb7185', OK = '#6ee7b7', NET = '#7dd3fc', AI = '#c4b5fd', WARN = '#fbbf24';

  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + (o.size || 8) +
      '" letter-spacing="' + (o.ls || '0.1em') + '" fill="' + (o.fill || 'rgba(169,189,214,0.55)') + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }

  function render(svg) {
    var s = '';
    s += '<defs>' +
      '<radialGradient id="im-inc" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#fb7185" stop-opacity="0.34"/>' +
        '<stop offset="100%" stop-color="#fb7185" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="im-cam" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.16"/>' +
        '<stop offset="100%" stop-color="#7dd3fc" stop-opacity="0"/></radialGradient>' +
      '</defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';

    /* floor plate + structural grid */
    var x0 = PAD, y0 = PAD + GUTTER, x1 = W - PAD, y1 = H - PAD - GUTTER;
    var g = '';
    for (var x = x0; x <= x1; x += 42) g += '<line x1="' + x + '" y1="' + y0 + '" x2="' + x + '" y2="' + y1 + '"/>';
    for (var y = y0; y <= y1; y += 42) g += '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '"/>';
    s += '<g stroke="rgba(125,211,252,0.06)" stroke-width="0.6">' + g + '</g>';
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) +
      '" fill="rgba(125,211,252,0.02)" stroke="rgba(125,211,252,0.22)" stroke-width="1"/>';

    /* retail units along the concourse */
    for (var u = 0; u < 6; u++) {
      var ux = x0 + 8 + u * ((x1 - x0 - 16) / 6);
      var uw = (x1 - x0 - 16) / 6 - 6;
      s += '<rect x="' + ux + '" y="' + (y1 - 54) + '" width="' + uw + '" height="46" rx="2" fill="rgba(125,211,252,0.035)" stroke="rgba(125,211,252,0.10)" stroke-width="0.6"/>';
    }

    /* Zone 4 geofence — cyan/navy, not magenta */
    var zone = 'M' + (x0 + 96) + ',' + (y0 + 22) + ' L' + (x1 - 62) + ',' + (y0 + 14) + ' L' + (x1 - 30) + ',' + (y0 + 148) +
               ' L' + (x0 + 232) + ',' + (y0 + 186) + ' L' + (x0 + 96) + ',' + (y0 + 160) + ' Z';
    s += '<path d="' + zone + '" fill="rgba(125,211,252,0.06)" stroke="' + NET + '" stroke-width="1.2" stroke-opacity="0.55" stroke-dasharray="5 4"/>';
    s += txt(x0 + 106, y0 + 40, 'ZONE 4 · HIGH OCCUPANCY · ~340', { size: 7.5, fill: NET, ls: '0.14em', w: 700 });

    /* camera coverage + nodes */
    var CAMS = [[x0 + 190, y0 + 62, 'CAM-4-12'], [x0 + 330, y0 + 118, 'CAM-4-08'], [x0 + 122, y0 + 130, 'CAM-4-15']];
    CAMS.forEach(function (c) {
      s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="52" fill="url(#im-cam)"/>';
      s += '<rect x="' + (c[0] - 5) + '" y="' + (c[1] - 3.5) + '" width="10" height="7" rx="1.2" fill="rgba(10,20,36,0.95)" stroke="' + NET + '" stroke-width="0.9"/>';
    });

    /* smoke sensor — label placed away from the marker */
    var sx = x0 + 244, sy = y0 + 76;
    s += '<circle cx="' + sx + '" cy="' + sy + '" r="4" fill="none" stroke="' + WARN + '" stroke-width="1.1"/>';
    s += '<circle cx="' + sx + '" cy="' + sy + '" r="1.6" fill="' + WARN + '"/>';

    /* incident origin */
    var ix = x0 + 300, iy = y0 + 96;
    s += '<ellipse cx="' + ix + '" cy="' + iy + '" rx="70" ry="52" fill="url(#im-inc)"/>';
    s += '<circle cx="' + ix + '" cy="' + iy + '" r="8" fill="none" stroke="' + CRIT + '" stroke-width="1.4">' +
      '<animate attributeName="r" values="7;26;7" dur="2.2s" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="0.9;0;0.9" dur="2.2s" repeatCount="indefinite"/></circle>';
    s += '<circle cx="' + ix + '" cy="' + iy + '" r="4.8" fill="' + CRIT + '" stroke="rgba(7,15,30,0.9)" stroke-width="1"/>';

    /* responding unit + route */
    var ex = x0 + 70, ey = y1 - 78;
    var route = 'M' + ex + ',' + ey + ' Q' + (x0 + 150) + ',' + (ey - 60) + ' ' + (x0 + 220) + ',' + (iy + 54) + ' T' + ix + ',' + (iy + 12);
    s += '<path d="' + route + '" fill="none" stroke="' + OK + '" stroke-width="1.5" stroke-dasharray="4 4" stroke-opacity="0.6"/>';
    s += '<rect x="' + (ex - 11) + '" y="' + (ey - 5) + '" width="22" height="10" rx="1.5" fill="rgba(110,231,183,0.75)" stroke="' + OK + '" stroke-width="0.8"/>';
    s += '<circle r="2.6" fill="' + OK + '"><animateMotion dur="5s" repeatCount="indefinite" path="' + route + '"/></circle>';

    /* egress routes */
    [[x1 - 30, y0 + 60], [x1 - 30, y1 - 90]].forEach(function (e, i) {
      s += '<path d="M' + ix + ',' + iy + ' L' + e[0] + ',' + e[1] + '" fill="none" stroke="' + AI + '" stroke-opacity="0.3" stroke-width="1.1" stroke-dasharray="3 5"/>';
      s += '<path d="M' + (e[0] - 5) + ',' + (e[1] - 5) + ' L' + e[0] + ',' + e[1] + ' L' + (e[0] - 5) + ',' + (e[1] + 5) + '" fill="none" stroke="' + AI + '" stroke-width="1.2"/>';
    });

    /* ── labels, all in the reserved gutters ── */
    /* top gutter */
    s += txt(x0, PAD + 14, 'INCIDENT RESPONSE · KHALIFA MALL · LEVEL 2', { size: 8.5, fill: NET, ls: '0.16em', w: 700 });
    s += txt(x1, PAD + 14, 'T+00:41', { size: 8, anchor: 'end', fill: WARN });

    /* leader lines out to the bottom gutter, so labels never sit on markers */
    var lane = y1 + 15;
    var LABELS = [
      { fx: ix, fy: iy, tx: x0 + 96,  t: 'FIRE · ORIGIN', col: CRIT },
      { fx: sx, fy: sy, tx: x0 + 214, t: 'SMK-4-08', col: WARN },
      { fx: ex, fy: ey, tx: x0 + 322, t: 'ENG-12 · 3m', col: OK },
      { fx: x1 - 30, fy: y0 + 60, tx: x0 + 436, t: 'EGRESS ×2', col: AI }
    ];
    LABELS.forEach(function (l) {
      s += '<path d="M' + l.fx + ',' + l.fy + ' L' + l.fx + ',' + (lane - 12) + ' L' + (l.tx + 16) + ',' + (lane - 12) + '" fill="none" stroke="' + l.col + '" stroke-opacity="0.28" stroke-width="0.7"/>';
      s += '<circle cx="' + (l.tx + 6) + '" cy="' + (lane - 3) + '" r="2.6" fill="' + l.col + '"/>';
      s += txt(l.tx + 14, lane, l.t, { size: 7.2, fill: l.col, ls: '0.08em', w: 700 });
    });

    var host = svg.parentNode;
    if (host && host.classList && host.classList.contains('mk__canvas')) host.style.aspectRatio = W + ' / ' + H;

    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-incident-map]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
