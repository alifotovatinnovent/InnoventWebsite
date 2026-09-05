/* ─────────────────────────────────────────────────────────────
   Innfini · Integration fabric operations console
   Replaces the hub-and-spoke starburst, which showed eight names
   and no operational fact. This shows what an integration team
   actually reads: the pipeline stages with their latency budget,
   a per-connector ledger (protocol, direction, mode, throughput,
   lag, health), and the dead-letter position.
   Renders into <svg data-fabric-console>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var NET = '#7dd3fc', OK = '#6ee7b7', AI = '#c4b5fd', WARN = '#fbbf24', CRIT = '#fb7185';
  var INK = 'rgba(230,240,251,0.92)', INK2 = 'rgba(169,189,214,0.62)', INK3 = 'rgba(113,133,158,0.85)';

  /* Authored close to the width the panel gives it, so scale stays near 1.0
     and no annotation renders below ~9px. */
  var W = 820, H = 620;
  var MIN_U = 9.2;

  function txt(x, y, s, o) {
    o = o || {};
    var fs = Math.max(o.size || 9, MIN_U);
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + fs +
      '" letter-spacing="' + (o.ls || '0.08em') + '" fill="' + (o.fill || INK2) + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }
  function adv(fs, ls) { return fs * 0.6 + fs * (ls || 0); }

  /* ── pipeline stages · the p95 latency budget, summing to the headline 84 ms ── */
  var STAGES = [
    { id: 'INGEST',    ms: 11, q: '412',  note: 'protocol adapters' },
    { id: 'NORMALISE', ms: 18, q: '260',  note: 'to canonical model' },
    { id: 'VALIDATE',  ms: 14, q: '96',   note: 'schema + policy' },
    { id: 'ENRICH',    ms: 21, q: '148',  note: 'graph lookup' },
    { id: 'ROUTE',     ms: 9,  q: '54',   note: 'rules + fan-out' },
    { id: 'DELIVER',   ms: 11, q: '38',   note: 'ack + retry' }
  ];

  /* ── connector ledger ── */
  var CONNECTORS = [
    { sys: 'SAP S/4HANA',   dom: 'ERP',        proto: 'OData v4 · IDoc', dir: 'in',   mode: 'Stream', tx: '11,240', lag: '0.4s',  h: 'OK' },
    { sys: 'Maximo',        dom: 'EAM',        proto: 'REST · MIF',      dir: 'both', mode: 'Stream', tx: '6,810',  lag: '0.6s',  h: 'OK' },
    { sys: 'Okta',          dom: 'IDM',        proto: 'SCIM 2.0 · OIDC', dir: 'in',   mode: 'Batch',  tx: '340',    lag: '5m',    h: 'OK' },
    { sys: 'Salesforce',    dom: 'CRM',        proto: 'Bulk API 2.0',    dir: 'both', mode: 'Batch',  tx: '2,150',  lag: '2m',    h: 'OK' },
    { sys: 'Manhattan',     dom: 'WMS',        proto: 'REST · EDI 856',  dir: 'out',  mode: 'Stream', tx: '9,470',  lag: '0.5s',  h: 'OK' },
    { sys: 'Esri ArcGIS',   dom: 'GIS',        proto: 'OGC WFS · REST',  dir: 'out',  mode: 'Stream', tx: '4,320',  lag: '0.9s',  h: 'OK' },
    { sys: 'SCADA hist.',   dom: 'INDUSTRIAL', proto: 'OPC-UA · Modbus', dir: 'in',   mode: 'Stream', tx: '5,980',  lag: '14s',   h: 'LAG' },
    { sys: 'BMS',           dom: 'BUILDING',   proto: 'BACnet/IP',       dir: 'in',   mode: 'Stream', tx: '1,870',  lag: '1.2s',  h: 'OK' }
  ];

  function dirGlyph(x, y, dir) {
    var c = dir === 'in' ? NET : dir === 'out' ? AI : OK, s = '';
    function arrow(x0, x1, yy) {
      s += '<line x1="' + x0 + '" y1="' + yy + '" x2="' + x1 + '" y2="' + yy + '" stroke="' + c + '" stroke-width="1.2"/>';
      var d = x1 > x0 ? -4 : 4;
      s += '<path d="M' + (x1 + d) + ',' + (yy - 3) + ' L' + x1 + ',' + yy + ' L' + (x1 + d) + ',' + (yy + 3) + '" fill="none" stroke="' + c + '" stroke-width="1.2"/>';
    }
    if (dir === 'both') { arrow(x, x + 15, y - 3); arrow(x + 15, x, y + 3); }
    else if (dir === 'in') arrow(x, x + 15, y);
    else arrow(x + 15, x, y);
    return s;
  }

  function render(svg) {
    var s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';

    /* header */
    s += txt(24, 30, 'INTEGRATION FABRIC · PIPELINE AND CONNECTOR LEDGER', { size: 10, fill: NET, ls: '0.16em', w: 700 });
    s += txt(24, 47, '82 CONNECTORS ONLINE · 42,180 TX/MIN · CANONICAL MODEL v4.2', { size: 9.2, fill: INK3, ls: '0.05em' });

    /* ── pipeline strip ── */
    var PX = 24, PW = W - 48, PY = 74, SW = PW / STAGES.length;
    s += txt(PX, PY - 8, 'PIPELINE · p95 LATENCY BUDGET 84 ms END TO END', { size: 9.2, fill: INK3, ls: '0.14em' });

    STAGES.forEach(function (st, i) {
      var x = PX + i * SW, w = SW - 8;
      var hot = st.id === 'ENRICH';
      var col = hot ? WARN : NET;
      s += '<rect x="' + x + '" y="' + PY + '" width="' + w + '" height="62" rx="3" fill="' + col +
        '" fill-opacity="' + (hot ? 0.09 : 0.045) + '" stroke="' + col + '" stroke-opacity="' + (hot ? 0.5 : 0.26) + '" stroke-width="0.9"/>';
      s += txt(x + 9, PY + 18, String(i + 1).padStart(2, '0'), { size: 9.2, fill: col, ls: '0.1em', w: 700 });
      s += txt(x + 30, PY + 18, st.id, { size: 9.6, fill: INK, ls: '0.12em', w: 700 });
      s += txt(x + 9, PY + 33, st.note, { size: 9.2, fill: INK3, ls: '0.02em' });
      /* per-stage latency bar, scaled to the largest stage */
      var barW = (st.ms / 21) * (w - 60);
      s += '<rect x="' + (x + 9) + '" y="' + (PY + 41) + '" width="' + (w - 60) + '" height="4" rx="2" fill="' + col + '" fill-opacity="0.14"/>';
      s += '<rect x="' + (x + 9) + '" y="' + (PY + 41) + '" width="' + barW.toFixed(1) + '" height="4" rx="2" fill="' + col + '" fill-opacity="0.8"/>';
      s += txt(x + w - 9, PY + 45, st.ms + ' ms', { size: 9.2, anchor: 'end', fill: col, ls: '0.02em', w: 700 });
      s += txt(x + 9, PY + 56, 'queue ' + st.q, { size: 9.2, fill: INK3, ls: '0.02em' });

      /* flow between stages */
      if (i < STAGES.length - 1) {
        var gx = x + w, gy = PY + 31;
        s += '<line x1="' + gx + '" y1="' + gy + '" x2="' + (gx + 8) + '" y2="' + gy + '" stroke="' + NET + '" stroke-opacity="0.4" stroke-width="1"/>';
        s += '<circle r="1.8" fill="' + NET + '" opacity="0.9"><animateMotion dur="2.4s" begin="' + (i * 0.28) + 's" repeatCount="indefinite" path="M' + gx + ',' + gy + ' L' + (gx + 8) + ',' + gy + '"/></circle>';
      }
    });

    /* ── connector ledger ── */
    var LY = 176;
    s += txt(24, LY, 'CONNECTOR LEDGER · 8 OF 82 SHOWN', { size: 9.2, fill: INK3, ls: '0.14em' });

    var COLS = [
      { x: 24,  t: 'SYSTEM' },
      { x: 168, t: 'PROTOCOL' },
      { x: 320, t: 'DIR' },
      { x: 368, t: 'MODE' },
      { x: 448, t: 'TX / MIN', a: 'end', ex: 528 },
      { x: 560, t: 'LAG', a: 'end', ex: 610 },
      { x: 646, t: 'HEALTH' }
    ];
    var HY = LY + 22;
    COLS.forEach(function (c) { s += txt(c.a === 'end' ? c.ex : c.x, HY, c.t, { size: 9.2, fill: INK3, ls: '0.14em', anchor: c.a }); });
    s += '<line x1="24" y1="' + (HY + 8) + '" x2="' + (W - 24) + '" y2="' + (HY + 8) + '" stroke="rgba(125,211,252,0.22)" stroke-width="0.9"/>';

    var RH = 40, top = HY + 8;
    CONNECTORS.forEach(function (r, i) {
      var y = top + i * RH;
      var lagging = r.h === 'LAG';
      var col = lagging ? WARN : OK;
      s += '<rect x="24" y="' + y + '" width="' + (W - 48) + '" height="' + RH + '" fill="' + (lagging ? WARN : NET) +
        '" fill-opacity="' + (lagging ? 0.05 : (i % 2 ? 0.014 : 0.028)) + '"/>';
      s += '<rect x="24" y="' + y + '" width="2.5" height="' + RH + '" fill="' + col + '" fill-opacity="0.75"/>';
      s += '<line x1="24" y1="' + (y + RH) + '" x2="' + (W - 24) + '" y2="' + (y + RH) + '" stroke="rgba(125,211,252,0.06)" stroke-width="0.7"/>';

      s += txt(COLS[0].x + 12, y + 18, r.sys, { size: 9.8, fill: INK, ls: '0.02em', w: 700 });
      s += txt(COLS[0].x + 12, y + 31, r.dom, { size: 9.2, fill: INK3, ls: '0.12em' });
      s += txt(COLS[1].x, y + 25, r.proto, { size: 9.2, fill: 'rgba(125,211,252,0.78)', ls: '0.02em' });
      s += dirGlyph(COLS[2].x, y + 21, r.dir);
      s += txt(COLS[3].x, y + 25, r.mode, { size: 9.2, fill: INK2, ls: '0.02em' });
      s += txt(COLS[4].ex, y + 25, r.tx, { size: 9.8, anchor: 'end', fill: INK, ls: '0.02em', w: 700 });
      s += txt(COLS[5].ex, y + 25, r.lag, { size: 9.4, anchor: 'end', fill: lagging ? WARN : INK2, ls: '0.02em', w: lagging ? 700 : 400 });

      var chip = lagging ? 'BACKPRESSURE' : 'HEALTHY';
      var cw = chip.length * adv(9.2, 0.12) + 16;
      s += '<rect x="' + COLS[6].x + '" y="' + (y + 12) + '" width="' + cw.toFixed(1) + '" height="17" rx="3" fill="' + col +
        '" fill-opacity="0.16" stroke="' + col + '" stroke-opacity="0.55" stroke-width="0.9"/>';
      s += txt(COLS[6].x + cw / 2, y + 24, chip, { size: 9.2, anchor: 'middle', fill: col, ls: '0.12em', w: 700 });
    });

    /* ── dead-letter + backpressure note ── */
    var DY = top + CONNECTORS.length * RH + 22;
    s += '<rect x="24" y="' + (DY - 14) + '" width="' + (W - 48) + '" height="34" rx="3" fill="' + WARN + '" fill-opacity="0.055" stroke="' + WARN + '" stroke-opacity="0.34" stroke-width="0.9"/>';
    s += '<circle cx="42" cy="' + (DY + 3) + '" r="3.4" fill="' + WARN + '"><animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/></circle>';
    s += txt(56, DY + 6, 'SCADA HISTORIAN 14 s BEHIND · READS THROTTLED AT SOURCE · 3 RETRIES AUTO-RECOVERED · 0 IN DEAD-LETTER', { size: 9.2, fill: WARN, ls: '0.05em', w: 700 });

    /* ── footer: only what the page chrome does not already state ── */
    s += '<line x1="24" y1="' + (H - 42) + '" x2="' + (W - 24) + '" y2="' + (H - 42) + '" stroke="rgba(125,211,252,0.1)" stroke-width="0.8"/>';
    var f = [['CANONICAL MODEL', 'v4.2'], ['SCHEMA DRIFT', '0 breaking'], ['EXACTLY-ONCE', 'enabled'], ['REPLAY WINDOW', '7 days']];
    var pitch = (W - 48) / f.length;
    f.forEach(function (m, i) {
      var fx = 24 + i * pitch;
      s += txt(fx, H - 24, m[0], { size: 9.2, fill: INK3, ls: '0.14em' });
      s += txt(fx, H - 10, m[1], { size: 10.5, fill: INK, ls: '0.02em', w: 700 });
    });

    /* the drawing owns its ratio, in any wrapper */
    svg.style.aspectRatio = W + ' / ' + H;
    svg.style.width = '100%';
    svg.style.height = 'auto';
    var host = svg.parentNode;
    if (host && host.classList && (host.classList.contains('mk__canvas') || host.classList.contains('ci__diagram'))) {
      host.style.aspectRatio = W + ' / ' + H;
    }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-fabric-console]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
