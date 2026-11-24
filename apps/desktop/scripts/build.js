const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('[Build] Compiling TypeScript main & preload...');
execSync('npx tsc', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

console.log('[Build] Copying renderer assets to dist/renderer...');
const distRenderer = path.join(__dirname, '../dist/renderer');
fs.mkdirSync(distRenderer, { recursive: true });

const srcRenderer = path.join(__dirname, '../src/renderer');
for (const file of fs.readdirSync(srcRenderer)) {
  const srcFile = path.join(srcRenderer, file);
  const destFile = path.join(distRenderer, file);
  fs.copyFileSync(srcFile, destFile);
}
console.log('[Build] Complete: main, preload, and renderer built in dist/.');
