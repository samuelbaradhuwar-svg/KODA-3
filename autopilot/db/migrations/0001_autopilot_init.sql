-- KODA Autopilot, Phase 1 foundation.
-- Tables are prefixed ap_ and live in public. Every table has row level security enabled.
-- The browser (anon / authenticated) can only ever READ, and only if the signed-in user is in ap_admins.
-- All writes go through the SECURITY DEFINER functions below, which only service_role may execute.
-- The server (api/autopilot) uses the service role key; that key must never reach the browser or the repo.

-- ------------------------------------------------------------------ admins
create table public.ap_admins (
  email text primary key check (email = lower(email))
);

-- Supabase puts the signed-in user's claims in auth.jwt(). Only emails listed in ap_admins count.
create function public.ap_is_admin() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.ap_admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ------------------------------------------------------------------ plans
create table public.ap_plans (
  id text primary key,
  name text not null,
  monthly_price_cents integer not null check (monthly_price_cents >= 0),
  -- fixed monthly allowances; keys are ledger items (see docs/DELIVERABLES.md)
  allowances jsonb not null
);

insert into public.ap_plans (id, name, monthly_price_cents, allowances) values
  ('presence',    'Presence',     149900, '{"social_posts":4,  "gbp_posts":2, "change_requests":2, "seo_fixes":3, "campaigns":0, "competitors":0}'),
  ('growth',      'Growth',       299900, '{"social_posts":8,  "gbp_posts":4, "change_requests":4, "seo_fixes":6, "campaigns":2, "competitors":0}'),
  ('performance', 'Performance',  499900, '{"social_posts":12, "gbp_posts":4, "change_requests":6, "seo_fixes":8, "campaigns":4, "competitors":3}');

-- ------------------------------------------------------------------ clients
create table public.ap_clients (
  id uuid primary key default gen_random_uuid(),
  business_name text not null check (length(business_name) between 1 and 200),
  contact_name text,
  contact_email text check (contact_email is null or contact_email like '%_@_%'),
  website_url text,
  plan_id text not null references public.ap_plans(id),
  status text not null default 'onboarding' check (status in ('onboarding', 'active', 'notice', 'paused', 'cancelled')),
  billing_status text not null default 'none' check (billing_status in ('none', 'active', 'past_due', 'cancelled')),
  is_internal boolean not null default false,          -- client zero (KODA itself): no billing needed
  kill_switch boolean not null default false,
  kill_switch_reason text,
  kill_switch_at timestamptz,
  notice_ends_at date,                                  -- cancellation: work and billing continue to this date
  price_cents integer check (price_cents is null or price_cents >= 0),  -- the agreed monthly price from the written quote; null = list price
  created_at timestamptz not null default now()
);

-- A client's work may run only if: not killed, active (or serving notice), and paid up (client zero excepted).
create function public.ap_client_runnable(c public.ap_clients) returns boolean
language sql stable as $$
  select not c.kill_switch
    and c.status in ('active', 'notice')
    and (c.is_internal or c.billing_status = 'active')
    and (c.status <> 'notice' or c.notice_ends_at is null or c.notice_ends_at >= current_date);
$$;

create table public.ap_brand_profiles (
  client_id uuid primary key references public.ap_clients(id) on delete cascade,
  tone text, offers text, dos text, donts text, audience text, areas text,
  banned_claims text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- What the client agreed to, and which wording they saw. The wording itself is the attorney's to approve.
create table public.ap_consents (
  id bigserial primary key,
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  kind text not null check (kind in ('ai_assisted_work', 'data_processing')),
  wording_version text not null,
  accepted_at timestamptz not null default now()
);

create table public.ap_onboarding_invites (
  token_hash text primary key,                          -- sha256 of the random token; the token itself is never stored
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);

-- ------------------------------------------------------------------ connected accounts (encrypted tokens)
-- token_ciphertext is encrypted by the app (AES-256-GCM) before it reaches the database. No policy is defined for
-- this table, so only the service role can read it, not even a signed-in admin from the browser.
create table public.ap_connected_accounts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  provider text not null,
  external_account_id text not null,
  scopes text[] not null default '{}',
  token_ciphertext text not null,
  key_version integer not null default 1,
  status text not null default 'active' check (status in ('active', 'revoked', 'error')),
  created_at timestamptz not null default now(),
  unique (client_id, provider, external_account_id)
);

-- ------------------------------------------------------------------ task policy
-- side_effect: the task changes something outside the database (publishes, edits a site, spends money).
-- Side-effect tasks must go through an approval unless the client's setting for that type is 'auto'.
-- never_auto: money or irreversible actions. These can never be switched to auto, whatever the setting says.
create table public.ap_task_policy (
  task_type text primary key,
  side_effect boolean not null,
  never_auto boolean not null default false
);

