# KODA Autopilot: Phase 1 setup

What exists after Phase 1: a database with the rules built in, a job runner, an approval flow (email link and admin page),
client onboarding, a kill switch, an append-only audit log, and PayFast payment notifications. It does **no real client
work yet**: the only task types are `heartbeat` and `selftest_draft`, which prove the pipeline end to end. Real work
(reports, posts, SEO fixes) arrives in Phase 2 on top of this.

Plan and decisions: `docs/DELIVERABLES.md`. Gaps between site copy and delivery: `docs/COPY-GAPS.md`.

## How it works
1. A task is queued (by a schedule, or by hand). The **runner** claims it and runs the **draft** step.
2. If the task changes anything outside the database, the draft is turned into an **approval**: the exact proposed action.
   You get an email and it shows in `/admin`. Opening the email link changes nothing; you press a button on the next page.
3. After approval, the next run does the **execute** step, using only what you approved.
4. Every step is written to the audit log. The kill switch on a client stops all of its work at the next step.
5. Money-related task types (`ads_change`, `ads_budget`) can never be switched to auto, whatever the settings say.

## One-time setup (needs you)
1. **Supabase project.** Create one at supabase.com (the free plan is enough to start). Pick the region closest to your clients.
2. **Run the migration.** In Supabase, open SQL Editor and paste `autopilot/db/migrations/0001_autopilot_init.sql`, or use
   the Supabase CLI (`supabase db push`). To undo: `0001_autopilot_init.down.sql` (this deletes all Autopilot data).
3. **Create your admin login.** Supabase, Authentication, Users, add your email. Then in SQL Editor:
   `insert into ap_admins (email) values ('you@heykoda.co.za');`
   Under Authentication, URL configuration, add `https://www.heykoda.co.za/admin` as a redirect URL, and turn off
   "Allow new users to sign up" so nobody else can create an account.
4. **Environment variables.** Add everything under "KODA Autopilot" in `.env.example` to Vercel, then redeploy.
   Generate the random values yourself; do not reuse any other secret. The service role key goes only in Vercel.
5. **Check it is alive.** Open `https://www.heykoda.co.za/admin`, sign in with the emailed link.

## Making the runner tick
The runner runs when `/api/autopilot/tick` is called with `Authorization: Bearer <CRON_SECRET>`.
- `vercel.json` has a **daily** Vercel Cron as a safety net. On Vercel's Hobby plan cron is limited to once a day and the
  time can drift by up to an hour; on Pro it can run every minute.
- For a short interval on Hobby, call the same URL from Supabase `pg_cron` with `pg_net` every 5 minutes. Store the secret in
  Supabase Vault, not in the SQL. Sketch (check Supabase's current pg_net and Vault docs for exact syntax):
  ```sql
  select cron.schedule('autopilot-tick', '*/5 * * * *', $$
    select net.http_post(
      url := 'https://www.heykoda.co.za/api/autopilot/tick',
      headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'autopilot_cron_secret'))
    )
  $$);
  ```

## Client zero: the pilot (KODA as its own client)
1. In `/admin`, add a client: your own business, tick "This is KODA itself", set status to `active`.
2. With `AUTOPILOT_DRY_RUN=1`, press **Run self-test**, then wait for the next tick (or call it by hand:
   `curl -H "Authorization: Bearer $CRON_SECRET" https://www.heykoda.co.za/api/autopilot/tick`).
3. You get an approval email. Open it, read the preview, press Approve. Run another tick: the task finishes, and in dry run
   it records `dry_run: true` instead of executing.
4. Check the audit log in `/admin` shows every step and "chain intact".
5. Try the **kill switch** during a pending approval: the approval can no longer be decided until you switch back on.
6. Send yourself an **Onboarding link** and fill it in, to see the form and the saved brand profile.
7. Note anything that broke in `docs/PILOT-LOG.md`.

Do not set `AUTOPILOT_DRY_RUN=0` until Phase 2 has real task types and you have read the first drafts.

## Billing (PayFast): still to verify
Payment notifications are checked four ways (signature, sender, amount, PayFast's own confirmation) before anything changes.
PayFast's developer docs could not be loaded while this was built, so these must be verified against
https://developers.payfast.co.za and tested in the **PayFast sandbox** before real money:
the list of valid PayFast hosts, the subscription form field names and values, whether empty values belong in the
notification signature, and what a cancellation notice contains. Each is marked VERIFY in `autopilot/lib/payfast.js`.
The checkout form itself (a "Subscribe" button for a client) is not wired into a page yet.
Quotes say "from", so set each client's agreed monthly price in the database (`ap_set_client_price`); a payment that does not
match it is refused and logged.

## Security notes
- This repository is public. Never commit a key, a token, a client's details or a screenshot of the admin page.
- Client credentials will be stored encrypted (AES-256-GCM, bound to the client and provider). Rotation: set the new key as
  `AUTOPILOT_ENC_KEY` with `AUTOPILOT_ENC_KEY_VERSION` one higher, and keep the old one as `AUTOPILOT_ENC_KEY_PREV` while re-encrypting.
- The browser can only read, and only as a listed admin. All changes go through the server and the database functions.
- The audit log cannot be edited or deleted, even with the service role. A person with full database owner rights could still
  disable the guard, which is why the log is also hash-chained: the admin page shows if the chain is broken.
- Logs pass through a redactor, but do not paste secrets into task payloads.

## Known limits
- Tests run against an in-process Postgres (PGlite). It runs one connection at a time, so true parallel behaviour of the row
  locks (two workers claiming at once) still needs checking against a real Supabase branch before many clients.
- Email consent wording on the onboarding page is **draft** and must be approved by an attorney before a real client sees it.
- The privacy and terms pages do not yet list Autopilot's tools (Supabase, PayFast and others); see COPY-GAPS items 19 to 23.

## Tests
`npm run autopilot:test` runs the whole suite (about two minutes). `node scripts/audit-selftest.mjs` still covers the free audit.
