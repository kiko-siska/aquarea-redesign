# Progress

- **Status:** RUNNING  <!-- NOT_STARTED | RUNNING | PAUSED | DONE -->
- **Last updated:** 2026-10-01 07:07
- **Current phase:** 2

## Checklist

### Phase 0 — Setup
- [x] Tool check: `21st`, `magicui`, `nano-banana` MCPs + skills available (log anything missing under Blockers) — all 3 MCPs connected (21st free tier: 2 retrievals/day, AI generation off), skills `ui-ux-pro-max`, `frontend-design`, `ui-styling` listed

### Phase 1 — Content audit
- [x] Crawl every SK page of aquarea.sk → `content-audit/*.md` (source URL on top of each file) — 53 SK pages + 2 PDFs (prevádzkový poriadok, mapa areálu) as text
- [x] Note which pages exist in EN / HU — `content-audit/LANGUAGES.md` (EN 14 pages, HU 12, both partial, empty homepages)
- [x] Download photos → `source-images/` + `source-images/SOURCES.md` — 361 gallery photos (max 1280 px) + hero 2000 px, logo, partner logos, site map; best picks listed at the top of SOURCES.md
- [x] `content-audit/SITEMAP.md`: page tree, forms & booking flows, external links, content problems — 7 flows (6 forms + Previo), 14 external links (1 dead), 20 content problems
- [x] New information architecture proposal (end of SITEMAP.md) — 11 pages, 5 nav items + Rezervovať CTA, sticky mobile bar, old→new URL map

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
- 2026-10-01 (VS Code session): the built-in browser MCP (`mcp__Claude_Browser__*`) and `.claude/launch.json` preview are not available here. **Workaround:** screenshots and checks via Playwright (`playwright-core`) driving the installed Google Chrome (`scripts/screenshot.mjs`). The 21st, magicui and nano-banana MCPs are available.

## TODOs for the owner
_(source: content-audit/SITEMAP.md §5; each one is also shown as a visible TODO on the page where it matters)_
1. **FotoFilmFest 2027 date.** aquarea.sk says both "15. mája 2026 (Sobota)" and "15. 5. 2027"; subpages are for the 2026 edition (26.–27. 9. 2026). Confirm the next date.
2. **Opening hours 2027.** Season 2026 is over; no 2027 hours published yet. Also the web page and the Prevádzkový poriadok PDF disagree for 2026.
3. **Afternoon discount.** Cenník says reduced entry from 16:00 (adult 7,50 €); poriadok says 1 € off after 16:00. Which is right?
4. **Divers outside opening hours:** call "deň vopred" / "viac dní vopred" / "2–3 dni vopred"? (three versions)
5. **Stay booking:** should the main CTA be Previo (online, instant) or the e-mail form? Poriadok says form only. Previo has no storno terms set.
6. **Gastro:** names, offer and hours of the 4 gastro operations (only photos exist).
7. **Kayak/SUP rental** (Dida Sport – Kajak komando): prices, contact, hours.
8. **Logo:** only a 338×127 PNG exists; need SVG/vector.
9. **Camping pitches:** "Miesta č. 2–7" (map) vs "3–7" (cenník, poriadok).
10. **"korigované parkovisko"** on the beach page: is it "strážené"/"kontrolované"? Parking prices?
11. **Getting there:** no public-transport or driving directions on the site; only GPS + map.
12. **Recent water-quality protocol** (only the 2025 one is published, as a scan).

## Handoff
_Notes for the next session: what's next, gotchas._

- 2026-10-01 06:50 — Owner stopped the 06:03 backup session and confirmed a manual takeover from VS Code (concurrency guard overridden by owner). Phase 1 restarted from scratch (`content-audit/`, `source-images/` were empty).

## Morning report
_Filled in at the end: what was built, how to run it (`npm install && npm run dev`), which variant was picked and why, real vs. generated images, budget used, TODOs._
