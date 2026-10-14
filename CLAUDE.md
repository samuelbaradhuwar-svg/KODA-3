# KODA

KODA is a Durban web design studio (heykoda.co.za) building websites for local South African
businesses. This repo is KODA's own site and the base for KODA's development workflow, which is also
reused for client sites.

## Stack and commands

- Vite 8 + React 19 + Tailwind CSS 3, plain JavaScript (JSX). Deployed by Vercel from GitHub.
- `src/App.jsx` holds every section and the `PAGES` route table (one large file, sections marked with
  `/* ===== components/X.jsx ===== */` comments). `src/index.css` holds type styles and brand colours.
- The build pre-renders every route to static HTML (`scripts/prerender.mjs`, `src/entry-server.jsx`).
  Code must render on the server: no `window`, `document` or `localStorage` at module level or during render.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build + pre-render into `dist/` |
| `npm run test:e2e` | Playwright suite (`tests/e2e/`) against `vite preview` of `dist/` |
| `npm run verify` | Build + Playwright + advisory taste lint, with a pass/fail summary. The final gate |
| `npm run agents:reset-locks` | Clear agent file locks before a new multi-agent run |

## Brand locks (never change without the owner's explicit instruction)

- **Logo**: the supplied KODA mark (abstract K in a rounded square) and bold uppercase wordmark, used
  exactly as supplied, never altered, redrawn or regenerated. Black version on light backgrounds,
  white on dark (`src/assets/koda-icon-black.webp`, `koda-icon-white.webp`). Top left on every page.
- **Colours**: ink `#111827`, background `#F8FAFC`, accent blue `#2563EB`, success green `#10B981`
  (green only for success states).
- **Type**: Inter for headings and body (heavy, tight headings; small light grey body). Space Grotesk
  bold uppercase only for the KODA wordmark.
- **Look**: Apple-inspired minimal; flat white cards; calm solid backgrounds; no multi-stop gradients,
  no button shadows, no grid textures. Navbar is a liquid-glass floating pill. Sections fit roughly one
  screen on desktop and phone landscape, multi-column from about 720px. The current design is
  approved as final: changes are additions in the same language, not redesigns, unless asked.
- **Copy**: no em dashes, en dashes or hyphens in visible copy. KODA is not a CRM: never claim it
  tracks calls, leads or bookings. The message is that a website and online presence bring more
  customers, exposure and revenue. Prices in South African Rand. Location "Durban, South Africa";
  never publish the owner's suburb.
- **Social proof**: the current testimonials, ratings and "trusted by" names are flagged in
  `SEO-PLAN.md` as possibly not real. Do not add more unverified social proof, and do not remove the
  existing items without the owner's say-so. Never mark them up as reviews in structured data.

## Known pitfalls

- Tailwind opacity-slash colours (`bg-[#hex]/50`) can render near-transparent in iframes and webviews.
  Use inline `rgba()` styles. Prefer plain CSS classes in `index.css` over arbitrary values like
  `text-[18px]` for type styles and brand colours.
- Scroll state uses IntersectionObserver with a sentinel element, not scroll listeners. The navbar
  switches theme via `data-nav-theme` on sections.

## Development workflow: lead agent plus specialist agents

Autonomous delegation is the normal way work is done here. The main Claude session is the **lead
agent**: it owns architecture, decisions, integration and final quality control. For every task, the
lead first applies the **`scaling-orchestrator`** skill (`.claude/skills/scaling-orchestrator/`) to
size the work and decide, without being told, whether to delegate and to whom. The user does not need
to name agents.

- **Tier 0** (one domain, 1-3 files): the lead does it alone. No agents.
- **Tier 1** (one domain, larger or risky): the lead builds; adds QA and/or review only if the risk is real.
- **Tier 2** (two or three domains): 2-3 specialists, at most 2 in parallel.
- **Tier 3** (new site, redesign, multi-page build, launch audit): up to the full team in waves,
  with several frontend developers when the file split allows.

