import React from "react";
import { Check } from "@phosphor-icons/react";
import { PLANS, MONTHLY_PLANS, INCLUDED, MOCKUP_OFFER } from "../content.js";
import { Button, Eyebrow, Headline, Reveal, Koda } from "./ui.jsx";
import { cn, scrollToId } from "../lib/utils.js";

// One plan card, used for both the once-off websites and the monthly plans.
function PlanCard({ p, i, id, monthly }) {
  const hot = p.highlighted;
  // "From R2,999" is shown as a small "From" line over the number, so every card's price lines up
  const from = p.price.startsWith("From ");
  const amount = from ? p.price.slice(5) : p.price;
  return (
    <Reveal delay={i * 90} className={cn("h-full", hot && "lg:-mt-6 lg:h-[calc(100%+3rem)]")}>
      <article
        aria-labelledby={id}
        className={cn(
          "relative flex h-full flex-col rounded-[28px] px-7 py-9 transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-9 lg:py-10",
          hot ? "bg-ink text-paper shadow-[0_40px_70px_-30px_rgba(16,16,16,0.55)] lg:py-14" : "border border-ink/15 bg-paper"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            {monthly && <p className={cn("mb-1.5 text-[12px] tracking-[0.12em]", hot ? "text-paper/60" : "text-muted")}><Koda /></p>}
            <h3 id={id} className="xwide text-[1.35rem] leading-none tracking-[-0.02em]">{p.name}</h3>
          </div>
          {hot && p.badge && <span className="rounded-full bg-accent px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">{p.badge}</span>}
        </div>
        <p className={cn("mt-4 text-[15px] leading-[1.65]", hot ? "text-paper/70" : "text-muted")}>{p.desc}</p>

        <div className={cn("mt-8 border-t pt-8", hot ? "border-paper/15" : "border-ink/10")}>
          <p aria-hidden={!from || undefined} className={cn("h-4 text-[12px] font-semibold uppercase tracking-[0.16em]", hot ? "text-paper/60" : "text-muted")}>{from ? "From" : " "}</p>
          <p className="mt-2 font-display text-[clamp(2.4rem,4.4vw,3.3rem)] leading-[1.02]">{amount}</p>
          <p className={cn("mt-2 text-[12px] font-semibold uppercase tracking-[0.16em]", hot ? "text-paper/60" : "text-muted")}>{p.note}</p>
        </div>

        <ul className="mt-8 grid flex-1 content-start gap-3">
          {p.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-[15px] leading-[1.5]">
              <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full", hot ? "bg-accent text-ink" : "bg-ink text-paper")}>
                <Check size={12} weight="bold" aria-hidden="true" />
              </span>
              <span className={hot ? "text-paper/90" : "text-ink/85"}>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Button variant={hot ? "lime" : "dark"} className="w-full justify-between" onClick={() => scrollToId("contact")}>
            <span>{p.cta}{!monthly && p.cta === "Get started" && <span className="sr-only"> with {p.name}</span>}</span>
          </Button>
        </div>
      </article>
    </Reveal>
  );
}

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

        <p className="t-body mt-6">Prices are in South African rand. Your written quote confirms exactly what is included.</p>

        <p className="mt-14 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">Websites, paid once</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-3 lg:items-stretch lg:gap-6">
          {PLANS.map((p, i) => (
            <PlanCard key={p.name} p={p} i={i} id={`plan-${p.name}`} />
          ))}
        </div>

        <Reveal className="mt-14 border-t border-ink/15 pt-10 lg:mt-16">
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
          <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-5 keep-light rounded-[28px] bg-ink px-6 py-8 text-paper sm:px-10 sm:py-10">
            <div className="max-w-[46ch]">
              <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-paper/60"><span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-[3px] bg-accent" />Free mock-up</p>
              <h3 className="xwide mt-4 text-[clamp(1.2rem,2.6vw,1.7rem)] leading-[1.08] tracking-[-0.02em]">See your homepage before you pay</h3>
              <p className="mt-3 text-[15px] leading-[1.65] text-paper/70">Tell us about your business and we will design a free homepage mock-up first. If you like it, we carry on. If not, there is no cost and no pressure.</p>
            </div>
            <Button variant="lime" onClick={() => scrollToId("contact")}>Ask for a free mock-up</Button>
          </Reveal>
        )}

        {/* monthly plans */}
        <div className="mt-20 border-t border-ink/15 pt-14 lg:mt-24 lg:pt-16">
          <Reveal>
            <Eyebrow>Monthly growth plans</Eyebrow>
            <h3 className="h-section mt-5">Choose your growth plan.</h3>
            <p className="t-body mt-6">
              Already have a website? Keep it working and growing, with fixed monthly allowances so you always know what is delivered. These are proposed starting prices.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-stretch lg:gap-6">
            {MONTHLY_PLANS.map((p, i) => (
              <PlanCard key={p.name} p={p} i={i} id={`monthly-${p.name}`} monthly />
            ))}
          </div>

          <Reveal className="mt-12 border-t border-ink/15 pt-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Quoted separately</p>
            <p className="mt-2 max-w-[70ch] text-[15px] leading-[1.65] text-ink/85">
              Advertising budgets, extensive video production, professional photography and initial website development are quoted separately.
            </p>
            <p className="mt-2 max-w-[70ch] text-[14px] leading-[1.65] text-muted">
              Each monthly plan has a fixed allowance of posts and campaigns, not unlimited work. Add a logo and brand look to any plan from R3,500, once off.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
