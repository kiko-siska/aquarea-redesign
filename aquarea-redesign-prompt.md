Redesign the website of **Aquarea Čierna Voda** (https://www.aquarea.sk/) as a modern, mobile-first site in Slovak. Work in the current directory; it is a fresh, empty repo.

## Context — read this first

Aquarea is a real recreation area at the lake in Čierna Voda (SK), run by Galileo Corporation s.r.o. As far as I can tell from the current site, it has several distinct offers under one brand:

- **Plážová zóna** — public beach / swimming area
- **Prémium zóna** — camping & apartments (accommodation)
- **Dive Center / Potápanie** — diving school, courses, intro dives
- **FotoFilmFest** — annual underwater photo/film festival
- plus gallery, price lists (Cenník), opening hours, reservations and contact

The current site works, but it looks dated, the navigation is dense, and the prices and booking flows are hard to find. The goal is a site that makes a visitor on a phone understand in seconds **what Aquarea is, what it costs, when it's open, and how to book or get there**. It should also make people *want* to come: water, light, summer, and the underwater world of the dive center.

This is a **redesign concept**. Aquarea has not approved it yet. Treat the brand, logo and photos as theirs.

## Hard rules

- **Facts only.** Every price, opening hour, phone number, address, course name, date and rule must come from the current aquarea.sk and be traceable to a source URL. Do NOT invent testimonials, star ratings, visitor counts ("10 000+ spokojných hostí"), awards, prices, hours, emails or features. If a section needs information the site doesn't have, leave a clearly marked `TODO` and list it for me at the end.
- **No fake booking.** This will be a static site with no backend. Don't build a reservation system that pretends to work. Link each existing booking or reservation flow to where it lives today (or to `tel:` / `mailto:` if that is how they book). If a flow can't be carried over, make it a `TODO`.
- **Build options, don't ask me to pick from text.** When there is a design choice, build the directions as working prototypes and let me choose visually.
- **Don't push, deploy or publish anything without asking me first.**
- **`AGENTS.md`, `CLAUDE.md`, `PROGRESS.md` and `DECISIONS.md` already exist.** `AGENTS.md` wins over this file if they conflict (including the unattended-mode rules). Keep `PROGRESS.md` and `DECISIONS.md` updated as you work.

## Tools you should use

Skills:
- `superpowers:brainstorming`, kept short. The brief is below, so don't interview me at length.
- `frontend-design:frontend-design` and `ui-ux-pro-max:ui-ux-pro-max` to lock the aesthetic direction, type, palette, spacing, UX and accessibility rules. Run its design-system generator (`--design-system`) for "lake recreation area / beach / diving center / camping" and use the output as input, not as gospel.
- `ui-ux-pro-max:ui-styling` for shadcn/ui + Tailwind work.

MCP servers (check they're available in Phase 0):
- **21st** (21st.dev component catalog). Use `search` / `get_inspiration` freely to find hero sections, scroll effects, galleries, pricing tables, navbars and footers. **Budget:** the free tier allows only about **2 component retrievals (`get_component`) per day**, and `generate` needs paid AI access. So shortlist first, show me the shortlist (name + link + where you'd use it), and ask before retrieving more than 2 components in a day or before using `generate`.
- **magicui** (Magic UI components: marquee, blur-fade, animated grids, number tickers, etc.). This one is free, so it's the default for motion and effects.
- **nano-banana** (`generate_image`, Gemini). Only for atmosphere where real photos are missing (textures, underwater gradients, section dividers, an OG image). **Budget: ~$10 of API credit** → max ~8 images, `fast` quality, 1K–2K, no 4K or Pro without asking. Plan the shot list first. Never generate fake photos of the real place, its buildings or its staff.
- **shadcn MCP.** It needs `components.json`, so it can only be set up after scaffolding. After Phase 2 scaffolding, run `npx shadcn@latest mcp init --client claude`. Register third-party registries (e.g. Aceternity UI, Magic UI) in `components.json` if useful. Then tell me to restart the session so it loads.
- Built-in browser preview, to verify every page at 375px and desktop widths.

## Stack

- **Astro** with static output + **Tailwind CSS** + **React islands** only where a component needs React (21st / Magic UI / Aceternity components are React + Tailwind, often with `motion`/framer-motion). Everything else is plain `.astro` components, so it ships almost no JS.
- Content goes in data files (`src/content/` collections or JSON/MD), not hard-coded in markup. That way prices and hours are edited in one place and translations can be added later.
- **i18n-ready:** build **Slovak first**, with routing/structure prepared for `/en/` and `/hu/` (the current site has EN + HU versions). Translation is a later phase, so don't translate now.
- Deployable to GitHub Pages via a GitHub Actions workflow (Astro needs a build step). Set `<meta name="robots" content="noindex">` site-wide until Aquarea approves the redesign.
- `lang="sk"`, semantic HTML, WCAG AA contrast, visible focus states, alt texts in Slovak, `prefers-reduced-motion` respected (every scroll effect needs a static fallback).
- Performance: Lighthouse mobile ≥ 90 for performance and accessibility. Use responsive images (Astro `<Image>`, WebP/AVIF, `srcset`, lazy loading below the fold) and `font-display: swap`.
- Local SEO: good titles/descriptions per page, Open Graph, JSON-LD (`LocalBusiness` / `TouristAttraction` / `Campground` / `SportsActivityLocation` where they fit), with real address, phone and hours only. No `aggregateRating`.

## Phases — stop where it says STOP

### Phase 0 — Tool check
List your available MCP tools. If **21st** or **nano-banana** is missing, stop and tell me; don't silently fall back. Confirm the skills above load.

### Phase 1 — Content audit (the foundation)
Crawl **every page** of https://www.aquarea.sk/ (SK version, and note which pages exist in EN/HU). Known entry points: `/o-nas/`, `/plazova-zona-2/`, `/premium-zona-3/`, `/potapanie-2/`, `/galeria/`, `/fotofilmfest-2027/` (+ subpages), `/cennik-1/` (+ its subpages per zone), `/kontakt/`, `/kontakt/rezervacie/`, `/kontakt/otvaracie-hodiny/`. Follow every internal link beyond these.

- Save the content as Markdown or JSON under `content-audit/`, one file per page, **with the source URL at the top**. Keep full price tables, hours (including seasonal variants), rules, course lists and contact details.
- Download the site's photos into `source-images/`, keeping a `source-images/SOURCES.md` that maps each file to its page URL. Use the best ones as the real imagery for the redesign.
- Write `content-audit/SITEMAP.md`: the current page tree, every form and booking flow (what it collects, where it submits), every external link (booking engines, social, maps), and the content problems you see (duplicates, outdated info, dead links).
- Propose a **new information architecture** (page tree + main nav + footer) that is simpler than the current one. Put it at the end of `SITEMAP.md`.

### Phase 2 — Three homepage directions → STOP
1. Brainstorm 3 **distinct** visual directions (one paragraph each: mood, palette, type pairing with full Slovak diacritics, and a signature effect, e.g. a scroll-driven "dive" from surface to underwater, a sunlit editorial magazine look, a bold modern resort look). Ground them in the real place: lake water, sand, summer light, the underwater world of the dive center. Avoid templated defaults: no purple/blue AI gradients, no generic centered-text-over-stock-photo hero, no glassmorphism everywhere.
2. Scaffold the Astro project once, then build **all 3 as working homepages** at `/variants/1/`, `/variants/2/`, `/variants/3/`, sharing the same real content from Phase 1. Add a simple picker page at `/variants/`. Each homepage should cover at least: hero, the zones (beach / premium / dive center) as clear entry points, opening hours + prices teaser, the upcoming event, gallery teaser, how to get there, and a contact/booking CTA. Add a sticky mobile CTA (call / reserve).
3. Use 21st / Magic UI components for the signature effects where they genuinely help. Stay within the component budget above.
4. Verify all three in the browser at 375px and desktop, screenshot them into `screenshots/`, and fix the obvious issues.
5. **STOP.** Give me the picker URL, a short summary of each direction and the list of `TODO`s. Wait for my choice.

### Phase 3 — Full site (after I choose)
Build out the chosen direction across the new information architecture: every zone page, cenník, otváracie hodiny, rezervácie/kontakt, potápanie (courses, intro dives), FotoFilmFest, galéria, o nás, 404. Verify each page on mobile and desktop. Then ask me about EN/HU translation and deployment.

## Deliverables at the end of each phase

- What you did, where it is, and screenshots (mobile + desktop).
- Which images are real (from aquarea.sk) vs. generated, and roughly how much of the Gemini and 21st budget you used.
- All `TODO`s and open questions for me, in one list.
