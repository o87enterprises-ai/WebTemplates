---
name: disect-breakdown
description: >-
  Build a scroll-driven 3D exploded product teardown using Three.js and GSAP
  ScrollTrigger. Use when the client wants an "exploded view" where a product
  separates into its components as the user scrolls, then orbits for
  inspection. Triggers on: "exploded view", "product teardown", "disect",
  "3D breakdown", "component separation".
license: MIT
compatibility: Requires npm packages three, gsap. Works with any React/Next.js
  or vanilla JS project. No 3D model asset required (slabs method).
allowed-tools: Bash(npm install three gsap) Read Write
metadata:
  category: 3d-teardown
  primary-library: three.js
  scroll-library: gsap
---

# Disect / Breakdown — 3D Product Teardown

## Design brief

A full-viewport canvas is pinned. A stylized product is assembled at scroll
progress 0. As the user scrolls, the product peels apart into its component
layers with uneven, engineered spacing. At **55% progress** the teardown
completes; the remaining **45%** orbits the camera 150 degrees around the
separated stack. Scrolling up reverses the sequence in mirror order. A HUD
label in the corner names each layer as it separates.

## Non-negotiable constraints

1. **No GLTF loader dependency.** Build the product from `BoxGeometry` slabs,
   one slab per layer. This keeps the template asset-free and instantly
   customizable by changing slab colors and count.
2. **One ScrollTrigger only.** Split the scrubbed progress into two derived
   phases (`explode` and `orbit`). Never chain a second ScrollTrigger; the
   handoff must not drift.
3. **Uneven explode offsets.** Evenly fanned layers look like a deck of cards.
   Use deliberately uneven spacings (e.g. -6.5, -2.6, 1.2, 4.8, 8.2) so heavy
   structural parts separate more than thin films.
4. **Per-layer progress offsets** for a top-down peel. Cover glass lifts
   first; frame drops last. Formula:
   `localProgress = clamp((explode - (count - 1 - i) * 0.08) / 0.7)`.

## Implementation recipe

### 1. Scene setup

- `WebGLRenderer` with `antialias: true`, `setPixelRatio(Math.min(dpr, 1.5))`.
- `PerspectiveCamera` at `(0, 2, 10)`, `lookAt(0, 0, 0)`.
- Lighting: `AmbientLight(0xffffff, 0.6)`, key `DirectionalLight` from front-right,
  rim `DirectionalLight` from behind with a colored tint.
- Resize handler updates `camera.aspect`, `updateProjectionMatrix()`, and
  `renderer.setSize`.

### 2. Layer data model

```js
const layers = [
  { name: "Frame",       color: 0x2a2a2a, assembledY: -3.2, explodedY: -6.5 },
  { name: "Battery",     color: 0x00a896, assembledY: -1.6, explodedY: -2.6 },
  { name: "Logic Board", color: 0x1b5e20, assembledY:  0.0, explodedY:  1.2 },
  { name: "Display",     color: 0x111111, assembledY:  1.6, explodedY:  4.8 },
  { name: "Cover Glass", color: 0xffffff, assembledY:  3.2, explodedY:  8.2,
    opacity: 0.35, roughness: 0.1 },
];
```

Each entry stores its mesh, `assembledY`, `explodedY`, and display name.

### 3. Parenting sub-parts

Parent small chip meshes directly to the logic-board mesh so they explode
with it automatically through scene-graph inheritance. No extra animation
logic for sub-components.

### 4. Scroll timeline (GSAP)

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".teardown-section",
    start: "top top",
    end: "+=400%",
    scrub: true,
    pin: true,
  },
});

const state = { p: 0 };
tl.to(state, {
  p: 1,
  ease: "none",
  onUpdate: () => {
    const p = state.p;
    const explode = easeInOutCubic(Math.min(1, p / 0.55));
    const orbit = Math.max(0, (p - 0.55) / 0.45);

    layers.forEach((layer, i) => {
      const local = clamp((explode - (layers.length - 1 - i) * 0.08) / 0.7);
      layer.mesh.position.y = lerp(layer.assembledY, layer.explodedY, local);
    });

    if (orbit > 0) {
      camera.position.x = Math.sin(orbit * 2.6) * 4;
      camera.position.z = Math.cos(orbit * 2.6) * 4;
      camera.position.y = 2 + orbit * 2;
      camera.lookAt(0, 0, 0);
    }
  },
});
```

### 5. HUD label

Corner label reads `ASSEMBLED` at rest. Mid-peel it indexes into the layer
list by `Math.floor(explode * layers.length)` and names the current
component. At completion it reads `EXPLODED — 5 LAYERS`.

### 6. Lenis integration (optional)

If Lenis is used, register GSAP plugins first, create Lenis with
`autoRaf: false`, drive it from `gsap.ticker.add`, and call
`gsap.ticker.lagSmoothing(0)`. Not required for this template.

## Interchangeable segments

| Segment | What to swap |
| :--- | :--- |
| Layer palette | Change the `color` hex values in the `layers` array |
| Layer count | Add or remove entries; update dependent code |
| Explode distances | Adjust `explodedY` values (keep them uneven) |
| Orbit angle | Change `2.6` radians to widen the camera sweep |
| Orbit distance | Change the `4` multiplier on `camera.position.x/z` |
| HUD font | Apply a monospace stack (JetBrains Mono, IBM Plex Mono) |

## Acceptance checks

- [ ] Product is fully assembled at scroll 0.
- [ ] Product is fully exploded by 55% scroll progress.
- [ ] Camera orbits cleanly between 55% and 100% with no drift.
- [ ] Scrolling up reverses the exact sequence.
- [ ] HUD label updates at layer boundaries.
- [ ] Canvas resizes without stretching.
- [ ] `renderer.setPixelRatio` capped at 1.5.