insert into public.ap_task_policy (task_type, side_effect, never_auto) values
  ('heartbeat',       false, false),
  ('selftest_draft',  true,  false),
  ('report',          true,  false),
  ('social_post',     true,  false),
  ('gbp_post',        true,  false),
  ('review_reply',    true,  false),
  ('seo_pr',          true,  false),
  ('change_request',  true,  false),
  ('campaign',        true,  false),
  ('ads_change',      true,  true),
  ('ads_budget',      true,  true);

create table public.ap_automation_settings (
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  task_type text not null references public.ap_task_policy(task_type),
  mode text not null default 'approve' check (mode in ('approve', 'auto')),
  primary key (client_id, task_type)
);

-- 'auto' only ever applies where the policy allows it. Default for everything is 'approve'.
create function public.ap_effective_mode(p_client uuid, p_type text) returns text
language sql stable set search_path = public, pg_temp as $$
  select case
    when p.task_type is null then 'approve'
    when p.never_auto or not p.side_effect then 'approve'
    else coalesce((select s.mode from public.ap_automation_settings s where s.client_id = p_client and s.task_type = p_type), 'approve')
  end
  from (select 1) x left join public.ap_task_policy p on p.task_type = p_type;
$$;

-- ------------------------------------------------------------------ tasks and approvals
create table public.ap_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  task_type text not null references public.ap_task_policy(task_type),
  state text not null default 'queued'
    check (state in ('queued', 'running', 'awaiting_approval', 'approved', 'executing', 'done', 'failed', 'cancelled')),
  payload jsonb not null default '{}',
  approved_payload jsonb,                               -- exactly what a human (or an 'auto' setting) approved; execute uses ONLY this
  result jsonb,
  run_after timestamptz not null default now(),
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  last_error text,
  locked_by text,
  locked_at timestamptz,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ap_tasks_claim_idx on public.ap_tasks (run_after) where state in ('queued', 'approved');
create index ap_tasks_client_idx on public.ap_tasks (client_id, state);

-- Allowed state changes. Anything else is rejected by the trigger below.
create table public.ap_task_transitions (
  from_state text not null,
  to_state text not null,
  primary key (from_state, to_state)
);
insert into public.ap_task_transitions (from_state, to_state) values
  ('queued', 'running'), ('queued', 'cancelled'),
  ('running', 'awaiting_approval'), ('running', 'executing'), ('running', 'done'),
  ('running', 'queued'), ('running', 'failed'), ('running', 'cancelled'),
  ('awaiting_approval', 'approved'), ('awaiting_approval', 'cancelled'),
  ('approved', 'executing'), ('approved', 'cancelled'),
  ('executing', 'done'), ('executing', 'approved'), ('executing', 'failed'), ('executing', 'cancelled');

create function public.ap_task_guard() returns trigger
language plpgsql as $$
begin
  if new.state <> old.state then
    if not exists (select 1 from public.ap_task_transitions t where t.from_state = old.state and t.to_state = new.state) then
      raise exception 'illegal_transition: % -> %', old.state, new.state using errcode = 'P0001';
    end if;
    -- a side-effect task may not skip the draft/approval path
    if new.state = 'done' and old.state = 'running'
       and (select side_effect from public.ap_task_policy where task_type = new.task_type) then
      raise exception 'side_effect_task_cannot_finish_without_execute' using errcode = 'P0001';
    end if;
    if new.state in ('executing') and new.approved_payload is null then
      raise exception 'execute_requires_approved_payload' using errcode = 'P0001';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger ap_tasks_guard before update on public.ap_tasks for each row execute function public.ap_task_guard();

create table public.ap_approvals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ap_tasks(id) on delete cascade,
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  preview jsonb not null,                               -- the exact proposed action a human reads and approves
  payload_hash text not null,                           -- sha256 of preview::text; the decision must quote it
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null,
  decided_by text,
  decided_at timestamptz,
  decision_note text
);
create unique index ap_approvals_one_pending on public.ap_approvals (task_id) where status = 'pending';

-- ------------------------------------------------------------------ allowance ledger and spend caps
create table public.ap_allowance_ledger (
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  period date not null check (extract(day from period) = 1),
  item text not null,
  included integer not null check (included >= 0),
  used integer not null default 0 check (used >= 0),
  primary key (client_id, period, item),
  check (used <= included)
);

create table public.ap_spend_caps (
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  period date not null check (extract(day from period) = 1),
  cap_cents bigint not null check (cap_cents >= 0),
  spent_cents bigint not null default 0 check (spent_cents >= 0),
  primary key (client_id, period),
  check (spent_cents <= cap_cents)
);

-- ------------------------------------------------------------------ schedules, reports, billing
create table public.ap_schedules (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  task_type text not null references public.ap_task_policy(task_type),
  payload jsonb not null default '{}',
  every_days integer not null check (every_days >= 1),
  next_run_at timestamptz not null,
  active boolean not null default true
);

create table public.ap_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.ap_clients(id) on delete cascade,
  period date not null,
  kind text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'sent')),
  content jsonb not null default '{}',
  task_id uuid references public.ap_tasks(id),
  created_at timestamptz not null default now()
);

