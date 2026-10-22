import { test } from "node:test";
import assert from "node:assert/strict";
import { newDb, asRole, mkClient, expectError, UP, DOWN } from "./helpers/db.mjs";

const q = (db, sql, params) => db.query(sql, params).then((r) => r.rows);
const one = async (db, sql, params) => (await q(db, sql, params))[0];

test("migration applies, rolls back, and applies again", async () => {
  const db = await newDb();
  assert.equal((await one(db, `select count(*)::int n from ap_plans`)).n, 3);
  await db.exec(DOWN);
  assert.equal((await one(db, `select count(*)::int n from pg_tables where tablename like 'ap\\_%'`)).n, 0);
  await db.exec(UP);
  assert.equal((await one(db, `select count(*)::int n from ap_plans`)).n, 3);
});

// ------------------------------------------------------------------ audit log
test("audit log is append-only and hash chained", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  for (let i = 0; i < 5; i++) await q(db, `select ap_audit($1,'system','test.event',null,null,$2)`, [c, JSON.stringify({ i })]);
  assert.equal((await one(db, `select ap_verify_audit_chain() v`)).v, null);

  await expectError(db.exec(`update ap_audit_log set action = 'x'`), /append_only/);
  await expectError(db.exec(`delete from ap_audit_log`), /append_only/);
  await expectError(db.exec(`truncate ap_audit_log`), /append_only/);

  // even the service role has no UPDATE/DELETE/TRUNCATE privilege
  await asRole(db, "service_role", async () => {
    await expectError(db.exec(`update ap_audit_log set action = 'x'`), /permission denied/);
    await expectError(db.exec(`delete from ap_audit_log`), /permission denied/);
  });

  // someone with superuser who disables the trigger and edits a row is detected by the chain check
  await db.exec(`alter table ap_audit_log disable trigger ap_audit_no_update`);
  await db.exec(`update ap_audit_log set detail = '{"i": 99}' where id = (select min(id) + 2 from ap_audit_log)`);
  await db.exec(`alter table ap_audit_log enable trigger ap_audit_no_update`);
  assert.notEqual((await one(db, `select ap_verify_audit_chain() v`)).v, null);
});

test("audit chain stays valid across many writes in different transactions", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  await Promise.all(Array.from({ length: 30 }, (_, i) => q(db, `select ap_audit($1,'system','burst',null,null,$2)`, [c, JSON.stringify({ i })])));
  assert.equal((await one(db, `select ap_verify_audit_chain() v`)).v, null);
});

// ------------------------------------------------------------------ row level security and privileges
test("row level security: browser roles cannot write, and only admins can read", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  await q(db, `insert into ap_admins (email) values ('boss@example.co.za')`);

  await asRole(db, "anon", async () => {
    await expectError(db.query(`select * from ap_clients`), /permission denied/);
    await expectError(db.query(`select * from ap_audit_log`), /permission denied/);
  });
  await asRole(db, "authenticated", async () => {
    assert.equal((await q(db, `select * from ap_clients`)).length, 0, "signed in but not an admin sees nothing");
  }, { email: "stranger@example.co.za" });
  await asRole(db, "authenticated", async () => {
    assert.equal((await q(db, `select * from ap_clients`)).length, 1, "admin can read");
    await expectError(db.query(`update ap_clients set kill_switch = true`), /permission denied/);
    await expectError(db.query(`insert into ap_tasks (client_id, task_type) values ('${c}', 'heartbeat')`), /permission denied/);
    await expectError(db.query(`delete from ap_clients`), /permission denied/);
    await expectError(db.query(`select * from ap_connected_accounts`), /permission denied/);
    await expectError(db.query(`select * from ap_onboarding_invites`), /permission denied/);
  }, { email: "boss@example.co.za" });
  // the claim is case insensitive but must match an admin row
  await asRole(db, "authenticated", async () => {
    assert.equal((await q(db, `select * from ap_clients`)).length, 1);
  }, { email: "Boss@Example.co.za" });
});

