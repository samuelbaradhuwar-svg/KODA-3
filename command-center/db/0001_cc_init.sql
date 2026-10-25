-- KODA command centre, step 1: audit requests, audits and the send log.
-- Row level security is ON for every table and there are NO policies, so the browser (anon or signed-in) can read and
-- write nothing directly. Only the server (api/command, using the service role key) touches these tables, and it
-- checks the signed-in email first. The service role key must never reach the browser or the repo.

create table public.cc_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  site_url text not null check (length(site_url) <= 300),
  email text not null check (length(email) <= 200),
  business text check (business is null or length(business) <= 120),
  phone text check (phone is null or length(phone) <= 40),
  note text check (note is null or length(note) <= 600),
  auto_findings jsonb,                         -- the automatic report the visitor saw, trimmed; unverified
  status text not null default 'new' check (status in ('new','replied','audit_drafted','sent','won','lost')),
  admin_notes text check (admin_notes is null or length(admin_notes) <= 5000),
  delete_after timestamptz not null default (now() + interval '180 days')   -- POPIA retention; see COMMAND-CENTER.md
);
create index cc_requests_created_idx on public.cc_requests (created_at desc);
create index cc_requests_status_idx on public.cc_requests (status);

create table public.cc_audits (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.cc_requests(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  state text not null default 'draft' check (state in ('draft','running','ready','sent')),
  crawl jsonb,                                  -- pages fetched, headers, links (step 2)
  pagespeed jsonb,                              -- mobile and desktop results (step 2)
  manual jsonb,                                 -- manual review checklist and my notes (step 3)
  findings jsonb not null default '[]'::jsonb,  -- editable findings (step 3)
  summary text,
  plan text,
  report_token text unique,                     -- private report link (step 4); null when no link exists
  token_expires_at timestamptz
);
create index cc_audits_request_idx on public.cc_audits (request_id);

create table public.cc_sends (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.cc_requests(id) on delete cascade,
  audit_id uuid references public.cc_audits(id) on delete set null,
  sent_at timestamptz not null default now(),
  to_email text not null,
  subject text not null,
  body_html text not null,
  resend_id text,
  ok boolean not null
);
create index cc_sends_request_idx on public.cc_sends (request_id);

alter table public.cc_requests enable row level security;
alter table public.cc_audits enable row level security;
alter table public.cc_sends enable row level security;
revoke all on public.cc_requests, public.cc_audits, public.cc_sends from anon, authenticated;
