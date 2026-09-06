// Shared nav + footer for Innovent sub-pages
(function () {
  const cur = (document.body.dataset.page || '').toLowerCase();
  const isActive = (k) => cur === k ? ' is-active' : '';
  const isNew = (k) => k ? ' is-new' : '';

  const nav = `
<header class="nav">
  <div class="nav__inner">
    <a class="nav__brand" href="../index.html">
      <img src="../assets/innovent/logo-nov-cropped.webp" alt="Innovent" style="height:50px;width:auto;object-fit:contain">
    </a>
    <nav class="nav__links">
      <a class="nav__link${isActive('platform')}" href="platform.html">Innfini Platform</a>
      <a class="nav__link${isActive('cc')}" href="command-control.html">Command &amp; Control</a>
      <a class="nav__link${isActive('smart-city')}" href="smart-city.html">Smart Cities</a>
      <a class="nav__link${isActive('industries')}" href="industries.html">Industries</a>
      <a class="nav__link${isActive('resources')}" href="resources.html">Resources</a>
      <a class="nav__link${isActive('careers')}" href="careers.html">Careers</a>
    </nav>
    <div class="nav__right">
      <a class="btn btn--secondary btn--sm" href="login.html">Sign in</a>
      <a class="btn btn--primary btn--sm" href="request-demo.html">Request demo</a>
    </div>
  </div>
</header>`;

  const footer = `
<footer class="foot">
  <div class="container">
    <div class="foot__grid">
      <div class="foot__brand">
        <a class="nav__brand" href="../index.html" style="margin-bottom:14px;display:inline-flex">
          <img src="../assets/innovent/logo-nov-cropped.webp" alt="Innovent" style="height:53px;width:auto;object-fit:contain">
        </a>
        <p>The world's first AI-native operating platform for physical infrastructure. Headquartered in Los Angeles, deployed across five continents.</p>
      </div>
      <div class="foot__col">
        <h5>Platform</h5>
        <ul>
          <li><a href="platform.html">Innfini Architecture</a></li>
          <li><a href="product.html">Product Tour</a></li>
          <li><a href="command-control.html">Command &amp; Control</a></li>
          <li><a href="smart-city.html">Smart Cities</a></li>
          <li><a href="industries.html">Industries</a></li>
        </ul>
      </div>
      <div class="foot__col">
        <h5>Resources</h5>
        <ul>
          <li><a href="resources.html#blog">Blog</a></li>
          <li><a href="resources.html#case-studies">Case Studies</a></li>
          <li><a href="resources.html#whitepapers">White Papers</a></li>
          <li><a href="press.html">Press &amp; News</a></li>
          <li><a href="resources.html#events">Events &amp; Webinars</a></li>
        </ul>
      </div>
      <div class="foot__col">
        <h5>Company</h5>
        <ul>
          <li><a href="../index.html#about">About</a></li>
          <li><a href="careers.html">Careers</a></li>
          <li><a href="../index.html#contact">Contact</a></li>
          <li><a href="support.html">Support</a></li>
          <li><a href="trust.html">Trust &amp; Security</a></li>
        </ul>
      </div>
      <div class="foot__col">
        <h5>Connect</h5>
        <ul>
          <li><a href="login.html">Customer Login</a></li>
          <li><a href="login.html">Partner Login</a></li>
          <li><a href="../index.html#contact">Talk to sales</a></li>
          <li><a href="request-demo.html">Request a demo</a></li>
        </ul>
      </div>
    </div>
    <div class="foot__bot">
      <span>© 2025 Innovent Inc. All rights reserved.</span>
      <div class="foot__bot-right">
        <a href="trust.html">Privacy</a><a href="trust.html">Terms</a><a href="trust.html">Security</a><a href="trust.html">SOC 2</a>
      </div>
    </div>
  </div>
</footer>`;

  const navMount = document.getElementById('site-nav');
  const footMount = document.getElementById('site-footer');
  if (navMount) navMount.innerHTML = nav;
  if (footMount) footMount.innerHTML = footer;
})();
