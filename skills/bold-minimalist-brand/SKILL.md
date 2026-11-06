\---

name: bold-minimalist-brand

description: >-

&#x20; Build a branded minimalism showcase with massive typography, immense

&#x20; whitespace, restrained motion, and optional shader backgrounds. Use when

&#x20; the client wants a high-end editorial brand site. Triggers on: "bold

&#x20; minimalist", "brand showcase", "editorial hero", "typography-led",

&#x20; "branded minimalism".

license: MIT

compatibility: Requires npm packages framer-motion, lenis, gsap. Optional

&#x20; three for shader backgrounds. Works with React/Next.js.

allowed-tools: Bash(npm install framer-motion lenis gsap three) Read Write

metadata:

&#x20; category: brand-minimalist

&#x20; primary-library: framer-motion

&#x20; scroll-library: lenis

\---



\# Bold Minimalist — Brand Showcase



\## Design brief



The page opens with a massive typographic hero (hero copy is 8 words or

fewer), an off-white background, and a single accent color. Motion is

restrained: shared-element transitions via `layoutId`, spring physics,

sub-300ms durations. A Lenis smooth-scroll layer makes the page feel premium.

Optionally, a subtle shader background (aurora, gradient, liquid metal) adds

depth without noise.



\## Non-negotiable constraints



1\. \*\*Restraint is the signal.\*\* One accent color. One hero message. Immense

&#x20;  whitespace. No decorative clutter.

2\. \*\*Typography is the design.\*\* Pair a bold grotesque sans (Inter Tight or

&#x20;  Geist) with an italic serif accent (Instrument Serif). The type hierarchy

&#x20;  IS the layout.

3\. \*\*Motion via shared elements, not page transitions.\*\* Framer Motion

&#x20;  `layoutId` for elements that morph between states. Spring physics

&#x20;  (`stiffness: 100, damping: 20`). No animation exceeds 300ms.

4\. \*\*Lenis owns the scroll.\*\* Do not mix native smooth scroll with Lenis. If

&#x20;  GSAP is also present, sync Lenis to GSAP's ticker with `autoRaf: false`

&#x20;  and `lagSmoothing(0)`.



\## Implementation recipe



\### 1. Token file (`tokens.json`)



Define the design system before writing any UI:



```json

{

&#x20; "color": {

&#x20;   "bg": "#faf9f7",

&#x20;   "fg": "#111111",

&#x20;   "accent": "#e63946",

&#x20;   "muted": "#8a8a8a"

&#x20; },

&#x20; "type": {

&#x20;   "hero": "clamp(4rem, 10vw, 10rem)",

&#x20;   "section": "clamp(2rem, 4vw, 3rem)",

&#x20;   "body": "1rem"

&#x20; },

&#x20; "space": { "base": "8px", "gutter": "2rem", "section": "8rem" },

&#x20; "radius": { "sm": "4px", "md": "8px", "lg": "16px" },

&#x20; "motion": {

&#x20;   "fast": 150,

&#x20;   "normal": 250,

&#x20;   "spring": { "stiffness": 100, "damping": 20 }

&#x20; }

}

```



Three-layer token architecture: primitive -> semantic -> component.



\### 2. Hero layout



Full-viewport section with:

\- Centered or left-aligned massive headline in Inter Tight (weight 700-800).

\- Italic serif accent word in Instrument Serif for editorial contrast.

\- Single CTA or scroll indicator below.

\- Optional corner stickers or metadata labels for asymmetric feel.



\### 3. Shared-element transition



```jsx

<motion.div layoutId="feature-card" className="card">

&#x20; <motion.h3 layoutId="feature-title">Feature</motion.h3>

</motion.div>



<AnimatePresence>

&#x20; {open \&\& (

&#x20;   <motion.div layoutId="feature-card" className="detail-panel">

&#x20;     <motion.h3 layoutId="feature-title">Feature</motion.h3>

&#x20;     <p>Expanded content...</p>

&#x20;   </motion.div>

&#x20; )}

</AnimatePresence>

```



Spring config: `{ type: "spring", stiffness: 100, damping: 20 }`. Use

`layoutId` for any element that animates between positions.



\### 4. Lenis setup (React)



```js

useEffect(() => {

&#x20; gsap.registerPlugin(ScrollTrigger);

&#x20; const lenis = new Lenis({ autoRaf: false });

&#x20; lenis.on("scroll", ScrollTrigger.update);

&#x20; const update = (time) => lenis.raf(time \* 1000);

&#x20; gsap.ticker.add(update);

&#x20; gsap.ticker.lagSmoothing(0);

&#x20; return () => {

&#x20;   gsap.ticker.remove(update);

&#x20;   lenis.destroy();

&#x20; };

}, \[]);

```



Canonical setup that prevents double-RAF loops and ScrollTrigger misfires.



\### 5. Optional shader background



Three.js FBM aurora shader or simple gradient shader behind the hero. Low

contrast so it does not compete with typography. `uTime` increments at

\~0.002 per frame.



\### 6. Bento / editorial grid



Asymmetric bento grid for features or case studies. Cards have generous

padding and a single line of copy. Hover effects are subtle (scale 1.02,

200ms) and use spring physics.



\## Interchangeable segments



| Segment | What to swap |

| :--- | :--- |

| Color palette | Replace `--bg`, `--fg`, `--accent` in `tokens.json` |

| Font pairing | Swap Inter Tight + Instrument Serif for another pair |

| Hero copy | Replace headline and accent word (keep 8 words or fewer) |

| Shader variant | Swap aurora for gradient, liquid metal, or voronoi |

| Grid layout | Change bento column spans in grid template |

| Motion duration | Adjust 150ms/250ms tokens; keep all 300ms or less |



\## Acceptance checks



\- \[ ] Hero headline fits on one line on 1440px, wraps gracefully below.

\- \[ ] Only one accent color is used across the page.

\- \[ ] Every animation finishes in 300ms or less.

\- \[ ] Shared-element transitions are seamless (no visual snap).

\- \[ ] Lenis scrolls at constant feel across the whole page.

\- \[ ] No layout shift on font load (`font-display: swap` or self-hosted).

\- \[ ] Reduced-motion mode disables non-essential transitions.

