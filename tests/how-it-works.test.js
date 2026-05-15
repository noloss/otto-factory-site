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
// AC1 – Three steps visible with correct headings and descriptions
// ---------------------------------------------------------------------------

test('AC1: section heading "How it works" is present', () => {
  assert.ok(
    html.includes('How it works'),
    'Expected section heading "How it works" to be present'
  );
});

test('AC1: step heading "Write a PRD" is present', () => {
  assert.ok(
    html.includes('Write a PRD'),
    'Expected step heading "Write a PRD" to be present'
  );
});

test('AC1: step heading "Run the planner" is present', () => {
  assert.ok(
    html.includes('Run the planner'),
    'Expected step heading "Run the planner" to be present'
  );
});

test('AC1: step heading "Watch it build" is present', () => {
  assert.ok(
    html.includes('Watch it build'),
    'Expected step heading "Watch it build" to be present'
  );
});

test('AC1: three step description elements are present', () => {
  // Each step should have a class of "step__desc" or similar;
  // we look for three <p> elements inside the how-it-works section.
  // Strategy: extract the how-it-works section and count step descriptions.
  const sectionMatch = html.match(/<section[^>]*id\s*=\s*["']how-it-works["'][^>]*>[\s\S]*?<\/section>/i);
  assert.ok(sectionMatch, 'Expected a <section id="how-it-works"> element');

  const section = sectionMatch[0];
  const stepDescMatches = section.match(/class\s*=\s*["'][^"']*step__desc[^"']*["']/gi) || [];
  assert.ok(
    stepDescMatches.length >= 3,
    `Expected at least 3 step description elements (class="step__desc"), found ${stepDescMatches.length}`
  );
});

// ---------------------------------------------------------------------------
// AC2 – Steps display visible ordinal numbers (1, 2, 3)
// ---------------------------------------------------------------------------

test('AC2: step number "1" appears inside how-it-works section', () => {
  const sectionMatch = html.match(/<section[^>]*id\s*=\s*["']how-it-works["'][^>]*>[\s\S]*?<\/section>/i);
  assert.ok(sectionMatch, 'Expected a <section id="how-it-works"> element');

  const section = sectionMatch[0];
  // Accept the digit in any element that carries a step-number role
  const hasOne = /class\s*=\s*["'][^"']*step__number[^"']*["'][^>]*>\s*1\s*</.test(section);
  assert.ok(hasOne, 'Expected step number "1" inside the how-it-works section');
});

test('AC2: step number "2" appears inside how-it-works section', () => {
  const sectionMatch = html.match(/<section[^>]*id\s*=\s*["']how-it-works["'][^>]*>[\s\S]*?<\/section>/i);
  assert.ok(sectionMatch, 'Expected a <section id="how-it-works"> element');

  const section = sectionMatch[0];
  const hasTwo = /class\s*=\s*["'][^"']*step__number[^"']*["'][^>]*>\s*2\s*</.test(section);
  assert.ok(hasTwo, 'Expected step number "2" inside the how-it-works section');
});

test('AC2: step number "3" appears inside how-it-works section', () => {
  const sectionMatch = html.match(/<section[^>]*id\s*=\s*["']how-it-works["'][^>]*>[\s\S]*?<\/section>/i);
  assert.ok(sectionMatch, 'Expected a <section id="how-it-works"> element');

  const section = sectionMatch[0];
  const hasThree = /class\s*=\s*["'][^"']*step__number[^"']*["'][^>]*>\s*3\s*</.test(section);
  assert.ok(hasThree, 'Expected step number "3" inside the how-it-works section');
});

// ---------------------------------------------------------------------------
// AC3 – Section is reachable via in-page ID
// ---------------------------------------------------------------------------

test('AC3: section element has id="how-it-works"', () => {
  const pattern = /<section[^>]*id\s*=\s*["']how-it-works["'][^>]*>/i;
  assert.ok(
    pattern.test(html),
    'Expected a <section> element with id="how-it-works"'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
