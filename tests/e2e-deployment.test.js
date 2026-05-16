'use strict';

/**
 * R3 – Verify end-to-end automated deployment on push
 *
 * Acceptance criteria verified:
 *   Scenario 1: GitHub Pages source is configured to use the workflow
 *               (Source = "GitHub Actions", not a branch-based deploy)
 *   Scenario 2: A test commit triggers a successful workflow run and updates
 *               the live site – verified locally by checking that:
 *                 a) The workflow is configured with a live-URL environment and
 *                    concurrency settings that protect in-progress deployments
 *                 b) The built dist/index.html contains 'Otto Factory' content
 *   Scenario 3: Test suite passes with exit code 0 (covered by npm test)
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

function readAllWorkflows() {
  return getWorkflowFiles().map((f) => fs.readFileSync(f, 'utf8'));
}

// ---------------------------------------------------------------------------
// Scenario 1 – Pages source is set to "GitHub Actions" (not branch-based)
// ---------------------------------------------------------------------------

test('Scenario 1: workflow uses actions/configure-pages (sets Pages source to GitHub Actions)', () => {
  const contents = readAllWorkflows();
  assert.ok(contents.length > 0, 'No workflow files found to inspect');

  const usesConfigurePages = contents.some((c) =>
    /actions\/configure-pages/.test(c)
  );

  assert.ok(
    usesConfigurePages,
    'Expected a workflow step using actions/configure-pages — this is required to set the Pages source to "GitHub Actions" rather than a branch-based deploy'
  );
});

test('Scenario 1: workflow uses actions/upload-pages-artifact (native Pages artifact upload, not branch push)', () => {
  const contents = readAllWorkflows();
  assert.ok(contents.length > 0, 'No workflow files found to inspect');

  const usesUploadArtifact = contents.some((c) =>
    /actions\/upload-pages-artifact/.test(c)
  );

  assert.ok(
    usesUploadArtifact,
    'Expected a workflow step using actions/upload-pages-artifact — branch-based deploys (e.g. push to gh-pages) would not use this action'
  );
});

test('Scenario 1: workflow does not push to a gh-pages branch directly', () => {
  const contents = readAllWorkflows();
  assert.ok(contents.length > 0, 'No workflow files found to inspect');

  // Branch-based deploys use patterns like `git push origin HEAD:gh-pages`
  // or JamesIves/github-pages-deploy-action with a branch setting
  const hasBranchPush = contents.some((c) =>
    /gh-pages-deploy-action/.test(c) ||
    /peaceiris\/actions-gh-pages/.test(c) ||
    /push.*HEAD:gh-pages/.test(c)
  );

  assert.ok(
    !hasBranchPush,
    'Workflow must NOT use branch-based deploy (gh-pages branch push) — it must use the native GitHub Actions approach'
  );
});

// ---------------------------------------------------------------------------
// Scenario 2 – Workflow structure ensures successful run and live site
// ---------------------------------------------------------------------------

test('Scenario 2: workflow defines a github-pages environment with a URL output', () => {
  const contents = readAllWorkflows();
  assert.ok(contents.length > 0, 'No workflow files found to inspect');

  // The deploy job must declare `environment: name: github-pages` and expose
  // the live URL via an `outputs.page_url` reference so operators can confirm
  // the live URL after each run.
  const hasEnvironment = contents.some((c) =>
    /github-pages/.test(c) && /page_url/.test(c)
  );

  assert.ok(
    hasEnvironment,
    'Expected the deploy job to declare a github-pages environment and expose page_url — this surfaces the live URL in the Actions UI'
  );
});

test('Scenario 2: workflow cancel-in-progress is false (live deploys are not cancelled)', () => {
  const contents = readAllWorkflows();
  assert.ok(contents.length > 0, 'No workflow files found to inspect');

  const protectsInProgress = contents.some((c) =>
    /cancel-in-progress\s*:\s*false/.test(c)
  );

  assert.ok(
    protectsInProgress,
    'Expected concurrency.cancel-in-progress: false — in-progress deployments to the live site must not be cancelled mid-flight'
  );
});

test('Scenario 2: dist/index.html exists after build and contains Otto Factory content', () => {
  const { execSync } = require('child_process');

  // Run the build to ensure dist/ is current
  const buildScript = path.join(rootDir, 'scripts', 'build.js');
  assert.ok(fs.existsSync(buildScript), 'scripts/build.js must exist');

  // Use process.execPath so the correct Node binary is used regardless of PATH
  execSync(`"${process.execPath}" "${buildScript}"`, { cwd: rootDir });

  const distIndex = path.join(rootDir, 'dist', 'index.html');
  assert.ok(
    fs.existsSync(distIndex),
    'dist/index.html must exist after running the build script'
  );

  const content = fs.readFileSync(distIndex, 'utf8');

  assert.ok(
    content.includes('Otto Factory'),
    'dist/index.html must contain the text "Otto Factory" — this confirms the live site will display the correct brand'
  );
});

test('Scenario 2: dist/index.html title or heading confirms site identity', () => {
  const distIndex = path.join(rootDir, 'dist', 'index.html');
  // dist should exist from previous test; if not, build again
  if (!fs.existsSync(distIndex)) {
    const { execSync } = require('child_process');
    execSync(`"${process.execPath}" "${path.join(rootDir, 'scripts', 'build.js')}"`, { cwd: rootDir });
  }

  const content = fs.readFileSync(distIndex, 'utf8');

  // Must have a <title> that includes Otto Factory
  const hasTitleMatch = /<title[^>]*>[^<]*Otto Factory[^<]*<\/title>/i.test(content);
  // OR an <h1> or similar hero heading
  const hasHeadingMatch = /<h1[^>]*>[^<]*Otto Factory[^<]*<\/h1>/i.test(content);

  assert.ok(
    hasTitleMatch || hasHeadingMatch,
    'dist/index.html must have a <title> or <h1> containing "Otto Factory" so the public URL displays the correct site identity'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passing, ${failed} failing`);
if (failed > 0) {
  process.exit(1);
}
