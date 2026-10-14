// Final verification gate: build, then the Playwright suite, then the advisory taste lint.
// Prints a summary table and writes .claude/work/last-verify.json for the lead agent.
// Exit code is 0 only when every required step ran and passed. A step that could not run counts as failed.
//   npm run verify              build + e2e + lint
//   npm run verify -- --no-build   reuse the existing dist/
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";

const args = new Set(process.argv.slice(2));
const results = [];
const tail = (s, n = 12) => (s || "").trim().split("\n").slice(-n).join("\n");

function step(name, cmd, cmdArgs, { required = true } = {}) {
  process.stdout.write(`\n▶ ${name}: ${cmd} ${cmdArgs.join(" ")}\n`);
  const started = Date.now();
  const r = spawnSync(cmd, cmdArgs, { encoding: "utf8", shell: process.platform === "win32", env: process.env });
  const out = (r.stdout || "") + (r.stderr || "");
  process.stdout.write(out);
  const status = r.error ? "not run" : r.status === 0 ? "passed" : "failed";
  results.push({ name, command: `${cmd} ${cmdArgs.join(" ")}`, status, exitCode: r.status, seconds: Math.round((Date.now() - started) / 1000), required, output: tail(out), error: r.error?.message });
  return status === "passed";
}

function hasPlaywrightTest() {
  try {
    createRequire(import.meta.url).resolve("@playwright/test");
    return true;
  } catch {
    return false;
  }
}

// 1. Build (includes the static pre-render of every route).
let built = true;
if (!args.has("--no-build")) built = step("Build", "npm", ["run", "build"]);
else if (!fs.existsSync("dist/index.html")) {
  results.push({ name: "Build", status: "not run", required: true, output: "--no-build given but dist/index.html is missing" });
  built = false;
}

// 2. End-to-end tests.
if (!built) {
  results.push({ name: "E2E tests", status: "not run", required: true, output: "Skipped because the build did not pass." });
} else if (!hasPlaywrightTest()) {
  results.push({
    name: "E2E tests",
    status: "not run",
    required: true,
    output: "@playwright/test is not installed. One-time setup: npm install -D @playwright/test && npx playwright install chromium",
  });
} else {
  step("E2E tests", "npx", ["playwright", "test"]);
}

// 3. Advisory design lint (never fails the gate; KODA's brand locks override its house rules).
step("Taste lint", "node", [".claude/skills/design-taste-frontend/scripts/lint.mjs", "src"], { required: false });

// Summary.
const ok = results.filter((r) => r.required).every((r) => r.status === "passed");
console.log("\n=== Verification summary ===");
for (const r of results) {
  const tag = r.required ? "" : " (advisory, does not fail the gate)";
  const label = !r.required && r.status === "failed" ? "FINDINGS" : r.status.toUpperCase();
  console.log(`${label.padEnd(8)} ${r.name}${tag}${r.seconds !== undefined ? `  ${r.seconds}s` : ""}`);
  if (r.status !== "passed" && r.required) console.log("         " + (r.output || r.error || "").split("\n").slice(-4).join("\n         "));
}
const e2e = results.find((r) => r.name === "E2E tests");
const counts = e2e?.output?.match(/\d+ (passed|failed|skipped|flaky)[^\n]*/g);
if (counts) console.log(`         Playwright: ${counts.join(", ")}`);
console.log(ok ? "\nRESULT: PASS" : "\nRESULT: FAIL (see above). Do not report this work as verified.");

fs.mkdirSync(".claude/work", { recursive: true });
fs.writeFileSync(".claude/work/last-verify.json", JSON.stringify({ at: new Date().toISOString(), ok, results }, null, 2));
process.exit(ok ? 0 : 1);
