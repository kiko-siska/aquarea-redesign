# Progress

- **Status:** RUNNING  <!-- NOT_STARTED | RUNNING | PAUSED | DONE -->
- **Last updated:** 2026-10-06 22:59
- **Current phase:** 8

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
- [x] Design system for V4 + V5: fonts (Slovak glyph check), palettes, motion plan → DECISIONS.md — V4 Syne + Geist, V5 Anybody + Hanken Grotesk; section→scene map; skill overrides logged
- [x] Page-scoped dependencies (gsap 3.15, three 0.186, lenis 1.3, 4 fontsource packages); nothing in shared layouts
- [x] Textures: ≤ 3 Gemini images (abstract only), logged below — 1 used (V5 film dust)
- [x] V4 · Čierna voda at `/variants/4/` (WebGL water + torch, ripples, marine snow, SplitText H1, all sections) — three.js shader + Points, torch heat on text, gallery lamps, light-off/on scene cuts, magnetic CTAs, torch cursor; `scripts/motion-shots.mjs`: WebGL on (SwiftShader), 0 console errors, no overflow 375–1440, loop pauses off-screen + hidden
- [x] V5 · Titulky at `/variants/5/` (leader countdown, scenes, kinetic type, timecode, Flip reel, credits, film clock, clapperboard, route) — 8 scenes with iris / blinds / hard-cut wipes switching the page grade, Anybody width-axis scrubs, SVG duotone+halftone, film dust (Gemini) + grain; `scripts/scene-shots.mjs` per-scene captures, 0 console errors
- [x] Picker `/variants/`: V4 + V5 with summary, palette, type, signature effect, desktop + mobile thumbnails — `scripts/picker-thumbs.mjs <url> 4 5` (V1–V3 PNGs untouched); picker still axe 0
- [x] Verify 375 + 1440: scroll 0/25/50/75/100 % + hover/touch states → `screenshots/phase4/`; console, overflow, build — `scripts/motion-shots.mjs` (+ hover, click, tap, drag) and `scripts/scene-shots.mjs` (one shot per scene/section → `screenshots/phase4/scenes/`); 0 console errors; no overflow 375–1440; WebGL on (SwiftShader); loop pauses off-screen + hidden; Slovak glyphs checked on the built pages; three/gsap/lenis chunks referenced only by /variants/4–5; noindex on both, not in sitemap; V4 without WebGL → `data-gl=off`, poster visible, 0 frames, no errors (`variants-4-*-nogl.jpg`); V4 context loss → poster, loop stops; V5 leader plays to the end on its own (removed, title visible, scroll works) and a real wheel skips it (`variants-5-*-leader.jpg`); `git diff 5020329` over V1–V3, shared components, layouts, lib, content, global/v3 CSS and site pages is empty; V3, V4, V5 each carry the same 4 visible TODOs
- [x] DECISIONS.md: entry per variant + "best wow / best for the mission / what V4–V5 need to ship"; PROGRESS handoff — best wow V4, best for the mission still V3 (recommendation unchanged)

