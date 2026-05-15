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
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract all external URLs (http:// or https://) from a specific context
 * pattern within the HTML source. Returns an array of matched URL strings.
 */
function findExternalUrlsIn(pattern, source) {
  const matches = [];
  let m;
  const re = new RegExp(pattern, 'gi');
  while ((m = re.exec(source)) !== null) {
    matches.push(m[1] || m[0]);
  }
  return matches;
}

// ---------------------------------------------------------------------------
// AC1 – No external URLs in resource-loading contexts
// ---------------------------------------------------------------------------

test('AC1: no external URL in <link href="..."> tags', () => {
  // Matches <link ...href="http(s)://..."> or single-quoted variant
  const urls = findExternalUrlsIn(
    '<link[^>]+href\\s*=\\s*["\']\\s*(https?://[^"\'\\s>]+)',
    html
  );
  assert.strictEqual(
    urls.length,
    0,
    `Found external URL(s) in <link> tags: ${urls.join(', ')}`
  );
});

test('AC1: no external URL in <script src="..."> tags', () => {
  const urls = findExternalUrlsIn(
    '<script[^>]+src\\s*=\\s*["\']\\s*(https?://[^"\'\\s>]+)',
    html
  );
  assert.strictEqual(
    urls.length,
    0,
    `Found external URL(s) in <script src> attributes: ${urls.join(', ')}`
  );
});

test('AC1: no external URL in @import declarations', () => {
  // Covers @import "url", @import url("url"), @import url('url')
  const urls = findExternalUrlsIn(
    '@import\\s+(?:url\\(\\s*)?["\']?\\s*(https?://[^"\'\\s)]+)',
    html
  );
  assert.strictEqual(
    urls.length,
    0,
    `Found external URL(s) in @import declarations: ${urls.join(', ')}`
  );
});

test('AC1: no external URL in url() declarations', () => {
  const urls = findExternalUrlsIn(
    'url\\(\\s*["\']?\\s*(https?://[^"\'\\s)]+)',
    html
  );
  assert.strictEqual(
    urls.length,
    0,
    `Found external URL(s) in url() declarations: ${urls.join(', ')}`
  );
});

// ---------------------------------------------------------------------------
// AC3 – No CDN, Google Fonts, or third-party JS hostnames anywhere in the file
// ---------------------------------------------------------------------------

const CDN_PATTERNS = [
  'cdn.',
  'fonts.googleapis',
  'fonts.gstatic',
  'unpkg.com',
  'cdnjs.',
  'jsdelivr.net',
  'ajax.googleapis.com',
  'stackpath.bootstrapcdn.com',
];

CDN_PATTERNS.forEach((hostname) => {
  test(`AC3: no reference to "${hostname}" anywhere in index.html`, () => {
    assert.ok(
      !html.includes(hostname),
      `Found forbidden CDN/third-party hostname "${hostname}" in index.html`
    );
  });
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
