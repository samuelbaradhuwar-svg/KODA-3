import React from "react";
import { TICKER, TRUSTED } from "../content.js";

export function Ticker() {
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {TICKER.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap font-display text-[clamp(1.6rem,3vw,2.5rem)] text-ink">
          <span className="px-6">{t}</span>
          <span className="h-2 w-2 rounded-[3px] bg-ink" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="overflow-hidden border-y border-ink/10 py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee will-change-transform hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function Proof() {
  return (
    <section aria-label="Clients" className="wrap py-10 sm:py-12">
      <div className="grid items-center gap-6 lg:grid-cols-12">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted lg:col-span-2">Trusted by local businesses across South Africa</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:col-span-7">
          {TRUSTED.map((t) => (
            <li key={t} className="whitespace-nowrap font-display text-[1.3rem] text-ink/80">{t}</li>
          ))}
        </ul>
        <div className="border-ink/15 lg:col-span-3 lg:col-start-10 lg:border-l lg:pl-8">
          <p className="font-display text-4xl leading-none">4.9/5</p>
          <p className="mt-1.5 text-sm text-muted">average rating from 120+ businesses</p>
        </div>
      </div>
    </section>
  );
}
