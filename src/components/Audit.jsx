import React, { useEffect, useRef, useState } from "react";
import { Gauge, DeviceMobile, MagnifyingGlass, MapPin, CheckCircle, WarningCircle, XCircle, Info } from "@phosphor-icons/react";
import { Button, Eyebrow, Headline, Reveal } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";
import { smoothScrollTo } from "../lib/smooth.js";

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


// An example report for a made-up business, so visitors (and you) can see what the check looks like. Nothing is sent.
const SAMPLE_REPORT = {
  finalUrl: "https://www.example-plumbing.co.za/",
  scores: { speed: 41, accessibility: 88, seo: 92, practice: 75 },
  ai: {
    summary:
      "The site looks professional and loads securely, but it is slow on phones, and that is the thing most likely to cost this business customers. A few small fixes would make a real difference.",
    priorities: [
      { title: "Speed on a phone", why: "Visitors on mobile data leave if a page takes more than a few seconds.", how: "Compress the images and remove scripts that are not needed." },
      { title: "Search description", why: "It is the text people read on Google before they click.", how: "Add a short description saying what the business does and where." },
      { title: "Sitemap", why: "It helps Google find every page.", how: "Add a sitemap and submit it in Google Search Console." },
    ],
    closing: "Reply to this email if you would like a hand with any of it.",
  },
  topFixes: [],
  stack: "WordPress",
  opportunities: [
    { id: "analytics", area: "Measuring results", title: "No visitor tracking found", why: "Without analytics you cannot tell which pages, ads or searches bring in enquiries.", service: "Analytics and conversion tracking setup", evidence: "No Google Analytics or Tag Manager found", impact: "high" },
    { id: "local", area: "Being found locally", title: "No local business data for Google", why: "Local data and area pages help the site appear for town and near me searches.", service: "Local SEO setup", evidence: "No local business structured data", impact: "high" },
    { id: "proof", area: "Trust", title: "No customer reviews on the page", why: "Real reviews are the strongest reason to pick you over a competitor.", service: "Reputation and review showcase", evidence: "No review or testimonial section found", impact: "high" },
    { id: "booking", area: "Enquiries", title: "No online booking or quote flow", why: "A visitor who can request a quote in two taps converts far better.", service: "Online booking and quote forms", evidence: "No booking button found", impact: "medium" },
  ],
  note: "An automatic check of the home page. Google Business Profile, design and copy are reviewed by a person, so we follow up on those.",
  checks: [
    { id: "speed", label: "Speed on a phone", status: "fail", detail: "Google scores it 41 out of 100; the main content appears after about 5.2 seconds." },
    { id: "description", label: "Search description", status: "warn", detail: "No search description found." },
    { id: "sitemap", label: "Sitemap", status: "warn", detail: "No sitemap.xml found." },
    { id: "https", label: "Secure connection (HTTPS)", status: "pass", detail: "The site loads securely." },
    { id: "title", label: "Page title", status: "pass", detail: "A clear title of 52 characters." },
    { id: "viewport", label: "Set up for phones", status: "pass", detail: "Mobile viewport is set." },
    { id: "contact", label: "Easy ways to get in touch", status: "pass", detail: "Phone, email or WhatsApp links found." },
    { id: "social", label: "Sharing preview", status: "info", detail: "No social sharing tags." },
  ],
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

// "around 14:05 today" / "around 08:30 on Monday", in South African time, from the time the server scheduled.
function when(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tz = { timeZone: "Africa/Johannesburg" };
  const day = (x) => x.toLocaleDateString("en-ZA", { ...tz, year: "numeric", month: "numeric", day: "numeric" });
  const time = d.toLocaleTimeString("en-ZA", { ...tz, hour: "2-digit", minute: "2-digit", hour12: false });
  const label = day(d) === day(new Date()) ? "today" : `on ${d.toLocaleDateString("en-ZA", { ...tz, weekday: "long" })}`;
  return `, around ${time} ${label}`;
}

function Results({ report, onReset, sample = false, emailed = true, scheduledFor = "" }) {
  return (
    <div role="status" aria-live="polite">
      {sample && (
        <p className="mb-5 inline-block rounded-full bg-accent px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">Sample report, made-up business</p>
      )}
      <h3 className="xwide text-[clamp(1.3rem,3vw,1.9rem)] leading-[1.05] tracking-[-0.03em]">{sample ? "What your free check looks like" : "Your free website check"}</h3>
      <p className="mt-2 break-all text-sm text-paper/60">{report.finalUrl}</p>
      {report.ai && <p className="mt-5 text-[16px] leading-[1.65] text-paper/85">{report.ai.summary}</p>}
      {report.scores ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Score label="Speed on a phone" value={report.scores.speed} />
          <Score label="Easy to use" value={report.scores.accessibility} />
          <Score label="Search basics" value={report.scores.seo} />
          <Score label="Best practice" value={report.scores.practice} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-paper/60">Google's speed check was not available this time{report.speedCheckNote ? ` (${report.speedCheckNote})` : ""}. The checks below still apply.</p>
      )}

      {report.opportunities?.length > 0 && (
        <div className="mt-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">Where you could win more customers</p>
          <p className="mt-2 text-[14px] leading-[1.6] text-paper/60">
            {report.stack ? `Built on ${report.stack}. ` : ""}These are not faults. They are things stronger sites do that this one does not do yet.
          </p>
          <ul className="mt-3 grid gap-3">
            {report.opportunities.map((o) => (
              <li key={o.id} className="rounded-2xl bg-paper/[0.06] p-4 ring-1 ring-paper/10">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-medium">{o.title}</p>
                  <span className="rounded-full bg-paper/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper/70">{o.area}</span>
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${o.impact === "high" ? "text-accent" : "text-paper/50"}`}>{o.impact} impact</span>
                </div>
                <p className="mt-1 text-[15px] leading-[1.6] text-paper/70">{o.why}</p>
                <p className="mt-2 text-[13px] leading-[1.55] text-paper/50">Seen: {o.evidence}. <span className="text-paper/80">KODA can help with: {o.service}.</span></p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(report.ai?.priorities?.length > 0 || report.topFixes.length > 0) && (
        <div className="mt-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">Start with these</p>
          <ol className="mt-3 grid gap-3">
            {(report.ai?.priorities?.length
              ? report.ai.priorities.map((p) => ({ title: p.title, body: `${p.why} ${p.how}` }))
              : report.topFixes.map((f) => ({ title: f.title, body: f.fix }))
            ).map((f) => (
              <li key={f.title} className="rounded-2xl bg-paper/[0.06] p-4 ring-1 ring-paper/10">
                <p className="font-medium">{f.title}</p>
                <p className="mt-1 text-[15px] leading-[1.6] text-paper/70">{f.body}</p>
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
      <p className="mt-6 text-[13px] leading-[1.6] text-paper/50">{report.note}{sample ? "" : emailed ? ` We will also email you the full report with a PDF attached${when(scheduledFor)}. It comes from our automatic check.` : " Emailed copies are not switched on yet, so none was sent."}</p>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        {sample ? (
          <Button variant="lime" onClick={onReset}>Check my own website</Button>
        ) : (
          <>
            <Button variant="lime" onClick={() => scrollToId("contact")}>Get help fixing these</Button>
            <button onClick={onReset} className="border-b border-paper/40 pb-0.5 text-sm transition-colors hover:border-paper">Check another site</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Audit() {
  const [form, setForm] = useState(empty);
  const [state, setState] = useState("idle"); // idle | loading | review | live | error
  const [error, setError] = useState({ message: "", field: "" });
  const [report, setReport] = useState(null);
  const [sample, setSample] = useState(false);
  const [emailed, setEmailed] = useState(true);
  const [scheduledFor, setScheduledFor] = useState("");
  const panelRef = useRef(null);
  const first = useRef(true);

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
        setEmailed(data.emailed !== false);
        setScheduledFor(data.scheduledFor || "");
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
    setSample(false);
    setState("idle");
  };

  const showSample = () => {
    setReport(SAMPLE_REPORT);
    setSample(true);
    setState("live");
  };

  // a link ending in ?sample opens the example straight away
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("sample")) showSample();
  }, []);

  // When the panel changes (form, results, "on its way"), bring its top into view. Results are much taller than the
  // form, so without this a click near the bottom of one view can leave the visitor looking at something else.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (state === "idle") return;
    }
    if (state === "loading" || state === "error" || !panelRef.current) return;
    const id = requestAnimationFrame(() => {
      const top = panelRef.current.getBoundingClientRect().top;
      if (top < 80 || top > window.innerHeight * 0.6) smoothScrollTo(panelRef.current, { offset: -100 });
    });
    return () => cancelAnimationFrame(id);
  }, [state]);

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
          <div ref={panelRef} className="rounded-[28px] bg-ink p-6 text-paper sm:p-10">
            {state === "live" && report ? (
              <Results report={report} onReset={reset} sample={sample} emailed={emailed} scheduledFor={scheduledFor} />
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
                  {busy ? (
                    <span className="text-[13px] text-paper/60">This can take up to a minute.</span>
                  ) : (
                    <button type="button" onClick={showSample} className="border-b border-paper/40 pb-0.5 text-sm text-paper/80 transition-colors hover:border-paper hover:text-paper">See a sample report</button>
                  )}
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
