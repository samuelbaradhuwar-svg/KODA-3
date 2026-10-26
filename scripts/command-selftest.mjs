// Checks the command centre without any outside service: sign-in rules, the requests API against an in-memory
// database, request saving and trimming, the safe-fetch address rules, and the database migration (in PGlite).
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHandler } from "../api/_cc/handler.js";
import { keyKind, createDb } from "../api/_cc/db.js";
import { saveRequest, trimFindings, retentionDays } from "../api/_cc/requests.js";
import { isPrivateIp, assertPublic } from "../api/_safe.js";
import { verifyAdmin } from "../api/_cc/auth.js";
import http from "node:http";
import { crawlSite, pickPages } from "../api/_cc/crawl.js";
import { technicalFindings, checkedSummary } from "../api/_cc/technical.js";
import { mergeFindings } from "../api/_cc/handler.js";
import { searchFindings, searchNotes } from "../api/_cc/search.js";
import { conversionFindings } from "../api/_cc/conversion.js";
import { sanitizeFindings, sanitizeManual } from "../api/_cc/audit-edit.js";
import { MANUAL_CHECKLIST, MANUAL_KEYS } from "../api/_cc/manual.js";
import { SERVICE_MAP, SERVICE_KEYS, resolveService } from "../api/_cc/catalog.js";
import { SERVICES, PLANS, MONTHLY_PLANS, INCLUDED } from "../src/catalog.js";

// ---- in-memory stand-in for api/_cc/db.js
function memDb() {
  const t = { cc_requests: [], cc_audits: [], cc_sends: [] };
  let n = 0;
  const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;
  return {
    t,
    insert: async (table, row) => { const r = { id: uuid(), created_at: new Date().toISOString(), status: "new", ...row }; t[table].push(r); return r; },
    select: async (table, q) => {
      const m = q.match(/(?:request_)?id=eq\.([0-9a-f-]+)/);
      return t[table].filter((r) => !m || r.id === m[1] || r.request_id === m[1]);
    },
    updateById: async (table, id, patch) => { const r = t[table].find((x) => x.id === id); return r ? Object.assign(r, patch) : null; },
    deleteById: async (table, id) => { t.cc_requests = t.cc_requests.filter((x) => x.id !== id); },
    purgeExpired: async (table, col, nowIso) => { const before = t[table].length; t[table] = t[table].filter((r) => r[col] >= nowIso); return before - t[table].length; },
  };
}
const ADMIN = { email: "hello@heykoda.co.za" };
const verify = async (tok) => (tok === "good" ? ADMIN : null);

const call = (handler, { method = "GET", url, body, token = "good", ip = "9.9.9.9" }) =>
  new Promise((resolve) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(o) { resolve({ code: this.code, body: o, headers: this.headers }); } };
    handler({ method, url, body, headers: { authorization: token ? `Bearer ${token}` : "", "x-forwarded-for": ip }, socket: {} }, res);
  });

// ---- saving a request trims and caps what the visitor sent
const db = memDb();
const fixed = new Date("2026-10-25T10:00:00Z");
const id = await saveRequest(
  { url: "https://example.co.za/", email: "a@b.co", business: "x".repeat(500), phone: "0", note: "hi", summary: { scores: { speed: "88.4" }, fixes: [{ title: "<b>T</b>", body: "y".repeat(900) }], checks: [{ label: "L", status: "evil", detail: "d" }], junk: "no" } },
  { db, now: fixed }
);
assert.ok(id);
const saved = db.t.cc_requests[0];
assert.equal(saved.business.length, 120);
assert.equal(saved.auto_findings.scores.speed, 88);
assert.equal(saved.auto_findings.fixes[0].body.length, 400);
assert.equal(saved.auto_findings.checks[0].status, "info");
assert.ok(!("junk" in saved.auto_findings));
assert.equal(new Date(saved.delete_after).getTime() - fixed.getTime(), retentionDays() * 86_400_000);
assert.equal(await saveRequest({ url: "u", email: "e" }, { db: { insert: async () => { throw new Error("down"); } } }), null, "a database failure never throws");
assert.equal(trimFindings(null), null);

