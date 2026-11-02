#!/usr/bin/env node
/**
 * Screenshot a URL with Playwright.
 *
 *   node scripts/playwright/screenshot.mjs <url> <out.png> [options]
 *
 * Options:
 *   --width <px>          viewport width  (default 1440)
 *   --height <px>         viewport height (default 900)
 *   --full-page           capture the whole scrollable page
 *   --wait <ms>           extra settle time before capture (default 300)
 *   --wait-for <selector> wait for a selector instead of a fixed delay
 *   --mobile              emulate a 390x844 phone viewport
 *   --quiet               suppress console / page-error reporting
 *
 * Exit code is 1 if the page threw or the screenshot failed, so this is usable
 * as a smoke test in CI.
 */
import path from 'node:path';
import { launchBrowser, newPage } from './launch.mjs';

function usage(msg) {
  if (msg) console.error(`\n  ${msg}\n`);
  console.error(
    'Usage: node scripts/playwright/screenshot.mjs <url> [out.png] ' +
      '[--width N] [--height N] [--full-page] [--wait ms] [--wait-for sel] [--mobile] [--quiet]\n'
  );
  process.exit(msg ? 1 : 0);
}

const argv = process.argv.slice(2);
const positional = [];
const flags = { width: 1440, height: 900, wait: 300, fullPage: false, quiet: false, mobile: false };

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const next = () => {
    const v = argv[++i];
    if (v === undefined) usage(`Missing value for ${a}`);
    return v;
  };
  switch (a) {
    case '--width': flags.width = Number(next()); break;
    case '--height': flags.height = Number(next()); break;
    case '--wait': flags.wait = Number(next()); break;
    case '--wait-for': flags.waitFor = next(); break;
    case '--full-page': flags.fullPage = true; break;
    case '--mobile': flags.mobile = true; flags.width = 390; flags.height = 844; break;
    case '--quiet': flags.quiet = true; break;
    case '-h': case '--help': usage(); break;
    default:
      if (a.startsWith('-')) usage(`Unknown option ${a}`);
      positional.push(a);
  }
}

const [url, outArg] = positional;
if (!url) usage('A URL is required.');

const out = outArg ?? 'screenshots/shot-' + new Date().toISOString().replace(/[:.]/g, '-') + '.png';
const browser = await launchBrowser();

try {
  const page = await newPage(browser, { width: flags.width, height: flags.height });
  const problems = [];

  if (!flags.quiet) {
    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(`console.error: ${m.text()}`);
    });
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => {
      const err = r.failure()?.errorText ?? 'unknown';
      // ERR_ABORTED is normal for cancelled navigations / SW races.
      if (!err.includes('ERR_ABORTED')) problems.push(`request failed: ${r.url()} (${err})`);
    });
  }

  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(async (e) => {
    // networkidle never fires on pages with long-polling; fall back to load.
    if (String(e).includes('networkidle')) return page.goto(url, { waitUntil: 'load', timeout: 30000 });
    throw e;
  });

  if (flags.waitFor) {
    await page.waitForSelector(flags.waitFor, { timeout: 15000 });
  } else if (flags.wait > 0) {
    await page.waitForTimeout(flags.wait);
  }

  const file = path.resolve(out);
  await page.screenshot({ path: file, fullPage: flags.fullPage });

  const status = res?.status() ?? 'n/a';
  console.log(`  ${status}  ${url}`);
  console.log(`  saved  ${path.relative(process.cwd(), file)}`);
  console.log(`  title  ${await page.title()}`);

  if (problems.length) {
    console.log(`\n  ${problems.length} page problem(s):`);
    for (const p of problems.slice(0, 15)) console.log(`   - ${p}`);
    if (problems.length > 15) console.log(`   ... and ${problems.length - 15} more`);
    process.exitCode = 1;
  }
} catch (e) {
  console.error(`\n  FAILED: ${e.message}\n`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
