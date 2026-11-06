# WebTemplates — Project Handoff & Completion Guide

## How This System Works

This repo is a CLI-based scaffolding engine.

1. You run the CLI and select a template (e.g., `disect-breakdown`).
2. The CLI creates a new Vite + React project, installs the required heavy-lifting
   libraries (Three.js, GSAP, Framer Motion), and drops a `template-config.json`
   and a `SKILL.md` file into the new folder.
3. **You do not write the React code manually.** You open the new folder in your
   terminal, type `claude`, and tell it: *"Build the site based on the SKILL.md and
   template-config.json"*. Claude Code reads the design contract and generates the
   complex 3D/scroll code for you.

---

## Phase 1: Finish the CLI Code (Series 4)

*Status: done. Both files below are already in this repo and wired together.*

### File 1: `src/generators/shared/scaffold.js`

```javascript
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Package root (this file lives at <root>/src/generators/shared/scaffold.js).
// Skills must resolve from the installed package, not from the user's cwd,
// otherwise `webtemplates new` fails when run outside this repo.
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const TEMPLATE_DEPS = {
  'disect-breakdown': ['three', 'gsap'],
  'inspect-traverse-pov': ['gsap'],
  'bold-minimalist-brand': ['framer-motion', 'lenis', 'gsap'],
};

export async function scaffoldProject(projectName, templateId) {
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    throw new Error('Directory already exists: ' + projectName);
  }

  // 1. Create Vite project
  await execa('npm', ['create', 'vite@latest', projectName, '--', '--template', 'react'], { stdio: 'inherit' });

  // 2. Install base dependencies
  await execa('npm', ['install'], { cwd: targetDir, stdio: 'inherit' });

  // 3. Install template-specific dependencies
  const deps = TEMPLATE_DEPS[templateId] ?? [];
  if (deps.length > 0) {
    await execa('npm', ['install', ...deps], { cwd: targetDir, stdio: 'inherit' });
  }

  // 4. Copy SKILL.md to the new project so Claude Code can read it
  const skillSrc = path.join(packageRoot, 'skills', templateId, 'SKILL.md');
  if (!fs.existsSync(skillSrc)) {
    throw new Error('Skill not found: ' + skillSrc);
  }
  const skillDestDir = path.resolve(targetDir, '.claude', 'skills', templateId);
  await fs.ensureDir(skillDestDir);
  await fs.copy(skillSrc, path.join(skillDestDir, 'SKILL.md'));

  // 5. Create template-config.json for brand customization
  const config = {
    template: templateId,
    brand: {
      name: projectName,
      palette: { bg: '#faf9f7', fg: '#111111', accent: '#e63946' }
    },
    segments: {
      hero: 'editorial-center',
      motion_profile: 'restrained'
    }
  };
  await fs.writeJson(path.join(targetDir, 'template-config.json'), config, { spaces: 2 });

  return targetDir;
}
```

### File 2: `src/index.js`

The `new` branch ends by calling the generator inside a spinner:

```javascript
const s = p.spinner();
s.start('Scaffolding project (this may take a minute)...');

try {
  await scaffoldProject(projectName, template);
  s.stop('Project generated successfully!');
  p.outro(pc.green('To start the dev server:\n  cd ' + projectName + '\n  npm run dev'));
} catch (err) {
  s.stop('Failed to generate project.');
  p.cancel(err.message);
}
```

---

## Phase 2: Global Installation

Link the CLI so you can run `webtemplates` from any directory, not just inside this repo.

```powershell
# Make the CLI global
npm link

# Commit your progress
git add .
git commit -m "feat(cli): complete generator engine and CLI logic"
```

Run these from the `WebTemplates` root folder.

---

## Phase 3: The $10k Site Workflow

### Step 1: Generate the Project

Navigate to the folder where you want the client's site to live
(e.g., `cd C:\Users\there\Desktop\Clients`), and run:

```powershell
webtemplates new
```

1. Select a template.
2. Name the project (e.g., `nike-teardown`).
3. Wait for the spinner to finish.

### Step 2: Customize the Brand (Without Claude)

Open the newly created folder. You will see a `template-config.json` file. Open it
in Notepad and change the `bg`, `fg`, and `accent` hex codes to match the client's
brand guidelines.

### Step 3: Let Claude Build the React App

1. Navigate into the new project folder: `cd nike-teardown`
2. Launch Claude Code: `claude`
3. Paste this prompt into Claude:

> *"Read the design contract in `.claude/skills/` and the branding tokens in
> `template-config.json`. Then, write the React components for this project.
> Implement the full scene and scroll logic described in the SKILL.md file.
> Ensure you install any missing dependencies."*

Claude Code will read the `SKILL.md`, look at the `template-config.json` to get the
client's colors, and write all the complex Three.js, GSAP, and React code for you.

---

## Phase 4: Next Steps (Future Expansions)

Now that you have a working v1, here is how you can expand this engine later.

1. **Add an Asset Copier:** Update `scaffold.js` to copy a `public/assets` folder
   if you want to pre-load fonts or 3D models.
2. **Advanced Prompts:** Update `src/index.js` to ask the user for their brand colors
   during the CLI flow, and write those directly into the `template-config.json` so
   Claude doesn't have to guess.
3. **Add a 4th Template:** Just create a new folder in `skills/` with a `SKILL.md`,
   and the CLI will automatically detect it and list it in the menu! (No code changes
   required.)

---

## Notes / Corrections Applied

- **Skill source path:** the original `scaffold.js` read the skill from
  `process.cwd()/skills/<id>/SKILL.md`. That works only when you run the CLI from
  inside this repo. After `npm link`, `cwd` is the client folder, so the copy would
  throw `ENOENT`. It now resolves `skills/` from the package root via
  `import.meta.url`. `targetDir` still resolves against `cwd`, so projects are
  created wherever you run the command.
- **Dependency map:** template → packages lives in one `TEMPLATE_DEPS` object
  instead of a chain of `if` statements.
