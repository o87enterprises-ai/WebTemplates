import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, '../skills');

export function getTemplates() {
  if (!fs.existsSync(skillsDir)) return [];
  
  const dirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  return dirs.map(dir => {
    const skillPath = path.join(skillsDir, dir, 'SKILL.md');
    if (!fs.existsSync(skillPath)) return null;
    
    const content = fs.readFileSync(skillPath, 'utf8');
    
    let name = dir;
    let description = '';

    // 1. Get the name
    const nameMatch = content.match(/name:\s*([^\r\n]+)/);
    if (nameMatch) name = nameMatch[1].trim();

    // 2. Get the description using strict string indexing
    const descStart = content.indexOf('description:');
    if (descStart !== -1) {
       let rest = content.substring(descStart + 12);
       
       // Find the next YAML key (e.g. license:, compatibility:)
       const nextKey = rest.search(/^\w+:/m);
       if (nextKey !== -1) {
          rest = rest.substring(0, nextKey);
       }
       
       // Clean up YAML symbols, HTML entities, and flatten to one line
       description = rest
         .replace(/>-|\|/g, '')
         .replace(/&#x[0-9a-fA-F]+;/g, '') // Strips things like &#x20;
         .replace(/&nbsp;/g, '')
         .replace(/\s+/g, ' ')
         .trim();
    }
    
    return { id: dir, name, description };
  }).filter(Boolean);
}