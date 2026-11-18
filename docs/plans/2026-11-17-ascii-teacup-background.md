# ASCII Rotating Teacup Background — Spec

**Status:** proposed, not implemented
**Target repo:** `My_Resume` (Angular 21, standalone components, Karma/Jasmine, Bun)
**Deliverable:** a decorative, always-on background layer behind every route that renders a procedurally rotated teacup as monospace ASCII, without affecting layout, reading flow, accessibility, PDF export, or the PWA shell.

---

## 1. Intent

A slowly rotating ASCII teacup sits behind the site content. It is generated from real 3D geometry each frame (surface of revolution + handle), not from hand-drawn sprite frames, so it can rotate continuously at any angle and stay crisp at any viewport size.

The cup is decoration only. All existing UI, content, contrast, and interaction behavior must be unchanged.

## 2. What it looks like (visual acceptance)

- A dark, low-contrast cup silhouette built from ~1,000 occupied monospace cells at 1440×900 (a 132×56 grid) on a fixed, viewport-sized layer.
- Rotation is continuous about the vertical axis, one full turn every ~13 s, plus a fixed 22° downward camera tilt so the rim opening and interior wall are visible.
- The cup is centered vertically, horizontally centered on small screens and shifted right by ~6% of the glyph grid on `>= 1024px` so the hero copy column stays clean.
- A saucer and a swept C-handle are present; the handle visibly travels from right → front → back → left as the cup turns.
- Interior (cavity) wall is dimmer than the exterior; the rim annulus reads brightest where it turns toward the light.
- Glyph color follows the active theme accent at low opacity (dark theme: 22%, light theme: 30%). No new colors are introduced.
- Nothing moves on hover, click, or scroll. Scrolling never re-renders the layer.

## 3. Non-goals

- No interaction, no mouse parallax, no click-to-spin, no audio.
- No WebGL/canvas/three.js dependency; ASCII only, one `<pre>`.
- No steam, bubbles, tea surface, or reflection in v1 (see §12, deferred).
- No change to PDF generation (`jspdf` / `pdf-lib`), the resume print layout, or `portfolio.data.ts`.
- No new npm dependencies.

## 4. Architecture

```
teacup-mesh.ts              pure: profile → Float32Array vertices (x,y,z,nx,ny,nz,mat) + Uint32Array quads
teacup-renderer.ts          pure: (parts, view) → char grid, z-buffered, ASCII ramp
ascii-teacup.component.ts   DOM/RAF/resize/lifecycle glue, runs outside Angular zone
app.component.html          <app-ascii-teacup /> as first child of .app-shell
src/styles/theme.scss       --teacup-opacity token (:root dark, [data-bs-theme="light"])
```

Rules:

- `teacup-mesh.ts` and `teacup-renderer.ts` import nothing and touch no DOM. They are unit-tested directly.
- The component owns exactly one `<pre>` and writes `textContent`. No per-frame Angular change detection, no template bindings.
- Every scratch buffer (rotated vertices, depth, chars) is allocated once and reused; per frame the only allocation is the output string.

## 5. Geometry

World space: Y up, right-handed, camera on **+Z** looking toward **−Z**, orthographic projection.

### 5.1 Cup body profile

The path runs from the base on the axis, up the outside, over the rim, and back down the inside to the axis, so the revolution is a closed hollow vessel:

| # | r | y |
|---|---|---|
| 0 | 0.000 | 0.070 |
| 1 | 0.120 | 0.070 |
| 2 | 0.160 | 0.105 |
| 3 | 0.240 | 0.240 |
| 4 | 0.330 | 0.470 |
| 5 | 0.430 | 0.790 |
| 6 | 0.480 | 0.960 |
| 7 | 0.500 | 1.000 |
| 8 | 0.484 | 1.000 |
| 9 | 0.440 | 0.950 |
| 10 | 0.345 | 0.760 |
| 11 | 0.245 | 0.470 |
| 12 | 0.170 | 0.300 |
| 13 | 0.120 | 0.230 |
| 14 | 0.000 | 0.200 |

