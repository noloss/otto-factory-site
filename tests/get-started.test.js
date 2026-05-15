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

// Helper: extract the get-started section from the HTML
function getSection() {
  const match = html.match(
    /<section[^>]*id\s*=\s*["']get-started["'][^>]*>[\s\S]*?<\/section>/i
  );
  assert.ok(match, 'Expected a <section id="get-started"> element to exist');
  return match[0];
}

// ---------------------------------------------------------------------------
// AC1 – Section reachable via #get-started anchor
// ---------------------------------------------------------------------------

test('AC1: section with id="get-started" exists', () => {
  const pattern = /<section[^>]*id\s*=\s*["']get-started["'][^>]*>/i;
  assert.ok(
    pattern.test(html),
    'Expected a <section> element with id="get-started"'
  );
});

test('AC1: heading "Get started" is present in the section', () => {
  const section = getSection();
  assert.ok(
    /Get started/i.test(section),
    'Expected a heading containing "Get started" inside the #get-started section'
  );
});

// ---------------------------------------------------------------------------
// AC2 – Code block shows both key commands with monospace font & distinct bg
// ---------------------------------------------------------------------------

test('AC2: plan command is present in the section', () => {
  const section = getSection();
  assert.ok(
    section.includes('python main.py plan --prd prd.md'),
    'Expected "python main.py plan --prd prd.md" inside the get-started section'
  );
});

test('AC2: run command is present in the section', () => {
  const section = getSection();
  assert.ok(
    section.includes('python main.py run --milestone'),
    'Expected "python main.py run --milestone" inside the get-started section'
  );
});

test('AC2: commands are wrapped in a <pre> or <code> element', () => {
  const section = getSection();
  const hasPreOrCode = /<pre[\s\S]*?<\/pre>/i.test(section) ||
                       /<code[\s\S]*?<\/code>/i.test(section);
  assert.ok(
    hasPreOrCode,
    'Expected the commands to appear inside a <pre> or <code> element'
  );
});

test('AC2: a monospace font-family CSS rule targets the code block', () => {
  // The stylesheet must include "monospace" for an element inside #get-started,
  // either via a class rule or a pre/code rule.
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  assert.ok(styleMatch, 'Expected a <style> block in the document');
  const css = styleMatch[1];
  const hasMonospaceRule =
    /get-started[\s\S]{0,300}monospace/.test(css) ||
    /\.get-started__code[\s\S]{0,300}monospace/.test(css);
  assert.ok(
    hasMonospaceRule,
    'Expected a CSS rule inside the <style> block that applies a monospace font-family to the get-started code block'
  );
});

test('AC2: a visually distinct background CSS rule targets the code block', () => {
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  assert.ok(styleMatch, 'Expected a <style> block in the document');
  const css = styleMatch[1];
  // Look for background property on get-started code element
  const hasBackgroundRule =
    /get-started[\s\S]{0,300}background/.test(css) ||
    /\.get-started__code[\s\S]{0,300}background/.test(css);
  assert.ok(
    hasBackgroundRule,
    'Expected a CSS rule that sets a distinct background on the get-started code block'
  );
});

// ---------------------------------------------------------------------------
// AC3 – GitHub README link is present in the section
// ---------------------------------------------------------------------------

test('AC3: a link to the GitHub repository is present in the section', () => {
  const section = getSection();
  const hasGitHubLink = /href\s*=\s*["']https?:\/\/github\.com\/[^"']+["']/i.test(section);
  assert.ok(
    hasGitHubLink,
    'Expected a visible <a> element linking to https://github.com/... inside the get-started section'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
