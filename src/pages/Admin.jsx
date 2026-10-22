import React, { useCallback, useEffect, useRef, useState } from "react";

// KODA Autopilot admin: approve drafts, switch clients off, run a self-test, send onboarding links.
// Signs in with an emailed link. Only a user that already exists in Supabase Auth AND is listed in ap_admins gets in;
// every action is checked again on the server (api/autopilot), so this page is a convenience, not the guard.
const URL_ = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

const field = "w-full rounded-xl border border-ink/20 bg-paper px-3 py-2 text-[15px]";
const btn = "rounded-full px-4 py-2 text-[14px] font-semibold transition-opacity disabled:opacity-40";
const dark = `${btn} bg-ink text-paper`;
const light = `${btn} border border-ink/30 bg-paper`;
const danger = `${btn} bg-[#c0392b] text-white`;
const when = (t) => (t ? new Date(t).toLocaleString("en-ZA") : "");

function useNoIndex(title) {
  useEffect(() => {
    document.title = title;
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex,nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, [title]);
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

function SignIn({ sb }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function go(e) {
    e.preventDefault();
    setMsg("");
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/admin` } });
    setMsg(error ? "That did not work. Check the address." : "If that address is an admin, a sign-in link is on its way.");
  }
  return (
    <form onSubmit={go} className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="xwide text-[1.4rem]">Autopilot</h1>
      <p className="mt-3 text-muted">Sign in with your email. We send you a link.</p>
      <input className={`${field} mt-5`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@heykoda.co.za" autoComplete="email" />
      <button className={`${dark} mt-3 w-full`} type="submit">Send link</button>
      {msg && <p role="status" className="mt-3 text-[14px]">{msg}</p>}
    </form>
  );
}

function Dashboard({ sb, session }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const token = session.access_token;

  const api = useCallback(
    async (route, body) => {
      const res = await fetch(`/api/autopilot/admin/${route}`, {
        method: body ? "POST" : "GET",
        headers: { authorization: `Bearer ${token}`, ...(body ? { "content-type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || `Error ${res.status}`);
      return j;
    },
    [token]
  );
  const load = useCallback(() => api("overview").then(setData).catch((e) => setErr(e.message)), [api]);
  useEffect(() => { load(); }, [load]);
  const act = (route, body, after) => async () => {
    setErr("");
    try {
      const r = await api(route, body);
      after?.(r);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (err && !data) return <p className="mx-auto mt-24 max-w-md px-4">{err} <button className={light} onClick={() => sb.auth.signOut()}>Sign out</button></p>;
  if (!data) return <p className="mx-auto mt-24 max-w-md px-4">Loading...</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="xwide text-[1.4rem]">Autopilot</h1>
        <div className="flex gap-2">
          <button className={light} onClick={load}>Refresh</button>
          <button className={light} onClick={() => sb.auth.signOut()}>Sign out</button>
        </div>
      </div>
      {err && <p role="alert" className="mt-4 rounded-xl bg-[#c0392b]/10 p-3 text-[14px] text-[#c0392b]">{err}</p>}
      {link && (
        <p className="mt-4 break-all rounded-xl bg-paper2 p-3 text-[14px]">
          Onboarding link (shown once, valid 7 days): <b>{link}</b>
        </p>
      )}

      <Card title={`Waiting for you (${data.pending_approvals.length})`}>
        {data.pending_approvals.length === 0 && <p className="text-muted">Nothing to approve.</p>}
        {data.pending_approvals.map((a) => (
          <article key={a.id} className="mb-4 rounded-2xl border border-ink/15 p-4">
            <p className="text-[14px] text-muted">{a.business_name} · {a.task_type} · lapses {when(a.expires_at)}</p>
            <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-paper2 p-3 text-[13px]">{JSON.stringify(a.preview, null, 2)}</pre>
            <input className={`${field} mt-3`} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Note" />
            <div className="mt-3 flex gap-2">
              <button className={dark} onClick={act("approval", { id: a.id, hash: a.payload_hash, decision: "approve", note }, () => setNote(""))}>Approve</button>
              <button className={light} onClick={act("approval", { id: a.id, hash: a.payload_hash, decision: "reject", note }, () => setNote(""))}>Reject</button>
            </div>
          </article>
        ))}
      </Card>

      <Card title="Clients">
        <div className="grid gap-4">
          {data.clients.map((c) => (
            <article key={c.id} className="rounded-2xl border border-ink/15 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{c.business_name} <span className="font-normal text-muted">· {c.plan_id}{c.is_internal ? " · client zero" : ""}</span></p>
                <p className={`rounded-full px-3 py-1 text-[12px] font-semibold ${c.kill_switch ? "bg-[#c0392b] text-white" : c.runnable ? "bg-accent text-ink" : "bg-paper2 text-muted"}`}>
                  {c.kill_switch ? "SWITCHED OFF" : c.runnable ? "running" : "not running"}
                </p>
              </div>
              <p className="mt-1 text-[14px] text-muted">status {c.status} · billing {c.billing_status}{c.price_cents != null ? ` · agreed R${(c.price_cents / 100).toFixed(2)}` : ""}{c.has_profile ? " · brand profile saved" : " · no brand profile yet"}</p>
              <p className="mt-1 text-[14px] text-muted">auto: {Object.entries(c.automation).filter(([, m]) => m === "auto").map(([t]) => t).join(", ") || "nothing (everything needs approval)"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.kill_switch ? (
                  <button className={dark} onClick={act("kill", { clientId: c.id, on: false })}>Switch back on</button>
                ) : (
                  <button className={danger} onClick={() => confirm(`Switch off all work for ${c.business_name}?`) && act("kill", { clientId: c.id, on: true, reason: "from admin page" })()}>Kill switch</button>
                )}
                <button className={light} onClick={act("invite", { clientId: c.id }, (r) => setLink(r.link))}>Onboarding link</button>
                <button className={light} onClick={act("selftest", { clientId: c.id })}>Run self-test</button>
                <select className={`${light} pr-8`} aria-label={`Status for ${c.business_name}`} value={c.status} onChange={(e) => act("client-status", { clientId: c.id, status: e.target.value })()}>
                  {["onboarding", "active", "notice", "paused", "cancelled"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </article>
          ))}
        </div>
        <NewClient onCreate={(b) => act("client", b)()} />
      </Card>

      <Card title="Recent tasks">
        <table className="w-full text-left text-[14px]">
          <tbody>
            {data.recent_tasks.map((t) => (
              <tr key={t.id} className="border-t border-ink/10 align-top">
                <td className="py-2 pr-3">{t.business_name}</td><td className="pr-3">{t.task_type}</td>
                <td className="pr-3 font-semibold">{t.state}</td><td className="text-muted">{t.last_error || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Audit log" right={<span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${data.audit_chain_ok ? "bg-accent text-ink" : "bg-[#c0392b] text-white"}`}>{data.audit_chain_ok ? "chain intact" : "CHAIN BROKEN"}</span>}>
        <ul className="grid gap-1 text-[13px]">
          {data.recent_audit.map((a) => <li key={a.id}><span className="text-muted">{when(a.at)}</span> · {a.actor} · <b>{a.action}</b></li>)}
        </ul>
      </Card>
    </div>
  );
}

