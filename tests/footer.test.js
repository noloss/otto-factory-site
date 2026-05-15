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

// Helper: extract the <footer> element from the HTML
function getFooter() {
  const match = html.match(/<footer[\s\S]*?<\/footer>/i);
  assert.ok(match, 'Expected a <footer> element to exist in the page');
  return match[0];
}

// ---------------------------------------------------------------------------
// AC1 – Footer contains project name and GitHub link
// ---------------------------------------------------------------------------

test('AC1: a <footer> element is present', () => {
  assert.ok(
    /<footer[\s\S]*?<\/footer>/i.test(html),
    'Expected a <footer> element in the document'
  );
});

test('AC1: footer contains the text "otto-factory"', () => {
  const footer = getFooter();
  assert.ok(
    footer.includes('otto-factory'),
    'Expected the footer to contain the text "otto-factory"'
  );
});

test('AC1: footer contains an <a> tag linking to the GitHub repository', () => {
  const footer = getFooter();
  const hasGitHubLink = /href\s*=\s*["']https?:\/\/github\.com\/[^"']+["']/i.test(footer);
  assert.ok(
    hasGitHubLink,
    'Expected the footer to contain an <a> element with an href pointing to https://github.com/...'
  );
});

// ---------------------------------------------------------------------------
// AC2 – Footer is visually distinct from main content
// ---------------------------------------------------------------------------

test('AC2: footer has a CSS class applied for styling', () => {
  const footer = getFooter();
  assert.ok(
    /class\s*=\s*["'][^"']+["']/i.test(footer),
    'Expected the <footer> element to have a CSS class attribute'
  );
});

test('AC2: footer CSS rule applies a visually distinct treatment (border, background, or opacity)', () => {
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  assert.ok(styleMatch, 'Expected a <style> block in the document');
  const css = styleMatch[1];
  // The footer rule must contain at least one of: border-top, background, or opacity
  const hasDistinctTreatment =
    /footer[\s\S]{0,400}border-top/.test(css) ||
    /footer[\s\S]{0,400}background/.test(css) ||
    /footer[\s\S]{0,400}opacity/.test(css);
  assert.ok(
    hasDistinctTreatment,
    'Expected the footer CSS rule to include a border-top, a background, or an opacity to visually distinguish it from main content'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
