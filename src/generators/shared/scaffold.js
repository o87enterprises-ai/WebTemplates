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

export const DEFAULT_PALETTE = {
  bg: '#faf9f7',
  fg: '#111111',
  accent: '#e63946',
};

export const DEFAULT_SEGMENTS = {
  hero: 'editorial-center',
  motion_profile: 'restrained',
};

export async function scaffoldProject(projectName, templateId, options = {}) {
  const targetDir = path.resolve(process.cwd(), projectName);
  const brand = options.brand ?? {};
  const palette = brand.palette ?? {};

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

  // 5. Copy the template's prepackaged assets (fonts, models, textures).
  //    Drop files in skills/<template-id>/assets/ to have them pre-loaded;
  //    templates without that folder simply skip this step.
  const assetsSrc = path.join(packageRoot, 'skills', templateId, 'assets');
  if (fs.existsSync(assetsSrc)) {
    await fs.copy(assetsSrc, path.join(targetDir, 'public', 'assets'));
  }

  // 6. Create template-config.json for brand customization
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
