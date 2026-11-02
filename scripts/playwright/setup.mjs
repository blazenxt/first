#!/usr/bin/env node
/**
 * One-time-per-session Playwright setup for this sandbox.
 *
 * Why this exists: the Playwright browser CDN is blocked here, so browsers
 * cannot be downloaded. @sparticuz/chromium carries a Chromium build plus the
 * glibc shared libraries it needs (libnss3, libnspr4, ...) inside its npm
 * tarball. We unpack those libs next to the repo and put them on
 * LD_LIBRARY_PATH at launch time.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { brotliDecompressSync } from 'node:zlib';
import { libDir, launchBrowser } from './launch.mjs';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const pkgDir = path.join(repoRoot, 'node_modules', '@sparticuz', 'chromium');
const archive = path.join(pkgDir, 'bin', 'al2023.tar.br');

function fail(msg) {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
}

if (!existsSync(path.join(repoRoot, 'node_modules', 'playwright'))) {
  fail('Dependencies are not installed. Run: npm install');
}
if (!existsSync(archive)) {
  fail(`Missing ${archive}. Run: npm install`);
}

const marker = path.join(libDir, 'libnss3.so');
if (existsSync(marker)) {
  console.log('  libs already unpacked ->', path.relative(repoRoot, libDir));
} else {
  mkdirSync(libDir, { recursive: true });
  const tarPath = path.join(os.tmpdir(), `sparticuz-${process.pid}.tar`);
  writeFileSync(tarPath, brotliDecompressSync(readFileSync(archive)));
  // Archive layout is lib/*.so -> extract one level up so we get .playwright/lib
  execFileSync('tar', ['-xf', tarPath, '-C', path.dirname(libDir)]);
  rmSync(tarPath, { force: true });
  console.log('  unpacked libs  ->', path.relative(repoRoot, libDir));
}

const browser = await launchBrowser();
const page = await browser.newPage();
await page.setContent('<h1>ok</h1>');
const version = browser.version();
await browser.close();

console.log(`  chromium ready -> v${version}`);
console.log('\n  Use it:  node scripts/playwright/screenshot.mjs http://localhost:8000 shot.png\n');
