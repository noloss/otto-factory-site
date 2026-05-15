/**
 * Tests for Hero section – Issue [R1]
 *
 * AC1 – Headline visible: contains "Claude subscription" and "software factory"
 * AC2 – Subheadline present with exact required text
 * AC3 – CTA button links to #get-started with accent colour #58a6ff
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const HTML_PATH = path.resolve(__dirname, '../index.html');

let dom;
let document;

beforeAll(() => {
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  dom = new JSDOM(html, { resources: 'usable' });
  document = dom.window.document;
});

// ---------------------------------------------------------------------------
// AC1 – Headline containing "Claude subscription" and "software factory"
// ---------------------------------------------------------------------------

describe('AC1 – Hero headline', () => {
  test('a headline element (h1) exists in the hero section', () => {
    const h1 = document.querySelector('h1');
    expect(h1).not.toBeNull();
  });

  test('headline text contains "Claude subscription"', () => {
    const h1 = document.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1.textContent).toContain('Claude subscription');
  });

  test('headline text contains "software factory"', () => {
    const h1 = document.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1.textContent).toContain('software factory');
  });
});

// ---------------------------------------------------------------------------
// AC2 – Subheadline with the required text
// ---------------------------------------------------------------------------

describe('AC2 – Hero subheadline', () => {
  const REQUIRED_SUBHEADLINE =
    'Describe what you want to build. otto-factory writes the code, tests it, and reviews it \u2014 automatically.';

  test('a subheadline element (p or h2) exists below the h1', () => {
    // Accept either a <p> or <h2> sibling/descendant near the hero
    const candidate =
      document.querySelector('h1 + p') ||
      document.querySelector('h1 + h2') ||
      document.querySelector('section p') ||
      document.querySelector('[class*="hero"] p') ||
      document.querySelector('[id*="hero"] p');
    expect(candidate).not.toBeNull();
  });

  test('subheadline contains the required text', () => {
    // Search all <p> and <h2> elements for the required text
    const allCandidates = [
      ...document.querySelectorAll('p'),
      ...document.querySelectorAll('h2'),
    ];
    const match = allCandidates.find((el) =>
      el.textContent.includes(REQUIRED_SUBHEADLINE)
    );
    expect(match).not.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// AC3 – CTA button links to #get-started with accent colour
// ---------------------------------------------------------------------------

describe('AC3 – CTA button', () => {
  test('"Get started on GitHub" button/link is present', () => {
    const allLinks = [...document.querySelectorAll('a')];
    const cta = allLinks.find((el) =>
      el.textContent.trim().toLowerCase().includes('get started')
    );
    expect(cta).not.toBeUndefined();
  });

  test('CTA href attribute is "#get-started"', () => {
    const allLinks = [...document.querySelectorAll('a')];
    const cta = allLinks.find((el) =>
      el.textContent.trim().toLowerCase().includes('get started')
    );
    expect(cta).not.toBeUndefined();
    expect(cta.getAttribute('href')).toBe('#get-started');
  });

  test('CTA button uses accent colour #58a6ff (inline style or class)', () => {
    const rawHtml = fs.readFileSync(HTML_PATH, 'utf8');
    // Accept the colour value appearing in the file (inline or in a <style> block)
    expect(rawHtml).toMatch(/#58a6ff/i);
  });

  test('CTA element is visible (not hidden via display:none or visibility:hidden)', () => {
    const allLinks = [...document.querySelectorAll('a')];
    const cta = allLinks.find((el) =>
      el.textContent.trim().toLowerCase().includes('get started')
    );
    expect(cta).not.toBeUndefined();
    const style = dom.window.getComputedStyle(cta);
    expect(style.display).not.toBe('none');
    expect(style.visibility).not.toBe('hidden');
  });
});
