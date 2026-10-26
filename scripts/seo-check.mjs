// Checks that keep two things from drifting: page descriptions stay a sensible length, and the security policy
// allows exactly the inline scripts the built pages contain. Run after `npm run build`.
import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

// 1. every page description is 120 to 160 characters (read from src/content.js without importing images)
const src = fs.readFileSync("src/content.js", "utf8");
const block = src.slice(src.indexOf("export const PAGES"), src.indexOf("export { BUSINESS"));
const pages = [...block.matchAll(/"(\/[^"]*)":\s*\{\s*title:\s*"([^"]+)",\s*description:\s*"([^"]+)"/g)].map((m) => ({ route: m[1], title: m[2], description: m[3] }));
assert.ok(pages.length >= 6, `expected at least 6 pages, found ${pages.length}`);
for (const p of pages) {
  assert.ok(p.description.length >= 120 && p.description.length <= 160, `${p.route} description is ${p.description.length} characters (want 120 to 160)`);
  assert.ok(p.title.length <= 60, `${p.route} title is ${p.title.length} characters (want 60 or fewer)`);
}

// 2. the content security policy lists the hash of every inline script in the built pages
const vercel = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
const csp = vercel.headers.flatMap((h) => h.headers).find((h) => h.key === "Content-Security-Policy")?.value || "";
assert.ok(csp, "vercel.json has no Content-Security-Policy");
for (const file of ["dist/index.html", "dist/command.html"]) {
  const html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)) {
    const hash = `'sha256-${crypto.createHash("sha256").update(m[1]).digest("base64")}'`;
    assert.ok(csp.includes(hash), `${file} has an inline script whose hash ${hash} is not in the Content-Security-Policy`);
  }
}
for (const need of ["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy"]) {
  assert.ok(vercel.headers.some((h) => h.source === "/(.*)" && h.headers.some((x) => x.key === need)), `missing ${need} on all pages`);
}
console.log(`seo check passed (${pages.length} pages, policy hashes match)`);