test("work functions can only be run by the service role", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  for (const role of ["anon", "authenticated"]) {
    await asRole(db, role, async () => {
      await expectError(db.query(`select ap_enqueue_task($1,'heartbeat')`, [c]), /permission denied/);
      await expectError(db.query(`select ap_set_kill_switch($1,true,'x')`, [c]), /permission denied/);
      await expectError(db.query(`select ap_audit($1,'x','y')`, [c]), /permission denied/);
    }, { email: "boss@example.co.za" });
  }
  await asRole(db, "service_role", async () => {
    assert.ok((await one(db, `select ap_enqueue_task($1,'heartbeat') id`, [c])).id);
  });
});

// ------------------------------------------------------------------ the approval flow
async function draftToApproval(db, c) {
  const id = (await one(db, `select ap_enqueue_task($1,'selftest_draft','{"topic":"x"}') id`, [c])).id;
  const claimed = await q(db, `select * from ap_claim_task('w1')`);
  assert.equal(claimed.length, 1);
  assert.equal(claimed[0].state, "running");
  const a = await one(db, `select * from ap_request_approval($1, '{"text":"Hello Durban"}')`, [id]);
  return { id, a };
}

test("agent drafts, human approves the exact content, system executes", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  const { id, a } = await draftToApproval(db, c);
  assert.equal(a.status, "pending");
  assert.equal((await one(db, `select state from ap_tasks where id=$1`, [id])).state, "awaiting_approval");
  assert.equal((await q(db, `select * from ap_claim_task('w1')`)).length, 0, "nothing runs while waiting for a human");

  await expectError(q(db, `select ap_decide_approval($1,'approve','not-the-hash','admin:me')`, [a.id]), /hash_mismatch/);
  const decided = await one(db, `select * from ap_decide_approval($1,'approve',$2,'admin:me','looks good')`, [a.id, a.payload_hash]);
  assert.equal(decided.status, "approved");
  await expectError(q(db, `select ap_decide_approval($1,'approve',$2,'admin:me')`, [a.id, a.payload_hash]), /already_decided/);

  const ex = await q(db, `select * from ap_claim_task('w1')`);
  assert.equal(ex[0].state, "executing");
  assert.deepEqual(ex[0].approved_payload, { text: "Hello Durban" }, "execute sees only what was approved");
  const done = await one(db, `select * from ap_complete_task($1,'{"published":true}')`, [id]);
  assert.equal(done.state, "done");
  assert.equal((await one(db, `select ap_verify_audit_chain() v`)).v, null);
  const actions = (await q(db, `select action from ap_audit_log where task_id=$1 order by id`, [id])).map((r) => r.action);
  assert.deepEqual(actions, ["task.enqueued", "task.claimed", "approval.requested", "approval.approved", "task.claimed", "task.done"]);
});

test("rejecting cancels the task", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  const { id, a } = await draftToApproval(db, c);
  await q(db, `select ap_decide_approval($1,'reject',$2,'admin:me','no')`, [a.id, a.payload_hash]);
  assert.equal((await one(db, `select state from ap_tasks where id=$1`, [id])).state, "cancelled");
});

test("a draft nobody answers lapses, and the lapse is recorded", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  const id = (await one(db, `select ap_enqueue_task($1,'selftest_draft') id`, [c])).id;
  await q(db, `select * from ap_claim_task('w1')`);
  const a = await one(db, `select * from ap_request_approval($1,'{"text":"late"}', interval '-1 second')`, [id]);
  const r = await one(db, `select * from ap_decide_approval($1,'approve',$2,'admin:me')`, [a.id, a.payload_hash]);
  assert.equal(r.status, "expired");
  assert.equal((await one(db, `select state, last_error from ap_tasks where id=$1`, [id])).state, "cancelled");
  assert.equal((await one(db, `select count(*)::int n from ap_audit_log where action='approval.expired'`)).n, 1);

  // the sweeper does the same for approvals nobody opened
  const id2 = (await one(db, `select ap_enqueue_task($1,'selftest_draft') id`, [c])).id;
  await q(db, `select * from ap_claim_task('w1')`);
  await q(db, `select * from ap_request_approval($1,'{"text":"later"}', interval '-1 second')`, [id2]);
  assert.equal((await one(db, `select ap_expire_approvals() n`)).n, 1);
  assert.equal((await one(db, `select state from ap_tasks where id=$1`, [id2])).state, "cancelled");
});

