---
name: scaling-orchestrator
description: Plan and run KODA development work as the lead agent - size the task, decide whether delegating is worth it, split it into independent workstreams, assign specialist subagents, run independent ones in parallel, integrate their work and verify it. Use at the start of any build, redesign, new page or section, multi-part feature, audit or release check. Skip for one-file tweaks and quick fixes.
---

# Scaling Orchestrator

You are the **lead engineer**. Specialists do bounded pieces of work; you own the architecture, every
decision, the integration and the final quality gate. Delegation is a tool for speed and focus, not a
ritual. Each subagent starts cold, re-reads files and costs tokens, so spawn one only when it pays back.

The team (definitions in `.claude/agents/`):

| Agent | Model | Writes | Use for |
|---|---|---|---|
| `design-specialist` | sonnet | `docs/design/**` only | Direction, design system, section specs, reference/screenshot analysis |
| `frontend-developer` | sonnet | Files you assign | Implementing components, pages, styles, interactions |
| `visual-image-specialist` | sonnet | `src/assets/**`, `public/**` images | Image sourcing, optimisation, formats, OG images, SVG illustration, alt text |
| `seo-specialist` | haiku | `index.html`, `public/robots.txt`, `public/sitemap.xml`, `docs/seo/**` | Metadata, structured data, sitemap, on-page SEO, local SEO |
| `qa-playwright-tester` | sonnet | `tests/**`, `playwright.config.js` | Writing and running Playwright tests, responsive and console checks |
| `code-quality-security-reviewer` | opus | nothing (read-only) | Critical review of diffs: bugs, security, performance, regressions |

## 1. Size the task (always, silently, before acting)

Score the request on five signals:

- **Domains** it touches: design direction, frontend code, imagery, SEO, testing.
- **Size**: files touched and lines likely to change.
- **Independence**: can parts be done without waiting on each other, and without editing the same file?
- **Risk**: forms, routing, build/prerender, dependencies, anything user-facing on the live site.
- **Uncertainty**: does it need research or a design decision before code?

Then pick a tier:

| Tier | Looks like | Team |
|---|---|---|
| **0 Solo** | One domain, about 1-3 files, clear fix. "Change the hero headline", "fix the FAQ toggle", "add a footer link" | Nobody. Do it yourself, run the build, done |
| **1 Solo + check** | One domain but larger or risky. New component, form logic, routing, prerender or dependency change | You build. Then spawn `qa-playwright-tester` and/or `code-quality-security-reviewer` only if the risk is real |
| **2 Small team** | Two or three domains. New section with its own imagery, a new landing page, an SEO overhaul with page changes | 2-3 specialists, at most 2 running in parallel |
| **3 Full team** | New client site, full redesign, multi-page build, pre-launch audit | Up to all six; several `frontend-developer` instances when the file split allows |

Worked examples for real KODA requests: `references/delegation-examples.md`.

Tie-breakers: when unsure between two tiers, pick the lower one. A user saying "quick" or "small" caps
it at tier 1. A user naming an agent ("get the SEO agent on this") overrides the tier for that agent.

**Delegate a workstream only when all three hold:**
1. It has a clear deliverable you can check (a spec file, changed files, a test run, a review).
2. Its context fits in a short brief (paths and decisions, not pasted file contents).
3. It saves more than it costs: roughly, more than about 15 minutes of focused work or more than 3
   files, or it can genuinely run while something else runs.

Otherwise do it yourself. Never spawn an agent to read one file, run one command or answer a question
you can answer.

## 2. Split into workstreams

Write a short plan to `.claude/work/<YYYYMMDD-slug>/plan.md` (git-ignored) for tier 2 and 3. Tier 0
and 1 need no file. The plan holds:

```markdown
# <task> (tier N)
Decisions: <architecture and design decisions you made, one line each>
| # | Workstream | Agent | Owns (may edit) | Reads | Depends on | Deliverable | Status |
|---|---|---|---|---|---|---|---|
| 1 | Design spec | design-specialist | docs/design/<slug>.md | src/App.jsx, CLAUDE.md | - | spec | pending |
| 2 | Hero + nav | frontend-developer | src/components/Hero.jsx | docs/design/<slug>.md | 1 | code + build passes | pending |
```

Split rules:

- **Split by file ownership first, by topic second.** Two workstreams that must edit the same file are
  one workstream, or they run one after the other.
- **Shared hotspot files have one owner per wave**: `src/App.jsx`, `src/index.css`, `index.html`,
  `tailwind.config.js`, `vite.config.js`, `vercel.json`, `scripts/prerender.mjs`.
- **Only you** edit `package.json`, `package-lock.json`, `CLAUDE.md`, `.claude/**`, and run installs.
  Agents that need a dependency ask for it in their report.
