// Innovent proposal — small interactions only
(() => {
  // ROI calculator
  const industryData = {
    manufacturing:    { label: "Manufacturing",   baseLift: 0.22, downtime: 0.35, accuracy: 0.18, capex: 0.18 },
    logistics:        { label: "Logistics",       baseLift: 0.28, downtime: 0.22, accuracy: 0.32, capex: 0.20 },
    retail:           { label: "Retail",          baseLift: 0.18, downtime: 0.10, accuracy: 0.40, capex: 0.12 },
    healthcare:       { label: "Healthcare",      baseLift: 0.20, downtime: 0.18, accuracy: 0.28, capex: 0.22 },
    oilgas:           { label: "Oil & Gas",       baseLift: 0.24, downtime: 0.42, accuracy: 0.20, capex: 0.30 },
    cc:               { label: "Command & Control", baseLift: 0.33, downtime: 0.55, accuracy: 0.45, capex: 0.40 },
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const pills      = $$(".roi__pill");
  const facility   = $("#facility");
  const opex       = $("#opex");
  const horizon    = $("#horizon");
  const facilityV  = $("#facility-v");
  const opexV      = $("#opex-v");
  const horizonV   = $("#horizon-v");
  const savingsV   = $("#savings");
  const liftV      = $("#lift");
  const paybackV   = $("#payback");
  const downtimeV  = $("#downtime");
  const accuracyV  = $("#accuracy");

  let industry = "manufacturing";

  const fmt$ = (n) => {
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return "$" + Math.round(n / 1e3) + "K";
    return "$" + Math.round(n);
  };

  function update() {
    if (!facility || !opex || !horizon) return;
    const data = industryData[industry];
    const sites    = parseInt(facility.value, 10);
    const opexAnn  = parseInt(opex.value, 10) * 1e6;
    const years    = parseInt(horizon.value, 10);

    // Achievable lift is a fraction of theoretical max — most ops can't capture 100% of identified savings
    const realizedLift  = data.baseLift * 0.35;
    const annualSavings = opexAnn * sites * realizedLift;
    const totalSavings  = annualSavings * years;
    // Investment: $1.2M / site (hardware + integration) + 9% of one year opex (services + licensing)
    const investment    = sites * 1_200_000 + opexAnn * sites * 0.09;
    const paybackMonths = Math.max(6, Math.round((investment / annualSavings) * 12));

    facilityV.textContent = sites + (sites === 1 ? " facility" : " facilities");
    opexV.textContent = "$" + opex.value + "M / facility / yr";
    horizonV.textContent = years + (years === 1 ? " year" : " years");

    savingsV.innerHTML = `${fmt$(totalSavings)}<span class="unit">/${years}yr</span>`;
    liftV.textContent = "+" + Math.round(data.baseLift * 100) + "%";
    paybackV.textContent = paybackMonths + " mo";
    downtimeV.textContent = "−" + Math.round(data.downtime * 100) + "%";
    accuracyV.textContent = "+" + Math.round(data.accuracy * 100) + "%";
  }

  pills.forEach(p => p.addEventListener("click", () => {
    pills.forEach(x => x.classList.remove("is-active"));
    p.classList.add("is-active");
    industry = p.dataset.industry;
    update();
  }));
  [facility, opex, horizon].forEach(el => el && el.addEventListener("input", update));
  update();

  // Smooth scroll for nav anchors
  $$("a[href^='#']").forEach(a => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }));
})();
