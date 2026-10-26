// Search findings: titles, descriptions, headings, whether the town and trade are where Google looks, local details
// and missing pages. Keyword and local checks only run when the owner has entered the trade, town and so on, because a
// crawler cannot know them. Nothing is guessed: a check that cannot run produces a note, not a finding.
import { bucketFor } from "./technical.js";

const terms = (s) => String(s ?? "").split(/[,;\n]/).map((t) => t.trim().toLowerCase()).filter((t) => t.length >= 2).slice(0, 8);
const hasAny = (text, ts) => ts.some((t) => String(text || "").toLowerCase().includes(t));
const norm = (n) => {
  const d = String(n).replace(/\D/g, "");
  return d.startsWith("27") && d.length >= 11 ? `0${d.slice(2)}` : d;
};
const path = (u) => {
  try {
    const x = new URL(u);
    return x.pathname === "/" ? "home page" : x.pathname;
  } catch {
    return String(u).slice(0, 80);
  }
};
const list = (items, n = 4) => items.slice(0, n).join("; ") + (items.length > n ? `; and ${items.length - n} more` : "");
const q = (s, n = 70) => `"${String(s).slice(0, n)}"`;

export function searchNotes(inputs = {}) {
  const notes = [];
  if (!terms(inputs.trade).length || !terms(inputs.town).length) notes.push("Keyword checks were skipped: enter the trade and the town under \"About this business\", then analyse again.");
  if (!inputs.phone && !inputs.address && !terms(inputs.areas).length) notes.push("Local detail checks (phone, address, areas served) were skipped: enter those details under \"About this business\".");
  return notes;
}

