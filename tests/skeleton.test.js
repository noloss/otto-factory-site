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
// AC1 – Dark theme
// ---------------------------------------------------------------------------
test('AC1: page background is #0d1117', () => {
  assert.ok(
    /background\s*:\s*#0d1117/.test(html),
    'Expected body to have background: #0d1117'
  );
});

test('AC1: body text colour is white', () => {
  // Must match `color: white` or `color: #fff` or `color: #ffffff`
  // and it must appear as a body rule (i.e. the colour value is white,
  // not a grey like #c9d1d9).
  const whiteColor = /color\s*:\s*(white|#fff(?:fff)?)\b/i;
  assert.ok(
    whiteColor.test(html),
    'Expected body text colour to be white (#fff, #ffffff, or the keyword white)'
  );
});

test('AC1: system font stack is applied', () => {
  const requiredStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  assert.ok(
    html.includes(requiredStack),
    `Expected font-family to contain exactly: ${requiredStack}`
  );
});

// ---------------------------------------------------------------------------
// AC2 – Viewport meta tag
// ---------------------------------------------------------------------------
test('AC2: viewport meta tag is present with correct content', () => {
  // Matches the tag regardless of attribute order, but the content value
  // must be exactly `width=device-width, initial-scale=1` (no trailing .0)
  const viewportPattern =
    /<meta\s[^>]*name\s*=\s*["']viewport["'][^>]*content\s*=\s*["']width=device-width,\s*initial-scale=1["'][^>]*>/i;
  const viewportPatternReversed =
    /<meta\s[^>]*content\s*=\s*["']width=device-width,\s*initial-scale=1["'][^>]*name\s*=\s*["']viewport["'][^>]*>/i;
  assert.ok(
    viewportPattern.test(html) || viewportPatternReversed.test(html),
    'Expected <meta name="viewport" content="width=device-width, initial-scale=1"> (not initial-scale=1.0)'
  );
});

// ---------------------------------------------------------------------------
// AC3 – No external dependencies
// ---------------------------------------------------------------------------
test('AC3: no external URLs in <link> tags', () => {
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of linkTags) {
    const hrefMatch = tag.match(/href\s*=\s*["']([^"']*)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      assert.ok(
        !/^https?:\/\//i.test(href),
        `Found external URL in <link> tag: ${href}`
      );
    }
  }
});

test('AC3: no external URLs in <script> tags', () => {
  const scriptTags = html.match(/<script\b[^>]*>/gi) || [];
  for (const tag of scriptTags) {
    const srcMatch = tag.match(/src\s*=\s*["']([^"']*)["']/i);
    if (srcMatch) {
      const src = srcMatch[1];
      assert.ok(
        !/^https?:\/\//i.test(src),
        `Found external URL in <script> tag: ${src}`
      );
    }
  }
});

test('AC3: no external URLs in <style> tags', () => {
  const styleBlocks = html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || [];
  for (const block of styleBlocks) {
    assert.ok(
      !/https?:\/\//i.test(block),
      'Found an external URL inside a <style> block (e.g. @import from CDN or Google Fonts)'
    );
  }
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
