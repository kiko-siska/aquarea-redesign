# Progress

- **Status:** RUNNING  <!-- NOT_STARTED | RUNNING | PAUSED | DONE -->
- **Last updated:** 2026-10-02 21:16
- **Current phase:** 4

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
- [x] Run the ui-ux-pro-max design-system generator; write 3 directions into DECISIONS.md — 1 Ponor (dive), 2 Deň pri vode (editorial), 3 Náramok (wayfinding)
- [x] Scaffold Astro + Tailwind + React; content collections from the audit; `noindex`; git commit — Astro 7.3 static, Tailwind 4, React 19; data in `src/content/*.json` validated by zod (source URL required); base-path helper; OG image from real photo
- [x] Component shortlist (21st search / Magic UI / Aceternity) + image shot list — DECISIONS.md 07:21; 2× 21st retrieved & adapted, Magic UI marquee + light rays ported to zero-JS Astro
- [x] Variant 1 at `/variants/1/` — Ponor: depth gauge with real attraction depths, surface→deep section gradients, light rays, depth-fade photo strip, depth chart of 10 attractions
- [x] Variant 2 at `/variants/2/` — Deň pri vode: serif magazine on white, alternating spreads, day strip (adapted 21st filmstrip, React island), price box with leaders
- [x] Variant 3 at `/variants/3/` — Náramok: colour-coded wristband zones (exclusive <details>), season board, signage price board, partner marquee
- [x] Picker page `/variants/` — summaries, palettes, type, signature effect, desktop + mobile thumbnails (`scripts/picker-thumbs.mjs`)
- [x] Browser check 375px + desktop, screenshots, fixes — `screenshots/phase2/*.jpg` (375 + 1440, full page); no overflow/console errors; axe-core 0 violations on all 4 pages (fixed 2 contrast issues in v3); reduced-motion pass checked; fixes: depth-bar overflow, misleading depth ruler on photo removed, Č caron leading, chip display, gallery tile height
- [x] [auto] Pick the recommended variant, log why in DECISIONS.md — **3 Náramok** (Lighthouse mobile 98/100/100, shortest page, first price earliest); V1 runner-up

