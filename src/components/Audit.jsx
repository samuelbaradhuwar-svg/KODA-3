import React, { useState } from "react";
import { Gauge, DeviceMobile, MagnifyingGlass, MapPin, CheckCircle, WarningCircle, XCircle, Info } from "@phosphor-icons/react";
import { Button, Eyebrow, Headline, Reveal } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";

const CHECKS = [
  { icon: Gauge, text: "How fast it loads on a phone" },
  { icon: DeviceMobile, text: "Whether it works properly on mobile" },
  { icon: MagnifyingGlass, text: "The search basics Google looks for" },
  { icon: MapPin, text: "How easy customers find and contact you" },
];

const STATUS = {
  pass: { Icon: CheckCircle, cls: "text-accent", label: "Good" },
  warn: { Icon: WarningCircle, cls: "text-[#FFC76B]", label: "Could be better" },
  fail: { Icon: XCircle, cls: "text-[#FF9A8B]", label: "Needs attention" },
  info: { Icon: Info, cls: "text-paper/60", label: "Worth knowing" },
};

const empty = { url: "", email: "", business: "", consent: false, company: "" };

function Score({ label, value }) {
  const tone = value == null ? "text-paper/50" : value >= 90 ? "text-accent" : value >= 50 ? "text-[#FFC76B]" : "text-[#FF9A8B]";
  return (
    <div className="rounded-2xl bg-paper/[0.06] px-4 py-4 text-center ring-1 ring-paper/10">
      <p className={`xwide text-3xl leading-none ${tone}`}>{value ?? "–"}</p>
      <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper/60">{label}</p>
    </div>
  );
}

function Results({ report, onReset }) {
  return (
    <div role="status" aria-live="polite">
      <h3 className="xwide text-[clamp(1.3rem,3vw,1.9rem)] leading-[1.05] tracking-[-0.03em]">Your free website check</h3>
      <p className="mt-2 break-all text-sm text-paper/60">{report.finalUrl}</p>
      {report.scores ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Score label="Speed on a phone" value={report.scores.speed} />
          <Score label="Easy to use" value={report.scores.accessibility} />
          <Score label="Search basics" value={report.scores.seo} />
          <Score label="Best practice" value={report.scores.practice} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-paper/60">Google's speed check was not available this time. The checks below still apply.</p>
      )}

      {report.topFixes.length > 0 && (
        <div className="mt-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">Start with these</p>
          <ol className="mt-3 grid gap-3">
            {report.topFixes.map((f) => (
              <li key={f.title} className="rounded-2xl bg-paper/[0.06] p-4 ring-1 ring-paper/10">
                <p className="font-medium">{f.title}</p>
                <p className="mt-1 text-[15px] leading-[1.6] text-paper/70">{f.fix}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      <ul className="mt-8 grid gap-0 border-t border-paper/15">
        {report.checks.map((c) => {
          const s = STATUS[c.status] || STATUS.info;
          return (
            <li key={c.id} className="flex gap-3 border-b border-paper/10 py-3.5">
              <s.Icon size={22} weight="fill" className={`mt-0.5 shrink-0 ${s.cls}`} aria-label={s.label} />
              <div>
                <p className="font-medium">{c.label}</p>
                <p className="text-[14px] leading-[1.55] text-paper/60">{c.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-[13px] leading-[1.6] text-paper/50">{report.note} We have also emailed you a copy.</p>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button variant="lime" onClick={() => scrollToId("contact")}>Get help fixing these</Button>
        <button onClick={onReset} className="border-b border-paper/40 pb-0.5 text-sm transition-colors hover:border-paper">Check another site</button>
      </div>
    </div>
  );
}

export default function Audit() {
  const [form, setForm] = useState(empty);
  const [state, setState] = useState("idle"); // idle | loading | review | live | error
  const [error, setError] = useState({ message: "", field: "" });
  const [report, setReport] = useState(null);

  const change = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (error.message) setError({ message: "", field: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError({ message: "", field: "" });
    try {
      const res = await fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError({ message: data.error || "Something went wrong. Please try again, or email us.", field: data.field || "" });
        setState("error");
        return;
      }
      if (data.mode === "live" && data.report) {
        setReport(data.report);
        setState("live");
      } else {
        setState("review");
      }
    } catch {
      setError({ message: "We could not reach the server. Please check your connection and try again.", field: "" });
      setState("error");
    }
  };

  const reset = () => {
    setForm(empty);
    setReport(null);
    setState("idle");
  };

  const busy = state === "loading";

  return (
    <section id="audit" className="sec">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5">
          <Eyebrow>Free website check</Eyebrow>
          <Headline className="h-section mt-5">
            How easy is your business to <em>find?</em>
          </Headline>
          <p className="t-body mt-6 text-base">
            Enter your website address and we will check it for you, free. You get a short, plain-English report on what is working and the first three things to fix. No jargon and no obligation.
          </p>
          <ul className="mt-8 grid gap-3">
            {CHECKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-ink"><Icon size={20} weight="bold" aria-hidden="true" /></span>
                {text}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
          <div className="rounded-[28px] bg-ink p-6 text-paper sm:p-10">
            {state === "live" && report ? (
              <Results report={report} onReset={reset} />
            ) : state === "review" ? (
              <div role="status" className="grid min-h-[18rem] content-center">
                <h3 className="xwide text-[clamp(1.3rem,3vw,1.9rem)] leading-[1.05] tracking-[-0.03em]">Thanks, your check is on its way.</h3>
                <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.7] text-paper/70">
                  We are looking at {form.url || "your site"} now. You will have your report by email within one working day.
                </p>
                <button onClick={reset} className="mt-8 w-fit border-b border-paper/40 pb-0.5 text-sm transition-colors hover:border-paper">Check another site</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-6">
                <div>
                  <label htmlFor="a-url" className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/60">Website address</label>
                  <input id="a-url" name="url" value={form.url} onChange={change} placeholder="yourbusiness.co.za" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck="false" className="field" aria-invalid={error.field === "url"} disabled={busy} />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="a-email" className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/60">Your email</label>
                    <input id="a-email" name="email" type="email" value={form.email} onChange={change} placeholder="you@business.co.za" autoComplete="email" className="field" aria-invalid={error.field === "email"} disabled={busy} />
                  </div>
                  <div>
                    <label htmlFor="a-business" className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/60">Business name (optional)</label>
                    <input id="a-business" name="business" value={form.business} onChange={change} placeholder="Your business" autoComplete="organization" className="field" disabled={busy} />
                  </div>
                </div>
                {/* a field only bots fill in */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label>Company<input name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={change} /></label>
                </div>
                <label className="flex items-start gap-3 text-[14px] leading-[1.55] text-paper/70">
                  <input type="checkbox" name="consent" checked={form.consent} onChange={change} className="mt-1 h-5 w-5 shrink-0 accent-[#BDF64F]" disabled={busy} aria-invalid={error.field === "consent"} />
                  <span>Email me my report. KODA will use my details only to send it and to follow up about it, and I can ask for them to be deleted at any time.</span>
                </label>
                {error.message && (
                  <p role="alert" className="rounded-xl bg-[#FF9A8B]/10 px-4 py-3 text-[14px] text-[#FF9A8B]">{error.message}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Button type="submit" variant="lime" disabled={busy}>{busy ? "Checking your site…" : "Check my website, free"}</Button>
                  {busy && <span className="text-[13px] text-paper/60">This can take up to a minute.</span>}
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
