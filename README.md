# 🌙 The Moon — live phase, 184 cultural moon poems, and Earth's shadow

A single self-contained HTML page. It draws the real Moon phase as original SVG over a
live starfield, pairs it with 184 original poems from 23 cultural traditions (each
non-English poem carries an English rendering), and — new in this version — **paints
Earth's umbra and penumbra across the Moon whenever a lunar eclipse is actually under
way.**

Open `moon-new-poems-true-dark-side.html` in any browser. That's it: no build, no
server, no dependencies.

![The partial lunar eclipse of 28 August 2026, rendered by the page's own SVG at eight
moments from first to last contact](eclipse-progression-2026-08-28.png)

---

**Live at [imortalimp.nl/moon-new-poems-true-dark-side.html](https://www.imortalimp.nl/moon-new-poems-true-dark-side.html)**

## What the page does

| | |
|---|---|
| **Live phase** | The lit crescent is computed from the true synodic phase, with a blurred terminator for a real light → twilight → dark falloff, and the bright limb oriented to the observer's horizon using SunCalc's illumination angle and the Moon's parallactic angle. |
| **Lunar surface** | Stylised near-side geography — Oceanus Procellarum, Mare Imbrium, Serenitatis, Tranquillitatis, Crisium, Fecunditatis, Nubium, Humorum — plus rayed craters (Tycho, Copernicus, Aristarchus) and Tycho's rays. |
| **Poems** | 184 original pieces across 23 locales, selected by phase; the locale menu switches language and script on the fly. |
| **Sky context** | Local time, Moon altitude/azimuth/compass bearing, cloud cover from OpenWeather, and a countdown to the next full Moon. |
| **Earth's shadow** | See below. |

---

## Earth's shadow (this version)

Two SVG circles sit in a new `<g id="eclipseShadows">`, drawn **over** the sunlit
surface — an eclipsed Moon is darkened by something passing in front of it, not by a
change on the surface — and clipped to the lunar disc:

- **Umbra** — the dark core. Near-black against a dazzling partial, warming to
  copper-red as totality arrives. That shift is deliberate: it models the eye
  adapting, which is why a deep partial looks charcoal in the moment but glows red
  once the Moon is wholly inside the shadow.
- **Penumbra** — the wide, slaty outer shade, fading from nothing at its rim to its
  deepest right at the umbral edge.

### How the geometry is computed

Every lunar eclipse from 2025 to 2060 is stored as three numbers, condensed from
NASA's *Five Millennium Catalog of Lunar Eclipses*: **instant of greatest eclipse ·
gamma · duration**.

1. **Where the Moon is relative to the shadow axis, right now.** Gamma gives the
   closest approach (in Earth radii, signed north/south); the catalogued duration
   gives the rate the Moon drifts across the shadow. Together:
   `σ(t) = √(σ_min² + (rate · Δt)²)`.
2. **How big the shadow is.** Straight from the true Earth–Moon and Earth–Sun
   distances: `ρ_umbra = 1.017 × (π_moon + π_sun − s_sun)`,
   `ρ_penumbra = 1.006 × (π_moon + π_sun + s_sun)`. The two enlargement factors are
   the classical Chauvenet/Danjon corrections, fitted here against the catalogue.
3. **Which way the shadow lies.** The offset is decomposed along the ecliptic
   (eastward = the direction the Moon drifts, northward = gamma), rotated into the
   observer's horizon frame, projected onto the plane of the sky, and finally
   expressed as an angle inside the SVG's own drawing frame — measured from the
   drawing's +x axis, which is the direction of the Sun.

Magnitudes and the obscured fraction of the disc follow from the two-circle
intersection of the Moon and the umbra.

### Accuracy

Checked against NASA's published values:

| Check | NASA | This page |
|---|---|---|
| Umbral magnitude, 28 Aug 2026 | 0.9299 | 0.9324 |
| Disc inside the umbra at greatest | 96.3 % | 96.4 % |
| Contact times, 28 Aug 2026 (P1 / U1 / max / U4 / P4) | 01:24 · 02:34 · 04:13 · 05:52 · 07:02 UT | 01:24 · 02:33 · 04:13 · 05:52 · 07:01 UT |
| Magnitudes across the whole catalogue (228 eclipses) | — | RMS 0.0034 (umbral), 0.0036 (penumbral) |
| First contact (P1) vs NASA, six checked eclipses | — | within 0–2 min, except 7 min on a magnitude-0.066 graze |
| First umbral contact (U1) vs NASA, same six | — | within 1–2 min |

Verified three ways: numerically, by rendering the page in headless Chrome and
measuring pixels (umbral cover 96.9 % measured vs 96.4 % computed; the surviving
bright sliver sits 179° from the shadow's centre), and by checking the limb — for
gamma +0.4964 the bite lands on the **southern** limb, leaving the northern edge lit,
exactly as NASA describes.

### Using it

- **Status line** under the full-Moon countdown: `🌍 Partial lunar eclipse · 96% of
  the disc is inside Earth's umbra`, or, when nothing is happening, a ticking
  countdown to first contact:

  ```
  🌍 Next penumbral lunar eclipse · Feb 20, 2027 10:11 PM · in 176d 4h 17m 03s · Moon up to 47°
  ```

  It counts to **first penumbral contact (P1)** — the moment the Moon's limb first
  reaches the shadow and the eclipse becomes observable at all — not to greatest
  eclipse, and the time shown is your local zone. When the countdown runs out the
  same line switches itself to the live eclipse report, and the shadow fades in over
  the first sliver of contact rather than popping.
- **Will you see it?** The countdown targets the next eclipse the Moon is actually
  above your horizon for (higher than 3° at some point), because a lunar eclipse is
  only an event on your side of the planet. Of the fourteen coming eclipses, four
  never clear the horizon from Amsterdam and are skipped; if none at all did, the
  line would say so rather than go quiet. While an eclipse is running, the same line
  reports where the Moon is for you — `· Moon 25° up`, or `· below your horizon`.
- **▶ Preview an eclipse…** — a menu of every lunar eclipse from **2025 to 2060**:
  81 of them, grouped by decade — 31 total, 20 partial, 30 penumbral. Pick one and
  the clock runs through it at ~420×, opening at first contact and looping back
  there; **⏹ Stop** returns to the present. Each entry carries its kind and size
  (`Mar 14, 2025 · total 1.18`, `Aug 28, 2026 · partial 93%`, `Feb 20, 2027 ·
  penumbral`), and the penumbral ones and the grazes that barely nick the umbra are
  in there too — a 6% nick is still an eclipse, and it is worth being able to see
  what one looks like. Each preview reports the Moon's own phase on that date
  (`· Full Moon 100%`) rather than assuming it.

  Entries you cannot watch from where you are are marked `· below your horizon`,
  and the marks are rebuilt when you move: from Amsterdam 25 of the 81 never clear
  the horizon, from Sydney 30 — and the total eclipse of 3 March 2026 is marked in
  Amsterdam but not in Sydney, because it happens with the Moon below one horizon
  and high above the other.

  The preview holds the sky still at greatest eclipse and lets only the shadow move.
  The Moon's face really does turn as the night goes on — about a degree a minute,
  which is why it appears to roll — but at 420× that honest roll reads as the whole
  disc spinning under the craters. Over the few minutes you would actually stand and
  watch, the face holds its orientation and the shadow crosses in a straight line,
  which is what the preview shows. Live, nothing is frozen.
- **Location and cloud.** With your permission the page asks the browser where you
  are and uses that for everything astronomical; refuse and it falls back to
  Amsterdam and says so (📍 Amsterdam, NL · default location, permission not
  granted). Cloud comes from OpenWeather: current conditions for tonight's Moon, and
  the 3-hour forecast for a coming eclipse **only when it is inside five days** —
  beyond that the page says nothing about cloud rather than guessing. With no key,
  no network or a refusal, the astronomy is unaffected; the visibility line simply
  reports the Moon's height and `sky conditions unknown`.
- **It follows you.** The page is not one reading taken at load: it watches the
  position and redraws when you actually move (a phone reports a new fix every few
  seconds even when it is still, so anything under ~2 km is ignored), re-asks the
  sky every ten minutes, and catches up the moment the tab is focused, the page
  becomes visible, or the connection returns. A hidden tab asks for nothing. Move
  far enough and the countdown retargets itself: from Amsterdam it points at
  February 2027, from Sydney at August 2027, because the first one never clears the
  horizon there. Every 20 seconds the 📍 line and the Moon's altitude refresh, and
  the countdown ticks every second.

---

## Orientation of the Moon

Three separate things decide how the disc is drawn, and they are now independent.

**1 · The terminator follows the Sun.** The previous rotation was
`brightLimb − parallacticAngle − 90`. Position angles run counter-clockwise in a true
(unmirrored) view of the sky, so that rendered the whole disc — phase *and* maria —
mirrored. It is now `−(brightLimb − parallacticAngle) − 90`. This matters for the
shadow: with the old sign, an umbra would bite the limb opposite the one the Sun
lights. To go back, flip that one line in `updateMoonVisual()`.

**2 · The maria follow the Moon's own pole, not the Sun.** Rotating the whole disc by
the bright limb — the obvious thing, and what this page used to do — is right for a
crescent but degenerate at full Moon. At full the Sun lies almost exactly behind the
observer, so the bright limb's position angle is the projection of a direction
pointing nearly at you: it swings through some 150° in a day and drags the face
around with it. Measured over the full Moon of 28 August 2026, from Amsterdam:

| | old (bright limb) | now (the pole) |
|---|---|---|
| total swing of the face over the day | 204° | **75°** |
| biggest hour-to-hour jump | 27.5° | **12.3°** |

The 75° that remains is real: it is the sky turning, and it matches the parallactic
angle's own range that day (+38° to −38°). The maria are given their own rotation,
taken back by the bright limb so it cancels out of their final orientation. What is
left is the pole's position angle against the parallactic angle — so the Moon is
drawn as *your* horizon shows it. At one instant, 28 August 2026 20:00 UT:

| Amsterdam | Sydney | Cape Town | Singapore | Anchorage |
|---|---|---|---|---|
| face at 258° | 54° | 162° | 12° | 310° |

**3 · The face nods and sways: libration.** The pole comes from Cassini's laws — the
lunar equator is inclined 1.5424° to the ecliptic, its node at the descending node of
the orbit, which puts the pole 1.5424° from the ecliptic pole on the far side of it.
From that and the direction to the observer follows the sub-observer point (l, b),
the selenographic spot directly beneath you, and the maria are shifted by it: up to
8° of longitude and 7° of latitude, which is 33 px across this 240 px disc. Because
it is worked out **topocentrically**, it carries the diurnal nod of about a degree
that depends on where on Earth you stand — at the instant above, Amsterdam sees
(l, b) = (−4.68°, −0.60°) and Sydney (−5.43°, −2.25°).

Checked against JPL Horizons (DE441, topocentric) at dates in both hemispheres:
**l and b to 0.08°, the pole's position angle to 0.02°.** The one-term lunar series
SunCalc ships is off by 1.4° in l, so the page carries its own series with the main
perturbations; `tools/libration.js` prints the comparison.

The map itself is drawn the way lunar maps are drawn — north up, Mare Crisium (east)
to the right — which is the IAU convention since 1961 and also the northern-hemisphere
naked-eye view. It is *not* mirrored.

---

## Repository layout

```
├── moon-new-poems-true-dark-side.html   ← the page (single file, drop it anywhere)
├── eclipse-progression-2026-08-28.png   ← verification strip, 8 moments, Chrome render
├── original/                            ← the page before eclipse shadows, for diffing
└── tools/                               ← the research + verification harness (optional)
    ├── suncalc.js                       SunCalc as bundled in the page (mourner/suncalc)
    ├── geo.js                           horizontal-frame vector helpers
    ├── lecat.html                       NASA catalogue page, as fetched
    ├── generate.js                      parse the catalogue + fit the enlargement factors
    ├── generate2.js                     derive drift rates, check contact times
    ├── build_table.js                   emit the 82-row table used by the page
    ├── eclipse_table.txt                that table (2025-2060)
    ├── eclipse_module.js / _module2.js  the code injected into the page
    ├── patch.py                         applies every edit to the page, reproducibly
    ├── test_page.js / test_rot.js       load the page in Node, check the maths
    ├── test_contacts.js                 first-contacts compared with NASA
    ├── test_countdown.js                countdown ticks; switches at first contact
    ├── test_live.js                     scripted moves: the page retargets itself
    ├── test_menu.js                     the eclipse dropdown: contents and marks
    ├── test_minor.js                    penumbral + grazing eclipses in the preview
    ├── test_orientation.js              face vs the pole; libration vs Horizons
    ├── libration.js                     the orientation maths, validated standalone
    ├── test_live_status.js              live line, location granted vs refused
    ├── test_freeze.js                   face still in preview, shadow moving
    ├── test_rollover.js                 accelerated clock through P1
    ├── shoot.js / progression.js        headless-Chrome screenshots
    └── analyse2.py                      pixel checks on those screenshots
```

A fuller archive (`moon-page-archive.zip`) adds an `extras/` folder that is kept for
the record rather than for the repository: the reference pages fetched from NASA,
the fourteen Chrome renders in `extras/shots/`, two mid-edit snapshots of the page
under `extras/backups/`, and the scratch scripts. Delete `extras/` if you want the
lean repository.

The tools are not needed to run the page. They need Node 20 for the JavaScript, and
Python 3 with Pillow + NumPy plus a Chrome binary for the render checks.

Two notes if you extend the model. The drift rate is recovered from the catalogued
duration, which for a grazing eclipse is the difference of two nearly equal lengths;
`eclipseAt()` therefore rejects anything outside 0.40–0.62 °/h and falls back to the
Moon's true motion. And the Moon's track is treated as a straight line across the
shadow, which is why the very shallowest grazes drift a few minutes at the penumbral
edge while the umbral contacts stay sharp.

---

## Before you publish

- **The OpenWeather key is in the page.** `OPENWEATHER_API_KEY` sits in the source, so
  anyone can read it with View Source. Restrict it to your own domains in the
  OpenWeather dashboard, or proxy the call server-side. It only feeds the
  "likely visible / cloud cover" line — the Moon and eclipse maths need no network at
  all.
- **Google Fonts** (Berkshire Swash, Space Grotesk) load from the CDN; offline, the
  page falls back to system fonts and still looks fine.
- **Don't commit a copy saved from the live site.** Cloudflare's bot-protection
  loader (a `window.__CF$cv$params` block plus a 1x1 iframe) is injected into
  responses automatically and gets baked into anything you save from the browser.
  It is about a kilobyte of noise and does nothing here. The file in this
  repository is clean of it; if you ever re-save from the site, strip that block
  before committing.

---

## Credits and licensing

- Page, poems, SVG Moon and all eclipse-rendering code: **River Lyle R. (Imortalimp)**.
  All 184 poems are original pieces written for this page. They draw on specifically
  named traditions, poets, artists, scientists and story figures; broad locale labels
  are not meant to suggest any culture has only one moon story. English texts beneath
  non-English poems are close renderings, not separate poems.
- **SunCalc** by Vladimir Agafonkin, bundled in the page — BSD-2-Clause,
  <https://github.com/mourner/suncalc>.
- **Eclipse data**: *Five Millennium Catalog of Lunar Eclipses*, Fred Espenak and
  Jean Meeus, NASA Goddard Space Flight Center — public domain,
  <https://eclipse.gsfc.nasa.gov/LEcat5/LE2001-2100.html>.
- "Peace · HATE ALL HACKERS OF CODE · 2026"
