'use strict';

/**
 * R2 – Configure static build output for GitHub Pages
 *
 * Acceptance criteria verified:
 *   Scenario 1: `npm run build` produces a static output directory containing
 *               at minimum an index.html file
 *   Scenario 2: Built output contains no .server.js files, back-end entry
 *               points, or files that require a Node runtime at request time
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Run the build before checking output
// ---------------------------------------------------------------------------

try {
  execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
} catch (err) {
  console.error('FAIL: `npm run build` exited with a non-zero code');
  console.error(err.stderr ? err.stderr.toString() : err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helper: recursively collect all files under a directory
// ---------------------------------------------------------------------------

function collectFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return results;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Scenario 1 – Build command produces a static output directory
// ---------------------------------------------------------------------------

test('Scenario 1: dist/ directory exists after npm run build', () => {
  assert.ok(
    fs.existsSync(distDir),
    'Expected dist/ directory to exist after running npm run build'
  );
});

test('Scenario 1: dist/ is a directory (not a file)', () => {
  const stat = fs.statSync(distDir);
  assert.ok(stat.isDirectory(), 'Expected dist/ to be a directory');
});

test('Scenario 1: dist/index.html exists', () => {
  const indexPath = path.join(distDir, 'index.html');
  assert.ok(
    fs.existsSync(indexPath),
    'Expected dist/index.html to exist after running npm run build'
  );
});

test('Scenario 1: dist/index.html contains <!DOCTYPE html>', () => {
  const indexPath = path.join(distDir, 'index.html');
  const content = fs.readFileSync(indexPath, 'utf8');
  assert.ok(
    /<!DOCTYPE\s+html/i.test(content),
    'Expected dist/index.html to be a valid HTML document containing <!DOCTYPE html>'
  );
});

// ---------------------------------------------------------------------------
// Scenario 2 – Built output contains no server-executable files
// ---------------------------------------------------------------------------

const SERVER_FILENAME_PATTERNS = [
  /\.server\.js$/i,
  /\.server\.mjs$/i,
  /\.server\.cjs$/i,
  /^server\.js$/i,
  /^server\.mjs$/i,
  /^server\.cjs$/i,
  /^app\.js$/i,
  /^app\.mjs$/i,
  /^app\.cjs$/i,
];

const SERVER_ONLY_PACKAGES = [
  'express',
  'koa',
  'fastify',
  'hapi',
  '@hapi/hapi',
  'restify',
  'connect',
  'http-server',
  'node-static',
  'serve',
  'helmet',
  'morgan',
  'body-parser',
  'cors',
  'compression',
];

test('Scenario 2: dist/ contains no .server.js files', () => {
  const files = collectFiles(distDir);
  const serverFiles = files.filter((f) => /\.server\.(js|mjs|cjs)$/i.test(path.basename(f)));
  assert.strictEqual(
    serverFiles.length,
    0,
    `Found server JS file(s) in dist/: ${serverFiles.map((f) => path.relative(distDir, f)).join(', ')}`
  );
});

test('Scenario 2: dist/ contains no back-end entry-point files (server.js, app.js, index.js)', () => {
  const serverEntryPoints = ['server.js', 'server.mjs', 'server.cjs', 'app.js', 'app.mjs', 'app.cjs', 'index.js'];
  const files = collectFiles(distDir).map((f) => path.basename(f));
  const found = serverEntryPoints.filter((name) => files.includes(name) && name !== 'index.html');
  // index.js is a Node entry point; index.html is fine
  const badFound = found.filter((name) => name !== 'index.html');
  assert.strictEqual(
    badFound.length,
    0,
    `Found back-end entry-point file(s) in dist/: ${badFound.join(', ')}`
  );
});

test('Scenario 2: dist/ contains no package.json (no Node runtime dependency manifest)', () => {
  const pkgPath = path.join(distDir, 'package.json');
  assert.ok(
    !fs.existsSync(pkgPath),
    'Found package.json inside dist/ — the build output should be purely static'
  );
});

test('Scenario 2: dist/ contains no node_modules directory', () => {
  const nmPath = path.join(distDir, 'node_modules');
  assert.ok(
    !fs.existsSync(nmPath),
    'Found node_modules/ inside dist/ — the build output must not include Node dependencies'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
