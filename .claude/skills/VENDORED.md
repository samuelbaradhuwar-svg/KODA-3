# Skills in this folder

Project skills load automatically in Claude Code for anyone working in this repo. Specialist agents preload the ones they need (see `.claude/agents/*.md`, `skills:` field).

| Skill | Source | Upstream version | What changed here |
|---|---|---|---|
| `scaling-orchestrator` | Written for KODA | n/a | Original |
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) `skills/taste-skill` (tasteskill v2), MIT | `a60a36d`, 2026-10-13 | Added a "KODA precedence" note under the title. `evals/` left out. Scripts unchanged |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) + rules from [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) `command.md` | `063bee9` / `434b7f9` | Rules embedded so no fetch is needed; also applies while building, not only reviewing |
| `image-to-code` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) `skills/image-to-code-skill`, MIT | `a60a36d` | Rewritten from a Codex-only image-generation flow into three modes (supplied image, generated references, written spec); repetition trimmed |
| `awesome-design` | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md), MIT | `c7c1bad`, 2026-10-12 | Catalog of 84 DESIGN.md files plus `scripts/fetch-design.sh`, which downloads one file on demand into `.claude/cache/design-md/` (git-ignored) |
| `chrome-devtools`, `a11y-debugging`, `debug-optimize-lcp`, `chrome-devtools-troubleshooting` | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) `skills/`, Apache-2.0 | v1.10.1, `bdc7e24`, 2026-10-13 | `troubleshooting` renamed `chrome-devtools-troubleshooting` (a bare name would clash). KODA setup note added to `chrome-devtools`. The MCP server itself is configured in `/.mcp.json`, pinned to 1.10.1 |
| `playwright-cli` | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) `skills/playwright-cli`, Apache-2.0 | `b85c7a7`, 2026-09-28 | Unchanged |

## Requirements

- `design-taste-frontend` scripts: Node 22+ and an installed Chrome, Edge or Chromium (or `CHROME_PATH`). They install nothing. `assets.mjs` needs internet.
- `playwright-cli`: `npm install -g @playwright/cli@latest` once on your machine. Without it, the QA agent still works through `@playwright/test` (see `CLAUDE.md`, setup).
- `awesome-design`: git with access to github.com.
- Chrome DevTools skills: the `chrome-devtools` MCP server from `/.mcp.json` (Node LTS, npm, Google Chrome stable). It runs with `--isolated` (throwaway profile) and `--no-usage-statistics`. Performance traces may send public page URLs to Google's CrUX API for real-user data; add `--no-performance-crux` to the args in `.mcp.json` to stop that.

## Deliberately not installed

- taste-skill v1 and `gpt-tasteskill`: superseded by v2 / tuned for other models.
- `imagegen-frontend-web`, `imagegen-frontend-mobile`, `brandkit`: built around a built-in image generator that Claude Code does not have. `image-to-code` covers the useful part.
- `soft-skill`, `minimalist-skill`, `brutalist-skill`, `stitch-skill`, `redesign-skill`, `output-skill`: overlap with v2 or with `awesome-design`. Add one later by copying its folder here if a client brief needs that exact style.
- `chrome-devtools-cli`, `memory-leak-debugging`, `cookie-debugging` from chrome-devtools-mcp: the CLI duplicates `playwright-cli`; memory leaks and cookie/session debugging do not apply to KODA's static brochure sites. Copy them in if a client project has logins or a heavy web app.
- The rest of `vercel-labs/agent-skills` (React and Next.js performance skills): KODA is Vite + React, not Next.js.

## Updating

Re-copy the upstream folder over the local one, then re-apply the local changes listed above, and update the version column.
