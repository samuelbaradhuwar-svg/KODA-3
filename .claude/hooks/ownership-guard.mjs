#!/usr/bin/env node
// PreToolUse hook: keeps subagents inside their file ownership and stops two agent instances from
// editing the same file at once. Registered in .claude/settings.json for Edit|Write|MultiEdit|NotebookEdit.
// The lead (main) agent is never restricted: hook input has no agent_type for it.
//
// Rules live in .claude/ownership.json. Locks live in .claude/work/locks.json (git-ignored).
// Reset locks at the start of a new multi-agent run:  node .claude/hooks/ownership-guard.mjs --reset
// Show locks:                                          node .claude/hooks/ownership-guard.mjs --list
// Exit 0 = allow, exit 2 = block (stderr is shown to the agent).
import fs from "node:fs";
import path from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const rulesPath = path.join(root, ".claude", "ownership.json");
const locksPath = path.join(root, ".claude", "work", "locks.json");

const readJson = (p, fallback) => {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
};
const writeLocks = (locks) => {
  fs.mkdirSync(path.dirname(locksPath), { recursive: true });
  const tmp = `${locksPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(locks, null, 2));
  fs.renameSync(tmp, locksPath);
};

if (process.argv.includes("--reset")) {
  writeLocks({});
  console.log("Cleared all file locks.");
  process.exit(0);
}
if (process.argv.includes("--release")) {
  // SubagentStop hook: free every lock held by the agent instance that just finished.
  let ev = {};
  try { ev = JSON.parse(fs.readFileSync(0, "utf8") || "{}"); } catch {}
  if (ev.agent_id) {
    const locks = readJson(locksPath, {});
    for (const [file, l] of Object.entries(locks)) if (l.agentId === ev.agent_id) delete locks[file];
    writeLocks(locks);
  }
  process.exit(0);
}
if (process.argv.includes("--list")) {
  console.log(JSON.stringify(readJson(locksPath, {}), null, 2));
  process.exit(0);
}

// Glob -> RegExp. Supports **, *, ? and {a,b}.
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        const slash = glob[i + 2] === "/";
        re += slash ? "(?:.*/)?" : ".*";
        i += slash ? 2 : 1;
      } else re += "[^/]*";
    } else if (c === "?") re += "[^/]";
    else if (c === "{") {
      const end = glob.indexOf("}", i);
      re += "(?:" + glob.slice(i + 1, end).split(",").map((s) => s.replace(/[.+^$()|[\]\\]/g, "\\$&")).join("|") + ")";
      i = end;
    } else re += c.replace(/[.+^$()|[\]\\]/g, "\\$&");
  }
  return new RegExp("^" + re + "$");
}
const matches = (rel, globs = []) => globs.some((g) => globToRegExp(g).test(rel));

let input = "";
try { input = fs.readFileSync(0, "utf8"); } catch { process.exit(0); }
let event;
try { event = JSON.parse(input); } catch { process.exit(0); }

const agentType = event.agent_type;
if (!agentType) process.exit(0); // lead agent: unrestricted

const ti = event.tool_input || {};
const target = ti.file_path || ti.notebook_path || ti.path;
if (!target) process.exit(0);

// Resolve relative to the agent's own checkout first (worktrees), then the project root.
const cwd = event.cwd || root;
const abs = path.resolve(cwd, target);
let base = root;
if (abs.startsWith(path.resolve(cwd) + path.sep)) base = path.resolve(cwd);
let rel = path.relative(base, abs).split(path.sep).join("/");
if (rel.startsWith("..")) {
  console.error(`Blocked: ${target} is outside the project. Agents only edit files inside the repo.`);
  process.exit(2);
}

const rules = readJson(rulesPath, { globalDeny: [], agents: {} });
const name = agentType.includes(":") ? agentType.split(":").pop() : agentType;

if (matches(rel, rules.globalDeny)) {
  console.error(
    `Blocked: ${rel} is reserved for the lead agent (dependencies, project instructions, agent config). ` +
      `Do not edit it. Add what you need to "Requested changes" in your report.`
  );
  process.exit(2);
}

const own = rules.agents?.[name];
if (own?.allow && !matches(rel, own.allow)) {
  console.error(
    `Blocked: ${name} may only edit ${own.allow.join(", ")}. ${rel} belongs to another workstream. ` +
      `Do not work around this with shell commands. List the change under "Requested changes" in your report.`
  );
  process.exit(2);
}

// Lock the file to this agent instance; refuse if another live instance holds it.
// .claude/work/** is exempt because each agent writes its own report files there.
if (!rel.startsWith(".claude/work/")) {
  const ttl = (rules.lockTtlMinutes ?? 180) * 60_000;
  const now = Date.now();
  const id = event.agent_id || `${name}:${event.session_id || "?"}`;
  const locks = readJson(locksPath, {});
  const held = locks[rel];
  if (held && held.agentId !== id && now - held.at < ttl) {
    console.error(
      `Blocked: ${rel} is being edited by another agent (${held.agentType}, since ${new Date(held.at).toISOString()}). ` +
        `Two agents must not edit the same file at once. Stop work on this file and list it under "Requested changes"; the lead agent will coordinate.`
    );
    process.exit(2);
  }
  locks[rel] = { agentId: id, agentType: name, at: now };
  writeLocks(locks);
}

process.exit(0);
