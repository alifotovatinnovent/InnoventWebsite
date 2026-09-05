repo: alifotovatinnovent/InnoventWebsite
branch: main

## Last sync

date: 2026-09-05T13:04:00Z

> The repository is created but has no commits yet (the tree endpoint returns
> 409, which is GitHub's signal for an empty repo). Nothing has been pushed from
> this project — see "Publishing" below. The previously connected
> `alifotovatinnovent/Apps` was a Python/Railway app and is not the website
> source; it is no longer associated.

### Updated in this project

- Associated the website with its own repository, `alifotovatinnovent/InnoventWebsite`.
- Added `netlify.toml`, `.gitignore` and `README.md` so the repository deploys as a static site with no build step once pushed.
- Site is otherwise launch-prepared: per-page metadata and canonicals on all 113 pages, `sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD, a share image, AA contrast throughout, and a working form delivery path.

## Screen map

| Screen | Built from |
| --- | --- |
| (all 113 pages) | Authored in this project. Not derived from repository source — the repository is the publishing target, not the origin. |

## Publishing

This project cannot push to GitHub; it can only read from it. To publish:

1. Download the project from the chat and push it to `main`, or point Claude
   Code at both the repository and these files and let it commit.
2. Connect the repository in Netlify or Cloudflare Pages. `netlify.toml` sets
   `publish = "."` with no build command, so it deploys as-is.
3. Point `innovent.io` at the host from GoDaddy DNS, replacing the records
   currently aimed at Webflow.
4. Add redirects from the existing Webflow URLs to their new equivalents.

## Outstanding before launch

- **Content accuracy.** The AWS ISV partner, Gartner Cool Vendors and GITEX
  keynote claims on `pages/press.html` are unverified. The Saudi MoI, Dubai
  Police, ASC Navy, AD Ports and Ecovyst case studies contain invented
  specifics and need review by someone who knows the deployments.
- **Form endpoint.** `forms.js` uses Netlify Forms by default; set `ENDPOINT`
  for another service. Confirm `FALLBACK_EMAIL` (currently `hello@innovent.io`).
- **Login page.** `pages/login.html` shows a demo alert; point it at the real
  platform login or remove it from navigation.
- **URL structure.** Pages live at `/pages/*.html`. Decide on clean URLs before
  search engines index the current paths.
- **Analytics** is not installed. **Privacy and Terms** currently route to
  `trust.html` rather than dedicated pages.
