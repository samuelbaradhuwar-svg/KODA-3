// Renders every route to static HTML after `vite build`, so crawlers and slow connections get real content
// (with the right title, description and canonical URL for each page) before any JavaScript runs.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SITE = "https://www.heykoda.co.za";
const ssrDir = path.resolve("dist-ssr");
const entry = fs.readdirSync(ssrDir).find((f) => /^entry-server.*\.(m?js)$/.test(f));
const { render, pages, FAQS } = await import(pathToFileURL(path.join(ssrDir, entry)).href);

const template = fs.readFileSync(path.resolve("dist/index.html"), "utf8");
if (!template.includes('<div id="root"></div>')) throw new Error("Root placeholder not found in dist/index.html");

// Preload the three fonts used above the fold so the text does not reflow when they arrive.
const assets = fs.readdirSync(path.resolve("dist/assets"));
const fontFiles = [/^geist-latin-wght-normal-.*\.woff2$/, /^archivo-latin-standard-normal-.*\.woff2$/, /^instrument-serif-latin-400-normal-.*\.woff2$/, /^instrument-serif-latin-400-italic-.*\.woff2$/]
  .map((re) => assets.find((f) => re.test(f)))
  .filter(Boolean);
const preloads = fontFiles.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`).join("\n    ");

const esc = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Question and answer markup, only on pages that actually show the FAQ section, and built from the same text.
const faqLd = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
}).replace(/</g, "\\u003c")}</script>`;

for (const [route, meta] of Object.entries(pages)) {
  const url = route === "/" ? `${SITE}/` : `${SITE}${route}`;
  let html = template
    .replace("</head>", `    ${preloads}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`)
    .replace(/<noscript>[\s\S]*?<\/noscript>\s*/, "")
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(meta.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(meta.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(meta.description)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(meta.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(meta.description)}$2`);
  if (html.includes(esc(FAQS[0].q)) || html.includes(FAQS[0].q)) html = html.replace("</head>", `    ${faqLd}\n  </head>`);
  const out = route === "/" ? "dist/index.html" : path.join("dist", route, "index.html");
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(path.resolve(out), html);
  console.log(`Pre-rendered ${route}`);
}
fs.rmSync(ssrDir, { recursive: true, force: true });
