# Decisions

Newest at the bottom. For each entry: date/time · decision · why · alternatives considered. Decisions taken by an agent while the owner was away are marked **[auto]**.

## Owner decisions (2026-09-30, before the overnight run)

- **Stack:** Astro + Tailwind + React islands, so 21st.dev / Magic UI / Aceternity components can be used directly and the site still deploys statically to GitHub Pages.
- **Languages:** Slovak only for now, with an i18n-ready structure. EN/HU come later.
- **21st.dev:** connected. Search freely, max 2 `get_component` per day, never `generate`.
- **AI images:** up to 8 Gemini images, fast quality, 1K–2K, atmosphere only. Real aquarea.sk photos come first.
- **Publishing:** none. Local git commits only, `noindex` until Aquarea approves.
- **Unattended:** after these answers, agents never ask. They choose the recommended option and log it here.
- **Design flow:** build 3 homepage directions + a picker, auto-pick the recommended one, build the full site in it, and keep all 3 for the owner to compare.

## Agent decisions

<!-- [auto] entries go below -->

### 2026-10-01 07:05 · [auto] Design-system generator output, used as input only
- Ran `ui-ux-pro-max --design-system` for "lake recreation area beach diving center camping" and "travel tourism resort outdoor summer" (dials variance 7, motion 6, density 3).
- **Kept:** the *Scroll-Triggered Storytelling* pattern (chapters, a progress indicator, everything readable without the effect, a static final state under reduced motion); CTA in the hero, sticky on mobile, and at the bottom; an orange-red accent against water blues; editorial serif + clean sans; condensed display for a bold/sporty look; the checklist (contrast ≥ 4.5:1, 44 px targets, SVG icons instead of emoji, 375/768/1024/1440).
- **Rejected:** trust-blue `#2563EB` SaaS palette, "Aurora UI" mesh gradients (a templated look the brief forbids), the Noto Sans Thai pairing (wrong market). Outfit/Work Sans are too generic.
- Why: the generator has no lake/diving-specific profile. The real place (drone photos, red roofs and parasols, yellow loungers, wheat fields, the underwater attraction map) is the stronger source.

### 2026-10-01 07:07 · [auto] Three homepage directions
All three use the same real content (src/content), the same IA (content-audit/SITEMAP.md §7) and the same sections: hero · zones as entry points · today's status + hours · prices teaser · FotoFilmFest · gallery teaser · how to get there · booking/contact CTA · sticky mobile bar (Zavolať / Rezervovať / Navigovať).

