Source: https://www.aquarea.sk/ (whole site), https://www.aquarea.sk/?mapa-webu=1&lang=sk (site's own sitemap)
Crawled: 2026-10-01

---

# SITEMAP: current aquarea.sk + proposed new structure

Audit of the Slovak version as of 1. 10. 2026. One Markdown file per page is in this folder. The file name is the URL path with `/` → `--`. Language coverage is in [LANGUAGES.md](LANGUAGES.md), images in [../source-images/SOURCES.md](../source-images/SOURCES.md).

## 1. Current page tree (SK)

Main navigation on every page: **O nás · Plážová zóna · Prémium zóna · Potápanie · Galéria · FotoFilmFest 2027 · Cenník · Kontakt**. The header also carries phone, e-mail, social icons, the language switcher and search. Under the hero there are 3 quick links: *OVÁRACIE HODINY* (sic), *AKTUALITY*, *ONLINE REZERVÁCIE*.

```
/ (Úvod)                                         home.md (hero + motto, 5 news teasers, partner logos, Google map)
├── /o-nas/                                      o-nas.md (story since 2011)
│   ├── /o-nas/aktuality/                        5 posts (2025–2026)
│   │   ├── …/vyuzitie-darcekovych-poukazov-2026-86sk.html      (4. 9. 2026)
│   │   ├── …/zmena-v-otvaracich-hodinach-85sk.html            (1. 9. 2026)
│   │   ├── …/sezona-2026-zacina-pri-vode-…-44sk.html          (23. 1. 2026)
│   │   ├── …/protokol-o-vykonani-…-voda-na-kupanie-49sk.html  (2. 7. 2025, scan image)
│   │   └── …/mapa-arealu-40sk.html                            (22. 2. 2025, map image)
│   └── /o-nas/kalendar-akcii/                   empty ("Nie sú dostupné žiadne aktuálne akcie.")
├── /plazova-zona-2/                             beach zone + event zone text
│   ├── …/pláž-76sk.html                         photo gallery (36)
│   ├── …/gastro-prevadzky-78sk.html             photo gallery only
│   └── …/event-zona-79sk.html                   photo gallery only
├── /premium-zona-3/                             apartments, camping, fishing
│   └── …/kemp-83sk.html                         photo gallery
├── /potapanie-2/                                Dive Center, intro dive, OWD course, freediving, rental
│   ├── …/potapacske-centrum-82sk.html           photo gallery (incl. map of underwater attractions)
│   ├── …/freediving-80sk.html                   photo gallery
│   └── …/apartmany-81sk.html                    photo gallery (apartments, filed under diving)
├── /galeria/                                    8 albums (Plážová zóna, Gastro, Event zóna, Potápačské centrum, Freediving, Apartmány, Kemping, Akcie)
├── /fotofilmfest-2027/                          festival intro (dates contradict subpages, see §5)
│   ├── …/propozicie-fotofilmfest-2026-fotografia/
│   ├── …/propozicie-fotofilmfest-2026-film/
│   ├── …/propozicie-medzinarodna-sutaz-vo-fotografovani-pod-vodou-2026/
│   ├── …/program-fotofilmfest-26-2792026/
│   ├── …/prihlaska-fotofilmfest-2026/                       FORM
│   └── …/prihlaska-medzinarodna-sutaz-vo-fotografovani-pod-vodou/  FORM
├── /cennik-1/                                   "Platný od 24.7.2026", links to 3 sub-lists
│   ├── /cennik-1/plazova-zona/
│   ├── /cennik-1/premium-zona-cast-kemping-apartmany/   (also contains EVENT ZÓNA prices)
│   └── /cennik-1/premium-zona-cast-dive-center/
└── /kontakt/                                    address, operator, contacts, map PDF
    ├── /kontakt/kontakt-na-areal/               (duplicate of /kontakt/ content, slightly different)
    ├── /kontakt/otvaracie-hodiny/               season 2026, by month
    ├── /kontakt/mapa-arealu/                    PDF only
    ├── /kontakt/prevadzkovy-poriadok/           PDF only (13 pages, see pdf--prevadzkovy-poriadok-2026.md)
    ├── /kontakt/gdpr/                           PDF only
    ├── /kontakt/rezervacie/                     index of 4 forms
    │   ├── …/rezervacia-skusobneho-zazitkoveho-ponoru-intro/   FORM
    │   ├── …/rezervacia-potapacskeho-kurzu/                    FORM
    │   ├── …/registracia-potapacskych-skupin/                  FORM + reverz PDF/XLSX
    │   └── …/rezervacia-pobytu-apartmany-kemping-dive-center/  FORM
    └── /kontakt/rezervacia-previo/              Previo booking engine in an iframe
```

