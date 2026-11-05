// Renders public/icons/icon.svg into the PNG sizes the manifest needs (uses Playwright's Chromium).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { readFileSync, writeFileSync } from "node:fs";
const svg = readFileSync(new URL("../public/icons/icon.svg", import.meta.url), "utf8");
const browser = await chromium.launch();
const page = await browser.newPage();
for (const s of [32, 72, 96, 128, 144, 152, 180, 192, 384, 512]) {
  await page.setViewportSize({ width: s, height: s });
  await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${svg.replace("<svg ", `<svg width="${s}" height="${s}" `)}`);
  writeFileSync(new URL(`../public/icons/icon-${s}.png`, import.meta.url), await page.screenshot({ omitBackground: true }));
}
await browser.close();
console.log("icons ok");
