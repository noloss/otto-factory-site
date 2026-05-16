'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.join(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (err) {
  console.error('FAIL: could not read package.json —', err.message);
  process.exit(1);
}

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
// Scenario 2 — No server-only packages in package.json "dependencies"
// ---------------------------------------------------------------------------

/**
 * Packages that are exclusively server-side runtime frameworks.
 * A static site should never need these in "dependencies".
 */
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

const runtimeDeps = Object.keys(pkg.dependencies || {});

test('Scenario 2: package.json has no "dependencies" field, or it is empty', () => {
  assert.ok(
    runtimeDeps.length === 0,
    `Expected zero runtime dependencies but found: ${runtimeDeps.join(', ')}`
  );
});

SERVER_ONLY_PACKAGES.forEach((pkg_name) => {
  test(`Scenario 2: "${pkg_name}" is not listed in dependencies`, () => {
    assert.ok(
      !runtimeDeps.includes(pkg_name),
      `Server-side package "${pkg_name}" must not appear in package.json "dependencies"`
    );
  });
});

// ---------------------------------------------------------------------------
// Scenario 1 — No server entry-point files in the project root
// ---------------------------------------------------------------------------

const SERVER_ENTRY_POINTS = [
  'server.js',
  'server.mjs',
  'server.cjs',
  'app.js',
  'app.mjs',
  'index.js',
];

SERVER_ENTRY_POINTS.forEach((filename) => {
  test(`Scenario 1: no server entry-point file "${filename}" exists in project root`, () => {
    const filePath = path.join(rootDir, filename);
    const exists = fs.existsSync(filePath);
    assert.ok(
      !exists,
      `Found server entry-point "${filename}" — remove it or move it out of the project root`
    );
  });
});

// ---------------------------------------------------------------------------
// Scenario 1 — The site is served from a single static HTML file
// ---------------------------------------------------------------------------

test('Scenario 1: index.html exists as the static site entry point', () => {
  const htmlPath = path.join(rootDir, 'index.html');
  assert.ok(
    fs.existsSync(htmlPath),
    'Expected index.html to exist as the static site entry point'
  );
});

test('Scenario 1: index.html is a valid HTML document (contains DOCTYPE)', () => {
  const htmlPath = path.join(rootDir, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(
    /<!DOCTYPE\s+html/i.test(html),
    'Expected index.html to contain <!DOCTYPE html>'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