create table public.ap_billing_events (
  id bigserial primary key,
  provider text not null,
  provider_payment_id text not null,
  payment_status text not null,
  client_id uuid references public.ap_clients(id),
  amount_gross_cents bigint,
  checks jsonb not null default '{}',                   -- which ITN security checks passed
  received_at timestamptz not null default now(),
  unique (provider, provider_payment_id, payment_status)
);

-- ------------------------------------------------------------------ audit log (append-only, hash chained)
create table public.ap_audit_log (
  id bigserial primary key,
  at timestamptz not null default clock_timestamp(),
  client_id uuid,                                       -- no foreign key on purpose: the log must outlive the client row
  actor text not null,                                  -- 'system', 'agent', 'admin:<email>', 'client'
  action text not null,
  task_id uuid,
  payload_hash text,
  detail jsonb not null default '{}',
  prev_hash text not null default '',
  hash text not null default ''
);

create function public.ap_audit_chain() returns trigger
language plpgsql as $$
declare prev text;
begin
  perform pg_advisory_xact_lock(727001);                -- one writer at a time keeps the chain in order
  -- take id and time only after the lock, so a later row can never get an earlier id than the row it chains to
  new.id := nextval(pg_get_serial_sequence('public.ap_audit_log', 'id'));
  new.at := clock_timestamp();
  select hash into prev from public.ap_audit_log order by id desc limit 1;
  new.prev_hash := coalesce(prev, '');
  new.hash := encode(sha256(convert_to(
    new.prev_hash || '|' || new.id::text || '|' || extract(epoch from new.at)::text || '|' || coalesce(new.client_id::text, '') || '|' ||
    new.actor || '|' || new.action || '|' || coalesce(new.task_id::text, '') || '|' || coalesce(new.payload_hash, '') || '|' || new.detail::text,
    'UTF8')), 'hex');
  return new;
end $$;
create trigger ap_audit_chain before insert on public.ap_audit_log for each row execute function public.ap_audit_chain();

create function public.ap_audit_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log_is_append_only' using errcode = 'P0001';
end $$;
create trigger ap_audit_no_update before update or delete on public.ap_audit_log for each row execute function public.ap_audit_immutable();
create trigger ap_audit_no_truncate before truncate on public.ap_audit_log for each statement execute function public.ap_audit_immutable();

-- Recomputes the chain. Returns null when intact, otherwise the id of the first row that does not match.
create function public.ap_verify_audit_chain() returns bigint
language plpgsql stable set search_path = public, pg_temp as $$
declare r record; prev text := ''; h text;
begin
  for r in select * from public.ap_audit_log order by id loop
    h := encode(sha256(convert_to(
      prev || '|' || r.id::text || '|' || extract(epoch from r.at)::text || '|' || coalesce(r.client_id::text, '') || '|' ||
      r.actor || '|' || r.action || '|' || coalesce(r.task_id::text, '') || '|' || coalesce(r.payload_hash, '') || '|' || r.detail::text,
      'UTF8')), 'hex');
    if r.prev_hash <> prev or r.hash <> h then return r.id; end if;
    prev := r.hash;
  end loop;
  return null;
end $$;

create function public.ap_audit(p_client uuid, p_actor text, p_action text, p_task uuid default null,
                                p_payload_hash text default null, p_detail jsonb default '{}')
returns bigint language plpgsql security definer set search_path = public, pg_temp as $$
declare new_id bigint;
begin
  insert into public.ap_audit_log (client_id, actor, action, task_id, payload_hash, detail)
  values (p_client, p_actor, p_action, p_task, p_payload_hash, coalesce(p_detail, '{}'))
  returning id into new_id;
  return new_id;
end $$;

-- ------------------------------------------------------------------ work functions (service role only)
create function public.ap_enqueue_task(p_client uuid, p_type text, p_payload jsonb default '{}',
                                       p_run_after timestamptz default now(), p_idem text default null,
                                       p_actor text default 'system')
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare tid uuid;
begin
  insert into public.ap_tasks (client_id, task_type, payload, run_after, idempotency_key)
  values (p_client, p_type, coalesce(p_payload, '{}'), p_run_after, p_idem)
  on conflict (idempotency_key) do nothing
  returning id into tid;
  if tid is null then
    select id into tid from public.ap_tasks where idempotency_key = p_idem;
    return tid;                                         -- already enqueued: idempotent
  end if;
  perform public.ap_audit(p_client, p_actor, 'task.enqueued', tid, null, jsonb_build_object('type', p_type));
  return tid;
end $$;

