# Use case examples

Three template families, each built for a different kind of client site. Pick by the
story the page has to tell, not by the effect you want to show off.

| Client wants | Template | Motion stack |
| :--- | :--- | :--- |
| "Show what it is made of" | `disect-breakdown` | Three.js + GSAP ScrollTrigger |
| "Put them inside the place" | `inspect-traverse-pov` | GSAP ScrollTrigger + canvas |
| "Make us look expensive" | `bold-minimalist-brand` | Framer Motion + Lenis |

---

## 1. Hardware launch page — `disect-breakdown`

**Scenario.** A headphone or camera brand launching a product. The page pins one
canvas; as the visitor scrolls, the product separates into its layers, then the camera
orbits the floating stack. Suits anything with 4–7 visible internal layers.

```bash
webtemplates new
# template: disect-breakdown, project: aperture-h1
```

`template-config.json`:

```json
{
  "template": "disect-breakdown",
  "brand": {
    "name": "Aperture H1",
    "palette": { "bg": "#0b0b0c", "fg": "#f4f1ea", "accent": "#ff5a1f" }
  },
  "segments": { "hero": "editorial-center", "motion_profile": "restrained" }
}
```

Prompt to Claude:

> Build the exploded teardown from `SKILL.md`. My product has five layers: outer shell,
> driver housing, driver, acoustic mesh, ear cushion. Keep the uneven explode offsets
> from the contract and put the offset values in a single `layers` array at the top of
> the scene module so I can tune them. Achieve the accent colour via the HUD label and
> rim light only — the product itself stays neutral.

**Review the contract's acceptance checks.** Especially: assembled at scroll 0, fully
exploded at 55%, orbit with no drift, and scroll-up reversing the sequence. A teardown
that pops instead of peeling is the failure mode.

**Prepackaged assets.** This family is asset-free by design (the product is built from
box slabs). If you want a real model, drop a `.glb` into
`skills/disect-breakdown/assets/models/` and have Claude load it from
`/assets/models/...` — but that breaks the "no loader" constraint, so keep it out of
template pitches.

---

## 2. Venue or property walkthrough — `inspect-traverse-pov`

**Scenario.** A hotel, gallery, or showroom where the point is being *there*. Scroll
scrubs through a frame sequence like a camera dolly; no visible UI chrome, just the
place and a caption.

```bash
webtemplates new
# template: inspect-traverse-pov, project: mare-house
```

```json
{
  "template": "inspect-traverse-pov",
  "brand": {
    "name": "Mare House",
    "palette": { "bg": "#101112", "fg": "#eceae4", "accent": "#b08d57" }
  },
  "segments": { "hero": "editorial-center", "motion_profile": "restrained" }
}
```

Prompt to Claude:

> Implement the POV traverse from `SKILL.md`. Frames go in `public/assets/frames/`,
> numbered sequentially. Wire progress to frame index, preload the first 30 frames
> before the canvas fades in, and hold the last frame while the booking block scrolls
> over it. The caption should change four times, matching the four spaces in
> `template-config.json`'s brand name.

**Asset preparation is most of the work here.** Export a 200–300 frame set at a
consistent exposure, downscale to ~1600px wide, and convert to WebP before handing it
to the project. Put them at `public/assets/frames/` after generation.

**Review checks.** Mobile frame budget: scrub must stay smooth while decoding; if it
stutters, cut the frame count rather than lowering resolution further.

---

## 3. Studio, fashion, or hospitality brand site — `bold-minimalist-brand`

**Scenario.** An agency, photographer, or restaurant that needs a one-page presence
with personality: oversized type, huge whitespace, smooth scrolling, a handful of
images that reveal on scroll. The lightest of the three, and the fastest to ship.

```bash
webtemplates new
# template: bold-minimalist-brand, project: field-notes
```

```json
{
  "template": "bold-minimalist-brand",
  "brand": {
    "name": "Field Notes",
    "palette": { "bg": "#faf9f7", "fg": "#111111", "accent": "#e63946" }
  },
  "segments": { "hero": "editorial-center", "motion_profile": "restrained" }
}
```

Prompt to Claude:

> Build the editorial brand page from `SKILL.md` with Lenis smooth scroll and Framer
> Motion reveals. One hero statement, three work blocks, one contact block. Reveals
> are 40px rise plus opacity, staggered 60ms — nothing bounces. Use the accent only
> for links and the section index numerals.

**Watch the restraint.** This template looks cheap when motion is louder than the
typography. `motion_profile: restrained` means no parallax on text, no rotation, no
scale on hover beyond 1.02.

---

## 4. Running a campaign off one palette

The palette is plain JSON, so one brand system can drive several pages:

```bash
webtemplates new   # nike-teardown   → disect-breakdown
webtemplates new   # nike-culture    → bold-minimalist-brand
```

Generate both, then set identical `brand.palette` values in each `template-config.json`.
Keep those files in version control; they are the only brand-specific input, so a
palette change is a one-line diff and a re-prompt, not a redesign.

## 5. Reusing prepackaged fonts or models

Assets live beside the contract, not in the scaffold code:

```
skills/bold-minimalist-brand/assets/
├── fonts/Editorial.woff2
└── images/studio-01.webp
```

The next `webtemplates new` copies them to `public/assets/` and the reference is
`/assets/fonts/Editorial.woff2`. Keeping assets per template means a client project
starts already typeset, and the CLI stays dependency-free.

## 6. What to check before sending the site to a client

- Palette: exactly one accent, text contrast above 4.5:1 against `bg`.
- Motion: works with `prefers-reduced-motion` respected; no scroll-jacking on mobile.
- Content: every caption and label is real copy, not lorem ipsum.
- Performance: `npm run build`, then check the JS bundle for an unneeded library.
- Contract: the acceptance checks at the bottom of the template's `SKILL.md` all pass.
