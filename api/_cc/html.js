// Small, dependency-free HTML reading helpers for the crawler. Text taken from a client's site is treated as data only.
export const decode = (s) =>
  String(s ?? "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();

export function attrs(tag) {
  const out = {};
  for (const m of String(tag).matchAll(/([a-zA-Z:_-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) out[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? "";
  return out;
}

export const tagsOf = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => attrs(m[0]));

export const stripBlocks = (html) => html.replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");
export const visibleText = (html) => decode(stripBlocks(html).replace(/<[^>]+>/g, " "));

export function headings(html) {
  return [...stripBlocks(html).matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => ({ l: Number(m[1]), t: decode(m[2].replace(/<[^>]+>/g, " ")).slice(0, 140) }))
    .filter((h) => h.t);
}

// JSON-LD @type values, including inside @graph
export function schemaTypes(html) {
  const out = new Set();
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    for (const t of [].concat(n["@type"] || [])) if (typeof t === "string") out.add(t.slice(0, 60));
    if (n["@graph"]) walk(n["@graph"]);
  };
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(m[1]));
    } catch {
      out.add("(invalid JSON-LD)");
    }
  }
  return [...out].slice(0, 20);
}

// South African numbers written as 031 555 0123, 031-555-0123, +27 31 555 0123 or 0027315550123, normalised to 0315550123
export function saPhones(text) {
  const set = new Set();
  for (const m of String(text).matchAll(/(?:\+27|0027|\b0)[\s.-]?\(?(\d{2})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\b/g)) set.add(`0${m[1]}${m[2]}${m[3]}`);
  return [...set].slice(0, 10);
}

export function normaliseLink(href, base) {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    return u;
  } catch {
    return null;
  }
}