| Agent | Model | May edit | Use for |
|---|---|---|---|
| `design-specialist` | sonnet | `docs/design/**` | Direction, design system, section specs, screenshot analysis |
| `frontend-developer` | sonnet | Assigned files in `src/**` | Components, pages, styles, interactions |
| `visual-image-specialist` | sonnet | `src/assets/**`, images in `public/`, `docs/assets/**` | Image sourcing and optimisation, OG images, SVG, alt text |
| `seo-specialist` | haiku | `index.html`, `public/robots.txt`, `public/sitemap.xml`, `SEO-PLAN.md`, `docs/seo/**` | Metadata, structured data, sitemap, local SEO |
| `qa-playwright-tester` | sonnet | `tests/**`, `playwright.config.js` | Writing and running Playwright tests |
| `code-quality-security-reviewer` | opus | nothing (read-only) | Critical review of risky diffs |

Rules every session follows:

1. **File ownership is enforced.** `.claude/hooks/ownership-guard.mjs` blocks a subagent from editing
   outside its area (`.claude/ownership.json`) and locks each file to the first agent instance that
   edits it, so two agents never change the same file at once. Locks are released when an agent
   finishes. Only the lead edits `package.json`, `package-lock.json`, `vercel.json`, `CLAUDE.md` and
   `.claude/**`, and only the lead installs packages.
2. **Parallel only when independent**: no shared editable files and no dependency on each other's
   output. Otherwise run in sequence. Only the lead spawns agents (spawn depth 1, at most 4 at once).
3. **Briefs are short** (template in the orchestrator skill): goal, owned files, files to read,
   decisions made, deliverable. Point to paths, never paste whole files. Reuse a finished agent with
   `SendMessage` for follow-ups instead of spawning a new one.
4. **The lead verifies delegated work** by reading the diffs, not just the reports.
5. **Final gate before calling anything done** (tier 1 and above): `npm run verify` passes; every
   workstream finished; screenshots at 390, 768 and 1440 px looked at; no console errors; accessibility
   and SEO checks pass; reviewer blockers fixed; existing features still work. Details:
   `.claude/skills/scaling-orchestrator/references/verification-gate.md`.
6. **Never report tests as passed unless they ran.** Quote the result line and exit code. If a check
   could not run, say which and why.
7. **Ask before anything irreversible or public**: pushing or merging to the production branch (the repo's default branch, currently
   `claude/new-session-kcqrga`; Vercel deploys it to the live site), deleting files, changing domains, DNS or Vercel settings, or removing the owner's content.
   Work on a branch and open a pull request.

## Skills in this repo (`.claude/skills/`, details in `VENDORED.md`)

- `scaling-orchestrator`: how the lead plans, delegates, integrates and verifies.
- `design-taste-frontend` (tasteskill v2): art direction and an anti-generic house style for **new client
  sites and redesigns**. On KODA's own site the brand locks above win; its lint is advisory here.
- `awesome-design`: 84 ready design systems (Stripe, Linear, Apple...) to borrow a style for client
  work, never another brand's identity.
- `image-to-code`: turn screenshots or mockups into faithful code.
- `web-design-guidelines`: Vercel's interface rules for accessibility, forms, motion, performance, copy.
- `playwright-cli`: token-efficient browser automation for exploratory QA.

## Client projects

To reuse this setup for a client site, copy `.claude/` (agents, skills, hooks, `ownership.json`,
`settings.json`), `playwright.config.js`, `tests/e2e/` and `scripts/verify.mjs` into the new repo, then
replace the "Brand locks" section of its `CLAUDE.md` with the client's brand rules, and update
`tests/e2e/routes.js` and the ownership paths if its structure differs.

## One-time setup on a new machine

```bash
npm install
npm install -D @playwright/test        # adds the test runner (updates package.json and the lock file)
npx playwright install chromium        # browser for the tests
npm install -g @playwright/cli@latest  # optional: playwright-cli for exploratory QA
```

Node 22+ and an installed Chrome, Edge or Chromium are needed for the taste-skill scripts.

The first time Claude Code opens this folder it asks whether to trust it. Accept: until then Claude
Code ignores `.claude/settings.json`, so the ownership hook, spawn limits and command permissions are
off (the agents and skills still load).
