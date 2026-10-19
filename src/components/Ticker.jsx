import React from "react";
import { TICKER, TRUSTED } from "../content.js";

export function Ticker() {
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {TICKER.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap font-display text-[clamp(1.6rem,3vw,2.5rem)] text-paper">
          <span className="px-6">{t}</span>
          <span className="h-2 w-2 rounded-[3px] bg-accent" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="overflow-hidden bg-ink py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee will-change-transform">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function Proof() {
  return (
    <section aria-label="Clients" className="border-t border-paper/10 bg-ink2 py-10 sm:py-12">
      <div className="wrap grid items-center gap-6 lg:grid-cols-12">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-paper/60 lg:col-span-2">Recent client work</p>
        <ul className="flex flex-wrap gap-x-8 gap-y-2 lg:col-span-7">
          {TRUSTED.map((t) => (
            <li key={t} className="whitespace-nowrap font-display text-[1.3rem] text-accent">{t}</li>
          ))}
        </ul>
        <div className="border-paper/15 lg:col-span-3 lg:col-start-10 lg:border-l lg:pl-8">
          <p className="font-display text-4xl leading-none text-paper">1 day</p>
          <p className="mt-1.5 text-sm text-paper/60">to reply to every enquiry, from our Durban studio</p>
        </div>
      </div>
    </section>
  );
}