System pages (CMS): `/?mapa-webu=1` (sitemap), `/?hledej` (search), `/?cookies=1`, `/sk/gdpr/statement/`, `/sk/tiraz/` (accessibility statement), `/?rss=200`.

## 2. Forms and booking flows

All six forms are CMS forms: `POST https://www.aquarea.sk/modules/formulare/send.php`. They send an e-mail request; nothing is booked instantly. Per the Prevádzkový poriadok (§3, §5) the reservation team then sends a price offer → deposit invoice (50 %, due in 3 days) → the reservation is confirmed by paying the deposit.

| Flow | URL | Collects | Notes |
|---|---|---|---|
| **Stay: apartments / camping / tent in Dive Center** | `/kontakt/rezervacie/rezervacia-pobytu-apartmany-kemping-dive-center/` | name, e-mail, phone, address, PSČ, arrival date (od 10:00) & time, departure date (do 09:00) & time, adults, children + ages, type (Apartmán / Stanovanie Dive center / Stanovanie Kemping), fishing yes/no, recreation voucher yes/no, company invoice + billing data, extras (altánok, predlžovačka, drevo, gril, uhlie, palice), notes, GDPR consent, anti-spam question | Arrival/departure hints are for camping; apartments are 14:00/10:00. |
| **Stay: Previo online booking** | `/kontakt/rezervacia-previo/` → iframe `https://booking.previo.app/?hotId=783841` | dates, then units: Apartmán č. 1–3, Kemp č. 3–7, "Potápanie" | Works (HTTP 200, hotel "AQUAREA Čierna Voda"). Only reachable via the Kontakt submenu. Previo shows "Hotel nemá nadefinované Obchodné a Storno podmienky". |
| **Intro dive (skúšobný ponor)** | `/kontakt/rezervacie/rezervacia-skusobneho-zazitkoveho-ponoru-intro/` | name, e-mail, phone, address, date of birth, recipient data if gift voucher, preferred date, height, weight, shoe size, note, consent, anti-spam | Also used for gift vouchers. |
| **Dive course (OWD / AOWD)** | `/kontakt/rezervacie/rezervacia-potapacskeho-kurzu/` | course (OWD / AOWD), same personal + gift + size fields as intro dive | No anti-spam question on this one. |
| **Dive group registration** | `/kontakt/rezervacie/registracia-potapacskych-skupin/` | organiser, e-mail, phone, agency (PADI, TDI/SDI/ERDI, NAUI, SSI, iné), licence no., address, dates & times, adults/children, company invoice, **file upload: filled reverz** (5 MB), consent, anti-spam | Downloads: `Potapacsky reverz 2026.pdf` / `.xlsx`. |
| **FotoFilmFest application** | `/fotofilmfest-2027/prihlaska-fotofilmfest-2026/` | name, address, e-mail, phone, photo categories A/B/C (0–3 photos each), film categories A/B/A+B + titles/annotations, publicity consent, GDPR consent | Fee 15 € (payment instructions sent afterwards). |
| **Underwater photo competition application** | `/fotofilmfest-2027/prihlaska-medzinarodna-sutaz-vo-fotografovani-pod-vodou/` | name, e-mail, phone, address, certification agency (PADI, SSI, TDI/SDI, CMAS, NAUI, UEF, IANTD, AIDA, Molchanovs, Apnea Academy, other), licence no., consents | Fee 30 €, max 30 competitors. |
| **Phone / e-mail** | `tel:+421902673675`, `mailto:rezervacie@aquarea.sk`; Dive Center `tel:+421901710840`, `divecenter@aquarea.sk` | — | Info & reservations: off-season 9:00–16:00, in season during opening hours, "ozveme sa späť". |
| **Online check-in "ALFRED"** | mentioned in Prevádzkový poriadok §5 | ID/passport data before arrival | No link anywhere on the site. |

