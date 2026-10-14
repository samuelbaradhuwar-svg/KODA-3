# Final verification gate

Run from the repo root. Record each command and its exit code. A check you did not run is reported as
"not run", with the reason.

## Commands

| Step | Command | Pass means |
|---|---|---|
| Build | `npm run build` | Exit 0; "Pre-rendered /" and "Pre-rendered /website-design-durban" printed |
| E2E suite | `npm run test:e2e` | Exit 0; every test passed (not skipped) |
| All of the above in one go | `npm run verify` | Prints a summary table; exit 0 only if every step passed |
| Source taste lint (advisory on the KODA site) | `node .claude/skills/design-taste-frontend/scripts/lint.mjs src` | Read the findings; act on ones that are real defects |
| Visual inspector (client sites) | `node .claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:4173` | Screenshots at 1440 / 768 / 390 in `.taste-skill/` |

`npm run test:e2e` builds nothing itself; it starts `vite preview` on port 4173 against `dist/`, so
run the build first (`npm run verify` does both).

## What the Playwright suite covers (`tests/e2e/`)

- `smoke.spec.js`: every route in `tests/e2e/routes.js` returns 200, renders its h1, and logs no
  console errors or failed requests.
- `responsive.spec.js`: no horizontal overflow and a visible primary call to action at 390, 768 and
  1440 px; screenshots saved to `test-results/` for the lead agent to look at.
- `a11y-seo.spec.js`: `lang` on `<html>`, exactly one h1, every `<img>` has `alt`, every button and
  link has an accessible name, viewport allows zoom, title and meta description present and unique,
  canonical present, Open Graph tags present, JSON-LD parses, robots.txt and sitemap.xml served.
- `regression.spec.js`: navigation links scroll to their sections, the FAQ accordion opens, the
  WhatsApp button and contact links are present, the Durban page links back home.

When you add a page, add it to `tests/e2e/routes.js`. When you add a feature that must not break,
add a test for it in `regression.spec.js`.

## Checklist the lead agent signs off

- [ ] All workstreams in `plan.md` are `done`
- [ ] Every agent stayed inside its owned files (`git diff --name-only`)
- [ ] Build exit 0
- [ ] E2E suite exit 0, with the number of tests passed stated
- [ ] Screenshots at 390 / 768 / 1440 looked at
- [ ] No console errors (from the suite)
- [ ] Accessibility and SEO checks pass (from the suite); reviewer has no open blockers
- [ ] Existing features still work (regression spec)
- [ ] Brand locks in CLAUDE.md respected
- [ ] Anything not run is listed with the reason