export function searchFindings(crawl, inputs = {}) {
  const out = [];
  const add = (id, severity, title, evidence, why, fix, service_key) =>
    out.push({ id, area: "search", severity, title, evidence, why, fix, service_key, bucket: bucketFor(severity), include: true, source: "auto" });
  if (!crawl || crawl.site?.homeError) return out;
  const pages = crawl.pages.filter((p) => p.status >= 200 && p.status < 300 && !p.error);
  const home = pages[0];
  if (!home) return out;

  // ---- titles
  const noTitle = pages.filter((p) => !p.title);
  if (noTitle.length) add("title-missing", noTitle.includes(home) ? "high" : "medium", "Pages have no title", list(noTitle.map((p) => path(p.url))), "The title is the blue headline people click in Google. Without one, Google invents it.", "Give every page a clear title with the service and town, about 50 to 60 characters.", "seo");
  const oddTitle = pages.filter((p) => p.title && (p.title.length < 20 || p.title.length > 65));
  if (oddTitle.length) add("title-length", "low", "Some titles are too short or too long", list(oddTitle.map((p) => `${path(p.url)} ${q(p.title, 50)} (${p.title.length} characters)`)), "Short titles waste the space Google gives you; long ones get cut off in results.", "Aim for 50 to 60 characters that say what the page offers.", "seo");
  const dupTitles = Object.values(pages.filter((p) => p.title).reduce((m, p) => ((m[p.title.toLowerCase()] ||= []).push(p), m), {})).filter((g) => g.length > 1);
  if (dupTitles.length) add("title-duplicate", "medium", "Different pages share the same title", list(dupTitles.map((g) => `${g.map((p) => path(p.url)).join(", ")} all say ${q(g[0].title, 50)}`)), "Google cannot tell which page answers which search.", "Write a unique title for each page.", "seo");

  // ---- descriptions
  const noDesc = pages.filter((p) => !p.description);
  if (noDesc.length) add("desc-missing", "medium", "Pages have no search description", list(noDesc.map((p) => path(p.url))), "The description is the small print under the title in Google. Without one, Google picks random text.", "Write a short, honest description for each page that makes people want to click.", "seo");
  const oddDesc = pages.filter((p) => p.description && (p.description.length < 70 || p.description.length > 165));
  if (oddDesc.length) add("desc-length", "low", "Some descriptions are too short or too long", list(oddDesc.map((p) => `${path(p.url)} (${p.description.length} characters)`)), "Short ones waste the space; long ones are cut off.", "Aim for 120 to 160 characters.", "seo");
  const dupDesc = Object.values(pages.filter((p) => p.description).reduce((m, p) => ((m[p.description.toLowerCase()] ||= []).push(p), m), {})).filter((g) => g.length > 1);
  if (dupDesc.length) add("desc-duplicate", "low", "Different pages share the same description", list(dupDesc.map((g) => g.map((p) => path(p.url)).join(", "))), "Identical descriptions make pages look the same in search.", "Write a unique description for each page.", "seo");

  // ---- headings and content depth
  const noH1 = pages.filter((p) => !p.h1?.length);
  if (noH1.length) add("h1-missing", "medium", "Pages have no main heading", list(noH1.map((p) => path(p.url))), "The main heading tells visitors and Google what the page is about.", "Give each page one clear main heading.", "seo");
  const manyH1 = pages.filter((p) => p.h1?.length > 1);
  if (manyH1.length) add("h1-many", "low", "Pages have more than one main heading", list(manyH1.map((p) => `${path(p.url)} (${p.h1.length})`)), "One main heading per page keeps the structure clear.", "Keep one main heading and use smaller headings below it.", "seo");
  const skipped = pages.filter((p) => (p.headings || []).some((h, i, a) => i > 0 && h.l - a[i - 1].l > 1));
  if (skipped.length) add("heading-order", "low", "Heading levels skip", list(skipped.map((p) => path(p.url))), "Jumping from a main heading to a very small one confuses screen readers and search engines.", "Use headings in order: main, then section, then sub-section.", "seo");
  const thin = pages.filter((p) => p.words > 0 && p.words < (p === home ? 200 : 150));
  if (thin.length) add("thin", "medium", "Some pages have very little text", list(thin.map((p) => `${path(p.url)} (about ${p.words} words)`)), "Pages with almost no text give Google little to rank them on.", "Add helpful, plain-English detail about the service, the area and the process.", "seo");

  // ---- one-page site and missing pages
  const links = new Set(crawl.pages.flatMap((p) => [p.url, ...(p.links || [])]).map((l) => { try { return new URL(l).pathname.toLowerCase(); } catch { return ""; } }));
  const has = (re) => [...links].some((l) => re.test(l));
  if (pages.length <= 1) add("one-page", "low", "The site is effectively one page", "No other pages were found linked from the home page.", "One page cannot rank for each service or area separately.", "Add a page for each main service and for each area you serve.", "design");
  else {
    const gaps = [];
    if (!has(/service|what-we-do|solutions|treatments/)) gaps.push("a services page");
    if (!has(/about|our-story|who-we-are|team/)) gaps.push("an about page");
    if (!has(/contact|get-in-touch|enquir|quote/)) gaps.push("a contact page");
    if (gaps.length) add("pages-missing", "medium", "Key pages are missing", `No link to ${gaps.join(", ")} was found among the pages read.`, "Customers and Google look for these pages first.", "Add the missing pages and link them from the menu.", "design");
    if (!has(/blog|news|articles|insights/)) add("no-blog", "low", "No blog or news section", "No blog, news or articles page was found.", "Regular helpful articles give you more chances to show up for what customers search.", "Add a small blog with answers to the questions customers ask.", "seo_social");
    if (!has(/faq/)) add("no-faq", "low", "No FAQ page", "No FAQ page was found.", "Answering common questions builds trust and can win search snippets.", "Add an FAQ with real customer questions.", "seo");
  }

  // ---- keywords against the trade and the town (needs the owner's input)
  const trade = terms(inputs.trade);
  const town = terms(inputs.town);
  if (trade.length && town.length) {
    const tHas = (p) => hasAny(`${p.title} ${(p.h1 || []).join(" ")} ${p.description}`, trade);
    const wHas = (p) => hasAny(`${p.title} ${(p.h1 || []).join(" ")} ${p.description}`, town);
    const homeSpots = `title ${q(home.title, 60)}, main heading ${q((home.h1 || [])[0] || "none", 60)}`;
    if (!tHas(home) && !wHas(home)) add("kw-home", "high", "The home page does not say what you do or where", `Neither the trade (${trade.join(" / ")}) nor the town (${town.join(" / ")}) appears in the ${homeSpots} or description.`, "People search for a trade plus a town. If neither is where Google looks, it has little reason to show you.", `Put the trade and the town in the home page title, main heading and description, for example "${trade[0]} in ${town[0]}".`, "seo");
    else if (!tHas(home)) add("kw-trade", "medium", "The home page title and heading do not mention the trade", `The trade (${trade.join(" / ")}) is not in the ${homeSpots} or description.`, "Google matches searches to the words on the page.", "Say plainly what you do in the title and main heading.", "seo");
    else if (!wHas(home)) add("kw-town", "medium", "The home page title and heading do not mention the town", `The town (${town.join(" / ")}) is not in the ${homeSpots} or description.`, "Local searches include the town; leaving it out weakens local results.", "Add the town to the title, main heading and description.", "seo");
    const bodyTown = pages.filter((p) => hasAny(p.text, town)).length;
    const bodyTrade = pages.filter((p) => hasAny(p.text, trade)).length;
    if (!bodyTown) add("kw-body-town", "medium", "The town is not mentioned in the page text", `None of the ${pages.length} pages read mention ${town.join(" / ")} in their text.`, "Mentioning where you work helps Google show you to nearby customers.", "Mention the town and the areas you serve naturally in the page text.", "seo");
    if (!bodyTrade) add("kw-body-trade", "medium", "The trade is not mentioned in the page text", `None of the ${pages.length} pages read mention ${trade.join(" / ")} in their text.`, "Google needs to see the words customers search for.", "Describe the work using the words customers use.", "seo");
  }

  // ---- local details (needs the owner's input), and phone consistency (no input needed)
  const phones = new Map();
  for (const p of pages) for (const raw of [...(p.phones || []), ...(p.tel || [])]) { const n = norm(raw); if (n.length >= 9) (phones.get(n) || phones.set(n, new Set()).get(n)).add(path(p.url)); }
  if (phones.size > 1) add("phone-inconsistent", "medium", "More than one phone number appears", list([...phones].map(([n, on]) => `${n} on ${[...on].slice(0, 3).join(", ")}`)), "Different numbers on different pages confuse customers and make Google less sure which is yours.", "Use one main number everywhere, the same as on your Google Business Profile.", "gbp");
  const text = pages.map((p) => p.text || "").join(" ").toLowerCase();
  if (inputs.phone) {
    const want = norm(inputs.phone);
    if (want.length >= 9 && ![...phones.keys()].some((n) => n === want)) add("phone-missing", "medium", "Your phone number was not found on the site", `The number you entered (${inputs.phone}) does not appear on the pages read.`, "A visible, consistent number is one of the main local signals and the quickest way for a customer to reach you.", "Show the number on every page and make it tap-to-call on phones.", "design");
  }
  if (inputs.address) {
    const bits = String(inputs.address).toLowerCase().split(/[,\n]/).map((t) => t.trim()).filter((t) => t.length >= 4);
    if (bits.length && !bits.some((b) => text.includes(b))) add("address-missing", "medium", "Your address was not found on the site", `Nothing matching the address you entered (${String(inputs.address).slice(0, 80)}) appears in the text of the pages read.`, "A written address that matches your Google Business Profile helps customers and local search.", "Show the full address in the footer and on the contact page, exactly as on Google.", "gbp");
  }
  if (inputs.businessName) {
    const name = String(inputs.businessName).toLowerCase().trim();
    if (name.length >= 3 && !`${home.title} ${(home.h1 || []).join(" ")}`.toLowerCase().includes(name)) add("name-missing", "low", "The business name is not in the home page title or heading", `${q(inputs.businessName)} does not appear in the title or main heading.`, "The name in the title helps people searching for you by name.", "Include the business name in the home page title.", "seo");
  }
  const areas = terms(inputs.areas);
  if (areas.length) {
    const missing = areas.filter((a) => !text.includes(a));
    if (missing.length) add("areas-missing", missing.length === areas.length ? "medium" : "low", "Some areas you serve are not mentioned", `Not found in the text: ${missing.join(", ")}.`, "Customers search by suburb or town. If an area is never mentioned, you are unlikely to appear for it.", "Add a short section or page for each area you serve.", "seo");
  }
  return out;
}
