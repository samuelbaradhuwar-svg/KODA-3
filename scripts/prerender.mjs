// Renders the app to static HTML after `vite build` and injects it into dist/index.html,
// so crawlers and slow connections get real content before any JavaScript runs.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ssrDir = path.resolve("dist-ssr");
const entry = fs.readdirSync(ssrDir).find((f) => /^entry-server.*\.(m?js)$/.test(f));
const { render } = await import(pathToFileURL(path.join(ssrDir, entry)).href);

const htmlPath = path.resolve("dist/index.html");
const html = fs.readFileSync(htmlPath, "utf8");
if (!html.includes('<div id="root"></div>')) throw new Error("Root placeholder not found in dist/index.html");

const out = html
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
  .replace(/<noscript>[\s\S]*?<\/noscript>\s*/, "");
fs.writeFileSync(htmlPath, out);
fs.rmSync(ssrDir, { recursive: true, force: true });
console.log("Pre-rendered dist/index.html");
