# `src/lib/motion` · reusable motion building blocks

Small, dependency-light pieces used by `/variants/6/` (Čistá voda) and meant for the real homepage or any later site.
Ground rules for all of them:

- **Progressive enhancement.** The page is complete without JS. A block only hides or changes something after its script has run, and the static HTML always holds the final content.
- **Transform and opacity only.** Nothing animates layout, and nothing moves under text that someone is reading.
- **Reduced motion is a first-class version, not an off switch.** JS blocks run inside `withMotion()` (`gsap.matchMedia`), so toggling the OS setting reverts them live. CSS blocks use the same media query in `motion.css`. `global.css` forces `animation-duration: 0.01ms` under `reduce`, which would snap CSS animations to their *end* keyframe, so every CSS block sets `animation: none` explicitly.
- **Weight.** gsap core + SplitText + Flip ≈ 39 KB gzipped, loaded by dynamic import after `load`. Everything else here is a few hundred bytes to ~3 KB.

| Block | File | What it does | Reduced motion |
|---|---|---|---|
| Reduced-motion helper | `reduced.ts` | `withMotion(gsap, full, reduced?)` runs the full or the reduced branch and re-runs on preference change; `prefersReducedMotion()` for non-gsap code. | n/a (it *is* the switch) |
| Scroll reveal | `reveal.ts` | `[data-reveal]` and children of `[data-reveal-group]` fade + rise 20 px, 400 ms, ≤ 50 ms stagger, once. Never touches anything above the fold at start-up. | Not called; content is simply there. |
| Count-up | `count-up.ts` | `[data-count]` numbers count from 0 to the value in the HTML when they enter view. The real value stays in a visually-hidden span for screen readers; the animated copy is `aria-hidden` and fixed to the final width (no layout shift). | Not called; the HTML shows the final value. |
| Headline focus-in | `focus-in.ts` | Words go from a 6 px blur to sharp (≤ 600 ms) with SplitText, no opacity change, so the heading is readable and selectable the whole time; the split is reverted afterwards. Skipped if it can't start within ~1.8 s or the heading is off screen. | Not called. |
| Card ripple | `ripple.ts` + `.m-ripple` | A soft wash grows from the point where the pointer entered (CSS `clip-path: circle()`), also on `:focus-within`. | The wash appears without the growing transition. |
| Gallery filter + lightbox | `flip-gallery.ts` | Filter buttons (`aria-pressed`, polite live count) re-flow the grid with GSAP Flip; thumbnails are real links to the large image and open in a native `<dialog>` with a View Transition from the thumbnail. Arrow keys, Esc, backdrop click, focus returns to the thumbnail. | Filter and lightbox change instantly. |
| Marquee | `marquee.ts` + `.m-marquee` | Starts only when JS can also show a **visible pause button** (WCAG 2.2.2); pauses on hover and keyboard focus too; clones are `aria-hidden`. | Never starts; a static, wrapped row. |
| Smooth accordion | `.m-acc` (CSS) | Native `<details>` whose content height animates (`::details-content` + `interpolate-size`, Chromium 131+; instant elsewhere). | Instant. |
| Reading progress | `.m-progress` (CSS) | A 3 px bar driven by `animation-timeline: scroll(root)`; no JS. | Hidden. |
| Parallax | `.m-parallax` (CSS) | One image drifts ±20 px (40 px total) on a `view()` timeline inside an `overflow: hidden` frame. | Static. |
| Live status dot | `[data-live]` (CSS) | With `StatusScript`, the dot pulses twice while the place is open (`data-state="open"`), so it stops by itself within 5 s (WCAG 2.2.2). | A static ring. |
| Water light | `water-light.ts` | The one signature effect: raw WebGL2 caustics drawn over a real photo, only where the photo is water-coloured, with a gentle ripple on pointer/touch. Mounts after `load` + idle over the `<img>` poster (the LCP element), DPR ≤ 1.5, pauses off-screen and in hidden tabs, removes itself on context loss or if WebGL2 is missing. Adds a visible 44 px pause/play button (`aria-pressed`, WCAG 2.2.2). | One still frame, no loop, no ripples, no button. |

## Using it

```ts
import { withMotion } from '@/lib/motion/reduced';
const { gsap } = await import('gsap');
withMotion(gsap, () => {
  const undo = reveal(gsap, document);
  return undo;            // reverted automatically when the visitor turns on "reduce motion"
});
```

CSS blocks need `motion.css` imported by the page *after* a stylesheet that declares the cascade-layer order
(`@layer properties, theme, base, components, utilities;`). The page stylesheets are bundled before Tailwind;
without that line Tailwind's utilities would lose to these rules.
