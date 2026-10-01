# Aquarea Čierna Voda: redesign concept

An unapproved redesign concept for https://www.aquarea.sk/ (Slovak only, `noindex`). The brand, logo, photos and texts belong to AQUAREA s.r.o.

- Rules and working protocol: [AGENTS.md](AGENTS.md)
- State of the work: [PROGRESS.md](PROGRESS.md)
- Decisions: [DECISIONS.md](DECISIONS.md)
- Content audit of the current site: [content-audit/](content-audit/) (start with `SITEMAP.md`)
- Downloaded photos and their sources: [source-images/SOURCES.md](source-images/SOURCES.md)

## Run it

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve dist/ locally
```

The three homepage directions are at `/variants/1/`, `/variants/2/`, `/variants/3/` and the picker at `/variants/`.

## Where things live

| What | Where |
|---|---|
| Prices, hours, contacts, zone texts, diving, FotoFilmFest, news | `src/content/*.json` (every block has its aquarea.sk `source` URL) |
| Photos used on the site + Slovak alt texts | `src/assets/photos/`, `src/content/photos.json` |
| Data validation, formatting, opening-hours status | `src/lib/` |
| Visible TODO markers | `<Todo>` component; list them with `npm run build && npm run todos` |

## Scripts

- `npm run og`: rebuild `public/og.jpg` from the real hero photo + logo.
- `npm run shots -- http://localhost:4321 screenshots/x /variants/1/`: full-page screenshots at 375 px and 1440 px using the installed Google Chrome (`playwright-core`).

## Deployment

`.github/workflows/deploy.yml` can deploy to GitHub Pages (it sets `SITE_URL`/`BASE_PATH`), but **nothing is pushed or published** until Aquarea approves.
