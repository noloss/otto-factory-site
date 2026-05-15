'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.join(__dirname, '..', 'index.html');

// ---------------------------------------------------------------------------
// AC2 – index.html exists and is readable
// ---------------------------------------------------------------------------
let html;
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

// AC2 – Key structural markers required by the issue

test('AC2: index.html contains "software factory"', () => {
  assert.ok(
    html.includes('software factory'),
    'Expected index.html to contain the string "software factory"'
  );
});

test('AC2: index.html contains "get-started"', () => {
  assert.ok(
    html.includes('get-started'),
    'Expected index.html to contain the string "get-started"'
  );
});

test('AC2: index.html contains "how-it-works"', () => {
  assert.ok(
    html.includes('how-it-works'),
    'Expected index.html to contain the string "how-it-works"'
  );
});

test('AC2: index.html contains "python main.py plan"', () => {
  assert.ok(
    html.includes('python main.py plan'),
    'Expected index.html to contain the string "python main.py plan"'
  );
});

test('AC2: index.html contains "python main.py run"', () => {
  assert.ok(
    html.includes('python main.py run'),
    'Expected index.html to contain the string "python main.py run"'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
