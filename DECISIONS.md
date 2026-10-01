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

### 2026-10-01 07:40 · [auto] Design-system generator output, used as input only
- Ran `ui-ux-pro-max --design-system` for "lake recreation area beach diving center camping" and "travel tourism resort outdoor summer" (dials variance 7, motion 6, density 3).
- **Kept:** the *Scroll-Triggered Storytelling* pattern (chapters, a progress indicator, everything readable without the effect, a static final state under reduced motion); CTA in the hero, sticky on mobile, and at the bottom; an orange-red accent against water blues; editorial serif + clean sans; condensed display for a bold/sporty look; the checklist (contrast ≥ 4.5:1, 44 px targets, SVG icons instead of emoji, 375/768/1024/1440).
- **Rejected:** trust-blue `#2563EB` SaaS palette, "Aurora UI" mesh gradients (a templated look the brief forbids), the Noto Sans Thai pairing (wrong market). Outfit/Work Sans are too generic.
- Why: the generator has no lake/diving-specific profile. The real place (drone photos, red roofs and parasols, yellow loungers, wheat fields, the underwater attraction map) is the stronger source.

### 2026-10-01 07:45 · [auto] Three homepage directions
All three use the same real content (src/content), the same IA (content-audit/SITEMAP.md §7) and the same sections: hero · zones as entry points · today's status + hours · prices teaser · FotoFilmFest · gallery teaser · how to get there · booking/contact CTA · sticky mobile bar (Zavolať / Rezervovať / Navigovať).

**1 · Ponor: from the surface to −36 m** (`/variants/1/`)
The page is a dive. You start on the surface (top-down drone shot of turquoise shallows) and every section sits one depth lower. A depth gauge on the left (a thin top bar on mobile) ticks down and names the **real attractions** you pass: −5 m výcviková plošina, −8 m autobus, −13 m električka, −15 m plachetnica Danka, −30 m hlboká plošina (from the Dive Center's own map). The background darkens with scroll from surface light to deep green-blue (CSS scroll-driven animation; static section colours where unsupported or with reduced motion). In the Dive Center chapter, Magic UI light rays fall from above. Mood: calm, cool, a bit technical, like a dive computer. Palette: hladina `#DDF3F1`, tyrkys `#1FA7A6`, jazero `#0F6E86`, hĺbka `#0A3F52`, dno `#06232E`, slnko `#F4C542` (the yellow loungers by the dive center) for CTAs on dark. Type: **Archivo** variable, one family, with width as the contrast: expanded heavy cuts for depth numbers and headings, normal width for text. Full latin-ext (ľ ĺ ŕ ô ä ď ť ň).

**2 · Deň pri vode: a sunlit summer magazine** (`/variants/2/`)
An editorial look on bright white paper with lake-blue ink instead of black. Large serif headlines sit on white, never over the photo. Big real photos follow with italic captions, and the layout is left-aligned and asymmetric. Signature: **"Od rána do západu slnka"**, a horizontal, snap-scrolling strip of real photos through a day at the lake (morning jetty → noon beach → afternoon dive → sunset), next to the real main-season hours (Po–Pi 10:00–20:00, So–Ne 9:00–20:00). The prices teaser is set like a magazine price box. Palette: papier `#FFFFFF`, atrament `#123E5C`, obloha `#DCEEF7`, pšenica `#E2B547` (fields around the lake), slnečník `#C8102E` (the red parasols) for CTAs, tráva `#2F6B3A`. Type: **Newsreader** (display + italic captions, optical sizes) + **Instrument Sans** for UI, tables and buttons.

**3 · Náramok: bold resort wayfinding** (`/variants/3/`)
Loud, sporty and colour-coded like on-site signage. Each zone gets a colour, and the zones appear as three wide **wristband** bands (the area really works with zone wristbands, per the Prevádzkový poriadok §4–5): Plážová zóna, Prémium zóna, Dive Center. Tapping a band opens what's there, the price from, and the booking button. Big condensed numerals carry the key facts (9 € / deň, 90 € skúšobný ponor, 590 € kurz OWD). A Magic UI marquee runs the partner/certification logos (TDI, SDI, ERDI…). Palette: biela `#FFFFFF`, atrament `#10212B`, pláž `#00A3A3`, prémium `#2E7D32`, dive `#0B4F8A`, event `#D62828`, slnko `#FFC93C`. Type: **Big Shoulders Display** (Chicago-signage condensed, 800–900) + **Figtree** for text.

Checked against generic defaults: no cream + terracotta, no near-black + acid accent, no all-caps eyebrows above every heading, no mono labels, no "→" on buttons, no identical rounded-card grid, no centred text over a stock-style photo. The accents come from objects actually on site (loungers, parasols, roofs, fields).

### 2026-10-01 07:50 · [auto] Image plan: real photos first, Gemini almost unused
- 361 real photos exist (incl. underwater). Gemini is only for textures: planned **1–2 images** (an underwater caustics texture for variant 1; an optional abstract sun-glare-on-water divider). Budget max 8.
- The OG image is composed from the real hero drone photo + logo (sharp), not generated.

### 2026-10-01 08:20 · [auto] Component shortlist (Phase 2)
| Component | Source | Where | Decision |
|---|---|---|---|
| Light Rays | Magic UI `light-rays` (free) | v1 Dive Center chapter: sunlight falling into the water | use (React island, `client:visible`, static gradient under reduced motion) |
| Marquee | Magic UI `marquee` (free) | v3 partner/certification logos (TDI, SDI, ERDI…) | use; under reduced motion it's a static wrapped row |
| Horizontal Depth Fade | 21st.dev @unlumen, id 18439 · https://21st.dev/@unlumen/components/horizontal-depth-fade | v1 underwater photo strip: centred photo sharp, the rest blurred/dim like underwater visibility | **retrieved** (1/2 today). The original needs GSAP + CSS background images; ported to ~60 lines of vanilla JS with real `<picture>` images. Under reduced motion it's a plain snap-scroll row. |
| Filmstrip Gallery | 21st.dev @n1m4mz, id 27093 · https://21st.dev/@n1m4mz/components/filmstrip-gallery | v2 "Od rána do západu slnka" day strip + native `<dialog>` lightbox | **retrieved** (2/2 today). Kept the mechanics (scroll-snap gate, arrow keys, live announcement, dialog lightbox, reduced-motion). Dropped the film-negative look, mono edge printing and sprockets; Slovak labels; responsive sources. |
| Masonry Lightbox | 21st.dev @ayushmxxn, id 26223 | Phase 3 Galéria page | candidate for a later day's budget; may build it natively with `<dialog>` instead |
| Scroll Progress | Magic UI `scroll-progress` / 21st variants | v1 depth gauge | not needed: the depth gauge is custom (it shows real attraction depths) |
| Aceternity UI | — | — | not used: everything needed is covered above with less JS |

### 2026-10-01 08:22 · [auto] Image shot list (Gemini, max 8 total)
1. **v1 caustics texture**: seamless abstract sunlight caustics on pale sand seen through teal water. No objects, fish or people. 16:9, 2K, fast. Used as a low-opacity overlay at the surface → shallow transition. *(planned)*
2. *(reserve)* abstract sun-glare-on-water divider for v2, only if the real photos don't cover it.
Everything else uses real aquarea.sk photos. The OG image was composed from the real drone photo + logo (`scripts/make-og.mjs`), with 0 Gemini credits.