### Phase 5 — V6 "Čistá voda", the usable one (`/variants/6/`)
_Owner brief 2026-10-02. V6 is **not** waived: AGENTS.md rule 7 in full (WCAG AA, focus, Slovak alt, reduced motion for every effect, Lighthouse mobile perf ≥ 90 and a11y ≥ 90, axe 0). Native scroll only, progressive enhancement, effects are seasoning. V1–V5 and the site stay untouched._
- [x] Design system: concept, fonts (Slovak glyph check), palette from real objects, motion budget → DECISIONS.md — Bricolage Grotesque + Atkinson Hyperlegible Next; CTA `#C8352A`; all token pairs computed
- [x] Reusable motion module `src/lib/motion/` (reduced-motion helper, reveal, count-up, status dot, flip gallery, water light) + README — also focus-in, ripple, marquee (with pause button), CSS accordion/progress/parallax/live dot
- [x] V6 page at `/variants/6/`: same content, sections and TODOs; five-second test at 375 px — static baseline (no effects): Lighthouse mobile 94 / 100 / 100 (median of 3), CLS 0.001, axe 0 (normal + reduced), JS-off complete, five-second test passes (`screenshots/phase5/baseline/`)
- [x] Hero signature: calm water light over the hero photo (after LCP, poster first, DPR ≤ 1.5, pauses off-screen/hidden, WebGL fallback, gentle ripple) — `scripts/v6-interactions.mjs`: 48 frames/0.8 s on screen, 0 off-screen, 0 hidden; reduced = still frame; no WebGL = photo only
- [x] Micro-interactions: buttons, cards (lift, zoom, clip-path ripple), link underline, live status dot, count-up, accordions, marquee, scroll progress, Flip gallery + lightbox, SplitText H1, one parallax — gallery filter announces the count, lightbox returns focus, marquee pause button (`aria-pressed`), live dot shown on a simulated July date
- [x] Verify: Lighthouse mobile (perf, a11y, best practices), axe 0, CLS, JS weight, five-second screenshot, 0/25/50/75/100 % + hover + focus, reduced-motion pass, 0 console errors, no overflow → `screenshots/phase5/` — Lighthouse 94 / 100 / 100 (3 of 3 runs on the final build), CLS 0.001, axe 0 (normal + reduced, 375 + 1440; also `node scripts/a11y.mjs`: 0), contrast 19/19 pairs (`v6-contrast.mjs`), glyphs on the built page (`glyph-check.mjs`), DPR 1.5 on a 3× phone, live reduced-motion switch, JS ≈ 4 KB + 42 KB after load + 2.8 KB idle, 0 console errors, no overflow 320–1440, JS-off complete (`scripts/v6-checks.mjs`, `v6-interactions.mjs`, `v6-a11y-audit.mjs`)
- [x] design:accessibility-review + design:design-critique on the finished page; fix findings — water-light pause button, live dot < 5 s, 44 px targets, deep Dive band, shorter price labels
- [x] Picker: V6 with summary, palette, type, effect, thumbnails; noindex; out of sitemap — picker axe 0; V1–V5 thumbnails untouched
- [x] DECISIONS.md: V6 entry + V3 vs V6 table + recommendation for `/` (do not replace `/`); PROGRESS handoff — recommends V6 for `/` with an inner-page follow-up; `/` unchanged

### Phase 6 — V7 "Rýchla voda": bold, sporty, still fully usable (`/variants/7/`)
_Owner brief 2026-10-03. NOT waived: V6's bar in full (WCAG AA, reduced motion, Lighthouse ≥ 90, axe 0, JS-off usable, native scroll, pause control, one animation per viewport). Palette from the logo. AGENTS.md rule 5 exception for ONE illustrated diver mascot (V7 only; Gemini ≤ 3 new images). The reference URL in the brief is still a placeholder → interpreted as the fallback style. V1–V6 and the site stay untouched._
- [x] Step 1: AGENTS.md rule 5 exception, committed on its own
- [x] Design system: concept, logo-sampled palette + derived blue + contrast table, fonts (Slovak glyphs), diver rig plan → DECISIONS.md — Barlow Condensed + Barlow; deep blue #006B99 / tint #F0FAFF derived at hue 198°; `scripts/v7-contrast.mjs` (24 pairs)
- [x] Gemini concept art of the diver (≤ 2 images, flat vector, logged below)
- [x] Diver rig: hand-built layered SVG (≤ 30 KB), pivots, kick cycle, interaction, static pose — 4.2 KB; ticker-driven sine rig (no jumps on start/pause); `screenshots/phase6/v7-1440-diver-kick-1..4.jpg`
- [x] Procedural water: SVG wave layers, caustic bands, surface line, ≤ 12 bubbles, pointer ripple, pause control
- [x] V7 page `/variants/7/`: hero (diver + solid angled panel), all sections, bold bands, five-second test at 375 px
- [x] Reuse V6 motion kit; diver reappears once static + hover kick in Dive Center
- [x] Verify: Lighthouse mobile ×3, axe, `scripts/a11y.mjs`, CLS, JS weight, five-second screenshot, diver poses, hover/focus/touch, reduced motion, pause button, JS-off → `screenshots/phase6/` — Lighthouse 99 / 100 / 100 ×3 (LCP 1.7–1.8 s, CLS 0.003, TBT 0), axe 0 (normal + reduced, 375 + 1440), `a11y.mjs` 0, five-second test passes, JS ≈ 4.5 KB + 44 KB after load, 0 console errors, no overflow 320–1440 (also with WCAG text spacing), JS-off complete, pause/off-screen/hidden/reduced/live-switch verified (`scripts/v7-checks.mjs`, `v7-interactions.mjs`, `v7-a11y-audit.mjs`)
- [x] design:accessibility-review + design:design-critique; fix findings
- [x] Picker: V7 with summary, palette, type, effect, thumbnails; noindex; out of sitemap
- [x] DECISIONS.md: V7 entry + V3 vs V6 vs V7 table + recommendation for `/` (do not replace `/`); PROGRESS handoff

