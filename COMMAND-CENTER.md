# KODA command centre: setup and use

A private page for the owner only, at `/command`. Audit requests land in an inbox; later steps add the in-depth audit,
the editable findings, the client report and the send flow. This file grows with each step.

**Built so far (step 1):** sign-in, the inbox, request detail (status, private notes, delete), saving each detailed
audit request when it arrives.

## How it is protected
- Sign-in is an emailed link (Supabase). Only the address in `COMMAND_ADMIN_EMAIL` is accepted, and the **server checks
  it on every request** (`api/command`). Hiding the page is not the guard.
- The database tables have row level security on and no policies, so the browser can read nothing directly.
- `/command`, `/report/*` and `/api/command/*` send `X-Robots-Tag: noindex`, `robots.txt` disallows them, and they are not in `sitemap.xml`.
- The crawler (step 2) only opens public addresses, with size and time limits, and is rate limited.

## Where data lives, and why
Supabase (Postgres). It gives sign-in and a database in one place and works with row level security. The free plan is
enough to start. Free projects pause after about a week of no use; if the inbox stops loading, restore the project in
the Supabase dashboard (or move to the paid plan).

## One-time setup
1. **Supabase project:** use a project that is only for this (not the autopilot one). In the SQL editor run
   `command-center/db/0001_cc_init.sql`.
2. **Create your login:** Supabase, Authentication, Users, Add user, `hello@heykoda.co.za` (tick auto-confirm). Sign-in
   never creates users, so nobody else can get in.
3. **Allow the sign-in link to come back to the site:** Authentication, URL Configuration. Add
   `https://www.heykoda.co.za/command` and `https://*.vercel.app/command` to Redirect URLs.
4. **Vercel environment variables** (Project, Settings, Environment Variables; tick **Production and Preview**), then redeploy:

| Name | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | Project URL | Server |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` secret | Server only. Never prefix with `VITE_`. Never paste it in chat or commit it. |
| `VITE_SUPABASE_URL` | Project URL | Browser sign-in |
| `VITE_SUPABASE_ANON_KEY` | `anon` public key | Browser sign-in (public by design) |
| `COMMAND_ADMIN_EMAIL` | `hello@heykoda.co.za` | Optional; this is the default |
| `COMMAND_RETENTION_DAYS` | `180` | Optional; days before a request deletes itself |

Already set and reused: `RESEND_API_KEY`, `AUDIT_FROM`, `AUDIT_NOTIFY_TO`, `AUDIT_MODE`. Note these are currently
Production only; for the sign-in and for requests to be saved on a preview link, the Supabase ones above need Preview too.

## Using it
- Open `/command`, enter your address, click the link in the email.
- Each detailed audit request appears in the inbox (the email to you still arrives as before).
- **Reply by email** opens a reply to the visitor. Set the status as you go: new, replied, audit drafted, sent, won, lost.
- **Delete this request** removes it, its audit and its send log for good.

## POPIA
Only what the visitor submitted is stored (site address, email, business, phone, note and the automatic findings they
saw). Each request deletes itself after `COMMAND_RETENTION_DAYS` (default 180), whenever the inbox is opened after that
date, and can be deleted by hand at any time. Legal pages are still drafts pending attorney review; add the retention
period to the privacy notice when it is reviewed.

## Checks
`npm test` runs the self-tests (`scripts/audit-selftest.mjs`, `scripts/command-selftest.mjs`): sign-in rules, the API,
trimming, address safety and the database migration (in PGlite).

## Known limits
- Anyone can submit a request through the public form; it is limited to 5 an hour per visitor and has a hidden bot trap,
  but a determined spammer could still fill the inbox. Delete is one click.
- The automatic findings attached to a request come from the visitor's browser, so they are treated as unverified.