-- Claims one task: queued -> running (draft step) or approved -> executing (execute step).
-- Skips clients that are killed, unpaid or not active. SKIP LOCKED lets two workers run side by side.
create function public.ap_claim_task(p_worker text)
returns setof public.ap_tasks language plpgsql security definer set search_path = public, pg_temp as $$
declare t public.ap_tasks;
begin
  select tk.* into t
  from public.ap_tasks tk
  join public.ap_clients c on c.id = tk.client_id
  where tk.state in ('queued', 'approved') and tk.run_after <= now() and public.ap_client_runnable(c)
  order by tk.run_after
  for update of tk skip locked
  limit 1;
  if not found then return; end if;

  if t.attempts >= t.max_attempts then
    update public.ap_tasks set state = 'cancelled', last_error = coalesce(last_error, 'max_attempts_reached') where id = t.id;
    perform public.ap_audit(t.client_id, 'system', 'task.gave_up', t.id, null, jsonb_build_object('attempts', t.attempts));
    return;
  end if;

  update public.ap_tasks
     set state = case t.state when 'queued' then 'running' else 'executing' end,
         attempts = attempts + 1, locked_by = p_worker, locked_at = now()
   where id = t.id
   returning * into t;
  perform public.ap_audit(t.client_id, 'system', 'task.claimed', t.id, null, jsonb_build_object('state', t.state, 'worker', p_worker));
  return next t;
end $$;

-- A worker that died leaves tasks stuck in running/executing. Put them back, or fail them if they keep dying.
create function public.ap_reap_stale(p_older interval default interval '10 minutes')
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare n integer := 0; t public.ap_tasks;
begin
  for t in select * from public.ap_tasks where state in ('running', 'executing') and locked_at < now() - p_older for update skip locked loop
    if t.attempts >= t.max_attempts then
      update public.ap_tasks set state = 'failed', last_error = 'worker_lost', locked_by = null where id = t.id;
      perform public.ap_audit(t.client_id, 'system', 'task.failed', t.id, null, jsonb_build_object('reason', 'worker_lost'));
    else
      update public.ap_tasks set state = case t.state when 'running' then 'queued' else 'approved' end,
             locked_by = null, last_error = 'worker_lost' where id = t.id;
      perform public.ap_audit(t.client_id, 'system', 'task.reaped', t.id, null, jsonb_build_object('from', t.state));
    end if;
    n := n + 1;
  end loop;
  return n;
end $$;

-- Draft step finished and a human must approve: running -> awaiting_approval, with the exact proposed action.
create function public.ap_request_approval(p_task uuid, p_preview jsonb, p_expires interval default interval '5 days')
returns public.ap_approvals language plpgsql security definer set search_path = public, pg_temp as $$
declare t public.ap_tasks; a public.ap_approvals; h text;
begin
  select * into t from public.ap_tasks where id = p_task for update;
  if not found then raise exception 'task_not_found'; end if;
  if (select kill_switch from public.ap_clients where id = t.client_id) then raise exception 'client_killed'; end if;
  if t.state <> 'running' then raise exception 'illegal_transition: % -> awaiting_approval', t.state; end if;
  h := encode(sha256(convert_to(p_preview::text, 'UTF8')), 'hex');
  update public.ap_tasks set state = 'awaiting_approval', locked_by = null where id = p_task;
  insert into public.ap_approvals (task_id, client_id, preview, payload_hash, expires_at)
  values (p_task, t.client_id, p_preview, h, now() + p_expires) returning * into a;
  perform public.ap_audit(t.client_id, 'agent', 'approval.requested', p_task, h, jsonb_build_object('approval_id', a.id));
  return a;
end $$;

-- 'auto' mode: only when the policy allows it for this task type. Otherwise this refuses and the worker must ask for approval.
create function public.ap_auto_approve(p_task uuid, p_proposed jsonb)
returns public.ap_tasks language plpgsql security definer set search_path = public, pg_temp as $$
declare t public.ap_tasks; h text;
begin
  select * into t from public.ap_tasks where id = p_task for update;
  if not found then raise exception 'task_not_found'; end if;
  if (select kill_switch from public.ap_clients where id = t.client_id) then raise exception 'client_killed'; end if;
  if public.ap_effective_mode(t.client_id, t.task_type) <> 'auto' then raise exception 'auto_not_allowed'; end if;
  h := encode(sha256(convert_to(p_proposed::text, 'UTF8')), 'hex');
  update public.ap_tasks set state = 'executing', approved_payload = p_proposed, attempts = 0 where id = p_task returning * into t;
  perform public.ap_audit(t.client_id, 'system', 'task.auto_approved', p_task, h, '{}');
  return t;
end $$;

