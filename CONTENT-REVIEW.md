# Pre-launch content review — innovent.io

Every claim below is currently written on the site and would be publicly
published. Each one is either factual or it is not. Mark each: **KEEP** (true,
as written), **FIX** (true but the numbers/wording are wrong — give the right
version), or **CUT** (not true — remove the claim and any page built on it).

---

## 1. Compliance & certifications — highest risk

These appear on the homepage and `pages/trust.html`, and are the claims most
likely to be relied on in a tender or a customer security review.

| # | Claim | Where | Decision |
|---|---|---|---|
| 1.1 | "SOC 2 Type II — Active. Annual independent audit." | homepage, trust | |
| 1.2 | "ISO/IEC 27001 — Certified ISMS" | homepage, trust | |
| 1.3 | "FedRAMP Moderate — 3PAO assessment underway, Q3 2026 target" | homepage, trust | |
| 1.4 | "NIST 800-53 control mapping — documented baseline" | homepage, trust | |
| 1.5 | "HIPAA — signed Business Associate Agreements with PHI safeguards" | homepage, trust | |
| 1.6 | "GDPR & CCPA — right-to-access / right-to-delete workflows built in" | homepage, trust | |
| 1.7 | "CJIS-ready posture. Used by Dubai Police force-wide." | trust | |
| 1.8 | "21 CFR Part 11 compliant for life-sciences customers" | trust | |
| 1.9 | "Quarterly third-party penetration testing" / "24/7 SOC, follow-the-sun" | trust | |
| 1.10 | "Customer notification within 24 hours of confirmed material incident" | trust | |

> Note: 1.5, 1.8 and 1.10 are contractual commitments, not marketing copy. If
> they are not backed by a real policy, they should not be published.

## 2. Company scale, offices and hiring

| # | Claim | Where | Decision |
|---|---|---|---|
| 2.1 | "240-person team" | careers, loc-los-angeles | |
| 2.2 | "Six offices: Los Angeles HQ · La Paz · Dubai · Lahore · Toronto · Sydney" | careers, 6 location pages, press | |
| 2.3 | "Innovent's global headquarters is Los Angeles" / "American AI infrastructure" (homepage title tag) | index, loc-los-angeles | |
| 2.4 | "CEO, CRO, COO based in LA" | loc-los-angeles | |
| 2.5 | "22 open roles" — 18 individual job pages with locations and comp framing | careers, job-*.html (18 pages) | |
| 2.6 | "TS/SCI cleared engineers for federal and defense customer work" | loc-los-angeles, job-security-eng | |
| 2.7 | "4 weeks vacation, sabbatical at year five, published salary bands, equity, healthcare + retirement" | careers | |
| 2.8 | "Solutions team is 30% former public-safety, defense and industrial operators" | careers | |
| 2.9 | Five team pages describing engineering / product / sales / solutions / operations org structure | team-*.html | |

## 3. Press, awards and partnerships

| # | Claim | Where | Decision |
|---|---|---|---|
| 3.1 | "Named AWS ISV partner — Innfini available on AWS Marketplace, co-sell motion" | press | |
| 3.2 | "Featured in Gartner Cool Vendors for Industrial Operations AI (2025)" | press | |
| 3.3 | "Frost & Sullivan Best Practices Award — Smart City Operations Platform, MENA (2025)" | press | |
| 3.4 | "Smart Dubai Award (2024) — city-wide deployment with Dubai Municipality" | press | |
| 3.5 | "RFID Journal — Best Industrial RFID Deployment, AD Ports cold-chain (2024)" | press | |
| 3.6 | "GITEX Future Cities keynote — CEO and Chief Architect, alongside the GovAI Coalition" | press | |
| 3.7 | "Expanded North American HQ to Los Angeles, May 2026 press release" | press | |
| 3.8 | "Press contact press@innovent.io — responds within one business day" | press | |

## 4. Customer case studies

For each: is the customer relationship real, is it public/referenceable (do you
have permission to name them), and are the numbers right?

| # | Customer | Headline claims | Decision |
|---|---|---|---|
| 4.1 | Abu Dhabi Civil Defense | RFID on every equipment item, 10 stations, 2 checks per mission, ERP + readiness platform integration | |
| 4.2 | Saudi Ministry of Interior | Kingdom-wide, 100% paperless, evidence chain-of-custody, IoT telemetry | |
| 4.3 | Dubai Police | 20+ internal systems unified, armory RFID, powers the smart police stations | |
| 4.4 | Dubai Municipality | City-wide smart city — irrigation, waste, CCTV, crowd, environment | |
| 4.5 | AD Ports Group | Port-wide digital operations, 24/7 cold chain, supplier portals, last-mile | |
| 4.6 | ASC / Australian Navy | National control tower, 20 ASC sites, 30+ systems, submarine manufacturing | |
| 4.7 | Ecovyst (USA) | Whole-plant automation, Vision AI quality release | |

> Naming a defence customer (4.6) and two ministries (4.2, 4.3) publicly usually
> needs written clearance. Worth confirming before these go live.

## 5. Product and performance numbers

| # | Claim | Where | Decision |
|---|---|---|---|
| 5.1 | "6.2B+ signals reasoned daily" | homepage hero | |
| 5.2 | "<180ms signal-to-action latency" | homepage hero | |
| 5.3 | "99.99% operational uptime" | homepage hero | |
| 5.4 | "The world's first AI-Native Operating Platform" | homepage hero | |
| 5.5 | "Hyperscale & enterprise partners" logo row | homepage | |
| 5.6 | Six blog posts and four white papers authored under the Innovent name | blog-*, wp-* | |

## 6. Housekeeping (no fact-check needed, but must be settled before launch)

- `pages/login.html` shows a demo alert — point it at the real platform login or drop it from the nav.
- Form fallback address is `hello@innovent.io` (a guess). Confirm the real inbox.
- `press@innovent.io` and `careers@` are published on the site — confirm they exist and are monitored.
- Privacy and Terms links currently route to `trust.html`; real pages needed.
- No analytics installed. Decide: Plausible / Fathom / GA4 / none.
