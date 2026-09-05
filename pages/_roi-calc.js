// Single-industry ROI calculator — auto-mounts on any [data-roi-calc][data-industry] element.
(function () {
  const COLORS = ['#3B82F6', '#FBBF24', '#A78BFA', '#4ADE80', '#F472B6', '#06B6D4'];

  const INDUSTRIES = {
    retail: {
      label: 'Your retail operation',
      methodologyLabel: 'Retail · benefit drivers',
      methodology: [
        '<b>Labor savings · cycle counts.</b> Manual = 0.3 items/person-hr · RFID = 3 items/hr (10× lift).<i>Source: RFID Journal Retail Calculator</i>',
        '<b>Shrinkage reduction.</b> ~1.5% revenue → ~0.8% with item-level visibility (≈45% cut).<i>Source: NRF / Auburn RFID Lab</i>',
        '<b>AUR uplift.</b> ~3% lift from better size/style availability.<i>Source: Auburn RFID Lab (2023)</i>',
        '<b>Incremental sales.</b> +1% revenue from in-stock improvement.<i>Source: Innovent customer outcomes</i>',
      ],
      inputs: [
        { key: 'stores', label: 'Number of stores', min:1, max:500, default:25, step:1, fmt:v=>v+(v===1?' store':' stores') },
        { key: 'revenue', label: 'Annual revenue / store', min:1, max:50, default:6, step:0.5, fmt:v=>'$'+v.toFixed(1)+'M / store / yr' },
        { key: 'items',  label: 'Items / store (avg inventory)', min:1, max:100, default:10, step:1, fmt:v=>(v*1000).toLocaleString()+' items' },
        { key: 'tagcost', label: 'Cost per RFID tag', min:0.03, max:0.20, default:0.07, step:0.01, fmt:v=>'$'+v.toFixed(2) },
      ],
      compute(i){
        const rev = i.revenue*1e6, items = i.items*1000, labor=32;
        const totalLabor = 80*12*labor*0.8 + ((items/0.3)-(items/3))*6*labor + 60*12*labor*0.5;
        const shrink = rev*0.007, aur = rev*0.03*0.52, inc = rev*0.01*0.52;
        return {
          drivers: [
            { name:'Labor savings', color:COLORS[0], value:totalLabor },
            { name:'Shrinkage reduction', color:COLORS[1], value:shrink },
            { name:'AUR uplift (margin)', color:COLORS[2], value:aur },
            { name:'Incremental sales', color:COLORS[3], value:inc },
          ],
          investment: 24000,
          recurring: items*4.5*i.tagcost + 6500,
        };
      },
    },

    manufacturing: {
      label: 'Your manufacturing operation',
      methodologyLabel: 'Manufacturing · benefit drivers',
      methodology: [
        '<b>OEE uplift.</b> Connected-factory deployments show 15–25% OEE gain.<i>Source: McKinsey "Industry 4.0" (2024)</i>',
        '<b>Predictive maintenance.</b> Unplanned downtime −30 to −50%.<i>Source: Deloitte "Smart Factory"</i>',
        '<b>Quality / scrap.</b> Vision-AI inspection reduces defect rate −30 to −50%.<i>Source: BCG manufacturing AI</i>',
        '<b>Energy.</b> Connected monitoring → 8–15% energy savings.<i>Source: WEF / EnergyStar</i>',
      ],
      inputs: [
        { key:'plants', label:'Number of plants', min:1, max:50, default:4, step:1, fmt:v=>v+(v===1?' plant':' plants') },
        { key:'output', label:'Annual production value / plant', min:10, max:2000, default:250, step:10, fmt:v=>'$'+v+'M / plant / yr' },
        { key:'downtime', label:'Unplanned downtime', min:1, max:20, default:8, step:0.5, fmt:v=>v.toFixed(1)+'% / yr' },
        { key:'scrap', label:'Scrap & rework cost', min:0.5, max:10, default:3, step:0.1, fmt:v=>v.toFixed(1)+'% of output' },
      ],
      compute(i){
        const out = i.output*1e6;
        return {
          drivers:[
            { name:'OEE / throughput', color:COLORS[0], value:out*0.18*0.20 },
            { name:'Downtime recovery', color:COLORS[1], value:out*(i.downtime/100)*0.35 },
            { name:'Scrap / quality', color:COLORS[2], value:out*(i.scrap/100)*0.40 },
            { name:'Energy optimization', color:COLORS[3], value:out*0.06*0.10 },
            { name:'WIP cycle time', color:COLORS[4], value:out*0.025 },
          ],
          investment: 380000,
          recurring: 65000,
        };
      },
    },

    logistics: {
      label: 'Your logistics operation',
      methodologyLabel: 'Logistics · benefit drivers',
      methodology: [
        '<b>Yard dwell-time.</b> Real-time visibility cuts dwell 30–45%.<i>Source: ARC Advisory, Gartner SCM</i>',
        '<b>Loss & damage.</b> Item-level tracking reduces freight loss 20–40%.<i>Source: NRF / RILA</i>',
        '<b>Yard labor automation.</b> 20–30% labor reduction.<i>Source: Innovent (AD Ports)</i>',
        '<b>SLA miss reduction.</b> Predictive dwell-time AI flags risk 2hrs before breach.',
      ],
      inputs: [
        { key:'sites', label:'Warehouses / yards', min:1, max:100, default:8, step:1, fmt:v=>v+' sites' },
        { key:'freight', label:'Annual freight value / site', min:10, max:2000, default:180, step:10, fmt:v=>'$'+v+'M / site / yr' },
        { key:'vehicles', label:'Vehicles & yard equipment', min:10, max:5000, default:250, step:10, fmt:v=>v.toLocaleString()+' units' },
        { key:'loss', label:'Current freight loss', min:0.5, max:6, default:2, step:0.1, fmt:v=>v.toFixed(1)+'% / yr' },
      ],
      compute(i){
        const f = i.freight*1e6;
        return {
          drivers:[
            { name:'Dwell-time AI', color:COLORS[0], value:f*0.018 },
            { name:'Loss & damage prev.', color:COLORS[1], value:f*(i.loss/100)*0.30 },
            { name:'Yard labor savings', color:COLORS[2], value:i.vehicles*1800 },
            { name:'Cold-chain spoilage', color:COLORS[3], value:f*0.012 },
            { name:'SLA-miss recovery', color:COLORS[4], value:f*0.008 },
          ],
          investment: 220000,
          recurring: 48000,
        };
      },
    },

    healthcare: {
      label: 'Your healthcare operation',
      methodologyLabel: 'Healthcare · benefit drivers',
      methodology: [
        '<b>Equipment utilization.</b> Lifts from typical 42% to 55%+.<i>Source: HIMSS / GS1 Healthcare</i>',
        '<b>Lost-equipment replacement.</b> RTLS recovers 80–90% of replacement spend.<i>Source: Becker\'s Healthcare</i>',
        '<b>Nurse productivity.</b> ~20 min/shift reclaimed.<i>Source: Vocera / Stryker studies</i>',
        '<b>Sterilization compliance.</b> Tray-level tracking cuts misroutes 60–80%.',
      ],
      inputs: [
        { key:'facilities', label:'Hospitals or sites', min:1, max:50, default:3, step:1, fmt:v=>v+(v===1?' facility':' facilities') },
        { key:'beds', label:'Beds per facility', min:50, max:1500, default:350, step:10, fmt:v=>v.toLocaleString()+' beds' },
        { key:'opex', label:'Operating budget / facility', min:20, max:2000, default:320, step:10, fmt:v=>'$'+v+'M / facility / yr' },
        { key:'assets', label:'Mobile assets to track', min:200, max:20000, default:2500, step:50, fmt:v=>v.toLocaleString()+' units' },
      ],
      compute(i){
        const op = i.opex*1e6;
        return {
          drivers:[
            { name:'Equipment utilization', color:COLORS[0], value:i.assets*4200 },
            { name:'Lost-asset recovery', color:COLORS[1], value:i.assets*250 },
            { name:'Clinical productivity', color:COLORS[2], value:i.beds*1800 },
            { name:'Sterilization compliance', color:COLORS[3], value:op*0.006 },
            { name:'Patient throughput', color:COLORS[4], value:op*0.012 },
          ],
          investment: 280000,
          recurring: 42000,
        };
      },
    },

    oilgas: {
      label: 'Your oil & gas operation',
      methodologyLabel: 'Oil & Gas · benefit drivers',
      methodology: [
        '<b>Predictive maintenance.</b> Unplanned downtime −30 to −50%.<i>Source: GE Digital / Bain Energy</i>',
        '<b>Lone-worker safety.</b> Recordable incidents −30 to −50%.<i>Source: HSE-UK / ANSI Z10</i>',
        '<b>Field asset tracking.</b> Lost-asset spend −60 to −90%.',
        '<b>Production optimization.</b> +2–5% throughput from sensor-fused tuning.',
      ],
      inputs: [
        { key:'sites', label:'Field sites / facilities', min:1, max:100, default:6, step:1, fmt:v=>v+(v===1?' site':' sites') },
        { key:'opex', label:'Operating cost / site', min:10, max:2000, default:220, step:10, fmt:v=>'$'+v+'M / site / yr' },
        { key:'workers', label:'Field workers / site', min:10, max:2000, default:180, step:10, fmt:v=>v.toLocaleString()+' workers' },
        { key:'downtime', label:'Unplanned downtime cost', min:1, max:50, default:12, step:0.5, fmt:v=>'$'+v.toFixed(1)+'M / site / yr' },
      ],
      compute(i){
        const op = i.opex*1e6;
        return {
          drivers:[
            { name:'Predictive maintenance', color:COLORS[0], value:i.downtime*1e6*0.40 },
            { name:'Lone-worker safety', color:COLORS[1], value:i.workers*4500 },
            { name:'Field asset tracking', color:COLORS[2], value:op*0.008 },
            { name:'Production optimization', color:COLORS[3], value:op*0.025 },
            { name:'Compliance & audit', color:COLORS[4], value:op*0.004 },
          ],
          investment: 340000,
          recurring: 58000,
        };
      },
    },

    cc: {
      label: 'Your command & control operation',
      methodologyLabel: 'Command & Control · benefit drivers',
      methodology: [
        '<b>Operator span of control.</b> 1 operator covers what 3 did pre-deployment.<i>Source: Innovent (ADCD)</i>',
        '<b>Time to correlate incident.</b> 14 min → under 5 min average.<i>Source: deployed customers</i>',
        '<b>Manual reconciliation.</b> Asset / chain-of-custody work −92%.<i>Source: Dubai Police</i>',
        '<b>System unification.</b> Retiring 20+ disparate apps eliminates licensing overhead.',
      ],
      inputs: [
        { key:'centers', label:'Operations centers', min:1, max:100, default:4, step:1, fmt:v=>v+(v===1?' center':' centers') },
        { key:'operators', label:'Operators per center', min:5, max:500, default:35, step:1, fmt:v=>v+' operators' },
        { key:'budget', label:'Operating budget / center', min:5, max:500, default:45, step:1, fmt:v=>'$'+v+'M / center / yr' },
        { key:'systems', label:'Existing systems to integrate', min:5, max:100, default:18, step:1, fmt:v=>v+' systems' },
      ],
      compute(i){
        const b = i.budget*1e6;
        return {
          drivers:[
            { name:'Operator capacity', color:COLORS[0], value:i.operators*95000*0.35 },
            { name:'System consolidation', color:COLORS[1], value:i.systems*38000 },
            { name:'Incident response', color:COLORS[2], value:b*0.04 },
            { name:'Audit & reconciliation', color:COLORS[3], value:b*0.015 },
            { name:'Decision quality', color:COLORS[4], value:b*0.020 },
          ],
          investment: 520000,
          recurring: 95000,
        };
      },
    },

    // ── NEW industry configs ─────────────────────────────────
    ports: {
      label: 'Your port / terminal operation',
      methodologyLabel: 'Ports & Maritime · benefit drivers',
      methodology: [
        '<b>Container dwell-time.</b> Real-time RFID + ANPR fusion cuts dwell 25–40%.<i>Source: ARC Advisory · port automation</i>',
        '<b>Gate throughput.</b> Auto-appointment + ANPR doubles trucks/hour at the gate.<i>Source: Innovent (AD Ports)</i>',
        '<b>Crane utilization.</b> Predictive maintenance + assignment AI lifts gantry crane uptime 8–14%.<i>Source: Innovent customer outcomes</i>',
        '<b>Container loss / misroute.</b> Item-level tracking reduces misrouted boxes 70–90%.',
        '<b>Customs / exception handling.</b> Automated reconciliation cuts manual exception work 60–80%.',
      ],
      inputs: [
        { key:'berths', label:'Active berths', min:1, max:40, default:6, step:1, fmt:v=>v+(v===1?' berth':' berths') },
        { key:'teu', label:'Annual TEU throughput / berth', min:50, max:2000, default:600, step:25, fmt:v=>(v*1000).toLocaleString()+' TEU / yr' },
        { key:'cranes', label:'Gantry & yard cranes', min:2, max:200, default:24, step:1, fmt:v=>v+' cranes' },
        { key:'dwell', label:'Avg container dwell', min:1, max:14, default:5, step:0.5, fmt:v=>v.toFixed(1)+' days' },
      ],
      compute(i){
        const teu = i.teu*1000;
        // Revenue per TEU ~$220 dwell + handling fee envelope
        const dwellSavings = teu * 22 * (i.dwell/5);          // dwell-time freed revenue/savings per berth
        const gateThroughput = teu * 14;                       // gate efficiency value
        const craneUptime = i.cranes * 165000;                 // crane uptime value per crane
        const lossPrev = teu * 8;                              // misroute reduction per TEU
        const exceptions = teu * 6;                            // customs / exception handling savings
        return {
          drivers:[
            { name:'Dwell-time reduction', color:COLORS[0], value:dwellSavings },
            { name:'Gate throughput',     color:COLORS[1], value:gateThroughput },
            { name:'Crane uptime',         color:COLORS[2], value:craneUptime },
            { name:'Loss / misroute prev.', color:COLORS[3], value:lossPrev },
            { name:'Exception handling',  color:COLORS[4], value:exceptions },
          ],
          investment: 460000,   // ANPR + RFID gateways + crane sensors + integration per berth
          recurring: 78000,
        };
      },
    },

    lifesciences: {
      label: 'Your life-sciences operation',
      methodologyLabel: 'Life Sciences · benefit drivers',
      methodology: [
        '<b>Batch cycle time.</b> GxP-tracked workflows cut batch cycle 15–25%.<i>Source: ISPE / PDA batch-cycle studies</i>',
        '<b>Compliance & audit prep.</b> 21 CFR Part 11 e-signature automation cuts audit prep 70–85%.<i>Source: FDA Part 11 guidance</i>',
        '<b>Sample chain-of-custody.</b> RFID + barcode link eliminates ~95% of sample-handling errors.',
        '<b>Equipment utilization.</b> Lab asset utilization lifts from 35% to 55%+.<i>Source: Pistoia Alliance / GS1 HC</i>',
        '<b>Deviation / CAPA cycle.</b> Auto-flagged deviations close 40–60% faster.',
      ],
      inputs: [
        { key:'facilities', label:'Labs / facilities', min:1, max:30, default:3, step:1, fmt:v=>v+(v===1?' facility':' facilities') },
        { key:'batches', label:'GxP batches / facility / yr', min:20, max:5000, default:280, step:10, fmt:v=>v.toLocaleString()+' batches' },
        { key:'opex', label:'R&D / ops budget / facility', min:10, max:1500, default:180, step:10, fmt:v=>'$'+v+'M / facility / yr' },
        { key:'samples', label:'Samples handled / yr / facility', min:1000, max:1000000, default:42000, step:1000, fmt:v=>v.toLocaleString()+' samples' },
      ],
      compute(i){
        const op = i.opex*1e6;
        return {
          drivers:[
            { name:'Batch cycle time',       color:COLORS[0], value:i.batches*8400 },     // $8.4K saved per batch hour
            { name:'Compliance / audit',     color:COLORS[1], value:op*0.014 },
            { name:'Sample chain-of-custody',color:COLORS[2], value:i.samples*4.2 },
            { name:'Equipment utilization',  color:COLORS[3], value:op*0.018 },
            { name:'Deviation / CAPA cycle', color:COLORS[4], value:op*0.011 },
          ],
          investment: 320000,
          recurring: 52000,
        };
      },
    },

    energy: {
      label: 'Your utility / grid operation',
      methodologyLabel: 'Energy & Utilities · benefit drivers',
      methodology: [
        '<b>Outage duration (SAIDI).</b> Connected grid + automated isolation cuts SAIDI 20–35%.<i>Source: DOE Smart Grid reports</i>',
        '<b>Field crew efficiency.</b> Dispatch + AR work-orders raise wrench-time 15–25%.<i>Source: EPRI · crew productivity</i>',
        '<b>Asset health.</b> Predictive transformer & feeder analytics avert 60–80% of asset failures.',
        '<b>Theft / non-technical loss.</b> Smart-meter + analytics recovers 1–3% of distributed kWh.<i>Source: World Bank distribution loss</i>',
        '<b>NERC-CIP automation.</b> Continuous compliance evidence cuts audit cost 60–80%.',
      ],
      inputs: [
        { key:'substations', label:'Substations on network', min:1, max:500, default:18, step:1, fmt:v=>v+' substations' },
        { key:'customers', label:'Customers served / substation', min:500, max:200000, default:15000, step:500, fmt:v=>v.toLocaleString()+' customers' },
        { key:'opex', label:'Annual operating budget / substation', min:1, max:200, default:14, step:1, fmt:v=>'$'+v+'M / substation / yr' },
        { key:'saidi', label:'Current SAIDI (avg outage / customer)', min:30, max:600, default:180, step:10, fmt:v=>v+' min / yr' },
      ],
      compute(i){
        const op = i.opex*1e6;
        const outageValue = i.customers * (i.saidi/60) * 3.2 * 0.25;  // $3.2/hr customer-minute × 25% recovered
        const crewEfficiency = op * 0.04;
        const assetHealth = op * 0.035;
        const lossRecovery = i.customers * 18;                          // $18/customer/yr in NTL recovery
        const compliance = op * 0.012;
        return {
          drivers:[
            { name:'Outage reduction (SAIDI)', color:COLORS[0], value:outageValue },
            { name:'Field crew efficiency',    color:COLORS[1], value:crewEfficiency },
            { name:'Asset health / PdM',       color:COLORS[2], value:assetHealth },
            { name:'Theft / NTL recovery',     color:COLORS[3], value:lossRecovery },
            { name:'NERC-CIP compliance',      color:COLORS[4], value:compliance },
          ],
          investment: 420000,
          recurring: 75000,
        };
      },
    },

    civildefense: {
      label: 'Your civil-defense operation',
      methodologyLabel: 'Civil Defense · benefit drivers',
      methodology: [
        '<b>Time to dispatch.</b> Sensor-fused incident detection cuts time-to-dispatch 30–45%.<i>Source: Innovent (Abu Dhabi Civil Defense)</i>',
        '<b>Multi-agency coordination.</b> Unified workbench reduces coordination overhead 50–70%.',
        '<b>Asset readiness.</b> RFID + telemetry on engines, BA & PPE lifts readiness 12–22%.<i>Source: NFPA readiness benchmarks</i>',
        '<b>Mass notification.</b> Geo-targeted alerts reach 95%+ of affected population <2 min.',
        '<b>After-action review.</b> Auto-assembled AAR cuts review cycle 60–80%.',
      ],
      inputs: [
        { key:'stations', label:'Response stations', min:1, max:500, default:24, step:1, fmt:v=>v+' stations' },
        { key:'incidents', label:'Incidents / yr / station', min:50, max:10000, default:1200, step:50, fmt:v=>v.toLocaleString()+' incidents' },
        { key:'opex', label:'Operating budget / station', min:1, max:80, default:8, step:0.5, fmt:v=>'$'+v.toFixed(1)+'M / station / yr' },
        { key:'responders', label:'Responders / station', min:5, max:500, default:42, step:1, fmt:v=>v+' responders' },
      ],
      compute(i){
        const op = i.opex*1e6;
        return {
          drivers:[
            { name:'Dispatch time',         color:COLORS[0], value:i.incidents*180 },     // $180 value per incident saved
            { name:'Multi-agency coord.',   color:COLORS[1], value:i.responders*4200*0.30 },
            { name:'Asset readiness',       color:COLORS[2], value:op*0.022 },
            { name:'Mass notification',     color:COLORS[3], value:op*0.010 },
            { name:'After-action review',   color:COLORS[4], value:op*0.014 },
          ],
          investment: 480000,
          recurring: 88000,
        };
      },
    },

    assettracking: {
      label: 'Your asset-tracking operation',
      methodologyLabel: 'Critical Asset Tracking · benefit drivers',
      methodology: [
        '<b>Audit cycle time.</b> RFID portal audits cut audit time from days to hours (≈92%).<i>Source: Innovent customer outcomes</i>',
        '<b>Lost-asset recovery.</b> Item-level tracking recovers 85–95% of "ghost loss" replacement.<i>Source: DoD asset visibility studies</i>',
        '<b>Chain-of-custody compliance.</b> Immutable ledger eliminates manual reconciliation (~100%).',
        '<b>Biometric access binding.</b> Identity-bound passage cuts unauthorized movement 99%+.',
        '<b>Manual reconciliation.</b> Auto-matching events with system records saves 60–80% of labor.',
      ],
      inputs: [
        { key:'facilities', label:'Armories / asset sites', min:1, max:200, default:8, step:1, fmt:v=>v+(v===1?' site':' sites') },
        { key:'assets', label:'Critical assets / site', min:50, max:50000, default:2400, step:50, fmt:v=>v.toLocaleString()+' assets' },
        { key:'audits', label:'Audit cycles / site / yr', min:1, max:24, default:6, step:1, fmt:v=>v+' audits' },
        { key:'opex', label:'Operating budget / site', min:1, max:80, default:5, step:0.5, fmt:v=>'$'+v.toFixed(1)+'M / site / yr' },
      ],
      compute(i){
        const op = i.opex*1e6;
        return {
          drivers:[
            { name:'Audit cycle time',       color:COLORS[0], value:i.audits*(i.assets*0.85) }, // $0.85 / asset audited (saved)
            { name:'Lost-asset recovery',    color:COLORS[1], value:i.assets*120 },
            { name:'Chain-of-custody',       color:COLORS[2], value:op*0.018 },
            { name:'Biometric access',       color:COLORS[3], value:op*0.012 },
            { name:'Manual reconciliation',  color:COLORS[4], value:op*0.024 },
          ],
          investment: 280000,
          recurring: 48000,
        };
      },
    },
  };

  const REALIZATION = 0.55;

  function fmt$(n) {
    const neg = n < 0; const a = Math.abs(n); const s = neg ? '-' : '';
    if (a >= 1e9) return s + '$' + (a/1e9).toFixed(1) + 'B';
    if (a >= 1e6) return s + '$' + (a/1e6).toFixed(1) + 'M';
    if (a >= 1e3) return s + '$' + Math.round(a/1e3) + 'K';
    return s + '$' + Math.round(a);
  }

  function mount(root) {
    const key = root.getAttribute('data-industry');
    const ind = INDUSTRIES[key];
    if (!ind) { console.warn('roi-calc: unknown industry', key); return; }
    const inputs = {};

    root.innerHTML = `
      <div class="roi-i">
        <div class="roi-i__head">
          <div>
            <div class="eyebrow">// ROI calculator · research-backed</div>
            <h3>Model your savings.</h3>
            <p>3-year ROI · benefit drivers anchored to industry research and our deployed-customer outcomes.</p>
          </div>
        </div>
        <div class="roi-i__body">
          <div class="roi-i__inputs">
            <div class="roi-i__inputs-head">
              <span class="roi-i__inputs-label">${ind.label}</span>
              <span class="roi-i__inputs-pill">Adjustable</span>
            </div>
            <div data-fields></div>
            <div class="roi-i__method">
              <div class="roi-i__method-head">${ind.methodologyLabel}</div>
              <ul>${ind.methodology.map(m => '<li><div>'+m+'</div></li>').join('')}</ul>
            </div>
          </div>
          <div class="roi-i__results">
            <div class="roi-i__hero-grid">
              <div class="roi-i__hero-card roi-i__hero-card--lead">
                <div class="roi-i__hero-lab">Payback</div>
                <div class="roi-i__hero-big" data-out="payback">—</div>
                <div class="roi-i__hero-sub" data-out="payback-sub">to break even, all-in</div>
              </div>
              <div class="roi-i__hero-card">
                <div class="roi-i__hero-lab">3-year ROI</div>
                <div class="roi-i__hero-big" data-out="roi">—</div>
                <div class="roi-i__hero-sub" data-out="roi-sub">net of investment</div>
              </div>
              <div class="roi-i__hero-card">
                <div class="roi-i__hero-lab">Net 3-yr savings</div>
                <div class="roi-i__hero-big" data-out="net">—</div>
                <div class="roi-i__hero-sub" data-out="net-sub">across all facilities</div>
              </div>
              <div class="roi-i__hero-card">
                <div class="roi-i__hero-lab">Annual savings</div>
                <div class="roi-i__hero-big" data-out="annual">—</div>
                <div class="roi-i__hero-sub" data-out="annual-sub">per year, run-rate</div>
              </div>
            </div>
            <div class="roi-i__breakdown">
              <div class="roi-i__breakdown-head">
                <h4>Where the savings come from</h4>
                <span class="roi-i__breakdown-meta" data-out="meta">Annualized, per facility</span>
              </div>
              <div class="roi-i__bar" data-bar></div>
              <div class="roi-i__legend" data-legend></div>
            </div>
            <div class="roi-i__chart">
              <div class="roi-i__breakdown-head">
                <h4>Cumulative cash flow</h4>
                <span class="roi-i__breakdown-meta">Months from go-live · all facilities</span>
              </div>
              <svg viewBox="0 0 600 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="roi-i-fill-${key}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <g stroke="rgba(255,255,255,0.05)" stroke-width="1">
                  <line x1="40" y1="40" x2="580" y2="40"/>
                  <line x1="40" y1="100" x2="580" y2="100" stroke-dasharray="2 4" stroke="rgba(255,255,255,0.12)"/>
                  <line x1="40" y1="160" x2="580" y2="160"/>
                </g>
                <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--ink-60)" letter-spacing="0.05em">
                  <text x="34" y="44" text-anchor="end" data-out="y-top">+$30M</text>
                  <text x="34" y="104" text-anchor="end">$0</text>
                  <text x="34" y="164" text-anchor="end" data-out="y-bot">−$10M</text>
                  <text x="40" y="200">M0</text>
                  <text x="310" y="200" text-anchor="middle">M18</text>
                  <text x="580" y="200" text-anchor="end">M36</text>
                </g>
                <text data-out="break-label" x="0" y="0" font-family="JetBrains Mono, monospace" font-size="9" fill="#FBBF24" letter-spacing="0.05em" style="display:none">PAYBACK</text>
                <line data-out="break-line" x1="0" y1="40" x2="0" y2="160" stroke="#FBBF24" stroke-width="1" stroke-dasharray="2 3" opacity="0"/>
                <path class="roi-i__chart-fill" data-out="curve-fill" d="" fill="url(#roi-i-fill-${key})"/>
                <path class="roi-i__chart-line" data-out="curve-line" d="" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle data-out="break-dot" cx="0" cy="0" r="4" fill="#FBBF24" opacity="0"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="roi-i__foot">
          <span class="roi-i__foot-tag">// Methodology</span>
          <span>Calculator mirrors the model we use in customer assessments. Benefit drivers anchored to public industry research and deployed-customer outcomes. Investment includes one-time hardware, software licensing, integration and rollout services. Recurring includes consumables, maintenance, and SaaS licensing. Net 3-yr savings = (Annual benefits − Annual recurring) × 3 − Initial investment.</span>
        </div>
      </div>`;

    const fieldsWrap = root.querySelector('[data-fields]');
    ind.inputs.forEach(f => {
      inputs[f.key] = f.default;
      const fieldEl = document.createElement('div');
      fieldEl.className = 'roi-i__field';
      fieldEl.innerHTML = `
        <div class="roi-i__field-head">
          <label>${f.label}</label>
          <span class="val" data-out="${f.key}">${f.fmt(f.default)}</span>
        </div>
        <input type="range" data-key="${f.key}" min="${f.min}" max="${f.max}" value="${f.default}" step="${f.step}">
        <span class="help">${f.fmt(f.min)} → ${f.fmt(f.max)}</span>`;
      fieldsWrap.appendChild(fieldEl);
      fieldEl.querySelector('input').addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        inputs[f.key] = v;
        fieldEl.querySelector('[data-out]').textContent = f.fmt(v);
        compute();
      });
    });

    function $(sel) { return root.querySelector(sel); }

    function compute() {
      const r = ind.compute(inputs);
      const drivers = r.drivers.map(d => ({ ...d, value: d.value * REALIZATION }));
      const perFacility = drivers.reduce((s, d) => s + d.value, 0);
      const facCount = inputs[ind.inputs[0].key] || 1;
      const annualSavings = perFacility * facCount;
      const annualRecurring = r.recurring * facCount;
      const perFacNet = perFacility - r.recurring;
      const initialInvest = (r.investment + 0.55 * Math.max(0, perFacNet)) * facCount;
      const netAnnual = annualSavings - annualRecurring;
      const paybackMonths = Math.max(2, Math.round((initialInvest / Math.max(1, netAnnual)) * 12));
      const threeYearNet = netAnnual * 3 - initialInvest;
      const roiPct = ((threeYearNet) / Math.max(1, initialInvest)) * 100;

      $('[data-out="payback"]').textContent = paybackMonths + ' mo';
      $('[data-out="payback-sub"]').textContent = paybackMonths < 12 ? 'break-even inside year 1' : 'all-in including hardware';
      $('[data-out="roi"]').textContent = (roiPct >= 1000 ? Math.round(roiPct/100)*100 + '+' : Math.round(roiPct)) + '%';
      $('[data-out="roi-sub"]').textContent = 'over 3 years · net of investment';
      $('[data-out="net"]').textContent = fmt$(threeYearNet);
      $('[data-out="net-sub"]').textContent = facCount + (facCount === 1 ? ' facility' : ' facilities');
      $('[data-out="annual"]').textContent = fmt$(netAnnual);
      $('[data-out="annual-sub"]').textContent = fmt$(annualSavings) + ' gross · ' + fmt$(annualRecurring) + ' recurring';

      const bar = $('[data-bar]');
      bar.innerHTML = '';
      drivers.forEach(d => {
        const seg = document.createElement('div');
        seg.className = 'roi-i__bar-seg';
        seg.style.background = d.color;
        seg.style.flexBasis = ((d.value / perFacility) * 100) + '%';
        seg.title = d.name + ' — ' + fmt$(d.value);
        bar.appendChild(seg);
      });
      $('[data-legend]').innerHTML = drivers.map(d => `
        <div class="roi-i__legend-row">
          <span class="roi-i__legend-dot" style="background:${d.color}"></span>
          <span class="roi-i__legend-name">${d.name}</span>
          <span class="roi-i__legend-val">${fmt$(d.value)}</span>
        </div>`).join('');
      $('[data-out="meta"]').textContent = 'Annualized · per facility · realized at ' + Math.round(REALIZATION*100) + '%';

      // 3-year cumulative chart (36 months)
      const months = 36;
      const monthlyNet = netAnnual / 12;
      let cum = -initialInvest;
      const points = [];
      for (let m = 0; m <= months; m++) { points.push({ m, cum }); cum += monthlyNet; }
      const minY = Math.min(...points.map(p => p.cum), -initialInvest);
      const maxY = Math.max(...points.map(p => p.cum));
      const yRange = Math.max(1, maxY - minY);
      const yToPx = y => 40 + (1 - (y - minY) / yRange) * 120;
      const xToPx = m => 40 + (m / months) * 540;
      const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + xToPx(p.m) + ' ' + yToPx(p.cum)).join(' ');
      const fillPath = path + ' L' + xToPx(months) + ' ' + yToPx(0) + ' L' + xToPx(0) + ' ' + yToPx(0) + ' Z';
      $('[data-out="curve-line"]').setAttribute('d', path);
      $('[data-out="curve-fill"]').setAttribute('d', fillPath);
      $('[data-out="y-top"]').textContent = fmt$(maxY);
      $('[data-out="y-bot"]').textContent = fmt$(minY);

      const breakMonth = paybackMonths;
      if (breakMonth <= months) {
        const bx = xToPx(breakMonth);
        const by = yToPx(0);
        const bl = $('[data-out="break-line"]');
        const bd = $('[data-out="break-dot"]');
        const bL = $('[data-out="break-label"]');
        bl.setAttribute('x1', bx); bl.setAttribute('x2', bx); bl.setAttribute('opacity', 1);
        bd.setAttribute('cx', bx); bd.setAttribute('cy', by); bd.setAttribute('opacity', 1);
        bL.setAttribute('x', bx); bL.setAttribute('y', yToPx(maxY) - 6);
        bL.setAttribute('text-anchor', 'middle');
        bL.style.display = 'block';
        bL.textContent = 'PAYBACK · M' + breakMonth;
      }
    }
    compute();
  }

  function init() {
    document.querySelectorAll('[data-roi-calc]').forEach(el => mount(el));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
