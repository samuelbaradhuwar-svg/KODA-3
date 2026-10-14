import { test, expect } from "@playwright/test";
import { ROUTES, isThirdParty } from "./routes.js";

// Collects page errors, console errors and failed same-origin requests while a test runs.
function watch(page) {
  const problems = [];
  page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const url = msg.location()?.url || "";
    if (url && isThirdParty(url)) return;
    problems.push(`console.error: ${msg.text()}`);
  });
  page.on("requestfailed", (req) => {
    if (isThirdParty(req.url())) return;
    problems.push(`request failed: ${req.url()} (${req.failure()?.errorText})`);
  });
  page.on("response", (res) => {
    if (res.status() >= 400 && !isThirdParty(res.url())) problems.push(`HTTP ${res.status()}: ${res.url()}`);
  });
  return problems;
}

for (const route of ROUTES) {
  test(`${route.path} loads, renders its headline and logs no errors`, async ({ page }) => {
    const problems = watch(page);
    const res = await page.goto(route.path, { waitUntil: "networkidle" });
    expect(res?.status(), "HTTP status").toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.h1);
    // Let hydration, observers and reveal animations settle, then check nothing went wrong.
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(500);
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test(`${route.path} serves real content without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(route.path);
    await expect(page.locator("h1")).toHaveText(route.h1);
    await context.close();
  });
}
