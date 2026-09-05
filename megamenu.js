// Innovent — IBM-style mega menu controller
(function () {
  const MENUS = {
    platform: {
      title: 'The Innfini Platform',
      href: 'pages/platform.html',
      categories: [
        { id: 'architecture', label: 'Architecture', href: 'pages/platform-architecture.html',
          items: [
            { t: 'Agentic AI runtime', d: 'Goal-driven agents that reason, act, and explain — under policy.', h: 'pages/cap-agentic-ai.html' },
            { t: 'Decision engine & ML', d: 'Vision, forecasting, optimization, grounded LLMs in one runtime.', h: 'pages/cap-decision-engine.html' },
            { t: 'Object & event graph', d: 'Every asset, place, person, and signal as a typed node.', h: 'pages/cap-object-graph.html' },
            { t: 'Sensor fabric', d: 'RFID, vision, BLE, environmental — hardware-agnostic, edge-deployed.', h: 'pages/cap-sensor-fabric.html' },
            { t: 'Connectors & integrations', d: '80+ pre-built connectors for ERP, WMS, MES, SCADA, identity.', h: 'pages/cap-connectors.html' },
            { t: 'Edge runtime', d: 'Sub-100ms inference on commodity gateways — x86 and ARM.', h: 'pages/cap-edge.html' },
          ]},
        { id: 'capabilities', label: 'Capabilities',
          items: [
            { t: 'Agentic orchestration', d: 'Plan, decide, act, explain — under guardrails and approvals.', h: 'pages/pc-agentic-orchestration.html' },
            { t: 'Computer vision', d: 'Production-grade object, OCR, anomaly, and safety detection.', h: 'pages/pc-computer-vision.html' },
            { t: 'Predictive analytics', d: 'Forecasting and optimization, retrained weekly against ground truth.', h: 'pages/pc-predictive.html' },
            { t: 'Conversational ops', d: 'Ask anything in plain English. Get grounded answers with citations.', h: 'pages/pc-conversational.html' },
          ]},
        { id: 'deployment', label: 'Deployment',
          items: [
            { t: 'Innfini Cloud', d: 'Managed SaaS — US, EU, MENA, APAC regions.', h: 'pages/pd-cloud.html' },
            { t: 'Private cloud', d: 'Single-tenant in your VPC with customer-managed keys.', h: 'pages/pd-private-cloud.html' },
            { t: 'On-premises', d: 'Air-gapped Kubernetes + edge gateways.', h: 'pages/pd-on-prem.html' },
            { t: 'Hybrid edge', d: 'Per-site edge runtime, cloud control plane — operates degraded.', h: 'pages/pd-hybrid-edge.html' },
          ]},
        { id: 'product', label: 'Product tour', href: 'pages/product.html',
          items: [
            { t: 'Operations Home', d: 'The default canvas — live KPIs, exceptions, and recommendations.', h: 'pages/pt-operations-home.html' },
            { t: 'Asset Dashboard', d: 'Registry, maintenance, preventive PM, track &amp; trace — one record.', h: 'pages/pt-asset-dashboard.html' },
            { t: 'Geospatial Reports', d: '2D + 3D maps — pin clusters, heatmaps, zones, indoor floor plans.', h: 'pages/pt-geospatial-reports.html' },
            { t: 'Workflow Builder', d: 'Drag-and-drop automation — test runs, versioning, governance.', h: 'pages/pt-workflow-builder.html' },
          ]},
      ],
    },
    cc: {
      title: 'Command & Control',
      href: 'pages/command-control.html',
      categories: [
        { id: 'overview', label: 'Overview',
          items: [
            { t: 'Situational awareness', d: 'Every sensor, camera, and system on one geo-temporal canvas.', h: 'pages/cc-situational-awareness.html' },
            { t: 'Agentic dispatch', d: 'AI proposes, operators approve — every decision auditable.', h: 'pages/cc-agentic-dispatch.html' },
            { t: 'Audited & sovereign', d: 'CJIS, FedRAMP-Mod, NIST 800-53 controls. Air-gap deployable.', h: 'pages/command-control.html#capabilities' },
          ]},
        { id: 'environments', label: 'Use environments',
          items: [
            { t: 'Public safety & 911', d: 'CAD integration, RMS bridging, multi-agency dispatch.', h: 'pages/cc-public-safety.html' },
            { t: 'Defense & intelligence', d: 'JADC2-aligned coalition workflows, ISR fusion.', h: 'pages/cc-defense.html' },
            { t: 'Critical infrastructure', d: 'Energy, water, pipelines — SCADA fusion and runbooks.', h: 'pages/cc-critical-infra.html' },
            { t: 'Ports & logistics centers', d: 'Container terminals, distribution centers, airports.', h: 'pages/cc-ports.html' },
            { t: 'Smart-city ops centers', d: 'Traffic, transit, EOC. See the Smart Cities solution.', h: 'pages/smart-city.html' },
            { t: 'Stadium & venue ops', d: 'Crowd flow, weapon detection, asset tracking, security.', h: 'pages/cc-venues.html' },
          ]},
      ],
    },
    'smart-city': {
      title: 'Smart Cities & Communities',
      href: 'pages/smart-city.html',
      categories: [
        { id: 'pillars', label: 'Civic surfaces',
          items: [
            { t: 'Smart Mobility', d: 'Traffic optimization, transit, EV charging, AV infrastructure.', h: 'pages/sc-mobility.html' },
            { t: 'Energy & Utilities', d: 'Grid balancing, demand response, water-loss detection.', h: 'pages/sc-energy.html' },
            { t: 'Public Safety', d: 'Multi-agency dispatch, predictive resourcing, sensor fusion.', h: 'pages/sc-public-safety.html' },
            { t: 'Community Services', d: 'Permits, licensing, 311, benefits navigation — in 12 languages.', h: 'pages/sc-community.html' },
            { t: 'Environment & Sustainability', d: 'Air quality mesh, urban heat, climate adaptation.', h: 'pages/sc-environment.html' },
            { t: 'Civic Operations', d: 'Asset digital twins, predictive maintenance, vendor SLAs.', h: 'pages/sc-civic-ops.html' },
          ]},
      ],
    },
    industries: {
      title: 'Industries',
      href: 'pages/industries.html',
      categories: [
        { id: 'defense', label: 'Defense & Security',
          items: [
            { t: 'Critical Asset Tracking', d: 'Weapons, gear, sensitive equipment — issue, transfer, return audit.', h: 'pages/ind-asset-tracking.html' },
            { t: 'Civil Defense', d: 'EOC, multi-agency response, evacuation, mass notification.', h: 'pages/ind-civil-defense.html' },
          ]},
        { id: 'industrial', label: 'Industrial',
          items: [
            { t: 'Manufacturing', d: 'OEE, predictive maintenance, quality vision, WIP tracking.', h: 'pages/ind-manufacturing.html' },
            { t: 'Oil & Gas', d: 'Predictive maintenance, lone-worker safety, production lift.', h: 'pages/ind-oil-gas.html' },
            { t: 'Energy & Utilities', d: 'Grid balancing, asset health, DER orchestration — NERC-CIP.', h: 'pages/ind-energy.html' },
          ]},
        { id: 'logistics', label: 'Logistics & retail',
          items: [
            { t: 'Ports & Maritime', d: 'Container yard ops, terminal automation, customs intel.', h: 'pages/ind-ports.html' },
            { t: 'Logistics & Supply Chain', d: 'End-to-end visibility, dwell-time AI, exception management.', h: 'pages/ind-logistics.html' },
            { t: 'Retail', d: 'Item-level RFID, loss prevention, omnichannel ops.', h: 'pages/ind-retail.html' },
          ]},
        { id: 'health', label: 'Health & life sciences',
          items: [
            { t: 'Healthcare', d: 'Equipment tracking, patient flow, sterilization workflow.', h: 'pages/ind-healthcare.html' },
            { t: 'Life Sciences', d: 'GxP-compliant tracking, 21 CFR Part 11, lab operations.', h: 'pages/ind-life-sciences.html' },
          ]},
      ],
    },
    resources: {
      title: 'Resources & Knowledge',
      href: 'pages/resources.html',
      categories: [
        { id: 'editorial', label: 'Editorial',
          items: [
            { t: 'Field Notes blog', d: 'Posts from our engineering and solutions teams.', h: 'pages/resources.html#blog' },
            { t: 'Case Studies', d: 'Real customer deployments at national scale.', h: 'pages/resources.html#case-studies' },
            { t: 'White Papers', d: 'Architecture, policy, security, and AI-maturity papers.', h: 'pages/resources.html#whitepapers' },
            { t: 'Events & Webinars', d: 'Upcoming sessions, field days, and conference appearances.', h: 'pages/resources.html#events' },
          ]},
        { id: 'technical', label: 'Technical library',
          items: [
            { t: 'Knowledge Base', d: '1,840 articles across architecture, connectors, edge, policy.', h: 'pages/resources.html#kb' },
            { t: 'API reference', d: '412 endpoints — REST, GraphQL, streaming.', h: 'pages/resources.html#kb' },
            { t: 'Release notes', d: '156 releases back to v1.0 — searchable and tagged.', h: 'pages/resources.html#kb' },
            { t: 'Architecture reference', d: 'The complete 32-page Innfini Architecture white paper.', h: 'pages/wp-architecture.html' },
          ]},
        { id: 'community', label: 'Community',
          items: [
            { t: 'Developer forum', d: 'Engineers, customers, partners — searchable patterns.', h: 'pages/support.html' },
            { t: 'Office hours', d: 'Weekly 90-min sessions with our solutions team.', h: 'pages/support.html' },
            { t: 'Monthly digest', d: 'One email a month. New stories, papers, and invitations.', h: 'pages/resources.html' },
          ]},
      ],
    },
    careers: {
      title: 'Careers at Innovent',
      href: 'pages/careers.html',
      categories: [
        { id: 'teams', label: 'Teams',
          items: [
            { t: 'Engineering · 12 open', d: 'Agentic runtime, edge, ML, security, frontend, SRE.', h: 'pages/team-engineering.html' },
            { t: 'Solutions · 4 open', d: 'Forward-deployed engineers and customer architects.', h: 'pages/team-solutions.html' },
            { t: 'Product · 2 open', d: 'PM and design across Command & Control, operator surfaces.', h: 'pages/team-product.html' },
            { t: 'Sales · 3 open', d: 'Public sector, APAC enterprise, MENA channel.', h: 'pages/team-sales.html' },
            { t: 'Operations · 1 open', d: 'People partner for APAC + MENA.', h: 'pages/team-operations.html' },
            { t: 'General application', d: 'Don\'t see your role? Tell us what you\'re great at.', h: 'pages/careers.html' },
          ]},
        { id: 'locations', label: 'Locations',
          items: [
            { t: 'Los Angeles · HQ', d: 'Engineering, product, executive, public-sector solutions.', h: 'pages/loc-los-angeles.html' },
            { t: 'La Paz', d: 'Product design and Latin-American customer success.', h: 'pages/loc-la-paz.html' },
            { t: 'Dubai', d: 'MENA delivery, solutions architecture, partnerships.', h: 'pages/loc-dubai.html' },
            { t: 'Lahore', d: 'Core engineering and edge-runtime development.', h: 'pages/loc-lahore.html' },
            { t: 'Toronto', d: 'ML engineering, integrations, retail customer success.', h: 'pages/loc-toronto.html' },
            { t: 'Sydney', d: 'APAC delivery and enterprise account engineering.', h: 'pages/loc-sydney.html' },
          ]},
        { id: 'culture', label: 'How we work',
          items: [
            { t: 'Small teams · real ownership', d: 'Three-to-six person squads own a surface end-to-end.', h: 'pages/careers.html' },
            { t: 'Operators in the room', d: '30% of solutions team are former public-safety operators.', h: 'pages/careers.html' },
            { t: 'Compensation built right', d: 'Competitive base + meaningful equity. Bands published.', h: 'pages/careers.html' },
            { t: 'Built for the long arc', d: '4 weeks vacation, sabbatical at year five.', h: 'pages/careers.html' },
          ]},
      ],
    },
    support: {
      title: 'Technical Support',
      href: 'pages/support.html',
      categories: [
        { id: 'channels', label: 'Get help',
          items: [
            { t: 'Production incident (P1/P2)', d: '24/7 follow-the-sun rotation. <15min response SLA.', h: 'pages/support.html' },
            { t: 'Standard ticket', d: 'Configuration, integrations, how-to. 4h SLA.', h: 'pages/login.html' },
            { t: 'Live chat', d: 'Triage with an engineer — embedded in the platform.', h: 'pages/login.html' },
            { t: 'Phone (production)', d: '+1 (424) 555-INFI · routes to your account engineer.', h: 'pages/support.html' },
            { t: 'Office hours', d: 'Weekly architecture and optimization sessions.', h: 'pages/support.html' },
            { t: 'Community forum', d: 'Patterns, snippets, and answers from the community.', h: 'pages/support.html' },
          ]},
        { id: 'status', label: 'Status & plans',
          items: [
            { t: 'Live system status', d: 'Real-time uptime across US-East, US-West, EU, APAC.', h: 'pages/support.html#status' },
            { t: 'Support tiers', d: 'Standard, Premier, Mission-Critical — coverage comparison.', h: 'pages/support.html' },
            { t: 'Incident history', d: '90 days of post-mortems and resolution timelines.', h: 'pages/support.html' },
            { t: 'Subscribe to alerts', d: 'Per-region or per-component status notifications.', h: 'pages/support.html' },
          ]},
        { id: 'selfserve', label: 'Self-serve',
          items: [
            { t: 'Knowledge Base', d: '1,840 articles and 412 API endpoints, indexed and searchable.', h: 'pages/resources.html#kb' },
            { t: 'Engineering blog', d: 'Deep how-and-why from our solutions teams.', h: 'pages/resources.html#blog' },
            { t: 'Onboarding guide', d: 'Standard 8-week implementation playbook.', h: 'pages/resources.html#whitepapers' },
          ]},
        { id: 'portal', label: 'Customer portal',
          items: [
            { t: 'Sign in (Customer)', d: 'Tickets, account, billing, environment dashboards.', h: 'pages/login.html' },
            { t: 'Sign in (Partner)', d: 'Deal reg, joint customers, certification, co-marketing.', h: 'pages/login.html' },
            { t: 'Request access', d: 'New customer? Contact your account engineer to provision.', h: 'pages/login.html' },
          ]},
      ],
    },
  };

  function buildMega(key, def) {
    const panel = document.createElement('div');
    panel.className = 'mega';
    panel.dataset.menu = key;

    let catsHtml = '';
    let panelsHtml = '';
    def.categories.forEach((cat, idx) => {
      const active = idx === 0 ? ' is-active' : '';
      catsHtml += `<a class="mega__cat${active}" data-cat="${cat.id}" href="#">${cat.label}</a>`;
      const itemsHtml = cat.items.map(it => `
        <a class="mega__item" href="${it.h}">
          <h5>${it.t}</h5>
          <p>${it.d}</p>
        </a>`).join('');
      panelsHtml += `
        <div class="mega__panel${active}" data-panel="${cat.id}">
          <a class="mega__heading" href="${cat.href || def.href}">${cat.label} <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg></a>
          <div class="mega__grid">${itemsHtml}</div>
        </div>`;
    });

    panel.innerHTML = `
      <div class="mega__inner">
        <aside class="mega__sidebar">
          <div class="mega__sidebar-label">${def.title}</div>
          <nav class="mega__cats">${catsHtml}</nav>
          <a class="mega__explore" href="${def.href}">
            <span>Explore ${def.title}</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>
          </a>
        </aside>
        <section class="mega__body">${panelsHtml}</section>
      </div>`;
    return panel;
  }

  function init() {
    const navInner = document.querySelector('.nav__inner');
    if (!navInner) return;
    const links = navInner.querySelector('.nav__links');
    if (!links) return;

    // init() is called more than once on purpose — the nav may be injected by
    // _chrome.js after this script runs — so it has to be idempotent. Without
    // this guard the second pass wraps every link a second time and builds a
    // duplicate set of panels.
    if (links.dataset.megaReady) return;
    links.dataset.megaReady = '1';

    // Map existing links to menu keys by page slug.
    // Hrefs vary by context — the homepage uses "pages/platform.html", the
    // sub-pages use "platform.html", and Netlify's pretty-URL post-processing
    // rewrites both to "/pages/platform". Matching on whole hrefs missed every
    // one of those variants and left the nav with no dropdowns, so normalise to
    // the slug instead: drop any query or hash, take the last path segment, and
    // strip a trailing .html.
    const slugMap = {
      'platform': 'platform',
      'command-control': 'cc',
      'smart-city': 'smart-city',
      'industries': 'industries',
      'resources': 'resources',
      'careers': 'careers',
      'support': 'support',
    };

    function keyForHref(href) {
      if (!href) return null;
      const path = href.split('#')[0].split('?')[0].replace(/\/+$/, '');
      const slug = path.split('/').pop().replace(/\.html$/i, '');
      return slugMap[slug] || null;
    }

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'mega-backdrop';
    document.body.appendChild(backdrop);

    // Container for mega panels
    const megaContainer = document.createElement('div');
    document.body.appendChild(megaContainer);

    const items = [];
    Array.from(links.querySelectorAll('a.nav__link')).forEach(a => {
      const href = a.getAttribute('href') || '';
      const key = keyForHref(href);
      if (!key || !MENUS[key]) return;

      // Wrap in nav__item
      const wrap = document.createElement('div');
      wrap.className = 'nav__item';
      wrap.dataset.menu = key;
      a.parentNode.insertBefore(wrap, a);
      wrap.appendChild(a);

      // Add chevron
      if (!a.querySelector('.chev')) {
        const chev = document.createElement('span');
        chev.innerHTML = '<svg class="chev" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5"/></svg>';
        a.appendChild(chev.firstChild);
      }

      const panel = buildMega(key, MENUS[key]);
      megaContainer.appendChild(panel);

      items.push({ wrap, panel, key });
    });

    // Full-width sheet — no per-trigger positioning needed.
    let openKey = null;
    let closeTimer = null;
    let switchTimer = null;

    function open(key, triggerEl) {
      clearTimeout(closeTimer);
      clearTimeout(switchTimer);
      if (openKey === key) return;

      const next = items.find(i => i.key === key);
      const prev = items.find(i => i.key === openKey);
      if (!next) return;

      next.wrap.classList.add('is-open');
      next.panel.classList.add('is-open');

      if (prev && prev !== next) {
        prev.wrap.classList.remove('is-open');
        prev.panel.classList.add('is-leaving');
        switchTimer = setTimeout(() => {
          prev.panel.classList.remove('is-open');
          prev.panel.classList.remove('is-leaving');
        }, 200);
      }

      backdrop.classList.add('is-open');
      openKey = key;
    }
    function close() {
      closeTimer = setTimeout(() => {
        items.forEach(({ wrap, panel }) => {
          wrap.classList.remove('is-open');
          panel.classList.remove('is-open');
          panel.classList.remove('is-leaving');
        });
        backdrop.classList.remove('is-open');
        openKey = null;
      }, 140);
    }
    function cancelClose() { clearTimeout(closeTimer); }

    items.forEach(({ wrap, panel, key }) => {
      wrap.addEventListener('mouseenter', () => open(key, wrap));
      wrap.addEventListener('mouseleave', close);
      wrap.addEventListener('click', (e) => {
        e.preventDefault();
        open(key, wrap);
      });
      panel.addEventListener('mouseenter', cancelClose);
      panel.addEventListener('mouseleave', close);

      // Category hover
      panel.querySelectorAll('.mega__cat').forEach(cat => {
        cat.addEventListener('mouseenter', () => {
          panel.querySelectorAll('.mega__cat').forEach(c => c.classList.remove('is-active'));
          panel.querySelectorAll('.mega__panel').forEach(p => p.classList.remove('is-active'));
          cat.classList.add('is-active');
          const target = panel.querySelector(`.mega__panel[data-panel="${cat.dataset.cat}"]`);
          if (target) target.classList.add('is-active');
        });
        cat.addEventListener('click', e => e.preventDefault());
      });
    });

    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // For sub-pages where _chrome.js renders the nav after this script, wait one tick
    setTimeout(init, 0);
  }

  // Re-init if the chrome script injects the nav after our first attempt
  setTimeout(init, 50);
})();
