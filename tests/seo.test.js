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
// AC1 – Browser tab shows correct brand
// ---------------------------------------------------------------------------
test('AC1: <title> element reads "Otto Factory"', () => {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  assert.ok(titleMatch, 'Expected a <title> element to be present');
  assert.strictEqual(
    titleMatch[1].trim(),
    'Otto Factory',
    `Expected <title> to be "Otto Factory" but got "${titleMatch[1].trim()}"`
  );
});

// ---------------------------------------------------------------------------
// AC2 – Search engine metadata is updated
// ---------------------------------------------------------------------------
test('AC2: <meta name="description"> is present and references Otto Factory', () => {
  const descMatch = html.match(/<meta\s[^>]*name\s*=\s*["']description["'][^>]*>/i)
    || html.match(/<meta\s[^>]*content\s*=\s*["'][^"']*["'][^>]*name\s*=\s*["']description["'][^>]*>/i);
  assert.ok(descMatch, 'Expected a <meta name="description"> tag to be present');
  const tag = descMatch[0];
  const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
  assert.ok(contentMatch, 'Expected <meta name="description"> to have a content attribute');
  const content = contentMatch[1];
  assert.ok(
    !content.includes('Prompt Masker'),
    `<meta name="description"> must not contain "Prompt Masker" but got: "${content}"`
  );
  assert.ok(
    content.includes('Otto Factory'),
    `<meta name="description"> must reference "Otto Factory" but got: "${content}"`
  );
});

test('AC2: <meta property="og:title"> is present and references Otto Factory', () => {
  const ogTitleMatch = html.match(/<meta\s[^>]*property\s*=\s*["']og:title["'][^>]*>/i)
    || html.match(/<meta\s[^>]*content\s*=\s*["'][^"']*["'][^>]*property\s*=\s*["']og:title["'][^>]*>/i);
  assert.ok(ogTitleMatch, 'Expected a <meta property="og:title"> tag to be present');
  const tag = ogTitleMatch[0];
  const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
  assert.ok(contentMatch, 'Expected <meta property="og:title"> to have a content attribute');
  const content = contentMatch[1];
  assert.ok(
    !content.includes('Prompt Masker'),
    `<meta property="og:title"> must not contain "Prompt Masker" but got: "${content}"`
  );
  assert.ok(
    content.includes('Otto Factory'),
    `<meta property="og:title"> must reference "Otto Factory" but got: "${content}"`
  );
});

test('AC2: <meta property="og:site_name"> is present and references Otto Factory', () => {
  const ogSiteMatch = html.match(/<meta\s[^>]*property\s*=\s*["']og:site_name["'][^>]*>/i)
    || html.match(/<meta\s[^>]*content\s*=\s*["'][^"']*["'][^>]*property\s*=\s*["']og:site_name["'][^>]*>/i);
  assert.ok(ogSiteMatch, 'Expected a <meta property="og:site_name"> tag to be present');
  const tag = ogSiteMatch[0];
  const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
  assert.ok(contentMatch, 'Expected <meta property="og:site_name"> to have a content attribute');
  const content = contentMatch[1];
  assert.ok(
    !content.includes('Prompt Masker'),
    `<meta property="og:site_name"> must not contain "Prompt Masker" but got: "${content}"`
  );
  assert.ok(
    content.includes('Otto Factory'),
    `<meta property="og:site_name"> must reference "Otto Factory" but got: "${content}"`
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