- Resample by cumulative arc length to **40** points (`resampleProfile`) so quads are evenly sized and shading bands do not bunch at the rim.
- The table is a **unit-height** profile: the builder scales every `y` by `TEACUP_HEIGHT = 0.78`, so the finished cup is wider than tall. At height 1.0 the rim diameter equals the height and the object reads as a mug, not a teacup.
- Revolve with **44** radial segments over `[0, 2π)`.
- The axis rings collapse two quad corners onto one point; those triangles are kept so the base and the floor close.
- Base sits at `y = 0.070`; saucer top center is `y = 0.066`, leaving 0.004 clearance against z-fighting. (Both values in unit height; `× 0.78` after the scale.)

### 5.2 Saucer

Separate revolution, resampled to **16** points, **36** radial segments:

```
(0.000, 0.000) (0.348, 0.000) (0.487, 0.018) (0.545, 0.038)
(0.580, 0.052) (0.545, 0.062) (0.487, 0.056) (0.348, 0.040) (0.000, 0.066)
```

### 5.3 Handle

A tube swept along the arc of the circle through three points, so both ends land in the wall instead of floating:

- attachment points taken from the cup profile: `P1 = (0.240, 0.240)`, `P2 = (0.430, 0.790)`
- apex: `P3 = (0.720, 0.560)`
- circumcircle of `P1,P2,P3` computed in code (determinant formula) — for these three points it is center `(0.424, 0.484)`, `R = 0.306`
- take the arc from `P1` through `P3` to `P2` (≈ 216°), **20** arc segments, **6** tube sides, tube radius **0.07** (thin tubes dissolve into 1–2 cells and stop reading as a handle)
- cross-section frame: tangent `T`, `B = (0,0,1)`, `N = normalize(T × B)`; point = `A + r(cos φ·N + sin φ·B)`
- both ends inset 0.02 toward the cup axis so no cap is visible
- max extent `x ≈ 0.730 + 0.070 = 0.800`; the fittings below account for it

### 5.4 Normals and materials (do not use cross products)

Vertex normal is derived from the profile tangent, then revolved:

```
profile tangent at point i: t = (dr, dy)      (central difference)
2D outward normal:          n = normalize( dy, -dr )
vertex normal:              ( n.x·cosθ,  n.y,  n.x·sinθ )
```

`dy` is used verbatim: even `dr = 0` at the flat saucer bottom yields `(±1, 0)`-style normals, and a zero-length tangent falls back to `(0, 1)`.

**The quad winding flips where the profile reverses at the rim**, so a geometric `(v1−v0)×(v2−v0)` normal points into the cavity on the outer wall and out of it on the inner wall — cavity shading then inverts and the cup renders as a solid slab. This was reproduced in a prototype; hence stored normals only.

`mat` is a per-vertex scalar baked at build time:

- cup body, every point at or past the profile's maximum-`y` sample (the cavity leg): `0.5`
- everything else (outer wall, the flat rim segment, saucer, handle): `1.0`

Each builder call takes `style: "vessel" | "solid"`; the marker is applied only for `vessel`, to points whose `y` is at or after the maximum-`y` sample and whose `y` is not increasing. Apply it after `resampleProfile`, not against the raw table indices — the sample positions do not correspond to table rows. Saucer and handle are `solid`: the saucer's upper surface returns toward the axis with `dy < 0` and must stay fully lit.

Vertex stride is **7**: `x, y, z, nx, ny, nz, mat`. `mat` is baked at build time and read verbatim by the rasterizer, so no yaw angle can flip a face between exterior and cavity.

Total quads: ≈ 1,700 (body) + 540 (saucer) + 120 (handle) ≈ 2,400. The first build used 48/56 and 24/48 samples; the coarser mesh measured 3× cheaper per frame with no visible difference at 12–22% opacity.

