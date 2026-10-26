import React, { useEffect, useState } from "react";
import { Logo, withBrand } from "../components/ui.jsx";
import { EMAIL } from "../lib/utils.js";

// The client's audit report: plain English, branded, readable on a phone, and printable as a PDF.
// It only ever renders what the server put in the report (no admin notes, no raw crawl data).
const SEV = {
  high: { label: "High priority", cls: "bg-[#FF9A8B] text-[#101010]" },
  medium: { label: "Medium", cls: "bg-[#FFC76B] text-[#101010]" },
  low: { label: "Low", cls: "bg-paper2 text-ink" },
  info: { label: "Note", cls: "bg-paper2 text-ink" },
};
const MSTATUS = { ok: "Looks fine", issue: "Needs attention", todo: "Not yet reviewed" };
const dateOf = (t) => new Date(t).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
const Paras = ({ text, className = "" }) => String(text || "").split(/\n+/).filter(Boolean).map((p, i) => <p key={i} className={`mt-2 ${className}`}>{withBrand(p)}</p>);

function Section({ title, children, className = "" }) {
  return (
    <section className={`mt-10 ${className}`}>
      <h2 className="xwide text-[1.25rem] tracking-[-0.02em]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Finding({ f }) {
  const price = f.service?.options?.length ? f.service.options.map((o) => `${o.name} ${o.price} ${o.note}`).join(" or ") : "";
  return (
    <li className="break-inside-avoid rounded-2xl border border-ink/15 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${SEV[f.severity]?.cls}`}>{SEV[f.severity]?.label}</span>
        <h4 className="min-w-0 flex-1 font-semibold">{f.title}</h4>
      </div>
      <dl className="mt-2 grid gap-x-4 gap-y-1.5 text-[14.5px] sm:grid-cols-[8rem_1fr]">
        {f.evidence && <><dt className="text-muted">What we saw</dt><dd className="whitespace-pre-wrap">{f.evidence}</dd></>}
        {f.why && <><dt className="text-muted">Why it matters</dt><dd className="whitespace-pre-wrap">{f.why}</dd></>}
        {f.fix && <><dt className="text-muted">How to fix it</dt><dd className="whitespace-pre-wrap">{f.fix}</dd></>}
        {f.service && (
          <>
            <dt className="text-muted">Who does it</dt>
            <dd>{withBrand(`KODA: ${f.service.name}`)}{f.service.includedWithEveryPlan ? " (included with every plan)" : ""}{price && <span className="text-muted"> · {price}</span>}</dd>
          </>
        )}
      </dl>
    </li>
  );
}

function PlanCard({ p, label }) {
  return (
    <div className="break-inside-avoid rounded-[20px] border border-ink/20 p-5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <h3 className="xwide mt-1 text-[1.2rem]">{p.name}</h3>
      <p className="mt-1 text-[1.4rem] font-semibold">{p.price} <span className="text-[14px] font-normal text-muted">{p.note}</span></p>
      <p className="text-[14px] text-muted">{p.timeline}</p>
      <p className="mt-2 text-[14.5px]">{withBrand(p.desc)}</p>
      <ul className="mt-2 list-disc pl-5 text-[14.5px]">{p.features.map((x, i) => <li key={i}>{withBrand(x)}</li>)}</ul>
    </div>
  );
}

export function Report({ data, expires, preview }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.title = `Website audit${data.business ? `: ${data.business}` : ""}`;
  }, [data.business]);
  const reviewed = data.manual.filter((m) => m.status !== "na");
  const groups = [...new Set(reviewed.map((m) => m.group))];
  const rec = data.plan.recommended;
  const g = data.facts.googleMobile;
  return (
    <div className="bg-paper text-ink print:bg-white">
      {preview && <div className="bg-[#FFC76B] px-4 py-2 text-center text-[14px] font-semibold text-[#101010] print:hidden">Preview. This is what your client will see. Nothing has been sent.</div>}
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-ink/15 pb-5">
          <Logo />
          <div className="flex items-center gap-3 text-[13px] text-muted">
            <span>{dateOf(data.date)}</span>
            <button className="inline-flex min-h-[44px] items-center rounded-full border border-ink/30 px-4 font-semibold text-ink print:hidden" onClick={() => window.print()}>Save as PDF</button>
          </div>
        </header>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">Website audit</p>
        <h1 className="xwide mt-2 text-[2rem] leading-[1.05] tracking-[-0.03em]">{data.business || data.site}</h1>
        <p className="mt-1 text-muted">{data.business ? data.site : ""}</p>

        <Section title="Summary"><Paras text={data.summary} className="text-[16px]" /></Section>

        <Section title="At a glance">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["Fix first", data.counts.fix_first], ["Do next", data.counts.next], ["Can wait", data.counts.later]].map(([l, n]) => (
              <div key={l} className="rounded-2xl border border-ink/15 p-4"><p className="text-[2rem] font-semibold leading-none">{n}</p><p className="mt-1 text-[14px] text-muted">{l}</p></div>
            ))}
          </div>
          <p className="mt-3 text-[14px] text-muted">
            {data.facts.pagesRead} {data.facts.pagesRead === 1 ? "page" : "pages"} read{data.facts.linksChecked ? `, ${data.facts.linksChecked} links checked` : ""}.
            {g ? ` Google's scores on a phone: speed ${g.speed}, accessibility ${g.accessibility}, search ${g.seo}, best practice ${g.practice} (out of 100).` : ""}
          </p>
        </Section>

        {data.wins.length > 0 && (
          <Section title="Your three biggest wins">
            <ol className="grid gap-3">
              {data.wins.map((w, i) => (
                <li key={w.id} className="break-inside-avoid rounded-2xl border border-ink/20 p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Win {i + 1}</p>
                  <h3 className="mt-0.5 font-semibold">{w.title}</h3>
                  {w.why && <p className="mt-1 text-[14.5px]">{w.why}</p>}
                  {w.fix && <p className="mt-1 text-[14.5px]"><b>What to do:</b> {w.fix}</p>}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {data.strengths.length > 0 && (
          <Section title="What is already working">
            <ul className="list-disc pl-5 text-[15px]">{data.strengths.map((s, i) => <li key={i} className="mt-1">{s}</li>)}</ul>
          </Section>
        )}

        <Section title="Everything we found">
          {data.groups.every((x) => !x.findings.length) && <p>We did not find any problems in what we checked.</p>}
          {data.groups.map((gr) => gr.findings.length > 0 && (
            <div key={gr.key} className="mt-6 first:mt-0">
              <h3 className="xwide text-[1rem]">{gr.label} <span className="text-muted">({gr.findings.length})</span></h3>
              <ul className="mt-2 grid gap-3">{gr.findings.map((f) => <Finding key={f.id} f={f} />)}</ul>
            </div>
          ))}
        </Section>

        <Section title="Our hands-on review">
          <p className="text-[14.5px] text-muted">The parts of an audit that need professional judgement: your Google Business Profile, the design and the writing. Anything marked "not yet reviewed" has not been assessed yet.</p>
          {groups.map((gr) => (
            <div key={gr} className="mt-4">
              <h3 className="xwide text-[0.95rem]">{gr}</h3>
              <ul className="mt-2 grid gap-2">
                {reviewed.filter((m) => m.group === gr).map((m, i) => (
                  <li key={i} className="break-inside-avoid rounded-xl border border-ink/15 p-3 text-[14.5px]">
                    <div className="flex flex-wrap items-center justify-between gap-2"><b>{m.title}</b><span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${m.status === "issue" ? "bg-[#FFC76B] text-[#101010]" : "bg-paper2"}`}>{MSTATUS[m.status]}</span></div>
                    {m.notes && <p className="mt-1 whitespace-pre-wrap">{m.notes}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        <Section title="How we would fix it">
          {(rec.once || rec.monthly) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {rec.once && <PlanCard p={rec.once} label="Recommended: one-off" />}
              {rec.monthly && <PlanCard p={rec.monthly} label={rec.once ? "Then: monthly care" : "Recommended: monthly"} />}
            </div>
          )}
          <Paras text={data.plan.text} className="text-[15.5px]" />
          <p className="mt-3 text-[14px] text-muted">Prices are the ones published on our website today. We agree the timeline with you first.</p>
          <p className="mt-4 text-[15.5px]">Want to talk it through? Reply to the email we sent you, or write to <a className="inline-block py-3 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
        </Section>

        {data.notChecked.length > 0 && (
          <Section title="What we could not check">
            <ul className="list-disc pl-5 text-[14.5px]">{data.notChecked.map((n, i) => <li key={i} className="mt-1">{n}</li>)}</ul>
          </Section>
        )}

        <section className="mt-10 break-inside-avoid rounded-2xl bg-paper2 p-5 print:border print:border-ink/20">
          <h2 className="xwide text-[1rem]">An honest note</h2>
          {data.disclaimer.map((t, i) => <p key={i} className="mt-2 text-[14.5px]">{t}</p>)}
        </section>

        <footer className="mt-10 border-t border-ink/15 pt-4 text-[12.5px] text-muted">
          <p>{withBrand("Prepared by KODA, Durban, South Africa.")} {EMAIL}</p>
          {expires && <p className="mt-1 print:hidden">This private link expires on {dateOf(expires)}. Please do not share it.</p>}
        </footer>
      </div>
    </div>
  );
}

// /report/<token>: the client opens their private link. No sign-in; the long random token is the key.
export default function ReportPage() {
  const token = window.location.pathname.split("/")[2] || "";
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    fetch(`/api/command/report/${encodeURIComponent(token)}`)
      .then(async (r) => ({ ok: r.ok, j: await r.json().catch(() => ({})) }))
      .then(({ ok, j }) => setState(ok && j.report ? { data: j.report, expires: j.expires } : { error: j.error || "We could not load this report." }))
      .catch(() => setState({ error: "We could not load this report. Please check your connection and try again." }));
  }, [token]);
  if (state.loading) return <p className="p-10 text-muted">Loading your report…</p>;
  if (state.error) return (
    <div className="mx-auto max-w-md px-5 py-24">
      <Logo />
      <h1 className="xwide mt-6 text-[1.3rem]">We could not open this report</h1>
      <p className="mt-3 text-muted">{state.error}</p>
      <p className="mt-3">Write to <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> and we will send a new link.</p>
    </div>
  );
  return <Report data={state.data} expires={state.expires} />;
}
