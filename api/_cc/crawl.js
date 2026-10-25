// The in-depth crawl: up to about 10 key pages of one site, plus site-wide probes (robots, sitemap, redirects, 404 page,
// security headers, links, image sizes). Everything goes through safeFetch, so only public addresses are opened, with
// size and time limits on every request and a time budget for the whole run.
// The result is structured facts plus short evidence strings. Raw HTML is never stored.
import { safeFetch } from "../_safe.js";
import { attrs, decode, headings, normaliseLink, saPhones, schemaTypes, tagsOf, visibleText } from "./html.js";

const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|avif|svg|ico|zip|docx?|xlsx?|pptx?|mp4|mp3|css|js|xml|json)(\?|$)/i;
const KEY_PATHS = [
  [/(^|\/)(services?|what-we-do|our-services|solutions|treatments)(\/|$)/i, 10],
  [/(^|\/)(about|about-us|our-story|who-we-are|team)(\/|$)/i, 9],
  [/(^|\/)(contact|contact-us|get-in-touch|enquir|quote|book)/i, 9],
  [/(^|\/)(blog|news|articles|insights)(\/|$)/i, 7],
  [/(^|\/)(pricing|prices|packages|rates)(\/|$)/i, 6],
  [/(^|\/)(areas?|locations?|service-areas?)(\/|$)/i, 6],
  [/(^|\/)(gallery|portfolio|work|projects|case-studies|testimonials|reviews)(\/|$)/i, 5],
  [/(^|\/)(faq|faqs)(\/|$)/i, 4],
  [/(^|\/)(shop|store|products)(\/|$)/i, 4],
];
const CTA_WORDS = /\b(call|book|get|request|contact|enquire|quote|whatsapp|start|order|buy|shop|schedule|free|download|talk)\b/i;
const SOFT_BROKEN_HOSTS = /(^|\.)(facebook|instagram|linkedin|twitter|x|tiktok|wa|whatsapp|google|goo\.gl|maps\.app\.goo\.gl)\./i; // these block bots; a refusal proves nothing

const sleepless = async (items, limit, fn) => {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k], k);
    }
  }));
  return out;
};

export function pickPages(homeLinks, origin, sitemapUrls = [], max = 10) {
  const host = new URL(origin).hostname.replace(/^www\./, "");
  const seen = new Map();
  const consider = (u, extra = 0) => {
    if (u.hostname.replace(/^www\./, "") !== host || SKIP_EXT.test(u.pathname)) return;
    const key = u.origin + u.pathname.replace(/\/+$/, "");
    if (u.pathname === "/" || u.pathname === "") return;
    const score = (KEY_PATHS.find(([re]) => re.test(u.pathname))?.[1] || 0) + extra - Math.min(u.pathname.split("/").length, 6) * 0.1;
    if (!seen.has(key) || seen.get(key).score < score) seen.set(key, { url: u.origin + u.pathname + (u.search && !u.search.includes("utm_") ? u.search : ""), score });
  };
  homeLinks.forEach((u) => consider(u, 1));
  sitemapUrls.forEach((u) => consider(u, 0));
  return [...seen.values()].sort((a, b) => b.score - a.score).slice(0, max - 1).map((x) => x.url);
}

