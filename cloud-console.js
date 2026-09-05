/* ─────────────────────────────────────────────────────────────
   Innfini · Cloud region console
   Replaces an eight-tile region grid that carried a name and a
   dot per region. This shows what an SRE reads: region roles and
   residency, live capacity and latency, replication topology with
   lag, and the failover posture with a measured RTO/RPO.
   Renders into <svg data-cloud-console>.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  var NET = '#7dd3fc', OK = '#6ee7b7', AI = '#c4b5fd', WARN = '#fbbf24', CRIT = '#fb7185';
  var INK = 'rgba(230,240,251,0.92)', INK2 = 'rgba(169,189,214,0.62)', INK3 = 'rgba(113,133,158,0.85)';

  /* W is fixed; H is DERIVED per render from the laid-out content, because the
     card stack grows with REGIONS.length. A hardcoded height silently clipped
     the topology labels and the whole failover block. */
  var W = 820, MIN_U = 9.2;

  function txt(x, y, s, o) {
    o = o || {};
    var fs = Math.max(o.size || 9, MIN_U);
    return '<text x="' + x + '" y="' + y + '" font-family="' + MONO + '" font-size="' + fs +
      '" letter-spacing="' + (o.ls || '0.08em') + '" fill="' + (o.fill || INK2) + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }
  function adv(fs, ls) { return fs * 0.6 + fs * (ls || 0); }
  function strW(s, fs, ls) { return s.length * adv(Math.max(fs || MIN_U, MIN_U), ls || 0); }

  var REGIONS = [
    { id: 'me-south-1',   name: 'MENA',    role: 'PRIMARY',   res: 'UAE · in-country',  ten: 118, cap: 0.62, p95: '38 ms', az: 3, c: OK },
    { id: 'eu-central-1', name: 'EU',      role: 'PRIMARY',   res: 'GDPR · Frankfurt',  ten: 64,  cap: 0.54, p95: '41 ms', az: 3, c: OK },
    { id: 'us-west-2',    name: 'US',      role: 'PRIMARY',   res: 'US only',           ten: 43,  cap: 0.47, p95: '44 ms', az: 3, c: OK },
    { id: 'ap-south-1',   name: 'APAC',    role: 'SECONDARY', res: 'Singapore',         ten: 17,  cap: 0.28, p95: '52 ms', az: 2, c: WARN }
  ];

  /* Compact by design: this console sits beside a ~400px copy column, so the
     region data is a dense table rather than four tall cards. Capacity, health
     and latency all still read at a glance. */
  function render(svg) {
    var s = '';

    /* Column x values are DERIVED from the measured header strings, not picked:
       a hardcoded COL.p95 sat 6.9 units after "TENANTS" and the two headers read
       as one label. HGAP is the minimum gutter between any two columns. */
    var HS = 9.2, HLS = 0.16, HGAP = 26;
    function nextCol(x, label) { return x + strW(label, HS, HLS) + HGAP; }
    var COL = { reg: 24 };
    /* the region cell holds name + id, so measure the widest of each rather than
       padding by eye — "eu-central-1" was overrunning into RESIDENCY */
    var REG_NAME_W = Math.max.apply(null, REGIONS.map(function (r) { return strW(r.name, 11, 0.08); }));
    var REG_ID_W   = Math.max.apply(null, REGIONS.map(function (r) { return strW(r.id, 9.4, 0.02); }));
    var REG_ID_X   = 12 + REG_NAME_W + 14;
    COL.res  = COL.reg + REG_ID_X + REG_ID_W + HGAP;
    COL.role = nextCol(COL.res, 'RESIDENCY') + 34;   // residency strings run long
    COL.ten  = nextCol(COL.role, 'ROLE') + 30;       // role chip is wider than its header
    COL.p95  = nextCol(COL.ten, 'TENANTS');
    COL.cap  = nextCol(COL.p95, 'p95');
    COL.health = W - 24;
    var TOP = 58, RH = 28;
    var TY = TOP + REGIONS.length * RH + 20;   // replication label
    var NY = TY + 22;                          // topology nodes
    var FY = NY + 28;                          // failover strip
    var FH = 30;
    var H = FY + FH + 10;

    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';

    s += txt(24, 26, 'CLOUD REGION CONSOLE · 4 REGIONS · 11 AZ · RESIDENCY ENFORCED PER TENANT', { size: 10, fill: NET, ls: '0.14em', w: 700 });

    /* column headers */
    s += txt(COL.reg, 44, 'REGION', { size: 9.2, fill: INK3, ls: '0.16em' });
    s += txt(COL.res, 44, 'RESIDENCY', { size: 9.2, fill: INK3, ls: '0.16em' });
    s += txt(COL.role, 44, 'ROLE', { size: 9.2, fill: INK3, ls: '0.16em' });
    s += txt(COL.ten, 44, 'TENANTS', { size: 9.2, fill: INK3, ls: '0.16em' });
    s += txt(COL.p95, 44, 'p95', { size: 9.2, fill: INK3, ls: '0.16em' });
    s += txt(COL.cap, 44, 'CAPACITY', { size: 9.2, fill: INK3, ls: '0.16em' });
    /* legend for the red tick inside each bar — without it a critical-coloured
       mark inside a healthy bar reads as an alarm rather than reserved headroom */
    var capHdrW = strW('CAPACITY', HS, HLS);
    s += '<line x1="' + (COL.cap + capHdrW + 12) + '" y1="38" x2="' + (COL.cap + capHdrW + 12) + '" y2="47" stroke="' + CRIT + '" stroke-opacity="0.65" stroke-width="1.1"/>';
    s += txt(COL.cap + capHdrW + 19, 44, 'BURST RESERVE', { size: 9.2, fill: 'rgba(251,113,133,0.7)', ls: '0.14em' });
    s += txt(COL.health, 44, 'HEALTH', { size: 9.2, anchor: 'end', fill: INK3, ls: '0.16em' });
    s += '<line x1="24" y1="' + (TOP - 8) + '" x2="' + (W - 24) + '" y2="' + (TOP - 8) + '" stroke="rgba(125,211,252,0.22)" stroke-width="0.9"/>';

    REGIONS.forEach(function (r, i) {
      var y = TOP + i * RH, mid = y + 19;
      s += '<rect x="24" y="' + y + '" width="' + (W - 48) + '" height="' + RH + '" fill="' + r.c + '" fill-opacity="' + (i % 2 ? 0.014 : 0.03) + '"/>';
      s += '<rect x="24" y="' + y + '" width="2.5" height="' + RH + '" fill="' + r.c + '" fill-opacity="0.75"/>';

      s += txt(COL.reg + 12, mid, r.name, { size: 11, fill: INK, ls: '0.08em', w: 700 });
      s += txt(COL.reg + REG_ID_X, mid, r.id, { size: 9.4, fill: 'rgba(125,211,252,0.75)', ls: '0.02em' });
      s += txt(COL.res, mid, r.res, { size: 9.4, fill: INK2, ls: '0.02em' });

      var rw = strW(r.role, 9.2, 0.12) + 14;
      s += '<rect x="' + COL.role + '" y="' + (y + 8) + '" width="' + rw.toFixed(1) + '" height="15" rx="3" fill="' + r.c +
        '" fill-opacity="0.16" stroke="' + r.c + '" stroke-opacity="0.5" stroke-width="0.8"/>';
      s += txt(COL.role + rw / 2, mid - 1, r.role, { size: 9.2, anchor: 'middle', fill: r.c, ls: '0.12em', w: 700 });

      s += txt(COL.ten, mid, String(r.ten), { size: 10.5, fill: INK, ls: '0', w: 700 });
      s += txt(COL.p95, mid, r.p95, { size: 10, fill: INK, ls: '0.02em' });

      /* inline capacity bar with the burst-reserve mark */
      var bw = 128, bx = COL.cap;
      s += '<rect x="' + bx + '" y="' + (mid - 8) + '" width="' + bw + '" height="7" rx="3.5" fill="' + r.c + '" fill-opacity="0.12"/>';
      s += '<rect x="' + bx + '" y="' + (mid - 8) + '" width="' + (bw * r.cap).toFixed(1) + '" height="7" rx="3.5" fill="' + r.c + '" fill-opacity="0.8"/>';
      s += '<line x1="' + (bx + bw * 0.8) + '" y1="' + (mid - 11) + '" x2="' + (bx + bw * 0.8) + '" y2="' + (mid + 2) + '" stroke="' + CRIT + '" stroke-opacity="0.65" stroke-width="1.1"/>';
      s += txt(bx + bw + 8, mid, Math.round(r.cap * 100) + '%', { size: 9.4, fill: INK2, ls: '0' });

      /* health: dot derived from the measured label, as before */
      var lbl = r.c === OK ? 'NOMINAL' : 'SCALING';
      var dotX = COL.health - strW(lbl, 9.2, 0.12) - 11;
      s += '<circle cx="' + dotX.toFixed(1) + '" cy="' + (mid - 3) + '" r="3.4" fill="' + r.c + '">' +
        '<animate attributeName="opacity" values="1;0.35;1" dur="' + (1.6 + i * 0.3) + 's" repeatCount="indefinite"/></circle>';
      s += txt(COL.health, mid, lbl, { size: 9.2, anchor: 'end', fill: r.c, ls: '0.12em', w: 700 });
    });

    /* ── replication topology, one compact row ── */
    s += txt(24, TY, 'REPLICATION · CONTROL PLANE ONLY · TENANT DATA STAYS IN REGION', { size: 9.2, fill: INK3, ls: '0.14em' });
    var NR = 5.5, NX = [150, 330, 510, 690];
    REGIONS.forEach(function (r, i) {
      s += '<circle cx="' + NX[i] + '" cy="' + NY + '" r="' + NR + '" fill="#0a1424" stroke="' + r.c + '" stroke-width="1.5"/>';
      s += txt(NX[i] - NR - 8, NY + 3.5, r.name, { size: 9.4, anchor: 'end', fill: r.c, ls: '0.08em', w: 700 });
      if (i < REGIONS.length - 1) {
        var x0 = NX[i] + NR + 3, x1 = NX[i + 1] - NR - 42, mid2 = (x0 + x1) / 2;
        s += '<line x1="' + x0 + '" y1="' + NY + '" x2="' + x1 + '" y2="' + NY + '" stroke="' + NET + '" stroke-opacity="0.3" stroke-width="1.1" stroke-dasharray="4 4"/>';
        s += '<circle r="2.4" fill="' + NET + '" opacity="0.9"><animateMotion dur="2.6s" begin="' + (i * 0.5) + 's" repeatCount="indefinite" path="M' + x0 + ',' + NY + ' L' + x1 + ',' + NY + '"/></circle>';
        s += txt(mid2, NY - 9, ['0.8 s', '1.1 s', '1.6 s'][i] + ' lag', { size: 9.2, anchor: 'middle', fill: NET, ls: '0.02em' });
      }
    });

    /* ── failover posture, one strip ── */
    s += '<rect x="24" y="' + FY + '" width="' + (W - 48) + '" height="' + FH + '" rx="4" fill="' + AI + '" fill-opacity="0.06" stroke="' + AI + '" stroke-opacity="0.35" stroke-width="0.9"/>';
    s += '<circle cx="42" cy="' + (FY + FH / 2) + '" r="3.4" fill="' + AI + '"><animate attributeName="opacity" values="1;0.3;1" dur="1.9s" repeatCount="indefinite"/></circle>';
    s += txt(58, FY + 13, 'FAILOVER · ACTIVE-ACTIVE IN REGION · WARM STANDBY ACROSS', { size: 9.4, fill: AI, ls: '0.06em', w: 700 });
    s += txt(58, FY + 25, 'measured RTO 4m 10s · RPO 12s · game-day passed 18 days ago', { size: 9.2, fill: INK3, ls: '0.02em' });

    svg.style.aspectRatio = W + ' / ' + H;
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  /* ── responsibility split ── */
  function figResponsibility(svg) {
    var W = 820, H = 400, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(24, 30, 'SHARED RESPONSIBILITY · WHO OWNS WHAT IN INNFINI CLOUD', { size: 10, fill: NET, ls: '0.16em', w: 700 });

    var LAYERS = [
      { n: 'Your data and content',        who: 'CUSTOMER', c: AI },
      { n: 'Tenant configuration and rules', who: 'CUSTOMER', c: AI },
      { n: 'User identity and access',     who: 'SHARED',   c: WARN },
      { n: 'Integration credentials',      who: 'SHARED',   c: WARN },
      { n: 'Application and platform',     who: 'INNOVENT', c: OK },
      { n: 'Runtime, patching, scaling',   who: 'INNOVENT', c: OK },
      { n: 'Physical and network security', who: 'INNOVENT', c: OK }
    ];
    var top = 66, RH = 42;
    LAYERS.forEach(function (l, i) {
      var y = top + i * RH;
      s += '<rect x="24" y="' + y + '" width="' + (W - 48) + '" height="' + (RH - 6) + '" rx="4" fill="' + l.c +
        '" fill-opacity="0.04" stroke="' + l.c + '" stroke-opacity="0.28" stroke-width="0.9"/>';
      s += txt(44, y + 23, l.n, { size: 10.5, fill: INK, ls: '0.02em' });
      var cw = strW(l.who, 9.2, 0.14) + 18;
      s += '<rect x="' + (W - 44 - cw) + '" y="' + (y + 8) + '" width="' + cw.toFixed(1) + '" height="19" rx="3" fill="' + l.c +
        '" fill-opacity="0.16" stroke="' + l.c + '" stroke-opacity="0.55" stroke-width="0.9"/>';
      s += txt(W - 44 - cw / 2, y + 21, l.who, { size: 9.2, anchor: 'middle', fill: l.c, ls: '0.14em', w: 700 });
    });
    s += txt(24, H - 14, 'THE LINE MOVES WITH THE DEPLOYMENT MODEL · ON-PREMISE PUSHES EVERYTHING BELOW THE FOLD TO YOU', { size: 9.2, fill: INK3, ls: '0.08em' });
    return finishFig(svg, s, W, H);
  }

  /* ── tenant isolation ── */
  function figIsolation(svg) {
    var W = 820, H = 380, s = '';
    s += '<rect width="' + W + '" height="' + H + '" fill="#070f1e"/>';
    s += txt(24, 30, 'TENANT ISOLATION · THREE LAYERS, NOT ONE', { size: 10, fill: NET, ls: '0.16em', w: 700 });

    var BW = (W - 48 - 32) / 3, BG = 16;
    var boxes = [
      { x: 24,               w: BW, t: 'NETWORK', c: NET, d: ['Dedicated VPC per tenant', 'No shared ingress path', 'Private link to your estate'] },
      { x: 24 + BW + BG,     w: BW, t: 'COMPUTE', c: AI,  d: ['Namespaced workloads', 'CPU and memory quotas', 'No noisy-neighbour bleed'] },
      { x: 24 + (BW + BG) * 2, w: BW, t: 'DATA',  c: OK,  d: ['Separate encrypted store', 'Per-tenant key custody', 'Row-level policy on read'] }
    ];
    boxes.forEach(function (b, i) {
      s += '<rect x="' + b.x + '" y="66" width="' + b.w + '" height="180" rx="5" fill="' + b.c + '" fill-opacity="0.04" stroke="' + b.c + '" stroke-opacity="0.34" stroke-width="1"/>';
      s += txt(b.x + 18, 92, b.t, { size: 11, fill: b.c, ls: '0.18em', w: 700 });
      s += '<line x1="' + (b.x + 18) + '" y1="102" x2="' + (b.x + b.w - 18) + '" y2="102" stroke="' + b.c + '" stroke-opacity="0.2" stroke-width="0.8"/>';
      b.d.forEach(function (d, k) {
        s += '<circle cx="' + (b.x + 22) + '" cy="' + (124 + k * 30) + '" r="2.6" fill="' + b.c + '"/>';
        s += txt(b.x + 32, 128 + k * 30, d, { size: 9.8, fill: INK, ls: '0.02em' });
      });
      s += '<circle cx="' + (b.x + b.w - 26) + '" cy="' + 88 + '" r="4" fill="' + b.c + '"><animate attributeName="opacity" values="1;0.3;1" dur="' + (1.7 + i * 0.4) + 's" repeatCount="indefinite"/></circle>';
    });

    /* a blocked cross-tenant attempt */
    s += '<rect x="24" y="272" width="' + (W - 48) + '" height="52" rx="4" fill="' + CRIT + '" fill-opacity="0.06" stroke="' + CRIT + '" stroke-opacity="0.4" stroke-width="0.9"/>';
    s += '<circle cx="46" cy="298" r="9" fill="none" stroke="' + CRIT + '" stroke-width="1.4"/>';
    s += '<line x1="41" y1="293" x2="51" y2="303" stroke="' + CRIT + '" stroke-width="1.6"/>';
    s += '<line x1="51" y1="293" x2="41" y2="303" stroke="' + CRIT + '" stroke-width="1.6"/>';
    s += txt(66, 294, 'CROSS-TENANT READ ATTEMPT · REFUSED AT ALL THREE LAYERS INDEPENDENTLY', { size: 9.8, fill: CRIT, ls: '0.06em', w: 700 });
    s += txt(66, 309, 'a single-layer bypass is not sufficient to reach another tenant\'s data', { size: 9.2, fill: INK3, ls: '0.02em' });

    s += txt(24, H - 14, 'ISOLATION IS VERIFIED BY AUTOMATED TESTS ON EVERY RELEASE, NOT ASSUMED FROM ARCHITECTURE', { size: 9.2, fill: INK3, ls: '0.08em' });
    return finishFig(svg, s, W, H);
  }

  function finishFig(svg, s, W, H) {
    svg.style.aspectRatio = W + ' / ' + H;
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = s;
  }

  var FIGS = { responsibility: figResponsibility, isolation: figIsolation };

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-cloud-console]'), render);
    Array.prototype.forEach.call(document.querySelectorAll('[data-cloud-fig]'), function (n) {
      var f = FIGS[n.getAttribute('data-cloud-fig')];
      if (f) f(n);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
