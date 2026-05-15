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

// Extract the embedded <style> block contents.
function getStyleBlock() {
  const match = html.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  assert.ok(match, 'Expected a <style> block in the document');
  return match[1];
}

/**
 * Extract and concatenate the inner content of every @media block whose
 * max-width value is ≤ maxPx.  Uses brace-counting to handle nested rules.
 */
function getMobileMediaContent(css, maxPx) {
  const blocks = [];
  const mediaRe = /@media\s*[^{]*max-width\s*:\s*(\d+)px[^{]*\{/g;
  let m;
  while ((m = mediaRe.exec(css)) !== null) {
    if (parseInt(m[1], 10) > maxPx) continue;
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    blocks.push(css.slice(start, i - 1));
  }
  return blocks.join('\n');
}

// ---------------------------------------------------------------------------
// AC1 – No horizontal overflow at 375 px width
// ---------------------------------------------------------------------------

test('AC1: overflow-x: hidden is set in the stylesheet to prevent horizontal scroll', () => {
  const css = getStyleBlock();
  assert.ok(
    /overflow-x\s*:\s*hidden/.test(css),
    'Expected overflow-x: hidden to appear somewhere in the <style> block'
  );
});

test('AC1: at least one mobile breakpoint (max-width ≤ 600px) media query is present', () => {
  const css = getStyleBlock();
  const mobileContent = getMobileMediaContent(css, 600);
  assert.ok(
    mobileContent.length > 0,
    'Expected at least one @media query with max-width ≤ 600px'
  );
});

// ---------------------------------------------------------------------------
// AC2 – Comparison section stacks vertically below 600 px
// ---------------------------------------------------------------------------

test('AC2: .comparison uses flex-direction: column inside mobile media query', () => {
  const css = getStyleBlock();
  const mobile = getMobileMediaContent(css, 600);
  assert.ok(
    /\.comparison\s*\{[^}]*flex-direction\s*:\s*column/i.test(mobile),
    'Expected .comparison { flex-direction: column } inside a max-width ≤ 600px @media block'
  );
});

test('AC2: .comparison__option fills full width inside mobile media query', () => {
  const css = getStyleBlock();
  const mobile = getMobileMediaContent(css, 600);
  assert.ok(
    /\.comparison__option\s*\{[^}]*(?:max-width|width)\s*:\s*100%/i.test(mobile),
    'Expected .comparison__option to have max-width or width: 100% inside a max-width ≤ 600px @media block'
  );
});

// ---------------------------------------------------------------------------
// AC3 – How-it-works steps stack vertically below 600 px
// ---------------------------------------------------------------------------

test('AC3: .steps uses flex-direction: column inside mobile media query', () => {
  const css = getStyleBlock();
  const mobile = getMobileMediaContent(css, 600);
  assert.ok(
    /\.steps\s*\{[^}]*flex-direction\s*:\s*column/i.test(mobile),
    'Expected .steps { flex-direction: column } inside a max-width ≤ 600px @media block'
  );
});

test('AC3: .step fills full width inside mobile media query', () => {
  const css = getStyleBlock();
  const mobile = getMobileMediaContent(css, 600);
  assert.ok(
    /\.step\s*\{[^}]*(?:max-width|width)\s*:\s*100%/i.test(mobile),
    'Expected .step to have max-width or width: 100% inside a max-width ≤ 600px @media block'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