function NewClient({ onCreate }) {
  const [f, setF] = useState({ businessName: "", plan: "presence", email: "", website: "", internal: false });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (
    <form className="mt-6 grid gap-3 rounded-2xl bg-paper2 p-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onCreate(f); setF({ ...f, businessName: "", email: "", website: "" }); }}>
      <p className="font-semibold sm:col-span-2">Add a client</p>
      <input className={field} required placeholder="Business name" value={f.businessName} onChange={set("businessName")} aria-label="Business name" />
      <select className={field} value={f.plan} onChange={set("plan")} aria-label="Plan">{["presence", "growth", "performance"].map((p) => <option key={p}>{p}</option>)}</select>
      <input className={field} type="email" placeholder="Contact email" value={f.email} onChange={set("email")} aria-label="Contact email" />
      <input className={field} placeholder="Website" value={f.website} onChange={set("website")} aria-label="Website" />
      <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={f.internal} onChange={set("internal")} /> This is KODA itself (client zero, no billing)</label>
      <button className={`${dark} sm:col-span-2 sm:justify-self-start`} type="submit">Add client</button>
    </form>
  );
}

export default function Admin() {
  useNoIndex("Autopilot");
  const [sb, setSb] = useState(null);
  const [session, setSession] = useState(undefined);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !URL_ || !ANON) return;
    started.current = true;
    import("@supabase/supabase-js").then(({ createClient }) => {
      const client = createClient(URL_, ANON);
      setSb(client);
      client.auth.getSession().then(({ data }) => setSession(data.session));
      client.auth.onAuthStateChange((_e, s) => setSession(s));
    });
  }, []);

  if (!URL_ || !ANON) return <p className="mx-auto mt-24 max-w-md px-4">Autopilot is not set up yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see docs/AUTOPILOT-SETUP.md).</p>;
  if (!sb || session === undefined) return <p className="mx-auto mt-24 max-w-md px-4">Loading...</p>;
  return <div className="min-h-screen bg-paper text-ink">{session ? <Dashboard sb={sb} session={session} /> : <SignIn sb={sb} />}</div>;
}
