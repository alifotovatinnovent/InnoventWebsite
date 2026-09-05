/* ─────────────────────────────────────────────────────────────
   Innfini · Tactical common operating picture
   Area of operations with control measures, named units, ISR
   sensor coverage, tracks of interest and a decision timeline.
   Deliberately generic: notional grid, no real geography or
   order of battle. Renders into <svg data-tactical-cop>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var W = 900, H = 540;
  var PAD = 56;

  var FRIEND = '#a7f3d0', NEUT = '#7dd3fc', UNK = '#fbbf24', HOST = '#fb7185', AI = '#c4b5fd';

  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + (o.size || 8.5) +
      '" letter-spacing="' + (o.ls || '0.1em') + '" fill="' + (o.fill || 'rgba(169,189,214,0.55)') + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }

  /* MIL-STD-2525-flavoured frames, simplified and non-specific */
  function frame(x, y, aff, id, role) {
    var col = aff === 'f' ? FRIEND : aff === 'h' ? HOST : aff === 'u' ? UNK : NEUT;
    var s = '';
    if (aff === 'f') {
      s += '<rect x="' + (x - 13) + '" y="' + (y - 9) + '" width="26" height="18" rx="2" fill="rgba(8,14,26,0.9)" stroke="' + col + '" stroke-width="1.3"/>';
    } else if (aff === 'h') {
      s += '<path d="M' + x + ',' + (y - 11) + ' L' + (x + 13) + ',' + y + ' L' + x + ',' + (y + 11) + ' L' + (x - 13) + ',' + y + ' Z" fill="rgba(8,14,26,0.9)" stroke="' + col + '" stroke-width="1.3"/>';
    } else {
      s += '<path d="M' + (x - 12) + ',' + (y + 9) + ' L' + (x - 12) + ',' + (y - 4) + ' Q' + x + ',' + (y - 16) + ' ' + (x + 12) + ',' + (y - 4) + ' L' + (x + 12) + ',' + (y + 9) + ' Z" fill="rgba(8,14,26,0.9)" stroke="' + col + '" stroke-width="1.3"/>';
    }
    s += txt(x, y + 3, role, { size: 6.5, anchor: 'middle', fill: col, w: 700, ls: '0.04em' });
    s += txt(x, y + 21, id, { size: 6.8, anchor: 'middle', fill: 'rgba(169,189,214,0.6)' });
    return s;
  }

  function render(svg) {
    var s = '';
    s += '<defs>' +
      '<radialGradient id="cop-isr" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.16"/>' +
        '<stop offset="100%" stop-color="#7dd3fc" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="cop-threat" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#fb7185" stop-opacity="0.28"/>' +
        '<stop offset="100%" stop-color="#fb7185" stop-opacity="0"/></radialGradient>' +
      '</defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="#060d18"/>';

    /* MGRS-style notional grid */
    var g = '';
    for (var x = PAD; x <= W - PAD; x += 74) g += '<line x1="' + x + '" y1="' + PAD + '" x2="' + x + '" y2="' + (H - PAD) + '"/>';
    for (var y = PAD; y <= H - PAD; y += 74) g += '<line x1="' + PAD + '" y1="' + y + '" x2="' + (W - PAD) + '" y2="' + y + '"/>';
    s += '<g stroke="rgba(125,211,252,0.07)" stroke-width="0.6">' + g + '</g>';
    s += '<rect x="' + PAD + '" y="' + PAD + '" width="' + (W - PAD * 2) + '" height="' + (H - PAD * 2) +
      '" fill="none" stroke="rgba(125,211,252,0.22)" stroke-width="1"/>';
    /* grid refs */
    for (var i = 0; i < 11; i++) s += txt(PAD + i * 74, PAD - 8, (11 + i) + '', { size: 6.2, anchor: 'middle', fill: 'rgba(125,211,252,0.3)' });
    for (var j = 0; j < 6; j++) s += txt(PAD - 8, PAD + j * 74 + 3, (48 - j) + '', { size: 6.2, anchor: 'end', fill: 'rgba(125,211,252,0.3)' });

    /* control measures — named areas of operation */
    var AREAS = [
      { x: PAD + 8, y: PAD + 8, w: 240, h: 170, id: 'AO NORTH', col: NEUT },
      { x: PAD + 262, y: PAD + 8, w: 300, h: 170, id: 'AO CENTRE', col: NEUT },
      { x: PAD + 8, y: PAD + 194, w: 554, h: 190, id: 'AO SOUTH · RESTRICTED', col: UNK }
    ];
    AREAS.forEach(function (a) {
      s += '<rect x="' + a.x + '" y="' + a.y + '" width="' + a.w + '" height="' + a.h + '" rx="3" fill="' + a.col +
        '" fill-opacity="0.025" stroke="' + a.col + '" stroke-opacity="0.28" stroke-width="0.9" stroke-dasharray="7 5"/>';
      s += txt(a.x + 9, a.y + 15, a.id, { size: 7, fill: a.col, ls: '0.16em' });
    });

    /* forward line — a phase line control measure */
    var flY = PAD + 190;
    s += '<line x1="' + (PAD + 8) + '" y1="' + flY + '" x2="' + (W - PAD - 8) + '" y2="' + flY +
      '" stroke="' + FRIEND + '" stroke-opacity="0.45" stroke-width="1.4" stroke-dasharray="14 6 3 6"/>';
    s += txt(W - PAD - 12, flY - 6, 'PHASE LINE ALPHA', { size: 6.8, anchor: 'end', fill: 'rgba(167,243,208,0.6)' });

    /* ISR sensor coverage fans */
    var ISR = [
      { x: 210, y: 170, r: 96, id: 'ISR-1 · EO/IR' },
      { x: 520, y: 150, r: 84, id: 'ISR-2 · RADAR' },
      { x: 700, y: 330, r: 78, id: 'ISR-3 · SIGINT' }
    ];
    ISR.forEach(function (n) {
      s += '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + n.r + '" fill="url(#cop-isr)"/>';
      s += '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + n.r + '" fill="none" stroke="' + NEUT + '" stroke-opacity="0.16" stroke-width="0.8" stroke-dasharray="4 5"/>';
      /* sweeping sensor line */
      s += '<line x1="' + n.x + '" y1="' + n.y + '" x2="' + (n.x + n.r) + '" y2="' + n.y + '" stroke="' + NEUT + '" stroke-opacity="0.3" stroke-width="1">' +
        '<animateTransform attributeName="transform" type="rotate" from="0 ' + n.x + ' ' + n.y + '" to="360 ' + n.x + ' ' + n.y + '" dur="8s" repeatCount="indefinite"/></line>';
      s += '<circle cx="' + n.x + '" cy="' + n.y + '" r="3" fill="' + NEUT + '"/>';
      s += txt(n.x, n.y - n.r - 6, n.id, { size: 6.5, anchor: 'middle', fill: 'rgba(125,211,252,0.6)' });
    });

    /* friendly units */
    s += frame(150, 120, 'f', 'TM-1', 'INF');
    s += frame(330, 140, 'f', 'TM-2', 'INF');
    s += frame(560, 110, 'f', 'LOG-4', 'SUP');
    s += frame(760, 200, 'f', 'CP-1', 'HQ');
    /* neutral / unknown tracks */
    s += frame(430, 300, 'u', 'TRK-118', 'UNK');
    s += frame(640, 400, 'n', 'CIV-22', 'CIV');

    /* track of interest with a threat ring */
    s += '<ellipse cx="250" cy="360" rx="76" ry="54" fill="url(#cop-threat)"/>';
    s += frame(250, 360, 'h', 'TOI-07', 'TOI');
    s += '<circle cx="250" cy="360" r="12" fill="none" stroke="' + HOST + '" stroke-width="1.3">' +
      '<animate attributeName="r" values="11;34;11" dur="2.6s" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="0.85;0;0.85" dur="2.6s" repeatCount="indefinite"/></circle>';

    /* movement vectors */
    [[150, 120, 330, 140], [330, 140, 430, 300], [250, 360, 360, 330]].forEach(function (v, i) {
      var d = 'M' + v[0] + ',' + v[1] + ' L' + v[2] + ',' + v[3];
      var col = i === 2 ? HOST : FRIEND;
      s += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-opacity="0.35" stroke-width="1.1" stroke-dasharray="5 4"/>';
      s += '<circle r="2.2" fill="' + col + '" opacity="0.9"><animateMotion dur="' + (5 + i) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
    });

    /* AI decision-support proposal, docked in the bottom gutter */
    var rx = PAD, ry = H - PAD + 26;
    s += '<rect x="' + rx + '" y="' + (ry - 15) + '" width="292" height="22" rx="4" fill="rgba(196,181,253,0.10)" stroke="rgba(196,181,253,0.42)" stroke-width="0.9"/>';
    s += '<circle cx="' + (rx + 11) + '" cy="' + (ry - 4) + '" r="3" fill="' + AI + '"><animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/></circle>';
    s += txt(rx + 20, ry - 1, 'DECISION SUPPORT · CUE ISR-2 TO TOI-07 · CONF 0.88', { size: 7, fill: AI, w: 700 });

    /* header + classification-style banner (generic, non-specific) */
    s += '<rect x="0" y="0" width="' + W + '" height="18" fill="rgba(167,243,208,0.08)"/>';
    s += txt(W / 2, 12.5, 'OPERATIONAL USE · ACCESS CONTROLLED · AUDIT ON', { size: 7, anchor: 'middle', fill: 'rgba(167,243,208,0.75)', ls: '0.2em', w: 700 });
    s += txt(PAD, 36, 'COMMON OPERATING PICTURE · NOTIONAL GRID', { size: 8.5, fill: FRIEND, ls: '0.18em', w: 700 });

    /* legend */
    var lx = W - PAD - 300;
    [[FRIEND, 'Friendly'], [NEUT, 'Neutral'], [UNK, 'Unknown'], [HOST, 'Track of interest'], [AI, 'AI cue']].forEach(function (l, i) {
      s += '<circle cx="' + (lx + i * 62) + '" cy="' + (H - 14) + '" r="3" fill="' + l[0] + '"/>';
      s += txt(lx + i * 62 + 8, H - 11, l[1], { size: 6.3, fill: 'rgba(169,189,214,0.5)' });
    });

    /* the drawing owns its ratio */
    var host = svg.parentNode;
    if (host && host.classList && host.classList.contains('mk__canvas')) host.style.aspectRatio = W + ' / ' + H;

    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tactical-cop]'), render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
