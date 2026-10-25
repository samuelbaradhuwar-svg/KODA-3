// Technical findings from the crawl and Google's speed data. Every finding states what was seen and where, in plain
// English, and names the KODA service that would fix it (prices and timelines are looked up later from the catalog).
// Nothing here is a guess: if a check could not run, there is no finding for it, and the audit says what was skipped.
export const SEVERITIES = ["high", "medium", "low", "info"];
export const BUCKETS = ["fix_first", "next", "later"];
export const bucketFor = (sev) => (sev === "high" ? "fix_first" : sev === "medium" ? "next" : "later");

const kb = (n) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.round(n / 1000)} KB`);
const path = (u) => {
  try {
    const x = new URL(u);
    return x.pathname === "/" ? "home page" : x.pathname + x.search;
  } catch {
    return String(u).slice(0, 80);
  }
};
const list = (items, n = 4) => items.slice(0, n).join("; ") + (items.length > n ? `; and ${items.length - n} more` : "");

export function technicalFindings(crawl, speed = {}) {
  const out = [];
  const add = (id, severity, title, evidence, why, fix, service_key) =>
    out.push({ id, area: "technical", severity, title, evidence, why, fix, service_key, bucket: bucketFor(severity), include: true, source: "auto" });
  if (!crawl) return out;

  if (crawl.site?.homeError) {
    add("home-unreachable", "high", "Our checker could not open the home page", crawl.site.homeError, "If our checker cannot open the site, search engines and some visitors may not be able to either.", "Check the site loads from outside your own network, and that no firewall or login blocks it.", "maintenance");
    return out;
  }
  const pages = crawl.pages.filter((p) => p.status);
  const ok = pages.filter((p) => p.status >= 200 && p.status < 400);
  const home = crawl.pages[0];
  const site = crawl.site || {};

  // ---- secure connection and redirects
  if (crawl.finalUrl && !crawl.finalUrl.startsWith("https://")) add("https", "high", "The site is not secure (no HTTPS)", `The home page loads over plain http (${crawl.finalUrl}).`, "Browsers warn visitors that the site is not secure, and Google prefers secure sites.", "Install an SSL certificate and send all traffic to the secure address.", "hosting");
  else if (site.httpRedirect && !site.httpRedirect.error && site.httpRedirect.status === 200) add("no-https-redirect", "medium", "The old http address does not send people to the secure one", "Typing the address with http:// shows the site without redirecting to https://.", "Visitors and search engines can end up on an insecure copy, and Google may treat the two as separate sites.", "Redirect every http address to its https version.", "hosting");
  if (site.altHost && !site.altHost.error && site.altHost.status === 200 && site.altHost.finalHost === site.altHost.host)
    add("www-split", "medium", "The site answers on two addresses", `Both ${new URL(crawl.finalUrl).hostname} and ${site.altHost.host} load without one forwarding to the other.`, "Google can see two copies of the same site, which splits your ranking strength and can look like duplicate content.", "Pick one address and redirect the other to it.", "seo");
  const chains = ok.filter((p) => p.redirects > 1);
  if (chains.length) add("redirect-chains", "low", "Some pages pass through several redirects", list(chains.map((p) => `${path(p.url)} (${p.redirects} redirects)`)), "Each extra hop slows the page and wastes the attention search engines give your site.", "Link straight to the final address and tidy the redirect rules.", "maintenance");
  if (site.notFound && !site.notFound.error && site.notFound.status === 200) add("soft-404", "medium", "Missing pages do not say \"not found\"", "A made-up address on the site returned a normal page (status 200) instead of a 404.", "Search engines can index pages that should not exist, and visitors who mistype are not guided back.", "Return a proper 404 status with a friendly page that links back to your main pages.", "maintenance");

  // ---- pages that failed
  const bad = pages.filter((p) => p.status >= 400);
  const failed = crawl.pages.filter((p) => p.error);
  if (bad.length || failed.length) add("page-errors", "high", "Some pages return errors", list([...bad.map((p) => `${path(p.url)} (status ${p.status})`), ...failed.map((p) => `${path(p.url)} (${p.error})`)]), "Visitors and Google hit a dead end on these pages.", "Fix or redirect each page so it loads, or remove the links pointing to it.", "maintenance");

  // ---- search engine access
  const noindex = ok.filter((p) => /noindex/i.test(p.robotsMeta || ""));
  if (noindex.length) add("noindex", noindex.some((p) => p === home) ? "high" : "medium", "Pages are telling Google not to show them", list(noindex.map((p) => path(p.url))), "A \"noindex\" tag removes a page from Google search results entirely.", "Remove the noindex tag from any page you want customers to find.", "seo");
  if (site.robots?.blocksAll) add("robots-blocks", "high", "robots.txt blocks the whole site", "robots.txt contains \"Disallow: /\" for all search engines.", "Search engines are asked to stay away from every page.", "Edit robots.txt so it only blocks private areas, and keep the rest open.", "seo");
  else if (site.robots && !site.robots.found) add("robots-missing", "low", "No robots.txt file", "robots.txt was not found.", "It is a small file that tells search engines where your sitemap is and what to skip.", "Add a simple robots.txt that points to your sitemap.", "seo");
  if (site.sitemap && !site.sitemap.found) add("sitemap-missing", "medium", "No sitemap", "sitemap.xml was not found.", "A sitemap is a list of your pages that helps Google find all of them, quickly.", "Create a sitemap and submit it in Google Search Console.", "seo");
  else if (site.sitemap?.found && site.robots?.found && !site.robots.sitemaps.length) add("sitemap-unlisted", "low", "The sitemap is not mentioned in robots.txt", "robots.txt has no Sitemap line.", "Search engines look there first for the sitemap.", "Add a Sitemap line to robots.txt.", "seo");
  const canonBad = ok.filter((p) => { try { return p.canonical && new URL(p.canonical, p.url).hostname.replace(/^www\./, "") !== new URL(p.url).hostname.replace(/^www\./, ""); } catch { return false; } });
  if (canonBad.length) add("canonical-elsewhere", "high", "Pages point Google to a different website", list(canonBad.map((p) => `${path(p.url)} points to ${p.canonical}`)), "A canonical tag tells Google which address is the real one. Pointing at another site hands your ranking to them.", "Correct the canonical tag so each page points to itself.", "seo");
  else if (home && home.status < 400 && !home.canonical) add("canonical-missing", "low", "No canonical address on the home page", "The home page has no canonical tag.", "It helps Google pick one address when the same page can be reached several ways.", "Add a canonical tag to each page.", "seo");
  const noSchema = home && !home.schema?.length;
  if (noSchema) add("schema-missing", "medium", "No structured business data", "No JSON-LD structured data was found on the home page.", "Structured data helps Google understand your business, its address and its opening hours, and can unlock richer search results.", "Add LocalBusiness structured data with your name, address, phone and hours.", "seo");
  else if (home?.schema?.includes("(invalid JSON-LD)")) add("schema-invalid", "medium", "Structured business data has an error", "The JSON-LD on the home page could not be read.", "Google ignores structured data it cannot read.", "Fix the structured data so it validates.", "seo");

  // ---- mobile and page quality
  const noView = ok.filter((p) => !p.viewport);
  if (noView.length) add("viewport", "high", "Pages are not set up for phones", list(noView.map((p) => path(p.url))), "Without a mobile setting, phones show a shrunken desktop page that is hard to read and tap. This audit cannot see the rendered layout, so a visual check on a phone is still on the manual list.", "Add the mobile viewport setting and check the layout on a phone.", "redesign");
  const mixed = ok.filter((p) => p.mixedContent > 0 && p.url.startsWith("https"));
  if (mixed.length) add("mixed-content", "high", "Secure pages load some things insecurely", list(mixed.map((p) => `${path(p.url)} (${p.mixedContent} items)`)), "Browsers can block these items or show a warning, which breaks images and scripts and damages trust.", "Load every image, script and style over https.", "maintenance");
  if (home?.ms > 800 && home.ms < 100000) add("slow-server", home.ms > 1500 ? "medium" : "low", "The server is slow to respond", `The home page took about ${(home.ms / 1000).toFixed(1)} seconds to answer from our test location.`, "A slow first response delays everything after it, on every page.", "Move to faster hosting and switch on caching.", "hosting");

  // ---- security headers
  const h = home?.headers;
  if (h && home.url.startsWith("https")) {
    const missing = [];
    if (!h.hsts) missing.push("HSTS (always use https)");
    if (!h.csp) missing.push("content security policy");
    if (!h.xfo && !/frame-ancestors/i.test(h.csp)) missing.push("framing protection");
    if (!h.xcto) missing.push("content-type protection");
    if (!h.referrer) missing.push("referrer policy");
    if (!h.permissions) missing.push("permissions policy");
    if (missing.length >= 3) add("security-headers", missing.length >= 5 ? "medium" : "low", "Browser security protections are missing", `Not set on the home page: ${missing.join(", ")}.`, "These quiet settings protect visitors from some common attacks and are a sign of a carefully built site.", "Turn on the standard security headers at the host.", "maintenance");
  }

  // ---- links
  const broken = site.links?.broken?.filter((b) => !b.unverified) || [];
  const internalBroken = broken.filter((b) => b.internal);
  const externalBroken = broken.filter((b) => !b.internal);
  const label = (b) => `${b.url.slice(0, 90)} ${b.error ? "(could not be reached)" : `(status ${b.status})`}, found on ${path(b.on)}`;
  if (internalBroken.length) add("broken-internal", internalBroken.length >= 3 ? "high" : "medium", "Links inside the site are broken", list(internalBroken.map(label)) + ` Checked ${site.links.checked} of ${site.links.total} links.`, "Visitors who click a dead link usually leave, and Google treats broken links as a sign of neglect.", "Fix or remove each broken link.", "maintenance");
  if (externalBroken.length) add("broken-external", "low", "Links to other websites are broken", list(externalBroken.map(label)), "The pages these links pointed to have moved or disappeared.", "Update or remove the links.", "maintenance");

  // ---- images
  const big = (site.images || []).filter((i) => i.bytes > 200_000);
  if (big.length) add("image-size", big.some((i) => i.bytes > 500_000) ? "medium" : "low", "Some images are larger than they need to be", list(big.map((i) => `${kb(i.bytes)} on ${path(i.on)} (${i.url.split("/").pop().slice(0, 40)})`), 3), "Heavy images are the most common reason pages load slowly on a phone with a weak signal.", "Resize and compress the images and use modern formats.", "redesign");
  const totalImgs = ok.reduce((n, p) => n + (p.images?.total || 0), 0);
  const noAlt = ok.reduce((n, p) => n + (p.images?.noAlt || 0), 0);
  if (totalImgs && noAlt / totalImgs > 0.25) add("image-alt", "medium", "Many images have no description", `${noAlt} of ${totalImgs} images across ${ok.length} pages have no alt text.`, "Screen readers cannot describe them, and Google cannot tell what they show.", "Add a short plain description to each meaningful image.", "seo");
  const noDims = ok.reduce((n, p) => n + (p.images?.noDims || 0), 0);
  if (totalImgs >= 5 && noDims / totalImgs > 0.5) add("image-dims", "low", "Images have no set size", `${noDims} of ${totalImgs} images do not declare a width and height.`, "The page jumps around as images arrive, which is annoying and counts against you in Google's page experience scores.", "Set the width and height on every image.", "redesign");
  const legacy = ok.reduce((n, p) => n + (p.images?.legacy || 0), 0);
  const modern = ok.reduce((n, p) => n + (p.images?.modern || 0), 0);
  if (totalImgs >= 5 && legacy > 0 && modern === 0) add("image-format", "low", "Images are in older formats", `${legacy} JPEG or PNG images and none in WebP or AVIF.`, "Modern formats are often half the size for the same quality.", "Convert images to WebP or AVIF.", "redesign");

  // ---- Google's speed, accessibility and best-practice data, for each device type that was checked
  for (const [dev, s] of [["mobile", speed.mobile], ["desktop", speed.desktop]]) {
    if (!s || s.error || !s.scores) continue;
    const D = dev === "mobile" ? "phone" : "computer";
    const sc = s.scores;
    if (sc.speed != null && sc.speed < 90 && (dev === "mobile" || sc.speed < 70)) add(`speed-${dev}`, sc.speed < 50 ? "high" : "medium", `The site is slow on a ${D}`, `Google scores speed on a ${D} at ${sc.speed} out of 100 (90 and above is good).${s.savings?.length ? ` Biggest savings: ${s.savings.map((x) => `${x.title} (about ${(x.ms / 1000).toFixed(1)}s)`).join(", ")}.` : ""}`, "Slow pages lose visitors before they see anything, and speed is part of how Google ranks pages.", "Compress images, remove unused scripts and use faster hosting.", "redesign");
    if (s.lcp > 2500) add(`lcp-${dev}`, s.lcp > 4000 ? "high" : "medium", `Main content appears late on a ${D}`, `The largest item takes about ${(s.lcp / 1000).toFixed(1)} seconds to appear on a ${D} (Google's target is 2.5 seconds).${s.field?.lcp ? ` Real visitors (Google's field data): ${(s.field.lcp.value / 1000).toFixed(1)}s, rated ${String(s.field.lcp.category).toLowerCase()}.` : ""}`, "This is one of Google's three Core Web Vitals.", "Optimise the hero image and the code that holds it back.", "redesign");
    if (s.cls > 0.1) add(`cls-${dev}`, s.cls > 0.25 ? "high" : "medium", `The page jumps around while loading on a ${D}`, `Layout shift score ${s.cls.toFixed(2)} (Google's target is 0.1 or lower).`, "Things moving as the page loads cause mis-taps and are part of Google's Core Web Vitals.", "Reserve space for images, ads and fonts so nothing moves.", "redesign");
    if (s.tbt > 200) add(`tbt-${dev}`, s.tbt > 600 ? "high" : "medium", `The page is slow to react on a ${D}`, `Scripts block the page for about ${Math.round(s.tbt)} ms while it loads (target: under 200 ms).`, "The page looks ready but ignores taps, which feels broken.", "Remove or delay heavy scripts.", "redesign");
    if (s.field?.inp && s.field.inp.value > 200) add(`inp-${dev}`, s.field.inp.value > 500 ? "high" : "medium", `Real visitors find it slow to respond on a ${D}`, `Interaction to Next Paint is ${s.field.inp.value} ms for real visitors (target: under 200 ms).`, "Google measures how quickly a page responds when people tap or type, as part of Core Web Vitals.", "Reduce heavy scripts and long tasks.", "redesign");
    if (sc.accessibility != null && sc.accessibility < 90 && dev === "mobile") add("accessibility", sc.accessibility < 70 ? "medium" : "low", "Some people will struggle to use the site", `Google scores accessibility at ${sc.accessibility} out of 100.${s.a11y?.length ? ` Issues found: ${s.a11y.join("; ")}.` : ""}`, "Low contrast, missing labels and unclear buttons shut out visitors, including older customers.", "Fix the listed issues so every visitor can use the site.", "redesign");
    if (sc.practice != null && sc.practice < 80 && dev === "mobile") add("best-practice", "low", "Technical best-practice issues", `Google scores best practice at ${sc.practice} out of 100.`, "Outdated code and console errors point to a site that is not being looked after.", "Update outdated code and clear the errors.", "maintenance");
    if (s.bytes > 2_500_000 && dev === "mobile") add("page-weight", "medium", "The page is heavy", `The home page is about ${kb(s.bytes)} to download on a ${D}.`, "Heavy pages cost visitors mobile data and are slow on a weak signal.", "Slim down images, fonts and scripts.", "redesign");
  }
  return out;
}

// What could not be checked, so the report never implies a clean bill of health for things that were skipped.
export function checkedSummary(crawl, speed = {}) {
  const notes = [];
  if (!crawl) return ["The website crawl has not been run."];
  for (const n of crawl.incomplete || []) notes.push(n);
  for (const d of ["mobile", "desktop"]) if (speed[d]?.error) notes.push(`Google's ${d} speed check could not run: ${speed[d].error}.`);
  for (const d of ["mobile", "desktop"]) if (!speed[d]) notes.push(`Google's ${d} speed check has not been run.`);
  return notes;
}
