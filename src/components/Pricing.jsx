import React from "react";
import { Check } from "@phosphor-icons/react";
import { PLANS } from "../content.js";
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
                    <h3 className="font-display text-4xl leading-none">{p.name}</h3>
                    {hot && <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">Most popular</span>}
                  </div>
                  <p className={cn("mt-4 max-w-[34ch] text-[15px] leading-[1.7]", hot ? "text-paper/65" : "text-muted")}>{p.desc}</p>
                </div>

                <div className="lg:col-span-3">
                  {p.was && <p className={cn("text-sm line-through", hot ? "text-paper/60" : "text-muted")}>{p.was}</p>}
                  <p className="font-display text-[clamp(2.6rem,4vw,3.4rem)] leading-none">{p.price}</p>
                  <p className={cn("mt-2 text-[11px] font-semibold uppercase tracking-[0.16em]", hot ? "text-paper/60" : "text-muted")}>{p.note}</p>
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
                  <Button variant={hot ? "lime" : "dark"} onClick={() => scrollToId("contact")}>Get started</Button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
