import fs from 'fs';
import path from 'path';

function scan(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        scan(full);
      }
    } else if (/\.(tsx?|css|json|html|webmanifest)$/.test(file)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        // Match url('/...') or src='/...' or href='/...' or '/assets/...'
        const m =
          line.match(/(src|href|url)\s*[:=(]\s*['"]\/[^\/]/) ||
          line.match(/['"`]\/(assets|images|icons|fonts|src)\//);
        if (m) {
          console.log(`${full}:${i + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

console.log('--- Scanning for absolute asset references ---');
scan('.');
console.log('--- Scan complete ---');
