# WebTemplates — Project Handoff & Completion Guide

## How This System Works

This repo is a CLI-based scaffolding engine.

1. You run `webtemplates new` and pick a template (e.g., `disect-breakdown`).
2. The CLI asks for the project name, brand name, and three palette colours, then
   creates a Vite + React project, installs the template's libraries (Three.js, GSAP,
   Framer Motion), copies the template's `SKILL.md` into `.claude/skills/`, copies any
   prepackaged assets, and writes `template-config.json`.
3. **You do not write the React code manually.** Open the new folder, type `claude`,
   and tell it: *"Build the site based on the SKILL.md and template-config.json"*.

Day-to-day usage lives in **`QUICKSTART.md`**; scenario walkthroughs live in
**`USE-CASES.md`**.

---

## Phase 1: The CLI Code (complete)

```
bin/wt.js                          # shebang entry, calls run()
src/index.js                       # arg parsing, prompts, spinner
src/templates.js                   # discovers skills/*/SKILL.md, parses frontmatter
src/generators/shared/scaffold.js  # Vite + deps + skill + assets + config
```

### `src/generators/shared/scaffold.js`

```javascript
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const TEMPLATE_DEPS = {
  'disect-breakdown': ['three', 'gsap'],
  'inspect-traverse-pov': ['gsap'],
  'bold-minimalist-brand': ['framer-motion', 'lenis', 'gsap'],
};

export const DEFAULT_PALETTE = { bg: '#faf9f7', fg: '#111111', accent: '#e63946' };
export const DEFAULT_SEGMENTS = { hero: 'editorial-center', motion_profile: 'restrained' };

export async function scaffoldProject(projectName, templateId, options = {}) {
  const targetDir = path.resolve(process.cwd(), projectName);
  const brand = options.brand ?? {};
  const palette = brand.palette ?? {};

  if (fs.existsSync(targetDir)) {
    throw new Error('Directory already exists: ' + projectName);
  }

  await execa('npm', ['create', 'vite@latest', projectName, '--', '--template', 'react'], { stdio: 'inherit' });
  await execa('npm', ['install'], { cwd: targetDir, stdio: 'inherit' });

  const deps = TEMPLATE_DEPS[templateId] ?? [];
  if (deps.length > 0) {
    await execa('npm', ['install', ...deps], { cwd: targetDir, stdio: 'inherit' });
  }

  const skillSrc = path.join(packageRoot, 'skills', templateId, 'SKILL.md');
  if (!fs.existsSync(skillSrc)) throw new Error('Skill not found: ' + skillSrc);
  const skillDestDir = path.resolve(targetDir, '.claude', 'skills', templateId);
  await fs.ensureDir(skillDestDir);
  await fs.copy(skillSrc, path.join(skillDestDir, 'SKILL.md'));

  const assetsSrc = path.join(packageRoot, 'skills', templateId, 'assets');
  if (fs.existsSync(assetsSrc)) {
    await fs.copy(assetsSrc, path.join(targetDir, 'public', 'assets'));
  }

  const config = {
    template: templateId,
    brand: {
      name: brand.name || projectName,
      palette: {
        bg: palette.bg || DEFAULT_PALETTE.bg,
        fg: palette.fg || DEFAULT_PALETTE.fg,
        accent: palette.accent || DEFAULT_PALETTE.accent,
      },
    },
    segments: { ...DEFAULT_SEGMENTS, ...(options.segments ?? {}) },
  };
  await fs.writeJson(path.join(targetDir, 'template-config.json'), config, { spaces: 2 });

  return targetDir;
}
```

### `src/index.js`

Beyond the original argument handling, the `new` flow now asks for brand tokens
before scaffolding:

```javascript
const brandName = await askText({ message: 'Brand name?', placeholder: projectName });
if (brandName === null) return;                    // null means Ctrl+C

const bg = await askText({
  message: 'Background colour (hex, Enter for default)',
  placeholder: DEFAULT_PALETTE.bg,
  validate: optionalHex,                            // empty allowed, bad hex rejected
});
if (bg === null) return;
// ...foreground and accent follow the same pattern

const brand = {
  name: brandName || projectName,
  palette: {
    bg: normalizeHex(bg) || DEFAULT_PALETTE.bg,
    fg: normalizeHex(fg) || DEFAULT_PALETTE.fg,
    accent: normalizeHex(accent) || DEFAULT_PALETTE.accent,
  },
};

await scaffoldProject(projectName, template, { brand });
```

`normalizeHex` accepts `#faf9f7`, `faf9f7`, and `#fff` (expanded to `#ffffff`), and
returns `null` for anything else. `isHexColor` is exported so the prompt validator and
any future code share one rule.

---

## Phase 2: Global Installation

```bash
npm install     # once
npm link        # puts `webtemplates` on PATH
```

`npm link` symlinks the package, so later edits to this repo take effect immediately.

---

## Phase 3: The $10k Site Workflow

1. **Generate:** `cd` to the client folder, then `webtemplates new`. Pick a template,
   name the project, enter the brand name and three hex colours. Wait 30–60 seconds.
2. **Review:** open `template-config.json`. Fix the palette if the client sent new
   guidelines — everything brand-specific is in this one file.
3. **Build:** `cd <project> && claude`, then paste:

   > *"Read the design contract in `.claude/skills/` and the branding tokens in
   > `template-config.json`. Then write the React components for this project.
   > Implement the full scene and scroll logic described in the SKILL.md file.
   > Ensure you install any missing dependencies."*

4. **Run:** `npm run dev`, and `npm run build` before handoff.

---

## Phase 4: What's Implemented, What's Next

Done:

- **Asset copier** — `skills/<template-id>/assets/` is copied to `public/assets/` on
  every generation; templates without the folder are untouched.
- **Brand prompts** — the CLI writes the client's name and palette into
  `template-config.json` so Claude never guesses colours.

Next:

1. **Segment prompts** — ask for `hero` and `motion_profile` too, instead of always
   writing the defaults in `DEFAULT_SEGMENTS`.
2. **`webtemplates add <template>`** — drop a skill contract into an existing project
   without regenerating the Vite app.
3. **Add a 4th template** — create `skills/<new-id>/SKILL.md`. The CLI detects it and
   lists it automatically; no code changes. Add an entry to `TEMPLATE_DEPS` only if it
   needs packages beyond Vite + React.
