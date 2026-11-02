/**
 * Shared Playwright launcher for this sandbox.
 *
 * The official Playwright browser CDNs (cdn.playwright.dev,
 * playwright.azureedge.net) are NOT reachable from this environment, so
 * `npx playwright install` cannot download a browser. Instead we use
 * @sparticuz/chromium, which ships a serverless Chromium build + its shared
 * libraries inside the npm tarball (reachable via registry.npmjs.org).
 *
 * Run `npm run setup:playwright` once per session to unpack the libs.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import { chromium as playwrightChromium } from 'playwright';

const repoRoot = path.resolve(import.meta.dirname, '../..');
export const libDir = path.join(repoRoot, '.playwright', 'lib');

/**
 * Launch headless Chromium.
 * @param {import('playwright').LaunchOptions} [options]
 * @returns {Promise<import('playwright').Browser>}
 */
export async function launchBrowser(options = {}) {
  const nss = path.join(libDir, 'libnss3.so');
  if (!existsSync(nss)) {
    throw new Error(
      `Chromium system libs are missing (${nss}).\n` +
        'Run: npm install && npm run setup:playwright'
    );
  }

  // Chromium needs these on LD_LIBRARY_PATH; the child process inherits it.
  process.env.LD_LIBRARY_PATH = [libDir, process.env.LD_LIBRARY_PATH]
    .filter(Boolean)
    .join(':');

  const executablePath = await chromium.executablePath();

  return playwrightChromium.launch({
    executablePath,
    args: chromium.args,
    headless: true,
    ...options,
  });
}

/** Open a new page with a sensible default viewport. */
export async function newPage(browser, { width = 1440, height = 900, ...rest } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    ...rest,
  });
  return context.newPage();
}
