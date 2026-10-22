import React, { useEffect, useState } from "react";

// Client onboarding: a one-time link from KODA. The client describes their brand voice and agrees to how we work.
// The wording below is DRAFT until an attorney has approved it. The server records which version the client saw.
const WORDING_VERSION = "draft-0";
const CONSENT_AI = "I agree that KODA may use AI tools to help prepare content, reports and website changes for my business. A KODA team member reviews them before they are published unless I have agreed otherwise in writing.";
const CONSENT_DATA = "I agree that KODA may process the information I give here, and information from the accounts I give KODA access to, in order to run my monthly plan, as set out in the privacy policy.";

const field = "mt-2 w-full rounded-xl border border-ink/20 bg-paper px-3 py-2 text-[16px]";

export default function Onboarding() {
  const token = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("token") || "";
  const [info, setInfo] = useState(null);
  const [state, setState] = useState("loading"); // loading | form | invalid | done
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ tone: "", offers: "", audience: "", areas: "", dos: "", donts: "", banned: "", ai: false, data: false });

  useEffect(() => {
    document.title = "Welcome to KODA";
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex,nofollow";
    document.head.appendChild(m);
    fetch(`/api/autopilot/onboarding?token=${encodeURIComponent(token)}`)
      .then((r) => r.json().then((j) => (r.ok ? (setInfo(j), setState("form")) : setState("invalid"))))
      .catch(() => setState("invalid"));
    return () => m.remove();
  }, [token]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/autopilot/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          aiConsent: f.ai,
          dataConsent: f.data,
          profile: { tone: f.tone, offers: f.offers, audience: f.audience, areas: f.areas, dos: f.dos, donts: f.donts, banned_claims: f.banned.split("\n").map((s) => s.trim()).filter(Boolean) },
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) setState("done");
      else setError(j.error || "Something went wrong. Please try again, or email us.");
    } finally {
      setBusy(false);
    }
  }

  const shell = (children) => <main className="mx-auto min-h-screen max-w-xl bg-paper px-5 py-14 text-ink">{children}</main>;
  if (state === "loading") return shell(<p>Loading...</p>);
  if (state === "invalid") return shell(<><h1 className="xwide text-[1.4rem]">This link has expired</h1><p className="mt-4 text-muted">Links work once and last 7 days. Please ask KODA for a new one.</p></>);
  if (state === "done") return shell(<><h1 className="xwide text-[1.4rem]">Thank you</h1><p className="mt-4 text-muted">We have saved your details. We will be in touch about the next step.</p></>);

  return shell(
    <form onSubmit={submit}>
      <h1 className="xwide text-[1.4rem]">Welcome, {info.businessName}</h1>
      <p className="mt-4 text-muted">A few questions so everything we write for you sounds like you. Short answers are fine.</p>
      {[
        ["tone", "How should we sound?", "Friendly, professional, playful..."],
        ["offers", "What do you offer, and any current offers?", "Services, prices you are happy to share, specials"],
        ["audience", "Who are your customers?", "Homeowners in Durban North, small businesses..."],
        ["areas", "Which areas or towns do you serve?", ""],
        ["dos", "Things we should always do", ""],
        ["donts", "Things we should never do or say", ""],
      ].map(([k, label, ph]) => (
        <label key={k} className="mt-6 block font-semibold">
          {label}
          <textarea className={`${field} font-normal`} rows={2} maxLength={2000} value={f[k]} onChange={set(k)} placeholder={ph} />
        </label>
      ))}
      <label className="mt-6 block font-semibold">
        Claims we must never make (one per line)
        <textarea className={`${field} font-normal`} rows={3} value={f.banned} onChange={set("banned")} placeholder={"#1 in Durban\nGuaranteed results"} />
      </label>

      <fieldset className="mt-8 grid gap-3">
        <legend className="font-semibold">Your agreement{WORDING_VERSION.startsWith("draft") ? " (draft wording, pending legal review)" : ""}</legend>
        <label className="flex items-start gap-3 text-[15px]"><input className="mt-1" type="checkbox" checked={f.ai} onChange={set("ai")} /> {CONSENT_AI}</label>
        <label className="flex items-start gap-3 text-[15px]"><input className="mt-1" type="checkbox" checked={f.data} onChange={set("data")} /> {CONSENT_DATA}</label>
      </fieldset>

      {error && <p role="alert" className="mt-4 text-[#c0392b]">{error}</p>}
      <button disabled={busy} className="mt-8 rounded-full bg-ink px-6 py-3 font-semibold text-paper disabled:opacity-40" type="submit">{busy ? "Saving..." : "Save and continue"}</button>
    </form>
  );
}
