'use strict';

/**
 * Build script — produces a self-contained static dist/ directory for
 * GitHub Pages deployment.
 *
 * index.html is fully self-contained: all CSS is inlined inside a <style>
 * block and there are no external JS, CSS, image, or font files to copy.
 * Running `npm run build` therefore only needs to copy index.html into dist/.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcFile = path.join(rootDir, 'index.html');
const distDir = path.join(rootDir, 'dist');
const destFile = path.join(distDir, 'index.html');

// Verify that the source file exists before doing anything else.
if (!fs.existsSync(srcFile)) {
  console.error('FAIL: index.html not found');
  process.exit(1);
}

// Create dist/ if it does not already exist.
try {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
} catch (err) {
  console.error(`FAIL: could not create dist/ directory — ${err.message}`);
  process.exit(1);
}

// Copy index.html into dist/.
try {
  fs.copyFileSync(srcFile, destFile);
} catch (err) {
  console.error(`FAIL: could not copy index.html to dist/ — ${err.message}`);
  process.exit(1);
}

console.log('Build OK — dist/index.html written');
console.log('Note: index.html is fully self-contained (styles inlined); no additional assets to copy.');
