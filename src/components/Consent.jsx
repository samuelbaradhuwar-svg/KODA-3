import React, { useEffect, useState } from "react";

// Google Analytics, only ever after a visitor presses Accept. Until then nothing is loaded and nothing is sent to Google.
// The choice is kept in the visitor's own browser, and the footer's "Cookie settings" link reopens it so it can be changed at any time.
const GA_ID = "G-Z4ZDL040ED";
const KEY = "koda-consent";
export const OPEN_EVENT = "koda:cookie-settings";

const read = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch (e) {
    return null;
  }
};
const write = (v) => {
  try {
    localStorage.setItem(KEY, v);
  } catch (e) {}
};

function loadAnalytics() {
  window[`ga-disable-${GA_ID}`] = false;
  if (window.__kodaGa) return;
  window.__kodaGa = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  // Measurement only: no advertising storage, no ad personalisation, no Google signals.
  window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

// Declining, or changing your mind, stops Google Analytics at once and removes its cookies.
function stopAnalytics() {
  window[`ga-disable-${GA_ID}`] = true;
  const host = window.location.hostname;
  const bits = host.split(".");
  const domains = [undefined, host, `.${host}`];
  for (let i = 1; i < bits.length - 1; i++) domains.push(`.${bits.slice(i).join(".")}`);
  const names = document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter((n) => n === "_ga" || n.startsWith("_ga_"));
  for (const n of names) for (const d of domains) document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
}

export default function Consent() {
  const [open, setOpen] = useState(false); // closed on the server and on the first client render, so the page hydrates cleanly
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const c = read();
    setCurrent(c);
    if (c === "accepted") loadAnalytics();
    if (!c) setOpen(true);
    const reopen = () => {
      setCurrent(read());
      setOpen(true);
    };
    // Any element marked data-cookie-settings (the footer link) reopens the choice. Listening on the document means it works
    // even before the lazily loaded footer has finished attaching its own handlers.
    const onClick = (e) => {
      if (e.target instanceof Element && e.target.closest("[data-cookie-settings]")) reopen();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(OPEN_EVENT, reopen);
    };
  }, []);

  const decide = (v) => {
    write(v);
    setCurrent(v);
    setOpen(false);
    if (v === "accepted") loadAnalytics();
    else stopAnalytics();
  };

  if (!open) return null;
  const btn = "inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-paper/40 px-5 text-sm font-semibold text-paper transition-colors hover:border-accent hover:text-accent";
  return (
    <div role="dialog" aria-label="Cookie choice" className="keep-light fixed inset-x-3 bottom-3 z-[60] rounded-2xl bg-ink p-5 text-paper shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)] sm:inset-x-auto sm:left-1/2 sm:w-[34rem] sm:-translate-x-1/2">
      <p className="text-[15px] leading-[1.6]">
        We would like to use Google Analytics cookies to see how this website is used. It is optional. Nothing is sent to Google unless you accept.{" "}
        <a href="/cookie-policy" className="underline underline-offset-4 hover:text-accent">Cookie policy</a>
      </p>
      {current && <p className="mt-2 text-[13px] text-paper/60">Your current choice: {current === "accepted" ? "accepted" : "declined"}.</p>}
      <div className="mt-4 flex gap-3">
        <button type="button" className={btn} onClick={() => decide("declined")}>Decline</button>
        <button type="button" className={btn} onClick={() => decide("accepted")}>Accept</button>
      </div>
    </div>
  );
}
