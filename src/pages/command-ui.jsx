import React from "react";

// Shared look for the private command centre pages.
export const field = "w-full rounded-xl border border-ink/20 bg-paper px-3 py-2 text-[15px]";
export const btn = "rounded-full px-4 py-2 text-[14px] font-semibold transition-opacity disabled:opacity-40";
export const dark = `${btn} bg-ink text-paper`;
export const light = `${btn} border border-ink/30 bg-paper`;
export const danger = `${btn} bg-[#c0392b] text-white`;
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
export const Badge = ({ s }) => <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS[s]?.cls || "bg-paper2"}`}>{STATUS[s]?.label || s}</span>;

export function Card({ title, children, right }) {
  return (
    <section className="mt-6 rounded-[20px] border border-ink/15 bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="xwide text-[1.05rem] tracking-[-0.02em]">{title}</h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
