import React from "react";
import { COMPARE } from "../content.js";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";
import { cn } from "../lib/utils.js";

// An honest side by side: a DIY builder, the cheapest quote, and KODA. No named competitors.
export default function Compare() {
  const { cols, rows } = COMPARE;
  const last = cols.length - 1;
  return (
    <section id="compare" className="sec bg-paper2">
      <div className="wrap">
        <Reveal>
          <Eyebrow>Why KODA</Eyebrow>
          <Headline className="h-section mt-5 max-w-[20ch]">Why not a DIY builder or the cheapest quote?</Headline>
          <p className="t-body mt-6">
            A DIY builder or a very cheap template can be the right call if you have more time than budget. KODA is for owners who want it done properly, once, and want to be found on Google.
          </p>
        </Reveal>

        {/* phone and tablet: one card per row */}
        <div className="mt-12 grid gap-4 lg:hidden">
          {rows.map((r) => (
            <Reveal key={r.label} className="rounded-[24px] border border-ink/15 bg-paper p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">{r.label}</p>
              <dl className="mt-4 grid gap-3">
                {cols.map((c, i) => (
                  <div key={c} className={cn("rounded-2xl px-4 py-3", i === last ? "bg-ink text-paper" : "bg-paper2")}>
                    <dt className={cn("text-[12px] font-semibold uppercase tracking-[0.14em]", i === last ? "text-accent" : "text-muted")}>{c}</dt>
                    <dd className={cn("mt-1 text-[15px] leading-[1.55]", i === last ? "text-paper" : "text-ink/80")}>{r.vals[i]}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>

        {/* desktop: a table */}
        <Reveal className="mt-14 hidden overflow-hidden rounded-[28px] border border-ink/15 bg-paper lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-[20%] p-6"><span className="sr-only">Feature</span></th>
                {cols.map((c, i) => (
                  <th key={c} scope="col" className={cn("p-6 align-bottom font-display text-lg", i === last ? "bg-ink text-accent" : "text-ink")}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-ink/10">
                  <th scope="row" className="p-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">{r.label}</th>
                  {r.vals.map((v, i) => (
                    <td key={i} className={cn("p-6 align-top text-[15px] leading-[1.55]", i === last ? "bg-ink font-medium text-paper" : "text-ink/75")}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
