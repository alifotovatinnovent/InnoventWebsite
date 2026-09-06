// Innovent — animation runtime
// Scroll reveals + number counters + ROI flicker
(() => {
  // Intersection observer reveals
  const els = document.querySelectorAll("[data-reveal], [data-reveal-x], [data-reveal-scale]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => io.observe(el));

  // Number counter-up — fires once when impact section enters
  const counters = document.querySelectorAll("[data-count]");
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const dur = 1600;
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        const v = target * ease(p);
        el.textContent = prefix + v.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterIO.observe(el));

  // (hero particle dots removed at Ali's request — 6 Sep 2026)

  // ROI big number — flicker glow when value changes
  const roiNum = document.getElementById("savings");
  if (roiNum) {
    const mo = new MutationObserver(() => {
      roiNum.classList.add("is-changed");
      clearTimeout(roiNum._t);
      roiNum._t = setTimeout(() => roiNum.classList.remove("is-changed"), 350);
    });
    mo.observe(roiNum, { childList: true, characterData: true, subtree: true });
  }
})();
