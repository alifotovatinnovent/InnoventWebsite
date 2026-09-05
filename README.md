# Innovent website

Marketing site for **Innovent** and its platform **Innfini**. Static HTML with
no build step — 113 pages, hand-authored, plus a set of generated SVG consoles.

Live at `https://innovent.io`.

## Running locally

No toolchain. Serve the root directory over HTTP (not `file://`, or the shared
nav and footer injected by `pages/_chrome.js` will be blocked by CORS):

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Layout

```
index.html              Homepage — single scroll, section CSS in inline <style>
pages/                  113 content pages
  _chrome.js            Injects the shared nav + footer into #site-nav / #site-footer
  _page.css             Shared page furniture (cards, grids, breadcrumb, footer)
  _casestudy.css        Case-study layout
styles.css              Design tokens: colour, type, spacing. Loaded everywhere.
styles-*.css            Per-section stylesheets
*-console.js            Generated SVG diagrams (see below)
forms.js                Form delivery — see "Forms"
sitemap.xml robots.txt llms.txt
```

## The generated consoles

The product diagrams are not static SVG files. Each is a renderer that draws
itself into a mount element and **stamps its own aspect ratio** onto the
wrapper, so a concept change can never leave a stale letterbox behind:

| File | Mount | Draws |
| --- | --- | --- |
| `digital-twin.js` | `#dt-city` | Isometric community digital twin |
| `dc-floor.js` | `[data-dc-floor]` | Data-hall floor plan (DCIM) |
| `mobility-map.js` | `[data-mobility-map]` | Downtown street grid |
| `grid-sld.js` | `[data-grid-sld]` | Substation single-line diagram |
| `cad-map.js` | `[data-cad-map]` | Public-safety CAD map |
| `tactical-cop.js` | `[data-tactical-cop]` | Common operating picture |
| `incident-map.js` | `[data-incident-map]` | Venue incident response |
| `fabric-console.js` | `[data-fabric-console]` | Integration fabric + connector ledger |
| `forecast-console.js` | `[data-forecast-console]` | Forecast with confidence band |
| `cloud-console.js` | `[data-cloud-console]`, `[data-cloud-fig]` | Cloud regions, isolation |
| `graph-explorer.js` `graph-visuals.js` | `[data-oeg-explorer]`, `[data-oeg-fig]` | Object graph: causality trace, schema matrix, authorisation trace |
| `agentic-visuals.js` | `[data-ao-fig]` | Agent loop, policy gate, autonomy ladder |

Two conventions they all share, both load-bearing:

- **A minimum type size.** Each renderer clamps font size in its `txt()` helper.
  These are authored at a fixed `viewBox` width and scaled to fit, so an
  unclamped 7-unit label renders around 5px in a narrow container.
- **Derived layout.** Label positions, column x-values and canvas height are
  computed from measured text and content, not hardcoded — see `strW()` and the
  keep-out sets. Hardcoded positions went stale every time copy changed.

Below 900px, `styles-sections.css` gives these mounts a horizontal scroll and
releases the stamped aspect ratio, so dense diagrams hold their authored size
instead of shrinking to unreadable.

## Forms

`forms.js` is the single delivery path. Two modes, chosen by one constant:

- `ENDPOINT` set → POST JSON there (Formspree, HubSpot, a Worker, a CRM webhook)
- `ENDPOINT` null → POST to Netlify Forms, which needs no configuration beyond
  the `data-netlify="true"` and `form-name` attributes already on the form

A failure is always surfaced with the visitor's answers preserved in a mailto.
**Confirm `FALLBACK_EMAIL`** — it is currently `hello@innovent.io`, which is a
guess; `careers@` and `press@` are the addresses published on the site.

## Colour and contrast

`--ink-60` (#64748b) measures ~4.15–4.29:1 on the site's near-black grounds and
**must not be used as a text colour** — it is for separators, borders and icons
only. `--ink-70` (#94a3b8) clears AA at 7.3–8:1. All text was swept to comply,
across stylesheets, inline `style` attributes and inline `<style>` blocks.

## Deploying

Netlify or Cloudflare Pages, connected to this repository. `netlify.toml` sets
`publish = "."` with no build command.

DNS lives at GoDaddy; `innovent.io` currently points at Webflow. Add redirects
from the existing Webflow URLs before cutting over.

## Known gaps

See `github.md` for the current list — content accuracy on the press page and
several case studies, the form endpoint, the login page, URL structure,
analytics, and dedicated Privacy/Terms pages.
