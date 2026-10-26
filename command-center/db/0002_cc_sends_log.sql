-- Command centre, step 5: what the send log needs to be trustworthy.
-- kind:  'client' (the real email) or 'test' (sent to the owner only)
-- error: why a send failed, if it did (never a key)
-- idem:  one value per click, so a double click can never send twice
alter table public.cc_sends
  add column kind text not null default 'client' check (kind in ('client','test')),
  add column error text check (error is null or length(error) <= 300),
  add column idem text check (idem is null or length(idem) <= 80);
create unique index cc_sends_idem_idx on public.cc_sends (idem) where idem is not null;
