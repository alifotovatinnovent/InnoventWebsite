# Innovent Live Ship Manifest — Ali RTP (2026-09-19 Asia/Dubai)

Static Netlify ship under `/workspace/innovent-live-ship/`. No git push from this agent.

## New / patched HTML

| File | Intended live URL(s) | Notes |
|------|----------------------|-------|
| `pages/command-control-platform.html` | `https://innovent.io/pages/command-control-platform.html` · clean root `https://innovent.io/command-control-platform` (200 rewrite via `_redirects`) | AMBER C2 Brand PASS; Creative hero `assets/lp-heroes/c2-hero-1920x800.png`; caption Product UI — illustrative. |
| `pages/smart-city-command-center.html` | `https://innovent.io/pages/smart-city-command-center.html` · clean root `https://innovent.io/smart-city-command-center` (200 rewrite via `_redirects`) | AMBER Smart City Brand PASS; Creative hero `assets/lp-heroes/smart-city-hero-1920x800.png`; caption Product UI — illustrative. |
| `pages/faq.html` | `https://innovent.io/pages/faq.html` | FAQPage JSON-LD from geo-p1-faq-AMBER; CTA → request-demo. |
| `pages/about.html` | `https://innovent.io/pages/about.html` | about-legal-nap-AMBER v1.2.2; Organization JSON-LD — Innovent Tech Solutions, Dubai HQ, Smart Heights, ali@innovent.io; **no telephone**. |
| `pages/sensing-rfid-ble-uwb.html` | `https://innovent.io/pages/sensing-rfid-ble-uwb.html` | geo-p1-sensing-compare-AMBER; nav/heading **Sensing inputs**; Creative hero `assets/lp-heroes/sensing-compare-hero-1920x800.png` (**HOLD — no logo**); CTA → request-demo. |
| `index.html` (hero + meta only) | `https://innovent.io/` | homepage-hero-cta-AMBER v1.1; removed “American AI”; primary CTA 60-min discovery → `pages/request-demo.html`; secondary Book a call (visible + href); Creative hero `assets/lp-heroes/homepage-hero-1920x800.png`; Product UI — illustrative. |

## Creative hero assets (shipped)

| Asset | Used on |
|-------|---------|
| `assets/lp-heroes/c2-hero-1920x800.png` | command-control-platform.html |
| `assets/lp-heroes/smart-city-hero-1920x800.png` | smart-city-command-center.html |
| `assets/lp-heroes/homepage-hero-1920x800.png` | index.html hero |
| `assets/lp-heroes/sensing-compare-hero-1920x800.png` | sensing-rfid-ble-uwb.html (HOLD — no logo) |

## Supporting (already in ship tree)

| File | Role |
|------|------|
| `pages/_chrome.js` | Shared nav/footer for `/pages/*` |
| `_redirects` | Includes 200 rewrites for `/command-control-platform` and `/smart-city-command-center` |
| `pages/platform.html` | Chrome template reference (unchanged) |
| `pages/request-demo.html` | Primary conversion target (unchanged) |

## CTA lock (all new pages + home hero)

**Request a 60-minute discovery with a solutions architect** → `/pages/request-demo.html` (relative `request-demo.html` on pages; `pages/request-demo.html` on home).

## Brand bars applied

- No “American AI”
- No named customers / invent logos / Honeywell / cert laundry / connector counts in new copy
- Product UI captions where product imagery shown
- About: HQ Dubai locked; phone omitted from NAP + Organization schema

## Ready for gh commit

All five new HTML files + patched `index.html` + Creative heroes wired + this `SHIP-MANIFEST.md`.