-- A human decides. The decision must quote the hash of what they saw; if the proposal changed, it is refused.
create function public.ap_decide_approval(p_approval uuid, p_decision text, p_hash text, p_actor text, p_note text default null)
returns public.ap_approvals language plpgsql security definer set search_path = public, pg_temp as $$
declare a public.ap_approvals;
begin
  if p_decision not in ('approve', 'reject') then raise exception 'bad_decision'; end if;
  select * into a from public.ap_approvals where id = p_approval for update;
  if not found then raise exception 'approval_not_found'; end if;
  if a.status <> 'pending' then raise exception 'approval_already_decided'; end if;
  if (select kill_switch from public.ap_clients where id = a.client_id) then raise exception 'client_killed'; end if;
  if a.expires_at < now() then
    update public.ap_approvals set status = 'expired' where id = a.id;
    update public.ap_tasks set state = 'cancelled', last_error = 'approval_expired' where id = a.task_id;
    perform public.ap_audit(a.client_id, 'system', 'approval.expired', a.task_id, a.payload_hash, '{}');
    a.status := 'expired';
    return a;                                           -- not raised: raising would roll back the expiry itself
  end if;
  if p_hash is distinct from a.payload_hash then raise exception 'hash_mismatch'; end if;

  if p_decision = 'approve' then
    update public.ap_approvals set status = 'approved', decided_by = p_actor, decided_at = now(), decision_note = p_note where id = a.id returning * into a;
    update public.ap_tasks set state = 'approved', approved_payload = a.preview, attempts = 0 where id = a.task_id;
  else
    update public.ap_approvals set status = 'rejected', decided_by = p_actor, decided_at = now(), decision_note = p_note where id = a.id returning * into a;
    update public.ap_tasks set state = 'cancelled', last_error = 'rejected' where id = a.task_id;
  end if;
  perform public.ap_audit(a.client_id, p_actor, 'approval.' || a.status, a.task_id, a.payload_hash, jsonb_build_object('approval_id', a.id));
  return a;
end $$;

-- Marks approvals that nobody answered as expired and cancels their tasks (the draft lapses; see docs/DELIVERABLES.md).
create function public.ap_expire_approvals() returns integer
language plpgsql security definer set search_path = public, pg_temp as $$
declare n integer := 0; a public.ap_approvals;
begin
  for a in select * from public.ap_approvals where status = 'pending' and expires_at < now() for update skip locked loop
    update public.ap_approvals set status = 'expired' where id = a.id;
    update public.ap_tasks set state = 'cancelled', last_error = 'approval_expired' where id = a.task_id and state = 'awaiting_approval';
    perform public.ap_audit(a.client_id, 'system', 'approval.expired', a.task_id, a.payload_hash, '{}');
    n := n + 1;
  end loop;
  return n;
end $$;

create function public.ap_complete_task(p_task uuid, p_result jsonb default '{}')
returns public.ap_tasks language plpgsql security definer set search_path = public, pg_temp as $$
declare t public.ap_tasks;
begin
  update public.ap_tasks set state = 'done', result = p_result, locked_by = null, last_error = null where id = p_task returning * into t;
  if not found then raise exception 'task_not_found'; end if;
  perform public.ap_audit(t.client_id, 'system', 'task.done', t.id, null, '{}');
  return t;
end $$;

-- Failure. With a retry delay (and attempts left) the task goes back to the start of the step it was in.
create function public.ap_fail_task(p_task uuid, p_error text, p_retry_in interval default null)
returns public.ap_tasks language plpgsql security definer set search_path = public, pg_temp as $$
declare t public.ap_tasks;
begin
  select * into t from public.ap_tasks where id = p_task for update;
  if not found then raise exception 'task_not_found'; end if;
  if p_retry_in is not null and t.attempts < t.max_attempts and t.state in ('running', 'executing') then
    update public.ap_tasks
       set state = case t.state when 'running' then 'queued' else 'approved' end,
           run_after = now() + p_retry_in, last_error = left(p_error, 500), locked_by = null
     where id = p_task returning * into t;
    perform public.ap_audit(t.client_id, 'system', 'task.retry', t.id, null, jsonb_build_object('error', left(p_error, 200)));
  else
    update public.ap_tasks set state = 'failed', last_error = left(p_error, 500), locked_by = null where id = p_task returning * into t;
    perform public.ap_audit(t.client_id, 'system', 'task.failed', t.id, null, jsonb_build_object('error', left(p_error, 200)));
  end if;
  return t;
end $$;

-- Kill switch. On: nothing for this client can be claimed or approved, and workers stop at their next step.
create function public.ap_set_kill_switch(p_client uuid, p_on boolean, p_actor text, p_reason text default null)
returns public.ap_clients language plpgsql security definer set search_path = public, pg_temp as $$
declare c public.ap_clients;
begin
  update public.ap_clients
     set kill_switch = p_on, kill_switch_reason = case when p_on then p_reason else null end,
         kill_switch_at = case when p_on then now() else null end
   where id = p_client returning * into c;
  if not found then raise exception 'client_not_found'; end if;
  perform public.ap_audit(p_client, p_actor, case when p_on then 'killswitch.on' else 'killswitch.off' end, null, null,
                          jsonb_build_object('reason', p_reason));
  return c;
end $$;

