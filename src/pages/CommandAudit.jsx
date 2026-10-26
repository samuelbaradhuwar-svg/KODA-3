import React, { useCallback, useEffect, useMemo, useState } from "react";
import { field, dark, light, danger, Card } from "./command-ui.jsx";

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
        <h4 className="min-w-0 flex-1 font-semibold">{f.title || "(no title)"}</h4>
        <button className={light} onClick={() => setEdit(!edit)} aria-expanded={edit}>{edit ? "Done" : "Edit"}</button>
      </div>

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
            <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={f.include !== false} onChange={(e) => set("include", e.target.checked)} /> Include in the client report</label>
            {f.source === "manual" && <button className={danger} onClick={onDelete}>Delete this finding</button>}
          </div>
        </div>
      )}
    </li>
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
    addFinding({ id, title: item.title, evidence: n ? `Checked by hand: ${n}` : "Checked by hand.", severity: "medium", bucket: "next", service_key: item.group === "Google Business Profile" ? "gbp" : item.group === "Design" || item.group === "Copy" ? "redesign" : "seo" });
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
              <summary className="cursor-pointer text-[14px] underline">Pages read ({c.pages?.length})</summary>
              <ul className="mt-2 text-[14px]">{c.pages?.map((p, i) => <li key={i}>{p.status || "failed"} · {p.url}{p.error ? ` · ${p.error}` : ""}</li>)}</ul>
            </details>
          </>
        )}
      </Card>

      {audit && (
        <Card title="About this business">
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
          right={<button className={light} onClick={() => addFinding()}>Add a finding</button>}
        >
          {dirty && (
            <div className="sticky top-2 z-10 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink/30 bg-paper p-3 text-[14px] shadow">
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
              <summary className="cursor-pointer text-[14px] underline">Hidden from the report ({hidden.length})</summary>
              <ul className="mt-2 grid gap-3">{hidden.map((f) => <FindingCard key={f.id} f={f} services={services} onChange={upd} onDelete={() => { setFindings((all) => all.filter((x) => x.id !== f.id)); setDirty(true); }} />)}</ul>
            </details>
          )}
        </Card>
      )}

      {audit && catalog?.checklist && (
        <Card title="Manual review" right={<span className="text-[13px] text-muted">{todo === 0 ? "All reviewed" : `${todo} of ${catalog.checklist.length} still to review`}</span>}>
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
                          <label key={v} className="flex items-center gap-1.5 text-[14px]"><input type="radio" name={`m-${it.key}`} checked={cur.status === v} onChange={() => setCheck({ ...check, [it.key]: { ...cur, status: v } })} /> {l}</label>
                        ))}
                      </div>
                      <label className={`${lbl} mt-2`} htmlFor={`n-${it.key}`}>Your notes</label>
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
    </>
  );
}