function analysePage(html, res) {
  const lower = html.toLowerCase();
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const meta = (name, attr = "name") => {
    for (const a of tagsOf(html, "meta")) if ((a[attr] || "").toLowerCase() === name) return decode(a.content || "");
    return "";
  };
  const hs = headings(html);
  const imgs = tagsOf(html, "img");
  const links = [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({ ...attrs(m[0].slice(0, m[0].indexOf(">") + 1)), text: decode(m[1].replace(/<[^>]+>/g, " ")).slice(0, 80) }));
  const base = res.url;
  const hrefs = links.map((a) => a.href && normaliseLink(a.href, base)).filter(Boolean);
  const text = visibleText(html);
  const canonical = (tagsOf(html, "link").find((a) => (a.rel || "").toLowerCase().split(/\s+/).includes("canonical")) || {}).href || "";
  const buttons = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)].map((m) => decode(m[1].replace(/<[^>]+>/g, " ")));
  const ctas = [...new Set([...links.map((a) => a.text), ...buttons].filter((t) => t && t.length <= 40 && CTA_WORDS.test(t)))].slice(0, 10);
  const mixed = [...html.matchAll(/<(?:img|script|iframe|source|link)\b[^>]*\b(?:src|href)=["']http:\/\/[^"']+/gi)].length;
  return {
    url: base,
    status: res.status,
    ms: res.ms,
    bytes: html.length,
    type: res.type.split(";")[0],
    redirects: res.chain.length - 1,
    title,
    description: meta("description"),
    h1: hs.filter((h) => h.l === 1).map((h) => h.t).slice(0, 4),
    headings: hs.slice(0, 20),
    canonical,
    robotsMeta: meta("robots"),
    viewport: meta("viewport"),
    lang: (html.match(/<html[^>]*\blang=["']?([a-zA-Z-]+)/i) || [])[1] || "",
    og: { title: meta("og:title", "property"), description: meta("og:description", "property"), image: meta("og:image", "property") },
    twitterCard: meta("twitter:card"),
    schema: schemaTypes(html),
    images: {
      total: imgs.length,
      noAlt: imgs.filter((a) => a.alt === undefined).length,
      noDims: imgs.filter((a) => !(a.width && a.height)).length,
      lazy: imgs.filter((a) => a.loading === "lazy").length,
      legacy: imgs.filter((a) => /\.(jpe?g|png)(\?|$)/i.test(a.src || "")).length,
      modern: imgs.filter((a) => /\.(webp|avif)(\?|$)/i.test(a.src || "")).length,
      srcs: imgs.map((a) => a.src || a["data-src"]).filter(Boolean).slice(0, 30),
    },
    forms: (html.match(/<form\b/gi) || []).length,
    tel: [...new Set(links.map((a) => a.href).filter((h) => /^tel:/i.test(h || "")).map((h) => h.slice(4, 30)))].slice(0, 5),
    mailto: [...new Set(links.map((a) => a.href).filter((h) => /^mailto:/i.test(h || "")).map((h) => h.slice(7, 80)))].slice(0, 5),
    whatsapp: /wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(lower),
    ctas,
    mixedContent: mixed,
    words: text.split(" ").filter(Boolean).length,
    phones: saPhones(text),
    text: text.slice(0, 8000), // used for keyword and town checks in the analysis; not shown whole and never sent to AI
    links: [...new Set(hrefs.map((u) => u.toString()))].slice(0, 120),
    hrefsRaw: undefined,
  };
}

async function probe(url, opts = {}) {
  try {
    return await safeFetch(url, { timeout: 7000, maxBytes: 400_000, ...opts });
  } catch (e) {
    return { error: String(e?.message || e).slice(0, 120) };
  }
}

export async function crawlSite(startUrl, { fetcher = probe, maxPages = 10, budgetMs = 45_000, now = Date.now } = {}) {
  const t0 = now();
  const left = () => budgetMs - (now() - t0);
  const incomplete = [];
  const origin = new URL(startUrl).origin;
  const out = { startedAt: new Date(t0).toISOString(), start: startUrl, pages: [], site: {}, incomplete };

  const home = await fetcher(startUrl, { maxBytes: 1_500_000 });
  if (home.error || !home.body) {
    out.site.homeError = home.error || "The home page returned nothing.";
    return out;
  }
  const homePage = analysePage(home.body, home);
  homePage.headers = pickHeaders(home.headers);
  homePage.chain = home.chain;
  out.pages.push(homePage);
  out.finalUrl = home.url;
  const finalOrigin = new URL(home.url).origin;

  // robots.txt and sitemap
  const [robots, sitemap] = await Promise.all([fetcher(`${finalOrigin}/robots.txt`), fetcher(`${finalOrigin}/sitemap.xml`, { maxBytes: 1_000_000 })]);
  const robotsOk = !robots.error && robots.status === 200 && !/<html/i.test(robots.body.slice(0, 400));
  out.site.robots = robotsOk
    ? { found: true, blocksAll: /^\s*disallow:\s*\/\s*$/im.test(robots.body) && /user-agent:\s*\*/i.test(robots.body), sitemaps: [...robots.body.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1]).slice(0, 5) }
    : { found: false };
  const sitemapOk = !sitemap.error && sitemap.status === 200 && /<(urlset|sitemapindex)/i.test(sitemap.body);
  const sitemapUrls = sitemapOk ? [...sitemap.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => normaliseLink(m[1], finalOrigin)).filter(Boolean) : [];
  out.site.sitemap = { found: sitemapOk, urls: sitemapUrls.length, isIndex: sitemapOk && /<sitemapindex/i.test(sitemap.body) };

  // key pages
  const homeLinks = homePage.links.map((l) => new URL(l));
  const picks = pickPages(homeLinks, finalOrigin, sitemapUrls, maxPages);
  const fetched = await sleepless(picks, 3, async (u) => {
    if (left() < 8000) return { skipped: u };
    const r = await fetcher(u, { maxBytes: 1_200_000 });
    if (r.error) return { failed: u, error: r.error };
    if (!r.body || !/html/i.test(r.type)) return { failed: u, error: `Not a web page (${r.type || "no type"})` };
    const p = analysePage(r.body, r);
    p.chain = r.chain;
    return { page: p };
  });
  for (const f of fetched) {
    if (f.page) out.pages.push(f.page);
    else if (f.skipped) incomplete.push(`Page not checked (time limit): ${f.skipped}`);
    else out.pages.push({ url: f.failed, status: 0, error: f.error });
  }

  // site-wide probes
  const host = new URL(finalOrigin).hostname;
  const bare = host.replace(/^www\./, "");
  const alt = host.startsWith("www.") ? bare : `www.${host}`;
  const [http, altRes, missing] = await Promise.all([
    probe(`http://${host}/`, { noFollow: true, maxBytes: 1000 }),
    probe(`https://${alt}/`, { maxHops: 3, maxBytes: 1000 }),
    probe(`${finalOrigin}/koda-check-${Math.random().toString(36).slice(2, 10)}`, { maxBytes: 50_000 }),
  ]);
  out.site.httpRedirect = http.error ? { error: http.error } : { status: http.status, location: String(http.headers?.location || "").slice(0, 200) };
  out.site.altHost = alt.length ? (altRes.error ? { host: alt, error: altRes.error } : { host: alt, status: altRes.status, finalHost: new URL(altRes.url).hostname, hops: altRes.chain.length - 1 }) : null;
  out.site.notFound = missing.error ? { error: missing.error } : { status: missing.status };

  // links (a capped sample) and image sizes
  if (left() > 12_000) {
    const all = new Map();
    for (const p of out.pages) for (const l of p.links || []) if (!all.has(l)) all.set(l, p.url);
    const internalFirst = [...all.entries()].sort(([a], [b]) => (new URL(b).hostname.endsWith(bare) ? 1 : 0) - (new URL(a).hostname.endsWith(bare) ? 1 : 0)).slice(0, 40);
    const checked = await sleepless(internalFirst, 6, async ([link, on]) => {
      if (left() < 4000) return null;
      let r = await probe(link, { method: "HEAD", timeout: 6000 });
      if (r.error || [403, 405, 501].includes(r.status)) r = await probe(link, { timeout: 6000, maxBytes: 2000 });
      const u = new URL(link);
      const internal = u.hostname.replace(/^www\./, "") === bare;
      if (r.error) return { url: link, on, internal, error: r.error, unverified: SOFT_BROKEN_HOSTS.test(u.hostname) };
      return { url: link, on, internal, status: r.status, unverified: SOFT_BROKEN_HOSTS.test(u.hostname) && r.status >= 400 };
    });
    out.site.links = { checked: checked.filter(Boolean).length, total: all.size, broken: checked.filter((c) => c && (c.error || c.status >= 400)) };
  } else incomplete.push("Links were not checked (time limit).");

  if (left() > 8000) {
    const srcs = new Map();
    for (const p of out.pages) for (const s of p.images?.srcs || []) { const u = normaliseLink(s, p.url); if (u && !srcs.has(u.toString())) srcs.set(u.toString(), p.url); }
    const sized = await sleepless([...srcs.entries()].slice(0, 14), 5, async ([src, on]) => {
      if (left() < 3000) return null;
      const r = await probe(src, { method: "HEAD", timeout: 5000 });
      const len = Number(r.headers?.["content-length"]);
      return r.error || !len ? null : { url: src, on, bytes: len, type: (r.type || "").split(";")[0] };
    });
    out.site.images = sized.filter(Boolean).sort((a, b) => b.bytes - a.bytes).slice(0, 14);
  } else incomplete.push("Image sizes were not checked (time limit).");

  out.finishedAt = new Date(now()).toISOString();
  out.ms = now() - t0;
  for (const p of out.pages) delete p.hrefsRaw;
  return out;
}

function pickHeaders(h = {}) {
  const k = (n) => (h[n] ? String(h[n]).slice(0, 200) : "");
  return {
    hsts: k("strict-transport-security"), csp: k("content-security-policy"), xfo: k("x-frame-options"), xcto: k("x-content-type-options"),
    referrer: k("referrer-policy"), permissions: k("permissions-policy"), cache: k("cache-control"), server: k("server"), encoding: k("content-encoding"),
  };
}
