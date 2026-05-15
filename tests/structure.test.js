/**
 * Tests for index.html structural markers – Issue [R1]
 *
 * AC1 – index.html exists on the filesystem
 * AC2 – Key structural strings are present in the file
 *
 * All checks are pure filesystem reads; no HTTP server is required.
 */

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.resolve(__dirname, '../index.html');

// ---------------------------------------------------------------------------
// AC1 – File exists
// ---------------------------------------------------------------------------

describe('AC1 – index.html exists', () => {
  test('index.html is present at the repository root', () => {
    expect(fs.existsSync(HTML_PATH)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC2 – Key structural markers present in the file
// ---------------------------------------------------------------------------

describe('AC2 – Key structural markers', () => {
  let rawHtml;

  beforeAll(() => {
    rawHtml = fs.readFileSync(HTML_PATH, 'utf8');
  });

  test('contains "software factory"', () => {
    expect(rawHtml).toContain('software factory');
  });

  test('contains "get-started"', () => {
    expect(rawHtml).toContain('get-started');
  });

  test('contains "how-it-works"', () => {
    expect(rawHtml).toContain('how-it-works');
  });

  test('contains "python main.py plan"', () => {
    expect(rawHtml).toContain('python main.py plan');
  });

  test('contains "python main.py run"', () => {
    expect(rawHtml).toContain('python main.py run');
  });
});