test("task states cannot be forced into illegal transitions", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  const { id } = await draftToApproval(db, c);
  await expectError(db.query(`update ap_tasks set state='done' where id='${id}'`), /illegal_transition/);
  await expectError(db.query(`update ap_tasks set state='executing' where id='${id}'`), /illegal_transition/);
  await expectError(db.query(`update ap_tasks set state='approved' where id='${id}'`).then(() =>
    db.query(`update ap_tasks set state='executing' where id='${id}'`)), /execute_requires_approved_payload/);
});

test("a side-effect task cannot finish at the draft step; a read-only task can", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  const id = (await one(db, `select ap_enqueue_task($1,'selftest_draft') id`, [c])).id;
  await q(db, `select * from ap_claim_task('w1')`);
  await expectError(q(db, `select ap_complete_task($1)`, [id]), /side_effect_task_cannot_finish/);
  const hb = (await one(db, `select ap_enqueue_task($1,'heartbeat') id`, [c])).id;
  await db.exec(`update ap_tasks set state='cancelled' where id='${id}'`);
  const claimed = await q(db, `select * from ap_claim_task('w1')`);
  assert.equal(claimed[0].id, hb);
  assert.equal((await one(db, `select state from ap_complete_task($1)`, [hb])).state, "done");
});

// ------------------------------------------------------------------ auto mode
test("auto mode only where the policy allows it; money tasks are never auto", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  const mk = async (type) => {
    const id = (await one(db, `select ap_enqueue_task($1,$2) id`, [c, type])).id;
    await db.exec(`update ap_tasks set state='running' where id='${id}'`);
    return id;
  };
  let id = await mk("selftest_draft");
  await expectError(q(db, `select ap_auto_approve($1,'{"a":1}')`, [id]), /auto_not_allowed/); // default is approve
  await q(db, `insert into ap_automation_settings (client_id, task_type, mode) values ($1,'selftest_draft','auto')`, [c]);
  assert.equal((await one(db, `select state from ap_auto_approve($1,'{"a":1}')`, [id])).state, "executing");

  await q(db, `insert into ap_automation_settings (client_id, task_type, mode) values ($1,'ads_change','auto')`, [c]);
  assert.equal((await one(db, `select ap_effective_mode($1,'ads_change') m`, [c])).m, "approve");
  id = await mk("ads_change");
  await expectError(q(db, `select ap_auto_approve($1,'{"budget":1}')`, [id]), /auto_not_allowed/);
  assert.equal((await one(db, `select ap_effective_mode($1,'nonsense') m`, [c])).m, "approve");
});

// ------------------------------------------------------------------ kill switch and who may run
test("kill switch stops claims and decisions, and resuming picks work back up", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  const { a } = await draftToApproval(db, c);
  await q(db, `select ap_set_kill_switch($1,true,'admin:me','testing')`, [c]);
  await expectError(q(db, `select ap_decide_approval($1,'approve',$2,'admin:me')`, [a.id, a.payload_hash]), /client_killed/);
  await expectError(q(db, `select ap_assert_not_killed($1)`, [c]), /client_killed/);
  const t2 = (await one(db, `select ap_enqueue_task($1,'heartbeat') id`, [c])).id;
  assert.equal((await q(db, `select * from ap_claim_task('w1')`)).length, 0);
  await q(db, `select ap_set_kill_switch($1,false,'admin:me')`, [c]);
  assert.equal((await q(db, `select * from ap_claim_task('w1')`))[0].id, t2);
  assert.deepEqual((await q(db, `select action from ap_audit_log where action like 'killswitch%' order by id`)).map((r) => r.action), ["killswitch.on", "killswitch.off"]);
});

