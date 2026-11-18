// Renders every route to static HTML after `vite build`, so crawlers and slow connections get real content
// (with the right title, description and canonical URL for each page) before any JavaScript runs.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SITE = "https://www.heykoda.co.za";
const ssrDir = path.resolve("dist-ssr");
const entry = fs.readdirSync(ssrDir).find((f) => /^entry-server.*\.(m?js)$/.test(f));
const { render, pages, FAQS, DURBAN_FAQS, DEV_FAQS, WORK_FAQS, ECOM_FAQS, STORE_FROM, PROJECTS } = await import(pathToFileURL(path.join(ssrDir, entry)).href);

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

// Markup for the Durban page: the page, a breadcrumb trail, the service and its questions (built from the same text).
const durbanLd = (meta) => `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "@id": `${SITE}/website-design-durban#webpage`, url: `${SITE}/website-design-durban`, name: meta.title, description: meta.description, inLanguage: "en-ZA", isPartOf: { "@id": `${SITE}/#website` }, breadcrumb: { "@id": `${SITE}/website-design-durban#breadcrumb` } },
    { "@type": "BreadcrumbList", "@id": `${SITE}/website-design-durban#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` }, { "@type": "ListItem", position: 2, name: "Website design in Durban", item: `${SITE}/website-design-durban` }] },
    { "@type": "Service", name: "Website design in Durban", serviceType: "Website development, SEO, AI SEO and digital marketing", provider: { "@id": `${SITE}/#organization` }, areaServed: { "@type": "City", name: "Durban" } },
    { "@type": "FAQPage", mainEntity: DURBAN_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ],
}).replace(/</g, "\\u003c")}</script>`;

// Markup for the online stores page: the page, the service (with its starting price) and its own questions.
const ecomLd = (meta) => `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "@id": `${SITE}/ecommerce#webpage`, url: `${SITE}/ecommerce`, name: meta.title, description: meta.description, inLanguage: "en-ZA", isPartOf: { "@id": `${SITE}/#website` } },
    {
      "@type": "Service", name: "Ecommerce website design", serviceType: "Online store design and development", provider: { "@id": `${SITE}/#organization` }, areaServed: { "@type": "Country", name: "South Africa" },
      offers: { "@type": "Offer", priceSpecification: { "@type": "PriceSpecification", priceCurrency: "ZAR", minPrice: Number(STORE_FROM.replace(/[^0-9]/g, "")) }, description: "Online stores from this price. A written quote confirms what is included." },
    },
    { "@type": "FAQPage", mainEntity: ECOM_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ],
}).replace(/</g, "\\u003c")}</script>`;

// Markup for the our work page: the page, the projects it lists (from the same data) and its own questions.
const workLd = (meta) => `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage", "@id": `${SITE}/our-work#webpage`, url: `${SITE}/our-work`, name: meta.title, description: meta.description, inLanguage: "en-ZA",
      isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` },
      mainEntity: { "@type": "ItemList", itemListElement: PROJECTS.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "WebSite", name: p.name, url: p.url, creator: { "@id": `${SITE}/#organization` } } })) },
    },
    { "@type": "FAQPage", mainEntity: WORK_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ],
}).replace(/</g, "\\u003c")}</script>`;

// Markup for the website developers page: the page, the service and its own questions (built from the same text).
const devLd = (meta) => `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "@id": `${SITE}/website-developers-in-durban#webpage`, url: `${SITE}/website-developers-in-durban`, name: meta.title, description: meta.description, inLanguage: "en-ZA", isPartOf: { "@id": `${SITE}/#website` } },
    { "@type": "Service", name: "Website development", serviceType: "Website development, SEO, AI SEO and digital marketing", provider: { "@id": `${SITE}/#organization` }, areaServed: { "@type": "Country", name: "South Africa" } },
    { "@type": "FAQPage", mainEntity: DEV_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ],
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
  if (route === "/website-design-durban") html = html.replace("</head>", `    ${durbanLd(meta)}\n  </head>`);
  else if (route === "/ecommerce") html = html.replace("</head>", `    ${ecomLd(meta)}\n  </head>`);
  else if (route === "/our-work") html = html.replace("</head>", `    ${workLd(meta)}\n  </head>`);
  else if (route === "/website-developers-in-durban") html = html.replace("</head>", `    ${devLd(meta)}\n  </head>`);
  else if (html.includes(esc(FAQS[0].q)) || html.includes(FAQS[0].q)) html = html.replace("</head>", `    ${faqLd}\n  </head>`);
  const out = route === "/" ? "dist/index.html" : path.join("dist", route, "index.html");
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(path.resolve(out), html);
  console.log(`Pre-rendered ${route}`);
}
// The page shown for addresses that do not exist. The host serves dist/404.html with a 404 status. It must not be indexed
// and must not claim a canonical address, so those tags are replaced.
{
  const title = "Page not found | KODA";
  const description = "That page does not exist. Go back to the KODA home page or see our pricing, our work and our free website audit.";
  let html = template
    .replace("</head>", `    ${preloads}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${render("/404")}</div>`)
    .replace(/<noscript>[\s\S]*?<\/noscript>\s*/, "")
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/\s*<link rel="canonical"[^>]*>/, "")
    .replace(/\s*<meta property="og:url"[^>]*>/, "")
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace("</head>", `    <meta name="robots" content="noindex">\n  </head>`);
  fs.writeFileSync(path.resolve("dist/404.html"), html);
  console.log("Pre-rendered 404 page");
}
fs.rmSync(ssrDir, { recursive: true, force: true });
