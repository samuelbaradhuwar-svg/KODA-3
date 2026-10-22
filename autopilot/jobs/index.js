// Task handlers by task type. Phase 1 ships two, used to prove the pipeline end to end before any real work exists:
//   heartbeat       read-only: records that the runner is alive. Needs no approval.
//   selftest_draft  a pretend post that goes through the full draft, approve, execute path, with no outside effect.
// Phase 2 adds the real types (report, social_post, gbp_post, ...) here, each with a draft() and an execute().
export const handlers = {
  heartbeat: {
    async draft() {
      return { done: { alive: true, at: new Date().toISOString() } };
    },
  },
  selftest_draft: {
    async draft({ task }) {
      return { propose: { kind: "selftest", text: `KODA Autopilot self-test post. Safe to approve: nothing is published. (task ${task.id.slice(0, 8)})` } };
    },
    async execute({ payload }) {
      return { executed: true, text: payload.text, note: "no outside effect" };
    },
  },
};