## 6. Render pipeline

### 6.1 Per-frame transform

One fused loop over the vertex array, writing into a reused scratch array of the same stride:

1. yaw about Y: `x' = x·cosψ + z·sinψ`, `z' = −x·sinψ + z·cosψ`
2. pitch about X (22° down-view): `y'' = y'·cos p − z'·sin p`, `z'' = y'·sin p + z'·cos p`

   The signs matter: the swapped form views the cup from *below*, the near wall hides the bowl, and the rim opening never appears. This was reproduced and fixed in the first implementation pass.

Normals get the same two rotations (no translation). Camera faces −Z, so larger `z''` is nearer.

### 6.2 Grid sizing and projection

Measured once per resize (and once after `document.fonts.ready`), using a canvas `measureText("M")` with the computed font string of the `<pre>`:

```
cellW, cellH = measured; fallback 6.6 × 11
cols = clamp(floor(vw / cellW), 40, 132)
rows = clamp(floor(vh / cellH), 20, 56)
a    = cellW / cellH                    (~0.60)
```

Fit the object (world height 1.0 from saucer bottom to rim; half-width 0.825 including the rotating handle plus margin):

```
rowsPerUnit = min(rows * fitH / 1.4, cols * fitW * a / 1.65)
colsPerUnit = rowsPerUnit / a
```

The vertical divisor is **1.4**, a deliberate margin: the projected silhouette is **1.13 world units** tall, so 1.4 leaves ~23% headroom. Derivation (22° pitch): the far rim edge is `0.78·cos22 + 0.5·sin22 = 0.910` and the saucer's near edge is `−0.58·sin22 = −0.217`. The earlier 1.05 divisor did not clip — it just produced a larger cup (the silhouette would have filled `1.13/1.05 = 92%` of `rows·fitH`), and this note previously claimed otherwise.

- `fitH = 0.72` (0.58 when `vh < 700`)
- `fitW = 0.60` desktop, `0.72` when `vw < 768` (on narrow screens the handle makes width the binding constraint; a small `fitW` shrinks the cup to a thumbnail)

Projection — **center on the object, not on `y = 0`**; the cup's vertical center is `TEACUP_HEIGHT / 2 = 0.39`:

```
originRow = rows/2 + (TEACUP_HEIGHT / 2) * rowsPerUnit
originCol = cols * (vw >= 1024 ? 0.56 : 0.50)
col   = originCol + x'' * colsPerUnit
row   = originRow - y'' * rowsPerUnit
depth = z''
```

