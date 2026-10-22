// The job runner. One tick: recover stuck work, expire unanswered approvals, enqueue what is due, then work through
// claimed tasks in short steps until the time budget is used.
//
// A task has two steps, and the database refuses to skip the first:
//   draft   (state running)    the agent prepares the proposed action. Returns { propose } or, for read-only tasks, { done }.
//   execute (state executing)  does the real thing, using ONLY the approved payload. Reached after a human approves,
//                              or at once when the client's setting for that task type is 'auto' and the policy allows it.
// execute may be run more than once after a crash, so it must be safe to repeat: use ctx.idempotencyKey with outside services.
import { errorName } from "./store.js";
import { log as writeLog } from "./redact.js";

export class RetryableError extends Error {
  constructor(message, retryIn = "5 minutes") {
    super(message);
    this.retryIn = retryIn;
  }
}
export class PermanentError extends Error {}

export async function processTask({ store, handlers, task, notify, dryRun = false, logger = writeLog }) {
  const handler = handlers[task.task_type];
  if (!handler) return store.fail(task.id, `no_handler:${task.task_type}`);
  const ctx = { store, task, dryRun, idempotencyKey: task.id, log: (level, msg, extra) => logger(level, msg, { task: task.id, client: task.client_id, ...extra }) };

  const execute = async (t) => {
    await store.assertNotKilled(t.client_id);
    // Dry run is enforced here, not trusted to each handler: nothing outside the database is ever called.
    if (dryRun) return store.complete(t.id, { dry_run: true, would_execute: t.approved_payload });
    const result = await handler.execute({ ...ctx, task: t, payload: t.approved_payload });
    return store.complete(t.id, result ?? {});
  };

  try {
    await store.assertNotKilled(task.client_id);
    if (task.state === "executing") return await execute(task);

    const out = await handler.draft(ctx);
    if (out && out.done !== undefined) return await store.complete(task.id, out.done); // the database refuses this for side-effect tasks
    if (!out || out.propose === undefined) throw new PermanentError("draft returned neither done nor propose");

    if ((await store.effectiveMode(task.client_id, task.task_type)) === "auto") {
      const t = await store.autoApprove(task.id, out.propose);
      return await execute(t);
    }
    const approval = await store.requestApproval(task.id, out.propose);
    try {
      await notify?.approvalRequested({ approval, task });
    } catch (e) {
      ctx.log("warn", "approval email failed; the approval is still in the admin inbox", { error: String(e?.message) }); // not fatal
    }
    return { awaiting: approval.id };
  } catch (e) {
    const name = errorName(e);
    ctx.log("error", "task step failed", { error: String(e?.message), name });
    if (name === "client_killed") return store.fail(task.id, "client_killed", "15 minutes");
    if (e instanceof PermanentError) return store.fail(task.id, e.message);
    if (e instanceof RetryableError) return store.fail(task.id, e.message, e.retryIn);
    if (name && name !== "hash_mismatch") return store.fail(task.id, name); // the database refused: retrying will not help
    return store.fail(task.id, String(e?.message || "error"), "5 minutes");
  }
}

export async function runTick({ store, handlers, notify, dryRun = false, budgetMs = 40_000, maxTasks = 25, worker = "tick", now = () => Date.now(), logger = writeLog }) {
  const started = now();
  const summary = { reaped: 0, expired: 0, scheduled: 0, processed: 0, awaiting: 0, done: 0, failed: 0, dryRun };
  summary.reaped = Number((await store.reap()) || 0);
  summary.expired = Number((await store.expireApprovals()) || 0);
  summary.scheduled = Number((await store.enqueueDue()) || 0);

  while (summary.processed < maxTasks && now() - started < budgetMs) {
    const [task] = await store.claim(worker);
    if (!task) break;
    summary.processed++;
    const r = await processTask({ store, handlers, task, notify, dryRun, logger });
    if (r?.awaiting) summary.awaiting++;
    else if (r?.state === "done") summary.done++;
    else if (r?.state === "failed") summary.failed++;
  }
  return summary;
}
