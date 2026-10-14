// Features that already work on the live site and must keep working. Add a test here whenever a
// feature is added that a future change could break.
import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("navbar links scroll to their sections", async ({ page }) => {
    for (const [label, id] of [["Pricing", "pricing"], ["Contact", "contact"], ["Portfolio", "portfolio"]]) {
      await page.getByRole("navigation").getByRole("button", { name: label, exact: true }).first().click();
      await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.2 });
    }
  });

  test("all main sections are present", async ({ page }) => {
    for (const id of ["home", "advantage", "portfolio", "process", "services", "about", "pricing", "contact"]) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test("hero call to action leads to the contact section", async ({ page }) => {
    await page.getByRole("button", { name: "Book a Free Consultation" }).first().click();
    await expect(page.locator("#contact")).toBeInViewport({ ratio: 0.2 });
  });

  test("FAQ accordion opens one answer at a time", async ({ page }) => {
    const items = page.locator("button[aria-expanded]").filter({ hasText: "?" });
    await items.first().scrollIntoViewIfNeeded();
    await expect(items.first()).toHaveAttribute("aria-expanded", "true");
    await items.nth(1).click();
    await expect(items.nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(items.first()).toHaveAttribute("aria-expanded", "false");
  });

  test("email contact link uses the KODA address", async ({ page }) => {
    await expect(page.locator('a[href="mailto:info@heykoda.co.za"]').first()).toHaveCount(1);
  });

  test("WhatsApp button only appears with a real number", async ({ page }) => {
    const links = page.locator('a[href^="https://wa.me/"]');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toHaveAttribute("href", /^https:\/\/wa\.me\/\d{9,15}$/);
      await expect(links.nth(i)).toHaveAttribute("rel", /noopener/);
    }
  });

  test("external links opened in a new tab are safe", async ({ page }) => {
    const unsafe = await page.$$eval('a[target="_blank"]', (as) =>
      as.filter((a) => !/noopener|noreferrer/.test(a.rel)).map((a) => a.href)
    );
    expect(unsafe).toEqual([]);
  });

  test("logo is the supplied KODA artwork", async ({ page }) => {
    const srcs = await page.$$eval("img", (imgs) => imgs.map((i) => i.getAttribute("src") || ""));
    expect(srcs.some((s) => /koda-icon-(black|white)/.test(s) || s.startsWith("data:image"))).toBe(true);
  });
});

test("Durban landing page links back to the home page sections", async ({ page }) => {
  await page.goto("/website-design-durban", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Website design for Durban businesses.");
  expect(await page.locator('a[href="/"], a[href^="/#"]').count()).toBeGreaterThan(0);
});
