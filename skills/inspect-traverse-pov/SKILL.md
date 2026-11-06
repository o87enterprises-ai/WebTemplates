\---

name: inspect-traverse-pov

description: >-

&#x20; Build a POV cinematic environment where scrolling scrubs through a canvas

&#x20; frame sequence, creating a first-person traverse experience. Use when the

&#x20; client wants an immersive background video that navigates a vivid

&#x20; environment on scroll. Triggers on: "POV scroll", "video scrub", "cinematic

&#x20; scroll", "inspect", "traverse", "background video sequence".

license: MIT

compatibility: Requires npm packages gsap. Optional three for shader

&#x20; backgrounds. Works with React/Next.js or vanilla JS.

allowed-tools: Bash(npm install gsap) Read Write

metadata:

&#x20; category: pov-cinematic

&#x20; primary-library: gsap

&#x20; video-strategy: canvas-frame-sequence

\---



\# Inspect / Traverse — POV Cinematic Environment



\## Design brief



A full-screen canvas plays a POV shot of an environment. Scrolling scrubs the

footage forward, not as autoplay but as a deterministic scroll-driven

playhead. Glassmorphism panels rise from the bottom at scroll milestones,

annotating the environment. A subtle mouse parallax adds depth to the

background layer. The experience feels like flying through a world.



\## Non-negotiable constraints



1\. \*\*Canvas frame sequence, not `<video>` scrubbing.\*\* Native video seeking

&#x20;  is async, keyframe intervals stutter, and mobile Safari fights autoplay.

&#x20;  Extract frames with FFmpeg and draw them to a `<canvas>`. GSAP

&#x20;  ScrollTrigger drives a single progress value 0 to 1; the component maps

&#x20;  it to a frame index and draws it. Frame N is frame N, no seeking.

2\. \*\*Lazy-load frames.\*\* Never fetch all 60 to 150 frames upfront. Use an

&#x20;  `IntersectionObserver` with `800px` rootMargin. Defer decoding with

&#x20;  `requestIdleCallback` (or `setTimeout` fallback). Hero sequence gets

&#x20;  priority; others get `img.fetchPriority = "low"`.

3\. \*\*Cap DPR.\*\* Set the canvas backing store to `devicePixelRatio 1.5`. On a

&#x20;  3x phone screen you cannot see the difference on moving footage and it

&#x20;  halves the pixels to paint.

4\. \*\*No scrubbing on reduced motion.\*\* If `prefers-reduced-motion: reduce`,

&#x20;  freeze at frame 0 and hide the pinned ScrollTrigger.



\## Implementation recipe



\### 1. Frame extraction (one-time asset prep)



```bash

ffmpeg -i source.mp4 -vf "fps=12,scale=1280:-2" /tmp/frames/%03d.jpg

for f in /tmp/frames/\*.jpg; do

&#x20; cwebp -q 68 -m 6 "$f" -o "public/media/seq/$(basename "${f%.jpg}").webp"

done

```



61 frames at 12 fps is the sweet spot for a 45-second sequence. WebP at

`-q 68 -m 6` is roughly 20% smaller than JPEG with no visible loss on moving

footage.



\### 2. Canvas renderer



```js

const canvas = document.querySelector("canvas");

const ctx = canvas.getContext("2d");

const frames = \[]; // loaded Image objects

let currentFrame = -1;



function render(index) {

&#x20; if (index === currentFrame) return;

&#x20; currentFrame = index;

&#x20; ctx.drawImage(frames\[index], 0, 0, canvas.width, canvas.height);

}

```



\### 3. Scroll timeline



```js

const state = { progress: 0 };

gsap.to(state, {

&#x20; progress: 1,

&#x20; ease: "none",

&#x20; scrollTrigger: {

&#x20;   trigger: ".pov-section",

&#x20;   start: "top top",

&#x20;   end: "+=300%",

&#x20;   scrub: true,

&#x20;   pin: true,

&#x20; },

&#x20; onUpdate: () => {

&#x20;   const index = Math.min(

&#x20;     Math.floor(state.progress \* frames.length),

&#x20;     frames.length - 1

&#x20;   );

&#x20;   render(index);

&#x20; },

});

```



\### 4. Glassmorphism panels



Panels use `backdrop-filter: blur(16px)`, a semi-transparent background, a

subtle border, and rise from the bottom with a separate ScrollTrigger

(`start: "top 80%"`, `duration: 0.8`). Reveal, not scrub.



\### 5. Mouse parallax



```js

window.addEventListener("mousemove", (e) => {

&#x20; const x = (e.clientX / innerWidth - 0.5) \* 2;

&#x20; const y = (e.clientY / innerHeight - 0.5) \* 2;

&#x20; gsap.to(".parallax-layer", {

&#x20;   x: x \* 12, y: y \* 8,

&#x20;   rotationX: y \* 2, rotationY: x \* 2,

&#x20;   duration: 0.6, ease: "power2.out",

&#x20; });

});

```



\### 6. Lenis integration



Same canonical pattern as the other skills: `autoRaf: false`, driven from

`gsap.ticker.add`, `lagSmoothing(0)`.



\## Interchangeable segments



| Segment | What to swap |

| :--- | :--- |

| Frame source | Replace the WebP sequence with new FFmpeg extraction |

| Scroll length | Change `end: "+=300%"` to lengthen or shorten traverse |

| Panel content | Edit HTML/CSS of glass panels |

| Parallax intensity | Adjust the `12` and `8` multipliers |

| Canvas aspect | Recompute `canvas.width/height` from source frame ratio |

| Background shader | Layer a Three.js FBM aurora shader behind canvas |



\## Acceptance checks



\- \[ ] Canvas fills viewport at correct aspect on all breakpoints.

\- \[ ] Scrolling forward advances frames monotonically.

\- \[ ] Scrolling backward reverses frames monotonically.

\- \[ ] No frame is skipped during fast scroll (progress mapping intact).

\- \[ ] Panels reveal once and do not flicker.

\- \[ ] Parallax responds smoothly, no jitter.

\- \[ ] Reduced-motion mode freezes at frame 0.

