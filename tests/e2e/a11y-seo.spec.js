import fs from "node:fs";
import { test, expect } from "@playwright/test";
import { ROUTES, SITE } from "./routes.js";

for (const route of ROUTES) {
  test.describe(`${route.path} accessibility basics`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route.path, { waitUntil: "networkidle" });
    });

    test("has a language, one h1 and no skipped heading levels", async ({ page }) => {
      await expect(page.locator("html")).toHaveAttribute("lang", /^[a-z]{2}/i);
      await expect(page.locator("h1")).toHaveCount(1);
      const levels = await page.$$eval("h1,h2,h3,h4,h5,h6", (hs) => hs.map((h) => Number(h.tagName[1])));
      const skips = levels.filter((l, i) => i > 0 && l > levels[i - 1] + 1);
      expect(skips, `Heading order: ${levels.join(" ")}`).toEqual([]);
    });

    test("every image has alt text (empty allowed for decorative images)", async ({ page }) => {
      const missing = await page.$$eval("img", (imgs) => imgs.filter((i) => !i.hasAttribute("alt")).map((i) => i.src));
      expect(missing).toEqual([]);
    });

    test("every visible button and link has an accessible name", async ({ page }) => {
      const unnamed = await page.$$eval("a[href], button, [role=button]", (els) =>
        els
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height || el.closest("[aria-hidden=true]")) return false;
            const label =
              el.getAttribute("aria-label") ||
              (el.getAttribute("aria-labelledby") || "")
                .split(" ")
                .map((id) => document.getElementById(id)?.textContent || "")
                .join(" ") ||
              el.textContent ||
              el.getAttribute("title") ||
              [...el.querySelectorAll("img[alt]")].map((i) => i.alt).join(" ");
            return !label.trim();
          })
          .map((el) => el.outerHTML.slice(0, 120))
      );
      expect(unnamed).toEqual([]);
    });

    test("hidden menus do not leave focusable controls on screen", async ({ page }) => {
      const exposed = await page.$$eval("[aria-hidden=true] a[href], [aria-hidden=true] button", (els) =>
        els.filter((el) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && !el.closest("[inert]");
        }).length
      );
      expect(exposed).toBe(0);
    });

    test("zoom is not disabled", async ({ page }) => {
      const viewport = await page.getAttribute('meta[name="viewport"]', "content");
      expect(viewport).not.toMatch(/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/);
    });

    test("every form control has a label", async ({ page }) => {
      const unlabeled = await page.$$eval("input:not([type=hidden]), select, textarea", (els) =>
        els
          .filter((el) => !(el.labels?.length || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")))
          .map((el) => el.outerHTML.slice(0, 120))
      );
      expect(unlabeled).toEqual([]);
    });
  });

  test.describe(`${route.path} SEO basics`, () => {
    test("title, description, canonical, Open Graph and JSON-LD are present and correct", async ({ page }) => {
      await page.goto(route.path);
      const title = await page.title();
      expect(title.length, "title length").toBeGreaterThan(10);
      expect(title.length, "title length").toBeLessThanOrEqual(65);
      const description = await page.getAttribute('meta[name="description"]', "content");
      expect(description?.length ?? 0, "description length").toBeGreaterThan(50);
      expect(description?.length ?? 0, "description length").toBeLessThanOrEqual(200);
      const canonical = await page.getAttribute('link[rel="canonical"]', "href");
      expect(canonical).toBe(route.path === "/" ? `${SITE}/` : `${SITE}${route.path}`);
      for (const prop of ["og:title", "og:description", "og:image", "og:url"]) {
        expect(await page.getAttribute(`meta[property="${prop}"]`, "content"), prop).toBeTruthy();
      }
      expect(await page.getAttribute('meta[property="og:url"]', "content")).toBe(canonical);
      const blocks = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent));
      for (const b of blocks) expect(() => JSON.parse(b)).not.toThrow();
    });
  });
}

test("titles and descriptions are unique across pages", async ({ page }) => {
  const seen = { titles: new Set(), descriptions: new Set() };
  for (const route of ROUTES) {
    await page.goto(route.path);
    seen.titles.add(await page.title());
    seen.descriptions.add(await page.getAttribute('meta[name="description"]', "content"));
  }
  expect(seen.titles.size).toBe(ROUTES.length);
  expect(seen.descriptions.size).toBe(ROUTES.length);
});

test("robots.txt and sitemap.xml are served and list every route", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const expected = ROUTES.map((r) => (r.path === "/" ? `${SITE}/` : `${SITE}${r.path}`));
  expect(locs.sort()).toEqual(expected.sort());
});

test("tests/e2e/routes.js matches PAGES in src/App.jsx", () => {
  const src = fs.readFileSync("src/App.jsx", "utf8");
  const block = src.slice(src.indexOf("export const PAGES"), src.indexOf("};", src.indexOf("export const PAGES")));
  const pages = [...block.matchAll(/^\s*"(\/[^"]*)":\s*\{/gm)].map((m) => m[1]);
  expect(pages.sort()).toEqual(ROUTES.map((r) => r.path).sort());
});