Redesign rule: never rebuild these forms. Link each CTA to the live URL above, or to `tel:`/`mailto:`.

## 3. External links

| Link | Where | Status 1. 10. 2026 |
|---|---|---|
| https://booking.previo.app/?hotId=783841 | /kontakt/rezervacia-previo/ (iframe) | 200 |
| https://facebook.com/arealAQUAREA/ | header (icon only) | 200 |
| https://www.instagram.com/aquareaciernavoda/ | header (icon only) | 200 |
| https://www.youtube.com/watch?v=gDxC9pg4Rts | header (icon only) | 200, but it's a video "[LETO 2017]" from the channel LISA, not an Aquarea channel |
| https://www.google.com/maps/embed?pb=…Aquarea%20Čierna%20Voda… | homepage footer | embed |
| https://www.scubadiving.com/ | partner carousel | 403 to bots (probably fine for people) |
| http://www.freedivingacademy.sk | FotoFilmFest logo | 466 to bots (redirects to https) |
| http://www.pro-dive.sk/ | FotoFilmFest logo | 200 |
| https://www.restaurant-wien.sk/ | FotoFilmFest program (accommodation) | **404 – dead** |
| www.vendiofa.sk (plain text) | FotoFilmFest program | 200, not linked |
| "Petrov Grunt" (plain text) | FotoFilmFest program | no link |
| www.msosrzgalanta.sk (plain text) | Prémium zóna, fishing | 200, not linked |
| http://www.srzgalanta.szm.com/ (in PDF) | Prevádzkový poriadok | 200 (different URL than the web page) |
| https://www.igalileo.sk | footer (web technical operator) | 200 |

## 4. Downloads

| File | URL | Page |
|---|---|---|
| Mapa areálu (PDF, 219 kB) | `/e_download.php?file=data/editor/68sk_1.pdf…` (+ duplicate upload `20skabove_1.pdf` on /kontakt/) | /kontakt/mapa-arealu/, /kontakt/ |
| Prevádzkový poriadok 2026 (PDF, 495 kB) | `/modules/file_storage/download.php?file=fab514a7%7C4&inline=1` | /kontakt/prevadzkovy-poriadok/ |
| Ochrana osobných údajov (PDF, 163 kB, 2023) | `/modules/file_storage/download.php?file=0ac6ac6e%7C5&inline=1` | /kontakt/gdpr/ |
| Potápačský reverz 2026 (PDF + XLSX) | `/e_download.php?file=/data/editor/73sk_1.pdf…` / `…73sk_1.xlsx…` | registracia-potapacskych-skupin |

## 5. Content problems

