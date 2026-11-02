# Playwright in this sandbox

The official Playwright browser CDNs (`cdn.playwright.dev`,
`playwright.azureedge.net`, `playwright.download.prss.microsoft.com`) are
**blocked** in this environment, so `npx playwright install` cannot download a
browser and there is no system Chrome/Chromium.

The workaround: [`@sparticuz/chromium`](https://github.com/Sparticuz/chromium)
ships a headless Chromium build **and** the glibc shared libraries it needs
(`libnss3`, `libnspr4`, …) inside its npm tarball. npm's registry is reachable,
so `npm install` pulls the whole browser.

## First run

```bash
npm install
npm run setup:playwright
```

`setup:playwright` unpacks the shared libraries to `.playwright/lib/` (gitignored)
and verifies Chromium launches.

## Screenshot a page

```bash
npm run shot -- http://localhost:8000/ screenshots/home.png
npm run shot -- http://localhost:8000/ screenshots/home-mobile.png --mobile --full-page
npm run shot -- http://localhost:8000/admin.html a.png --wait-for "#dashboard" --width 1920
```

| Option | Meaning |
| --- | --- |
| `--width N` / `--height N` | viewport size (default `1440x900`) |
| `--full-page` | capture the entire scrollable page |
| `--wait ms` | settle delay before capture (default `300`) |
| `--wait-for <selector>` | wait for a selector instead of a fixed delay |
| `--mobile` | emulate a `390x844` phone viewport |
| `--quiet` | hide console / failed-request reporting |

Console errors, uncaught page errors and failed requests are printed and the
process exits `1` if any occur — so it doubles as a smoke test.

## In your own scripts

```js
import { launchBrowser, newPage } from './scripts/playwright/launch.mjs';

const browser = await launchBrowser();
const page = await newPage(browser, { width: 1920, height: 1080 });

await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
await page.click('a[href="#projects"]');
await page.screenshot({ path: 'screenshots/projects.png' });
await page.pdf({ path: 'out.pdf' }); // needs { headless: true }

await browser.close();
```

`launchBrowser()` sets `LD_LIBRARY_PATH` for you and wires up the Chromium
executable, so the same code works here and on a normal machine (where you can
drop the `executablePath` and just run `npx playwright install chromium`).

## Notes

- Python Playwright is not installed; `pip install playwright` would install the
  package but still has no browser to drive. The Node route is the working one.
- Browsers never download at runtime — Chromium is unpacked from
  `node_modules/@sparticuz/chromium` on first launch (to `/tmp/chromium`).
- `tests/` and fixtures are recorded against Chromium 153 — behavior may differ
  slightly from the Chromium that ships with a stock Playwright release.
