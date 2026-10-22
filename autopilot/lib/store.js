// Everything Autopilot does to the database goes through here, as calls to the SQL functions in the migration.
// `rpc(name, args)` is any function that returns the data or throws an Error whose message is the database's message:
// in production that wraps supabase-js (createSupabaseRpc), in tests it wraps PGlite.
//
// No table is written directly from application code: the functions hold the rules (state machine, caps, kill switch).
import { createClient } from "@supabase/supabase-js";

export function createSupabaseRpc(env = process.env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const rpc = async (name, args = {}) => {
    const { data, error } = await sb.rpc(name, args);
    if (error) throw Object.assign(new Error(error.message), { code: error.code });
    return data;
  };
  rpc.getUser = async (accessToken) => {
    const { data, error } = await sb.auth.getUser(accessToken);
    return error ? null : data.user;
  };
  return rpc;
}

// The database raises named errors (for example 'client_killed'); this pulls the name out of the message.
export function errorName(e) {
  const m = /\b(client_killed|hash_mismatch|approval_already_decided|approval_not_found|approval_expired|illegal_transition|auto_not_allowed|allowance_exhausted|spend_cap_exceeded|no_spend_cap_set|consent_required|invite_invalid|never_auto|bad_decision|bad_mode|bad_amount|client_not_found|task_not_found|side_effect_task_cannot_finish_without_execute|execute_requires_approved_payload)\b/.exec(String(e?.message || ""));
  return m ? m[1] : null;
}

export function createStore(rpc) {
  const j = (v) => (v === undefined ? {} : v);
  return {
    rpc,
    // work
    enqueue: (clientId, type, payload = {}, { runAfter, idempotencyKey, actor = "system" } = {}) =>
      rpc("ap_enqueue_task", { p_client: clientId, p_type: type, p_payload: j(payload), ...(runAfter ? { p_run_after: runAfter } : {}), p_idem: idempotencyKey ?? null, p_actor: actor }),
    claim: async (worker) => (await rpc("ap_claim_task", { p_worker: worker })) || [],
    reap: () => rpc("ap_reap_stale", {}),
    expireApprovals: () => rpc("ap_expire_approvals", {}),
    enqueueDue: () => rpc("ap_enqueue_due", {}),
    requestApproval: (taskId, preview, expires = "5 days") => rpc("ap_request_approval", { p_task: taskId, p_preview: j(preview), p_expires: expires }),
    autoApprove: (taskId, proposed) => rpc("ap_auto_approve", { p_task: taskId, p_proposed: j(proposed) }),
    effectiveMode: (clientId, type) => rpc("ap_effective_mode", { p_client: clientId, p_type: type }),
    complete: (taskId, result = {}) => rpc("ap_complete_task", { p_task: taskId, p_result: j(result) }),
    fail: (taskId, error, retryIn = null) => rpc("ap_fail_task", { p_task: taskId, p_error: String(error), p_retry_in: retryIn }),
    assertNotKilled: (clientId) => rpc("ap_assert_not_killed", { p_client: clientId }),
    // people
    decide: (approvalId, decision, hash, actor, note = null) => rpc("ap_decide_approval", { p_approval: approvalId, p_decision: decision, p_hash: hash, p_actor: actor, p_note: note }),
    killSwitch: (clientId, on, actor, reason = null) => rpc("ap_set_kill_switch", { p_client: clientId, p_on: on, p_actor: actor, p_reason: reason }),
    createClient: (c, actor) => rpc("ap_create_client", { p_business_name: c.businessName, p_plan: c.plan, p_email: c.email ?? null, p_contact: c.contact ?? null, p_website: c.website ?? null, p_internal: Boolean(c.internal), p_actor: actor }),
    setClientStatus: (clientId, status, noticeEnds, actor) => rpc("ap_set_client_status", { p_client: clientId, p_status: status, p_notice_ends: noticeEnds ?? null, p_actor: actor }),
    setAutomation: (clientId, type, mode, actor) => rpc("ap_set_automation", { p_client: clientId, p_type: type, p_mode: mode, p_actor: actor }),
    setPrice: (clientId, cents, actor) => rpc("ap_set_client_price", { p_client: clientId, p_price_cents: cents, p_actor: actor }),
    getApproval: (approvalId) => rpc("ap_get_approval", { p_approval: approvalId }),
    overview: () => rpc("ap_admin_overview", {}),
    isAdminEmail: (email) => rpc("ap_is_admin_email", { p_email: email }),
    // onboarding
    createInvite: (clientId, tokenHash, ttl, actor) => rpc("ap_create_invite", { p_client: clientId, p_token_hash: tokenHash, p_ttl: ttl, p_actor: actor }),
    inviteInfo: (tokenHash) => rpc("ap_invite_info", { p_token_hash: tokenHash }),
    completeOnboarding: (tokenHash, profile, wordingVersion, ai, data) => rpc("ap_complete_onboarding", { p_token_hash: tokenHash, p_profile: j(profile), p_wording_version: wordingVersion, p_ai_consent: ai, p_data_consent: data }),
    // billing
    expectedAmount: async (clientId) => { const v = await rpc("ap_expected_amount", { p_client: clientId }); return v == null ? null : Number(v); },
    applyBilling: (e) => rpc("ap_apply_billing_event", { p_provider: e.provider, p_payment_id: e.paymentId, p_status: e.status, p_client: e.clientId ?? null, p_amount_cents: e.amountCents ?? null, p_checks: j(e.checks) }),
    audit: (clientId, actor, action, detail = {}) => rpc("ap_audit", { p_client: clientId ?? null, p_actor: actor, p_action: action, p_detail: j(detail) }),
  };
}