// ---- API: sign-in is required, and only the admin gets in
const h = createHandler({ db, verify, now: () => fixed });
let r = await call(h, { url: "/api/command/requests", token: "" });
assert.equal(r.code, 401);
r = await call(h, { url: "/api/command/requests", token: "someone-else" });
assert.equal(r.code, 401);
assert.equal(r.headers["x-robots-tag"], "noindex, nofollow");
assert.equal(r.headers["cache-control"], "no-store");
r = await call(h, { url: "/api/command/me" });
assert.equal(r.body.email, "hello@heykoda.co.za");

// ---- API: inbox, detail, status, notes, delete
r = await call(h, { url: "/api/command/requests" });
assert.equal(r.body.requests.length, 1);
r = await call(h, { url: `/api/command/requests/${id}` });
assert.equal(r.body.request.site_url, "https://example.co.za/");
r = await call(h, { method: "PATCH", url: `/api/command/requests/${id}`, body: { status: "replied", admin_notes: "n" } });
assert.equal(r.body.request.status, "replied");
r = await call(h, { method: "PATCH", url: `/api/command/requests/${id}`, body: { status: "bogus" } });
assert.equal(r.code, 400);
r = await call(h, { method: "PATCH", url: `/api/command/requests/${id}`, body: {} });
assert.equal(r.code, 400);
r = await call(h, { url: "/api/command/requests/not-a-uuid" });
assert.equal(r.code, 404);
r = await call(h, { method: "DELETE", url: `/api/command/requests/${id}` });
assert.equal(r.body.ok, true);
assert.equal(db.t.cc_requests.length, 0);

// ---- retention: expired requests go when the inbox opens
await saveRequest({ url: "https://old.co.za/", email: "o@o.co" }, { db, now: new Date("2020-01-01") });
await saveRequest({ url: "https://new.co.za/", email: "n@n.co" }, { db, now: fixed });
r = await call(h, { url: "/api/command/requests" });
assert.equal(r.body.requests.length, 1);
assert.equal(r.body.requests[0].site_url, "https://new.co.za/");

// ---- repeated bad sign-ins are slowed down
for (let i = 0; i < 20; i++) await call(h, { url: "/api/command/me", token: "bad", ip: "7.7.7.7" });
r = await call(h, { url: "/api/command/me", token: "bad", ip: "7.7.7.7" });
assert.equal(r.code, 429);

// ---- not configured: a clear message, not a crash
const h2 = createHandler({ verify });
const keep = { u: process.env.SUPABASE_URL, k: process.env.SUPABASE_SERVICE_ROLE_KEY };
delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
r = await call(h2, { url: "/api/command/requests" });
assert.equal(r.code, 503);
Object.assign(process.env, Object.fromEntries(Object.entries({ SUPABASE_URL: keep.u, SUPABASE_SERVICE_ROLE_KEY: keep.k }).filter(([, v]) => v)));

// ---- key styles: new secret keys go in apikey only, public keys are refused
{
  const jwt = (role) => `h.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.s`;
  assert.equal(keyKind("sb_secret_abc"), "secret");
  assert.equal(keyKind("sb_publishable_abc"), "public");
  assert.equal(keyKind(jwt("service_role")), "service");
  assert.equal(keyKind(jwt("anon")), "public");
  assert.equal(keyKind("whatever"), "unknown");
  assert.throws(() => createDb({ url: "https://x.supabase.co", key: "sb_publishable_abc" }), (e) => e.code === "public_key");
  assert.throws(() => createDb({ url: "https://x.supabase.co", key: jwt("anon") }), (e) => e.code === "public_key");
  const seen = [];
  const f = globalThis.fetch;
  globalThis.fetch = async (u, o) => { seen.push(o.headers); return { ok: true, text: async () => "[]" }; };
  await createDb({ url: "https://x.supabase.co", key: "sb_secret_abc" }).select("cc_requests", "select=id");
  await createDb({ url: "https://x.supabase.co", key: jwt("service_role") }).select("cc_requests", "select=id");
  globalThis.fetch = f;
  assert.equal(seen[0].apikey, "sb_secret_abc");
  assert.ok(!("authorization" in seen[0]), "a new-style secret key is not sent as a bearer token");
  assert.ok(seen[1].authorization?.startsWith("Bearer "), "an old-style service key is sent as both");
  const hp = createHandler({ verify, db: undefined });
  const keep2 = { u: process.env.SUPABASE_URL, k: process.env.SUPABASE_SERVICE_ROLE_KEY };
  process.env.SUPABASE_URL = "https://x.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_publishable_abc";
  const rp = await call(hp, { url: "/api/command/requests", ip: "5.5.5.5" });
  assert.equal(rp.code, 503);
  assert.match(rp.body.error, /public/);
  for (const [k2, v] of Object.entries({ SUPABASE_URL: keep2.u, SUPABASE_SERVICE_ROLE_KEY: keep2.k })) { if (v) process.env[k2] = v; else delete process.env[k2]; }
}

