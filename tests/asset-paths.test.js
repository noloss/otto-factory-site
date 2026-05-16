'use strict';

/**
 * R2 – Fix all asset paths to use relative URLs
 *
 * Acceptance criteria verified:
 *   Scenario 1: No absolute localhost references in the built output
 *   Scenario 2: All <link>, <script>, and <img> asset URLs are safe for
 *               sub-path hosting (no root-relative or localhost-absolute URLs)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');

let html;
try {
  html = fs.readFileSync(htmlPath, 'utf8');
} catch (err) {
  console.error('FAIL: could not read index.html —', err.message);
  process.exit(1);
}

/**
 * Walk `dir` and collect all .html and .js files, skipping directories that
 * are not part of the site source (node_modules, .git, tests, dist, build).
 */
function collectSourceFiles(dir) {
  const files = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return files;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'tests', 'dist', 'build'].includes(entry.name)) {
        continue;
      }
      files.push(...collectSourceFiles(path.join(dir, entry.name)));
    } else if (/\.(html|js|mjs|cjs)$/.test(entry.name)) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

const sourceFiles = collectSourceFiles(root);

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
// Scenario 1 – No absolute localhost references in any source / built file
// ---------------------------------------------------------------------------

sourceFiles.forEach((filePath) => {
  const rel = path.relative(root, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  test(`Scenario 1: "${rel}" contains no "http://localhost" reference`, () => {
    assert.ok(
      !content.includes('http://localhost'),
      `Found "http://localhost" in ${rel}`
    );
  });

  test(`Scenario 1: "${rel}" contains no "127.0.0.1" reference`, () => {
    assert.ok(
      !content.includes('127.0.0.1'),
      `Found "127.0.0.1" in ${rel}`
    );
  });
});

// ---------------------------------------------------------------------------
// Helpers for Scenario 2
// ---------------------------------------------------------------------------

/**
 * Extract all asset-loading attribute values from index.html.
 * Covers <link href>, <script src>, and <img src>.
 * Returns an array of { tag, attr, value } objects.
 */
function extractAssetUrls(source) {
  const results = [];
  let m;

  const linkRe = /<link\b[^>]+>/gi;
  while ((m = linkRe.exec(source)) !== null) {
    const href = m[0].match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (href) results.push({ tag: 'link', attr: 'href', value: href[1] });
  }

  const scriptRe = /<script\b[^>]+>/gi;
  while ((m = scriptRe.exec(source)) !== null) {
    const src = m[0].match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (src) results.push({ tag: 'script', attr: 'src', value: src[1] });
  }

  const imgRe = /<img\b[^>]+>/gi;
  while ((m = imgRe.exec(source)) !== null) {
    const src = m[0].match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (src) results.push({ tag: 'img', attr: 'src', value: src[1] });
  }

  return results;
}

const assetUrls = extractAssetUrls(html);

// ---------------------------------------------------------------------------
// Scenario 2 – Asset tags must not use localhost-absolute or root-relative URLs
// ---------------------------------------------------------------------------

test('Scenario 2: no <link href> uses a localhost-absolute URL', () => {
  const bad = assetUrls
    .filter(({ tag }) => tag === 'link')
    .filter(({ value }) => /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(value));
  assert.strictEqual(
    bad.length,
    0,
    `Found localhost-absolute <link href> value(s): ${bad.map((b) => b.value).join(', ')}`
  );
});

test('Scenario 2: no <script src> uses a localhost-absolute URL', () => {
  const bad = assetUrls
    .filter(({ tag }) => tag === 'script')
    .filter(({ value }) => /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(value));
  assert.strictEqual(
    bad.length,
    0,
    `Found localhost-absolute <script src> value(s): ${bad.map((b) => b.value).join(', ')}`
  );
});

test('Scenario 2: no <img src> uses a localhost-absolute URL', () => {
  const bad = assetUrls
    .filter(({ tag }) => tag === 'img')
    .filter(({ value }) => /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(value));
  assert.strictEqual(
    bad.length,
    0,
    `Found localhost-absolute <img src> value(s): ${bad.map((b) => b.value).join(', ')}`
  );
});

test('Scenario 2: no asset tag uses a root-relative URL (would break on sub-path hosting)', () => {
  // A root-relative path like /styles.css resolves to the domain root, not the
  // sub-path the site is deployed under (e.g. /otto-factory-site/styles.css).
  const bad = assetUrls.filter(({ value }) => /^\/(?!\/)/.test(value));
  assert.strictEqual(
    bad.length,
    0,
    `Found root-relative asset URL(s) that break on sub-path hosting: ${bad
      .map((b) => `<${b.tag} ${b.attr}="${b.value}">`)
      .join(', ')}`
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
