import React from "react";
import { Check, Minus, X } from "@phosphor-icons/react";
import { COMPARE } from "../content.js";
import { Eyebrow, Headline, Reveal, withBrand } from "./ui.jsx";
import { cn } from "../lib/utils.js";

// An honest side by side: a DIY builder, the cheapest quote, and KODA. No named competitors.
// Each answer carries a tone: pro (a strength), mid (depends, or costs you time), con (a drawback),
// plain (neutral). Tone is shown by icon shape and a screen reader word as well as colour.
// The KODA column is the dark one; the name is always in the logo lettering and never green.
const TONE = {
  pro: { label: "Strength", Icon: Check, dot: "bg-accent text-ink", tint: "bg-accent/20" },
  mid: { label: "Depends", Icon: Minus, dot: "bg-[#FFC76B] text-ink", tint: "bg-[#FFC76B]/20" },
  con: { label: "Drawback", Icon: X, dot: "bg-[#FF9A8B] text-ink", tint: "bg-[#FF9A8B]/15" },
  plain: { label: "", Icon: Minus, dot: "bg-paper/25 text-paper", tint: "" },
};

function Mark({ tone }) {
  const { Icon, dot } = TONE[tone];
  return (
    <span className={cn("mt-[1px] grid h-6 w-6 shrink-0 place-items-center rounded-full", dot)} aria-hidden="true">
      <Icon size={13} weight="bold" />
    </span>
  );
}

function Answer({ tone, children, dark }) {
  const t = TONE[tone];
  return (
    <span className="flex items-start gap-3.5">
      <Mark tone={tone} />
      <span className={cn("text-[15px] leading-[1.5]", dark ? "font-medium text-paper" : "text-ink/90")}>
        {t.label && <span className="sr-only">{t.label}: </span>}
        {children}
      </span>
    </span>
  );
}

function Key() {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-ink/80" aria-label="Key">
      {[["pro", "A strength"], ["mid", "Depends, or costs you time"], ["con", "A drawback"]].map(([k, t]) => (
        <li key={k} className="flex items-center gap-2">
          <Mark tone={k} />
          {t}
        </li>
      ))}
    </ul>
  );
}

const Title = ({ children, as: As = "span", className }) => (
  <As className={cn("xwide flex items-start gap-2.5 text-[14px] uppercase leading-[1.15] tracking-[-0.01em] text-ink", className)}>
    <span className="mt-[3px] h-2 w-2 shrink-0 rounded-[3px] bg-accentDeep" aria-hidden="true" />
    <span>{children}</span>
  </As>
);

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

        <div className="mt-10"><Key /></div>

        {/* phone and tablet: one card per row */}
        <div className="mt-6 grid gap-4 lg:hidden">
          {rows.map((r, n) => (
            <Reveal key={r.label} delay={n * 60} className="overflow-hidden rounded-[24px] border border-ink/15 bg-paper">
              <h3 className="px-5 pb-3.5 pt-5 sm:px-6"><Title>{r.label}</Title></h3>
              <dl className="border-t border-ink/10">
                {cols.map((c, i) => (
                  <div key={c} className={cn("px-5 py-3.5 sm:px-6", i < last && "border-b border-ink/10", i === last ? "bg-ink" : TONE[r.tones[i]].tint)}>
                    <dt className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", i === last ? "text-paper/65" : "text-muted")}>{withBrand(c)}</dt>
                    <dd className="mt-1.5">
                      <Answer tone={r.tones[i]} dark={i === last}>{r.vals[i]}</Answer>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>

        {/* desktop: a table with the KODA column set apart */}
        <Reveal className="mt-6 hidden overflow-hidden rounded-[28px] border border-ink/15 bg-paper lg:block">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-[19%] px-7 py-6"><span className="sr-only">Feature</span></th>
                {cols.map((c, i) => (
                  <th key={c} scope="col" className={cn("xwide px-7 py-6 align-bottom text-[16px] uppercase tracking-[-0.01em]", i === last ? "relative bg-ink text-paper" : "text-ink")}>
                    {i === last && <span className="absolute left-7 top-0 h-1 w-10 rounded-b bg-accent" aria-hidden="true" />}
                    {withBrand(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-ink/10">
                  <th scope="row" className="bg-paper2/50 px-7 py-6 align-top"><Title>{r.label}</Title></th>
                  {r.vals.map((v, i) => (
                    <td key={i} className={cn("px-7 py-6 align-top", i === last ? "bg-ink" : TONE[r.tones[i]].tint)}>
                      <Answer tone={r.tones[i]} dark={i === last}>{v}</Answer>
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
