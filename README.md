# Imortalimp.NL-MoonPage-Poems-Shadows-Eclipses-HTML-
MoonPage-Poems-Shadows-Eclipses (HTML)
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

Verified three ways: numerically, by rendering the page in headless Chrome and
measuring pixels (umbral cover 96.9 % measured vs 96.4 % computed; the surviving
bright sliver sits 179° from the shadow's centre), and by checking the limb — for
gamma +0.4964 the bite lands on the **southern** limb, leaving the northern edge lit,
exactly as NASA describes.

### Using it

- **Status line** under the full-Moon countdown: `🌍 Partial lunar eclipse · 96% of
  the disc is inside Earth's umbra`, or the next eclipse's date and kind when nothing
  is happening.
- **▶ Preview next eclipse** — eclipses are rare, so this runs the clock through the
  nearest one with a real bite (umbral magnitude ≥ 0.25) at ~420×, sweeping ±2.4 h
  around greatest eclipse and looping. Click again to return to live time.
- Nothing needs the network except the optional cloud-cover line.

---

## Orientation fix

The previous rotation was `brightLimb − parallacticAngle − 90`. Position angles run
counter-clockwise in a true (unmirrored) view of the sky, so that rendered the whole
disc — phase *and* maria — mirrored. It is now `−(brightLimb − parallacticAngle) − 90`.
This matters for the shadow: with the old sign, an umbra would bite the limb opposite
the one the Sun lights. To go back, flip that one line in `updateMoonVisual()`.

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
    ├── shoot.js / progression.js        headless-Chrome screenshots
    └── analyse2.py                      pixel checks on those screenshots
```

The tools are not needed to run the page. They need Node 20 for the JavaScript, and
Python 3 with Pillow + NumPy plus a Chrome binary for the render checks.

---

## Before you publish

- **The OpenWeather key is in the page.** `OPENWEATHER_API_KEY` sits in the source, so
  anyone can read it with View Source. Restrict it to your own domains in the
  OpenWeather dashboard, or proxy the call server-side. It only feeds the
  "likely visible / cloud cover" line — the Moon and eclipse maths need no network at
  all.
- **Google Fonts** (Berkshire Swash, Space Grotesk) load from the CDN; offline, the
  page falls back to system fonts and still looks fine.

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
