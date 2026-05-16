'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.join(__dirname, '..', 'index.html');

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

// ---------------------------------------------------------------------------
// Scenario 1 – No legacy brand name visible on page load
// ---------------------------------------------------------------------------
test('Scenario 1: page contains no occurrence of "Prompt Masker"', () => {
  assert.ok(
    !html.includes('Prompt Masker'),
    'Expected no visible text to contain "Prompt Masker" but it was found in index.html'
  );
});

// ---------------------------------------------------------------------------
// Scenario 2 – Primary heading reflects new brand
// ---------------------------------------------------------------------------
// Extract the first <h1> element (greedy enough to capture inner HTML across tags)
test('Scenario 2: <h1> / hero headline contains "Otto Factory"', () => {
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  assert.ok(
    h1Match,
    'Expected a <h1> element to be present on the page'
  );

  // Strip HTML tags to get plain text content
  const h1Text = h1Match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

  assert.ok(
    h1Text.includes('Otto Factory'),
    `Expected <h1> text to contain "Otto Factory" but got: "${h1Text}"`
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