### Phase 6b — V7 hero revision (owner request 2026-10-03)
_Owner: the diver must be a real-looking person (rule 5 waived for V7, 2nd exception), it must visibly move, and the hero water must be a real aerial (drone) photo. Everything else in V7 stays._
- [x] Second AGENTS.md exception, committed on its own
- [x] Gemini: one photoreal generic diver (green-screen background), cut-out, logged
- [x] Hero: real drone photo as the water, diver cut-out on top, layered motion (pitch, kick of the legs layer, bob, drift, bubbles), pause + reduced motion
- [x] Dive Center section reuses the cut-out; remove the old SVG diver
- [x] Re-verify (Lighthouse ×3, axe, five-second test, motion proof frames, reduced motion, JS-off) + docs + picker thumbnails — Lighthouse 96–98 / 100 / 100 (5 runs), LCP 2.3–2.5 s; legs ±13° kick proven in frames; play button under reduced motion

### Phase 7 — two branches of V7's landing: V8 aerial, V9 dark diver (owner request 2026-10-03)
_V8 `/variants/8/` = V7 without the diver: only the real aerial photo, AI-extended to fit the frame on desktop. V9 `/variants/9/` = only the diver with a V4-style torch-in-dark-water effect. AI placeholder photos allowed (third rule-5 exception), each with a visible TODO. Same bar as V6/V7 (not waived). V1–V7 untouched. Ends with an owner-facing comparison._
- [x] Third AGENTS.md rule-5 exception, committed on its own
- [x] AI images: extended aerial (V8), dark underwater background (V9); logged (Gemini 6 / 8)
- [x] V8 page: aerial hero (real photo on phones, AI-extended on desktop), slow drone drift with pause, TODO chip
- [x] V9 page: dark water, torch cone (pointer / touch / idle wander), marine snow, diver kick, pause + reduced motion, TODO chip
- [x] Verify both → `screenshots/phase7/` — V8 96/100/100, V9 96–99/100/100 (3 runs each), axe 0, `a11y.mjs` 0, five-second test, 320 px reflow, JS-off, pause, reduced motion + play button (`scripts/v89-interactions.mjs`)
- [x] Picker: V8 + V9 with thumbnails; DECISIONS.md entry + owner comparison (fit with the current site, easiest to sell, price ranges, UX); handoff

### Phase 8 — V10 "Mapa z výšky": the real aerial as the map of the place (`/variants/10/`)
_Owner brief 2026-10-06. NOT waived: V6–V9 bar in full (WCAG AA, reduced motion, Lighthouse mobile ≥ 90 / ≥ 90, axe 0, JS-off usable, native scroll, pause control, one animation per viewport). Owner answers: two AI extensions of the real aerial (4:5 + 21:9, visible TODO), Gemini cap 10 for V10 only (fast, ≤ 2K), no diver; palette = the logo (business cards are printed), families first, diving second. V1–V9 and the site stay untouched._
- [x] Step 1: AGENTS.md fifth rule-5 exception (V10 only), committed on its own (005b513)
- [ ] Design system: concept, logo palette + contrast, new font pair (Slovak glyphs), motion budget, pin verification → DECISIONS.md
- [x] AI extensions of the real aerial (4:5 portrait, 21:9 ultra-wide), checked against the original, logged below — 4:5 kept (real pixels pasted back, 1 invented board removed from the AI margin); 21:9 rejected twice (zoom-out + invented houses/lake) → ultra-wide uses the real 3:2 crop. Gemini 10/10
- [x] V10 page: full-bleed aerial hero with verified pins, info dock, sticky curtain + scale, zone photo stops, solid reading surfaces, all sections, nav inside the variant, TODO chips — `src/pages/variants/10/`, `src/components/v10/`, `src/styles/v10.css`
- [ ] Motion: drone drift (pausable, off-screen paused), scroll flight + stop push-ins (gsap ScrollTrigger, matchMedia reduced), play control under reduced motion
- [x] `scripts/v10-photo-contrast.mjs` (real pixels behind every text at 375 + 1440, several scroll/drift/scale states) passes — 662 measurements, 5 viewports
- [ ] Verify: Lighthouse mobile ×3, axe (normal + reduced), `a11y.mjs`, 320 px reflow, JS-off, console, overflow, five-second test 375 × 667 / 812, screenshots 375 / 768 / 1440 / 2560 → `screenshots/phase8/`
- [ ] design:accessibility-review + design:design-critique; fix findings; DPR 2 self-critique
- [ ] Picker: V10 (summary, palette, type, effect, thumbnails); noindex; not in sitemap; nav-check
- [ ] DECISIONS.md: V10 entry, acceptance evidence, V8 vs V10 side-by-side + recommendation; PROGRESS handoff