Missing the height term clips the rim off the top of the grid (the object's top lands at a negative row); this was hit in the prototype.

The `<pre>` is centered inside its fixed host (`display: grid; place-items: center`) because the glyph grid rarely fills the viewport exactly; the projection can therefore use plain grid coordinates.

Measured with these caps: at 1440×900 the grid is 132×56 (871×616 px), `rowsPerUnit = 28.8` (width- and height-bound coincide, 48 cols/unit) and the silhouette is 32 rows × 52 cols (~343×352 px); at 390×844 the grid is 59×56, `rowsPerUnit = 15.5` (width-bound) and the silhouette is ~18 rows × 33 cols (~200×218 px).

### 6.3 Rasterization

For each quad:

1. Project its 4 vertices to floating-point `(col, row, z)`.
2. Average the 4 stored normals, normalize (`n`); average the 4 `mat` values.
3. Bounding box = integer cell range covering the quad, clamped to the grid.
4. Split into triangles `(0,1,2)` and `(0,2,3)`; for each cell center inside a triangle, interpolate `z` barycentrically and write when `z > depth[i]` (nearer wins). Shared edges stay consistent because both triangles share the same depth buffer.
5. Coverage floor: if the bbox contained no sampled cell (quad smaller than one cell), write the cell containing the projected centroid, and only if that cell lies inside the clamped bbox. Skip the quad entirely if its projected area is `< 1e-6`.
6. On write: `depth[i] = z`, `chars[i] = luminanceToChar(lum)`.

No backface culling: the cup is hollow, so the cavity wall and the inside of the far rim must be reachable; the depth buffer resolves occlusion.

### 6.4 Shading

```
L     = normalize(0.45, 0.75, 0.50)
lam   = max(0, n · L)
lum   = mat * (0.32 + 0.68 * lam)
```

Expose `shadeIndex(mat, lam): number` returning `floor(clamp(lum, 0, 0.999) * 10)`; `luminanceToChar` is `ASCII_RAMP[shadeIndex(...)]`. `ASCII_RAMP = " .:-=+*#%@"`; empty cells stay `' '`.

The rim annulus normal turns toward the light and renders `%`/`@`; the cavity, with `mat = 0.5`, sits 2–5 ramp levels below the exterior for the same normal; the lower-left exterior sits at `-`/`=`. That separation is what makes the cup readable at 12% opacity.

### 6.5 Output

The framebuffer becomes `rows` strings of exactly `cols` chars joined with `\n`; trailing spaces are kept so the grid stays rectangular (glyph alignment must not depend on trimming). Then `pre.textContent = frame`.

## 7. Component, DOM, and lifecycle

### 7.1 DOM / stacking

`app.component.html`:

```html
<div class="app-shell">
  <app-ascii-teacup />
  <app-navbar />
  ...
```

Component template (inline):

```html
<pre #stage class="ascii-teacup" aria-hidden="true"></pre>
```

Styles (`ascii-teacup.component.scss`):

```scss
:host {
  position: fixed; inset: 0; z-index: -1;
  display: grid; place-items: center; overflow: hidden;
  pointer-events: none; user-select: none;
  color: var(--site-accent);
  opacity: var(--teacup-opacity);
}
pre {
  margin: 0; padding: 0;
  font: { family: var(--site-font-mono); size: 11px; }
  line-height: 1; letter-spacing: 0; white-space: pre;
}
@media (max-width: 767px) { :host { opacity: calc(var(--teacup-opacity) - 0.06); } }
@media print { :host { display: none; } }
@media (forced-colors: active) { :host { display: none; } }
```

`--teacup-opacity` goes in `src/styles/theme.scss` next to the other `--site-*` tokens: `0.22` on `:root`, `0.30` in the `[data-bs-theme="light"]` block. Do not theme it from inside the component: `data-bs-theme` sits on `<html>`, so a root-level `[data-bs-theme="light"] &` is a Sass compile error ("top-level selectors may not contain the parent selector"), and reaching for `:host-context()` puts theme coupling in a leaf component. A token is also the existing convention in this repo.

`z-index: -1` avoids restacking `.app-shell`: body's canvas background paints below negative stacking contexts, while all content and surfaces stay above. Implementation must confirm the cup is visible and not covered by `.app-main` or route surfaces; fallback is `:host { z-index: 0 }` + `.app-shell { position: relative; z-index: 1 }`.

### 7.2 Lifecycle

- `ngAfterViewInit`: create the renderer, size the grid, render the first frame, then start.
- All measurement, RAF, and rendering run inside `NgZone.runOutsideAngular`.
- `matchMedia('(prefers-reduced-motion: reduce)')`: render one frame at `yaw = 0.55`, no loop; subscribe to `change` to start/stop.
- `document.visibilitychange`: cancel RAF on hidden, restart on visible, reset the clock (no catch-up jump).
- `ResizeObserver` on the host: coalesce to one resize per frame; re-measure cells, resize buffers, re-render.
- `document.fonts.ready`: re-measure once (monospace cell metrics change after the web font loads). Because the `<pre>` is `white-space: pre`, `overflow: hidden`, a metric change can never wrap a line; the worst case is a single re-render at the new cell size.
- `ngOnDestroy`: cancel RAF, disconnect observer, remove listeners, drop buffers.
- Frame gate: render when `now − last >= 1000/fps`; `fps = 24` desktop, `20` when `innerWidth < 768`. Rotation is driven by elapsed wall time, so a dropped frame changes only smoothness, never speed.
- No `Math.random`, no clock reads inside the pure modules; yaw is an explicit parameter.

## 8. Parameters (single source of truth)

| Param | Dark | Light | Notes |
|---|---|---|---|
| `--teacup-opacity` | 0.22 | 0.30 | `src/styles/theme.scss`; no other color |
| `yawSpeed` | 0.48 rad/s | same | ≈ 13.1 s / turn |
| `viewPitch` | 22° | same | fixed |
| `fps` | 24 | 24 | 20 below 768px |
| `fitH` | 0.72 | 0.72 | 0.58 when `vh < 700` |
| `fitW` | 0.60 | 0.60 | 0.72 below 768px |
| `cols × rows` | 40–132 × 20–56 | same | ≤ 7,392 cells |
| `radialSegments` | 44 | same | 56 for a finer rim, at 3× render cost |
| `profileSamples` | 40 | same | |
| `saucerSamples` | 16 | same | |
| `handleSegments × sides` | 20 × 6 | same | |
| `font-size` | 11px | same | line-height 1 |

## 9. Tests

Pure modules (`teacup-mesh.spec.ts`, `teacup-renderer.spec.ts`):

1. `resampleProfile` returns `count` points, preserves first/last, and spaces points evenly along a straight segment (≤ 1e-6).
2. Mesh integrity: vertex count divisible by 7, all quad indices in range, no `NaN`.
3. Vertex material is only `0.5` or `1.0`, and the `0.5` vertices are 35–55% of the body mesh (the cavity leg is ~46% of the profile's arc length: 1.13 outer vs 0.98 inner world units).
4. Saucer max radius (0.58) > body max radius (0.50), so the cup visibly rests on a wider plate.
5. Handle travel: at `yaw = 0` the rightmost occupied column exceeds the body silhouette by ≥ 4 cells; at `yaw = π` the leftmost occupied column exceeds the body silhouette on the left by ≥ 4 cells (the handle swings through, it does not vanish).
6. `renderTeacup` is deterministic: two calls with identical view state produce identical strings.
7. Frame shape: exactly `rows` lines of `cols` chars. Fill is checked two ways because the cup never fills the grid: **frame fill 10–30%** (measured 17–19% at 132×56, 15–16% at 59×56) and **inside the occupied bounding box 50–85%** (measured 63–77%). The bbox measure is the real silhouette check; the frame measure only catches a vanished render.
8. `yaw` and `yaw + 2π` produce identical frames (period/sign correctness).
9. Occlusion: a near quad and a far quad covering the same cell leave the near quad's char.
10. `luminanceToChar` is monotonic non-decreasing across the ramp and clamps out-of-range input.
11. Material path: `shadeIndex(0.5, lam) < shadeIndex(1.0, lam)` for every `lam` in `(0, 1]`, and the ramp index never exceeds 9. Guards the cavity-dimming constant against being dropped during refactors.
12. Frame-cost guard (log only, never fails): 1440×900 grid, 30 iterations, report ms/frame.

Component (`ascii-teacup.component.spec.ts`):

1. Renders exactly one `pre[aria-hidden="true"]`; no other text content.
2. Starts RAF with a no-reduce `matchMedia` mock; with `reduce`, paints one non-empty frame and starts none.
3. `ngOnDestroy` cancels the pending frame (`cancelAnimationFrame` spy) and the frame does not advance afterward.

No snapshot test of the glyph art: hand-tuned output would be re-pinned on every geometry tweak, while assertions 2–11 catch real breakage.

## 10. Verification

Gates (CI runs the same):

```bash
bun run test -- --watch=false --browsers=ChromeHeadless
bun run lint
bun run build --configuration production
```

Manual, in a real browser — this is a visual feature, so screenshots are the proof:

| Check | Expected |
|---|---|
| 1440×900 dark | cup behind content, continuous rotation, nothing clipped; silhouette ≈ 400×495 px |
| 390×844 | cup ≈ 200×220 px, not a thumbnail, no horizontal overflow, text readable |
| Light theme | cup visible and still subordinate |
| Reduced motion emulated | one static cup, zero movement, no RAF loop |
| Hidden tab 5 s, return | resumes without a jump |
| `Ctrl+P` print preview | cup absent |
| Forced colors | cup absent, no layout shift |
| All routes (home/projects/timeline/resume) | contrast, focus, and hit targets unchanged |

## 11. Risks and rollback

- **Normal sign trap** (§5.4): geometric normals invert cavity shading. Enforced by using stored normals; test 3 and 11 guard the material path.
- **Stacking**: a negative-z fixed layer can be hidden by an ancestor background or stacking context. Check the real surface; fallback in §7.1. Rollback is deleting one line from `app.component.html`.
- **Perf**: grid is capped and independent of DPR; frame gate is time-based. If a frame exceeds ~6 ms at 1440×900, drop `radialSegments` to 40 and `cols` to 120.
- **Legibility**: if measured hero contrast suffers, lower opacity to 0.10 rather than changing the color.
- **Bundle**: ~+8 KB production; the 500 KB initial warning budget must not newly trip.
- **Recognition**: at small sizes the object can read as a bowl. Saucer and handle are in v1 for that reason; if it still fails, raise `viewPitch` to 20° before adding detail.

## 12. Phased delivery

| Phase | Scope | Exit gate |
|---|---|---|
| P1 | `teacup-mesh.ts`, `teacup-renderer.ts`, their specs | specs 1–11 pass; one rendered frame printed in the test log and checked by eye |
| P2 | Component, styles, `app.component.html` / `.ts` wiring | cup visible on `/` at 1440×900 dark; build + lint clean |
| P3 | Responsive, reduced-motion, visibility, font handling; manual matrix | §10 table green; opacity and pitch final |

**Feasibility evidence:** the §5 profile, revolve, handle arc, and §6 pipeline were prototyped at 96×46 cells; the output reads as a flared cup with handle and saucer, and the shading separates outer wall (`-`/`=`), cavity (`. `), and rim (`#`/`@`). The pitch went 16° → 22° in implementation: at 16° the rim opening was a hairline and the cup read as a tumbler.

**Implementation deltas from the first draft** (all reproduced and fixed in the TS pass): the pitch sign was inverted (viewed from below, near wall hid the bowl); the saucer was widened to 0.58 so the cup visibly rests on it; the handle tube went 0.034 → 0.070 so it survives the cell grid as a continuous stroke; `TEACUP_HEIGHT = 0.78` squashed the body so the rim diameter exceeds the height; the fit divisors became 1.4 (height, accounting for the pitch projecting the handle's `z`-extent into `y`) and 1.65 (width, for the 0.80 handle).

**Scroll-time freeze (found after shipping):** the cup was starved by app-level scroll work, not by the renderer. `NavbarComponent` bound `@HostListener("window:scroll")`, so every scroll event ran a full application tick (200–300 ms long tasks); the scroll-reveal `IntersectionObserver` callbacks also ran inside the zone and ticked the app per reveal. Both now run outside Angular (`ChangeDetectorRef.detectChanges()` only on the 0 ↔ non-zero navbar transition). Measured while scrolling: long tasks 11 × ~200 ms → 0; teacup frames 16–25 → ~24 fps; teacup paint 5.4 ms → 1.3 ms per frame.

Deferred, explicitly out of v1: tea surface disc with ripple dithering, steam wisps as animated dotted columns, scroll-speed coupling, and a `prefers-reduced-transparency` static variant.
