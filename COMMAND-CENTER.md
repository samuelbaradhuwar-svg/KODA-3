# KODA command centre: setup and use

A private page for the owner only, at `/command`. Audit requests land in an inbox; later steps add the in-depth audit,
the editable findings, the client report and the send flow. This file grows with each step.

**Built so far:**
- Step 1: sign-in, the inbox, request detail (status, private notes, delete), saving each detailed audit request when it arrives.
- Step 2: **Run in-depth audit** (crawler and technical checks, below).

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
1. **Database:** the three `cc_` tables live in the `growth-command-center` Supabase project, next to the Autopilot
   `ap_` tables (the free plan allows only 3 projects). The migration (`command-center/db/0001_cc_init.sql`, undo with
   `0001_cc_init.down.sql`) only adds `cc_` tables and touches nothing else. Both apps share that project's service
   key and its sign-in settings, so keep the key out of the browser and the repo. To move to a separate project later,
   run the same file there and change the four Supabase variables.
2. **Your login:** Supabase, Authentication, Users. Make sure `hello@heykoda.co.za` exists (Add user, tick auto-confirm).
   Sign-in never creates users, and the server only accepts that one address, so other users in the project (for
   example Autopilot's) cannot open the command centre. Supabase's built-in email sender is slow and limited to a few
   links an hour; that is enough for one person.
3. **Allow the sign-in link to come back to the site:** Authentication, URL Configuration. Add
   `https://www.heykoda.co.za/command` and `https://*.vercel.app/command` to Redirect URLs.
4. **Vercel environment variables** (Project, Settings, Environment Variables; tick **Production and Preview**), then redeploy:

| Name | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | Project URL | Server |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` secret | Server only. Never prefix with `VITE_`. Never paste it in chat or commit it. |
| `VITE_SUPABASE_URL` | Project URL | Browser sign-in |
| `VITE_SUPABASE_ANON_KEY` | `anon` or `publishable` public key | Browser sign-in (public by design). If Vercel says the name already exists, use `VITE_SUPABASE_PUBLISHABLE_KEY` instead; the page accepts either. |
| `COMMAND_ADMIN_EMAIL` | `hello@heykoda.co.za` | Optional; this is the default |
| `COMMAND_RETENTION_DAYS` | `180` | Optional; days before a request deletes itself |
| `PAGESPEED_API_KEY` | free Google key | Optional but recommended: without it Google's shared speed quota often runs out |

Setup gotchas we hit:
- Check the project name at the top left of Vercel says **koda-3**. The Autopilot project (growth-command-center) has similar variables, and "already exists" errors usually mean you are in that one.
- Tick **Production and Preview** for every variable, including the secret service key; a preview build cannot see a Production-only variable.
- Variables only reach a build that starts after they are saved, so redeploy after adding them.

Already set and reused: `RESEND_API_KEY`, `AUDIT_FROM`, `AUDIT_NOTIFY_TO`, `AUDIT_MODE`. Note these are currently
Production only; for the sign-in and for requests to be saved on a preview link, the Supabase ones above need Preview too.

## The in-depth audit (step 2)
**Run in-depth audit** on a request does, in order: crawl, Google speed on a phone, Google speed on a computer, then work out findings.
- **Crawl:** the home page plus up to 9 key pages (services, about, contact, blog, pricing, areas, gallery, FAQ, shop; picked from the home page links and the sitemap). Only public addresses are opened (private networks, localhost and similar are refused, including after redirects), each request has a size and time limit, three pages are read at a time, and the whole crawl has a 45 second budget. If time runs out the page says what was skipped. At most 8 crawls an hour, and one at a time per audit.
- **Technical checks:** secure connection, http to https and www redirects, redirect chains, 404 behaviour, error pages, noindex, robots.txt, sitemap, canonical tags, structured data, phone viewport setting, insecure items on secure pages, server response time, security headers, broken links (up to 40 checked, social sites that block bots are not called broken), image sizes (up to 14 checked), image descriptions and sizes, plus Google's Core Web Vitals, accessibility and best-practice results for phone and computer.
- **Each finding** has a severity, what was seen and where, why it matters, the fix, the KODA service that does it, and a group (fix first, next, later). The service, plan, price and timeline are read from `src/catalog.js` (the same data as the website's pricing). Which service answers which kind of finding is in `api/_cc/catalog.js`; please review that list.
- Only structured facts and short evidence are stored. Raw page HTML is never stored.
- **Not judged automatically:** the rendered phone layout (only the phone setting is checked), Google Business Profile, design and copy. These get a manual-review checklist in the next step.
- Re-running replaces the automatic findings and keeps any you have edited or added.

## Using it
- Open `/command`, enter your address, click the link in the email.
- Each detailed audit request appears in the inbox (the email to you still arrives as before).
- **Reply by email** opens a reply to the visitor. Set the status as you go: new, replied, audit drafted, sent, won, lost.
- **Run in-depth audit** takes up to about two minutes; leave the page open.
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
