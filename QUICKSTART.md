# Quickstart

`webtemplates` scaffolds a Vite + React project already wired with the motion stack a
template needs (Three.js, GSAP, Framer Motion), plus two files that drive the build:

- `.claude/skills/<template>/SKILL.md` — the design contract Claude Code implements.
- `template-config.json` — you edit this. Brand name and palette live here.

You do not hand-write the React/WebGL code; Claude Code does that from the contract.

## Requirements

- Node.js 18 or newer (`node -v`)
- npm
- Claude Code CLI, for step 4 (`claude`)

## 1. Install the CLI once

From this repo:

```bash
npm install
npm link
```

`npm link` puts `webtemplates` on your PATH. Verify:

```bash
webtemplates --version
webtemplates list
```

If `npm link` is blocked on your machine, run the CLI from this repo instead:
`npm run wt -- new`.

## 2. Generate a project

```bash
cd path/to/clients
webtemplates new
```

You will be asked, in order:

| Prompt | Notes |
| :--- | :--- |
| Template | `disect-breakdown`, `inspect-traverse-pov`, or `bold-minimalist-brand` |
| Project name | Also the folder name. Must not already exist. |
| Brand name | Written to `template-config.json`. Enter accepts the project name. |
| Background / foreground / accent | Hex. `#faf9f7`, `faf9f7`, and `#fff` all work. Enter keeps the template default. |

Then it creates the Vite app, installs the base and template dependencies, copies the
skill contract into `.claude/skills/`, copies any prepackaged assets, and writes
`template-config.json`. Expect 30–60 seconds on a warm npm cache.

Resulting folder:

```
my-site/
├── .claude/skills/<template>/SKILL.md   # design contract, read by Claude Code
├── public/assets/                       # only if the template ships assets
├── src/
├── template-config.json                 # brand tokens
└── package.json
```

## 3. Adjust the brand later

Edit `template-config.json`; nothing else needs to change.

```json
{
  "template": "bold-minimalist-brand",
  "brand": {
    "name": "Aperture Audio",
    "palette": { "bg": "#0b0b0c", "fg": "#f4f1ea", "accent": "#ff5a1f" }
  },
  "segments": { "hero": "editorial-center", "motion_profile": "restrained" }
}
```

| Field | Meaning |
| :--- | :--- |
| `brand.name` | Wordmark / page title text |
| `brand.palette.bg` | Page and canvas background |
| `brand.palette.fg` | Primary text and line colour |
| `brand.palette.accent` | Single highlight colour: HUD text, progress, hover states |
| `segments.hero` | Hero layout variant named in the skill contract |
| `segments.motion_profile` | How aggressive the motion is: `restrained` or expressive |

One accent per site. Two competing accents is what makes a page look like a template.

## 4. Build the React app with Claude Code

```bash
cd my-site
claude
```

Prompt:

> Read the design contract in `.claude/skills/` and the branding tokens in
> `template-config.json`. Then write the React components for this project and
> implement the full scene and scroll logic described in `SKILL.md`. Install any
> missing dependencies. Respect the acceptance checks at the bottom of the skill.

Claude substitutes the palette into the scene, and the acceptance checks at the end
of the skill are your review list.

## 5. Run and ship

```bash
npm run dev      # local preview
npm run build    # production bundle in dist/
```

## Prepackaged assets

If a template ships fonts, textures, or models, they live in this repo at
`skills/<template-id>/assets/` and are copied to `public/assets/` on generation.
Reference them from code as `/assets/...` (Vite serves `public/` at the root).

Templates without that folder skip the copy — nothing breaks.

To add assets for future projects, drop files in `skills/<template-id>/assets/`.
They ship with the next `webtemplates new` and never overwrite an existing project.

## Command reference

| Command | Does |
| :--- | :--- |
| `webtemplates new` | Interactive generator (same as running with no args) |
| `webtemplates list` | Print template ids and descriptions |
| `webtemplates --version` | Print CLI version |
| `webtemplates --help` | Print usage |
| `npm run wt -- <args>` | Run from the repo without linking |

## Troubleshooting

**`Directory already exists: my-site`** — the target folder is there. Use another name
or remove it. Generation never overwrites.

**`Skill not found: .../skills/<id>/SKILL.md`** — that template folder has no contract.
Add the `SKILL.md`, or pick a template from `webtemplates list`.

**`npm create vite@latest` fails** — usually network or a registry setting. Check
`npm config get registry`, then rerun.

**The palette prompt rejects my colour** — it wants 3 or 6 hex digits. `#123456`,
`123456`, and `#abc` are accepted; `rgb(0,0,0)` and named colours are not.

**Ctrl+C during the prompts** — nothing is written; the folder is only created after
you confirm the palette.

**I changed the CLI code** — `npm link` uses a symlink, so edits apply immediately.
No reinstall needed.
