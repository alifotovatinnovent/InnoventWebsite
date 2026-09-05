/* ─────────────────────────────────────────────────────────────
   Innfini · Common Operational Picture renderer
   Real coastline geometry (Natural Earth 10m) projected to the
   Dubai metro operating area, with live operational overlays.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json';
  var BBOX = { w: 54.88, s: 24.92, e: 55.62, n: 25.46 };
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

  /* ── Operating picture (real coordinates) ── */
  var COMMAND = { lon: 55.3300, lat: 25.2600, name: 'OPS-1 · COMMAND' };

  var SECTORS = [
    { id: 'S-01', name: 'SECTOR 01 · CENTRAL', level: 'elevated', ly: 0,
      ring: [[55.245,25.235],[55.325,25.245],[55.345,25.190],[55.275,25.165],[55.235,25.195]] },
    { id: 'S-02', name: 'SECTOR 02 · EAST', level: 'normal', ly: 38,
      ring: [[55.370,25.290],[55.470,25.300],[55.485,25.225],[55.395,25.205],[55.360,25.245]] },
    { id: 'S-03', name: 'SECTOR 03 · COASTAL', level: 'critical', ly: 0,
      ring: [[55.120,25.105],[55.200,25.130],[55.225,25.070],[55.155,25.035],[55.110,25.060]] }
  ];

  var CAMERAS = [
    { lon: 55.2610, lat: 25.2010, bearing: 42,  fov: 58, r: 46, id: 'CAM-118', lx: 0,  ly: -12, an: 'middle' },
    { lon: 55.3720, lat: 25.2560, bearing: 214, fov: 52, r: 40, id: 'CAM-241', lx: -9, ly: 14,  an: 'end' },
    { lon: 55.1620, lat: 25.0880, bearing: 320, fov: 64, r: 44, id: 'CAM-073', lx: 9,  ly: -10, an: 'start' },
    { lon: 55.3180, lat: 25.2820, bearing: 160, fov: 48, r: 36, id: 'CAM-305', lx: -9, ly: 13,  an: 'end' }
  ];

  var UNITS = [
    { id: 'PTL-14', kind: 'police', track: [[55.155,25.072],[55.215,25.130],[55.268,25.186],[55.318,25.242]], dur: 17 },
    { id: 'AMB-07', kind: 'medical', track: [[55.410,25.300],[55.368,25.256],[55.320,25.222],[55.278,25.196]], dur: 21 },
    { id: 'FIR-03', kind: 'fire',    track: [[55.240,25.108],[55.286,25.148],[55.330,25.198]], dur: 14 },
    { id: 'UAV-21', kind: 'air',     track: [[55.180,25.060],[55.260,25.140],[55.340,25.230],[55.420,25.300]], dur: 26 }
  ];

  var INCIDENTS = [
    { lon: 55.2708, lat: 25.2048, sev: 'critical', code: 'INC-4471', label: 'STRUCTURE FIRE', lx: 12,  ly: 16,  an: 'start' },
    { lon: 55.4020, lat: 25.2680, sev: 'high',     code: 'INC-4468', label: 'MVA · 3 VEH',    lx: 12,  ly: -12, an: 'start' },
    { lon: 55.1580, lat: 25.0790, sev: 'medium',   code: 'INC-4462', label: 'GAS READING',    lx: 12,  ly: 16,  an: 'start' },
    { lon: 55.3340, lat: 25.2790, sev: 'high',     code: 'INC-4459', label: 'CROWD DENSITY',  lx: -12, ly: -10, an: 'end'   },
    { lon: 55.2260, lat: 25.1520, sev: 'medium',   code: 'INC-4455', label: 'SENSOR OFFLINE', lx: 12,  ly: -10, an: 'start' }
  ];

  var SEV = {
    critical: { c: '#fda4af', t: 'CRITICAL' },
    high:     { c: '#fcd34d', t: 'HIGH' },
    medium:   { c: '#93c5fd', t: 'MEDIUM' }
  };
  var KIND = {
    police:  { c: '#7dd3fc', t: 'PATROL' },
    medical: { c: '#6ee7b7', t: 'MEDICAL' },
    fire:    { c: '#fda4af', t: 'FIRE' },
    air:     { c: '#c4b5fd', t: 'AIR' }
  };

  /* ── helpers ── */
  var atlasPromise = null;
  function atlas() {
    if (!atlasPromise) atlasPromise = d3.json(ATLAS);
    return atlasPromise;
  }
  function el(tag, attrs, kids) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (kids) n.innerHTML = kids;
    return n;
  }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' +
      (o.size || 9) + '" letter-spacing="' + (o.ls || '0.1em') + '" fill="' + (o.fill || 'rgba(223,241,255,0.55)') +
      '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.weight ? ' font-weight="' + o.weight + '"' : '') +
      '>' + s + '</text>';
  }

  function render(svg, opt) {
    var W = opt.w, H = opt.h, dense = opt.dense;

    atlas().then(function (topo) {
      var world = topojson.feature(topo, topo.objects.countries);
      // MultiPoint corners: unambiguous bounds (a Polygon ring's spherical
      // winding can be read as "everything except this box" and blows the fit up)
      var frame = { type: 'MultiPoint', coordinates: [
        [BBOX.w, BBOX.s], [BBOX.e, BBOX.s], [BBOX.e, BBOX.n], [BBOX.w, BBOX.n]
      ] };

      var projection = d3.geoMercator().fitExtent([[0, 0], [W, H]], frame);
      var path = d3.geoPath(projection);
      var P = function (lon, lat) { return projection([lon, lat]); };

      /* scale bar: how many px is 5 km at this zoom */
      var a = P(BBOX.w, (BBOX.s + BBOX.n) / 2), b = P(BBOX.e, (BBOX.s + BBOX.n) / 2);
      var spanKm = d3.geoDistance([BBOX.w, (BBOX.s + BBOX.n) / 2], [BBOX.e, (BBOX.s + BBOX.n) / 2]) * 6371;
      var pxPerKm = (b[0] - a[0]) / spanKm;
      var barKm = dense ? 5 : 3;
      var barPx = pxPerKm * barKm;

      var s = '';

      /* defs */
      s += '<defs>' +
        '<linearGradient id="sa-land-' + opt.key + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#111f38"/><stop offset="100%" stop-color="#0c1729"/></linearGradient>' +
        '<radialGradient id="sa-halo-' + opt.key + '" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" stop-color="#60a5fa" stop-opacity="0.10"/>' +
          '<stop offset="100%" stop-color="#60a5fa" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="sa-sweep-' + opt.key + '" cx="0%" cy="50%" r="100%">' +
          '<stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.28"/>' +
          '<stop offset="100%" stop-color="#7dd3fc" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="sa-clip-' + opt.key + '"><rect width="' + W + '" height="' + H + '"/></clipPath>' +
        '</defs>';

      s += '<rect width="' + W + '" height="' + H + '" fill="url(#sa-sea-' + opt.key + ')"/>';
      s += '<g clip-path="url(#sa-clip-' + opt.key + ')">';

      /* bathymetry — concentric offsets seaward read as depth contours */
      var landPath = path(world);
      // coastal shelf: one soft band hugging the shoreline, seaward glow only
      s += '<path d="' + landPath + '" fill="none" stroke="rgba(96,165,250,0.10)" stroke-width="26" stroke-linejoin="round"/>';
      s += '<path d="' + landPath + '" fill="none" stroke="rgba(96,165,250,0.08)" stroke-width="9" stroke-linejoin="round"/>';

      /* land + real coastline */
      s += '<path d="' + landPath + '" fill="#22395c" stroke="rgba(125,211,252,0.85)" stroke-width="1.4"/>';
      // built-up texture on land only, clipped by the coastline itself
      s += '<clipPath id="sa-land-clip-' + opt.key + '"><path d="' + landPath + '"/></clipPath>';
      var tex = '';
      for (var tx = 0; tx < W; tx += dense ? 26 : 20) tex += '<line x1="' + tx + '" y1="0" x2="' + tx + '" y2="' + H + '"/>';
      for (var ty = 0; ty < H; ty += dense ? 26 : 20) tex += '<line x1="0" y1="' + ty + '" x2="' + W + '" y2="' + ty + '"/>';
      s += '<g clip-path="url(#sa-land-clip-' + opt.key + ')" stroke="rgba(125,211,252,0.09)" stroke-width="0.6">' + tex + '</g>';
      s += '<ellipse cx="' + (W / 2) + '" cy="' + (H / 2) + '" rx="' + (W * 0.46) + '" ry="' + (H * 0.46) +
        '" fill="url(#sa-halo-' + opt.key + ')"/>';

      /* tactical graticule with real coordinate labels */
      var stepLon = dense ? 0.1 : 0.15, stepLat = dense ? 0.1 : 0.15;
      var grid = '', glabels = '';
      for (var lon = Math.ceil(BBOX.w / stepLon) * stepLon; lon < BBOX.e; lon += stepLon) {
        var p1 = P(lon, BBOX.s), p2 = P(lon, BBOX.n);
        grid += '<line x1="' + p1[0].toFixed(1) + '" y1="' + H + '" x2="' + p2[0].toFixed(1) + '" y2="0"/>';
        if (dense) glabels += txt(p1[0] + 4, H - 8, lon.toFixed(2) + '°E', { size: 8, fill: 'rgba(125,211,252,0.35)' });
      }
      for (var lat = Math.ceil(BBOX.s / stepLat) * stepLat; lat < BBOX.n; lat += stepLat) {
        var q1 = P(BBOX.w, lat), q2 = P(BBOX.e, lat);
        grid += '<line x1="0" y1="' + q1[1].toFixed(1) + '" x2="' + W + '" y2="' + q2[1].toFixed(1) + '"/>';
        if (dense) glabels += txt(6, q1[1] - 5, lat.toFixed(2) + '°N', { size: 8, fill: 'rgba(125,211,252,0.35)' });
      }
      s += '<g stroke="rgba(96,165,250,0.13)" stroke-width="0.6" stroke-dasharray="3 6">' + grid + '</g>' + glabels;

      /* sector geofences */
      SECTORS.forEach(function (sec, i) {
        var col = sec.level === 'critical' ? '#fda4af' : sec.level === 'elevated' ? '#fcd34d' : '#7dd3fc';
        var poly = { type: 'Polygon', coordinates: [sec.ring.concat([sec.ring[0]])] };
        var west = sec.ring.reduce(function (m, p) { return p[0] < m[0] ? p : m; }, sec.ring[0]);
        var c = P(west[0], west[1]);
        s += '<path d="' + path(poly) + '" fill="' + col + '" fill-opacity="0.055" stroke="' + col +
          '" stroke-opacity="0.5" stroke-width="1" stroke-dasharray="7 5">' +
          '<animate attributeName="stroke-dashoffset" from="24" to="0" dur="2.4s" repeatCount="indefinite"/></path>';
        if (dense) {
          var short = sec.name.split('· ')[1] || sec.id;
          var bw = 30 + short.length * 5.4;
          var bx = c[0] - bw - 14, by = c[1] - 10 + (sec.ly || 0);
          if (bx < 4) bx = c[0] + 12;
          s += '<rect x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="17" rx="3" ' +
            'fill="rgba(4,10,20,0.88)" stroke="' + col + '" stroke-opacity="0.35" stroke-width="0.7"/>';
          s += '<circle cx="' + (bx + 9) + '" cy="' + (by + 8.5) + '" r="2.8" fill="' + col + '"/>';
          s += txt(bx + 17, by + 11.5, sec.id + ' ' + short, { size: 7.8, fill: 'rgba(223,241,255,0.8)', ls: '0.07em' });
        } else {
          s += txt(c[0] - 6, c[1] + 3, sec.id, { size: 8.5, anchor: 'end', fill: col, ls: '0.14em' });
        }
      });

      /* camera fields of view */
      CAMERAS.forEach(function (cam) {
        var p = P(cam.lon, cam.lat);
        var r = cam.r * (dense ? 1.35 : 1);
        var a0 = (cam.bearing - cam.fov / 2 - 90) * Math.PI / 180;
        var a1 = (cam.bearing + cam.fov / 2 - 90) * Math.PI / 180;
        var x0 = p[0] + Math.cos(a0) * r, y0 = p[1] + Math.sin(a0) * r;
        var x1 = p[0] + Math.cos(a1) * r, y1 = p[1] + Math.sin(a1) * r;
        s += '<path d="M' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ' L' + x0.toFixed(1) + ',' + y0.toFixed(1) +
          ' A' + r + ',' + r + ' 0 0 1 ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Z" ' +
          'fill="rgba(125,211,252,0.10)" stroke="rgba(125,211,252,0.30)" stroke-width="0.6"/>';
        s += '<rect x="' + (p[0] - 3.6) + '" y="' + (p[1] - 2.6) + '" width="7.2" height="5.2" rx="1" ' +
          'fill="rgba(13,26,48,0.95)" stroke="#7dd3fc" stroke-width="0.9"/>';
        if (dense) s += txt(p[0] + cam.lx, p[1] + cam.ly, cam.id, { size: 8, fill: 'rgba(125,211,252,0.62)', anchor: cam.an });
      });

      /* unit tracks + moving units */
      UNITS.forEach(function (u, i) {
        var line = { type: 'LineString', coordinates: u.track };
        var dPath = path(line);
        var col = KIND[u.kind].c;
        s += '<path d="' + dPath + '" fill="none" stroke="' + col + '" stroke-opacity="0.28" stroke-width="1.2" ' +
          'stroke-dasharray="4 5" stroke-linecap="round"/>';
        s += '<g>' +
          '<circle r="' + (dense ? 9 : 7) + '" fill="' + col + '" fill-opacity="0.14"/>' +
          '<circle r="' + (dense ? 3.6 : 3) + '" fill="' + col + '"/>' +
          (dense ? '<text x="11" y="-8" font-family="' + MONO + '" font-size="8.5" letter-spacing="0.08em" fill="' +
            col + '" fill-opacity="0.85">' + u.id + '</text>' : '') +
          '<animateMotion dur="' + u.dur + 's" repeatCount="indefinite" rotate="0" path="' + dPath + '"/>' +
          '</g>';
      });

      /* incidents */
      INCIDENTS.forEach(function (inc, i) {
        var p = P(inc.lon, inc.lat);
        var col = SEV[inc.sev].c;
        var big = inc.sev === 'critical';
        s += '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')">' +
          '<circle r="6" fill="none" stroke="' + col + '" stroke-width="1.1">' +
            '<animate attributeName="r" values="5;' + (dense ? 30 : 20) + ';5" dur="2.8s" begin="' + (i * 0.42) + 's" repeatCount="indefinite"/>' +
            '<animate attributeName="opacity" values="0.75;0;0.75" dur="2.8s" begin="' + (i * 0.42) + 's" repeatCount="indefinite"/>' +
          '</circle>' +
          '<circle r="' + (big ? 5.4 : 4.2) + '" fill="' + col + '" stroke="rgba(6,13,26,0.85)" stroke-width="1"/>' +
          (dense
            ? '<g transform="translate(' + inc.lx + ',' + inc.ly + ')" text-anchor="' + inc.an + '">' +
                '<text font-family="' + MONO + '" font-size="8.5" letter-spacing="0.08em" fill="' + col + '">' + inc.code + '</text>' +
                '<text y="10" font-family="' + MONO + '" font-size="8" letter-spacing="0.06em" fill="rgba(223,241,255,0.5)">' + inc.label + '</text>' +
              '</g>'
            : '') +
          '</g>';
      });

      /* command node + radar sweep */
      var cp = P(COMMAND.lon, COMMAND.lat);
      var sweepR = dense ? 210 : 130;
      s += '<g transform="translate(' + cp[0].toFixed(1) + ',' + cp[1].toFixed(1) + ')">' +
        '<g><path d="M0,0 L' + sweepR + ',0 A' + sweepR + ',' + sweepR + ' 0 0 1 ' +
          (sweepR * Math.cos(Math.PI / 6)).toFixed(1) + ',' + (sweepR * Math.sin(Math.PI / 6)).toFixed(1) +
          ' Z" fill="url(#sa-sweep-' + opt.key + ')"/>' +
          '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="7s" repeatCount="indefinite"/></g>' +
        '<circle r="' + sweepR + '" fill="none" stroke="rgba(125,211,252,0.12)" stroke-width="0.7"/>' +
        '<circle r="' + (sweepR * 0.62) + '" fill="none" stroke="rgba(125,211,252,0.09)" stroke-width="0.7"/>' +
        '<circle r="' + (dense ? 8 : 6) + '" fill="none" stroke="#7dd3fc" stroke-width="1.3"/>' +
        '<circle r="' + (dense ? 3.4 : 2.6) + '" fill="#dff1ff"/>' +
        (dense ? txt(-14, 16, COMMAND.name, { size: 8.5, anchor: 'end', fill: '#7dd3fc', ls: '0.14em' }) : '') +
        '</g>';

      s += '</g>'; /* /clip */

      /* ── HUD ── */
      var pad = dense ? 18 : 14;

      /* top-left status */
      s += '<g transform="translate(' + pad + ',' + (pad + 10) + ')">' +
        txt(0, 0, 'INNFINI · COMMON OPERATIONAL PICTURE', { size: dense ? 9.5 : 8.5, fill: '#7dd3fc', ls: '0.18em' }) +
        txt(0, dense ? 15 : 13, 'DUBAI METRO · WGS-84 · EPSG:3857', { size: dense ? 8.5 : 7.8, fill: 'rgba(223,241,255,0.42)' }) +
        '</g>';

      /* top-right live counts */
      var counts = [
        [INCIDENTS.length + ' INCIDENTS', '#fda4af'],
        [UNITS.length + ' UNITS', '#6ee7b7'],
        [CAMERAS.length + ' CAMERAS', '#7dd3fc'],
        [SECTORS.length + ' SECTORS', 'rgba(223,241,255,0.5)']
      ];
      var cx = W - pad;
      s += '<g transform="translate(0,' + (pad + 10) + ')">';
      counts.forEach(function (c, i) {
        s += txt(cx, i * (dense ? 14 : 12), c[0], { size: dense ? 8.5 : 7.8, anchor: 'end', fill: c[1] });
      });
      s += '</g>';

      /* live pill */
      s += '<g transform="translate(' + pad + ',' + (H - pad - (dense ? 34 : 28)) + ')">' +
        '<circle cx="3" cy="-3.5" r="3.2" fill="#28c840"><animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite"/></circle>' +
        txt(13, 0, 'STREAMING · 1.2s REFRESH', { size: dense ? 8.5 : 7.8, fill: 'rgba(223,241,255,0.55)' }) +
        '</g>';

      /* scale bar */
      var sbY = H - pad - (dense ? 12 : 10);
      s += '<g transform="translate(' + pad + ',' + sbY + ')" stroke="rgba(223,241,255,0.45)" stroke-width="1">' +
        '<line x1="0" y1="0" x2="' + barPx.toFixed(1) + '" y2="0"/>' +
        '<line x1="0" y1="-3.5" x2="0" y2="3.5"/>' +
        '<line x1="' + barPx.toFixed(1) + '" y1="-3.5" x2="' + barPx.toFixed(1) + '" y2="3.5"/>' +
        '</g>' +
        txt(pad + barPx + 8, sbY + 3, barKm + ' KM', { size: dense ? 8.5 : 7.8, fill: 'rgba(223,241,255,0.45)' });

      /* north arrow */
      s += '<g transform="translate(' + (W - pad - 10) + ',' + (H - pad - 22) + ')">' +
        '<path d="M0,-13 L4.6,7 L0,3.4 L-4.6,7 Z" fill="rgba(125,211,252,0.75)"/>' +
        txt(0, 17, 'N', { size: 8, anchor: 'middle', fill: 'rgba(223,241,255,0.55)' }) +
        '</g>';

      svg.innerHTML = s;
    }).catch(function (e) { console.warn('COP geometry unavailable', e); });
  }

  function boot() {
    if (typeof d3 === 'undefined' || typeof topojson === 'undefined') return;
    var mini = document.getElementById('sa-cop-mini');
    var main = document.getElementById('sa-cop-main');
    if (mini) render(mini, { w: 640, h: 480, dense: false, key: 'mini' });
    if (main) render(main, { w: 1100, h: 760, dense: true, key: 'main' });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
