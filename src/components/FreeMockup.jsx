import React from "react";
import { MOCKUP_STEPS } from "../content.js";
import { Button, Reveal } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";

// "See your homepage before you pay": the risk-free start, spelled out in four steps.
export default function FreeMockup() {
  return (
    <Reveal className="keep-light mt-10 rounded-[28px] bg-ink px-6 py-10 text-paper sm:px-10 sm:py-12 lg:px-14 lg:py-14">
      <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-paper/60">
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-[3px] bg-accent" />
        Try before you pay
      </p>
      <h3 className="xwide mt-4 text-[clamp(1.6rem,3.6vw,2.8rem)] leading-[1.04] tracking-[-0.03em]">See your homepage before you pay</h3>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.7] text-paper/70">
        Tell us about your business and we will design a free homepage mock-up first. If you like it, we carry on. If not, there is no cost and no pressure.
      </p>

      <ol className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOCKUP_STEPS.map((s, i) => (
          <li key={s.title} className="rounded-3xl bg-paper/[0.07] p-6">
            <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-2xl bg-accent font-display text-[15px] text-ink">{String(i + 1).padStart(2, "0")}</span>
            <h4 className="xwide mt-5 text-[1.05rem] leading-[1.12] tracking-[-0.02em]">{s.title}</h4>
            <p className="mt-2.5 text-[15px] leading-[1.6] text-paper/70">{s.desc}</p>
          </li>
        ))}
      </ol>

      <div className="mt-9">
        <Button variant="lime" onClick={() => scrollToId("contact")}>Ask for a free mock-up</Button>
      </div>
    </Reveal>
  );
}
