# Progress

- **Status:** RUNNING  <!-- NOT_STARTED | RUNNING | PAUSED | DONE -->
- **Last updated:** 2026-10-01 07:02
- **Current phase:** 1

## Checklist

### Phase 0 — Setup
- [x] Tool check: `21st`, `magicui`, `nano-banana` MCPs + skills available (log anything missing under Blockers) — all 3 MCPs connected (21st free tier: 2 retrievals/day, AI generation off), skills `ui-ux-pro-max`, `frontend-design`, `ui-styling` listed

### Phase 1 — Content audit
- [x] Crawl every SK page of aquarea.sk → `content-audit/*.md` (source URL on top of each file) — 53 SK pages + 2 PDFs (prevádzkový poriadok, mapa areálu) as text
- [x] Note which pages exist in EN / HU — `content-audit/LANGUAGES.md` (EN 14 pages, HU 12, both partial, empty homepages)
- [x] Download photos → `source-images/` + `source-images/SOURCES.md` — 361 gallery photos (max 1280 px) + hero 2000 px, logo, partner logos, site map; best picks listed at the top of SOURCES.md
- [ ] `content-audit/SITEMAP.md`: page tree, forms & booking flows, external links, content problems
- [ ] New information architecture proposal (end of SITEMAP.md)

### Phase 2 — Three homepage directions
- [ ] Run the ui-ux-pro-max design-system generator; write 3 directions into DECISIONS.md
- [ ] Scaffold Astro + Tailwind + React; content collections from the audit; `noindex`; git commit
- [ ] Component shortlist (21st search / Magic UI / Aceternity) + image shot list
- [ ] Variant 1 at `/variants/1/`
- [ ] Variant 2 at `/variants/2/`
- [ ] Variant 3 at `/variants/3/`
- [ ] Picker page `/variants/`
- [ ] Browser check 375px + desktop, screenshots, fixes
- [ ] [auto] Pick the recommended variant, log why in DECISIONS.md

### Phase 3 — Full site in the chosen direction
- [ ] Home (`/`)
- [ ] Plážová zóna
- [ ] Prémium zóna (kemping & apartmány)
- [ ] Potápanie / Dive Center (courses, intro dives)
- [ ] Cenník
- [ ] Otváracie hodiny
- [ ] Rezervácie / Kontakt (+ how to get there)
- [ ] FotoFilmFest
- [ ] Galéria
- [ ] O nás
- [ ] 404
- [ ] SEO: titles, descriptions, OG, JSON-LD (real data only), sitemap
- [ ] Final QA: `npm run build`, all pages at 375px + desktop, a11y + reduced-motion, Lighthouse
- [ ] Morning report (below)

## Budget log
- 21st `get_component`: (date · component · used for)
- Gemini images: 0 / 8 (file · prompt summary)

## Blockers

## TODOs for the owner

## Handoff
_Notes for the next session: what's next, gotchas._

- 2026-10-01 06:50 — Owner stopped the 06:03 backup session and confirmed a manual takeover from VS Code (concurrency guard overridden by owner). Phase 1 restarted from scratch (`content-audit/`, `source-images/` were empty).

## Morning report
_Filled in at the end: what was built, how to run it (`npm install && npm run dev`), which variant was picked and why, real vs. generated images, budget used, TODOs._
