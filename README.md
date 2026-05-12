# Treepoint Consultants

A single-page site for Treepoint Consultants, an arboricultural practice in London. The user is taken through a year in the life of a tree, scroll-scrubbed from seed germination to winter dormancy.

Built with Next.js 14 (App Router), Three.js + React Three Fiber, GSAP/ScrollTrigger, Lenis smooth scroll, and a custom GLSL pipeline.

---

## Running

This project lives inside **Claude Launcher**.

- **Dev:** click **Run** in the toolbar. The launcher runs `npm run dev` in this directory.
- **Ship to production:** click **Ship to Vercel** in the toolbar. The launcher creates the Vercel project, wires env vars, and triggers a deployment.

Manual fallback (if you're outside the launcher):

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Node 18.17+ recommended.

---

## What you are looking at

The page is a single document. There is no router, no traditional nav. The user scrolls and a Three.js scene behind the content advances through five seasons. Section copy rides on top of the scene.

Five seasons, mapped to scroll progress:

| Scroll | Season       | Story                          | Section  |
|-------:|-------------|--------------------------------|----------|
|   0.00 | Germination  | Seed cracks, root + shoot      | Hero     |
|   0.18 | Spring       | Sapling, blossom drift         | About    |
|   0.42 | Summer       | Full canopy, dappled light     | Services |
|   0.62 | Autumn       | Colour shift, leaves detach    | Approach |
|   0.85 | Winter       | Bare branches, frost, mist     | Contact  |

Keyframes live in `lib/season.ts` — `SEASON_KEYFRAMES`. Move them, retune the section heights in `components/sections/*`, and the visual journey re-snaps automatically.

---

## Architecture

```
app/
  layout.tsx              # fonts (Fraunces, Inter), metadata
  page.tsx                # mounts <Experience />
  globals.css             # color tokens, film grain, cursor styles
components/
  Experience.tsx          # main wrapper. picks WebGL or reduced-motion path
  StaticExperience.tsx    # reduced-motion path — gradient + SVG branch silhouettes
  scene/
    Scene.tsx             # R3F <Canvas>, dynamic-imported
    Lighting.tsx          # seasonal sun + ambient + rim
    CameraRig.tsx         # scroll-driven camera keyframes
    Ground.tsx            # subtle earth disc
    Particles.tsx         # pollen / dust motes / snow flurries / mist
    Birds.tsx             # distant silhouettes, spring + summer only
    Postprocess.tsx       # bloom, DOF, vignette, CA, noise
  tree/
    lsystem.ts            # procedural tree generation
    shaders.ts            # GLSL strings — bark vert/frag, leaf vert/frag, litter
    Tree.tsx              # merged trunk geometry + instanced leaves + litter
    FallingLeaves.tsx     # autumn falling-leaf physics, easter-egg burst
  sections/
    Hero.tsx              # winter / germination
    About.tsx              # spring — practice intro, Richard's credentials
    Services.tsx          # summer — 7 services as editorial list
    Approach.tsx          # autumn — four numbered steps
    Contact.tsx           # late autumn / winter
    Footer.tsx            # dormancy with promise
  ui/
    Cursor.tsx            # custom dot, morphs to leaf on interactive elements
    FilmGrain.tsx         # SVG fractal-noise overlay
    LoadingScreen.tsx     # Canvas2D seed-falling-into-soil intro
    ProgressRing.tsx      # right-edge year-cycle indicator
    AudioToggle.tsx       # top-right ambient sound switch — never autoplays
    SplitReveal.tsx       # word-stagger text reveal with 3D rotation
    Shuffle.tsx           # character-shuffle reveal for service titles
lib/
  copy.ts                 # all editorial text — edit here, not in components
  season.ts               # season state machine, keyframes, derived params
  store.ts                # Zustand store: scroll progress, quality tier, hover state
  quality.ts              # detect-gpu wrapper + per-tier budgets
  scroll.ts               # Lenis + GSAP shared RAF loop
  reducedMotion.ts        # prefers-reduced-motion hook
  utils.ts                # lerp, clamp, smoothstep, mulberry32, hexToRgb
```

### The scroll → season → uniforms → tree pipeline

1. **Lenis** receives the user's wheel/touch input and produces an eased scroll value. `lib/scroll.ts` runs it on the same RAF as GSAP — this is non-negotiable; otherwise scrub lags by a frame.
2. The Lenis `scroll` callback computes `scrollProgress` (0..1) and writes it to the **Zustand store**.
3. `lib/season.ts::computeSeasonState(progress)` derives a complete `SeasonState` — leaf colour, density, wind strength, fog density, lighting, frost level, etc.
4. The scene reads the store via `useStore.getState()` inside each `useFrame` and pushes values into shader uniforms. No re-renders, no React state churn — just direct uniform writes.

### The tree

The tree is procedural. `lib/tree/lsystem.ts` generates a recursive branch structure (loose L-system style, with golden-angle phyllotaxis and depth-dampened phototropism). It produces:

- ~500 branch segments
- ~8000 leaf attachments
- 7 anchor branches mapped to the 7 services

`components/tree/Tree.tsx`:

- Merges every branch's `CylinderGeometry` into **one** BufferGeometry. One draw call for the entire trunk.
- Renders leaves as one **InstancedMesh** with custom shader. One draw call for thousands of leaves.
- Renders the litter pile as another InstancedMesh.
- All seasonal behaviour (growth, wind, frost, blossom, colour) is driven by uniforms — never by JS-side matrix updates.

The leaf shader does the heavy lifting:
- **Density culling.** Each instance has a stable random `aDensityKey`. The vertex shader collapses any instance whose key > `uLeafDensity` to a point. As autumn progresses, fewer leaves render; the same leaves drop first every time.
- **Wind sway.** Per-instance phase offset, height-modulated amplitude, plus a turbulence term.
- **Procedural leaf shape.** A 2D analytic mask in the fragment shader. No texture needed.
- **Subsurface scattering (fake).** Backlit translucency — bonus brightness when the leaf normal opposes the light.
- **Service highlight.** When `uHoveredService` ≥ 0, leaves whose `aServiceIndex` matches it pulse with the amber accent.

---

## Tuning the journey

All knobs live in two files:

### `lib/season.ts`

**`SEASON_KEYFRAMES`** — when each season begins, as a fraction of total scroll. Edit these to expand or compress a phase.

```ts
{ key: 'germination', at: 0.00, label: 'Germination' },
{ key: 'spring',      at: 0.18, label: 'Spring' },   // ← longer spring? lower this
{ key: 'summer',      at: 0.42, label: 'Summer' },
{ key: 'autumn',      at: 0.62, label: 'Autumn' },
{ key: 'winter',      at: 0.85, label: 'Winter' },
```

**`computeSeasonState(progress)`** — the actual per-season transitions. For each season key, you'll find the curves for `leafDensity`, `leafColor`, `windStrength`, `pollen`, `mist`, etc. Tweak any value; the scene re-binds on the next frame.

### `lib/quality.ts`

**`QUALITY_BUDGETS`** — caps per device tier. The single most useful knob:

```ts
high:   { leafCount: 5200, ... }
medium: { leafCount: 2400, ... }
low:    { leafCount: 900, ... }
```

If the scene feels sparse on a high-tier card, raise `leafCount`. If you're losing frames on mid-range mobile, lower the `medium` and `low` budgets first.

### `components/scene/CameraRig.tsx`

**`FRAMES`** — camera position + lookAt + FOV keyframes. Each entry is `{ at: progress, pos, look, fov }`. Add or remove keyframes to change the cinematography.

### `components/tree/lsystem.ts`

**`generateTree(seed)`** — pass a different `seed` to get a different tree. Defaults to `73` (called from `Scene.tsx`). The `MAX_DEPTH` and `GOLDEN` constants at the top control overall density / structure.

---

## Asset swap

Most assets in this build are **procedural** (bark, leaves, ambient particles) to keep the bundle small and the dependency surface clean. To replace them with photographic textures or recorded audio:

### Bark texture

Currently the bark is generated in the fragment shader via fbm noise (`components/tree/shaders.ts` → `BARK_FRAG`). To swap to a photographed bark from [Poly Haven](https://polyhaven.com/textures/bark) or [textures.com](https://www.textures.com):

1. Drop your `bark_albedo.jpg`, `bark_normal.jpg`, `bark_roughness.jpg`, `bark_displacement.jpg` into `public/textures/bark/`.
2. In `components/tree/Tree.tsx`, load them with `useTexture` from `@react-three/drei` and pass as uniforms to the bark material.
3. In `BARK_FRAG`, replace the `fbm()` block with `texture2D(uAlbedo, vUv * 0.5)` etc.
4. For best results, convert to KTX2 / Basis Universal first. Install `@gltf-transform/cli`, run `gltf-transform basisu input.jpg output.ktx2`, then load via `KTX2Loader`.

### Leaf textures

Same story for leaves. The procedural shape in `LEAF_FRAG` (`leafShape()` function) is replaceable with a leaf alpha texture:

```glsl
float shape = texture2D(uLeafMask, vUv).a;
if (shape < 0.5) discard;
```

### Ambient audio

`AudioToggle.tsx` expects four MP3 files:

```
public/audio/winter.mp3
public/audio/spring.mp3
public/audio/summer.mp3
public/audio/autumn.mp3
```

They are **not** included. Suggested field recordings:

- Winter: distant wind, occasional crow
- Spring: birdsong, light wind, distant church bell
- Summer: rustling leaves, drone of insects
- Autumn: stronger wind, leaves skittering

Each track should loop seamlessly (use Audacity's *Repair* + crossfade if needed). Keep under 2 MB each — they're streamed.

The toggle component crossfades automatically between them as the season changes. If a file is missing, the toggle still works visually but plays nothing — never throws.

### Static fallback / sprite-sheet (low-end mobile)

The brief calls for a PNG sprite-sheet fallback for low-tier mobile. The hook is in place — `QUALITY_BUDGETS.low.enablePostprocessing` is false, and `leafCount` is heavily capped. To go further and replace WebGL entirely on low tier:

1. Render the tree to 60 PNGs (one per 1.66% of scroll) using something like Spline, Three.js Editor, or Blender + Cycles.
2. Stitch into a sprite sheet.
3. In `Experience.tsx`, branch on `quality === 'low' && isMobile` and render `<SpriteScrollFallback />` instead of `<Scene />`.

A skeleton component is left as an exercise — the rest of the page (sections, cursor, scroll, audio) works unchanged.

---

## Accessibility

- **`prefers-reduced-motion`** triggers `StaticExperience.tsx`: no WebGL, no scroll-scrub, gentle fade transitions per section, seasonal gradient + SVG branch silhouettes. Same copy, same anchors.
- **Keyboard navigation** works throughout — every interactive element has a visible focus ring (`:focus-visible` in `globals.css`).
- **Screen readers** see semantic HTML — `<section aria-label>`, headings, descriptive alt text. The Three.js canvas is decorative and ignored.
- **Custom cursor** is hidden on coarse pointers (touch) and on reduced motion. Native cursor returns automatically.
- **Audio never autoplays.** Toggle is prominent and labelled.
- **Colour contrast** — body text against the dark forest background passes WCAG AA. The accent amber is for hover/active states, not primary content.

---

## Performance budget

| Target           | FPS    | Initial paint | Interactive | Leaves   |
|------------------|--------|---------------|-------------|----------|
| Desktop mid+     | 60     | < 1.5s        | < 3s        | 5,200    |
| Tablet           | 50–60  | < 2.0s        | < 3.5s      | 2,400    |
| Mid-range mobile | 30+    | < 2.5s        | < 4s        | 900      |

Levers in the order you should reach for them when chasing frames:

1. `QUALITY_BUDGETS.{tier}.leafCount` — by far the biggest knob.
2. `QUALITY_BUDGETS.{tier}.enableDOF` — DOF is the most expensive postprocess.
3. `pixelRatioCap` — capping DPR at 1.5 on retina is usually invisible and adds ~30% headroom.
4. Lower `shadowMapSize`.
5. Disable postprocessing entirely (`enablePostprocessing: false`).

The Three.js bundle is **dynamic-imported** (`Experience.tsx` → `dynamic(() => import('./scene/Scene'), { ssr: false })`), so the page renders instantly with just text + the loading screen. The 3D scene mounts only after the JS chunk arrives.

---

## Easter eggs

- **Click the trunk.** A flurry of amber leaves detaches and falls, regardless of season. The shake propagates up the canopy (the vertex shader's `uShakeStrength` uniform).
- The **progress ring** on the right edge is also a quick-jump nav. Click any of the season ticks.

---

## Stack

- **Framework:** Next.js 14 (App Router), React 18
- **3D:** Three.js 0.169, @react-three/fiber 8, @react-three/drei 9
- **Postprocessing:** @react-three/postprocessing 2, postprocessing 6
- **Smooth scroll:** Lenis 1.1
- **Animation:** GSAP 3.13 (SplitText + DrawSVG plugins are MIT-licensed since June 2024)
- **State:** Zustand 5
- **GPU tier detection:** detect-gpu 5
- **Styling:** Tailwind 3 + CSS variables
- **Fonts:** Fraunces (display, with `opsz`/`SOFT`/`WONK` axes), Inter (body) — both via `next/font/google`

---

## Roadmap / what's stubbed

The brief was ambitious and a few items are scaffolded for later asset work rather than fully realised here:

- **KTX2 / Basis Universal pipeline.** No textures are currently used, so no conversion was needed. The loader integration point is in `Tree.tsx` (see *Bark texture* above).
- **Photographic bark + leaves.** Currently procedural. Drop-in replacement documented above.
- **Field-recorded ambient audio.** `AudioToggle` is wired and crossfades automatically. Drop MP3s in `public/audio/`.
- **Sprite-sheet mobile fallback.** Quality-tier hook exists. Render assets to use it.
- **Sound design beyond ambient layers** (footsteps in leaves, wind gusts on scroll-velocity-spike, etc.).

Everything else — procedural tree, scroll-scrubbed season journey, custom cursor with magnetic attraction, loading screen, postprocessing, reduced-motion alternative, easter-egg trunk shake, keyboard nav, vertical progress ring — is shipped.

---

## Licence + credits

Copy and design direction: Treepoint Consultants.
Build: a single-file architectural sketch — extendable in the directions above.