test("only clients who are active and paid up (or internal) get work claimed", async () => {
  const db = await newDb();
  const cases = [
    [{ billing: "none" }, false], [{ billing: "past_due" }, false], [{ status: "onboarding" }, false],
    [{ status: "paused" }, false], [{ status: "cancelled" }, false], [{ billing: "active" }, true],
    [{ billing: "none", internal: true }, true],
  ];
  for (const [over, expected] of cases) {
    const c = await mkClient(db, over);
    await q(db, `select ap_enqueue_task($1,'heartbeat')`, [c]);
    assert.equal((await q(db, `select * from ap_claim_task('w')`)).length, expected ? 1 : 0, JSON.stringify(over));
    await db.exec(`update ap_tasks set state='cancelled' where state in ('running','queued')`);
  }
  // notice period: still served until the notice ends
  const n = await mkClient(db, { status: "notice" });
  await q(db, `select ap_enqueue_task($1,'heartbeat')`, [n]);
  await db.exec(`update ap_clients set notice_ends_at = current_date + 3 where id='${n}'`);
  assert.equal((await q(db, `select * from ap_claim_task('w')`)).length, 1);
  await db.exec(`update ap_tasks set state='cancelled' where state='running'`);
  await q(db, `select ap_enqueue_task($1,'heartbeat')`, [n]);
  await db.exec(`update ap_clients set notice_ends_at = current_date - 1 where id='${n}'`);
  assert.equal((await q(db, `select * from ap_claim_task('w')`)).length, 0);
});

// ------------------------------------------------------------------ retries, reaper, idempotency
test("retry, give up, and recover a lost worker", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  const id = (await one(db, `select ap_enqueue_task($1,'heartbeat') id`, [c])).id;
  await q(db, `select * from ap_claim_task('w1')`);
  let t = await one(db, `select * from ap_fail_task($1,'boom', interval '0 seconds')`, [id]);
  assert.equal(t.state, "queued");
  await q(db, `select * from ap_claim_task('w1')`);
  // worker dies: the reaper puts it back
  await db.exec(`update ap_tasks set locked_at = now() - interval '1 hour' where id='${id}'`);
  assert.equal((await one(db, `select ap_reap_stale() n`)).n, 1);
  assert.equal((await one(db, `select state from ap_tasks where id=$1`, [id])).state, "queued");
  await q(db, `select * from ap_claim_task('w1')`); // attempt 3 of 3
  t = await one(db, `select * from ap_fail_task($1,'boom again', interval '0 seconds')`, [id]);
  assert.equal(t.state, "failed", "no attempts left");
  assert.equal((await one(db, `select ap_verify_audit_chain() v`)).v, null);
});

test("enqueue is idempotent and schedules fire once per due time", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  const a = (await one(db, `select ap_enqueue_task($1,'heartbeat','{}', now(), 'k1') id`, [c])).id;
  const b = (await one(db, `select ap_enqueue_task($1,'heartbeat','{}', now(), 'k1') id`, [c])).id;
  assert.equal(a, b);
  assert.equal((await one(db, `select count(*)::int n from ap_tasks`)).n, 1);

  await q(db, `insert into ap_schedules (client_id, task_type, every_days, next_run_at) values ($1,'heartbeat',7, now() - interval '1 minute')`, [c]);
  assert.equal((await one(db, `select ap_enqueue_due() n`)).n, 1);
  assert.equal((await one(db, `select ap_enqueue_due() n`)).n, 0, "second tick the same minute does nothing");
  assert.equal((await one(db, `select count(*)::int n from ap_tasks`)).n, 2);
  const killed = await mkClient(db, { name: "Killed" });
  await q(db, `select ap_set_kill_switch($1,true,'t')`, [killed]);
  await q(db, `insert into ap_schedules (client_id, task_type, every_days, next_run_at) values ($1,'heartbeat',7, now() - interval '1 minute')`, [killed]);
  assert.equal((await one(db, `select ap_enqueue_due() n`)).n, 0, "schedules of a killed client are skipped");
});

// ------------------------------------------------------------------ allowances and money
test("allowances never go over the plan", async () => {
  const db = await newDb();
  const c = await mkClient(db, { plan: "presence" });
  const month = "2026-10-15";
  for (let i = 3; i >= 0; i--) assert.equal((await one(db, `select ap_consume_allowance($1,$2,'social_posts') r`, [c, month])).r, i);
  await expectError(q(db, `select ap_consume_allowance($1,$2,'social_posts')`, [c, month]), /allowance_exhausted/);
  await expectError(q(db, `select ap_consume_allowance($1,$2,'campaigns')`, [c, month]), /allowance_exhausted/); // presence has none
  await expectError(q(db, `select ap_consume_allowance($1,$2,'unknown_item')`, [c, month]), /allowance_exhausted/);
  await expectError(q(db, `select ap_consume_allowance($1,$2,'gbp_posts',0)`, [c, month]), /bad_amount/);
  // a new month starts fresh
  assert.equal((await one(db, `select ap_consume_allowance($1,'2026-11-02','social_posts') r`, [c])).r, 3);
  // many at once still land exactly on the limit
  const g = await mkClient(db, { plan: "growth", name: "G" });
  const results = await Promise.allSettled(Array.from({ length: 20 }, () => q(db, `select ap_consume_allowance($1,$2,'social_posts')`, [g, month])));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 8);
});