**Contradictions (must be resolved by the owner, marked TODO in the redesign)**
1. **FotoFilmFest dates.** Menu/URL/heading say "2027". The intro says the first edition launches "v jari 2027" with the competition day on 15. 5. 2027, but the info table says "15. mája 2026 (Sobota)" (15. 5. 2026 was a Friday). All subpages (propozície, program, application forms) are for **FotoFilmFest 2026, 26.–27. 9. 2026**, which has already happened. The next edition's date is unclear. The redesign shows "FotoFilmFest 2027" with *TODO: potvrdiť termín*, and treats 26.–27. 9. 2026 as the last edition.
2. **Opening hours.** The web page `/kontakt/otvaracie-hodiny/` and the Prevádzkový poriadok PDF ("predbežné hodiny 2026") differ: June (PDF: every Fri–Sun from 1. 6.; web: specific dates from 5. 6.), 17.–30. 8. (PDF weekdays 10–20; web 10–19), September (PDF: beach & camping close 15. 9.; web: public until 13. 9., divers only 19.–20. and 26.–27. 9.). The web page is newer and is used.
3. **Afternoon discount.** Cenník: "Zľavnené vstupné (od 16:00)" adult 7,50 € (= 1,50 € off). Prevádzkový poriadok: "po 16.00 hod. … zľavu zo vstupného vo výške 1€". The cenník is used.
4. **Diver advance notice outside hours.** /kontakt/ says "minimálne viac dní vopred", /kontakt/kontakt-na-areal/ says "minimálne deň vopred", Dive Center cenník says "aspoň 2–3 dni vopred" (Sept–May).
5. **Camping pitches.** Cenník/poriadok: camping = places 3–7. Map PDF: "Kemping Miesta č. 2–7". Poriadok: Dive Center places "A, B, C, D, E, F, č. 2".
6. **Camping check-out.** Cenník "do 9:00". Poriadok "8:00–9:00 ráno alebo do 19:00 ak odchádza večer".
7. **Two ways to book a stay.** The forms vs Previo (hidden). Poriadok says bookings go "výhradne" through the form.
8. **Header e-mail.** The header uses aquarea@aquarea.sk (managing director's address); reservations use rezervacie@aquarea.sk.

**Outdated / thin content**
9. The 2026 season is over (vouchers valid until 27. 9.; "Od 28.9. je sezóna 2026 uzavretá"; October closed). There is no information on the 2027 season yet, which is fine but should be said clearly.
10. The homepage doesn't say what Aquarea is, what it costs or when it's open. It's a hero, 3 quick links and news only.
11. Gastro: "4 gastro prevádzky" (PDF) but no names, menus or hours. Only photos.
12. Kayak/canoe/SUP rental is by an external provider ("Dida Sport – Kajak komando", PDF only). No prices, no contact.
13. Kalendár akcií is empty, and the Aktuality include a 2025 water-quality protocol published only as a scanned image (not readable for screen readers, outdated).
14. The YouTube link in the header is a 2017 video from a third-party channel.
15. Meta: description is only "Aquarea Čierna Voda", and og:description says "Oficiálne facebookové stránky…" (copied from Facebook). Social icons have no text labels.
16. EN/HU homepages are empty; EN mistranslates "preukaz ZP" as "disability ID card" (see LANGUAGES.md).
17. GDPR document is from 2023.

**Duplicates & structure**
18. Every zone has "article" subpages that are just re-uploaded copies of the gallery albums (different image IDs, same photos). Apartments sit under *Potápanie*, Event zone prices sit under *Kemping & apartmány*.
19. /kontakt/ and /kontakt/kontakt-na-areal/ repeat the same contacts with small differences. The map PDF is uploaded twice.
20. Cenník index page is just three links; prices are three clicks deep from the homepage.

**Typos** (keep in mind when quoting, fix in redesign copy): "OVÁRACIE HODINY", "ddychové zóny", "korigované parkovisko" (probably "kontrolované"/"strážené"? TODO), "AQUAERA", "AQUAEA", "PREVÁDZKOVĚHO", "uhrázdať", "zázazníka", "itineráru" (= inventára), "(INTRO))", "lincencie", "freedivnig", "komfotnú", "väčie", "Platnosť dokumentu od: 1.1.20216".

## 6. Facts the redesign relies on (quick reference, all with sources)

- **Name / place:** Areál športu a relaxu AQUAREA, 925 06 Čierna Voda, Slovensko. GPS 48.115096, 17.613315 (/kontakt/). Former gravel pit between Veľké Úľany and Čierna Voda, okres Galanta. Built up since 2011 (/o-nas/). Cadastrally "obec Čierny Brod" (poriadok).
- **Operator:** AQUAREA s.r.o., Golfová 310/34, 900 50 Hrubá Borša, IČO 46 059 954, IČ DPH SK2023222135 (/kontakt/). Konateľ Ing. Monika Kobzová, +421 905 296 271, aquarea@aquarea.sk.
- **Info & rezervácie:** +421 902 673 675, rezervacie@aquarea.sk. **Dive Center:** +421 901 710 840, divecenter@aquarea.sk.
- **Zones:** Plážová zóna (public, paid entry) and Prémium zóna (by reservation: Dive Center, apartmány, kemping, privátne celosezónne miesta 8–28).
- **Not a natural swimming pool:** "Areál nie je prírodné kúpalisko. Kúpanie, vodné športy a potápanie len na vlastnú zodpovednosť." (aktualita image 977, poriadok §1.5). **No dogs or other animals.** **No motor boats.** Night quiet 22:00–7:00.
- **Dive Center:** since 2017; 5★ TDI/SDI/ERDI since 2020; DAN HIRA partner since 2021 ("ako jediné DC na Slovensku"); >1000 m of guide lines; zones OWD (5 m and 9 m), AOWD (descent buoy 30 m), DEEP (platform −30 m, buoy −35 m), TECH (bus – platform – tram); compressor BAUER POSEIDON 550 200/300 bar; AED; oxygen; DAN Europe cooperation.
- **Underwater attractions map** (image `dive-1164.jpg`, /galeria/potapacske-centrum-60sk.html): 1 Miesto pre bezpečnostnú zastávku −5 m · 2 Figurína a zastávka −6 m · 3 Rúra −6,7 m · 4 Výcviková plošina + zrkadlo −5 m · 5 Autobus −8/−12 m · 6 Vaňa & bicykel −10 m · 7 Kotlina −9 m · 8 Bojler −8 m · 9 Vorkoholik −8 m · 10 Kesón −8 m · 11 Rakety −9 m · 12 Telefónna búdka −9 m · 13 Zvonica −8 m · 14 Šrotovník −9 m · 15 Plachetnica Danka −15 m · 16 Električka −8/−13 m · 17 Lietadlo −3/−6 m · 18 Plošina s rúrou −8 m · 19 Loď −7 m · 20 Auto & bicykel −7 m · 21 Sud −7 m · 22 Váha −6 m · 23 Vaňa −8 m · 24 Bojler −8 m · 25 Koleso sekačky −7 m · 26 Benzínová pumpa & bojler −8 m · 27 Bojler −8 m · 28 Raketa GRAD −8 m · 29 Betón −22 m · 30 Hlboká plošina −30 m AOWD · 31 Ílovitá stena −18/−26 m AOWD · 32–34 Križovatky · 35–36 Plošiny s kotviacimi lanami · 37 Motorka. Map also marks FREE Diver points at −20 m and −36 m.
- **Freediving:** FREEDIVING ACADEMY (Jaroslav Figura): level I, level II, Apnea Discovery; platform "Ostrov" mid-lake (max depth 35 m); static platform at 1,5 m (8 pairs).
- **Prices, hours:** see `cennik-1--*.md` and `kontakt--otvaracie-hodiny.md` (structured into `src/content` data files in Phase 2).

---

## 7. Proposed new information architecture

Goal: a visitor on a phone finds **what / how much / when / how to book / how to get there** in at most one tap from any page. The current 8 menu items + 20 subpages become **5 main items + 1 CTA**. The secondary pages live in the footer.

### Page tree

```
/                       Úvod: what Aquarea is (2 zones + Dive Center), status today (open/closed + next date),
                        3 zone entry cards, prices teaser, hours teaser, FotoFilmFest teaser, gallery teaser,
                        how to get there, contact/booking CTA
/plazova-zona/          Plážová zóna: what's there (activities, playground, jetties, 4 gastro, Event zóna),
                        who it's for, entry rules, info & recepcia, prices teaser → /cennik/#plaz
/premium-zona/          Pobyt pri jazere: Apartmány (3 units, equipment, check-in/out), Kemping (5 pitches 3–7),
                        Rybolov, how booking works (offer → 50 % deposit), deposit & rules, CTA Previo + form
/potapanie/             Dive Center: why here (certifications, safety), underwater attractions map (37 points),
                        Skúšobný ponor (90 €), Kurzy OWD/AOWD (590 €), Freediving, Požičovňa, Registrácia skupín,
                        rules for divers, CTA per service
/cennik/                One page, 3 tabs/sections: Plážová zóna · Kemping & apartmány (+ Event zóna) · Dive Center
/otvaracie-hodiny/      Season overview + month tables, "today" status, last entry 1 h before closing
/rezervacie/            One hub: "Čo chcete rezervovať?" → Pobyt (Previo / formulár) · Skúšobný ponor · Kurz ·
                        Potápačská skupina · Event/oslava (tel/mail) — each links to the live aquarea.sk flow
/kontakt/               Contact cards (Info & rezervácie, Dive Center, konateľ), Ako sa k nám dostať (map, GPS,
                        navigation links), Mapa areálu, Prevádzkovateľ (company data)
/fotofilmfest/          About the festival, next edition (TODO date), last edition program (26.–27. 9. 2026),
                        propozície (3, accordion), applications → live forms
/galeria/               All albums on one page with filter chips (Pláž, Potápanie, Pod hladinou, Kemping,
                        Apartmány, Gastro, Event zóna, Freediving, Akcie)
/o-nas/                 Príbeh, Aktuality (latest posts), Dokumenty (Prevádzkový poriadok, GDPR, Mapa areálu PDF)
/404
(i18n later: /en/…, /hu/… with the same structure)
```

### Main navigation (mobile: bottom-sheet menu + sticky CTA bar)

`Pláž` · `Pobyt` · `Potápanie` · `Cenník` · `Kontakt` + primary button **Rezervovať** (→ /rezervacie/)

Header utility (desktop): today's status ("Dnes zatvorené · sezóna 2026 skončila" / "Dnes 9:00–20:00") → /otvaracie-hodiny/, phone link.

Sticky mobile CTA bar (bottom): **Zavolať** (tel:+421902673675) · **Rezervovať** (/rezervacie/) · **Navigovať** (Google Maps directions to 48.115096, 17.613315).

### Footer

1. **Kontakt:** Info & rezervácie +421 902 673 675, rezervacie@aquarea.sk · Dive Center +421 901 710 840, divecenter@aquarea.sk
2. **Adresa:** Areál športu a relaxu AQUAREA, 925 06 Čierna Voda · GPS · "Navigovať"
3. **Rýchle odkazy:** Otváracie hodiny · Cenník · Rezervácie · FotoFilmFest · Galéria · O nás
4. **Dokumenty:** Prevádzkový poriadok (PDF) · Mapa areálu (PDF) · GDPR (PDF) — linked to the live files
5. **Sociálne siete:** Facebook · Instagram (labelled links)
6. **Prevádzkovateľ:** AQUAREA s.r.o., Golfová 310/34, 900 50 Hrubá Borša, IČO 46 059 954
7. Small print: "Koncept redizajnu, neoficiálna verzia. Obsah, fotografie a logo © AQUAREA s.r.o." · language switcher placeholder (SK · EN · HU, later)

### Old → new URL map (for redirects at launch, TODO)

| Old | New |
|---|---|
| /plazova-zona-2/ (+ subpages) | /plazova-zona/ |
| /premium-zona-3/ (+ kemp) | /premium-zona/ |
| /potapanie-2/ (+ subpages) | /potapanie/ (apartmány → /premium-zona/#apartmany) |
| /cennik-1/ (+ 3 subpages) | /cennik/ (#plazova-zona, #kemping-apartmany, #dive-center) |
| /kontakt/otvaracie-hodiny/ | /otvaracie-hodiny/ |
| /kontakt/rezervacie/ (+ 4 forms), /kontakt/rezervacia-previo/ | /rezervacie/ (forms stay on the old system until a new backend exists) |
| /kontakt/, /kontakt/kontakt-na-areal/, /kontakt/mapa-arealu/ | /kontakt/ |
| /kontakt/prevadzkovy-poriadok/, /kontakt/gdpr/ | /o-nas/#dokumenty |
| /fotofilmfest-2027/ (+ 6 subpages) | /fotofilmfest/ |
| /galeria/ (+ 8 albums) | /galeria/ |
| /o-nas/ (+ aktuality, kalendár) | /o-nas/ |
