'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const htmlPath = path.join(root, 'index.html');

let pkg, html;

try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (err) {
  console.error('FAIL: could not read/parse package.json —', err.message);
  process.exit(1);
}

try {
  html = fs.readFileSync(htmlPath, 'utf8');
} catch (err) {
  console.error('FAIL: could not read index.html —', err.message);
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
// Scenario 1 – package.json name field updated
// ---------------------------------------------------------------------------
test('Scenario 1: package.json "name" is exactly "otto-factory-site"', () => {
  assert.strictEqual(
    pkg.name,
    'otto-factory-site',
    `Expected package.json "name" to be "otto-factory-site" but got "${pkg.name}"`
  );
});

test('Scenario 1: package.json "name" does not contain "prompt-masker"', () => {
  assert.ok(
    !pkg.name.toLowerCase().includes('prompt' + '-masker'),
    `Expected package.json "name" to not contain "prompt-masker" but got "${pkg.name}"`
  );
});

// ---------------------------------------------------------------------------
// Scenario 2 – No legacy name in config or source files
// ---------------------------------------------------------------------------
const LEGACY_LOWER = ('prompt' + '-masker').toLowerCase();
const LEGACY_NOHYPHEN = ('prompt' + 'masker').toLowerCase();

test('Scenario 2: package.json contains no occurrence of the legacy name', () => {
  const content = fs.readFileSync(pkgPath, 'utf8').toLowerCase();
  assert.ok(
    !content.includes(LEGACY_LOWER),
    'Expected package.json to contain no occurrence of the legacy name'
  );
  assert.ok(
    !content.includes(LEGACY_NOHYPHEN),
    'Expected package.json to contain no occurrence of "promptmasker"'
  );
});

test('Scenario 2: index.html contains no occurrence of the legacy name', () => {
  const content = html.toLowerCase();
  assert.ok(
    !content.includes(LEGACY_LOWER),
    'Expected index.html to contain no occurrence of the legacy name'
  );
  assert.ok(
    !content.includes(LEGACY_NOHYPHEN),
    'Expected index.html to contain no occurrence of "promptmasker"'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