test("spend can never pass the cap; no cap means no spend", async () => {
  const db = await newDb();
  const c = await mkClient(db, { plan: "performance" });
  const month = "2026-10-01";
  await expectError(q(db, `select ap_reserve_spend($1,$2,100)`, [c, month]), /no_spend_cap_set/);
  await q(db, `select ap_set_spend_cap($1,$2,1000000,'admin:me')`, [c, month]);
  assert.equal(Number((await one(db, `select ap_reserve_spend($1,$2,600000) r`, [c, month])).r), 400000);
  await expectError(q(db, `select ap_reserve_spend($1,$2,400001)`, [c, month]), /spend_cap_exceeded/);
  await expectError(q(db, `select ap_set_spend_cap($1,$2,500000,'admin:me')`, [c, month]), /check/); // cannot cap below what is spent
  // random sequences never overshoot
  const month2 = "2026-11-01";
  await q(db, `select ap_set_spend_cap($1,$2,50000,'admin:me')`, [c, month2]);
  let spent = 0;
  for (let i = 0; i < 300; i++) {
    const amt = 1 + Math.floor(Math.random() * 9000);
    try {
      await q(db, `select ap_reserve_spend($1,$2,$3)`, [c, month2, amt]);
      spent += amt;
    } catch (e) {
      assert.match(e.message, /spend_cap_exceeded/);
    }
    assert.ok(spent <= 50000);
  }
  assert.equal(Number((await one(db, `select spent_cents s from ap_spend_caps where client_id=$1 and period=$2`, [c, month2])).s), spent);
  // a killed client cannot reserve spend
  await q(db, `select ap_set_kill_switch($1,true,'t')`, [c]);
  await expectError(q(db, `select ap_reserve_spend($1,$2,1)`, [c, month2]), /client_killed/);
});

// ------------------------------------------------------------------ clients, onboarding, billing, settings
test("onboarding: one-time invite, consent required, profile and consents saved together", async () => {
  const db = await newDb();
  const c = (await one(db, `select * from ap_create_client('Acme Plumbing','growth','a@acme.co.za','Ann','https://acme.co.za',false,'admin:me')`));
  assert.equal(c.status, "onboarding");
  await q(db, `select ap_create_invite($1,'hash1', interval '7 days','admin:me')`, [c.id]);
  assert.equal((await one(db, `select ap_peek_invite('hash1') c`)).c, c.id);
  assert.equal((await one(db, `select ap_peek_invite('nope') c`)).c, null);

  const profile = { tone: "warm", offers: "Free quote", audience: "Homeowners", banned_claims: ["#1 in Durban", "guaranteed"] };
  await expectError(q(db, `select ap_complete_onboarding('hash1',$1,'draft-0',true,false)`, [JSON.stringify(profile)]), /consent_required/);
  assert.equal((await one(db, `select ap_peek_invite('hash1') c`)).c, c.id, "a refused submission does not use up the invite");
  await q(db, `select ap_complete_onboarding('hash1',$1,'draft-0',true,true)`, [JSON.stringify(profile)]);
  assert.deepEqual((await one(db, `select banned_claims from ap_brand_profiles where client_id=$1`, [c.id])).banned_claims, ["#1 in Durban", "guaranteed"]);
  assert.equal((await one(db, `select count(*)::int n from ap_consents where client_id=$1 and wording_version='draft-0'`, [c.id])).n, 2);
  await expectError(q(db, `select ap_complete_onboarding('hash1',$1,'draft-0',true,true)`, [JSON.stringify(profile)]), /invite_invalid/);
  await q(db, `select ap_create_invite($1,'hash2', interval '-1 minute','admin:me')`, [c.id]);
  await expectError(q(db, `select ap_complete_onboarding('hash2',$1,'draft-0',true,true)`, [JSON.stringify(profile)]), /invite_invalid/);
});

