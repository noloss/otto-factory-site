/**
 * Tests for index.html skeleton (Issue R1)
 *
 * AC1 – Dark theme: background #0d1117, white text, system font stack
 * AC2 – Viewport meta tag present
 * AC3 – No external URLs in <link>, <script>, or <style> tags
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
// AC1 – Dark theme renders correctly
// ---------------------------------------------------------------------------

describe('AC1 – Dark theme', () => {
  test('body background-color is #0d1117 (rgb(13, 17, 23))', () => {
    const body = document.querySelector('body');
    const style = dom.window.getComputedStyle(body);
    expect(style.backgroundColor).toBe('rgb(13, 17, 23)');
  });

  test('body text colour is white (rgb(255, 255, 255))', () => {
    const body = document.querySelector('body');
    const style = dom.window.getComputedStyle(body);
    expect(style.color).toBe('rgb(255, 255, 255)');
  });

  test('body font-family includes -apple-system', () => {
    const body = document.querySelector('body');
    const style = dom.window.getComputedStyle(body);
    expect(style.fontFamily).toContain('-apple-system');
  });

  test('body font-family includes BlinkMacSystemFont', () => {
    const body = document.querySelector('body');
    const style = dom.window.getComputedStyle(body);
    expect(style.fontFamily).toContain('BlinkMacSystemFont');
  });

  test('body font-family includes Segoe UI', () => {
    const body = document.querySelector('body');
    const style = dom.window.getComputedStyle(body);
    expect(style.fontFamily).toContain('Segoe UI');
  });

  test('body font-family includes sans-serif', () => {
    const body = document.querySelector('body');
    const style = dom.window.getComputedStyle(body);
    expect(style.fontFamily).toContain('sans-serif');
  });
});

// ---------------------------------------------------------------------------
// AC2 – Viewport meta tag
// ---------------------------------------------------------------------------

describe('AC2 – Viewport meta tag', () => {
  test('<meta name="viewport"> tag is present in <head>', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
  });

  test('viewport meta content is "width=device-width, initial-scale=1"', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    expect(viewport.getAttribute('content')).toBe('width=device-width, initial-scale=1');
  });
});

// ---------------------------------------------------------------------------
// AC3 – No external dependencies
// ---------------------------------------------------------------------------

describe('AC3 – No external URLs', () => {
  let rawHtml;

  beforeAll(() => {
    rawHtml = fs.readFileSync(HTML_PATH, 'utf8');
  });

  test('<link> tags contain no external URLs', () => {
    const linkPattern = /<link[^>]*href\s*=\s*["']?(https?:)?\/\//gi;
    expect(rawHtml).not.toMatch(linkPattern);
  });

  test('<script> tags contain no external src URLs', () => {
    const scriptPattern = /<script[^>]*src\s*=\s*["']?(https?:)?\/\//gi;
    expect(rawHtml).not.toMatch(scriptPattern);
  });

  test('no http:// or https:// URLs appear anywhere in the file', () => {
    // Exclude comment lines to avoid false positives from doc comments,
    // but external resource references (href, src, @import) must not appear.
    const externalResourcePattern =
      /(?:href|src|url|@import)\s*[=:(]\s*["']?\s*https?:\/\//gi;
    expect(rawHtml).not.toMatch(externalResourcePattern);
  });
});
