// KODA Autopilot API entry point (Vercel function). All the logic is in autopilot/lib/api.js.
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; see docs/AUTOPILOT-SETUP.md for the rest.
import { createApi } from "../../autopilot/lib/api.js";
import { createStore, createSupabaseRpc } from "../../autopilot/lib/store.js";
import { createNotifier } from "../../autopilot/lib/notify.js";
import { sendEmail } from "../../autopilot/lib/email.js";
import { handlers } from "../../autopilot/jobs/index.js";

export const config = { maxDuration: 60 };

let api;
function build() {
  const rpc = createSupabaseRpc();
  const store = createStore(rpc);
  return createApi({ store, handlers, notify: createNotifier({ sendEmail }), getUser: rpc.getUser });
}

export default async function handler(req, res) {
  try {
    api ??= build();
  } catch {
    return res.status(503).json({ ok: false, error: "Autopilot is not configured." }); // missing settings; details are not shown
  }
  return api(req, res);
}
