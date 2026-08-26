import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const FPS = 12.5;
const debug = process.argv.includes('--debug');

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1400, height: 931 } });
await page.goto('file://' + path.join(dir, 'anim.html'));
await page.waitForLoadState('networkidle');

if (debug) {
  // Show every highlight at once to check alignment against the image
  await page.evaluate(() => {
    document.querySelectorAll('.hl').forEach(h => h.style.opacity = '1');
  });
  await page.screenshot({ path: path.join(dir, 'debug-all.png') });
  await browser.close();
  process.exit(0);
}

const total = await page.evaluate(() => window.TOTAL);
const n = Math.round(total * FPS);
for (let f = 0; f < n; f++) {
  const t = f / FPS;
  await page.evaluate(tt => window.seek(tt), t);
  await page.screenshot({ path: path.join(dir, 'frames', `f${String(f).padStart(4, '0')}.png`) });
}
console.log(`captured ${n} frames over ${total.toFixed(2)}s`);
await browser.close();
