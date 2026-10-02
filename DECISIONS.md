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
- **Palette (one saturated field per scene, no white page, no teal/cream/terracotta/navy, avoids V3's `#D62828`/`#FFC93C`):** ultramarín `#2A2AF5`, citrón `#F4E234`, signál `#FF5F1F`, ružová `#FF3E8A`, film `#121010` (credits), papier `#F5F2EC` (text on dark only, never a page background). Photos: SVG duotone (ink → scene colour) + halftone, plus a screen-blended film dust layer (Gemini texture) and grain.
- **Type:** **Anybody** (display; variable width 50–150 % and weight 100–900, so one face can be squeezed tall or stretched wide on scroll; that's the Saul Bass / Studio Dumbar collision energy) + **Hanken Grotesk** (text: clean, neutral, good tabular figures for the credits and timecode). Glyph check passed at width 50 % and 150 %.
- **Libraries (V5 page only, dynamic import):** gsap (+ScrollTrigger, SplitText, Flip, DrawSVG), lenis.
- **Facts guard:** credits list only real prices from `prices.json`; the clapperboard uses only the real FFF title, date (with its TODO), place, competitions and organiser from `events.json`; the route is a schematic line ending at the one real GPS point from `site.json`, labelled "schematické", with the getting-there TODO kept and the real Navigovať link.
