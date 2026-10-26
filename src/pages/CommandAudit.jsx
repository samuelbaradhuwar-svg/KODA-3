import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { field, dark, light, danger, check, when, Card } from "./command-ui.jsx";
import EmailPanel from "./CommandEmail.jsx";

// The audit workspace on a request: run the checks, describe the business, edit every finding, and fill in the
// things a machine cannot judge. Nothing here is sent to the client; that happens in a later step.
const SEV = {
  high: { label: "High", cls: "bg-[#FF9A8B] text-[#101010]" },
  medium: { label: "Medium", cls: "bg-[#FFC76B] text-[#101010]" },
  low: { label: "Low", cls: "bg-paper2 text-ink" },
  info: { label: "Info", cls: "bg-paper2 text-ink" },
};
const BUCKETS = [["fix_first", "Fix first"], ["next", "Next"], ["later", "Later"]];
const AREA = { technical: "Technical", search: "Search", conversion: "Conversion", manual: "Manual review" };
const MSTATUS = [["todo", "Not reviewed"], ["ok", "Looks fine"], ["issue", "Problem"], ["na", "Not relevant"]];
const lbl = "block text-[13px] text-muted";

const newId = () => `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const priceLine = (svc) => (svc?.options?.length ? svc.options.map((o) => `${o.name} ${o.price} ${o.note} (${o.timeline})`).join(" or ") : "");

function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className={lbl}>{label}</label>
      {children}
    </div>
  );
}

function FindingCard({ f, services, onChange, onDelete, startOpen }) {
  const [edit, setEdit] = useState(!!startOpen);
  const svc = f.service_key && services?.[f.service_key];
  const set = (k, v) => onChange({ ...f, [k]: v });
  const id = (k) => `${f.id}-${k}`;
  return (
    <li className={`rounded-2xl border p-4 ${f.include === false ? "border-dashed border-ink/25 opacity-70" : "border-ink/15"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${SEV[f.severity]?.cls}`}>{SEV[f.severity]?.label}</span>
        <span className="rounded-full border border-ink/20 px-2 py-0.5 text-[12px] text-muted">{AREA[f.area] || f.area}</span>
        {f.edited && <span className="text-[12px] text-muted">edited</span>}
        {f.source === "manual" && <span className="text-[12px] text-muted">added by you</span>}
        <button className={`${light} ml-auto`} onClick={() => setEdit(!edit)} aria-expanded={edit}>{edit ? "Done" : "Edit"}</button>
      </div>
      <h4 className="mt-1 font-semibold [overflow-wrap:anywhere]">{f.title || "(no title)"}</h4>

      {!edit ? (
        <dl className="mt-2 grid gap-x-4 gap-y-1 text-[14px] sm:grid-cols-[7rem_1fr]">
          <dt className="text-muted">What we saw</dt><dd className="whitespace-pre-wrap">{f.evidence}</dd>
          <dt className="text-muted">Why it matters</dt><dd className="whitespace-pre-wrap">{f.why}</dd>
          <dt className="text-muted">The fix</dt><dd className="whitespace-pre-wrap">{f.fix}</dd>
          {svc && (
            <>
              <dt className="text-muted">KODA service</dt>
              <dd>{svc.service}{svc.includedWithEveryPlan ? " (included with every plan)" : ""}{priceLine(svc) && <span className="text-muted"> · {priceLine(svc)}</span>}</dd>
            </>
          )}
        </dl>
      ) : (
        <div className="mt-3 grid gap-3">
          <Field id={id("t")} label="Title"><input id={id("t")} className={field} maxLength={140} value={f.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field id={id("s")} label="Severity">
              <select id={id("s")} className={field} value={f.severity} onChange={(e) => set("severity", e.target.value)}>
                {["high", "medium", "low", "info"].map((k) => <option key={k} value={k}>{SEV[k].label}</option>)}
              </select>
            </Field>
            <Field id={id("b")} label="Group">
              <select id={id("b")} className={field} value={f.bucket} onChange={(e) => set("bucket", e.target.value)}>
                {BUCKETS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
            <Field id={id("v")} label="KODA service">
              <select id={id("v")} className={field} value={f.service_key || ""} onChange={(e) => set("service_key", e.target.value || null)}>
                <option value="">None</option>
                {Object.entries(services || {}).map(([k, v]) => <option key={k} value={k}>{v.service}</option>)}
              </select>
            </Field>
          </div>
          {svc && <p className="text-[13px] text-muted">Price and timeline come from the website's pricing: {priceLine(svc) || "no listed price for this service, so the report says it is agreed with you."}</p>}
          <Field id={id("e")} label="What we saw (the evidence)"><textarea id={id("e")} className={`${field} min-h-[4.5rem]`} maxLength={900} value={f.evidence} onChange={(e) => set("evidence", e.target.value)} /></Field>
          <Field id={id("w")} label="Why it matters (plain English)"><textarea id={id("w")} className={`${field} min-h-[4.5rem]`} maxLength={600} value={f.why} onChange={(e) => set("why", e.target.value)} /></Field>
          <Field id={id("f")} label="The fix"><textarea id={id("f")} className={`${field} min-h-[4.5rem]`} maxLength={700} value={f.fix} onChange={(e) => set("fix", e.target.value)} /></Field>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-[44px] items-center gap-3 text-[14px]"><input className={check} type="checkbox" checked={f.include !== false} onChange={(e) => set("include", e.target.checked)} /> Include in the client report</label>
            {f.source === "manual" && <button className={danger} onClick={onDelete}>Delete this finding</button>}
          </div>
        </div>
      )}
    </li>
  );
}

function ReportPanel({ audit, call, unsaved, onAudit, onLink }) {
  const touched = useRef(false); // once you start typing, a background reload must not overwrite it
  const [rep, setRep] = useState(null);
  const [link, setLink] = useState(null);
  const [sum, setSum] = useState("");
  const [plan, setPlan] = useState("");
  const [wins, setWins] = useState([]);
  const [once, setOnce] = useState("auto");
  const [monthly, setMonthly] = useState("auto");
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [aiOn, setAiOn] = useState(false);
  const [aiBusy, setAiBusy] = useState("");
  const [undo, setUndo] = useState({});

  const load = useCallback(async (force = false) => {
    try {
      const r = await call(`audits/${audit.id}/report`);
      setRep(r.report);
      setLink(r.link);
      setAiOn(Boolean(r.aiConfigured));
      onLink?.(r.link?.active ? r.link.token : "");
      if (force || !touched.current) {
        setSum(r.report.summary);
        setPlan(r.report.plan.text);
        setWins(r.report.choice.winIds);
        setOnce(r.report.choice.once);
        setMonthly(r.report.choice.monthly);
        touched.current = false;
      }
    } catch (e) {
      setErr(e.message);
    }
  }, [call, audit.id, onLink]);
  useEffect(() => { load(); }, [load, audit.updated_at]);

  async function save() {
    setErr(""); setMsg(""); setBusy("Saving…");
    try {
      const r = await call(`audits/${audit.id}`, { method: "PATCH", body: { summary: sum === rep.defaults.summary ? "" : sum, plan: plan === rep.defaults.plan ? "" : plan, manual: { report: { winIds: wins, once, monthly } } } });
      touched.current = false;
      onAudit(r.audit);
      await load(true);
      setMsg("Report settings saved.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }
  async function draftAi(target) {
    setErr(""); setMsg(""); setAiBusy(target);
    try {
      const r = await call(`audits/${audit.id}/ai`, { method: "POST", body: { target } });
      touched.current = true;
      if (target === "summary") { setUndo((u) => ({ ...u, summary: sum })); setSum(r.text); }
      else { setUndo((u) => ({ ...u, plan: plan })); setPlan(r.text); }
      setMsg("AI draft added to the box. Read it, correct anything, then press Save report settings. Nothing is saved or sent until you do.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setAiBusy("");
    }
  }
  const AiRow = ({ target, current, set }) => (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <button className={light} disabled={!aiOn || !!aiBusy || unsaved} onClick={() => draftAi(target)} title={!aiOn ? "AI drafting is not set up" : unsaved ? "Save your findings first" : ""}>{aiBusy === target ? "Drafting…" : "Draft with AI"}</button>
      {undo[target] !== undefined && undo[target] !== current && <button className="inline-flex min-h-[44px] items-center text-[14px] underline" onClick={() => { touched.current = true; set(undo[target]); setUndo((u) => { const n = { ...u }; delete n[target]; return n; }); }}>Undo the AI draft</button>}
      {!aiOn && <span className="text-[13px] text-muted">AI drafting is off (it needs an Anthropic key in Vercel). You can write everything by hand.</span>}
      {aiOn && <span className="text-[13px] text-muted">It only sees the findings, not the business name or site text, and may not invent figures or promise results.</span>}
    </div>
  );

  async function makeLink(action) {
    setErr(""); setMsg(""); setBusy(action === "revoke" ? "Withdrawing…" : "Creating…");
    try {
      const r = await call(`audits/${audit.id}/link`, { method: "POST", body: { action, days } });
      setLink(r.link);
      onLink?.(r.link?.active ? r.link.token : "");
      setCopied(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }
  const url = link?.token ? `${window.location.origin}/report/${link.token}` : "";
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setErr("Could not copy. Select the link and copy it by hand.");
    }
  }
  if (!rep) return <Card title="Client report"><p className="text-[14px] text-muted">{err || "Loading…"}</p></Card>;
  const included = rep.groups.flatMap((g) => g.findings);
  const toggleWin = (id) => { touched.current = true; setWins((w) => (w.includes(id) ? w.filter((x) => x !== id) : w.length >= 3 ? w : [...w, id])); };
  const sugOnce = rep.suggested.once || "no one-off plan";
  const sugMonthly = rep.suggested.monthly || "no monthly plan";
  return (
    <Card title="Client report" id="sec-report" right={<a className={light} href={`/command/${audit.id}/preview`} target="_blank" rel="noopener noreferrer">Preview report</a>}>
      <p className="text-[14px] text-muted">A plain-English page for the client with a summary, the three biggest wins, every finding, your manual review, a proposed KODA plan and an honest note that results are not guaranteed. Everything below is editable. Nothing is sent from here; the link only works once you create it.</p>
      {rep.incomplete?.length > 0 && <p role="status" className="mt-3 rounded-2xl bg-[#FFC76B] p-3 text-[14px] text-[#101010]"><b>{rep.incomplete.length} {rep.incomplete.length === 1 ? "finding has" : "findings have"} no explanation or fix yet:</b> {rep.incomplete.map((f) => f.title).join("; ")}. Fill them in under Findings, or tick "Include in the client report" off, before you send.</p>}
      {unsaved && <p role="status" className="mt-3 rounded-2xl bg-[#FFC76B] p-3 text-[14px] font-semibold text-[#101010]">You have unsaved changes to the findings. Save them first, or the report will not show them.</p>}

      <div className="mt-4">
        <label className={lbl} htmlFor="rp-sum">Summary (the default is written from the findings; change anything)</label>
        <textarea id="rp-sum" className={`${field} min-h-[8rem]`} maxLength={4000} value={sum} onChange={(e) => { touched.current = true; setSum(e.target.value); }} />
        <AiRow target="summary" current={sum} set={setSum} />
        {sum !== rep.defaults.summary && <button className="inline-flex min-h-[44px] items-center text-[14px] underline" onClick={() => { touched.current = true; setSum(rep.defaults.summary); }}>Use the automatic summary again</button>}
      </div>

      <fieldset className="mt-4">
        <legend className={lbl}>The three biggest wins (pick up to 3; leave empty to use the top three automatically)</legend>
        <ul className="mt-1 grid gap-1">
          {included.map((f) => (
            <li key={f.id}><label className="flex min-h-[44px] items-center gap-3 text-[14px]"><input className={check} type="checkbox" checked={wins.includes(f.id)} disabled={!wins.includes(f.id) && wins.length >= 3} onChange={() => toggleWin(f.id)} /><span>{f.title} <span className="text-muted">({SEV[f.severity]?.label})</span>{!wins.length && rep.suggested.winIds.includes(f.id) ? <span className="text-muted"> · automatic pick</span> : null}</span></label></li>
          ))}
        </ul>
      </fieldset>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={lbl} htmlFor="rp-once">Recommended one-off plan</label>
          <select id="rp-once" className={field} value={once} onChange={(e) => { touched.current = true; setOnce(e.target.value); }}>
            <option value="auto">Automatic: {sugOnce}</option>
            <option value="none">None</option>
            {["Starter", "Business", "Custom"].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl} htmlFor="rp-monthly">Recommended monthly plan</label>
          <select id="rp-monthly" className={field} value={monthly} onChange={(e) => { touched.current = true; setMonthly(e.target.value); }}>
            <option value="auto">Automatic: {sugMonthly}</option>
            <option value="none">None</option>
            {["Presence", "Growth", "Performance"].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <p className="mt-1 text-[13px] text-muted">Plan names, prices and timelines come from the website's pricing, so they can never disagree with it.</p>

      <div className="mt-4">
        <label className={lbl} htmlFor="rp-plan">How KODA would fix it (the default is built from the findings; change anything)</label>
        <textarea id="rp-plan" className={`${field} min-h-[8rem]`} maxLength={6000} value={plan} onChange={(e) => { touched.current = true; setPlan(e.target.value); }} />
        <AiRow target="plan" current={plan} set={setPlan} />
        {plan !== rep.defaults.plan && <button className="inline-flex min-h-[44px] items-center text-[14px] underline" onClick={() => { touched.current = true; setPlan(rep.defaults.plan); }}>Use the automatic text again</button>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button className={dark} disabled={!!busy} onClick={save}>Save report settings</button>
        <a className={light} href={`/command/${audit.id}/preview`} target="_blank" rel="noopener noreferrer">Preview report</a>
        {busy && <span role="status" className="text-[14px]">{busy}</span>}
        {msg && !busy && <span role="status" className="text-[14px]">{msg}</span>}
      </div>
      {err && <p role="alert" className="mt-2 text-[14px]">{err}</p>}
      <p className="mt-1 text-[13px] text-muted">The preview shows what is saved. Save first.</p>

      <div className="mt-6 rounded-2xl border border-ink/15 p-4">
        <h3 className="xwide text-[0.95rem]">Private link</h3>
        {link?.active ? (
          <>
            <p className="mt-2 break-all rounded-xl bg-paper2 p-3 text-[14px]">{url}</p>
            <p className="mt-1 text-[13px] text-muted">Expires {when(link.expires)}. Anyone with this link can read the report until then or until you withdraw it.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className={dark} onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
              <a className={light} href={url} target="_blank" rel="noopener noreferrer">Open as the client</a>
              <button className={danger} disabled={!!busy} onClick={() => makeLink("revoke")}>Withdraw link</button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-[14px] text-muted">{link ? "The last link has expired." : "No link yet."} The client only sees the report once you create a link and send it to them.</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="text-[14px]" htmlFor="rp-days">Valid for</label>
              <select id="rp-days" className={`${field} max-w-[9rem]`} value={days} onChange={(e) => setDays(Number(e.target.value))}>
                {[7, 30, 90].map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
              <button className={dark} disabled={!!busy || unsaved} onClick={() => makeLink("create")}>Create private link</button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export default function AuditPanel({ requestId, call, existing, onChange }) {
  const [audit, setAudit] = useState(null);
  const [notes, setNotes] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [findings, setFindings] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [inputs, setInputs] = useState({});
  const [check, setCheck] = useState({});
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [opened, setOpened] = useState(null);
  const [linkKey, setLinkKey] = useState("");

  // keepEdits: leave the findings on screen alone (they have unsaved changes the server has not seen)
  const take = useCallback((a, n, keepEdits = false) => {
    setAudit(a);
    if (n) setNotes(n);
    if (!keepEdits) {
      setFindings(a.findings || []);
      setDirty(false);
    }
    setInputs(a.manual?.inputs || {});
    setCheck(a.manual?.checklist || {});
  }, []);

  useEffect(() => {
    call("catalog").then(setCatalog).catch(() => {});
    if (existing) call(`audits/${existing}`).then((r) => take(r.audit, r.notes)).catch((e) => setErr(e.message));
  }, [call, existing, take]);

  const services = catalog?.services;
  const upd = (f) => { setFindings((all) => all.map((x) => (x.id === f.id ? f : x))); setDirty(true); };

  async function saveFindings() {
    const r = await call(`audits/${audit.id}`, { method: "PATCH", body: { findings } });
    take(r.audit, r.notes);
    return r;
  }

  async function run() {
    setErr(""); setMsg("");
    try {
      if (dirty) await saveFindings();
      setBusy("Creating the audit…");
      const { audit: a } = await call(`requests/${requestId}/audits`, { method: "POST" });
      if (Object.keys(inputs).length) await call(`audits/${a.id}`, { method: "PATCH", body: { manual: { inputs } } });
      setBusy("Reading up to 10 pages, links, images and headers (up to a minute)…");
      await call(`audits/${a.id}/crawl`, { method: "POST" });
      setBusy("Asking Google about speed on a phone…");
      await call(`audits/${a.id}/speed`, { method: "POST", body: { strategy: "mobile" } });
      setBusy("Asking Google about speed on a computer…");
      await call(`audits/${a.id}/speed`, { method: "POST", body: { strategy: "desktop" } });
      setBusy("Working out the findings…");
      const r = await call(`audits/${a.id}/analyse`, { method: "POST" });
      take(r.audit, r.notes);
      onChange?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }

  async function saveDetails(andCheck) {
    setErr(""); setMsg("");
    try {
      setBusy("Saving…");
      if (dirty && andCheck) await saveFindings();
      let r = await call(`audits/${audit.id}`, { method: "PATCH", body: { manual: { inputs } } });
      if (andCheck) {
        setBusy("Checking again with these details…");
        r = await call(`audits/${audit.id}/analyse`, { method: "POST" });
      }
      take(r.audit, r.notes, dirty && !andCheck);
      setMsg(andCheck ? "Checked again. Your edits were kept." : "Details saved.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }

  async function saveReview() {
    setErr(""); setMsg("");
    try {
      setBusy("Saving…");
      const r = await call(`audits/${audit.id}`, { method: "PATCH", body: { manual: { checklist: check } } });
      take(r.audit, r.notes, dirty);
      setMsg("Manual review saved.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }

  async function saveAll() {
    setErr(""); setMsg("");
    try {
      setBusy("Saving…");
      await saveFindings();
      setMsg("Findings saved.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }

  function addFinding(base = {}) {
    const f = { id: newId(), area: "manual", severity: "medium", title: "", evidence: "", why: "", fix: "", service_key: null, bucket: "next", include: true, source: "manual", ...base };
    setFindings((all) => [...all, f]);
    setOpened(f.id);
    setDirty(true);
  }
  function fromChecklist(item) {
    const id = `manual-${item.key}`;
    if (findings.some((f) => f.id === id)) return;
    const n = check[item.key]?.notes || "";
    const f = item.finding || {};
    addFinding({ id, title: f.title || item.title, evidence: n ? `From our hands-on review: ${n}` : "From our hands-on review.", why: f.why || "", fix: f.fix || "", severity: "medium", bucket: "next", service_key: f.service || null });
  }

  const visible = useMemo(() => findings.filter((f) => f.include !== false), [findings]);
  const hidden = useMemo(() => findings.filter((f) => f.include === false), [findings]);
  const c = audit?.crawl;
  const speed = audit?.pagespeed || {};
  const groups = useMemo(() => {
    const g = {};
    for (const it of catalog?.checklist || []) (g[it.group] ||= []).push(it);
    return g;
  }, [catalog]);
  const todo = (catalog?.checklist || []).filter((i) => (check[i.key]?.status || "todo") === "todo").length;

  return (
    <>
      <Card
        title="In-depth audit"
        id="sec-audit"
        right={<button className={dark} disabled={!!busy} onClick={run}>{busy ? "Working…" : audit ? "Run again" : "Run in-depth audit"}</button>}
      >
        {busy && <p role="status" className="text-[14px]">{busy}</p>}
        {err && <p role="alert" className="text-[14px]">{err}</p>}
        {msg && !busy && <p role="status" className="text-[14px]">{msg}</p>}
        {!audit && !busy && !err && <p className="text-[14px] text-muted">Reads the home page and up to 9 key pages, checks links, images, security headers, redirects, sitemap and robots, asks Google for Core Web Vitals and accessibility on a phone and a computer, and checks titles, descriptions, headings, local details, calls to action and trust signals. Google Business Profile, design and copy are never guessed: they are on the manual checklist below once the audit exists.</p>}
        {audit && c && (
          <>
            <p className="text-[14px]">
              Read <b>{c.pages?.filter((p) => p.status).length}</b> {c.pages?.filter((p) => p.status).length === 1 ? "page" : "pages"}{c.site?.links ? <>, checked <b>{c.site.links.checked}</b> of {c.site.links.total} links</> : null}
              {["mobile", "desktop"].map((d) => (speed[d]?.scores ? <span key={d}> · Google {d}: speed <b>{speed[d].scores.speed}</b>, accessibility {speed[d].scores.accessibility}</span> : null))}.
              {" "}Re-running keeps anything you edited, hid or added.
            </p>
            {notes.length > 0 && (
              <div className="mt-3 rounded-2xl bg-paper2 p-3 text-[14px]">
                <b>Not checked</b>
                <ul className="mt-1 list-disc pl-5">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
              </div>
            )}
            <details className="mt-3">
              <summary className="flex min-h-[44px] cursor-pointer items-center text-[14px] underline">Pages read ({c.pages?.length})</summary>
              <ul className="mt-2 text-[14px]">{c.pages?.map((p, i) => <li key={i}>{p.status || "failed"} · {p.url}{p.error ? ` · ${p.error}` : ""}</li>)}</ul>
            </details>
          </>
        )}
      </Card>

      {audit && (
        <Card title="About this business" id="sec-about" fold="auto">
          <p className="text-[14px] text-muted">A crawler cannot know these, so tell it. They switch on the keyword and local checks (is the trade and town where Google looks, are the phone, address and areas on the site). Separate several with commas.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field id="in-name" label="Business name"><input id="in-name" className={field} value={inputs.businessName || ""} onChange={(e) => setInputs({ ...inputs, businessName: e.target.value })} /></Field>
            <Field id="in-phone" label="Main phone number"><input id="in-phone" className={field} inputMode="tel" value={inputs.phone || ""} onChange={(e) => setInputs({ ...inputs, phone: e.target.value })} /></Field>
            <Field id="in-trade" label="Trade or service (e.g. plumber, plumbing)"><input id="in-trade" className={field} value={inputs.trade || ""} onChange={(e) => setInputs({ ...inputs, trade: e.target.value })} /></Field>
            <Field id="in-town" label="Town (e.g. Durban)"><input id="in-town" className={field} value={inputs.town || ""} onChange={(e) => setInputs({ ...inputs, town: e.target.value })} /></Field>
            <Field id="in-areas" label="Areas they serve (e.g. Umhlanga, Pinetown)"><input id="in-areas" className={field} value={inputs.areas || ""} onChange={(e) => setInputs({ ...inputs, areas: e.target.value })} /></Field>
            <Field id="in-addr" label="Street address (as on Google)"><input id="in-addr" className={field} value={inputs.address || ""} onChange={(e) => setInputs({ ...inputs, address: e.target.value })} /></Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className={dark} disabled={!!busy || !audit.crawl} onClick={() => saveDetails(true)}>Save and check again</button>
            <button className={light} disabled={!!busy} onClick={() => saveDetails(false)}>Save only</button>
          </div>
        </Card>
      )}

      {audit && (
        <Card
          title={`Findings (${visible.length})`}
          id="sec-findings"
          right={<button className={light} onClick={() => addFinding()}>Add a finding</button>}
        >
          {dirty && (
            <div className="sticky bottom-24 z-10 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink/30 bg-paper p-3 text-[14px] shadow sm:bottom-auto sm:top-2">
              <span>You have unsaved changes.</span>
              <button className={dark} disabled={!!busy} onClick={saveAll}>Save findings</button>
            </div>
          )}
          {findings.length === 0 && <p className="text-[14px]">{audit.crawl ? "Nothing found in what was checked. You can still add your own findings." : "Run the audit to generate findings, or add your own."}</p>}
          {BUCKETS.map(([k, label]) => {
            const items = visible.filter((f) => f.bucket === k);
            return items.length ? (
              <div key={k} className="mt-5 first:mt-0">
                <h3 className="xwide text-[0.95rem]">{label} <span className="text-muted">({items.length})</span></h3>
                <ul className="mt-2 grid gap-3">{items.map((f) => <FindingCard key={f.id} f={f} services={services} startOpen={opened === f.id} onChange={upd} onDelete={() => { setFindings((all) => all.filter((x) => x.id !== f.id)); setDirty(true); }} />)}</ul>
              </div>
            ) : null;
          })}
          {hidden.length > 0 && (
            <details className="mt-5">
              <summary className="flex min-h-[44px] cursor-pointer items-center text-[14px] underline">Hidden from the report ({hidden.length})</summary>
              <ul className="mt-2 grid gap-3">{hidden.map((f) => <FindingCard key={f.id} f={f} services={services} onChange={upd} onDelete={() => { setFindings((all) => all.filter((x) => x.id !== f.id)); setDirty(true); }} />)}</ul>
            </details>
          )}
        </Card>
      )}

      {audit && catalog?.checklist && (
        <Card title="Manual review" id="sec-review" fold="auto" right={<span className="text-[13px] text-muted">{todo === 0 ? "All reviewed" : `${todo} of ${catalog.checklist.length} still to review`}</span>}>
          <p className="text-[14px] text-muted">Things the automatic audit cannot judge. Nothing here is guessed: each item stays "Not reviewed" until you check it yourself, and the report says so if you leave it.</p>
          {Object.entries(groups).map(([g, items]) => (
            <div key={g} className="mt-5">
              <h3 className="xwide text-[0.95rem]">{g}</h3>
              <ul className="mt-2 grid gap-3">
                {items.map((it) => {
                  const cur = check[it.key] || { status: "todo", notes: "" };
                  return (
                    <li key={it.key} className="rounded-2xl border border-ink/15 p-4">
                      <p className="font-semibold">{it.title}{cur.status === "todo" && <span className="ml-2 rounded-full bg-[#FFC76B] px-2 py-0.5 text-[12px] font-semibold text-[#101010]">Manual review needed</span>}</p>
                      <p className="mt-1 text-[14px] text-muted">{it.check}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1" role="radiogroup" aria-label={it.title}>
                        {MSTATUS.map(([v, l]) => (
                          <label key={v} className="flex min-h-[44px] items-center gap-2 pr-3 text-[14px]"><input className={check} type="radio" name={`m-${it.key}`} checked={cur.status === v} onChange={() => setCheck({ ...check, [it.key]: { ...cur, status: v } })} /> {l}</label>
                        ))}
                      </div>
                      <label className={`${lbl} mt-2`} htmlFor={`n-${it.key}`}>Notes (these appear in the client report)</label>
                      <textarea id={`n-${it.key}`} className={`${field} min-h-[3.5rem]`} maxLength={2000} value={cur.notes} onChange={(e) => setCheck({ ...check, [it.key]: { ...cur, notes: e.target.value } })} />
                      {cur.status === "issue" && <button className={`${light} mt-2`} disabled={findings.some((f) => f.id === `manual-${it.key}`)} onClick={() => fromChecklist(it)}>{findings.some((f) => f.id === `manual-${it.key}`) ? "Added to findings" : "Add as a finding"}</button>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <button className={`${dark} mt-4`} disabled={!!busy} onClick={saveReview}>Save manual review</button>
          <p className="mt-2 text-[13px] text-muted">If you add a finding from here, remember to save the findings too.</p>
        </Card>
      )}

      {audit && audit.crawl && <ReportPanel audit={audit} call={call} unsaved={dirty} onAudit={(a) => take(a, null, dirty)} onLink={setLinkKey} />}
      {audit && audit.crawl && <EmailPanel audit={audit} call={call} linkKey={linkKey} onSent={onChange} />}
    </>
  );
}