**1 · Ponor: from the surface to −36 m** (`/variants/1/`)
The page is a dive. You start on the surface (top-down drone shot of turquoise shallows) and every section sits one depth lower. A depth gauge on the left (a thin top bar on mobile) ticks down and names the **real attractions** you pass: −5 m výcviková plošina, −8 m autobus, −13 m električka, −15 m plachetnica Danka, −30 m hlboká plošina (from the Dive Center's own map). The background darkens with scroll from surface light to deep green-blue (CSS scroll-driven animation; static section colours where unsupported or with reduced motion). In the Dive Center chapter, Magic UI light rays fall from above. Mood: calm, cool, a bit technical, like a dive computer. Palette: hladina `#DDF3F1`, tyrkys `#1FA7A6`, jazero `#0F6E86`, hĺbka `#0A3F52`, dno `#06232E`, slnko `#F4C542` (the yellow loungers by the dive center) for CTAs on dark. Type: **Archivo** variable, one family, with width as the contrast: expanded heavy cuts for depth numbers and headings, normal width for text. Full latin-ext (ľ ĺ ŕ ô ä ď ť ň).

**2 · Deň pri vode: a sunlit summer magazine** (`/variants/2/`)
An editorial look on bright white paper with lake-blue ink instead of black. Large serif headlines sit on white, never over the photo. Big real photos follow with italic captions, and the layout is left-aligned and asymmetric. Signature: **"Od rána do západu slnka"**, a horizontal, snap-scrolling strip of real photos through a day at the lake (morning jetty → noon beach → afternoon dive → sunset), next to the real main-season hours (Po–Pi 10:00–20:00, So–Ne 9:00–20:00). The prices teaser is set like a magazine price box. Palette: papier `#FFFFFF`, atrament `#123E5C`, obloha `#DCEEF7`, pšenica `#E2B547` (fields around the lake), slnečník `#C8102E` (the red parasols) for CTAs, tráva `#2F6B3A`. Type: **Newsreader** (display + italic captions, optical sizes) + **Instrument Sans** for UI, tables and buttons.

**3 · Náramok: bold resort wayfinding** (`/variants/3/`)
Loud, sporty and colour-coded like on-site signage. Each zone gets a colour, and the zones appear as three wide **wristband** bands (the area really works with zone wristbands, per the Prevádzkový poriadok §4–5): Plážová zóna, Prémium zóna, Dive Center. Tapping a band opens what's there, the price from, and the booking button. Big condensed numerals carry the key facts (9 € / deň, 90 € skúšobný ponor, 590 € kurz OWD). A Magic UI marquee runs the partner/certification logos (TDI, SDI, ERDI…). Palette: biela `#FFFFFF`, atrament `#10212B`, pláž `#00A3A3`, prémium `#2E7D32`, dive `#0B4F8A`, event `#D62828`, slnko `#FFC93C`. Type: **Big Shoulders Display** (Chicago-signage condensed, 800–900) + **Figtree** for text.

Checked against generic defaults: no cream + terracotta, no near-black + acid accent, no all-caps eyebrows above every heading, no mono labels, no "→" on buttons, no identical rounded-card grid, no centred text over a stock-style photo. The accents come from objects actually on site (loungers, parasols, roofs, fields).

### 2026-10-01 07:07 · [auto] Image plan: real photos first, Gemini almost unused
- 361 real photos exist (incl. underwater). Gemini is only for textures: planned **1–2 images** (an underwater caustics texture for variant 1; an optional abstract sun-glare-on-water divider). Budget max 8.
- The OG image is composed from the real hero drone photo + logo (sharp), not generated.

### 2026-10-01 07:21 · [auto] Component shortlist (Phase 2)
| Component | Source | Where | Decision |
|---|---|---|---|
| Light Rays | Magic UI `light-rays` (free) | v1 Dive Center chapter: sunlight falling into the water | use (React island, `client:visible`, static gradient under reduced motion) |
| Marquee | Magic UI `marquee` (free) | v3 partner/certification logos (TDI, SDI, ERDI…) | use; under reduced motion it's a static wrapped row |
| Horizontal Depth Fade | 21st.dev @unlumen, id 18439 · https://21st.dev/@unlumen/components/horizontal-depth-fade | v1 underwater photo strip: centred photo sharp, the rest blurred/dim like underwater visibility | **retrieved** (1/2 today). The original needs GSAP + CSS background images; ported to ~60 lines of vanilla JS with real `<picture>` images. Under reduced motion it's a plain snap-scroll row. |
| Filmstrip Gallery | 21st.dev @n1m4mz, id 27093 · https://21st.dev/@n1m4mz/components/filmstrip-gallery | v2 "Od rána do západu slnka" day strip + native `<dialog>` lightbox | **retrieved** (2/2 today). Kept the mechanics (scroll-snap gate, arrow keys, live announcement, dialog lightbox, reduced-motion). Dropped the film-negative look, mono edge printing and sprockets; Slovak labels; responsive sources. |
| Masonry Lightbox | 21st.dev @ayushmxxn, id 26223 | Phase 3 Galéria page | candidate for a later day's budget; may build it natively with `<dialog>` instead |
| Scroll Progress | Magic UI `scroll-progress` / 21st variants | v1 depth gauge | not needed: the depth gauge is custom (it shows real attraction depths) |
| Aceternity UI | — | — | not used: everything needed is covered above with less JS |

### 2026-10-01 07:21 · [auto] Image shot list (Gemini, max 8 total)
1. **v1 caustics texture**: seamless abstract sunlight caustics on pale sand seen through teal water. No objects, fish or people. 16:9, 2K, fast. Used as a low-opacity overlay at the surface → shallow transition. *(planned)*
2. *(reserve)* abstract sun-glare-on-water divider for v2, only if the real photos don't cover it.
Everything else uses real aquarea.sk photos. The OG image was composed from the real drone photo + logo (`scripts/make-og.mjs`), with 0 Gemini credits.

### 2026-10-01 07:44 · [auto] Recommended direction: **3 · Náramok**
**Why:** the deciding criterion is the mission in AGENTS.md: on a phone, understand in seconds what Aquarea is, what it costs, when it's open and how to book. Measured at 375 px and with Lighthouse mobile against the preview build:

| | 1 Ponor | 2 Deň pri vode | 3 Náramok |
|---|---|---|---|
| Page height (375 px) | 14 457 px | 11 953 px | **9 354 px** |
| First price on the page | 1 768 px | 2 022 px | **1 170 px** |
| Today's status | 484 px | 470 px | 687 px |
| Lighthouse performance (mobile) | 89 (LCP 3,5 s) | 66 (LCP 7,5 s) | **98 (LCP 2,3 s)** |
| Accessibility / best practices | 100 / 100 | 100 / 100 | 100 / 100 |
| JS on the page | gauge + strip engine | React island | status + menu only (zones are native `<details>`) |

Also: V3's zone colours give every inner page an obvious theme (Pláž teal, Pobyt green, Potápanie blue, FotoFilmFest/Event red), so the system carries the 11-page IA. V1's signature mostly lives on the homepage and Potápanie.
**Alternatives:** V1 Ponor is the most atmospheric. It's the runner-up, and its best asset (the real 37-attraction depth chart) moves into V3's `/potapanie/` page in dive blue. V2 is the most elegant for long text, but it's heavy (LCP 7,5 s) and less scannable.
**Carried into Phase 3:** show the price on closed wristbands on mobile; `.v3-display` leading ≥ 0,92 (Slovak carons on capitals); dark ink on pláž teal (white fails contrast); colour the cenník sections by zone.
All three variants stay at `/variants/1–3/` so the owner can switch.

### 2026-10-01 08:08 · [auto] Phase 3 build decisions
- **URLs follow the new IA** (`/plazova-zona/`, `/premium-zona/`, `/potapanie/`, `/cennik/`, `/otvaracie-hodiny/`, `/rezervacie/`, `/kontakt/`, `/fotofilmfest/`, `/galeria/`, `/o-nas/`). The old aquarea.sk URLs need redirects at launch (map in content-audit/SITEMAP.md §7). *Alternative:* keep the old slugs (`/plazova-zona-2/`…). Rejected, because they're CMS artefacts.
- **Booking stays on aquarea.sk.** Every "Rezervovať" goes to the live Previo engine or the live CMS forms (no fake forms, AGENTS.md rule 2). The `/rezervacie/` hub explains each option. Previo is shown first for stays because it's the only instant online flow; the owner decides (TODO).
- **Event zóna is booked by phone or e-mail.** aquarea.sk has no form for it (TODO).
- **Google map loads only on click** (`/kontakt/`). No third-party request or cookies before consent, and it keeps Lighthouse high. The illustrated area map is shown as a real image.
- **The gallery is native** (`<dialog>` + filter chips, ~60 lines of JS), not a 21st component. The daily 21st quota was used up, and native code is lighter.
- **No Event JSON-LD for FotoFilmFest** until the date is confirmed. The visible TODO stays.
- **Kept V1's real depth chart** (32 attractions with depths from the Dive Center map) on `/potapanie/`, in dive blue.
- **Season 2026 is over.** The site shows today's status computed in the browser ("Areál je zatvorený…" in October), plus the 2026 tables and a TODO for 2027.
- **robots.txt disallow + `noindex, nofollow`.** Lighthouse SEO is therefore 69 (only "page is blocked from indexing" fails). This is intentional until Aquarea approves.

## Phase 4 (owner brief 2026-10-02): two bold motion directions

### 2026-10-02 21:16 · Owner waivers for V4 and V5 (owner decision, logged by agent)
- **Accessibility waived** for `/variants/4/` and `/variants/5/` only: no WCAG, contrast, axe or Lighthouse-a11y work, and no a11y skill or checklist is run on them. The design isn't softened to pass them. Recorded in AGENTS.md rule 7 as a scoped exception (commit 33effb8).
- **Lighthouse targets waived** for the same two pages. Replacement bar set by the owner: `npm run build` passes, zero console errors, no horizontal overflow at 375 px, devicePixelRatio capped at 1.5–2, render loops pause when off-screen, and a static poster fallback if WebGL fails.
- **Scope:** V1–V3, the picker's existing entries and the full site are untouched. Heavy libraries (gsap, three, lenis) load only on these two pages, via dynamic import inside page scripts, never from `Base.astro`, `Site.astro` or `global.css`.
- **Still binding:** facts only (all content from `src/content`), Slovak copy, no fake booking, no push/deploy, `noindex`, no fake photos of the real place, no secrets, local commits.
- **Consequence:** a hardening pass (a11y + performance) is required before either direction can ship. Added to the owner TODOs in PROGRESS.md.

### 2026-10-02 21:30 · [auto] Phase 4 design system: V4 "Čierna voda" and V5 "Titulky"
**Inputs.** Lead skill: design-taste-frontend v2 with the owner's fixed dials (V4 9/10/3, V5 8/10/4). Motion: gsap-core/timeline/scrolltrigger/plugins/performance; V4 also shader-glsl, threejs-animation, particle-system. `ui-ux-pro-max --design-system` was run for both ("night dive torch dark water immersive webgl lake resort", "film title sequence kinetic typography cinematic poster") plus typography/gsap searches.
- **Generator: kept** the "Kinetic Motion" idea (a wide display face carries the motion) and its warning to pin sparingly. That warning is why V5 cuts scenes with triggered wipes on a fixed overlay instead of pinning every scene (only the credits and the reel pin). **Rejected:** Brutalism + light sky-blue palette, Varela Round/Nunito (wrong mood), Inter + Playfair (Inter is banned by the brief), trust-blue `#2563EB`.
- **Skill rules overridden by the owner's brief** (the brief outranks skills): custom cursor (taste skill bans it; V4 needs a torch cursor), reduced-motion and dual-theme requirements (a11y waived), "no section numbering" (V5's "SCÉNA 0X" is the concept; it lives in the HUD slate and in the transition card, never as a small-caps eyebrow above each H2). The skill's en-dash ban is **not** applied to `src/content` strings (Slovak typography uses "–" in ranges; content stays as audited). New copy written for V4/V5 avoids em-dashes.

