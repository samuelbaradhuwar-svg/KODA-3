// Checks api/audit.js without any outside services: a local test page, the safety rules and the request handling.
import http from "node:http";
import assert from "node:assert/strict";
process.env.AUDIT_ALLOW_PRIVATE = "1";
process.env.AUDIT_MODE = "live";
const { default: handler, normaliseUrl, buildReport } = await import("../api/audit.js");

const page = `<!doctype html><html lang="en"><head><title>Plumber in Durban | Test Co</title>
<meta name="viewport" content="width=device-width"><meta name="description" content="${"A fair description of the business that is long enough. ".repeat(2)}">
<script type="application/ld+json">{}</script></head><body><h1>Hello</h1><img src="a.png"><img src="b.png" alt="b"><a href="tel:+27000000000">Call</a></body></html>`;
const server = http.createServer((req, res) => {
  if (req.url === "/robots.txt") return res.end("User-agent: *");
  if (req.url === "/sitemap.xml") return res.end("<urlset></urlset>");
  res.setHeader("content-type", "text/html");
  res.end(page);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const call = (body, ip = "1.1.1.1") =>
  new Promise((resolve) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(o) { resolve({ code: this.code, body: o }); } };
    handler({ method: "POST", headers: { "x-forwarded-for": ip }, body, socket: {} }, res);
  });

// normalising
assert.equal(normaliseUrl("example.co.za"), "https://example.co.za/");
assert.equal(normaliseUrl("nonsense"), null);

// validation
assert.equal((await call({ url: "", email: "a@b.co", consent: true }, "2.2.2.2")).code, 400);
assert.equal((await call({ url: "example.co.za", email: "bad", consent: true }, "2.2.2.3")).body.field, "email");
assert.equal((await call({ url: "example.co.za", email: "a@b.co", consent: false }, "2.2.2.4")).body.field, "consent");
assert.equal((await call({ url: "x.co.za", email: "a@b.co", consent: true, company: "bot" }, "2.2.2.5")).code, 200);

// a real run against the local page (Google and email are not reachable here, so those parts are skipped)
const ok = await call({ url: base, email: "me@example.co.za", consent: true, business: "Test Co" }, "3.3.3.3");
assert.equal(ok.code, 200, JSON.stringify(ok.body));
const r = ok.body.report;
const by = Object.fromEntries(r.checks.map((c) => [c.id, c.status]));
assert.equal(by.title, "pass");
assert.equal(by.viewport, "pass");
assert.equal(by.h1, "pass");
assert.equal(by.schema, "pass");
assert.equal(by.contact, "pass");
assert.equal(by.sitemap, "pass");
assert.equal(by.https, "fail"); // the local test page is plain http
assert.ok(r.topFixes.length >= 1);
assert.equal(r.speedCheckAvailable, false);

// private addresses are refused when the test switch is off
delete process.env.AUDIT_ALLOW_PRIVATE;
const blocked = await call({ url: "http://127.0.0.1:1", email: "me@example.co.za", consent: true }, "4.4.4.4");
assert.equal(blocked.code, 422);
const meta = await call({ url: "http://169.254.169.254/latest/meta-data", email: "me@example.co.za", consent: true }, "4.4.4.5");
assert.equal(meta.code, 422);

// rate limit: the 6th request from one address in an hour is refused
let last;
for (let i = 0; i < 6; i++) last = await call({ url: "", email: "a@b.co", consent: true }, "5.5.5.5");
assert.equal(last.code, 429);

server.close();
console.log("audit self-test: all checks passed");
