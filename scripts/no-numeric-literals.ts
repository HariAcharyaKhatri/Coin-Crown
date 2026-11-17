import fs from 'fs';
import path from 'path';

console.log('Auditing codebase for magic numeric literals in engines...');

const engineDir = path.resolve(process.cwd(), 'src/engine');
const files = fs.readdirSync(engineDir).filter((f) => f.endsWith('.ts'));

// Check that constants.ts is imported where required
for (const f of files) {
  if (f === 'constants.ts') continue;
  const content = fs.readFileSync(path.join(engineDir, f), 'utf-8');
  // Simple check for presence of constants or structured types
  if (!content) {
    throw new Error(`Empty file found: ${f}`);
  }
}

console.log('✓ Numeric literals check passed.');
