import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { getTemplates } from './templates.js';
import { scaffoldProject, DEFAULT_PALETTE } from './generators/shared/scaffold.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Accepts `#fff`, `ffffff`, or `#FFFFFF` and returns `#ffffff`, or null if invalid.
export function normalizeHex(value) {
  if (!value) return null;
  const raw = String(value).trim().replace(/^#/, '').toLowerCase();
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  return /^[0-9a-f]{6}$/.test(full) ? '#' + full : null;
}

export function isHexColor(value) {
  return normalizeHex(value) !== null;
}

// Empty is allowed for the brand prompts: Enter keeps the template default.
function optionalHex(value) {
  if (!value) return undefined;
  if (!isHexColor(value)) return 'Use a 3 or 6 digit hex colour, e.g. #faf9f7';
  return undefined;
}

async function askText(options) {
  const value = await p.text(options);
  if (p.isCancel(value)) {
    p.cancel('Operation cancelled.');
    return null;
  }
  return typeof value === 'string' ? value.trim() : '';
}

export async function run() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\n' + pc.bold('webtemplates') + ' - CLI for generating high-end interactive sites\n');
    console.log(pc.bold('Usage:'));
    console.log('  webtemplates new       Start the interactive generator');
    console.log('  webtemplates list      List available templates');
    console.log('  webtemplates --version Show version\n');
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    const pkg = fs.readJsonSync(path.resolve(__dirname, '../package.json'));
    console.log(pkg.version);
    return;
  }

  if (args[0] === 'list') {
    const templates = getTemplates();
    console.log(pc.bold('\nAvailable Templates:\n'));
    templates.forEach(t => console.log('  ' + pc.cyan(t.id) + ' - ' + t.description.substring(0, 80) + '...'));
    console.log('');
    return;
  }

  if (args[0] === 'new' || args.length === 0) {
    p.intro(pc.bgCyan(pc.black(' WebTemplates Generator ')));
    const templates = getTemplates();

    if (templates.length === 0) {
      p.cancel('No templates found in the skills/ directory.');
      return;
    }

    const template = await p.select({
      message: 'Which template would you like to build?',
      options: templates.map(t => ({ value: t.id, label: t.name, hint: t.description.substring(0, 60) + '...' }))
    });

    if (p.isCancel(template)) {
      p.cancel('Operation cancelled.');
      return;
    }

    const projectName = await p.text({
      message: 'What is the project name?',
      placeholder: 'my-awesome-site',
      validate: (val) => { if (!val) return 'Project name is required'; }
    });

    if (p.isCancel(projectName) || !projectName) {
      p.cancel('Operation cancelled.');
      return;
    }

    const brandName = await askText({
      message: 'Brand name?',
      placeholder: projectName,
    });
    if (brandName === null) return;

    const bg = await askText({
      message: 'Background colour (hex, Enter for default)',
      placeholder: DEFAULT_PALETTE.bg,
      validate: optionalHex,
    });
    if (bg === null) return;

    const fg = await askText({
      message: 'Foreground / text colour (hex, Enter for default)',
      placeholder: DEFAULT_PALETTE.fg,
      validate: optionalHex,
    });
    if (fg === null) return;

    const accent = await askText({
      message: 'Accent colour (hex, Enter for default)',
      placeholder: DEFAULT_PALETTE.accent,
      validate: optionalHex,
    });
    if (accent === null) return;

    const brand = {
      name: brandName || projectName,
      palette: {
        bg: normalizeHex(bg) || DEFAULT_PALETTE.bg,
        fg: normalizeHex(fg) || DEFAULT_PALETTE.fg,
        accent: normalizeHex(accent) || DEFAULT_PALETTE.accent,
      },
    };

    const s = p.spinner();
    s.start('Scaffolding project (this may take a minute)...');

    try {
      await scaffoldProject(projectName, template, { brand });
      s.stop('Project generated successfully!');
      p.outro(pc.green(
        'Brand tokens written for ' + brand.name + ': ' +
        brand.palette.bg + ' / ' + brand.palette.fg + ' / ' + brand.palette.accent +
        '\n\nTo start the dev server:\n  cd ' + projectName + '\n  npm run dev'
      ));
    } catch (err) {
      s.stop('Failed to generate project.');
      p.cancel(err.message);
    }
  }
}
