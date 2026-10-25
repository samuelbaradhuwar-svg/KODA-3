import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Logo } from "../components/ui.jsx";
import { EMAIL } from "../lib/utils.js";

// KODA command centre (private, noindex). Signs in with an emailed link; the server (api/command) checks the signed-in
// address on every request, so this page is a convenience and not the guard.
const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

const field = "w-full rounded-xl border border-ink/20 bg-paper px-3 py-2 text-[15px]";
const btn = "rounded-full px-4 py-2 text-[14px] font-semibold transition-opacity disabled:opacity-40";
const dark = `${btn} bg-ink text-paper`;
const light = `${btn} border border-ink/30 bg-paper`;
const danger = `${btn} bg-[#c0392b] text-white`;
const when = (t) => (t ? new Date(t).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "");

export const STATUS = {
  new: { label: "New", cls: "bg-[#FFC76B] text-[#101010]" },
  replied: { label: "Replied", cls: "bg-paper2 text-ink" },
  audit_drafted: { label: "Audit drafted", cls: "bg-paper2 text-ink" },
  sent: { label: "Sent", cls: "bg-paper2 text-ink" },
  won: { label: "Won", cls: "bg-[#BDF64F] text-[#101010]" },
  lost: { label: "Lost", cls: "bg-[#FF9A8B] text-[#101010]" },
};
const Badge = ({ s }) => <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS[s]?.cls || "bg-paper2"}`}>{STATUS[s]?.label || s}</span>;

const sb = SB_URL && SB_ANON ? createClient(SB_URL, SB_ANON, { auth: { persistSession: true, detectSessionInUrl: true } }) : null;

function usePath() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/+$/, ""));
  useEffect(() => {
    const on = () => setPath(window.location.pathname.replace(/\/+$/, ""));
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);
  const go = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo(0, 0);
  };
  return [path, go];
}

function Shell({ children, right }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6">
      <header className="flex items-center justify-between gap-4 border-b border-ink/15 pb-4">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="xwide text-[0.95rem] tracking-[-0.02em]">Command centre</span>
        </div>
        {right}
      </header>
      {children}
    </div>
  );
}

function Card({ title, children, right }) {
  return (
    <section className="mt-6 rounded-[20px] border border-ink/15 bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="xwide text-[1.05rem] tracking-[-0.02em]">{title}</h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function go(e) {
    e.preventDefault();
    setMsg("");
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/command` } });
    setMsg(error ? "That did not work. Check the address." : "If that address is allowed, a sign-in link is on its way.");
  }
  return (
    <form onSubmit={go} className="mx-auto mt-24 max-w-sm px-4">
      <Logo />
      <h1 className="xwide mt-6 text-[1.4rem]">Command centre</h1>
      <p className="mt-3 text-muted">Private. Sign in with your email and we send you a link.</p>
      <input className={`${field} mt-5`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={EMAIL} autoComplete="email" />
      <button className={`${dark} mt-3 w-full`} type="submit">Send link</button>
      {msg && <p role="status" className="mt-3 text-[14px]">{msg}</p>}
    </form>
  );
}