-- Workers call this before every step and before every call to an outside service.
create function public.ap_assert_not_killed(p_client uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if (select kill_switch from public.ap_clients where id = p_client) then raise exception 'client_killed'; end if;
end $$;

-- Allowances: create the month's rows from the plan if missing, then take n atomically. Never goes over.
create function public.ap_ensure_ledger(p_client uuid, p_period date) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.ap_allowance_ledger (client_id, period, item, included)
  select c.id, date_trunc('month', p_period)::date, a.key, (a.value)::integer
  from public.ap_clients c join public.ap_plans p on p.id = c.plan_id, jsonb_each_text(p.allowances) a(key, value)
  where c.id = p_client
  on conflict do nothing;
end $$;

create function public.ap_consume_allowance(p_client uuid, p_period date, p_item text, p_n integer default 1, p_actor text default 'system')
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare per date := date_trunc('month', p_period)::date; remaining integer;
begin
  if p_n < 1 then raise exception 'bad_amount'; end if;
  perform public.ap_ensure_ledger(p_client, per);
  update public.ap_allowance_ledger set used = used + p_n
   where client_id = p_client and period = per and item = p_item and used + p_n <= included
   returning included - used into remaining;
  if not found then raise exception 'allowance_exhausted'; end if;
  perform public.ap_audit(p_client, p_actor, 'allowance.used', null, null, jsonb_build_object('item', p_item, 'n', p_n, 'remaining', remaining));
  return remaining;
end $$;

-- Spend caps: no cap row means no spend. Reservation is atomic and can never push spent above the cap.
create function public.ap_set_spend_cap(p_client uuid, p_period date, p_cap_cents bigint, p_actor text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare per date := date_trunc('month', p_period)::date;
begin
  insert into public.ap_spend_caps (client_id, period, cap_cents) values (p_client, per, p_cap_cents)
  on conflict (client_id, period) do update set cap_cents = excluded.cap_cents;   -- the check constraint refuses a cap below spend so far
  perform public.ap_audit(p_client, p_actor, 'spendcap.set', null, null, jsonb_build_object('period', per, 'cap_cents', p_cap_cents));
end $$;

create function public.ap_reserve_spend(p_client uuid, p_period date, p_amount_cents bigint, p_actor text default 'system')
returns bigint language plpgsql security definer set search_path = public, pg_temp as $$
declare per date := date_trunc('month', p_period)::date; remaining bigint;
begin
  if p_amount_cents < 1 then raise exception 'bad_amount'; end if;
  perform public.ap_assert_not_killed(p_client);
  update public.ap_spend_caps set spent_cents = spent_cents + p_amount_cents
   where client_id = p_client and period = per and spent_cents + p_amount_cents <= cap_cents
   returning cap_cents - spent_cents into remaining;
  if not found then
    if exists (select 1 from public.ap_spend_caps where client_id = p_client and period = per) then raise exception 'spend_cap_exceeded'; end if;
    raise exception 'no_spend_cap_set';
  end if;
  perform public.ap_audit(p_client, p_actor, 'spend.reserved', null, null, jsonb_build_object('amount_cents', p_amount_cents, 'remaining_cents', remaining));
  return remaining;
end $$;

-- Recurring jobs: enqueue what is due, for clients whose work may run. Idempotent per schedule and due time.
create function public.ap_enqueue_due(p_now timestamptz default now())
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare n integer := 0; s public.ap_schedules;
begin
  for s in
    select sc.* from public.ap_schedules sc join public.ap_clients c on c.id = sc.client_id
    where sc.active and sc.next_run_at <= p_now and public.ap_client_runnable(c)
    for update of sc skip locked
  loop
    perform public.ap_enqueue_task(s.client_id, s.task_type, s.payload, p_now,
                                   'sched:' || s.id::text || ':' || extract(epoch from s.next_run_at)::bigint::text, 'system');
    update public.ap_schedules
       set next_run_at = greatest(s.next_run_at + make_interval(days => s.every_days), p_now + interval '1 hour')
     where id = s.id;
    n := n + 1;
  end loop;
  return n;
end $$;

-- ------------------------------------------------------------------ clients, onboarding, billing, settings
create function public.ap_create_client(p_business_name text, p_plan text, p_email text, p_contact text, p_website text,
                                        p_internal boolean, p_actor text)
returns public.ap_clients language plpgsql security definer set search_path = public, pg_temp as $$
declare c public.ap_clients;
begin
  insert into public.ap_clients (business_name, plan_id, contact_email, contact_name, website_url, is_internal)
  values (p_business_name, p_plan, nullif(trim(p_email), ''), nullif(trim(p_contact), ''), nullif(trim(p_website), ''), coalesce(p_internal, false))
  returning * into c;
  perform public.ap_audit(c.id, p_actor, 'client.created', null, null, jsonb_build_object('plan', p_plan, 'internal', c.is_internal));
  return c;
end $$;

create function public.ap_set_client_status(p_client uuid, p_status text, p_notice_ends date, p_actor text)
returns public.ap_clients language plpgsql security definer set search_path = public, pg_temp as $$
declare c public.ap_clients;
begin
  update public.ap_clients set status = p_status, notice_ends_at = case when p_status = 'notice' then p_notice_ends else null end
   where id = p_client returning * into c;
  if not found then raise exception 'client_not_found'; end if;
  perform public.ap_audit(p_client, p_actor, 'client.status', null, null, jsonb_build_object('status', p_status, 'notice_ends_at', p_notice_ends));
  return c;
end $$;

-- 'auto' can be switched on per client and task type, never for money tasks. Default stays 'approve'.
create function public.ap_set_automation(p_client uuid, p_type text, p_mode text, p_actor text)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_mode not in ('approve', 'auto') then raise exception 'bad_mode'; end if;
  if p_mode = 'auto' and exists (select 1 from public.ap_task_policy where task_type = p_type and (never_auto or not side_effect)) then
    raise exception 'never_auto';
  end if;
  insert into public.ap_automation_settings (client_id, task_type, mode) values (p_client, p_type, p_mode)
  on conflict (client_id, task_type) do update set mode = excluded.mode;
  perform public.ap_audit(p_client, p_actor, 'automation.set', null, null, jsonb_build_object('task_type', p_type, 'mode', p_mode));
  return p_mode;
end $$;

-- Onboarding invites: the token itself is never stored, only its sha256.
create function public.ap_create_invite(p_client uuid, p_token_hash text, p_ttl interval, p_actor text)
returns timestamptz language plpgsql security definer set search_path = public, pg_temp as $$
declare exp timestamptz := now() + p_ttl;
begin
  insert into public.ap_onboarding_invites (token_hash, client_id, expires_at) values (p_token_hash, p_client, exp);
  perform public.ap_audit(p_client, p_actor, 'invite.created', null, null, jsonb_build_object('expires_at', exp));
  return exp;
end $$;

create function public.ap_peek_invite(p_token_hash text) returns uuid
language sql stable security definer set search_path = public, pg_temp as $$
  select client_id from public.ap_onboarding_invites where token_hash = p_token_hash and used_at is null and expires_at > now();
$$;

-- One call, all or nothing: use the invite, save the brand profile, record what the client agreed to and which wording they saw.
create function public.ap_complete_onboarding(p_token_hash text, p_profile jsonb, p_wording_version text, p_ai_consent boolean, p_data_consent boolean)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare cid uuid;
begin
  if not (coalesce(p_ai_consent, false) and coalesce(p_data_consent, false)) then raise exception 'consent_required'; end if;
  update public.ap_onboarding_invites set used_at = now()
   where token_hash = p_token_hash and used_at is null and expires_at > now() returning client_id into cid;
  if cid is null then raise exception 'invite_invalid'; end if;
  insert into public.ap_brand_profiles (client_id, tone, offers, dos, donts, audience, areas, banned_claims)
  values (cid, left(p_profile ->> 'tone', 2000), left(p_profile ->> 'offers', 4000), left(p_profile ->> 'dos', 2000),
          left(p_profile ->> 'donts', 2000), left(p_profile ->> 'audience', 2000), left(p_profile ->> 'areas', 2000),
          coalesce(array(select left(x, 200) from jsonb_array_elements_text(coalesce(p_profile -> 'banned_claims', '[]')) x limit 50), '{}'))
  on conflict (client_id) do update set tone = excluded.tone, offers = excluded.offers, dos = excluded.dos, donts = excluded.donts,
    audience = excluded.audience, areas = excluded.areas, banned_claims = excluded.banned_claims, updated_at = now();
  insert into public.ap_consents (client_id, kind, wording_version) values (cid, 'ai_assisted_work', p_wording_version), (cid, 'data_processing', p_wording_version);
  perform public.ap_audit(cid, 'client', 'client.onboarded', null, null, jsonb_build_object('wording_version', p_wording_version));
  return cid;
end $$;

-- Billing events from the payment provider. Safe to receive twice: the second time it does nothing.
create function public.ap_apply_billing_event(p_provider text, p_payment_id text, p_status text, p_client uuid, p_amount_cents bigint, p_checks jsonb)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare inserted bigint;
begin
  insert into public.ap_billing_events (provider, provider_payment_id, payment_status, client_id, amount_gross_cents, checks)
  values (p_provider, p_payment_id, p_status, p_client, p_amount_cents, coalesce(p_checks, '{}'))
  on conflict do nothing returning id into inserted;
  if inserted is null then return 'duplicate'; end if;
  if p_client is not null then
    if p_status = 'COMPLETE' then update public.ap_clients set billing_status = 'active' where id = p_client;
    elsif p_status = 'FAILED' then update public.ap_clients set billing_status = 'past_due' where id = p_client;
    elsif p_status = 'CANCELLED' then update public.ap_clients set billing_status = 'cancelled' where id = p_client;
    end if;
    perform public.ap_audit(p_client, 'system', 'billing.' || lower(p_status), null, null, jsonb_build_object('provider', p_provider, 'amount_cents', p_amount_cents));
  end if;
  return 'applied';
end $$;

-- ------------------------------------------------------------------ helpers for the API and the admin page
create function public.ap_is_admin_email(p_email text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.ap_admins where email = lower(coalesce(p_email, '')));
$$;

create function public.ap_set_client_price(p_client uuid, p_price_cents integer, p_actor text)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.ap_clients set price_cents = p_price_cents where id = p_client;
  if not found then raise exception 'client_not_found'; end if;
  perform public.ap_audit(p_client, p_actor, 'client.price', null, null, jsonb_build_object('price_cents', p_price_cents));
  return p_price_cents;
end $$;

-- What a payment from this client must be: the agreed price, else the plan's list price.
create function public.ap_expected_amount(p_client uuid) returns bigint
language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(c.price_cents, p.monthly_price_cents)::bigint from public.ap_clients c join public.ap_plans p on p.id = c.plan_id where c.id = p_client;
$$;

create function public.ap_invite_info(p_token_hash text) returns jsonb
language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object('client_id', c.id, 'business_name', c.business_name, 'plan', c.plan_id)
  from public.ap_onboarding_invites i join public.ap_clients c on c.id = i.client_id
  where i.token_hash = p_token_hash and i.used_at is null and i.expires_at > now();
$$;

-- Everything the admin page shows, in one call. Never includes tokens or credentials.
create function public.ap_admin_overview() returns jsonb
language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'clients', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from (
        select c.id, c.business_name, c.contact_email, c.website_url, c.plan_id, c.status, c.billing_status, c.is_internal,
               c.kill_switch, c.kill_switch_reason, c.notice_ends_at, c.price_cents, c.created_at,
               public.ap_client_runnable(c) as runnable,
               exists (select 1 from public.ap_brand_profiles b where b.client_id = c.id) as has_profile,
               coalesce((select jsonb_object_agg(a.task_type, a.mode) from public.ap_automation_settings a where a.client_id = c.id), '{}') as automation
        from public.ap_clients c) x), '[]'),
    'pending_approvals', coalesce((select jsonb_agg(to_jsonb(y) order by y.requested_at) from (
        select a.id, a.task_id, a.client_id, c.business_name, t.task_type, a.preview, a.payload_hash, a.requested_at, a.expires_at
        from public.ap_approvals a join public.ap_clients c on c.id = a.client_id join public.ap_tasks t on t.id = a.task_id
        where a.status = 'pending') y), '[]'),
    'recent_tasks', coalesce((select jsonb_agg(to_jsonb(z)) from (
        select t.id, t.client_id, c.business_name, t.task_type, t.state, t.attempts, t.last_error, t.updated_at
        from public.ap_tasks t join public.ap_clients c on c.id = t.client_id order by t.updated_at desc limit 30) z), '[]'),
    'recent_audit', coalesce((select jsonb_agg(to_jsonb(w)) from (
        select id, at, client_id, actor, action, task_id from public.ap_audit_log order by id desc limit 40) w), '[]'),
    'audit_chain_ok', public.ap_verify_audit_chain() is null
  );
