# AGENTS.md — Aquarea Čierna Voda redesign

This file is the **source of truth** for every agent and session working in this repo. Read it fully at the start of every session, and again after any context compaction. If anything else conflicts with it (including `aquarea-redesign-prompt.md`), this file wins.

## Mission

Redesign https://www.aquarea.sk/ (Aquarea Čierna Voda: beach zone, premium zone with camping & apartments, Dive Center, FotoFilmFest) as a modern, mobile-first **Slovak** website. A visitor on a phone must understand in seconds **what Aquarea is, what it costs, when it's open, and how to book or get there**, and should *want* to come.

This is a **redesign concept** that Aquarea hasn't approved. The brand, logo, photos and texts belong to them.

The full brief, stack and phase plan are in [`aquarea-redesign-prompt.md`](aquarea-redesign-prompt.md). Current state is in [`PROGRESS.md`](PROGRESS.md). Decisions taken without the owner are in [`DECISIONS.md`](DECISIONS.md).

## Hard rules (never break)

1. **Facts only.** Every price, hour, phone, address, course, date and rule must come from aquarea.sk and be traceable to a source URL in `content-audit/`. No invented testimonials, ratings, visitor counts, awards, prices, hours, emails or features. Missing info → a visible `TODO`, listed in `PROGRESS.md`.
2. **No fake booking.** This is a static site with no backend. Link each existing booking flow to where it lives today (or `tel:` / `mailto:`). Never fake a working form.
3. **Never push, deploy or publish.** No `git push`, no GitHub repo creation, no hosting. Commit locally only.
4. **`noindex` site-wide** until the owner approves.
5. **Never generate fake photos** of the real place, its buildings or its people. AI images are only for textures, abstract water/underwater backgrounds, dividers and an OG image. (Exception, owner, 2026-10-03: for /variants/7/ only, rule 5 allows ONE stylised, non-photoreal, illustrated diver mascot generated or traced from Gemini concept art. It must not depict any real person, real staff, real equipment brand or certification mark. The Gemini cap for V7 is 3 new images, max 2K, quality 'balanced' allowed; total stays ≤ 8.) (Second exception, owner, 2026-10-03: for /variants/7/ only, rule 5 is waived for ONE photoreal, AI-generated underwater diver cut-out, used in the hero and reused once in the Dive Center section. It must be a generic anonymous diver that does not depict any real, identifiable person or staff member, no equipment brand and no certification mark. The place, buildings and scenery stay real aquarea.sk photos (the hero background is a real drone photo). The V7 Gemini cap is unchanged: 3 new images in total, 1 already used; overall total stays ≤ 8.)
6. **Slovak only for now.** Keep the structure i18n-ready (`/en/`, `/hu/` later), but don't translate.
7. **Accessibility & performance:** WCAG AA contrast, visible focus, Slovak alt texts, `prefers-reduced-motion` fallbacks for every effect, Lighthouse mobile ≥ 90 for performance and accessibility. (Exception, owner, 2026-10-02: /variants/4/ and /variants/5/ are exempt from accessibility and Lighthouse targets. A hardening pass is required before either can ship.)
8. **No secrets in the repo.** API keys live only in the local Claude config, never in files here.

## Unattended mode (the owner is asleep)

The owner answered the upfront questions (see `DECISIONS.md`) and is not available. Therefore:

- **Never stop to ask a question.** When the brief says "ask me" or "STOP", take the **recommended / most sensible option**, log it in `DECISIONS.md` (what, why, alternatives), and continue.
- **Phase 2 → 3 handoff:** build all 3 homepage directions + the picker at `/variants/`, pick the one you would recommend (log why), then build the full site in it. Keep all 3 variants so the owner can switch later.
- **shadcn MCP:** it can't be loaded mid-session. Use the shadcn CLI directly (`npx shadcn@latest add …`, including registries like Magic UI and Aceternity in `components.json`) instead of waiting for a restart.
- If something is blocked (a tool is missing, a site can't be reached), log it in `PROGRESS.md` under *Blockers*, work around it, and keep going. Don't spin on the same error.

## Budgets

| Resource | Limit | Notes |
|---|---|---|
| 21st.dev `get_component` | **max 2 per calendar day** | `search` / `get_inspiration` / `search_logo` are free, so use them freely. **Never** call `generate` (paid). Log each retrieval in `PROGRESS.md`. |
| Magic UI MCP | free | default source for motion and effects |
| Gemini images (`nano-banana` → `generate_image`) | **max 8 images total**, `fast` quality, 1K–2K | no 4K, no Pro. Plan the shot list first and log every generation in `PROGRESS.md`. |

## Stack

Astro (static output) + Tailwind CSS + React islands only where a component needs React (21st / Magic UI / Aceternity use React + `motion`). Content lives in data files (`src/content/` or JSON/MD), not in markup. GitHub Pages–ready (Actions workflow file allowed, but never pushed). Responsive images via Astro `<Image>`.

## Working protocol (keeps sessions consistent)

- **Start of session:** read `AGENTS.md` → `PROGRESS.md` → `DECISIONS.md` → the relevant section of `aquarea-redesign-prompt.md`. Continue from the first unchecked item in `PROGRESS.md`. Never redo finished work.
- **Concurrency guard:** if `PROGRESS.md` → *Last updated* is less than 45 minutes old and the status is `RUNNING`, another session is active. Exit without changing anything. So always update *Last updated* at least every 30 minutes while working, even in the middle of a long item.
- **Usage limits:** this project has `autoContinueAtUsageLimit` on, so a session may pause at a usage limit and resume after the reset. After resuming, re-read `PROGRESS.md` before continuing.
- **During work:** after each finished checklist item, tick it in `PROGRESS.md`, update *Last updated* (local time, `date "+%Y-%m-%d %H:%M"`), and `git commit` with a clear message. Small, frequent commits. They are the recovery points if usage runs out mid-task.
- **End of session (or when running low):** set the status to `PAUSED` or `DONE`, write a short *Handoff* note in `PROGRESS.md` (what's next, any gotchas), and commit.
- **Verification:** check every page in the built-in browser at 375px and desktop, and save screenshots into `screenshots/`. Build must pass (`npm run build`) before a phase counts as done.
- Skills: `ui-ux-pro-max:ui-ux-pro-max` (design-system generator + UX rules), `frontend-design:frontend-design`, `ui-ux-pro-max:ui-styling`. Keep brainstorming short, since the brief is fixed.
