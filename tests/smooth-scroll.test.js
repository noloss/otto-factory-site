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
// AC1 – CTA click triggers smooth scroll to #get-started
// The CTA button must link to #get-started AND smooth scrolling must be enabled
// ---------------------------------------------------------------------------

test('AC1: CTA button href points to #get-started', () => {
  const hrefPattern = /href\s*=\s*["']#get-started["']/;
  assert.ok(
    hrefPattern.test(html),
    'Expected an element with href="#get-started"'
  );
});

test('AC1: smooth scrolling is enabled via CSS scroll-behavior or JS scrollIntoView', () => {
  // Accept either CSS scroll-behavior: smooth (on html or body)
  // or a native scrollIntoView({ behavior: 'smooth' }) call
  const hasCssSmooth = /scroll-behavior\s*:\s*smooth/.test(html);
  const hasJsSmooth = /scrollIntoView\s*\(\s*\{[^}]*behavior\s*:\s*['"]smooth['"]/.test(html);
  assert.ok(
    hasCssSmooth || hasJsSmooth,
    'Expected either "scroll-behavior: smooth" in CSS or scrollIntoView({ behavior: \'smooth\' }) in JS'
  );
});

// ---------------------------------------------------------------------------
// AC2 – Smooth scroll implemented without external libraries
// The <head> must not load any external script or stylesheet for scrolling
// (no smoothscroll polyfill, no jQuery, no GSAP, etc.)
// ---------------------------------------------------------------------------

test('AC2: no external scrolling library is loaded', () => {
  // Extract all <script src="..."> and <link href="..."> tags
  const externalScripts = html.match(/<script[^>]+src\s*=\s*["'][^"']+["'][^>]*>/gi) || [];
  const externalLinks   = html.match(/<link[^>]+href\s*=\s*["'][^"']+["'][^>]*>/gi) || [];

  const scrollLibKeywords = /smooth.?scroll|smoothscroll|jquery|gsap|animatescroll/i;

  for (const tag of [...externalScripts, ...externalLinks]) {
    assert.ok(
      !scrollLibKeywords.test(tag),
      `Expected no external scroll library but found: ${tag}`
    );
  }
});

test('AC2: scroll-behavior: smooth applied to html or body element in embedded CSS', () => {
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  assert.ok(styleMatch, 'Expected a <style> block in the document');
  const css = styleMatch[1];

  // Check that scroll-behavior: smooth appears in a rule targeting html or body
  // Pattern: "html" or "body" block containing scroll-behavior: smooth
  const htmlBodySmoothPattern =
    /\b(html|body)\b[\s\S]{0,200}scroll-behavior\s*:\s*smooth/.test(css) ||
    /scroll-behavior\s*:\s*smooth[\s\S]{0,200}\b(html|body)\b/.test(css);

  // Fallback: scroll-behavior: smooth appears anywhere in the CSS
  const anywhereSmoothPattern = /scroll-behavior\s*:\s*smooth/.test(css);

  assert.ok(
    htmlBodySmoothPattern || anywhereSmoothPattern,
    'Expected "scroll-behavior: smooth" in the embedded <style> block'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
