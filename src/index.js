import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { getTemplates } from './templates.js';
import { scaffoldProject } from './generators/shared/scaffold.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

    if (p.isCancel(projectName)) {
      p.cancel('Operation cancelled.');
      return;
    }

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
  }
}