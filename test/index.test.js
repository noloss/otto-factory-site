'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'index.html');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('\nindex.html structure tests\n');

// AC2 – file exists
test('index.html exists', () => {
  assert.ok(
    fs.existsSync(HTML_PATH),
    `Expected ${HTML_PATH} to exist`
  );
});

// AC2 – key structural markers
const content = fs.existsSync(HTML_PATH)
  ? fs.readFileSync(HTML_PATH, 'utf8')
  : '';

test('contains "software factory"', () => {
  assert.ok(
    content.includes('software factory'),
    'Expected index.html to contain "software factory"'
  );
});

test('contains "get-started"', () => {
  assert.ok(
    content.includes('get-started'),
    'Expected index.html to contain "get-started"'
  );
});

test('contains "how-it-works"', () => {
  assert.ok(
    content.includes('how-it-works'),
    'Expected index.html to contain "how-it-works"'
  );
});

test('contains "python main.py plan"', () => {
  assert.ok(
    content.includes('python main.py plan'),
    'Expected index.html to contain "python main.py plan"'
  );
});

test('contains "python main.py run"', () => {
  assert.ok(
    content.includes('python main.py run'),
    'Expected index.html to contain "python main.py run"'
  );
});

console.log(`\n${passed} passing, ${failed} failing\n`);

if (failed > 0) {
  process.exit(1);
}
