import React, { useCallback, useEffect, useRef, useState } from "react";
import { field, dark, light, danger, check, when, Card } from "./command-ui.jsx";

// Email to the client: edit the text, preview the exact email, then send. The server builds the HTML from this text and
// only ever sends to the address on the request, so nothing here can send to anyone else. Sending needs a preview of
// the current text first, a deliberate confirm, and (for a second send) a tick to send again.
const lbl = "block text-[13px] text-muted";
const newKey = () => (window.crypto?.randomUUID ? window.crypto.randomUUID().replace(/-/g, "") : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`);

export default function EmailPanel({ audit, call, linkKey, onSent }) {
  const touched = useRef(false);
  const [meta, setMeta] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [html, setHtml] = useState("");
  const [previewed, setPreviewed] = useState("");
  const [bcc, setBcc] = useState(true);
  const [confirm, setConfirm] = useState(null); // { kind, idem }
  const [again, setAgain] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [stale, setStale] = useState(false);

  const load = useCallback(async (force = false) => {
    try {
      const r = await call(`audits/${audit.id}/email?base=${encodeURIComponent(window.location.origin)}`);
      setMeta(r);
      if (force || !touched.current) {
        setSubject(r.subject);
        setBody(r.body);
        touched.current = false;
        setPreviewed("");
        setHtml("");
        setStale(false);
      } else setStale(true);
    } catch (e) {
      setErr(e.message);
    }
  }, [call, audit.id]);
  useEffect(() => { load(); }, [load, linkKey]);

  const key = `${subject}\n${body}`;
  const ready = previewed === key;

  async function preview() {
    setErr(""); setMsg(""); setBusy("Building the preview…");
    try {
      const r = await call(`audits/${audit.id}/email/preview`, { method: "POST", body: { subject, body } });
      setHtml(r.html);
      setPreviewed(key);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }

  async function doSend(kind, idem) {
    setErr(""); setMsg(""); setBusy("Sending…");
    try {
      const r = await call(`audits/${audit.id}/email/send`, { method: "POST", body: { kind, subject, body, confirm: true, idem, bcc: kind === "client" && bcc, sendAgain: again } });
      setMsg(r.duplicate ? "That email had already been sent (nothing was sent twice)." : kind === "test" ? `Test sent to ${r.to}.` : `Sent to ${r.to}.${r.warning ? ` ${r.warning}` : ""}`);
      setConfirm(null);
      setAgain(false);
      await load();
      onSent?.();
    } catch (e) {
      setErr(e.message);
      setConfirm(null);
    } finally {
      setBusy("");
    }
  }

  if (!meta) return <Card title="Email to the client"><p className="text-[14px] text-muted">{err || "Loading…"}</p></Card>;
  const missingLink = meta.linkActive && meta.url && !body.includes(meta.url);
  const canClient = ready && meta.linkActive && meta.clientSendAllowed && meta.emailConfigured && !busy;
  const canTest = ready && meta.emailConfigured && !busy;

  return (
    <Card title="Email to the client" id="sec-email">
      <p className="text-[14px] text-muted">Nothing is sent until you press Send and confirm. It goes from {meta.from} with replies to {meta.replyTo}, and only ever to the address on this request.</p>
      {!meta.emailConfigured && <p role="alert" className="mt-3 rounded-2xl bg-[#FFC76B] p-3 text-[14px] font-semibold text-[#101010]">Email sending is not set up in this environment (RESEND_API_KEY is missing), so you can draft and preview but not send.</p>}
      {meta.previewEnv && <p role="status" className="mt-3 rounded-2xl bg-[#FFC76B] p-3 text-[14px] text-[#101010]"><b>You are on a preview address.</b> You can send tests to yourself here, but real client emails are blocked, because a client may not be able to open a preview link. Send to the client from the live site.</p>}
      {!meta.linkActive && <p role="status" className="mt-3 rounded-2xl bg-paper2 p-3 text-[14px]">There is no active private report link yet. Create one in <b>Client report</b> above, then use "Reset to the default text" here.</p>}
      {stale && <p role="status" className="mt-3 rounded-2xl bg-paper2 p-3 text-[14px]">The report or its link has changed since this draft was written. Use "Reset to the default text" to refresh it (your edits will be replaced).</p>}

      <dl className="mt-4 grid gap-x-4 gap-y-1 text-[14px] sm:grid-cols-[6rem_1fr]">
        <dt className="text-muted">To</dt><dd>{meta.to}</dd>
        <dt className="text-muted">From</dt><dd>{meta.from}</dd>
        <dt className="text-muted">Reply-to</dt><dd>{meta.replyTo}</dd>
      </dl>
      <div className="mt-3">
        <label className={lbl} htmlFor="em-sub">Subject</label>
        <input id="em-sub" className={field} maxLength={150} value={subject} onChange={(e) => { touched.current = true; setSubject(e.target.value); }} />
      </div>
      <div className="mt-3">
        <label className={lbl} htmlFor="em-body">Email text (plain text; a line that is only a link becomes a button, lines starting with "- " become bullets)</label>
        <textarea id="em-body" className={`${field} min-h-[16rem]`} maxLength={8000} value={body} onChange={(e) => { touched.current = true; setBody(e.target.value); }} />
      </div>
      {missingLink && <p role="status" className="mt-2 text-[14px] font-semibold">This text does not contain the report link. The client would get an email with nothing to open.</p>}
      <button className="inline-flex min-h-[44px] items-center text-[14px] underline" onClick={() => load(true)}>Reset to the default text</button>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button className={dark} disabled={!!busy || !body.trim()} onClick={preview}>Preview email</button>
        <button className={light} disabled={!canTest} onClick={() => doSend("test", newKey())} title={ready ? "" : "Preview the current text first"}>Send a test to {meta.adminEmail}</button>
        <button className={dark} disabled={!canClient} onClick={() => setConfirm({ kind: "client", idem: newKey() })} title={ready ? "" : "Preview the current text first"}>Send to the client…</button>
        {busy && <span role="status" className="text-[14px]">{busy}</span>}
      </div>
      {!ready && body.trim() && <p className="mt-1 text-[13px] text-muted">Sending unlocks after you preview the current text. Changing the text locks it again.</p>}
      {msg && !busy && <p role="status" className="mt-3 text-[14px] font-semibold">{msg}</p>}
      {err && <p role="alert" className="mt-3 text-[14px]">{err}</p>}

      {confirm && (
        <div role="alertdialog" aria-label="Confirm sending" className="mt-4 rounded-2xl border-2 border-ink p-4">
          <p className="font-semibold">Send this email to {meta.to} now?</p>
          <p className="mt-1 text-[14px]">Subject: {subject}</p>
          <p className="mt-1 text-[14px] text-muted">It cannot be unsent. It will be logged below.</p>
          <label className="mt-3 flex min-h-[44px] items-center gap-3 text-[14px]"><input className={check} type="checkbox" checked={bcc} onChange={(e) => setBcc(e.target.checked)} /> Send me a copy ({meta.adminEmail})</label>
          {meta.alreadySent && <label className="mt-2 flex min-h-[44px] items-center gap-3 text-[14px] font-semibold"><input className={check} type="checkbox" checked={again} onChange={(e) => setAgain(e.target.checked)} /> This report was already emailed on {when(meta.alreadySent)}. Send it again.</label>}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button className={danger} disabled={!!busy || (meta.alreadySent && !again)} onClick={() => doSend(confirm.kind, confirm.idem)}>Yes, send now</button>
            <button className={light} onClick={() => setConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {html && (
        <div className="mt-4">
          <p className={lbl}>Preview of exactly what will be sent (the logo is attached to the real email)</p>
          <iframe title="Email preview" sandbox="" srcDoc={html} className="mt-1 h-[60vh] min-h-[22rem] w-full rounded-2xl border border-ink/20 bg-white" />
        </div>
      )}
      {meta.alreadySent && <p className="mt-3 text-[13px] text-muted">Already emailed to the client on {when(meta.alreadySent)}. The report link stays live, so changes you make to the report show to the client.</p>}
    </Card>
  );
}
