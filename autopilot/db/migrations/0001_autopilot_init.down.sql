-- Rolls back 0001_autopilot_init.sql. Destroys all Autopilot data, including the audit log.
-- Export anything you need first. Only run this on a project that has no live client data.
drop table if exists
  public.ap_reports, public.ap_billing_events, public.ap_schedules, public.ap_spend_caps, public.ap_allowance_ledger,
  public.ap_approvals, public.ap_tasks, public.ap_task_transitions, public.ap_automation_settings, public.ap_task_policy,
  public.ap_connected_accounts, public.ap_onboarding_invites, public.ap_consents, public.ap_brand_profiles,
  public.ap_clients, public.ap_plans, public.ap_admins cascade;
-- the audit log has a no-truncate trigger but dropping the table is a deliberate, separate act
drop table if exists public.ap_audit_log cascade;
drop function if exists
  public.ap_is_admin(), public.ap_client_runnable(public.ap_clients), public.ap_effective_mode(uuid, text),
  public.ap_task_guard(), public.ap_audit_chain(), public.ap_audit_immutable(), public.ap_verify_audit_chain(),
  public.ap_audit(uuid, text, text, uuid, text, jsonb),
  public.ap_enqueue_task(uuid, text, jsonb, timestamptz, text, text), public.ap_claim_task(text), public.ap_reap_stale(interval),
  public.ap_request_approval(uuid, jsonb, interval), public.ap_auto_approve(uuid, jsonb),
  public.ap_decide_approval(uuid, text, text, text, text), public.ap_expire_approvals(),
  public.ap_complete_task(uuid, jsonb), public.ap_fail_task(uuid, text, interval),
  public.ap_set_kill_switch(uuid, boolean, text, text), public.ap_assert_not_killed(uuid),
  public.ap_ensure_ledger(uuid, date), public.ap_consume_allowance(uuid, date, text, integer, text),
  public.ap_set_spend_cap(uuid, date, bigint, text), public.ap_reserve_spend(uuid, date, bigint, text),
  public.ap_enqueue_due(timestamptz);
