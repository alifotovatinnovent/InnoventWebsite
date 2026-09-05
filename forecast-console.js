/* ─────────────────────────────────────────────────────────────
   Innfini · Predictive analytics — forecast console
   Replaces a decorative sparkline with the thing a planner reads:
   observed history, a forecast with a widening confidence band,
   the threshold it breaches and when, the drivers behind it, and
   the model register with calibration state.
   Renders into <svg data-forecast-console>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var NET = '#7dd3fc', OK = '#6ee7b7', AI = '#c4b5fd', WARN = '#fbbf24', CRIT = '#fb7185';
  var INK = 'rgba(230,240,251,0.92)', INK2 = 'rgba(169,189,214,0.62)', INK3 = 'rgba(113,133,158,0.85)';

  var W = 820, H = 620, MIN_U = 9.2;

  function txt(x, y, s, o) {
    o = o || {};
    var fs = Math.max(o.size || 9, MIN_U);
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + fs +
      '" letter-spacing="' + (o.ls || '0.08em') + '" fill="' + (o.fill || INK2) + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }
  function adv(fs, ls) { return fs * 0.6 + fs * (ls || 0); }
  function strW(s, fs, ls) { return s.length * adv(Math.max(fs || MIN_U, MIN_U), ls || 0); }

  /* SLA-risk series · 12 observed points then 8 forecast points */
  var OBS = [0.28, 0.31, 0.29, 0.34, 0.33, 0.38, 0.41, 0.39, 0.44, 0.48, 0.52, 0.57];
  var FC  = [0.61, 0.65, 0.70, 0.74, 0.78, 0.80, 0.82, 0.83];
  var BAND = [0.03, 0.05, 0.07, 0.10, 0.13, 0.16, 0.19, 0.22];   // ± widening
  var THRESH = 0.75;

  function render(svg) {
    var s = '';
    s += '<defs>' +
      '<linearGradient id="fc-obs" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.30"/>' +
        '<stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.02"/></linearGradient>' +
      '</defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';

    /* header */
    s += txt(24, 30, 'FORECAST CONSOLE · SLA BREACH RISK · ZONE C DISPATCH', { size: 10, fill: NET, ls: '0.16em', w: 700 });
    s += txt(24, 47, 'MODEL sla_risk_v14 · GRADIENT BOOSTED · RETRAINED 2.3 h AGO', { size: 9.2, fill: INK3, ls: '0.05em' });

    /* ── chart ── */
    var CX0 = 74, CX1 = W - 132, CY0 = 78, CY1 = 262;
    var n = OBS.length + FC.length - 1;
    function px(i) { return CX0 + (i / n) * (CX1 - CX0); }
    function py(v) { return CY1 - v * (CY1 - CY0); }

    /* y grid */
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      s += '<line x1="' + CX0 + '" y1="' + py(v) + '" x2="' + CX1 + '" y2="' + py(v) +
        '" stroke="rgba(125,211,252,0.08)" stroke-width="0.7"/>';
      s += txt(CX0 - 10, py(v) + 3, Math.round(v * 100) + '%', { size: 9.2, anchor: 'end', fill: INK3 });
    });

    /* threshold */
    s += '<line x1="' + CX0 + '" y1="' + py(THRESH) + '" x2="' + CX1 + '" y2="' + py(THRESH) +
      '" stroke="' + CRIT + '" stroke-opacity="0.6" stroke-width="1.2" stroke-dasharray="6 4"/>';
    s += txt(CX1 + 8, py(THRESH) + 3, 'SLA THRESHOLD 75%', { size: 9.2, fill: CRIT, ls: '0.06em', w: 700 });

    /* observed area + line */
    var obsPath = '', obsArea = '';
    OBS.forEach(function (v, i) { obsPath += (i ? ' L' : 'M') + px(i).toFixed(1) + ',' + py(v).toFixed(1); });
    obsArea = obsPath + ' L' + px(OBS.length - 1).toFixed(1) + ',' + CY1 + ' L' + px(0).toFixed(1) + ',' + CY1 + ' Z';
    s += '<path d="' + obsArea + '" fill="url(#fc-obs)"/>';
    s += '<path d="' + obsPath + '" fill="none" stroke="' + NET + '" stroke-width="1.9"/>';

    /* confidence band on the forecast */
    var up = '', dn = [];
    FC.forEach(function (v, i) {
      var idx = OBS.length - 1 + i;
      var hi = Math.min(1, v + BAND[i]), lo = Math.max(0, v - BAND[i]);
      up += (i ? ' L' : 'M') + px(idx).toFixed(1) + ',' + py(hi).toFixed(1);
      dn.push([px(idx), py(lo)]);
    });
    for (var k = dn.length - 1; k >= 0; k--) up += ' L' + dn[k][0].toFixed(1) + ',' + dn[k][1].toFixed(1);
    s += '<path d="' + up + ' Z" fill="' + WARN + '" fill-opacity="0.13" stroke="' + WARN + '" stroke-opacity="0.22" stroke-width="0.8"/>';

    /* forecast line */
    var fcPath = 'M' + px(OBS.length - 1).toFixed(1) + ',' + py(OBS[OBS.length - 1]).toFixed(1);
    FC.forEach(function (v, i) { fcPath += ' L' + px(OBS.length - 1 + i).toFixed(1) + ',' + py(v).toFixed(1); });
    s += '<path d="' + fcPath + '" fill="none" stroke="' + WARN + '" stroke-width="1.9" stroke-dasharray="5 3"/>';

    /* now marker */
    var nowX = px(OBS.length - 1);
    s += '<line x1="' + nowX + '" y1="' + (CY0 - 12) + '" x2="' + nowX + '" y2="' + (CY1 + 6) + '" stroke="' + INK3 + '" stroke-width="1" stroke-dasharray="3 3"/>';
    s += txt(nowX, CY0 - 18, 'NOW', { size: 9.2, anchor: 'middle', fill: INK2, ls: '0.16em', w: 700 });
    s += '<circle cx="' + nowX + '" cy="' + py(OBS[OBS.length - 1]) + '" r="4" fill="' + NET + '" stroke="#070f1e" stroke-width="1.4"/>';

    /* breach point — where the central forecast crosses the threshold */
    var bi = -1;
    for (var i2 = 0; i2 < FC.length; i2++) if (FC[i2] >= THRESH) { bi = i2; break; }
    if (bi >= 0) {
      var bx = px(OBS.length - 1 + bi), by = py(FC[bi]);
      s += '<circle cx="' + bx + '" cy="' + by + '" r="8" fill="none" stroke="' + CRIT + '" stroke-width="1.4">' +
        '<animate attributeName="r" values="6;20;6" dur="2.4s" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" repeatCount="indefinite"/></circle>';
      s += '<circle cx="' + bx + '" cy="' + by + '" r="4.4" fill="' + CRIT + '" stroke="#070f1e" stroke-width="1.2"/>';
      s += txt(bx, by - 16, 'BREACH IN 2h 40m', { size: 9.4, anchor: 'middle', fill: CRIT, ls: '0.06em', w: 700 });
    }

    /* x axis */
    ['−6h', '−4h', '−2h', 'now', '+2h', '+4h'].forEach(function (t, i) {
      var x = CX0 + (i / 5) * (CX1 - CX0);
      s += txt(x, CY1 + 20, t, { size: 9.2, anchor: 'middle', fill: INK3 });
    });

    /* legend */
    var lx = CX0;
    [[NET, 'Observed'], [WARN, 'Forecast'], [WARN, '80% interval'], [CRIT, 'Threshold']].forEach(function (l, i) {
      var x = lx + i * 116;
      s += '<rect x="' + x + '" y="' + (CY1 + 32) + '" width="14" height="3" rx="1.5" fill="' + l[0] + '" fill-opacity="' + (i === 2 ? 0.3 : 0.9) + '"/>';
      s += txt(x + 20, CY1 + 38, l[1], { size: 9.2, fill: INK3, ls: '0.06em' });
    });

    /* ── drivers ── */
    var DY = 336;
    s += txt(24, DY, 'WHAT IS DRIVING IT · SHAPLEY CONTRIBUTION', { size: 9.2, fill: INK3, ls: '0.14em' });
    var DRIVERS = [
      { k: 'Open jobs in queue', v: 0.34, d: '18 → 31 in 90 min' },
      { k: 'Crew availability',  v: 0.27, d: '2 short on evening shift' },
      { k: 'Dock congestion',    v: 0.21, d: 'Zone C at 92% utilisation' },
      { k: 'Historical weekday', v: 0.11, d: 'Thursday peak pattern' },
      { k: 'Weather',            v: 0.07, d: 'rain from 17:00' }
    ];
    var bx0 = 218, bw = 232;
    DRIVERS.forEach(function (d, i) {
      var y = DY + 22 + i * 26;
      s += txt(24, y, d.k, { size: 9.6, fill: INK, ls: '0.02em' });
      s += '<rect x="' + bx0 + '" y="' + (y - 8) + '" width="' + bw + '" height="9" rx="4.5" fill="' + NET + '" fill-opacity="0.10"/>';
      s += '<rect x="' + bx0 + '" y="' + (y - 8) + '" width="' + (bw * (d.v / 0.34)).toFixed(1) + '" height="9" rx="4.5" fill="' + NET + '" fill-opacity="0.78"/>';
      s += txt(bx0 + bw + 10, y, (d.v * 100).toFixed(0) + '%', { size: 9.6, fill: NET, ls: '0', w: 700 });
      s += txt(bx0 + bw + 48, y, d.d, { size: 9.2, fill: INK3, ls: '0.02em' });
    });

    /* ── recommendation ── */
    var RY = DY + 168;
    s += '<rect x="24" y="' + RY + '" width="' + (W - 48) + '" height="46" rx="4" fill="' + AI + '" fill-opacity="0.07" stroke="' + AI + '" stroke-opacity="0.4" stroke-width="1"/>';
    s += '<circle cx="42" cy="' + (RY + 23) + '" r="3.6" fill="' + AI + '"><animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/></circle>';
    s += txt(58, RY + 19, 'RECOMMENDED · ADD 2 EVENING CREW BY 16:30', { size: 9.8, fill: AI, ls: '0.08em', w: 700 });
    s += txt(58, RY + 34, 'modelled effect: peak risk 83% → 61% · breach avoided · cost 1 overtime shift', { size: 9.2, fill: INK3, ls: '0.02em' });

    /* ── model register ── */
    var MY = RY + 68;
    s += txt(24, MY, 'MODEL REGISTER · 22 ONLINE', { size: 9.2, fill: INK3, ls: '0.14em' });
    var MODELS = [
      { n: 'sla_risk_v14',        p: '96.4%', cal: 'Calibrated', drift: 'none',   c: OK },
      { n: 'equip_failure_v9',    p: '94.1%', cal: 'Calibrated', drift: 'none',   c: OK },
      { n: 'demand_forecast_v22', p: '91.7%', cal: 'Calibrated', drift: 'watch',  c: WARN },
      { n: 'congestion_v6',       p: '89.3%', cal: 'Recalibrating', drift: 'retrain queued', c: WARN }
    ];
    var CO = [24, 214, 330, 452];
    s += txt(CO[0], MY + 20, 'MODEL', { size: 9.2, fill: INK3, ls: '0.14em' });
    s += txt(CO[1], MY + 20, 'PRECISION', { size: 9.2, fill: INK3, ls: '0.14em' });
    s += txt(CO[2], MY + 20, 'CALIBRATION', { size: 9.2, fill: INK3, ls: '0.14em' });
    s += txt(CO[3], MY + 20, 'DRIFT', { size: 9.2, fill: INK3, ls: '0.14em' });
    s += '<line x1="24" y1="' + (MY + 28) + '" x2="' + (W - 24) + '" y2="' + (MY + 28) + '" stroke="rgba(125,211,252,0.2)" stroke-width="0.9"/>';
    MODELS.forEach(function (m, i) {
      var y = MY + 28 + i * 26;
      s += '<rect x="24" y="' + y + '" width="' + (W - 48) + '" height="26" fill="' + m.c + '" fill-opacity="' + (i % 2 ? 0.015 : 0.03) + '"/>';
      s += '<rect x="24" y="' + y + '" width="2.5" height="26" fill="' + m.c + '" fill-opacity="0.7"/>';
      s += txt(CO[0] + 12, y + 17, m.n, { size: 9.6, fill: INK, ls: '0.02em' });
      s += txt(CO[1], y + 17, m.p, { size: 9.6, fill: INK, ls: '0.02em', w: 700 });
      s += txt(CO[2], y + 17, m.cal, { size: 9.2, fill: m.c, ls: '0.02em' });
      s += txt(CO[3], y + 17, m.drift, { size: 9.2, fill: INK3, ls: '0.02em' });
    });

    s += '<line x1="24" y1="' + (H - 34) + '" x2="' + (W - 24) + '" y2="' + (H - 34) + '" stroke="rgba(125,211,252,0.1)" stroke-width="0.8"/>';
    s += txt(24, H - 14, 'EVERY PREDICTION SCORED AGAINST WHAT ACTUALLY HAPPENED · DRIFT RAISES AN INCIDENT, NOT A SILENCE', { size: 9.2, fill: INK3, ls: '0.08em' });

    svg.style.aspectRatio = W + ' / ' + H;
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-forecast-console]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
