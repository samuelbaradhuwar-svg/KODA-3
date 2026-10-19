import React from "react";
import { Check } from "@phosphor-icons/react";
import { PLANS, INCLUDED, MOCKUP_OFFER } from "../content.js";
import { Button, Eyebrow, Headline, Reveal } from "./ui.jsx";
import { cn, scrollToId } from "../lib/utils.js";

export default function Pricing() {
  return (
    <section id="pricing" className="sec">
      <div className="wrap">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>Pricing</Eyebrow>
            <Headline className="h-section mt-5">Simple pricing, built for local businesses.</Headline>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4">
          {PLANS.map((p, i) => {
            const hot = p.highlighted;
            return (
              <Reveal
                key={p.name}
                delay={i * 80}
                className={cn(
                  "grid gap-8 rounded-[28px] px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-12 lg:items-center lg:gap-10",
                  hot ? "bg-ink text-paper" : "border border-ink/15"
                )}
              >
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-2xl leading-none">{p.name}</h3>
                    {hot && <span className="rounded-full bg-accent px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">Most popular</span>}
                  </div>
                  <p className={cn("mt-4 max-w-[34ch] text-[15px] leading-[1.7]", hot ? "text-paper/65" : "text-muted")}>{p.desc}</p>
                </div>

                <div className="lg:col-span-3">
                  {p.was && <p className={cn("text-sm line-through", hot ? "text-paper/60" : "text-muted")}>{p.was}</p>}
                  <p className="font-display text-[clamp(2.6rem,4vw,3.4rem)] leading-none">{p.price}</p>
                  <p className={cn("mt-2 text-[12px] font-semibold uppercase tracking-[0.16em]", hot ? "text-paper/60" : "text-muted")}>{p.note}</p>
                </div>

                <ul className="grid gap-2.5 lg:col-span-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={16} weight="bold" className={cn("mt-0.5 shrink-0", hot ? "text-accent" : "text-ink")} />
                      <span className={hot ? "text-paper/85" : "text-ink/80"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="lg:col-span-2 lg:justify-self-end">
                  <Button variant={hot ? "lime" : "dark"} onClick={() => scrollToId("contact")}>Get started<span className="sr-only"> with {p.name}</span></Button>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 border-t border-ink/15 pt-10">
          <h3 className="xwide text-[clamp(1.05rem,2.3vw,1.3rem)] leading-[1.1] tracking-[-0.02em]">Included with every website</h3>
          <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDED.map((i) => (
              <li key={i.title} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-[0.5em] h-2.5 w-2.5 shrink-0 rounded-[3px] bg-accent ring-1 ring-ink/50" />
                <span>
                  <span className="block font-semibold">{i.title}</span>
                  <span className="mt-1 block text-[15px] leading-[1.6] text-muted">{i.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        {MOCKUP_OFFER && (
          <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-5 rounded-[28px] bg-ink px-6 py-8 text-paper sm:px-10 sm:py-10">
            <div className="max-w-[46ch]">
              <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-paper/60"><span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-[3px] bg-accent" />Free mock-up</p>
              <h3 className="xwide mt-4 text-[clamp(1.2rem,2.6vw,1.7rem)] leading-[1.08] tracking-[-0.02em]">See your homepage before you pay</h3>
              <p className="mt-3 text-[15px] leading-[1.65] text-paper/70">Tell us about your business and we will design a free homepage mock-up first. If you like it, we carry on. If not, there is no cost and no pressure.</p>
            </div>
            <Button variant="lime" onClick={() => scrollToId("contact")}>Ask for a free mock-up</Button>
          </Reveal>
        )}
      </div>
    </section>
  );
}