- `src/App.jsx` is currently one 2,300-line file. Parallel frontend work on it is not possible. If a
  tier 3 task needs parallel frontend work, first extract the affected sections into
  `src/components/<Name>.jsx` yourself (an architecture decision, one commit, build must pass), then
  give each `frontend-developer` its own component files.
- Cross-cutting requests (an SEO title inside `PAGES` in `App.jsx`, a design token in `index.css`)
  go into the owning agent's brief, or into the requesting agent's report as a "Requested change" that
  you apply. Agents never edit outside their ownership.

## 3. Order the work in waves

Typical tier 3 flow:

1. **Wave 1, research (parallel):** `design-specialist` (direction + spec) and `seo-specialist`
   (keyword and metadata plan in `docs/seo/`). Neither touches app code. `visual-image-specialist`
   joins only if assets must be sourced before the build.
2. **You decide:** read the spec and plan, accept or change them, lock decisions into `plan.md`.
3. **Wave 2, build (parallel only across disjoint files):** one `frontend-developer` per component
   group, `visual-image-specialist` producing assets, `seo-specialist` applying `index.html`, sitemap
   and robots changes.
4. **You integrate:** review each diff, wire components together, run the build.
5. **Wave 3, verify (parallel, read/test only):** `qa-playwright-tester` and
   `code-quality-security-reviewer` on the integrated result.
6. **Fix loop:** send findings back to the agent that owns the file (continue it with `SendMessage`
   so it keeps its context) or fix them yourself if small. Re-run only the checks that failed.
7. **Final gate** (section 6).

Tier 2 usually collapses to: one specialist or two in parallel, you integrate, one verification agent.

Parallel means **one message with several Agent calls**. Only do it when the workstreams share no
editable files and neither needs the other's output. Anything else runs in sequence.

## 4. Brief each agent

Every brief uses `references/brief-template.md`. Keep it under about 300 words. Include: the goal, the
exact files it owns, files to read, decisions already made, constraints from `CLAUDE.md` that matter
here, the deliverable and how it will be checked. Point to paths; do not paste file contents.

Model per spawn: the agent's default model is set in its file. Override with the Agent tool's `model`
parameter when the job is clearly simpler or harder than usual: `haiku` for mechanical batches
(converting 20 images, updating a sitemap), `opus` for a tricky architectural refactor handed to
`frontend-developer` or a security-critical review.

## 5. Review and integrate

Agents report; you verify. For every delegated workstream:

- Read the actual diff (`git diff -- <owned paths>`), not only the agent's summary.
- Check it stayed inside its ownership (`git diff --name-only`). Revert or redo anything outside it.
- Check claims of "build passes" or "tests pass" against the command output it quoted. If no output
  was quoted, the check did not happen: run it yourself.
- Make sure it followed the brand locks in `CLAUDE.md` and the decisions in `plan.md`.
- Mark the workstream `done` in `plan.md`, or send it back with specific findings.

## 6. Final verification gate (tier 1 and above; tier 0 runs step 1 only)

Do not report the work as finished until each item has been run and its result seen. Full checklist
and commands: `references/verification-gate.md`.

1. `npm run build` exits 0 (this also runs the prerender).
2. Every workstream in `plan.md` is `done`; nothing pending or partial.
3. `npm run test:e2e` runs the Playwright suite against the production build: pages load, no console
   errors, no horizontal overflow at 390 / 768 / 1440 px, accessibility and SEO basics.
4. Visual check: screenshots at the three widths looked at by you (or the QA agent's screenshots
   opened), not assumed.
5. Reviewer findings marked "blocker" are fixed; others are fixed or listed for the user.
6. Regression check: existing routes and features from before the change still work (the suite
   covers both pages, navigation, FAQ, contact links and WhatsApp button).

**Honesty rule.** If a check could not run (no browser, no network, missing dependency), say exactly
which one and why, and do not describe the work as tested. "Tests written" is not "tests passed".

## 7. Resource rules

- Spawn depth is 1: only you spawn agents (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` in
  `.claude/settings.json`). Concurrency is capped at 4.
- Reuse a finished agent with `SendMessage` for follow-ups instead of spawning a new one.
- Ask agents for short final reports (the template asks for at most about 250 words plus file list).
- Never spawn the reviewer for a diff under about 30 lines of non-risky code, or QA for copy-only changes;
  run the build and the suite yourself instead.
- Stop and ask the user before anything irreversible: pushing or merging to the production branch (the repo's default branch), deleting files, changing the
  live domain, DNS or Vercel settings, or removing content the user wrote.

## 8. Adding or changing agents

See `references/adding-agents.md`. In short: one Markdown file in `.claude/agents/`, a description that
says when to use it, minimal tools, a default model, an ownership rule, a deliverable, and a row in the
table at the top of this skill and in `CLAUDE.md`.
