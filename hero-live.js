/* ─────────────────────────────────────────────────────────────
   Innovent · hero dashboard, kept live
   The screenshot's KPI numbers are drawn by the overlay SVG (hero_ov.svg) so
   they can move: this ticks them up at irregular intervals, the way a real
   operations dashboard creeps through the day, and repaints heatmap cells one
   at a time. Nothing here is data — it is the picture of a system that is on.
   Does nothing under reduced motion.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var svg = document.querySelector('svg.hero__ov');
  if (!svg) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function rint(a, b) { return Math.floor(rnd(a, b + 1)); }
  function money(v) { return '$' + Math.round(v).toLocaleString('en-US'); }
  function plain(v) { return String(Math.round(v)); }
  function gb(v) { return v.toFixed(1); }

  /* Each counter: element, value, formatter, step range and pause range (s). */
  var counters = [
    { id: 'hv-n-big', v: 300125, fmt: plain, step: [1, 6],   wait: [1.8, 4.5] },
    { id: 'hv-n-k1',  v: 1456,   fmt: money, step: [2, 9],   wait: [6, 14] },
    { id: 'hv-n-k3',  v: 1456,   fmt: money, step: [1, 7],   wait: [8, 18] },
    { id: 'hv-n-pct', v: 3257,   fmt: money, step: [1, 5],   wait: [7, 16] },
    { id: 'hv-n-gb',  v: 20.3,   fmt: gb,    step: [0.1, 0.1], wait: [45, 90] }
  ];

  function tick(c) {
    var el = document.getElementById(c.id);
    if (!el) return;
    var run = function () {
      {
        c.v += c.step[0] === c.step[1] ? c.step[0] : rint(c.step[0], c.step[1]);
        el.textContent = c.fmt(c.v);
        el.classList.remove('is-tick'); void el.getBBox(); el.classList.add('is-tick');
      }
      setTimeout(run, rnd(c.wait[0], c.wait[1]) * 1000);
    };
    setTimeout(run, rnd(c.wait[0], c.wait[1]) * 1000);
  }
  counters.forEach(tick);

  /* Heatmap: the screenshot's grid, columns 22.12px from x=1060, rows 30px
     from y=882. A cell takes a new shade every few seconds and keeps it. */
  var heat = document.getElementById('hv-heat');
  if (heat) {
    var shades = ['#2a1e0c', '#4a3312', '#6b4a17', '#8a611d', '#a97625', '#c98d2c', '#e6a638', '#f2b84a'];
    var cells = {};
    var NS = 'http://www.w3.org/2000/svg';
    var paint = function () {
      {
        var col = rint(0, 30), row = rint(0, 3);
        var key = col + ':' + row;
        var r = cells[key];
        if (!r) {
          r = document.createElementNS(NS, 'rect');
          r.setAttribute('x', (1060 + col * 22.12 + 1).toFixed(1));
          r.setAttribute('y', 882 + row * 30 + 1);
          r.setAttribute('width', '20'); r.setAttribute('height', '26'); r.setAttribute('rx', '2');
          r.setAttribute('class', 'hv-heatcell');
          r.style.opacity = '0';
          heat.appendChild(r); cells[key] = r;
        }
        r.style.fill = shades[rint(0, shades.length - 1)];
        r.style.opacity = '0.92';
      }
      setTimeout(paint, rnd(1.6, 3.8) * 1000);
    };
    setTimeout(paint, 1200);
  }
})();
