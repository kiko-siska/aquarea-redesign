Source: https://www.aquarea.sk/en/ and https://www.aquarea.sk/hu/ (+ the pages linked from their menus)
Crawled: 2026-10-01

---

# Which pages exist in EN / HU

The language switcher in the header offers SK / EN / HU. EN and HU are **partial** translations. Their homepages (`/en/`, `/hu/`) contain only a heading ("Homepage Aquarea Čierna Voda" / "Kezdőlap Aquarea Čierna Voda"), with no news, no hero motto and no quick links.

The EN/HU pages live under their own slugs (not under `/en/…` or `/hu/…`), e.g. `/beach-zone/`, `/strandzona/`. All returned HTTP 200.

| SK page | EN | HU |
|---|---|---|
| Úvod `/` | `/en/` (empty) | `/hu/` (empty) |
| O nás `/o-nas/` | — | — |
| Aktuality, Kalendár akcií | — | — |
| Plážová zóna `/plazova-zona-2/` | Beach zone `/beach-zone/` | Strandzóna `/strandzona/` |
| Prémium zóna `/premium-zona-3/` | Premium zone `/premium-zone/` | Prémium zóna `/premium-zona-4/` |
| Potápanie `/potapanie-2/` | Diving `/diving/` | Búvárkodás `/buvarkodas/` (shorter: ~2.9k chars vs ~6k EN) |
| Galéria `/galeria/` | — | — |
| FotoFilmFest 2027 (+6 subpages) | — | — |
| Cenník `/cennik-1/` | Price list `/price-list/` | Árlista `/arlista/` |
| Cenník – Plážová zóna | `/price-list/beach-zone/` | `/arlista/strandzona/` |
| Cenník – Kemping & apartmány | `/price-list/premium-zone-kemping-and-apartments/` | `/arlista/premium-zona-kemping-es-apartmanok-resze/` |
| Cenník – Dive Center | `/price-list/premium-zone-dive-center/` | `/arlista/premium-zona-dive-center-resze/` |
| Kontakt `/kontakt/` | Contact `/contact/` | Kapcsolatba lépni `/kapcsolatba-lepni/` (index only) |
| Kontakt na areál | `/contact/contact-on-campus/` | `/kapcsolatba-lepni/kapcsolatfelvetel-az-egyetemen/` |
| Otváracie hodiny | `/contact/opening-hours/` | `/kapcsolatba-lepni/nyitvatartas/` |
| Mapa areálu | — | — |
| Prevádzkový poriadok | `/contact/operating-rules/` | — |
| GDPR | `/contact/gdpr/` | — |
| Rezervácie (index) | `/reservations-1/` | `/foglalasok/` |
| Rezervácia pobytu (apartmány/kemping/DC) | `/reservations-1/reservations-apartments-camping-diving/` | `/foglalasok/szallasfoglalas-apartmanok-kemping-buvarkozpont/` |
| Rezervácia kurzu / INTRO ponoru / skupín | — | — |
| Rezervácia Previo | — | — |

## Translation problems noticed
- "Contact on campus" / "Kapcsolatfelvétel az egyetemen" (= "at the university"): machine-translated "areál".
- EN beach price list: "Child admission (4–14 years) – discount is available only upon presentation of a valid **disability** ID card". The Slovak original says *preukaz ZP* (health-insurance card), not a disability card.
- EN/HU have no dive-course or intro-dive booking forms, so foreign divers can't book a course online.

## Implication for the redesign
Build SK first with i18n-ready routing (`/`, later `/en/`, `/hu/` with the same slugs). The current EN/HU slugs can be redirected later.