## Budget log
- 21st `get_component`: (date · component · used for)
  - 2026-10-01 · Horizontal Depth Fade (@unlumen, id 18439) · v1 underwater photo strip (ported to vanilla JS)
  - 2026-10-01 · Filmstrip Gallery (@n1m4mz, id 27093) · v2 day strip + lightbox (adapted)
  - **2026-10-01: 2/2 used.** Next retrieval possible 2026-10-02.
  - 2026-10-02 · Flashlight Text Reveal (@kedhareswer, id 32544) · V4 torch mechanics (eased light toward pointer / roaming path, CSS mask sampled from the shader falloff, context-loss + visibility pause); adapted into vanilla three.js, the mask warms text instead of hiding it
  - **2026-10-02: 1/2 used.** Searches (free): magnetic button, film countdown, torch/spotlight, water ripple shader, film strip gallery, end credits, halftone, iris wipe.
  - **2026-10-03: 0/2 used** (V6 needed no catalogue component).
- Gemini images: 6 / 8 (file · prompt summary)
  - 2026-10-01 · `images/generated/v1-caustics.jpg` (2K, fast) · abstract sunlight caustics on sand through teal water; no objects/place/people · v1 texture overlay (`src/assets/generated/caustics.jpg`, resized)
  - 2026-10-02 · `images/generated/v5-film-dust.jpg` (2K, fast) · abstract 35 mm film dust, hairs and vertical scratches on black; no objects/place/people/text · V5 screen-blended film overlay (`src/assets/generated/v5-film-dust.jpg`, 1600 px greyscale)
  - Phase 4 plan: max 3 new images (owner). Planned: 1 (above). Reserve: 2, only if procedural textures fall short.
  - 2026-10-03 · `images/generated/v7-diver-concept-1.jpg` (2K, balanced) · flat-vector faceless diver concept (black suit, blue stripes, red fins, limbs separated; no logos, no real person) · reference only, rebuilt by hand as the V7 SVG rig (AGENTS.md rule 5 exception for /variants/7/)
  - **Gemini total: 3 / 8** (V7: 1 of max 3 new). Second concept pose not needed.
  - 2026-10-03 · `images/generated/v7-diver-photo-1.jpg` (2K, balanced) · photoreal generic anonymous diver on a green screen (no logos/text/real person), keyed + mirrored into `src/assets/generated/v7-diver.webp`; AGENTS.md second rule-5 exception for /variants/7/
  - **Gemini total: 4 / 8** (V7: 2 of max 3 new).
  - 2026-10-03 · `images/generated/v8-aerial-extended.jpg` (2K, balanced, image edit of the real hero drone photo) · AI-extended to a square frame (more fields/sky above, meadow below); no new buildings/people; PLACEHOLDER, visible TODO · V8 desktop hero (`src/assets/generated/`)
  - 2026-10-03 · `images/generated/v9-underwater-dark.jpg` (2K, balanced) · photoreal dark underwater lake scene, light shafts, silty bottom, branches; no people/fish/objects/text · V9 hero + Dive tile background; PLACEHOLDER, visible TODO
  - **Gemini total: 6 / 8.**
  - **Phase 8 (V10, AGENTS.md fifth rule-5 exception, cap 10 for V10 only, `fast`, 2K):** method = outpaint a canvas that holds the real photo (`scripts/v10-outpaint.mjs canvas`), then paste the REAL pixels back over the middle with a 60 px feather and a colour match (`composite`), so every building, roof, road and shoreline stays the real photo; only the margins are AI.
    - 2026-10-06 22:08 · first call failed upstream ("fetch failed", 7 MB PNG input): no image returned, not counted. Inputs are now ~0.6 MB JPEGs.
    - 2026-10-06 22:09 · #7 `images/generated/rejected/v10-aerial-portrait-ai.jpg` (4:5, 1856×2304) · "Extend this aerial drone photograph to a portrait 4:5 frame … only continue fields, meadow, tree lines and horizon …" · **REJECTED**: invented a second lake above the real horizon and redrew the horizon.
    - 2026-10-06 22:10 · #8 `images/generated/v10-aerial-portrait-ai-2.jpg` (4:5, 1856×2304) · "Outpaint … fill the grey areas only … ABOVE: only sky … BELOW: meadow, grass, bushes and the existing dirt path … no water, no buildings …" · **KEPT** → `src/assets/generated/v10-aerial-portrait.jpg` (2000×2483; real photo pasted back at 0,575, match SAD 3.5). One invented object in the AI margin (a small blue/white board under a tree, ~80×40 px, 90 px below the real photo) was removed with a deterministic clone of the neighbouring AI grass (`patch`, refuses to touch the real area). The AI margins also add a crop field and farm tracks below the real photo (field-type continuation, accepted).
    - 2026-10-06 22:12 · #9 `images/generated/rejected/v10-aerial-wide-ai.jpg` (21:9, 3168×1344) · "Outpaint … left and right only … do not continue the camping row … no water …" · **REJECTED**: zoomed out and recomposed the scene (match SAD 52), invented a second lake with a jetty, a house, cars and a tractor.
    - 2026-10-06 22:13 · #10 `images/generated/rejected/v10-aerial-wide-ai-2.jpg` (21:9) · same + "do not zoom out, do not change the scale" · **REJECTED**: zoomed out again (SAD 46), invented a cluster of red-roofed houses on the left.
    - **Gemini total: 10 / 10 (V10 cap reached).** Result: the 4:5 portrait extension is used on phones (visible TODO chip). No 21:9 extension: ultra-wide screens use the real 3:2 photo cropped in height (no AI, no chip).
  - Phase 5: 0 used. Note: the owner's Phase 5 brief says "4/8 used"; this log shows 2/8. The stricter cap (1 more) was followed; none needed (the water light is procedural).

