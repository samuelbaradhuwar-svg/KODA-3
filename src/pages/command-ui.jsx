import React, { useState } from "react";

// Shared look for the private command centre pages, built phone-first: 44px touch targets and 16px text boxes (below
// 16px an iPhone zooms the page every time a box is tapped).
// 16px text on 10px padding is already 44px tall for a one-line box, and multi-line boxes keep their own taller minimum.
export const field = "w-full rounded-xl border border-ink/20 bg-paper px-3 py-2.5 text-[16px]";
export const btn = "inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-[15px] font-semibold transition-opacity disabled:opacity-40 sm:min-h-[40px] sm:px-4 sm:text-[14px]";
export const dark = `${btn} bg-ink text-paper`;
export const light = `${btn} border border-ink/30 bg-paper`;
export const danger = `${btn} bg-[#c0392b] text-white`;
export const check = "h-5 w-5 shrink-0 accent-[#101010] dark:accent-[#E8E7E5]";
export const when = (t) => (t ? new Date(t).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "");
export const hostOf = (u) => {
  try {
    return new URL(u).hostname;
  } catch {
    return u;
  }
};

export const STATUS = {
  new: { label: "New", cls: "bg-[#FFC76B] text-[#101010]" },
  replied: { label: "Replied", cls: "bg-paper2 text-ink" },
  audit_drafted: { label: "Audit drafted", cls: "bg-paper2 text-ink" },
  sent: { label: "Sent", cls: "bg-paper2 text-ink" },
  won: { label: "Won", cls: "bg-[#BDF64F] text-[#101010]" },
  lost: { label: "Lost", cls: "bg-[#FF9A8B] text-[#101010]" },
};
export const Badge = ({ s }) => <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS[s]?.cls || "bg-paper2"}`}>{STATUS[s]?.label || s}</span>;

// fold: "open" always shown; "auto" open on a laptop and folded on a phone; "closed" folded everywhere.
// A folded card is a native <details>, so it works without scripts and is announced properly by screen readers.
export function Card({ title, children, right, id, fold = "open" }) {
  const [open, setOpen] = useState(fold === "open" || (fold === "auto" && typeof window !== "undefined" && window.innerWidth >= 640));
  const wrap = "mt-5 scroll-mt-24 rounded-[20px] border border-ink/15 bg-paper p-4 sm:mt-6 sm:p-5";
  if (fold === "open") {
    return (
      <section id={id} className={wrap}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="xwide text-[1.05rem] tracking-[-0.02em]">{title}</h2>
          {right}
        </div>
        <div className="mt-4">{children}</div>
      </section>
    );
  }
  return (
    <section id={id} className={wrap}>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <h2 className="xwide text-[1.05rem] tracking-[-0.02em]">{title}</h2>
          <span className="flex items-center gap-3 text-[13px] text-muted">{right}<span aria-hidden="true" className="text-[1.2rem] leading-none">{open ? "−" : "+"}</span></span>
        </summary>
        <div className="mt-2">{children}</div>
      </details>
    </section>
  );
}

// Scroll to a section, opening it first if it is folded.
export function jump(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const d = el.querySelector(":scope > details");
  if (d && !d.open) d.open = true;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// A strip of section links that sticks to the top on a phone (the request page is long).
export function SectionNav({ items }) {
  return (
    <nav aria-label="Jump to a section" className="sticky top-0 z-20 -mx-4 mt-3 overflow-x-auto border-b border-ink/10 bg-paper/95 px-4 py-2 backdrop-blur sm:hidden">
      <ul className="flex gap-2">
        {items.map(([id, label]) => (
          <li key={id} className="shrink-0">
            <button className="inline-flex min-h-[44px] items-center rounded-full border border-ink/25 px-4 text-[14px] font-semibold" onClick={() => jump(id)}>{label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { telHref, waNumber } from "../lib/phone.js";
