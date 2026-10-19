import React from "react";
import { Check } from "@phosphor-icons/react";
import { COMPARE } from "../content.js";
import { Eyebrow, Headline, Reveal, withBrand } from "./ui.jsx";
import { cn } from "../lib/utils.js";

// An honest side by side: a DIY builder, the cheapest quote, and KODA. No named competitors.
// The KODA column is the dark one; the name is always in the logo lettering and never green.
export default function Compare() {
  const { cols, rows } = COMPARE;
  const last = cols.length - 1;
  return (
    <section id="compare" className="sec bg-paper2">
      <div className="wrap">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Eyebrow>Why {withBrand("KODA")}</Eyebrow>
            <Headline className="h-section mt-5">Why not a DIY builder or the cheapest quote?</Headline>
          </div>
          <p className="t-body lg:col-span-4">
            A DIY builder or a very cheap template can be the right call if you have more time than budget. {withBrand("KODA")} is for owners who want it done properly, once, and want to be found on Google.
          </p>
        </Reveal>

        {/* phone and tablet: one card per row */}
        <div className="mt-12 grid gap-4 lg:hidden">
          {rows.map((r, n) => (
            <Reveal key={r.label} delay={n * 60} className="rounded-[24px] border border-ink/15 bg-paper p-5 sm:p-6">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink">{r.label}</h3>
              <dl className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {cols.map((c, i) => (
                  <div key={c} className={cn("rounded-2xl px-4 py-3.5", i === last ? "bg-ink text-paper" : "bg-paper2")}>
                    <dt className={cn("text-[12px] font-semibold uppercase tracking-[0.14em]", i === last ? "text-paper/70" : "text-muted")}>{withBrand(c)}</dt>
                    <dd className={cn("mt-1.5 flex items-start gap-2 text-[15px] leading-[1.5]", i === last ? "font-medium text-paper" : "text-ink/75")}>
                      {i === last && <Check size={16} weight="bold" className="mt-[3px] shrink-0 text-accent" aria-hidden="true" />}
                      <span>{r.vals[i]}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>

        {/* desktop: a table with the KODA column set apart */}
        <Reveal className="mt-14 hidden overflow-hidden rounded-[28px] border border-ink/15 bg-paper lg:block">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-[19%] px-7 py-6"><span className="sr-only">Feature</span></th>
                {cols.map((c, i) => (
                  <th key={c} scope="col" className={cn("px-7 py-6 align-bottom text-[13px] font-semibold uppercase tracking-[0.16em]", i === last ? "bg-ink text-paper" : "text-muted")}>{withBrand(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-ink/10">
                  <th scope="row" className="px-7 py-6 align-top text-[12px] font-semibold uppercase tracking-[0.16em] text-ink">{r.label}</th>
                  {r.vals.map((v, i) => (
                    <td key={i} className={cn("px-7 py-6 align-top text-[15px] leading-[1.55]", i === last ? "bg-ink font-medium text-paper" : "text-ink/75")}>
                      {i === last ? (
                        <span className="flex items-start gap-2.5">
                          <Check size={16} weight="bold" className="mt-[3px] shrink-0 text-accent" aria-hidden="true" />
                          <span>{v}</span>
                        </span>
                      ) : (
                        v
                      )}
                    </td>
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