$$;

-- One approval as the approval page shows it. Used by the signed email links.
create function public.ap_get_approval(p_approval uuid) returns jsonb
language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object('id', a.id, 'status', a.status, 'preview', a.preview, 'payload_hash', a.payload_hash,
                            'expires_at', a.expires_at, 'business_name', c.business_name, 'task_type', t.task_type,
                            'client_id', a.client_id, 'kill_switch', c.kill_switch)
  from public.ap_approvals a join public.ap_clients c on c.id = a.client_id join public.ap_tasks t on t.id = a.task_id
  where a.id = p_approval;
$$;

-- ------------------------------------------------------------------ row level security and grants
do $$
declare tbl text;
begin
  for tbl in select tablename from pg_tables where schemaname = 'public' and tablename like 'ap\_%' loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('revoke all on table public.%I from anon, authenticated', tbl);
  end loop;
end $$;

-- A signed-in admin may READ everything below from the browser. Nobody may write from the browser.
-- ap_connected_accounts and ap_onboarding_invites get no policy at all: service role only.
do $$
declare tbl text;
begin
  foreach tbl in array array['ap_plans', 'ap_clients', 'ap_brand_profiles', 'ap_consents', 'ap_task_policy', 'ap_automation_settings',
                             'ap_tasks', 'ap_task_transitions', 'ap_approvals', 'ap_allowance_ledger', 'ap_spend_caps', 'ap_schedules',
                             'ap_reports', 'ap_billing_events', 'ap_audit_log', 'ap_admins']
  loop
    execute format('grant select on table public.%I to authenticated', tbl);
    execute format('create policy %I on public.%I for select to authenticated using (public.ap_is_admin())', tbl || '_admin_read', tbl);
  end loop;
end $$;

-- The audit log can never be changed by anyone, the service role included.
revoke update, delete, truncate on public.ap_audit_log from public, anon, authenticated, service_role;

-- Only the server (service role) may run the work functions.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'ap\_%' and p.proname not in ('ap_is_admin')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
