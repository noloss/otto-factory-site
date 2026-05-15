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
// AC1 – Headline contains "Claude subscription" and "software factory"
// ---------------------------------------------------------------------------
test('AC1: headline contains "Claude subscription"', () => {
  assert.ok(
    html.includes('Claude subscription'),
    'Expected headline to contain the text "Claude subscription"'
  );
});

test('AC1: headline contains "software factory"', () => {
  assert.ok(
    html.includes('software factory'),
    'Expected headline to contain the text "software factory"'
  );
});

// ---------------------------------------------------------------------------
// AC2 – Subheadline with exact required text
// ---------------------------------------------------------------------------
test('AC2: subheadline is present with required text', () => {
  const required =
    'Describe what you want to build. otto-factory writes the code, tests it, and reviews it \u2014 automatically.';
  assert.ok(
    html.includes(required),
    `Expected subheadline text: "${required}"`
  );
});

// ---------------------------------------------------------------------------
// AC3 – CTA button href="#get-started"
// ---------------------------------------------------------------------------
test('AC3: "Get started on GitHub" button text is present', () => {
  assert.ok(
    html.includes('Get started on GitHub'),
    'Expected a button/link with text "Get started on GitHub"'
  );
});

test('AC3: CTA button href points to #get-started', () => {
  // Match any <a> tag that contains href="#get-started"
  const hrefPattern = /href\s*=\s*["']#get-started["']/;
  assert.ok(
    hrefPattern.test(html),
    'Expected an element with href="#get-started"'
  );
});

test('AC3: CTA button uses accent colour #58a6ff', () => {
  // Accept either the exact hex value or a CSS variable / class that references it,
  // but the simplest signal is the hex itself appearing in the file (inline style or CSS block).
  assert.ok(
    html.includes('#58a6ff'),
    'Expected accent colour #58a6ff to appear in the page (inline style or embedded CSS)'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
