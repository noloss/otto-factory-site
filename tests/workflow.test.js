'use strict';

/**
 * R3 – Create GitHub Actions workflow for Pages deployment
 *
 * Acceptance criteria verified:
 *   Scenario 1: At least one YAML workflow file exists under .github/workflows/
 *               that declares a trigger on push to the main branch
 *   Scenario 2: The workflow includes a step that runs `npm ci`, a step that
 *               runs the build command, and a step that deploys to GitHub Pages
 *               (via actions/deploy-pages or equivalent)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.join(__dirname, '..');
const workflowsDir = path.join(rootDir, '.github', 'workflows');

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

function getWorkflowFiles() {
  let entries;
  try {
    entries = fs.readdirSync(workflowsDir);
  } catch (_) {
    return [];
  }
  return entries.filter((f) => /\.(yml|yaml)$/i.test(f)).map((f) => path.join(workflowsDir, f));
}

// ---------------------------------------------------------------------------
// Scenario 1 – Workflow file exists and targets the main branch
// ---------------------------------------------------------------------------

test('Scenario 1: .github/workflows/ directory exists', () => {
  assert.ok(
    fs.existsSync(workflowsDir),
    'Expected .github/workflows/ directory to exist'
  );
});

test('Scenario 1: at least one YAML workflow file exists in .github/workflows/', () => {
  const files = getWorkflowFiles();
  assert.ok(
    files.length > 0,
    'Expected at least one .yml or .yaml file in .github/workflows/'
  );
});

test('Scenario 1: a workflow file declares a push trigger on the main branch', () => {
  const files = getWorkflowFiles();
  assert.ok(files.length > 0, 'No workflow files found to inspect');

  const hasPushMain = files.some((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    // Must contain both `push:` (or `push:` inline) and `main` as a branch
    return /on\s*:/i.test(content) && /push/i.test(content) && /branches\s*:/i.test(content) && /\bmain\b/.test(content);
  });

  assert.ok(
    hasPushMain,
    'Expected a workflow file to declare a push trigger targeting the main branch'
  );
});

// ---------------------------------------------------------------------------
// Scenario 2 – Workflow runs build and deploy steps
// ---------------------------------------------------------------------------

test('Scenario 2: a workflow file includes a step that runs `npm ci`', () => {
  const files = getWorkflowFiles();
  assert.ok(files.length > 0, 'No workflow files found to inspect');

  const hasNpmCi = files.some((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    return /npm\s+ci\b/.test(content);
  });

  assert.ok(
    hasNpmCi,
    'Expected a workflow step that runs `npm ci`'
  );
});

test('Scenario 2: a workflow file includes a step that runs the build command', () => {
  const files = getWorkflowFiles();
  assert.ok(files.length > 0, 'No workflow files found to inspect');

  const hasBuild = files.some((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    // Accept `npm run build` or `node scripts/build.js`
    return /npm\s+run\s+build/.test(content) || /node\s+scripts\/build\.js/.test(content);
  });

  assert.ok(
    hasBuild,
    'Expected a workflow step that runs the build command (npm run build or equivalent)'
  );
});

test('Scenario 2: a workflow file includes a step that deploys to GitHub Pages', () => {
  const files = getWorkflowFiles();
  assert.ok(files.length > 0, 'No workflow files found to inspect');

  const hasDeploy = files.some((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    // Accept actions/deploy-pages, peaceiris/actions-gh-pages, JamesIves/github-pages-deploy-action, or gh-pages CLI
    return (
      /actions\/deploy-pages/.test(content) ||
      /peaceiris\/actions-gh-pages/.test(content) ||
      /JamesIves\/github-pages-deploy-action/.test(content) ||
      /gh-pages/.test(content)
    );
  });

  assert.ok(
    hasDeploy,
    'Expected a workflow step that deploys the output directory to GitHub Pages'
  );
});

test('Scenario 2: a workflow file references the build output directory', () => {
  const files = getWorkflowFiles();
  assert.ok(files.length > 0, 'No workflow files found to inspect');

  const hasDistDir = files.some((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    return /\bdist\b/.test(content);
  });

  assert.ok(
    hasDistDir,
    'Expected the workflow to reference the dist/ output directory'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