## Blockers
- 2026-10-01 (VS Code session): the built-in browser MCP (`mcp__Claude_Browser__*`) and `.claude/launch.json` preview are not available here. **Workaround:** screenshots and checks via Playwright (`playwright-core`) driving the installed Google Chrome (`scripts/screenshot.mjs`). The 21st, magicui and nano-banana MCPs are available.

- 2026-10-02 (Phase 4): `astro preview` on :4321 collided with another process already listening there (an `astro dev` server not started by this session, left running). Phase 4 checks ran against the production preview on **:4322**. The built-in browser MCP is still unavailable → Playwright + installed Chrome (WebGL via SwiftShader: `--enable-unsafe-swiftshader --use-angle=swiftshader`).

- 2026-10-03 (Phase 5): with the Mac's display asleep, headless Chrome screenshots stall when SwiftShader is forced on a 2× mobile context (`CVDisplayLinkCreateWithCGDisplay failed`). `scripts/v6-checks.mjs` therefore runs without SwiftShader unless `WEBGL=1`, and every screenshot has a 15 s timeout. Playwright's `addStyleTag` hangs with JS disabled (it waits for a style onload), so the JS-off pass skips it.

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
- 2026-10-02 22:25 — **Phase 4 done.** Two motion-led directions added: `/variants/4/` Čierna voda (WebGL lake at night + dive torch) and `/variants/5/` Titulky (film title sequence). Both in the picker. A11y/Lighthouse waived for these two only (AGENTS.md rule 7 exception); hardening list in DECISIONS.md and owner TODO 16. Recommendation stays **V3**.
  - Run: `npm run build && npx astro preview --port 4322`, then `node scripts/motion-shots.mjs http://localhost:4322 screenshots/phase4 /variants/4/ /variants/5/` and `node scripts/scene-shots.mjs http://localhost:4322 screenshots/phase4/scenes /variants/5/ "section[data-v5-scene]"`. Picker thumbs: `node scripts/picker-thumbs.mjs http://localhost:4322 4 5`.
  - Gotchas: page CSS (`v4.css`, `v5.css`) is bundled *before* Tailwind → it declares the layer order and lives in `@layer components`. Load fonts explicitly (`document.fonts.load`) before measuring/splitting. V5: `<html>` also has `data-v5-scene` (scope selectors to `section[...]`); fitted words are measured on an offscreen clone. `?leader=0` skips V5's leader. Debug hooks: `window.__v4.frames`, `window.__v5.scene()`, `window.lenis`.
