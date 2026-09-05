/* ════════════════════════════════════════════════════════════
   INNFINI · 6-scene story engine
   Auto-advances on scroll-in, loops, supports dot + play/pause.
   ════════════════════════════════════════════════════════════ */
(function () {
  const root = document.querySelector('[data-ifs]');
  if (!root) return;

  const scenes = Array.from(root.querySelectorAll('.ifs-scene'));
  const dots   = Array.from(root.querySelectorAll('.ifs-dot'));
  const ppBtn  = root.querySelector('[data-ifs-pp]');
  const stepEl = root.querySelector('[data-ifs-step]');
  const bar    = root.querySelector('.ifs__progress');
  const total  = scenes.length;

  // per-scene duration (ms)
  const DUR = [4200, 6000, 6000, 8800, 6000, 5200];
  const LABELS = ['Signals', 'Graph', 'AI runtime', 'Decisions', 'Outputs', 'Operating system'];

  let idx = -1;
  let timer = null;
  let rafId = null;
  let segStart = 0;
  let playing = false;
  let booted = false;

  function setProgress(p) { if (bar) bar.style.width = (p * 100).toFixed(2) + '%'; }

  function tick(now) {
    if (!playing) return;
    const elapsed = now - segStart;
    const p = Math.min(elapsed / DUR[idx], 1);
    setProgress(p);
    if (elapsed >= DUR[idx]) { next(); return; }
    rafId = requestAnimationFrame(tick);
  }

  function show(n) {
    idx = (n + total) % total;
    scenes.forEach((s, i) => s.classList.remove('is-active'));
    dots.forEach((d, i) => d.classList.toggle('is-on', i === idx));
    if (stepEl) stepEl.innerHTML = '<b>' + String(idx + 1).padStart(2, '0') + '</b> / ' +
      String(total).padStart(2, '0') + ' · ' + LABELS[idx];
    // activate on next frame so CSS entrance animations restart cleanly
    requestAnimationFrame(() => {
      scenes[idx].classList.add('is-active');
      fitWf();
      segStart = performance.now();
      setProgress(0);
      if (playing) { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(tick); }
    });
  }

  function next() { show(idx + 1); }

  // scale the fixed 1280x720 workflow canvas to "contain" inside the panel
  function fitWf() {
    var wfs = root.querySelectorAll('.ifs-wf');
    wfs.forEach(function (wf) {
      var box = wf.parentElement.getBoundingClientRect();
      if (!box.width || !box.height) return;
      var s = Math.min(box.width / 1280, box.height / 720);
      wf.style.setProperty('--ifs-wf-scale', s);
    });
  }
  fitWf();
  window.addEventListener('resize', fitWf);

  function play() {
    if (playing) return;
    playing = true;
    root.classList.add('is-playing');
    segStart = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    playing = false;
    root.classList.remove('is-playing');
    cancelAnimationFrame(rafId);
  }

  function boot() {
    if (booted) return;
    booted = true;
    show(0);
    play();
  }

  // start when scrolled into view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { boot(); }
      else if (booted) { pause(); }
    });
  }, { threshold: 0.35 });
  io.observe(root);

  // resume autoplay when scrolled back in (only if user hasn't paused manually)
  let userPaused = false;
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && booted && !userPaused) play();
    });
  }, { threshold: 0.35 });
  io2.observe(root);

  // play / pause toggle
  ppBtn.addEventListener('click', () => {
    if (playing) { userPaused = true; pause(); }
    else { userPaused = false; if (!booted) boot(); else play(); }
  });

  // dot navigation
  dots.forEach((d, i) => {
    d.addEventListener('click', () => {
      booted = true;
      show(i);
      if (!playing && !userPaused) play();
    });
  });
})();
