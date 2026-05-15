'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const HTML_PATH = path.join(__dirname, '..', 'index.html');

let html;
try {
  html = fs.readFileSync(HTML_PATH, 'utf8');
} catch (e) {
  console.error('FAIL: index.html not found at', HTML_PATH);
  process.exit(1);
}

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${description}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

console.log('\nAC1 – Dark theme renders correctly');

test('background colour is #0d1117 in CSS', () => {
  // Accept both in <style> tag or inline; must reference the hex value
  assert.ok(
    /#0d1117/i.test(html),
    'Expected #0d1117 to appear in index.html'
  );
});

test('body text colour is white (#fff or #ffffff or white)', () => {
  // Look for a color: white or color: #fff(fff)? applied to body or :root or *
  assert.ok(
    /color\s*:\s*(white|#fff(fff)?)\b/i.test(html),
    'Expected white body text colour'
  );
});

test('system font stack is applied', () => {
  assert.ok(
    /-apple-system/.test(html),
    'Expected -apple-system in font-family'
  );
  assert.ok(
    /BlinkMacSystemFont/.test(html),
    'Expected BlinkMacSystemFont in font-family'
  );
  assert.ok(
    /Segoe UI/.test(html),
    'Expected "Segoe UI" in font-family'
  );
  assert.ok(
    /sans-serif/.test(html),
    'Expected sans-serif in font-family'
  );
});

console.log('\nAC2 – Viewport meta tag present');

test('viewport meta tag with correct content attribute', () => {
  assert.ok(
    /<meta\s[^>]*name\s*=\s*["']viewport["'][^>]*content\s*=\s*["']width=device-width,\s*initial-scale=1["']/i.test(html) ||
    /<meta\s[^>]*content\s*=\s*["']width=device-width,\s*initial-scale=1["'][^>]*name\s*=\s*["']viewport["']/i.test(html),
    'Expected <meta name="viewport" content="width=device-width, initial-scale=1">'
  );
});

console.log('\nAC3 – No external dependencies');

test('no external URLs in <link> tags', () => {
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of linkTags) {
    assert.ok(
      !/https?:\/\//i.test(tag),
      `External URL found in <link> tag: ${tag}`
    );
  }
});

test('no external URLs in <script> tags', () => {
  const scriptTags = html.match(/<script\b[^>]*>/gi) || [];
  for (const tag of scriptTags) {
    assert.ok(
      !/https?:\/\//i.test(tag),
      `External URL found in <script> tag: ${tag}`
    );
  }
});

test('no external URLs in <style> content', () => {
  // Check @import url(...) or url(https://...) patterns inside style blocks
  const styleTags = html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || [];
  for (const block of styleTags) {
    assert.ok(
      !/url\s*\(\s*['"]?https?:\/\//i.test(block),
      `External URL found in <style> block`
    );
    assert.ok(
      !/@import\s+['"]https?:\/\//i.test(block),
      `External @import found in <style> block`
    );
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