### Phase 3 — Full site in the chosen direction
- [x] Home (`/`) — direction 3 refined: prices visible on closed wristbands on mobile, links into the new IA, JSON-LD (TouristAttraction + LocalBusiness, real data), shared `Site` layout + `v3.css`
- [x] Plážová zóna — `/plazova-zona/`: features, reception, entry & prices, Event zóna (#event-zona) with prices, gastro (TODO), JSON-LD Beach
- [x] Prémium zóna (kemping & apartmány) — `/premium-zona/`: 3 apartments with prices, camping, fishing, how booking works (offer → 50 % deposit), Previo + form, JSON-LD Campground/LodgingBusiness
- [x] Potápanie / Dive Center (courses, intro dives) — `/potapanie/`: facts, story, OWD/AOWD/DEEP/TECH zones, full depth chart of 32 attractions + the real map, intro dive, OWD course, freediving, rental & prices, groups + reverz, DC contact
- [x] Cenník — `/cennik/`: all 3 price lists as accessible tables, zone-coloured sticky section tabs, anchors #plazova-zona #kemping-apartmany #event-zona #dive-center
- [x] Otváracie hodiny — `/otvaracie-hodiny/`: live status, every 2026 period as a table, last-entry rule, divers outside hours, TODOs (2027, PDF conflict)
- [x] Rezervácie / Kontakt (+ how to get there) — `/rezervacie/` hub (6 options → live aquarea.sk flows, tel/mail, how stay booking works) + `/kontakt/` (3 contact cards, GPS, navigation, click-to-load Google map, area map, operator data, documents)
- [x] FotoFilmFest — `/fotofilmfest/`: next edition with date TODO, team, 3 competitions (accordion), applications → live forms, 2026 programme; Event JSON-LD held back until the date is confirmed
- [x] Galéria — `/galeria/`: 54 real photos, album filter chips (JS-enhanced, all visible without JS), native `<dialog>` lightbox with arrows/keyboard
- [x] O nás — `/o-nas/`: story, aktuality (5 posts), documents (PDF links), rules in short
- [x] 404 — zone-coloured shortcuts back into the site
- [x] SEO: titles, descriptions, OG, JSON-LD (real data only), sitemap — unique titles ≤ 60 + suffix, descriptions ≤ ~165, one H1 per page, OG image from the real drone photo, JSON-LD TouristAttraction/LocalBusiness, Beach, Campground/LodgingBusiness, SportsActivityLocation, BreadcrumbList (no ratings; Event held back until date confirmed), `@astrojs/sitemap` (variants excluded), robots.txt disallow + noindex until approval
- [x] Final QA: `npm run build`, all pages at 375px + desktop, a11y + reduced-motion, Lighthouse — build OK (16 pages); `screenshots/phase3/` (12 pages × 375 + 1440); no horizontal overflow; 0 broken internal links/anchors, all 22 external links return 200; GitHub Pages sub-path build (`BASE_PATH=/aquarea-redesign`) verified: every internal URL, image, font, sitemap and OG URL carries the base; variants re-checked after the shared refactors (no overflow, axe 0); axe-core 0 violations on all pages; reduced-motion pass OK; Lighthouse mobile perf 96–100, a11y 100, best practices 100 (SEO 69 = intentional noindex)
- [x] Morning report (below)

### Phase 4 — Two bold motion directions (V4 Čierna voda, V5 Titulky)
_Owner brief 2026-10-02. V4/V5 are exempt from a11y + Lighthouse (AGENTS.md rule 7 exception); replacement bar: build passes, 0 console errors, no overflow at 375 px, DPR ≤ 2, render loops pause off-screen, static poster if WebGL fails. V1–V3 and the site stay untouched._
- [x] Step 1: AGENTS.md rule 7 exception, committed on its own (33effb8)
- [x] Log both waivers in DECISIONS.md + owner TODO "hardening pass needed before V4/V5 can ship"
- [ ] Design system for V4 + V5: fonts (Slovak glyph check), palettes, motion plan → DECISIONS.md
- [ ] Page-scoped dependencies (gsap, three, lenis, fonts); nothing in shared layouts
- [ ] Textures: ≤ 3 Gemini images (abstract only), logged below
- [ ] V4 · Čierna voda at `/variants/4/` (WebGL water + torch, ripples, marine snow, SplitText H1, all sections)
- [ ] V5 · Titulky at `/variants/5/` (leader countdown, scenes, kinetic type, timecode, Flip reel, credits, film clock, clapperboard, route)
- [ ] Picker `/variants/`: V4 + V5 with summary, palette, type, signature effect, desktop + mobile thumbnails
- [ ] Verify 375 + 1440: scroll 0/25/50/75/100 % + hover/touch states → `screenshots/phase4/`; console, overflow, build
- [ ] DECISIONS.md: entry per variant + "best wow / best for the mission / what V4–V5 need to ship"; PROGRESS handoff

## Budget log
- 21st `get_component`: (date · component · used for)
  - 2026-10-01 · Horizontal Depth Fade (@unlumen, id 18439) · v1 underwater photo strip (ported to vanilla JS)
  - 2026-10-01 · Filmstrip Gallery (@n1m4mz, id 27093) · v2 day strip + lightbox (adapted)
  - **2026-10-01: 2/2 used.** Next retrieval possible 2026-10-02.
- Gemini images: 1 / 8 (file · prompt summary)
  - 2026-10-01 · `images/generated/v1-caustics.jpg` (2K, fast) · abstract sunlight caustics on sand through teal water; no objects/place/people · v1 texture overlay (`src/assets/generated/caustics.jpg`, resized)

## Blockers
- 2026-10-01 (VS Code session): the built-in browser MCP (`mcp__Claude_Browser__*`) and `.claude/launch.json` preview are not available here. **Workaround:** screenshots and checks via Playwright (`playwright-core`) driving the installed Google Chrome (`scripts/screenshot.mjs`). The 21st, magicui and nano-banana MCPs are available.

## TODOs for the owner
_Each one is also a visible yellow TODO on the page where it matters. Full list: `npm run build && npm run todos`._
1. **FotoFilmFest 2027 date.** aquarea.sk says both "15. mája 2026 (Sobota)" and "15. 5. 2027"; the propozície and applications are still for 2026. *(home, /fotofilmfest/)*
2. **Opening hours 2027.** Not published yet. For 2026 the web page and the Prevádzkový poriadok PDF also disagree; the site uses the web page. *(home, /otvaracie-hodiny/)*
3. **Afternoon discount.** Cenník: adult 7,50 € from 16:00 (= 1,50 € off). Poriadok: 1 € off after 16:00. *(/cennik/)*
4. **Divers outside opening hours:** "deň vopred", "viac dní vopred" or "2–3 dni vopred"? *(/potapanie/, /otvaracie-hodiny/)*
5. **Main way to book a stay:** Previo (online, instant; no storno terms set in Previo) or the e-mail form (the only one the poriadok names)? *(/premium-zona/, /rezervacie/)*
6. **Event zóna booking:** no form on aquarea.sk; the site says phone/e-mail. *(/plazova-zona/)*
7. **Gastro:** names, offer and hours of the 4 gastro operations. *(/plazova-zona/)*
8. **Kayak / SUP rental** (Dida Sport – Kajak komando): prices and contact. *(/plazova-zona/)*
9. **"Korigované parkovisko":** guarded/controlled? Any parking fee? *(/plazova-zona/)*
10. **Getting there:** directions by car, bus or train; parking info. *(/kontakt/)*
11. **Camping pitches:** map says 2–7, cenník and poriadok say 3–7. *(/premium-zona/)*
12. **Kurz AOWD:** content and schedule aren't described on aquarea.sk. *(/potapanie/)*
13. **Water-quality protocol:** only a 2025 scan exists; publish the current one as a PDF. *(/o-nas/)*
14. **Logo:** only a 338×127 PNG exists; a vector (SVG) logo would look sharper.
15. **Before launch:** confirm the new URLs, set up redirects from the old ones (SITEMAP.md §7), remove `noindex` and the robots.txt block, and decide on EN/HU translation and hosting.
16. **Hardening pass needed before V4/V5 can ship.** `/variants/4/` and `/variants/5/` were built with accessibility and Lighthouse targets waived (owner, 2026-10-02). Before either direction is used for the real site: WCAG AA contrast, keyboard/focus, reduced-motion fallbacks, screen-reader text for the WebGL/scroll scenes, and Lighthouse mobile ≥ 90.

## Handoff
_Notes for the next session: what's next, gotchas._

- 2026-10-01 06:50 — Owner stopped the 06:03 backup session and confirmed a manual takeover from VS Code (concurrency guard overridden by owner). Phase 1 restarted from scratch (`content-audit/`, `source-images/` were empty).
- 2026-10-01 08:08 — **All phases done.** Nothing is pending in the checklist. Next steps need the owner: answer the TODOs above, choose a direction (V3 is built out; V1/V2 stay at `/variants/1–2/`), then EN/HU and deployment.
- Gotchas: content lives in `src/content/*.json` (zod-validated, every block needs an aquarea.sk `source`). `Photo` moves `col-span`/`row-span` classes onto `<picture>` automatically. Big Shoulders caps need leading ≥ 0,92 and no `truncate` (it clips Č/Š/Ž). Use `price()`/`priceShort()` for euros (non-breaking spaces). Screenshots: `npm run preview` then `npm run shots -- http://localhost:4321 screenshots/x /path/`; a11y: `node scripts/a11y.mjs http://localhost:4321 /path/`.

## Morning report
_2026-10-01, written for the owner._

**What was built**
- **Content audit** of the current aquarea.sk (`content-audit/`): 53 Slovak pages + the operating rules and site map PDFs, one Markdown file per page with its source URL; EN/HU coverage (`LANGUAGES.md`); `SITEMAP.md` with the page tree, all 7 booking flows (6 CMS forms + Previo), external links (1 dead), 20 content problems and a simpler new IA (11 pages, 5 menu items + Rezervovať).
- **361 real photos** downloaded with sources (`source-images/SOURCES.md`); 54 of them used on the site.
- **Three homepage directions** at `/variants/1/` (Ponor), `/variants/2/` (Deň pri vode), `/variants/3/` (Náramok), with a picker at `/variants/`.
- **The full site in direction 3 · Náramok:** `/`, `/plazova-zona/`, `/premium-zona/`, `/potapanie/`, `/cennik/`, `/otvaracie-hodiny/`, `/rezervacie/`, `/kontakt/`, `/fotofilmfest/`, `/galeria/`, `/o-nas/`, 404. Slovak only, `noindex`, mobile-first, with a sticky Zavolať / Rezervovať / Navigovať bar on phones and today's open/closed status computed in the browser.

**How to run it**
```sh
npm install
npm run dev        # http://localhost:4321  (the picker is at /variants/)
npm run build && npm run preview   # production build
```

**Which direction was picked, and why:** 3 · Náramok. The zones are colour-coded wristbands (the area really uses zone wristbands), with the price visible on each band, a season board and big signage prices. On a 375 px phone it shows the first price soonest (1 170 px vs 1 768 / 2 022) and is the shortest page. Lighthouse mobile scored 98 vs 89 (V1) and 66 (V2). The zone colours also carry the inner pages (pláž teal, pobyt green, potápanie blue, FotoFilmFest/Event red). V1's real depth chart of the underwater attractions moved to `/potapanie/`. Details and numbers are in DECISIONS.md.

**Quality:** build passes; Lighthouse mobile across all 11 pages: performance 96–100, accessibility 100, best practices 100 (SEO 69 only because of the deliberate `noindex`). axe-core: 0 violations. No broken links. Every effect has a reduced-motion fallback.

**Images:** all photos are real, from aquarea.sk (© AQUAREA s.r.o.). The only generated image is one abstract caustics texture, used only in variant 1. The OG image is the real drone photo + logo.

**Budget used:** 21st `get_component` 2 / 2 on 2026-10-01 (adapted, not copied); Gemini 1 / 8 images; Magic UI (free) for the marquee and light rays, ported to zero-JS components.

**Open TODOs:** 15. See "TODOs for the owner" above; the most important are the FotoFilmFest 2027 date, the 2027 opening hours and which way of booking a stay should be the main one.

**Not done, on purpose:** no push, no remote, no deployment (the GitHub Pages workflow exists but is manual-only), no EN/HU translation, no new booking backend.
