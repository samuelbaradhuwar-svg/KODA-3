# Agent brief template

Copy, fill in, keep it under about 300 words. Paths and decisions, not pasted file contents.

```markdown
## Goal
<one or two sentences: what done looks like>

## You own (may create or edit)
- <exact paths or globs>

## Read, do not edit
- CLAUDE.md (brand locks)
- <spec / plan / source files it needs>

## Decisions already made
- <architecture, design or content decisions the agent must not reopen>

## Constraints
- <the CLAUDE.md rules that matter for this job, e.g. no em dashes in copy, no fake testimonials>
- Do not edit files outside "You own". Put anything else under "Requested changes".
- Do not install packages. Ask for them under "Requested changes".

## Deliverable and check
- <files / report / test run>
- Done when: <e.g. `npm run build` exits 0 and the section renders at 390, 768 and 1440 px>

## Report back (at most about 250 words)
1. What you did
2. Files changed (list)
3. Commands run, with exit codes and the key output lines (only commands you actually ran)
4. Open issues / anything not done
5. Requested changes outside your ownership
```

Work folder: for tier 2 and 3 runs, agents may also write a longer report to
`.claude/work/<run>/<agent>-report.md` when the summary would not fit.
