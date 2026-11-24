const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure dist directories exist and copy renderer assets
const distDir = path.join(__dirname, '../dist');
const distRenderer = path.join(distDir, 'renderer');
fs.mkdirSync(distRenderer, { recursive: true });

// Copy renderer files
const srcRenderer = path.join(__dirname, '../src/renderer');
for (const file of fs.readdirSync(srcRenderer)) {
  fs.copyFileSync(path.join(srcRenderer, file), path.join(distRenderer, file));
}

// Compile TypeScript main & preload
console.log('[Dev] Compiling TypeScript...');
const tsc = spawn('npx', ['tsc'], { stdio: 'inherit', shell: true });

tsc.on('close', (code) => {
  if (code !== 0) {
    console.error('[Dev] TypeScript compilation failed');
    return;
  }
  console.log('[Dev] Launching Electron...');
  const electron = spawn('npx', ['electron', path.join(distDir, 'main/index.js')], {
    stdio: 'inherit',
    shell: true
  });

  electron.on('close', () => process.exit(0));
});