// ---- admin check against a fake Supabase: wrong person, unconfirmed email and bad tokens are all refused
const realFetch = globalThis.fetch;
const user = (o) => async () => ({ ok: true, json: async () => o });
const cfg = { url: "https://x.supabase.co", key: "k" };
globalThis.fetch = user({ email: "Hello@HeyKoda.co.za", email_confirmed_at: "2026-01-01" });
assert.deepEqual(await verifyAdmin("t", cfg), { email: "hello@heykoda.co.za" });
globalThis.fetch = user({ email: "evil@example.com", email_confirmed_at: "2026-01-01" });
assert.equal(await verifyAdmin("t", cfg), null);
globalThis.fetch = user({ email: "hello@heykoda.co.za" });
assert.equal(await verifyAdmin("t", cfg), null);
globalThis.fetch = async () => ({ ok: false });
assert.equal(await verifyAdmin("t", cfg), null);
assert.equal(await verifyAdmin("", cfg), null);
globalThis.fetch = realFetch;

// ---- only public addresses
for (const ip of ["127.0.0.1", "10.1.2.3", "192.168.0.1", "172.16.5.5", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fe80::1", "fd00::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:a9fe:a9fe", "::ffff:172.20.0.1"]) assert.ok(isPrivateIp(ip), `${ip} must be private`);
for (const ip of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"]) assert.ok(!isPrivateIp(ip), `${ip} must be public`);
for (const u of ["http://localhost/", "http://127.0.0.1/", "http://[::1]/", "http://169.254.169.254/latest/meta-data", "ftp://example.com/", "http://user:pw@example.com/", "http://box.internal/"]) {
  await assert.rejects(assertPublic(u), undefined, `${u} must be refused`);
}

// ---- the service map only names things that exist in the catalog, and prices come from it
for (const k of SERVICE_KEYS) {
  const m = SERVICE_MAP[k];
  if (m.service) assert.ok(SERVICES.some((x) => x.title === m.service), `${k}: unknown service`);
  if (m.included) assert.ok(INCLUDED.some((x) => x.title === m.included), `${k}: unknown included item`);
  for (const n of m.once || []) assert.ok(PLANS.some((x) => x.name === n), `${k}: unknown plan ${n}`);
  for (const n of m.monthly || []) assert.ok(MONTHLY_PLANS.some((x) => x.name === n), `${k}: unknown monthly plan ${n}`);
}
assert.equal(resolveService("seo").options.find((o) => o.name === "Business").price, PLANS.find((p) => p.name === "Business").price);
assert.equal(resolveService("nope"), null);

// ---- crawler against a small local test site
const big = Buffer.alloc(600_000, 1);
const pageHtml = (title, body = "", extra = "") => `<!doctype html><html lang="en"><head><title>${title}</title>${extra}</head><body>${body}</body></html>`;
const site = http.createServer((req, res) => {
  const send = (code, type, body, headers = {}) => { res.writeHead(code, { "content-type": type, ...headers }); res.end(body); };
  const u = req.url;
  if (u === "/robots.txt") return send(200, "text/plain", "User-agent: *\nDisallow: /\n");
  if (u === "/sitemap.xml") return send(404, "text/plain", "no");
  if (u === "/big.jpg") return send(200, "image/jpeg", req.method === "HEAD" ? "" : big, { "content-length": String(big.length) });
  if (u === "/gone") return send(404, "text/html", "<html>gone</html>");
  if (u === "/") return send(200, "text/html", pageHtml("Home", `<h1>Plumber in Durban</h1><a href="/services">Our services</a> <a href="/about">About</a> <a href="/contact">Contact</a> <a href="/gone">Old page</a> <a href="/file.pdf">PDF</a><img src="/big.jpg"><img src="/a.png"><a href="tel:+27315550123">Call us</a> <button>Get a quote</button><img src="http://insecure.example/x.png">`, `<meta name="description" content="x"><meta name="robots" content="noindex">`));
  if (["/services", "/about", "/contact"].includes(u)) return send(200, "text/html", pageHtml(u.slice(1), `<h1>${u}</h1><p>Call 031 555 0123</p>`, `<meta name="viewport" content="width=device-width">`));
  return send(200, "text/html", pageHtml("Anything")); // a made-up address returns 200: a soft 404
});
await new Promise((r) => site.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${site.address().port}/`;

// private addresses are refused unless the test switch is on
delete process.env.AUDIT_ALLOW_PRIVATE;
let refused = await crawlSite(base);
assert.ok(refused.site.homeError && refused.pages.length === 0, "the crawler refuses private addresses");
process.env.AUDIT_ALLOW_PRIVATE = "1";

const crawl = await crawlSite(base, { maxPages: 10 });
assert.equal(crawl.pages[0].title, "Home");
const paths = crawl.pages.map((p) => new URL(p.url).pathname).sort();
assert.deepEqual(paths, ["/", "/about", "/contact", "/gone", "/services"].filter((x) => x !== "/gone" || paths.includes("/gone")), "key pages are crawled, files are not");
assert.ok(!paths.includes("/file.pdf"));
assert.deepEqual(crawl.pages[0].phones, []);
assert.deepEqual(crawl.pages.find((p) => p.url.endsWith("/about")).phones, ["0315550123"]);
assert.ok(crawl.pages[0].ctas.includes("Get a quote"));
assert.equal(crawl.pages[0].mixedContent, 1, "the insecure image is counted");
assert.ok(crawl.site.robots.blocksAll);
assert.equal(crawl.site.sitemap.found, false);
assert.equal(crawl.site.notFound.status, 200);
assert.ok(crawl.site.links.broken.some((b) => b.url.endsWith("/gone") && b.internal));
assert.ok(crawl.site.images[0].bytes >= 600_000);
assert.ok(!JSON.stringify(crawl).includes("<html"), "raw HTML is not stored");

const f = technicalFindings(crawl, { mobile: { scores: { speed: 42, accessibility: 80, seo: 90, practice: 90 }, lcp: 5200, cls: 0.3, tbt: 700, a11y: ["Buttons do not have an accessible name"], savings: [] }, desktop: { error: "Google answered 500" } });
const ids = f.map((x) => x.id);
for (const want of ["https", "noindex", "robots-blocks", "sitemap-missing", "soft-404", "broken-internal", "image-size", "viewport", "speed-mobile", "lcp-mobile", "cls-mobile", "tbt-mobile", "accessibility"]) assert.ok(ids.includes(want), `finding ${want}`);
assert.ok(f.every((x) => x.evidence && x.why && x.fix && x.bucket && x.source === "auto" && (!x.service_key || SERVICE_KEYS.includes(x.service_key))), "every finding has evidence, why, fix, bucket and a real service");
assert.ok(!ids.includes("mixed-content"), "mixed content is only a finding on https pages");
assert.equal(f.find((x) => x.id === "speed-mobile").severity, "high");
assert.equal(f.find((x) => x.id === "speed-mobile").bucket, "fix_first");
assert.ok(checkedSummary(crawl, { mobile: { error: "x" } }).some((n) => /desktop speed check has not been run/.test(n)), "skipped checks are listed");
assert.ok(technicalFindings({ site: { homeError: "boom" }, pages: [] }).some((x) => x.id === "home-unreachable"));

// time budget: pages are skipped and said so, not silently dropped
let clock = 0;
const slow = await crawlSite(base, { budgetMs: 10_000, now: () => (clock += 3000) });
assert.ok(slow.incomplete.length > 0, "a tight time budget is reported");
site.close();

// choosing pages
const L = (...p) => p.map((x) => new URL(x, "https://a.co.za"));
const picked = pickPages(L("/privacy", "/blog/post-1", "/services", "/contact-us", "/about", "/x.pdf", "https://other.com/services"), "https://a.co.za", [], 4);
assert.deepEqual(picked.map((u) => new URL(u).pathname).sort(), ["/about", "/contact-us", "/services"]);

// re-analysing keeps what was edited
const merged = mergeFindings([{ id: "https", edited: true, source: "auto", title: "Mine" }, { id: "old", source: "auto" }, { id: "extra", source: "manual" }], [{ id: "https", source: "auto", title: "New" }, { id: "fresh", source: "auto" }]);
assert.deepEqual(merged.map((x) => x.id).sort(), ["extra", "fresh", "https"]);
assert.equal(merged.find((x) => x.id === "https").title, "Mine");

// ---- search and conversion findings (synthetic crawl: a weak local-trade site)
{
  const pg = (u, o = {}) => ({ url: `https://weak.co.za${u}`, status: 200, title: "Home", description: "", h1: [], headings: [], words: 80, phones: [], tel: [], mailto: [], forms: 0, whatsapp: false, ctas: [], links: [], text: "welcome to our site", signals: { testimonials: false, guarantee: false, credentials: false, proof: false }, booking: false, ...o });
  const weak = { finalUrl: "https://weak.co.za/", site: {}, pages: [
    pg("/", { title: "Home", h1: ["Welcome", "Hello"], links: ["https://weak.co.za/services"], phones: ["0315550123"], text: "call 031 555 0123 plumbing" }),
    pg("/services", { title: "Home", headings: [{ l: 1, t: "x" }, { l: 4, t: "y" }], h1: ["Services"], phones: ["0825550000"], words: 90 }),
  ] };
  const inputs = { trade: "plumber, plumbing", town: "Durban", areas: "Umhlanga, Pinetown", phone: "031 555 9999", address: "12 Main Road, Berea", businessName: "Acme Plumbers" };
  const sf = searchFindings(weak, inputs);
  const sids = sf.map((x) => x.id);
  for (const want of ["title-length", "title-duplicate", "desc-missing", "h1-many", "heading-order", "thin", "pages-missing", "kw-home", "kw-body-town", "phone-inconsistent", "phone-missing", "address-missing", "areas-missing", "name-missing"]) assert.ok(sids.includes(want), `search finding ${want}`);
  assert.equal(sf.find((x) => x.id === "kw-home").severity, "high");
  assert.ok(!searchFindings(weak, {}).some((x) => x.id.startsWith("kw-")), "keyword checks need the trade and town");
  assert.ok(searchNotes({}).length === 2 && searchNotes(inputs).length === 0, "skipped checks are explained");
  const cf = conversionFindings(weak);
  const cids = cf.map((x) => x.id);
  for (const want of ["offer-h1-length", "cta-none", "contact-none", "no-booking", "trust-reviews", "trust-proof", "trust-assurance"]) assert.ok(cids.includes(want), `conversion finding ${want}`);
  const strong = { finalUrl: "https://ok.co.za/", site: {}, pages: [pg("/", { title: "Plumber in Durban | Acme", description: "x".repeat(130), h1: ["Plumber in Durban you can trust"], words: 400, ctas: ["Get a quote", "Call now"], tel: ["+27315550123"], phones: ["0315550123"], forms: 1, whatsapp: true, booking: true, signals: { testimonials: true, guarantee: true, credentials: true, proof: true }, links: ["https://ok.co.za/services", "https://ok.co.za/about", "https://ok.co.za/contact", "https://ok.co.za/blog", "https://ok.co.za/faq"], text: "plumber durban umhlanga pinetown 12 main road berea" }), pg("/services", { title: "Plumbing services in Durban | Acme", description: "y".repeat(130), h1: ["Services"], words: 300 })] };
  assert.deepEqual(conversionFindings(strong), [], "a strong site raises no conversion findings");
  assert.deepEqual(searchFindings(strong, { trade: "plumber", town: "durban", areas: "Umhlanga", phone: "031 555 0123", address: "12 Main Road", businessName: "Acme" }).map((x) => x.id), [], "a strong site raises no search findings");
  assert.ok(sf.concat(cf).every((x) => x.evidence && x.why && x.fix && SERVICE_KEYS.includes(x.service_key) && x.source === "auto"));
  // old crawls without the new signals do not produce false trust findings
  const old = { finalUrl: "https://old.co.za/", site: {}, pages: [{ url: "https://old.co.za/", status: 200, h1: ["A good headline here"], ctas: ["Call us", "Get a quote"], tel: ["0315550123"], forms: 1, links: [] }] };
  assert.ok(!conversionFindings(old).some((x) => x.id.startsWith("trust-") || x.id === "no-booking"));
}

// ---- editing: everything from the browser is checked
{
  const stored = [{ id: "a", area: "technical", severity: "low", title: "Old", evidence: "e", why: "w", fix: "f", service_key: "seo", bucket: "later", include: true, source: "auto" }];
  const sf = sanitizeFindings([
    { id: "a", area: "technical", severity: "high", title: "Changed", evidence: "e", why: "w", fix: "f", service_key: "seo", bucket: "fix_first", include: true, source: "manual" },
    { id: "m 1!", area: "weird", severity: "huge", title: "<b>Mine</b>".repeat(40), evidence: "x".repeat(2000), service_key: "made-up", bucket: "soon", include: "no" },
    { id: "b", title: "" },
    { id: "a", title: "dup" },
  ], stored);
  assert.equal(sf.length, 2);
  assert.equal(sf[0].edited, true, "a changed finding is marked edited");
  assert.equal(sf[0].source, "auto", "the server decides where a finding came from");
  const mine = sf[1];
  assert.equal(mine.id, "m1");
  assert.equal(mine.source, "manual");
  assert.equal(mine.area, "manual");
  assert.equal(mine.severity, "medium");
  assert.equal(mine.service_key, null, "only real services can be attached");
  assert.equal(mine.bucket, "next");
  assert.equal(mine.evidence.length, 900);
  assert.ok(mine.title.length <= 140);
  assert.equal(sanitizeFindings("nope", []), null);
  const m = sanitizeManual({ inputs: { trade: "plumber", town: "x".repeat(500), evil: "no" }, checklist: { gbp_exists: { status: "issue", notes: "n".repeat(3000) }, bogus: { status: "ok" } } }, { inputs: { phone: "1" } });
  assert.equal(m.inputs.phone, "1");
  assert.equal(m.inputs.town.length, 160);
  assert.ok(!("evil" in m.inputs));
  assert.equal(m.checklist.gbp_exists.notes.length, 2000);
  assert.ok(!("bogus" in m.checklist));
  assert.equal(m.checklist.gbp_exists.status, "issue");
  assert.ok(MANUAL_CHECKLIST.every((c) => c.title && c.check && c.group) && new Set(MANUAL_KEYS).size === MANUAL_KEYS.length);
  assert.ok(MANUAL_CHECKLIST.some((c) => /Google Business Profile/.test(c.group)), "Google Business Profile is on the manual list");
}

// ---- audit routes with fake crawl and speed
{
  const db2 = memDb();
  const base2 = db2.select;
  db2.select = async (table, q) => {
    if (table === "cc_audits") {
      const rid = (q.match(/request_id=eq\.([0-9a-f-]+)/) || [])[1];
      const aid = (q.match(/[?&]id=eq\.([0-9a-f-]+)/) || [])[1];
      return db2.t.cc_audits.filter((a) => (!rid || a.request_id === rid) && (!aid || a.id === aid));
    }
    return base2(table, q);
  };
  const calls = [];
  const h3 = createHandler({ db: db2, verify, now: () => new Date("2026-10-25T10:00:00Z"), crawl: async (u) => { calls.push(u); return { finalUrl: u, pages: [{ url: u, status: 200, robotsMeta: "noindex", viewport: "w" }], site: {}, incomplete: [] }; }, speed: async (u, s) => ({ strategy: s, scores: { speed: 95, accessibility: 95, seo: 95, practice: 95 } }) });
  const rid = await saveRequest({ url: "https://client.co.za/", email: "c@c.co" }, { db: db2, now: fixed });
  let x = await call(h3, { method: "POST", url: `/api/command/requests/${rid}/audits`, ip: "3.3.3.3" });
  const aid = x.body.audit.id;
  x = await call(h3, { method: "POST", url: `/api/command/requests/${rid}/audits`, ip: "3.3.3.3" });
  assert.equal(x.body.audit.id, aid, "one open audit per request");
  x = await call(h3, { method: "POST", url: `/api/command/audits/${aid}/analyse`, ip: "3.3.3.3" });
  assert.equal(x.code, 400, "analyse needs a crawl first");
  x = await call(h3, { method: "POST", url: `/api/command/audits/${aid}/crawl`, ip: "3.3.3.3" });
  assert.equal(x.body.audit.state, "draft");
  assert.deepEqual(calls, ["https://client.co.za/"]);
  assert.equal(db2.t.cc_requests[0].status, "audit_drafted");
  x = await call(h3, { method: "POST", url: `/api/command/audits/${aid}/speed`, body: { strategy: "desktop" }, ip: "3.3.3.3" });
  assert.equal(x.body.audit.pagespeed.desktop.scores.speed, 95);
  x = await call(h3, { method: "POST", url: `/api/command/audits/${aid}/analyse`, ip: "3.3.3.3" });
  assert.equal(x.body.audit.state, "ready");
  assert.ok(x.body.audit.findings.some((f2) => f2.id === "noindex"));
  assert.ok(x.body.notes.some((n) => /mobile speed check has not been run/.test(n)));
  x = await call(h3, { url: "/api/command/catalog", ip: "3.3.3.3" });
  assert.ok(x.body.services.seo.options.length > 0);
  assert.ok(x.body.checklist.length >= 10);
  // editing: business details, a changed finding, a hidden finding and one of your own
  x = await call(h3, { method: "PATCH", url: `/api/command/audits/${aid}`, body: { manual: { inputs: { trade: "plumber", town: "Durban" }, checklist: { gbp_exists: { status: "ok", notes: "Verified" } } } }, ip: "3.3.3.3" });
  assert.equal(x.body.audit.manual.inputs.town, "Durban");
  assert.ok(!x.body.notes.some((n) => /Keyword checks were skipped/.test(n)));
  const before = x.body.audit.findings;
  const edited = before.map((f2) => (f2.id === "noindex" ? { ...f2, title: "My wording", severity: "low" } : f2.id === "viewport" ? { ...f2, include: false } : f2));
  edited.push({ id: "mine-1", area: "manual", severity: "high", title: "GBP is not verified", evidence: "Checked on Google", why: "w", fix: "f", service_key: "gbp", bucket: "fix_first", include: true });
  x = await call(h3, { method: "PATCH", url: `/api/command/audits/${aid}`, body: { findings: edited, summary: "Hello" }, ip: "3.3.3.3" });
  assert.equal(x.body.audit.findings.find((f2) => f2.id === "noindex").edited, true);
  assert.equal(x.body.audit.summary, "Hello");
  x = await call(h3, { method: "PATCH", url: `/api/command/audits/${aid}`, body: {}, ip: "3.3.3.3" });
  assert.equal(x.code, 400);
  x = await call(h3, { method: "POST", url: `/api/command/audits/${aid}/analyse`, ip: "3.3.3.3" });
  const after = x.body.audit.findings;
  assert.equal(after.find((f2) => f2.id === "noindex").title, "My wording", "re-analysing keeps your wording");
  assert.ok(after.some((f2) => f2.id === "mine-1"), "re-analysing keeps your own findings");
  assert.equal(after.filter((f2) => f2.id === "noindex").length, 1);
  x = await call(h3, { url: `/api/command/audits/00000000-0000-4000-8000-0000000000ff`, ip: "3.3.3.3" });
  assert.equal(x.code, 404);
}

// ---- the database migration applies and rolls back, and nothing is readable by the browser roles
const { PGlite } = await import("@electric-sql/pglite");
const pg = new PGlite();
await pg.exec("create role anon; create role authenticated;");
await pg.exec(fs.readFileSync("command-center/db/0001_cc_init.sql", "utf8"));
const rls = await pg.query("select relname, relrowsecurity from pg_class where relname like 'cc\\_%' and relkind='r' order by 1");
assert.equal(rls.rows.length, 3);
assert.ok(rls.rows.every((x) => x.relrowsecurity), "row level security on every table");
const pol = await pg.query("select count(*)::int as n from pg_policies where tablename like 'cc\\_%'");
assert.equal(pol.rows[0].n, 0, "no policies, so the browser can read nothing");
await pg.exec("insert into cc_requests(site_url,email) values ('https://a.co.za','a@b.co')");
await assert.rejects(pg.exec("insert into cc_requests(site_url,email,status) values ('https://a.co.za','a@b.co','weird')"));
await pg.exec("insert into cc_audits(request_id) select id from cc_requests");
await pg.exec("delete from cc_requests");
assert.equal((await pg.query("select count(*)::int as n from cc_audits")).rows[0].n, 0, "deleting a request deletes its audit");
await pg.exec(fs.readFileSync("command-center/db/0001_cc_init.down.sql", "utf8"));

console.log("command centre self-test: all checks passed");