- 2026-10-03 09:35 — **Phase 5 done.** `/variants/6/` Čistá voda: the non-waived, usable direction (Lighthouse 94/100/100, axe 0, CLS 0.001, five-second test passes, works without JS). Reusable motion blocks in `src/lib/motion/` (README). DECISIONS.md recommends V6 for `/` together with a follow-up that moves the inner pages to V6's tokens; `/` is unchanged until the owner decides.
  - Run checks: `npm run build && npx astro preview --port 4322`, then `node scripts/v6-checks.mjs http://localhost:4322`, `node scripts/v6-interactions.mjs http://localhost:4322`, `node scripts/v6-a11y-audit.mjs http://localhost:4322`; Lighthouse: `npx lighthouse http://localhost:4322/variants/6/ --only-categories=performance,accessibility,best-practices`.
  - Gotchas: StatusScript replaces a short text with a long one after load, so in the hero only the one-line status is shown (the detail lives in the hours section) to keep CLS at 0.001; gsap loads after `load` so it never competes with the LCP photo; the focus-in skips itself if it can't start within ~1.8 s.
- 2026-10-03 10:27 — **Phase 6 done.** `/variants/7/` Rýchla voda (logo palette, rigged SVG diver + procedural water hero, bold angled bands; NOT waived: Lighthouse 99/100/100, axe 0). DECISIONS.md recommends V7 for `/` (V6 as the calmer fallback) with an inner-page follow-up; `/` is unchanged. The brief's reference URL was still a placeholder (fallback style used).
  - Run checks: `npm run build && npx astro preview --port 4322`, then `node scripts/v7-checks.mjs http://localhost:4322`, `node scripts/v7-interactions.mjs http://localhost:4322`, `node scripts/v7-a11y-audit.mjs http://localhost:4322`, `node scripts/v7-contrast.mjs`, `node scripts/glyph-check.mjs <url> '<font>'`.
  - Gotchas: the diver's parts are rotated by one `gsap.ticker` callback (`diver.ts`), not keyframe tweens, so start/pause never jump; the wave periods must divide 1600 for a seamless loop; decorative pooled elements need a `display: none` guard until JS is live; Playwright `addStyleTag` hangs with JS disabled.
- 2026-10-03 12:15 — **Phase 7 done.** `/variants/8/` (aerial only: real photo on phones, AI-extended square on desktop) and `/variants/9/` (dark water + torch + diver). Both in the picker, noindex, 5 visible TODOs each (incl. the AI-image TODO). Gemini 6/8 used. The owner comparison (fit with the current site, easiest to sell, price ranges, UX) is at the end of DECISIONS.md.
  - Run checks: `npx astro preview --port 4322`, then `node scripts/v89-interactions.mjs http://localhost:4322`, `node scripts/v8-checks.mjs …` / `v9-checks.mjs …`, `node scripts/v8-a11y-audit.mjs …`.
  - Gotchas: Gemini image edit re-renders the whole frame (V8's extended aerial is a placeholder, not the original pixels); `torch.ts` is driven by the stage attributes `data-live / data-paused / data-offscreen` that `main.ts` sets, so any new hero variant gets pausing and reduced motion for free.
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