function Inbox({ call, go }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    call("requests").then((r) => setRows(r.requests)).catch((e) => setErr(e.message));
  }, [call]);
  const shown = useMemo(() => (rows || []).filter((r) => filter === "all" || r.status === filter), [rows, filter]);
  const count = (s) => (rows || []).filter((r) => r.status === s).length;
  return (
    <>
      <h1 className="xwide mt-8 text-[1.4rem]">Audit requests</h1>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {["all", ...Object.keys(STATUS)].map((s) => (
          <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s} className={`rounded-full border px-3 py-1 text-[13px] ${filter === s ? "border-ink bg-ink text-paper" : "border-ink/25"}`}>
            {s === "all" ? `All (${rows?.length ?? 0})` : `${STATUS[s].label} (${count(s)})`}
          </button>
        ))}
      </div>
      {err && <p role="alert" className="mt-4 text-[14px]">{err}</p>}
      {!rows && !err && <p className="mt-6 text-muted">Loading…</p>}
      {rows && shown.length === 0 && <p className="mt-6 text-muted">{rows.length === 0 ? "No requests yet. They appear here when someone asks for a detailed audit." : "Nothing with that status."}</p>}
      <ul className="mt-4 divide-y divide-ink/10 rounded-[20px] border border-ink/15">
        {shown.map((r) => (
          <li key={r.id}>
            <a href={`/command/${r.id}`} onClick={(e) => { e.preventDefault(); go(`/command/${r.id}`); }} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-paper2">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{r.business || hostOf(r.site_url)}</span>
                <span className="block truncate text-[13px] text-muted">{hostOf(r.site_url)} · {r.email}</span>
              </span>
              <span className="flex items-center gap-3 text-[13px] text-muted">
                {when(r.created_at)}
                <Badge s={r.status} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

const hostOf = (u) => {
  try {
    return new URL(u).hostname;
  } catch {
    return u;
  }
};

const SEV = {
  high: { label: "High", cls: "bg-[#FF9A8B] text-[#101010]" },
  medium: { label: "Medium", cls: "bg-[#FFC76B] text-[#101010]" },
  low: { label: "Low", cls: "bg-paper2 text-ink" },
  info: { label: "Info", cls: "bg-paper2 text-ink" },
};
const BUCKETS = [["fix_first", "Fix first"], ["next", "Next"], ["later", "Later"]];

function Finding({ f, catalog }) {
  const svc = f.service_key && catalog?.[f.service_key];
  return (
    <li className="rounded-2xl border border-ink/15 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${SEV[f.severity]?.cls}`}>{SEV[f.severity]?.label}</span>
        <h4 className="font-semibold">{f.title}</h4>
      </div>
      <dl className="mt-2 grid gap-x-4 gap-y-1 text-[14px] sm:grid-cols-[7rem_1fr]">
        <dt className="text-muted">What we saw</dt><dd>{f.evidence}</dd>
        <dt className="text-muted">Why it matters</dt><dd>{f.why}</dd>
        <dt className="text-muted">The fix</dt><dd>{f.fix}</dd>
        {svc && (
          <>
            <dt className="text-muted">KODA service</dt>
            <dd>
              {svc.service}
              {svc.includedWithEveryPlan ? " (included with every plan)" : ""}
              {svc.options.length > 0 && <span className="text-muted"> · {svc.options.map((o) => `${o.name} ${o.price} ${o.note} (${o.timeline})`).join(" or ")}</span>}
            </dd>
          </>
        )}
      </dl>
    </li>
  );
}

function AuditPanel({ requestId, call, existing, onChange }) {
  const [audit, setAudit] = useState(null);
  const [notes, setNotes] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    call("catalog").then((c) => setCatalog(c.services)).catch(() => {});
    if (existing) call(`audits/${existing}`).then((r) => { setAudit(r.audit); setNotes(r.notes); }).catch((e) => setErr(e.message));
  }, [call, existing]);

  async function run() {
    setErr("");
    try {
      setBusy("Creating the audit…");
      const { audit: a } = await call(`requests/${requestId}/audits`, { method: "POST" });
      setBusy("Reading up to 10 pages, links, images and headers (up to a minute)…");
      await call(`audits/${a.id}/crawl`, { method: "POST" });
      setBusy("Asking Google about speed on a phone…");
      await call(`audits/${a.id}/speed`, { method: "POST", body: { strategy: "mobile" } });
      setBusy("Asking Google about speed on a computer…");
      await call(`audits/${a.id}/speed`, { method: "POST", body: { strategy: "desktop" } });
      setBusy("Working out the findings…");
      const r = await call(`audits/${a.id}/analyse`, { method: "POST" });
      setAudit(r.audit);
      setNotes(r.notes);
      onChange?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }

  const findings = audit?.findings || [];
  const c = audit?.crawl;
  const speed = audit?.pagespeed || {};
  return (
    <Card
      title="In-depth audit"
      right={<button className={dark} disabled={!!busy} onClick={run}>{busy ? "Running…" : audit ? "Run again" : "Run in-depth audit"}</button>}
    >
      {busy && <p role="status" className="text-[14px]">{busy}</p>}
      {err && <p role="alert" className="text-[14px]">{err}</p>}
      {!audit && !busy && !err && <p className="text-[14px] text-muted">Reads the home page and up to 9 key pages, checks links, images, security headers, redirects, sitemap and robots, and asks Google for Core Web Vitals and accessibility on a phone and a computer. Search, conversion and the manual-review checklist come in the next steps.</p>}
      {audit && c && (
        <>
          <p className="text-[14px]">
            Read <b>{c.pages?.filter((p) => p.status).length}</b> {c.pages?.filter((p) => p.status).length === 1 ? "page" : "pages"}{c.site?.links ? <>, checked <b>{c.site.links.checked}</b> of {c.site.links.total} links</> : null}
            {["mobile", "desktop"].map((d) => (speed[d]?.scores ? <span key={d}> · Google {d}: speed <b>{speed[d].scores.speed}</b>, accessibility {speed[d].scores.accessibility}</span> : null))}.
            {" "}Re-running keeps anything you edited.
          </p>
          {notes.length > 0 && (
            <div className="mt-3 rounded-2xl bg-paper2 p-3 text-[14px]">
              <b>Not checked yet</b>
              <ul className="mt-1 list-disc pl-5">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          )}
          <details className="mt-3">
            <summary className="cursor-pointer text-[14px] underline">Pages read ({c.pages?.length})</summary>
            <ul className="mt-2 text-[14px]">{c.pages?.map((p, i) => <li key={i}>{p.status || "failed"} · {p.url}{p.error ? ` · ${p.error}` : ""}</li>)}</ul>
          </details>
          {findings.length === 0 && <p className="mt-4 text-[14px]">No technical problems found in what was checked.</p>}
          {BUCKETS.map(([k, label]) => {
            const items = findings.filter((f) => f.bucket === k && f.include !== false);
            return items.length ? (
              <div key={k} className="mt-5">
                <h3 className="xwide text-[0.95rem]">{label} <span className="text-muted">({items.length})</span></h3>
                <ul className="mt-2 grid gap-3">{items.map((f) => <Finding key={f.id} f={f} catalog={catalog} />)}</ul>
              </div>
            ) : null;
          })}
          <p className="mt-4 text-[13px] text-muted">Technical findings only so far. Editing, the search and conversion checks and the manual-review checklist are the next steps.</p>
        </>
      )}
    </Card>
  );
}

function Detail({ id, call, go, retentionDays }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const load = useCallback(() => {
    call(`requests/${id}`).then((d) => { setData(d); setNotes(d.request.admin_notes || ""); }).catch((e) => setErr(e.message));
  }, [call, id]);
  useEffect(load, [load]);

  async function patch(body, ok) {
    setMsg("");
    try {
      const r = await call(`requests/${id}`, { method: "PATCH", body });
      setData((d) => ({ ...d, request: r.request }));
      setMsg(ok);
    } catch (e) {
      setMsg(e.message);
    }
  }
  async function remove() {
    if (!window.confirm("Delete this request, its audit and the send log for good? This cannot be undone.")) return;
    try {
      await call(`requests/${id}`, { method: "DELETE" });
      go("/command");
    } catch (e) {
      setMsg(e.message);
    }
  }

  if (err) return <p role="alert" className="mt-8">{err}</p>;
  if (!data) return <p className="mt-8 text-muted">Loading…</p>;
  const r = data.request;
  const f = r.auto_findings;
  const replySubject = `Your detailed website audit: ${hostOf(r.site_url)}`;
  return (
    <>
      <p className="mt-6"><a href="/command" onClick={(e) => { e.preventDefault(); go("/command"); }} className="text-[14px] underline">← All requests</a></p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="xwide text-[1.4rem]">{r.business || hostOf(r.site_url)}</h1>
        <Badge s={r.status} />
      </div>

      <Card title="Request">
        <dl className="grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted">Website</dt><dd><a className="underline" href={r.site_url} target="_blank" rel="noopener noreferrer">{r.site_url}</a></dd>
          <dt className="text-muted">Email</dt><dd>{r.email}</dd>
          <dt className="text-muted">Business</dt><dd>{r.business || "–"}</dd>
          <dt className="text-muted">Phone</dt><dd>{r.phone || "–"}</dd>
          <dt className="text-muted">Their note</dt><dd className="whitespace-pre-wrap">{r.note || "–"}</dd>
          <dt className="text-muted">Received</dt><dd>{when(r.created_at)}</dd>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <a className={dark} href={`mailto:${r.email}?subject=${encodeURIComponent(replySubject)}`}>Reply by email</a>
        </div>
      </Card>

      <AuditPanel requestId={id} call={call} existing={data.audits[0]?.id} onChange={load} />

      <Card title="Status and notes">
        <label className="text-[14px] text-muted" htmlFor="st">Status</label>
        <select id="st" className={`${field} mt-1 max-w-xs`} value={r.status} onChange={(e) => patch({ status: e.target.value }, "Status saved.")}>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <label className="mt-4 block text-[14px] text-muted" htmlFor="nt">Your notes (private)</label>
        <textarea id="nt" className={`${field} mt-1 min-h-[7rem]`} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className={`${light} mt-2`} onClick={() => patch({ admin_notes: notes }, "Notes saved.")}>Save notes</button>
        {msg && <p role="status" className="mt-3 text-[14px]">{msg}</p>}
      </Card>

      <Card title="What the automatic check found">
        <p className="mb-3 text-[13px] text-muted">This came back from the visitor's browser with their request, so treat it as a starting point. The in-depth audit checks the site again itself.</p>
        {!f ? <p className="text-muted">No automatic findings were attached.</p> : (
          <>
            {f.scores && <p className="text-[15px]"><b>Speed on a phone {f.scores.speed ?? "–"}</b> · Accessibility {f.scores.accessibility ?? "–"} · Search {f.scores.seo ?? "–"} · Best practice {f.scores.practice ?? "–"} <span className="text-muted">(out of 100)</span></p>}
            {f.fixes?.length > 0 && <ol className="mt-3 list-decimal pl-5 text-[15px]">{f.fixes.map((x, i) => <li key={i} className="mt-1"><b>{x.title}.</b> {x.body}</li>)}</ol>}
            {f.checks?.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-[14px] underline">All {f.checks.length} checks</summary>
                <ul className="mt-2 text-[14px]">{f.checks.map((c, i) => <li key={i} className="mt-1"><b>{c.status.toUpperCase()}</b> · {c.label}{c.detail ? <span className="text-muted"> · {c.detail}</span> : null}</li>)}</ul>
              </details>
            )}
          </>
        )}
      </Card>

      <Card title="Their data">
        <p className="text-[14px] text-muted">We keep only what they submitted. This request deletes itself on {when(r.delete_after)} (about {retentionDays} days after it arrived). You can delete it sooner.</p>
        <button className={`${danger} mt-3`} onClick={remove}>Delete this request</button>
      </Card>

      {data.sends.length > 0 && (
        <Card title="Sent emails">
          <ul className="text-[14px]">{data.sends.map((s) => <li key={s.id}>{when(s.sent_at)} · {s.to_email} · {s.subject} · {s.ok ? "sent" : "failed"}</li>)}</ul>
        </Card>
      )}
    </>
  );
}

export default function Command() {
  const [session, setSession] = useState(undefined);
  const [me, setMe] = useState(null);
  const [path, go] = usePath();

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const token = session?.access_token;
  const call = useCallback(
    async (route, { method = "GET", body } = {}) => {
      const res = await fetch(`/api/command/${route}`, {
        method,
        headers: { authorization: `Bearer ${token}`, ...(body ? { "content-type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.ok === false) throw new Error(res.status === 401 ? "This account is not allowed here." : j.error || "Something went wrong.");
      return j;
    },
    [token]
  );

  useEffect(() => {
    if (token) call("me").then(setMe).catch(() => setMe({ denied: true }));
  }, [token, call]);

  if (!sb) return <Shell><p className="mt-10">Sign-in is not set up yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel (see COMMAND-CENTER.md).</p></Shell>;
  if (session === undefined) return <p className="p-10 text-muted">Loading…</p>;
  if (!session) return <SignIn />;
  const out = <button className={light} onClick={() => sb.auth.signOut()}>Sign out</button>;
  if (me?.denied) return <Shell right={out}><p className="mt-10">This account is not allowed here. Sign out and use {EMAIL}.</p></Shell>;
  if (!me) return <p className="p-10 text-muted">Loading…</p>;

  const m = path.match(/^\/command\/([0-9a-f-]{36})$/i);
  return (
    <Shell right={out}>
      {m ? <Detail id={m[1]} call={call} go={go} retentionDays={me.retentionDays} /> : <Inbox call={call} go={go} />}
      <p className="mt-10 text-[12px] text-muted">Private page. Nothing here is public or listed in search.</p>
    </Shell>
  );
}
