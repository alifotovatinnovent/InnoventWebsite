// Shared nav + footer for Innovent sub-pages
(function () {
  const cur = (document.body.dataset.page || '').toLowerCase();
  /* Sub-pages live in /pages/, so their links are relative. The 404 page is
     served at whatever address failed, so from there everything must be
     root-absolute. R reaches the site root, P reaches the pages folder. */
  const IN_PAGES = /\/pages\/[^/]*$/.test(location.pathname);
  const R = IN_PAGES ? '../' : '/';
  const P = IN_PAGES ? '' : '/pages/';
  const isActive = (k) => cur === k ? ' is-active' : '';
  const isNew = (k) => k ? ' is-new' : '';

  const nav = `
<a class="skip-link" href="#main">Skip to content</a>
<header class="nav">
  <div class="nav__inner">
    <a class="nav__brand" href="${R}index.html">
      <img src="${R}assets/innovent/logo-wordmark.webp?v=20260911a" alt="Innovent" width="1200" height="110">
    </a>
    <nav class="nav__links" aria-label="Primary">
      <a class="nav__link${isActive('platform')}" href="${P}platform.html">Innfini Platform</a>
      <a class="nav__link${isActive('cc')}" href="${P}command-control.html">Command &amp; Control</a>
      <a class="nav__link${isActive('smart-city')}" href="${P}smart-city.html">Smart Cities</a>
      <a class="nav__link${isActive('industries')}" href="${P}industries.html">Industries</a>
      <a class="nav__link${isActive('resources')}" href="${P}resources.html">Resources</a>
      <a class="nav__link${isActive('careers')}" href="${P}careers.html">Careers</a>
    </nav>
    <div class="nav__right">
      <a class="btn btn--secondary btn--sm" href="${P}login.html">Sign in</a>
      <a class="btn btn--primary btn--sm" href="${P}request-demo.html">Request demo</a>
    </div>
  </div>
</header>`;

  const footer = `
<footer class="foot">
  <div class="container">
    <div class="foot__grid">
      <div class="foot__brand">
        <a class="nav__brand" href="${R}index.html" style="margin-bottom:14px;display:inline-flex">
          <img src="${R}assets/innovent/logo-wordmark.webp?v=20260911a" alt="Innovent" width="1200" height="110">
        </a>
        <p>Innovent builds Innfini, the operating platform for physical infrastructure. Headquartered in Los Angeles, with offices on four continents.</p>
      </div>
      <div class="foot__col">
        <h5>Platform</h5>
        <ul>
          <li><a href="${P}platform.html">Innfini overview</a></li>
          <li><a href="${P}platform-architecture.html">Architecture</a></li>
          <li><a href="${P}cap-sensor-fabric.html">Sensor fabric</a></li>
          <li><a href="${P}cap-object-graph.html">Object &amp; graph</a></li>
          <li><a href="${P}cap-decision-engine.html">Decision engine</a></li>
          <li><a href="${P}cap-agentic-ai.html">Agentic runtime</a></li>
          <li><a href="${P}cap-connectors.html">Integrations</a></li>
          <li><a href="${P}cap-edge.html">Edge runtime</a></li>
          <li><a href="${P}pd-cloud.html">Deployment</a></li>
          <li><a href="${P}trust.html">Security</a></li>
        </ul>
      </div>
      <div class="foot__col">
        <h5>Solutions</h5>
        <ul>
          <li><a href="${P}command-control.html">Command &amp; Control</a></li>
          <li><a href="${P}smart-city.html">Smart Cities</a></li>
          <li><a href="${P}ind-ports.html">Ports &amp; Maritime</a></li>
          <li><a href="${P}ind-manufacturing.html">Manufacturing</a></li>
          <li><a href="${P}ind-logistics.html">Logistics</a></li>
          <li><a href="${P}ind-healthcare.html">Healthcare</a></li>
          <li><a href="${P}ind-oil-gas.html">Oil &amp; Gas</a></li>
          <li><a href="${P}industries.html">All industries</a></li>
        </ul>
      </div>
      <div class="foot__col">
        <h5>Company</h5>
        <ul>
          <li><a href="${P}loc-dubai.html">Offices</a></li>
          <li><a href="${P}careers.html">Careers</a></li>
          <li><a href="${P}press.html">Press</a></li>
          <li><a href="${P}support.html">Support</a></li>
          <li><a href="${P}accessibility.html">Accessibility</a></li>
        </ul>
      </div>
      <div class="foot__col">
        <h5>Connect</h5>
        <ul>
          <li><a href="${P}request-demo.html">Talk to sales</a></li>
          <li><a href="${P}request-demo.html">Request a demo</a></li>
          <li><a data-innv-book hidden>Book a call</a></li>
          <li><a href="${P}resources.html#case-studies">Customers</a></li>
          <li><a href="mailto:info@innovent.io">info@innovent.io</a></li>
          <li><a href="${P}login.html">Customer login</a></li>
        </ul>
      </div>
    </div>
    <div class="foot__bot">
      <span>© 2026 Innovent, Inc. All rights reserved.</span>
      <div class="foot__bot-right">
        <a href="${P}privacy.html">Privacy</a><a href="${P}terms.html">Terms</a><a href="${P}trust.html">Security</a><a href="${P}accessibility.html">Accessibility</a><button type="button" class="foot__linkbtn" data-cookie-prefs>Cookie preferences</button>
      </div>
    </div>
  </div>
</footer>`;

  /* consent banner — one script, loaded once, for every sub-page */
  if (!document.querySelector('script[data-innv-consent]')) {
    var cs = document.createElement('script');
    cs.src = R + 'consent.js?v=20260921h';
    cs.defer = true;
    cs.setAttribute('data-innv-consent', '');
    document.head.appendChild(cs);
  }

  /* booking + chat agent — same one-script-once rule as the consent banner.
     Inert until widgets.js is given a Calendly URL or a Chatbase ID. */
  if (!document.querySelector('script[data-innv-widgets]')) {
    var ws = document.createElement('script');
    ws.src = R + 'widgets.js?v=20260921h';
    ws.defer = true;
    ws.setAttribute('data-innv-widgets', '');
    document.head.appendChild(ws);
  }

  const navMount = document.getElementById('site-nav');
  const footMount = document.getElementById('site-footer');
  if (navMount) navMount.innerHTML = nav;
  if (footMount) footMount.innerHTML = footer;
})();