**Same 9 sections in both pages** (fair comparison with V1–V3):

| Required section | V4 Čierna voda | V5 Titulky |
|---|---|---|
| Hero | H1 surfaces letter by letter, torch clicks on over the hero photo | S01 Titulok: 3-2-1 leader → title card, AQUAREA / Čierna Voda collide on scroll |
| 3 zones as entry points | three zone rows; hovering/tapping one swaps the photo in the beam | S02: PLÁŽ / POBYT / POTÁPANIE slide in from both sides and collide (width axis scrub) |
| Status + hours | live status, 2026 season strip, main-season hours, last entry | S03: film clock (24 h dial, main-season arcs, scrubbed hand) + season frames |
| Prices teaser | big numerals that catch the torch light | S04: rolling end credits (pinned) |
| FotoFilmFest | date + visible TODO, beam on the pipe photo | S05: clapperboard snaps shut, slate fields with real data + TODO |
| Gallery teaser | photos lit only where the torch falls (dim at rest) | S06: pinned horizontal reel, Flip projects a frame full screen in real colour |
| How to get there | GPS read-out, address, parking, Navigovať | S07: route drawn on scroll to the real GPS pin on a lat/lng graticule, labelled schematic |
| Booking/contact CTA | 5 real booking flows + phones | S08: 5 real flows as a kinetic list + phones |
| Sticky mobile bar | shared `StickyCta` (Zavolať / Rezervovať / Navigovať) | same |

