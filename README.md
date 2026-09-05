# 🌙 Imortalimp.NL — Moon Page · Poems, Shadows & Eclipses

A single-file HTML moon page: **184 cultural moon poems**, a live Moon drawn
as your eye sees it from your latitude/longitude, and timed previews of every
lunar eclipse — partial bites, copper totalities and penumbral duskings —
rendered with plain SVG (no filters, no images, no build step).

**Current release: v14 — `FIXED v14 (2026-09-05, seamless vivid twilight)`**
The shipped page is [`moon-new-poems-true-dark-side.html`](moon-new-poems-true-dark-side.html).

---

## ⚠️ Deployment notes (read first)

1. **The page file was deleted from this repository on 2026-09-05**
   (commit `1bad3be0`). Until it is re-added, GitHub Pages / raw links serve
   nothing. Upload `moon-new-poems-true-dark-side.html` to the repository root
   (or your host) and **hard-refresh** (Ctrl/Cmd-Shift-R) — caches have served
   stale copies before.
2. **Review your GitHub sessions and personal access tokens.** A deletion of
   the tracked page file from a logged-in session is exactly what a leaked
   token or hijacked session can do. Rotate anything you are not sure about.
3. Every fix round is preserved as `moon-page-fixed-vN.html` (v2–v14) with its
   marker in the `<title>`, so any previous look can be restored or compared.

---

## What the page does

### True ground-to-sky orientation
The Moon is rotated so the bright limb faces the Sun *as seen from your
horizon*: the screen angle of the Sun's direction at the Moon's place in the
sky, clockwise from zenith-up, taken from the two bodies' horizon positions
(the old phase-angle formula degenerates at opposition). The maria answer to
the pole instead of the Sun (parallactic angle minus the pole's position
angle) and nod with libration, so the face is drawn as your sky shows it —
north up when it culminates in the north, upside down in the south.

### Eclipse engine (derived from `tools/eclipse_module.js`)
Earth's shadow is painted as translucent radial-gradient layers **over** the
sunlit, maria'd Moon, so the surface stays visible and darkens under the
umbra as it grows:

* **Penumbra** — three-stop fade `0.9 / 0.5 / 0` of `#080a12`, inner edge to rim.
* **Umbra** — near-black (`α 0.92–0.98`) against a sunlit Moon, blending to
  copper from umbral magnitude 0.45 (smoothstep), the soft atmospheric edge
  baked into the gradient's outer stops — no SVG filter.
* Geometry (shadow angle, radii, magnitudes) validated against the
  repository's own renders (`repo/progression.png`, `repo/pen2027.png`) and,
  for orientation, against a precision ephemeris ground truth
  (`truth_ephem.py`, agreement ≤ 1.0° in shadow direction).

### Terminator twilight — the v14 ring stack
The light→twilight→dark falloff is a dense stack of **nested crescent paths**,
drawn above the sunlit surface and following the terminator's curve from pole
to pole:

* every band reaches the terminator and is stacked big-to-small, so each band
  shows exactly **one** anti-aliased outer arc — no shared interior edge, no
  seams, no combing, in any renderer;
* band alphas and colours are solved by exact premultiplied *unmixing*, so the
  composite reproduces the target ramp (pale slate haze → deep blue-green
  twilight) at every depth, with equal alpha steps (≈0.018, ~4/255 — below
  visible banding);
* the profile is a smoothstep over ~one lunar radius into the light side
  (substantial dusking of the sunlit face) with flat slope at both ends, plus
  a cosine-bell rim *haze* straddling the terminator — the soft double
  crescent, never a hard line;
* the whole stack vanishes at New and Full Moon (`4·f·(1−f)`), so an eclipsed
  Full Moon never grows a phantom rim.

### Penumbral eclipses are rendered by the same stack
When the umbra is not biting but penumbral contact holds, the stack's contours
become circles concentric with Earth's penumbra and its profile becomes the
penumbra's own: nothing outside the penumbra's edge (flat there, as two discs
just touching), climbing to `penMax = 0.88` one penumbra-width in — that width
being the Sun's diameter (`rhoP − rhoU`). The radial overlay steps aside so
nothing doubles. Result: the whole sunlit face dims smoothly toward the
shadow limb (≈0.76 cumulative alpha at greatest for 2027-02-20), maria still
ghosting through.

---

## Verification harnesses (Puppeteer)

```bash
npm install puppeteer          # jsdom optional
pip install ephem              # only for truth_ephem.py ground truth
node v14.js                    # live moon, phase strip, penumbral + partial +
                               # total previews, repaint timing, page errors
node ifr14.js                  # same states inside sandbox="allow-scripts"
                               # iframe  -> renderer-parity guarantee
node pen13.js                  # Feb 2027 penumbral + Aug 2026 greatest strip
python3 scan.py v14-scan.png   # per-pixel luminance profile / max jump report
```

Standing checks that must stay green:

* `node --check` on both inline `<script>` blocks;
* zero `pageerror`s in direct and sandboxed-iframe renders;
* pixel scan across the terminator: monotone descent, largest interior steps
  at the maria (surface art), never at the gradient;
* partial/total renders keep the repo-validated copper recipe
  (`z-greatest.png` / `v14-greatest.png`, `v14-total.png`).

Calibration fact worth keeping: compositing transfer of these flat fills is
1:1 (white α=1 probe measured 246 inside, 0 outside), so alpha values can be
trusted as rendered luminance deltas.

---

## Repository layout

| Path | What it is |
| --- | --- |
| `moon-new-poems-true-dark-side.html` | **The page** (v14, title marker carries the version) |
| `moon-page-fixed-v2..v14.html` | every shipped fix round, restorable |
| `original/`, `uploads/…` | untouched original (sha `881fea3a…`) for diffing |
| `tools/eclipse_module.js` | the repo-validated eclipse recipe the page follows |
| `tools/progression.js`, `tools/shoot_pen2027.js` | render the reference progression / penumbral charts |
| `repo/*.png` | reference renders the visuals were matched against |
| `v14.js`, `ifr14.js`, `pen13.js`, `scan.py`, `cal.js` | verification harnesses |
| `truth_ephem.py` | precision ephemeris ground truth (do **not** use `truth.js` — its internal GT is coarse) |

---

## Version history (one line each)

* **v2–v5** — next-eclipse preview fixed; true ground-to-sky orientation; light-off surface experiments (superseded).
* **v6–v8** — baked copper terminator attempts on live moon and previews.
* **v9** — eclipse package derived from `tools/eclipse_module.js` (translucent overlays, copper totality).
* **v10** — electric silver-blue moon surface; vivid yellowish-blue terminator.
* **v11** — double-crescent arc gradient, pronounced feathered fade.
* **v12** — correction: the gradient bites into the *light* side.
* **v13** — penumbral gradient dusking: 9 gentle steps to −164; penumbral eclipses rendered by the stack.
* **v14** — *this release*: nested equal-alpha crescents (no hard edges anywhere, no combing), dark ramp that substantially darkens the sunlit face, cosine rim haze, physical penumbral profile.

---

## Upcoming eclipses the menu already knows

| Date (UTC) | Type | Notes |
| --- | --- | --- |
| 2026-08-28 04:12 | partial | γ +0.496 — copper bite validated |
| 2027-02-20 23:12 | penumbral | γ −1.048, penMag 0.93 — the stack renders it |

Licensed as per [`LICENSE`](LICENSE). The page ships an OpenWeather key in
source — restrict it to your domain or proxy the weather call server-side;
the Moon and eclipse maths need no key at all.