test("billing events apply once, and unpaid clients stop being served", async () => {
  const db = await newDb();
  const c = await mkClient(db, { billing: "none" });
  assert.equal((await one(db, `select ap_apply_billing_event('payfast','pf1','COMPLETE',$1,149900,'{}') r`, [c])).r, "applied");
  assert.equal((await one(db, `select ap_apply_billing_event('payfast','pf1','COMPLETE',$1,149900,'{}') r`, [c])).r, "duplicate");
  assert.equal((await one(db, `select billing_status from ap_clients where id=$1`, [c])).billing_status, "active");
  await q(db, `select ap_apply_billing_event('payfast','pf2','FAILED',$1,149900,'{}')`, [c]);
  assert.equal((await one(db, `select billing_status from ap_clients where id=$1`, [c])).billing_status, "past_due");
  await q(db, `select ap_enqueue_task($1,'heartbeat')`, [c]);
  assert.equal((await q(db, `select * from ap_claim_task('w')`)).length, 0);
});

test("automation can be switched on per task type, but never for money", async () => {
  const db = await newDb();
  const c = await mkClient(db);
  await q(db, `select ap_set_automation($1,'social_post','auto','admin:me')`, [c]);
  assert.equal((await one(db, `select ap_effective_mode($1,'social_post') m`, [c])).m, "auto");
  await q(db, `select ap_set_automation($1,'social_post','approve','admin:me')`, [c]);
  assert.equal((await one(db, `select ap_effective_mode($1,'social_post') m`, [c])).m, "approve");
  await expectError(q(db, `select ap_set_automation($1,'ads_change','auto','admin:me')`, [c]), /never_auto/);
  await expectError(q(db, `select ap_set_automation($1,'heartbeat','auto','admin:me')`, [c]), /never_auto/); // read-only: nothing to switch
});

test("admin overview, expected amounts and admin email lookup", async () => {
  const db = await newDb();
  const c = await mkClient(db, { plan: "growth" });
  await q(db, `insert into ap_admins (email) values ('boss@example.co.za')`);
  assert.equal((await one(db, `select ap_is_admin_email('BOSS@example.co.za') r`)).r, true);
  assert.equal((await one(db, `select ap_is_admin_email('x@example.co.za') r`)).r, false);
  assert.equal((await one(db, `select ap_is_admin_email(null) r`)).r, false);
  assert.equal(Number((await one(db, `select ap_expected_amount($1) a`, [c])).a), 299900, "list price by default");
  await q(db, `select ap_set_client_price($1, 249900, 'admin:me')`, [c]);
  assert.equal(Number((await one(db, `select ap_expected_amount($1) a`, [c])).a), 249900, "the agreed price once set");

  const { id, a } = await (async () => {
    const id = (await one(db, `select ap_enqueue_task($1,'selftest_draft') id`, [c])).id;
    await q(db, `select * from ap_claim_task('w')`);
    return { id, a: await one(db, `select * from ap_request_approval($1,'{"text":"Hi"}')`, [id]) };
  })();
  const o = (await one(db, `select ap_admin_overview() o`)).o;
  assert.equal(o.clients.length, 1);
  assert.equal(o.clients[0].runnable, true);
  assert.equal(o.pending_approvals[0].id, a.id);
  assert.deepEqual(o.pending_approvals[0].preview, { text: "Hi" });
  assert.equal(o.audit_chain_ok, true);
  assert.ok(o.recent_tasks.some((t) => t.id === id));
  assert.ok(!JSON.stringify(o).includes("token_ciphertext"));
  await q(db, `insert into ap_connected_accounts (client_id, provider, external_account_id, token_ciphertext) values ($1,'google','a','v1.1.x.y.z')`, [c]);
  assert.ok(!JSON.stringify((await one(db, `select ap_admin_overview() o`)).o).includes("v1.1.x.y.z"), "credentials never appear in the overview");

  const info = await one(db, `select ap_create_invite($1,'h9', interval '1 day','admin:me')`, [c]);
  assert.ok(info);
  const inv = (await one(db, `select ap_invite_info('h9') i`)).i;
  assert.equal(inv.business_name, "Test Co");
  assert.equal((await one(db, `select ap_invite_info('nope') i`)).i, null);
});
