# Adding a specialist agent

1. Create `.claude/agents/<name>.md`:

```markdown
---
name: <kebab-case-name>
description: <One or two sentences: what it does and when the lead agent should use it. Say "Use proactively when ..." for work the lead should hand over without being asked.>
tools: Read, Grep, Glob, <only what it needs>
disallowedTools: Agent
model: haiku | sonnet | opus
skills:
  - <project skills it should start with>
color: <red|blue|green|yellow|purple|orange|pink|cyan>
maxTurns: 40
---

<Role in one paragraph.>

## Ownership
You may edit only: <paths>. Everything else is read-only. Put changes you need elsewhere under
"Requested changes" in your report.

## How to work
<Specialist instructions.>

## Deliverable
<What you hand back.>

## Report format
<Use the report section of .claude/skills/scaling-orchestrator/references/brief-template.md.>
```

2. Pick the model by the work, not the prestige:
   - `haiku`: checklist or mechanical work with clear right answers.
   - `sonnet`: most implementation, design and testing work.
   - `opus`: critical review, security, hard architecture. The lead can still override per spawn.
3. Give it the fewest tools that work. Read-only agents get no `Edit` or `Write`. No agent gets `Agent`.
4. Add a row to the team table in `.claude/skills/scaling-orchestrator/SKILL.md` and in `CLAUDE.md`,
   including what it owns, so the lead can plan file ownership around it.
5. Test it: start Claude Code in the repo, run `claude agents` to see it listed, then ask for a small
   job by name (`@agent-<name> ...`) and check it stayed inside its ownership.

Keep descriptions short: all agent descriptions load into every session, and only the body loads when
the agent runs.
