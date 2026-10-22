// The task state machine, mirrored from the database (ap_task_transitions in the migration). The database is the
// authority and rejects anything else; this copy lets the code and the admin page reason about states, and a test
// checks the two stay identical.
export const STATES = ["queued", "running", "awaiting_approval", "approved", "executing", "done", "failed", "cancelled"];

export const TRANSITIONS = [
  ["queued", "running"], ["queued", "cancelled"],
  ["running", "awaiting_approval"], ["running", "executing"], ["running", "done"],
  ["running", "queued"], ["running", "failed"], ["running", "cancelled"],
  ["awaiting_approval", "approved"], ["awaiting_approval", "cancelled"],
  ["approved", "executing"], ["approved", "cancelled"],
  ["executing", "done"], ["executing", "approved"], ["executing", "failed"], ["executing", "cancelled"],
];

export const TERMINAL = new Set(["done", "failed", "cancelled"]);
export const canTransition = (from, to) => TRANSITIONS.some(([a, b]) => a === from && b === to);