**V4 · Čierna voda** (the lake at night, you hold a dive torch)
- **Concept:** one fixed full-viewport WebGL water surface (three.js, one fullscreen fragment shader + a Points layer). Domain-warped ripples, caustics and specular glints; pointer/touch drops ripples (8-slot ring buffer). The torch cone reveals real underwater photos through a refraction shader; they come to life only in the beam. DOM text sits on top and stays readable at rest; the beam only warms it (per-letter heat on the H1, per-word on headings). Idle beam wanders on a Lissajous path (always on touch until you drag). Each section switches the photo with a hard light-off / light-on click.
- **Palette:** atrament `#05070B` (blue-black, deliberately not V1's green-teal `#06232E`), hĺbka `#0A1018`, tieň `#131C29`, studená `#8796AA` (secondary text), hmla `#D6DEE8` (body text), baterka `#FFF1D6` (warm torch white, light only), **bója `#FF5A1F`** (surface-marker-buoy orange, the one accent, CTAs only; not acid green/lime). Status dots are re-coloured in V4 scope so orange stays CTA-only.
- **Type:** **Syne** (display, 700–800: wide, slightly eccentric letterforms that read like something emerging; Slovak carons render at all weights) + **Geist** (text: neutral, technical, tabular figures for prices and GPS, so it reads like an instrument without mono labels). Glyph check ľ ĺ ŕ ô ä ď ť ň Č Š Ž passed programmatically in Chrome.
- **Libraries (V4 page only, dynamic import):** three, gsap (+ScrollTrigger, SplitText), lenis.
- **Reused:** `StickyCta`, `StatusScript`, `Todo`, `Icon`, `Photo`, `islandPhoto`-style resized WebP URLs for textures; the 21st "Flashlight Text Reveal" mechanics (eased light, roaming path, context-loss handling), adapted.
- **Rejected:** a depth gauge or surface→deep gradient (that's V1), caustics texture from V1 (procedural instead), Unbounded (reads as web3), hiding text until lit (the brief: the torch adds light, it never hides information).

**V5 · Titulky** (the homepage as a film title sequence)
- **Concept:** scroll is the film. A fast 3-2-1 leader (any input skips it), then a title card. Each section is a scene; at each boundary a fixed overlay cuts (iris, venetian blinds via clip-path, or a hard cut with a flash frame) and flashes "SCÉNA 0X". The whole colour grade (page background + text colours) switches at the cut via CSS variables, so it's a real cut, not two colours scrolling past each other. Giant kinetic type scrubs on scroll (Anybody's width axis 50–150 and weight). A timecode + frame counter in the HUD is bound to scroll position (a device, not a fact).
- **Palette (one saturated field per scene, no white page, no teal/cream/terracotta/navy, avoids V3's `#D62828`/`#FFC93C`):** ultramarín `#2A2AF5`, citrón `#F4E234`, signál `#FF5F1F`, ružová `#FF3E8A`, film `#121010` (credits), papier `#F4F4F2` (neutral off-white, changed from #F5F2EC to stay clear of cream; text on dark only, never a page background). Photos: SVG duotone (ink → scene colour) + halftone, plus a screen-blended film dust layer (Gemini texture) and grain.
- **Type:** **Anybody** (display; variable width 50–150 % and weight 100–900, so one face can be squeezed tall or stretched wide on scroll; that's the Saul Bass / Studio Dumbar collision energy) + **Hanken Grotesk** (text: clean, neutral, good tabular figures for the credits and timecode). Glyph check passed at width 50 % and 150 %.
- **Libraries (V5 page only, dynamic import):** gsap (+ScrollTrigger, SplitText, Flip, DrawSVG), lenis.
- **Facts guard:** credits list only real prices from `prices.json`; the clapperboard uses only the real FFF title, date (with its TODO), place, competitions and organiser from `events.json`; the route is a schematic line ending at the one real GPS point from `site.json`, labelled "schematické", with the getting-there TODO kept and the real Navigovať link.

### 2026-10-02 22:20 · [auto] V4 "Čierna voda" as built (`/variants/4/`)
- **Concept delivered:** fixed full-viewport three.js canvas: one fullscreen fragment shader (domain-warped fbm surface, normals by finite differences, caustic web along height contours, torch specular + sparse cold glints, 8-slot ripple ring buffer) + a `Points` layer of 820 marine-snow particles (360 on phones) lit only inside the beam. The beam samples real photos through the refracting surface (cold and desaturated at the edge, warm in the core). Per section the photo switches with a hard light-off / flicker / light-on; in the zones list, aiming at a zone crossfades to that zone's photo. A small caption says what is in the beam, using the photo's real alt text.
- **Torch:** follows a fine pointer (custom torch cursor ring, appears on first move); on touch you drag to aim; otherwise it wanders on a Lissajous path. Clicks/taps drop ripples, fast pointer moves drop small ones. The beam *warms* text (per letter on the H1, per word on headings, price numerals, zone names) via a `--heat` variable; the gallery photos are dim at rest and lit through a CSS mask where the beam falls. Nothing is hidden at rest.
- **Motion:** SplitText H1 letters surface (blur 18 px → sharp, scaleY, random stagger), headings rise out of the dark, season cells get a light sweep, GPS digits tune in, magnetic CTAs (elastic `quickTo`), Lenis smooth scroll driven from `gsap.ticker` (one loop for Lenis, torch, DOM light and WebGL).
- **Replacement bar (owner):** WebGL2 pre-check on a throwaway canvas → silent fallback; poster (real hero photo + CSS beam) is visible until the first frame; `data-gl="on|off"` on `<html>`; context loss → poster. DPR capped at 1.5, adaptive resolution drops to 0.55× if frames stay slow. Render stops when the tab is hidden or the water zone is scrolled away (the booking floor + footer are opaque): measured 0 frames in both cases (`window.__v4.frames`). 0 console errors, no horizontal overflow at 375 / 768 / 1024 / 1280 / 1440.
- **Gotchas fixed:** v4.css is bundled before Tailwind, so it declares Tailwind's layer order and lives in `@layer components` (otherwise it beat `hidden md:inline-flex`); fonts are loaded explicitly before SplitText (`document.fonts.ready` can resolve before Syne is requested); "FotoFilmFest" is one unbreakable word, sized to fit 375–1440.
- **Weight:** ≈ 188 KB gzipped JS on this page only (three 132, gsap + ScrollTrigger + SplitText 48, lenis 5, page 4).
- **Photos:** 11 real aquarea.sk photos, resized to 1280 px WebP for textures. No photo is labelled as the sailboat Danka or the tram: none of the 361 downloaded photos verifiably shows them, so the beam captions only say what each photo shows.

### 2026-10-02 22:20 · [auto] V5 "Titulky" as built (`/variants/5/`)
- **Concept delivered:** 3-2-1 film leader (sweeping dial, ~1.6 s, any wheel/touch/key/pointer skips it; a CSS timeout removes it if scripts fail), then the title card: AQUAREA (letters rise on the width axis) collides with an italic *Čierna Voda* (elastic slide); on scroll they trade width (150 ↔ 62/68). Eight scenes; each boundary triggers a fixed-overlay wipe (iris clip-path circle, 10-slat venetian blinds via clip-path inset, or a hard cut with a one-frame paper flash) that flashes "Scéna 0X" + name and switches the page grade in one frame (`html[data-v5-scene]`). Kinetic words are fitted to their column at their resting width, then scrubbed on Anybody's `wdth` axis.
- **Scenes:** 02 "Tri zóny" (two words fly through each other; PLÁŽ / POBYT / POTÁPANIE slide in from alternating sides, halftone frames open like blinds) · 03 film clock (24 h dial, real main-season arcs Po–Pi 10–20 and So–Ne 9–20 drawn with DrawSVG, a hand scrubbed by scroll, live status, 2026 season frames, TODO 2027) · 04 rolling end credits of real prices (pinned) · 05 clapperboard that snaps shut with a flash (real title, date + visible TODO, place, three competitions, organiser) · 06 pinned horizontal film reel; tapping a frame projects it full screen **in real colour** with GSAP Flip · 07 route: a schematic line drawn on scroll to the one real GPS point on a lat/lng graticule, labelled "Schematické znázornenie, nie mapa ciest", coordinates tune in · 08 booking as a kinetic list of the 5 real flows.
- **HUD:** scene slate + timecode (24 fps, 1 frame per 4 px of scroll) + frame counter. Film dust (the Gemini texture, screen blend) and SVG grain sit on fixed layers.
- **Photos:** SVG filters (`Filters.astro`): luminance → contrast → tiled dot screen → threshold = halftone, blended with the continuous tone, mapped to a scene colour pair. No extra image files.
- **No-JS:** each section carries its own grade (`--sbg/--sfg`), credits and reel fall back to normal flow / horizontal scroll, the leader never shows.
- **Gotchas fixed:** fitting measured the live word while SplitText letters were mid-animation (one font-load re-fit made the title 3× too big on phones) → measure an offscreen clone; `<html>` also carries `data-v5-scene`, so selectors are scoped to `section[...]`; HUD frame counter renamed (`data-v5-fcount`) after it collided with the reel frames.
- **Weight:** ≈ 67 KB gzipped JS on this page only (gsap + ScrollTrigger + SplitText + Flip + DrawSVG 59, lenis 5, page 4). 0 console errors, no overflow at 375 / 1440.
- **Rejected:** pinning every scene (the generator's warning; long, sticky scroll on phones), a WebGL halftone pass (an SVG filter does it with no extra library), a separate film-countdown component from 21st (built in 30 lines with a conic gradient).

### 2026-10-02 22:20 · [auto] Five directions compared (for the owner; the recommendation stays V3)
Measured at 375 px on the production preview:

| | 1 Ponor | 2 Deň pri vode | 3 Náramok | 4 Čierna voda | 5 Titulky |
|---|---|---|---|---|---|
| Page height | 14 457 px | 11 953 px | **9 354 px** | 10 440 px | 14 939 px (incl. pins) |
| First price | 1 768 px | 2 022 px | **1 170 px** | 1 270 px | 1 292 px |
| JS (gzip) | small | React island | **minimal** | ≈ 188 KB | ≈ 67 KB |
| A11y / Lighthouse | verified | verified | verified | waived | waived |

- **Best "wow": V4 Čierna voda.** Nobody else can have this site: it's built from what makes Aquarea unusual (a lake you dive into, with sunken attractions), it reacts to your hand on a phone, and the real underwater photos look better in a torch beam than in any grid. V5 is the most energetic and the most "designed" (strong second; it would also suit FotoFilmFest on its own).
- **Best for the mission in AGENTS.md: V3 Náramok, unchanged.** It still answers "what, how much, when, how to book" fastest (shortest page, first price earliest, today's status in the hero, almost no JS), unlike V4 and V5 it is verified accessible (Lighthouse a11y 100, axe 0), and its zone colours carry the whole 11-page site. V4 sells the Dive Center and night mood but undersells the summer day at the beach (turquoise water, families); V5 recolours every photo, so visitors don't see the real water colour until they project a frame, and the leader adds ~1.6 s before the first content (skippable).
- **What V4/V5 need to become shippable** (the hardening pass in the owner TODOs):
  - *Both:* a `prefers-reduced-motion` path (V4: static poster + no torch loop; V5: no leader, no wipes, per-section grades as in the no-JS fallback), Lighthouse mobile ≥ 90 and axe 0 on real mid-range Android + iOS Safari (all checks here ran in headless Chrome with SwiftShader, not on real devices), focus styles visible on every scene grade, LCP not gated by the intro animations (both hide the H1 for ~1 s), photosensitivity review of the flash frames (V5 hard cuts and clapper; keep < 3 flashes/s or drop them).
  - *V4:* contrast audit where grey text sits over the lit photo, keep the native cursor for keyboard/AT users, lower DPR on phones (1.25) and pause the shader when the pointer is idle to save battery, a daylight treatment for the beach/pobyt sections or use the torch only for Dive Center pages.
  - *V5:* fallback for SVG `feImage` halftone in Safari/Firefox (plain duotone), focus trap + Esc in the projector (Esc exists, focus doesn't move yet), shorter page on phones (credits and reel pins add ~2 screens), show real colour photos somewhere above the fold.

## Phase 5 (owner brief 2026-10-02): V6, the usable one

### 2026-10-03 09:35 · [auto] V6 "Čistá voda" (`/variants/6/`), not waived
- **Concept:** bright, airy, crisp, like looking through clear water. Clean solid surfaces, sharp type, light that moves (only inside the hero photo) and information that never does. The page goes shallows → one deep band (Dive Center) → shallows; that single, deliberate theme switch is the only dark section.
- **Fonts:** **Bricolage Grotesque** (display, `opsz` file 200–800: at large sizes the optical size tightens it into a confident, slightly quirky grotesque; 77 + 31 KB latin/latin-ext) + **Atkinson Hyperlegible Next** (text: designed by the Braille Institute for legibility, which is the whole point of this direction; 34 + 19 KB). Neither was used in V1–V5. ľ ĺ ŕ ô ä ď ť ň Č Š Ž (plus € and –, 31 glyphs) checked on the built page with `scripts/glyph-check.mjs` (Bricolage 700/800, Atkinson 400/700): all present.
- **Palette (real objects, light page, one CTA colour):** svetlo `#F5FAFA` (page: light through clear water), plytčina `#E3F1F0` (alternate surface: the shallows), hĺbka `#0D2830` (ink + the deep band: the dive site), tlmená `#43606A` (secondary text, 6.4:1), tyrkys `#159C97` (non-text accents only: live dot, progress bar, ripple wash), tyrkys tmavá `#09706B` (accent text, ≥ 5.1:1), **stolička `#C8352A`** (the red bistro chairs and parasols; the only CTA colour, white text 5.25:1; on the deep band it gets a white ring so the boundary is ≥ 3:1). Every text/UI token pair is checked by `scripts/v6-contrast.mjs` (19 pairs, all pass).
- **Layout:** left-aligned. Hero = text column on a solid surface + the drone photo of the turquoise shallows in a double-bezel frame (the only "framed" object). Zones = an asymmetric trio (one tall card + two wide), not an identical grid. Body 17/18 px, line-height 1.55, measure ≤ 66 ch, one H1, no eyebrows, no numbering, no "→".
- **Five-second test (375 × 812, no scroll):** H1, the lead, three real prices ("9 € dospelý / deň", "od 79 € apartmán / noc", "90 € skúšobný ponor"), Rezervovať + Zavolať and today's status are all above the sticky bar (`screenshots/phase5/v6-375-five-second-test.jpg`). The hero says "9 €", not "od 9 €": children pay 7 €, so "od 9 €" would be wrong.
- **Motion budget (what moves, and its reduced-motion version):** 1 signature: water light (raw WebGL2 caustics over the hero photo, only where the photo is water-coloured, ripple under pointer/finger, pause button; reduced = one still frame) · H1 focus-in (blur → sharp, ≤ 600 ms, no opacity change; reduced = none) · below-the-fold reveals (400 ms, 20 px, ≤ 50 ms stagger, never above the fold; reduced = none) · count-up on two facts (reduced = final value) · card lift + photo zoom + clip-path ripple wash · button press, underline draw · live status dot (pulses twice when open; reduced = static) · smooth accordions (CSS) · partner marquee with a visible pause button (reduced = static row) · reading progress (CSS scroll timeline; reduced = hidden) · Flip gallery filter + View Transition lightbox (reduced = instant) · one parallax image (±20 px; reduced = none). Native scroll only: no Lenis, no pins, no custom cursor.
- **Borrowed from V4/V5:** the water-light idea and its engineering (WebGL2 pre-check, poster first, DPR ≤ 1.5, IntersectionObserver + visibility pause, context-loss teardown) from V4, slimmed from three.js (132 KB) to a 2.8 KB raw-WebGL module; GSAP Flip for the gallery from V5's reel; the measured-fit discipline (no layout shift from motion) from both. **Dropped:** the torch, marine snow, the night palette, Lenis, pinned sections, kinetic width type, scene cuts, the leader, the custom cursor and any effect under text.
- **Reusable:** `src/lib/motion/` (README lists every block with its reduced-motion behaviour).
- **Not done:** page-to-page view transitions. The other pages can't opt in without touching them (and `astro.config`), which the brief forbids.
- **Budgets:** Gemini: none used in Phase 5. The owner's brief says 4/8 used; this log shows 2/8 (`v1-caustics`, `v5-film-dust`). Following the owner's stricter count, the cap was 1 more; 0 used. 21st `get_component`: 0 on 2026-10-03.

### 2026-10-03 09:35 · [auto] V6 reviews (design:accessibility-review, design:design-critique)
- **Accessibility review** (WCAG 2.2 AA, beyond axe; `scripts/v6-a11y-audit.mjs`): keyboard 66–68 tab stops in a logical order, every stop has a visible ring, none hidden under the sticky header/bar (scroll-padding top and bottom); reflow at 320 px and 200 % zoom: 0 px overflow, also with the WCAG text-spacing override, nothing clipped; 1 H1, no skipped heading levels, landmarks, skip link, `lang="sk"`. **Fixed:** WCAG 2.2.2 (the water light now has a 44 px pause/play button with `aria-pressed`; the live dot stops after two pulses, < 5 s), a 22 px standalone link raised to 44 px, the CTA boundary on the deep band. Manual screen-reader testing on a real device (VoiceOver/TalkBack) is still recommended.
- **Design critique:** first screen answers the brief; middle of the page had no high point and price rows repeated their group names. **Fixed:** one deep-water band for the Dive Center (identity + depth story), shorter price labels (facts unchanged).
- **Final review fixes:** the zones intro was rewritten strictly from `src/content` (public Plážová zóna + Prémium zóna with apartments, camping and the Dive Center; beach entry after paying; stay only by reservation; intro dive and courses via the forms) and every other V6 sentence re-checked against the content; the Dive facts no longer reveal *and* count (one animation per viewport); the water light and the marquee now follow a live change of the reduced-motion setting like the GSAP blocks; `node scripts/a11y.mjs …/variants/6/`: 0 violations at 375 and 1440; water-light DPR on a 3× phone = 1.5.

### 2026-10-03 09:35 · [auto] V3 vs V6, and which should become `/`
Measured on the production preview, same machine, Lighthouse mobile median of 3 runs:

| | V3 Náramok (current `/`) | V6 Čistá voda |
|---|---|---|
| Page height at 375 px | **9 354 px** | 12 227 px |
| First price on the page (375 px) | 1 170 px | **310 px** (first screen) |
| Today's status + Rezervovať + Zavolať on the first screen | status yes, CTAs in the sticky bar only | **all in the hero, plus the sticky bar** |
| Lighthouse performance / accessibility / best practices | **97** / 100 / 100 | 94 / 100 / 100 |
| LCP / CLS / TBT | **2.3 s** / 0.002 / 0 ms | 2.8 s / **0.001** / 0 ms |
| JS (gzip) | ≈ 3 KB | ≈ 4 KB up front, + 42 KB after `load` (gsap, SplitText, Flip, module), + 2.8 KB water light on idle |
| axe (normal + reduced motion) | 0 | 0 |
| Works without JS | yes | yes (all CTAs, gallery as links, accordions native) |
| Effects | 2 (partner marquee, wristband open/close) | 1 signature + 11 micro-interactions, each with a reduced-motion version |

**Recommendation: V6 should become the real homepage `/`**, because it does the mission in AGENTS.md better on the measure that matters most: on a phone, the price, today's status and both actions are on the first screen (first price at 310 px instead of 1 170 px), it is just as accessible, it stays above the Lighthouse bar, and it makes the place look like what it is (clear water) rather than signage. V3 remains faster (LCP 2.3 s vs 2.8 s, mostly V6's fonts) and shorter.
**Condition:** the 11 inner pages are built in V3's system (`Site.astro` + `v3.css`, zone colours). Switching `/` alone would mix two systems, so the switch should come with a follow-up pass that moves the inner pages to V6's tokens and type (content and components carry over). **`/` is not replaced** until the owner says so.

## Phase 6 (owner brief 2026-10-03): V7, bold and sporty but fully usable

### 2026-10-03 10:25 · [auto] V7 "Rýchla voda" (`/variants/7/`), not waived
- **Reference:** the brief's quad-bike site URL was still the placeholder (`[PASTE URL HERE]`), so the fallback reading was used: bold sporty energy, oversized heavy display type, saturated flat colour blocks, hard angled panel cuts, thick shapes, huge price numerals, sticker badges (only for real prices). What that contributed concretely: the hero split (water left, hard-cut solid panel right), italic condensed uppercase headings, 4 px black rules, offset "hard shadow" buttons, slanted band edges that interlock, price stickers, huge numerals for the Dive Center facts. Our brand, content and palette only; nothing copied.
- **Concept:** speed on the water. The hero is the lake as flat logo-blue water with an illustrated diver mid-kick; below it, flat colour bands (white, deep blue, pale tint, logo blue, ink) separated by one repeated angled cut. Every reading surface is solid; colour carries energy, not text.
- **AGENTS.md exception used:** rule 5 (V7 only) for ONE stylised, non-photoreal diver mascot: faceless, no real person, no equipment brand, no certification mark. It was committed on its own before any build work.
- **Palette from the logo** (pixels sampled from `source-images/brand/logo-new2.png`; dominant colours `#00B0F0`/`#00A0E0` blue, `#E00010` red, `#000`/`#202020`; the brief's values used): modrá `#00A8F0` (a *surface*: water, bands, stickers; carries ink text or none), červená `#D80018` (CTAs and key highlights only, white text), čierna `#181818` (ink, hero panel, footer), biela. **Derived, same hue 198° as the logo blue:** hlboká modrá `#006B99` (lightness 30 %: white text on it 5.9:1, so the Dive band can carry white text) and hladina `#F0FAFF` (lightness 97 %: the light page surface). Green and orange from the logo were not used. The red's hover is a darker shade of the same red (`#B30014`, 7.2:1).
- **Contrast** (`node scripts/v7-contrast.mjs`, 24 pairs, all behave as documented): ink on white 17.8, ink on pale 16.8, **ink `#181818` on logo blue 6.65** (the brief's 7.9 is for pure `#000`; both pass, ink kept for consistency), white on ink 17.8, **white on logo blue 2.67 (fails, never used)**, white on deep blue 5.9, white on red 5.34, logo blue on ink 6.65 (date, status dot), secondary grey `#454545` on white 9.6; every focus ring ≥ 3:1 (ink on light/blue, white on dark). The script caught one mistake during the build: light-grey secondary text on the deep-blue band was 4.29:1, so that band uses white.
- **Fonts (not used in V1–V6):** **Barlow Condensed** 800 and 800 italic (display: a DIN-like road-sign condensed; the italic gives speed; real weight contrast with the text face) + **Barlow** 400/700 (text: same designer family, so the page is one voice, clean and open at 17–18 px). 150 KB of woff2 in total, `font-display: swap`. ľ ĺ ŕ ô ä ď ť ň Č Š Ž + € + – (31 glyphs) verified on the built page with `scripts/glyph-check.mjs` for all four faces. Rejected: Teko/Oswald (generic "sport" faces), Rubik (soft), a variable text face (60 KB latin-ext alone).
- **Hero (the signature):** desktop = full-bleed water, diver on the left (head clear of the panel), a solid ink panel with a hard angled left edge on the right holding the H1, a lead sentence, three price stickers ("9 €", "od 79 €", "90 €"), Rezervovať (red) + Zavolať and the one-line status. Mobile (375 × 812) = water + diver in 34 svh, then the panel directly below: H1, the three stickers, both CTAs and the status are all above the sticky bar (`screenshots/phase6/v7-375-five-second-test.jpg`; the lead sentence is hidden under 640 px to make room, the three stickers say what Aquarea offers). The panel never sits on moving water.
- **Water (procedural, no WebGL, no shader):** 4 SVG wave layers (periods 400/320/800/400 divide the 1600 tile, so a 50 % translate loops seamlessly; 15–33 s each, negative delays for phase), a surface line + pale water-light band at the top, 3 skewed caustic bands, all CSS `transform`/`translate` animations. It looks finished frozen. The animations exist only while JS has set `[data-live]` (so no JS = a static frame, and nothing runs for more than 5 s without the pause button), pause when the pause button is pressed or the hero is off-screen, and never run under reduced motion. Pointer/tap adds a ring ripple (one element, 0.9 s). ≤ 9 pooled bubbles in the DOM (3 breath bubbles at the regulator, 6 ambient/burst), transform + opacity only.
- **Diver rig** (`Diver.astro`, 4.2 KB in the HTML, hand-built; the Gemini concept was reference only): layered SVG groups with the pivot coming from the nesting: `translate(pivot)` › `<g data-d="part" rotate(rest)>` so GSAP rotates each part around its own (0 0): root (bob) › body (diagonal −20°) › far leg, upper body (torso undulation: tank, torso, head, both arms), near leg; each leg thigh › shin › fin (red; the far fin is a darker red), each arm upper arm › forearm (glove), head with a mask and a blue lens, the regulator hose and its marker for the bubbles. Suit black, stripes and lens in logo blue, fins red. **Why a ticker, not keyframe tweens:** every part's angle is `rest + amp·sin(phase)` set in one `gsap.ticker` callback (`quickSetter`), so starting eases the amplitude in and pausing eases it back to the static pose (about 0.5 s) without jumps; kick period 1.2 s (thighs ±18°, shins ±12°, fins ±10°, far leg in counter-phase, shins and fins lagging), arm sway ±6° (1.6 s), torso ±2.5°, head ±3°, bob ±6 px per 3.2 s. **Interaction** (transform only): drifts toward the pointer (±40 px) and tilts ≤ 4°, kick speed rises with pointer movement and scrolling, tap/click = ring + bubble burst + a stronger kick, scrolling the hero nudges the diver down ≤ 80 px (measured 60 px at 300 px of scroll). Paused off-screen and in hidden tabs. **Static pose** (the SVG markup) is the reduced-motion and pause pose; the diver is `aria-hidden` (it carries no information). The kick cycle is shown in `screenshots/phase6/v7-1440-diver-kick-1..4.jpg`.
- **Gemini:** 1 concept image (2K, balanced, `images/generated/v7-diver-concept-1.jpg`, flat vector, faceless, no logos). The second pose was not needed (the rig is hand-built). V7 used 1 of 3 allowed; the overall total is 3 / 8. No third image: the procedural water was good enough.
- **Reused from V6, unchanged** (`src/lib/motion`): `withMotion` (reduced-motion helper), reveal, count-up, focus-in (H1), ripple wash on the zone slabs, Flip gallery + View Transition lightbox, marquee with pause button, `m-acc` accordions, `m-progress` bar, live status dot. New in V7: `diver.ts`/`Water.astro`/`Diver.astro` (page-local). **Dropped from V6:** the WebGL water light, the photo-framed hero, the soft palette.
- **Section order, content and TODOs** are the same as V3/V6 (all 4 visible TODOs present). Zones are a deliberate asymmetric trio of slabs (blue / ink / deep blue) with a tall beach slab, not an identical grid.
- **Motion budget:** the hero loops only while it is on screen; below it only one-off reveals (400 ms, 20 px, ≤ 50 ms stagger, never above the fold) and the Dive diver's 1.3 s hover kick. Count-up on the Dive facts (not also revealed). No scroll-jacking, no custom cursor, native scroll, no Lenis.
- **Findings fixed from the reviews:** (accessibility) horizontal overflow at 320 px, and at 320 px with the WCAG text-spacing override (hours times, CTA labels and price numerals no longer `nowrap`; stickers wrap), a 41 px footer link, decorative bubbles hidden without JS (`display: none` until live); (critique) the tall beach slab had a dead area, weekday hours wrapped on desktop, the Dive diver was too small.
- **Limits:** everything was measured in headless Chrome on one Mac (Lighthouse simulated mobile throttling); no real-device or screen-reader testing.

### 2026-10-03 10:25 · [auto] V3 vs V6 vs V7, and which should become `/`
375 px, production preview, Lighthouse mobile (3 runs each):

| | V3 Náramok (current `/`) | V6 Čistá voda | V7 Rýchla voda |
|---|---|---|---|
| Page height | **9 354 px** | 12 279 px | 12 528 px |
| First price on the page | 1 170 px | **310 px** | 474 px |
| Status + both actions on the first screen | status yes, actions only in the bar | all, plus the bar | all, plus the bar |
| Lighthouse performance / a11y / best practices | 97–98 / 100 / 100 | 92–93 / 100 / 100 | **99 / 100 / 100** |
| LCP / CLS / TBT | 2.3 s / 0.002 / 0 | 2.8–3.0 s / 0.001 / 0–20 ms | **1.7–1.8 s** / 0.003 / 0 |
| JS (gzip) | ≈ 3 KB | ≈ 4 KB + 42 KB after load + 2.8 KB idle | ≈ 4.5 KB + 44 KB after load |
| Fonts | 2 families | 2 families, 160 KB | 2 families (Barlow), 150 KB |
| Effects | 2 | 1 signature + 11 micro | 1 signature (water + rigged diver) + 12 micro |
| axe / `a11y.mjs` | 0 | 0 | 0 |
| Works without JS | yes | yes | yes |

**Recommendation for the real homepage `/`: V7**, with V6 as the calmer fallback. V7 matches the brief's mission and the brand best: its palette *is* the logo (so the redesign and the existing logo/partner logos read as one system), the hero shows the diver and the lake in one image with the price, status and both actions beside it, it has the best Lighthouse and LCP of the three (no hero photo to wait for) and it is the only direction with an ownable character. V6 wins on "first price at 310 px" and on reading comfort for long text; V3 stays the shortest and lightest.
**Conditions:** (1) the 11 inner pages are built in V3's system, so switching `/` needs a follow-up pass that moves them to V7's tokens, type and bands (content and components carry over); (2) the diver mascot rests on the owner's rule 5 exception and should be reviewed by Aquarea before launch (it is a stylised generic diver, not a likeness); (3) real-device and screen-reader testing. **`/` is not replaced** until the owner says so.
