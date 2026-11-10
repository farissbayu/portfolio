// Render docs/game-ui/neon-lime.html into PNGs: design system sheet + homepage preview.
// Usage: node scripts/shoot-game-ui.mjs
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dir = resolve(root, "docs/game-ui");
const out = resolve(dir, "shots");
await mkdir(out, { recursive: true });

const pageUrl = "file://" + resolve(dir, "neon-lime.html");
const browser = await chromium.launch();

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(pageUrl, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(250);
await page.locator("#cover").screenshot({ path: resolve(out, "neon-lime-cover.png") });
await page.locator("#spec").screenshot({ path: resolve(out, "neon-lime-design-system.png") });
await page.locator("#home").screenshot({ path: resolve(out, "neon-lime-home.png") });
await page.close();

// Mobile: first screen only (a full-page phone shot is taller than the image viewer allows).
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await mobile.goto(pageUrl, { waitUntil: "load" });
await mobile.evaluate(() => document.fonts.ready);
await mobile.evaluate(() => document.querySelector("#home").scrollIntoView({ block: "start" }));
await mobile.waitForTimeout(250);
await mobile.screenshot({ path: resolve(out, "neon-lime-home-mobile.png") });
await mobile.close();

await browser.close();
console.log("shot: neon-lime");
