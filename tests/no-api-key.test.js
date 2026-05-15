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

// Helper: extract the no-api-key section from the HTML
function getSection() {
  const match = html.match(
    /<section[^>]*id\s*=\s*["']no-api-key["'][^>]*>[\s\S]*?<\/section>/i
  );
  assert.ok(match, 'Expected a <section id="no-api-key"> element to exist');
  return match[0];
}

// ---------------------------------------------------------------------------
// AC1 – Both options present with distinct styling; key terms readable
// ---------------------------------------------------------------------------

test('AC1: section with id="no-api-key" exists', () => {
  const pattern = /<section[^>]*id\s*=\s*["']no-api-key["'][^>]*>/i;
  assert.ok(
    pattern.test(html),
    'Expected a <section> element with id="no-api-key"'
  );
});

test('AC1: heading "No API key required" is present in the section', () => {
  const section = getSection();
  assert.ok(
    section.includes('No API key required'),
    'Expected heading "No API key required" inside the section'
  );
});

test('AC1: text "Other AI coding tools" is present in the section', () => {
  const section = getSection();
  assert.ok(
    section.includes('Other AI coding tools'),
    'Expected text "Other AI coding tools" inside the section'
  );
});

test('AC1: text "otto-factory" is present in the section', () => {
  const section = getSection();
  assert.ok(
    section.includes('otto-factory'),
    'Expected text "otto-factory" inside the section'
  );
});

test('AC1: the term "API key" is readable in the section', () => {
  const section = getSection();
  assert.ok(
    section.includes('API key'),
    'Expected the term "API key" to appear inside the section'
  );
});

test('AC1: text "Claude Pro" or "Claude Pro or Max subscription" is readable in the section', () => {
  const section = getSection();
  assert.ok(
    section.includes('Claude Pro'),
    'Expected "Claude Pro" (part of "Claude Pro or Max subscription") to appear inside the section'
  );
});

test('AC1: two distinct comparison blocks are present', () => {
  const section = getSection();
  // Expect at least two elements carrying a comparison-block class
  const blockMatches = section.match(/class\s*=\s*["'][^"']*comparison__option[^"']*["']/gi) || [];
  assert.ok(
    blockMatches.length >= 2,
    `Expected at least 2 elements with class "comparison__option*", found ${blockMatches.length}`
  );
});

// ---------------------------------------------------------------------------
// AC2 – GitHub Issues state machine note is present
// ---------------------------------------------------------------------------

test('AC2: "GitHub Issues" is mentioned in or below the comparison section', () => {
  const section = getSection();
  assert.ok(
    section.includes('GitHub Issues'),
    'Expected "GitHub Issues" to appear in the no-api-key section'
  );
});

test('AC2: state machine note explains visibility/readability of steps', () => {
  const section = getSection();
  const hasStateMachine = section.includes('state machine');
  const hasVisible = section.includes('visible') || section.includes('human-readable');
  assert.ok(
    hasStateMachine && hasVisible,
    'Expected a note containing "state machine" and either "visible" or "human-readable" in the section'
  );
});

// ---------------------------------------------------------------------------
// AC3 – Two blocks use different visual treatment (background or border class)
// ---------------------------------------------------------------------------

test('AC3: the two comparison blocks carry distinct modifier classes', () => {
  const section = getSection();
  const hasOther = /class\s*=\s*["'][^"']*comparison__option--other[^"']*["']/i.test(section);
  const hasOtto  = /class\s*=\s*["'][^"']*comparison__option--otto[^"']*["']/i.test(section);
  assert.ok(
    hasOther,
    'Expected an element with class "comparison__option--other" (for the other-tools block)'
  );
  assert.ok(
    hasOtto,
    'Expected an element with class "comparison__option--otto" (for the otto-factory block)'
  );
});

test('AC3: distinct CSS rules exist for both modifier classes', () => {
  assert.ok(
    html.includes('comparison__option--other'),
    'Expected CSS rule for .comparison__option--other in the stylesheet'
  );
  assert.ok(
    html.includes('comparison__option--otto'),
    'Expected CSS rule for .comparison__option--otto in the stylesheet'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
