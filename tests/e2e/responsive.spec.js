import { test, expect } from "@playwright/test";
import { ROUTES, VIEWPORTS } from "./routes.js";

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`${route.path} at ${vp.width}px: no sideways scroll, headline and CTA visible`, async ({ page }, info) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route.path, { waitUntil: "networkidle" });

      // Above the fold: the headline and at least one call to action are on screen.
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeInViewport();
      const cta = page.getByRole("button", { name: /consultation|get started|contact|quote/i }).first();
      await expect(cta).toBeVisible();

      // Scroll the whole page so lazy and revealed content is laid out, then measure overflow.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      const overflow = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const widest = document.documentElement.scrollWidth;
        const culprits = [];
        if (widest > vw + 1) {
          for (const el of document.querySelectorAll("body *")) {
            const r = el.getBoundingClientRect();
            if (r.width && r.right > vw + 1 && getComputedStyle(el).position !== "fixed") {
              culprits.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")} right=${Math.round(r.right)}`);
              if (culprits.length >= 5) break;
            }
          }
        }
        return { vw, widest, culprits };
      });
      expect(overflow.widest, `Page is ${overflow.widest}px wide in a ${overflow.vw}px viewport. Widest elements: ${overflow.culprits.join(", ")}`).toBeLessThanOrEqual(overflow.vw + 1);

      // Full-page screenshot for the lead agent to look at.
      const name = route.path === "/" ? "home" : route.path.slice(1).replace(/\//g, "-");
      await page.screenshot({ path: info.outputPath(`${name}-${vp.width}.png`), fullPage: true });
    });
  }
}

test("mobile menu opens, shows the section links and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const toggle = page.getByRole("button", { name: "Toggle menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: "Pricing" }).last()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});
