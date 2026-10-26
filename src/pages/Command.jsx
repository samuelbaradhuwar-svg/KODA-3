import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Logo } from "../components/ui.jsx";
import { EMAIL } from "../lib/utils.js";
import { field, dark, light, danger, when, hostOf, STATUS, Badge, Card } from "./command-ui.jsx";
import AuditPanel from "./CommandAudit.jsx";
import { Report } from "./Report.jsx";

// KODA email authenticator (private, noindex; the code and routes still say "command"). Signs in with an emailed link; the server (api/command) checks the signed-in
// address on every request, so this page is a convenience and not the guard.
const SB_URL = import.meta.env.VITE_SUPABASE_URL;
// Supabase calls this the "anon" key or the newer "publishable" key. Either name works; both are public by design.
const SB_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
          <span className="xwide text-[0.95rem] tracking-[-0.02em]">Email authenticator</span>
        </div>
        {right}
      </header>
      {children}
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function go(e) {
    e.preventDefault();
    setMsg("");
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/command` } });
    setMsg(
      !error
        ? "If that address is allowed, a sign-in link is on its way. Check spam too."
        : error.status === 429
          ? "Too many sign-in emails were requested just now. Check your inbox and spam for the earlier link, or wait about an hour and try again."
          : "That did not work. Check the address and try again."
    );
  }
  return (
    <form onSubmit={go} className="mx-auto mt-24 max-w-sm px-4">
      <Logo />
      <h1 className="xwide mt-6 text-[1.4rem]">Email authenticator</h1>
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

function Preview({ id, call, go }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    call(`audits/${id}/report`).then((r) => setData(r.report)).catch((e) => setErr(e.message));
  }, [call, id]);
  if (err) return <p role="alert" className="p-10">{err}</p>;
  if (!data) return <p className="p-10 text-muted">Loading…</p>;
  return <Report data={data} preview />;
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
    if (token) call("me").then(setMe).catch((e) => setMe({ denied: true, message: e.message }));
  }, [token, call]);

  if (!sb) return <Shell><p className="mt-10">Sign-in is not set up yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) in Vercel (see COMMAND-CENTER.md).</p></Shell>;
  if (session === undefined) return <p className="p-10 text-muted">Loading…</p>;
  if (!session) return <SignIn />;
  const out = <button className={light} onClick={() => sb.auth.signOut()}>Sign out</button>;
  if (me?.denied) return <Shell right={out}>
      <p role="alert" className="mt-10">{me.message || "Something went wrong."}</p>
      {/not allowed/i.test(me.message || "") && <p className="mt-2 text-muted">Sign out and use {EMAIL}.</p>}
    </Shell>;
  if (!me) return <p className="p-10 text-muted">Loading…</p>;

  const pv = path.match(/^\/command\/([0-9a-f-]{36})\/preview$/i);
  if (pv) return <Preview id={pv[1]} call={call} go={go} />;
  const m = path.match(/^\/command\/([0-9a-f-]{36})$/i);
  return (
    <Shell right={out}>
      {m ? <Detail id={m[1]} call={call} go={go} retentionDays={me.retentionDays} /> : <Inbox call={call} go={go} />}
      <p className="mt-10 text-[12px] text-muted">Private page. Nothing here is public or listed in search.</p>
    </Shell>
  );
}
