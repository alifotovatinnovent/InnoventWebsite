/* ─────────────────────────────────────────────────────────────
   Innfini · Substation single-line diagram (SLD)
   138 kV incomer → transformers → 11 kV bus → feeders, with DER
   injection, breaker states, live loads and a 24-hour demand
   trace. Renders into <svg data-grid-sld>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var W = 900, H = 560;

  var OK = '#6ee7b7', WARN = '#fbbf24', BAD = '#fb7185', NET = '#7dd3fc', DER = '#c4b5fd';

  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + (o.size || 8.5) +
      '" letter-spacing="' + (o.ls || '0.1em') + '" fill="' + (o.fill || 'rgba(169,189,214,0.6)') + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }
  /* IEC-style closed/open breaker */
  function breaker(x, y, closed, col) {
    col = col || (closed ? OK : WARN);
    return '<rect x="' + (x - 5) + '" y="' + (y - 5) + '" width="10" height="10" fill="' +
      (closed ? col : 'none') + '" fill-opacity="' + (closed ? 0.85 : 0) + '" stroke="' + col + '" stroke-width="1.3"/>';
  }
  function transformer(x, y, col) {
    return '<circle cx="' + x + '" cy="' + (y - 6) + '" r="9" fill="none" stroke="' + col + '" stroke-width="1.3"/>' +
           '<circle cx="' + x + '" cy="' + (y + 6) + '" r="9" fill="none" stroke="' + col + '" stroke-width="1.3"/>';
  }

  function render(svg) {
    var s = '';
    s += '<defs>' +
      '<linearGradient id="sld-dem" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.42"/>' +
        '<stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.02"/></linearGradient>' +
      '</defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';

    /* ── 138 kV incomers ── */
    s += txt(28, 30, 'SUBSTATION S-04 · SINGLE LINE', { size: 9.5, fill: NET, ls: '0.18em', w: 700 });
    s += txt(28, 43, '138 kV / 11 kV · 50.02 Hz · N-1 SECURE', { size: 7.5, fill: 'rgba(169,189,214,0.45)' });

    var HV_Y = 78;
    s += '<line x1="120" y1="' + HV_Y + '" x2="780" y2="' + HV_Y + '" stroke="' + NET + '" stroke-width="3.4" stroke-opacity="0.85"/>';
    s += txt(112, HV_Y + 3, '138 kV', { size: 8, anchor: 'end', fill: NET, w: 700 });

    /* two incoming lines */
    [[200, 'LINE-1', OK], [700, 'LINE-2', OK]].forEach(function (l) {
      s += '<line x1="' + l[0] + '" y1="' + (HV_Y - 34) + '" x2="' + l[0] + '" y2="' + HV_Y + '" stroke="' + NET + '" stroke-width="1.5"/>';
      s += breaker(l[0], HV_Y - 20, true, l[2]);
      s += txt(l[0], HV_Y - 40, l[1], { size: 7.5, anchor: 'middle', fill: 'rgba(169,189,214,0.6)' });
      s += '<circle r="2.4" fill="' + NET + '" opacity="0.9"><animateMotion dur="2.6s" repeatCount="indefinite" path="M' +
        l[0] + ',' + (HV_Y - 34) + ' L' + l[0] + ',' + HV_Y + '"/></circle>';
    });

    /* ── transformers down to 11 kV ── */
    var MV_Y = 216;
    var TX = [
      { x: 300, id: 'TX-04', load: '62 °C · 78%', col: OK,   closed: true },
      { x: 460, id: 'TX-07', load: '78 °C · 91%', col: WARN, closed: true },
      { x: 620, id: 'TX-12', load: 'oil due · 54%', col: WARN, closed: true }
    ];
    TX.forEach(function (t) {
      s += '<line x1="' + t.x + '" y1="' + HV_Y + '" x2="' + t.x + '" y2="' + (MV_Y - 46) + '" stroke="' + NET + '" stroke-width="1.5"/>';
      s += breaker(t.x, HV_Y + 26, t.closed, t.col);
      s += transformer(t.x, (HV_Y + MV_Y) / 2 - 10, t.col);
      s += '<line x1="' + t.x + '" y1="' + (MV_Y - 46) + '" x2="' + t.x + '" y2="' + MV_Y + '" stroke="' + NET + '" stroke-width="1.5"/>';
      s += breaker(t.x, MV_Y - 26, true, t.col);
      s += txt(t.x + 16, (HV_Y + MV_Y) / 2 - 12, t.id, { size: 8, fill: t.col, w: 700 });
      s += txt(t.x + 16, (HV_Y + MV_Y) / 2, t.load, { size: 7, fill: 'rgba(169,189,214,0.5)' });
      if (t.col === WARN) {
        s += '<circle cx="' + t.x + '" cy="' + ((HV_Y + MV_Y) / 2 - 10) + '" r="16" fill="none" stroke="' + WARN + '" stroke-width="1">' +
          '<animate attributeName="r" values="14;26;14" dur="2.6s" repeatCount="indefinite"/>' +
          '<animate attributeName="opacity" values="0.7;0;0.7" dur="2.6s" repeatCount="indefinite"/></circle>';
      }
    });

    /* ── 11 kV bus ── */
    s += '<line x1="120" y1="' + MV_Y + '" x2="780" y2="' + MV_Y + '" stroke="' + NET + '" stroke-width="3.4" stroke-opacity="0.85"/>';
    s += txt(112, MV_Y + 3, '11 kV', { size: 8, anchor: 'end', fill: NET, w: 700 });
    /* bus-section tie, normally open */
    s += breaker(390, MV_Y, false, NET);
    s += txt(390, MV_Y - 12, 'TIE · NO', { size: 6.5, anchor: 'middle', fill: 'rgba(125,211,252,0.55)' });

    /* ── feeders ── */
    var FD_Y = 330;
    var FEEDERS = [
      { x: 170, id: 'F-1', mw: '412 kW', st: OK,   note: 'Downtown' },
      { x: 250, id: 'F-2', mw: '388 kW', st: OK,   note: 'Marina' },
      { x: 330, id: 'F-3', mw: '244 kW', st: OK,   note: 'Industrial' },
      { x: 470, id: 'F-4', mw: '501 kW', st: WARN, note: 'Hospital' },
      { x: 550, id: 'F-5', mw: '0 kW',   st: BAD,  note: 'Fault · lockout' },
      { x: 630, id: 'F-6', mw: '295 kW', st: OK,   note: 'Residential' }
    ];
    FEEDERS.forEach(function (f) {
      var closed = f.st !== BAD;
      s += '<line x1="' + f.x + '" y1="' + MV_Y + '" x2="' + f.x + '" y2="' + FD_Y + '" stroke="' +
        (closed ? NET : BAD) + '" stroke-width="1.4" stroke-opacity="' + (closed ? 0.85 : 0.5) + '"' +
        (closed ? '' : ' stroke-dasharray="4 4"') + '/>';
      s += breaker(f.x, MV_Y + 30, closed, f.st);
      /* load symbol */
      s += '<path d="M' + (f.x - 7) + ',' + FD_Y + ' L' + f.x + ',' + (FD_Y + 12) + ' L' + (f.x + 7) + ',' + FD_Y + ' Z" fill="none" stroke="' + f.st + '" stroke-width="1.2"/>';
      s += txt(f.x, FD_Y + 26, f.id, { size: 7.5, anchor: 'middle', fill: f.st, w: 700 });
      s += txt(f.x, FD_Y + 36, f.mw, { size: 6.8, anchor: 'middle', fill: 'rgba(169,189,214,0.55)' });
      s += txt(f.x, FD_Y + 46, f.note, { size: 6.3, anchor: 'middle', fill: 'rgba(169,189,214,0.35)' });
      if (closed) {
        s += '<circle r="2" fill="' + NET + '" opacity="0.8"><animateMotion dur="3.2s" begin="' + (f.x % 7) * 0.3 +
          's" repeatCount="indefinite" path="M' + f.x + ',' + MV_Y + ' L' + f.x + ',' + FD_Y + '"/></circle>';
      } else {
        s += '<circle cx="' + f.x + '" cy="' + (MV_Y + 30) + '" r="13" fill="none" stroke="' + BAD + '" stroke-width="1.1">' +
          '<animate attributeName="r" values="11;22;11" dur="1.8s" repeatCount="indefinite"/>' +
          '<animate attributeName="opacity" values="0.9;0;0.9" dur="1.8s" repeatCount="indefinite"/></circle>';
      }
    });

    /* ── DER injection onto the bus ── */
    var DER_Y = 148;
    var DERS = [
      { x: 760, id: 'PV', label: 'SOLAR 420 kW', sym: 'pv' },
      { x: 820, id: 'WT', label: 'WIND 272 kW', sym: 'wt' },
      { x: 880, id: 'BESS', label: 'STORAGE 222 kW', sym: 'ba' }
    ];
    s += '<line x1="700" y1="' + MV_Y + '" x2="700" y2="' + DER_Y + '" stroke="' + DER + '" stroke-width="1.5" stroke-opacity="0.7"/>';
    s += '<line x1="700" y1="' + DER_Y + '" x2="836" y2="' + DER_Y + '" stroke="' + DER + '" stroke-width="1.5" stroke-opacity="0.7"/>';
    s += breaker(700, MV_Y - 26, true, DER);
    s += txt(700, DER_Y - 12, 'DER BUS · 1,240 kW ORCHESTRATED', { size: 7, anchor: 'start', fill: DER, w: 700 });
    [[740, 'PV', '34%'], [788, 'WIND', '22%'], [836, 'BESS', '18%']].forEach(function (d) {
      s += '<line x1="' + d[0] + '" y1="' + DER_Y + '" x2="' + d[0] + '" y2="' + (DER_Y + 26) + '" stroke="' + DER + '" stroke-width="1.2" stroke-opacity="0.6"/>';
      s += '<circle cx="' + d[0] + '" cy="' + (DER_Y + 34) + '" r="8" fill="none" stroke="' + DER + '" stroke-width="1.2"/>';
      s += txt(d[0], DER_Y + 37, d[2], { size: 6.2, anchor: 'middle', fill: DER });
      s += txt(d[0], DER_Y + 54, d[1], { size: 6.5, anchor: 'middle', fill: 'rgba(196,181,253,0.6)' });
      s += '<circle r="1.9" fill="' + DER + '"><animateMotion dur="2.8s" repeatCount="indefinite" path="M' +
        d[0] + ',' + (DER_Y + 26) + ' L' + d[0] + ',' + DER_Y + ' L700,' + DER_Y + ' L700,' + MV_Y + '"/></circle>';
    });

    /* ── 24 h demand trace ── */
    var CH_X = 120, CH_Y = 440, CH_W = 660, CH_H = 74;
    s += '<rect x="' + CH_X + '" y="' + CH_Y + '" width="' + CH_W + '" height="' + CH_H + '" fill="none" stroke="rgba(125,211,252,0.14)" stroke-width="0.7"/>';
    var pts = [0.44, 0.40, 0.38, 0.42, 0.55, 0.68, 0.74, 0.71, 0.69, 0.73, 0.82, 0.95, 0.88, 0.72];
    var d = '', area = '';
    pts.forEach(function (p, i) {
      var px = CH_X + (i / (pts.length - 1)) * CH_W;
      var py = CH_Y + CH_H - p * CH_H;
      d += (i ? ' L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
    });
    area = d + ' L' + (CH_X + CH_W) + ',' + (CH_Y + CH_H) + ' L' + CH_X + ',' + (CH_Y + CH_H) + ' Z';
    s += '<path d="' + area + '" fill="url(#sld-dem)"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + NET + '" stroke-width="1.6"/>';
    var peakX = CH_X + (11 / (pts.length - 1)) * CH_W, peakY = CH_Y + CH_H - 0.95 * CH_H;
    s += '<circle cx="' + peakX + '" cy="' + peakY + '" r="3.4" fill="' + NET + '"/>';
    s += txt(peakX, peakY - 8, 'PEAK 2,610 MW', { size: 6.8, anchor: 'middle', fill: NET });
    ['00:00', '06:00', '12:00', '18:00', 'now'].forEach(function (t, i) {
      s += txt(CH_X + (i / 4) * CH_W, CH_Y + CH_H + 13, t, { size: 6.8, anchor: i === 0 ? 'start' : (i === 4 ? 'end' : 'middle'), fill: 'rgba(169,189,214,0.4)' });
    });
    s += txt(CH_X, CH_Y - 8, 'DEMAND · LAST 24 h · 2,140 MW NOW · +4.2% w/w', { size: 7.5, fill: 'rgba(169,189,214,0.55)' });

    /* ── status rail ── */
    s += '<circle cx="26" cy="' + (H - 18) + '" r="3.2" fill="' + OK + '"><animate attributeName="opacity" values="1;0.3;1" dur="1.7s" repeatCount="indefinite"/></circle>';
    s += txt(36, H - 15, 'SCADA LINKED · 1s POLL · N-1 SECURE', { size: 7.2, fill: 'rgba(169,189,214,0.5)' });
    [[OK, 'Energised'], [WARN, 'Watch'], [BAD, 'Lockout'], [DER, 'DER']].forEach(function (l, i) {
      s += '<circle cx="' + (W - 250 + i * 62) + '" cy="' + (H - 21) + '" r="3" fill="' + l[0] + '"/>';
      s += txt(W - 242 + i * 62, H - 18, l[1], { size: 6.8, fill: 'rgba(169,189,214,0.5)' });
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
    Array.prototype.forEach.call(document.querySelectorAll('[data-grid-sld]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
