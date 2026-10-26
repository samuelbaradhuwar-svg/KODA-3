drop index if exists public.cc_sends_idem_idx;
alter table public.cc_sends drop column if exists idem, drop column if exists error, drop column if exists kind;
