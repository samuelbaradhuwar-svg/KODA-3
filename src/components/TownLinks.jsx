import React from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";
import { routedTowns, townPath } from "../towns.js";
import { cn } from "../lib/utils.js";

// "Website design across Durban and nearby": a dark section with a pill for every town page (Figma variation B).
// On a town page, pass `hub` to add a lime "Durban" pill that goes up to the Durban page, and `exclude` to leave out
// the town you are already on. Towns that are still drafts (preview builds only) are marked as such.
export default function TownLinks({ hub = false, exclude }) {
  const towns = routedTowns().filter((t) => t.slug !== exclude);
  if (!towns.length && !hub) return null;
  const items = [
    ...(hub ? [{ key: "durban", name: "Durban", href: "/website-design-durban", hub: true }] : []),
    ...towns.map((t) => ({ key: t.slug, name: t.name, href: townPath(t), draft: !t.live })),
  ];
  return (
    <section className="keep-light sec border-b border-paper/10 bg-ink text-paper">
      <div className="wrap">
        <Reveal>
          <Eyebrow light>Areas we serve</Eyebrow>
          <Headline light className="h-section mb-12 mt-5 max-w-[32ch]">Website design across Durban and nearby</Headline>
        </Reveal>
        <Reveal delay={100}>
          <ul className="flex flex-wrap gap-3">
            {items.map((it) => (
              <li key={it.key}>
                <a
                  href={it.href}
                  className={cn(
                    "group inline-flex min-h-11 items-center gap-2.5 rounded-full px-5 py-3 text-[15px] transition-colors duration-300",
                    it.hub ? "bg-accent text-ink" : "border border-paper/30 text-paper hover:border-accent"
                  )}
                >
                  <span className={cn("text-[12px]", it.hub ? "text-ink/70" : "text-paper/60")}>Website design</span>
                  <span className="text-[16px] font-semibold">{it.name}</span>
                  {it.draft && <span className="rounded-full bg-paper/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-paper/70">draft</span>}
                  <ArrowUpRight size={16} weight="bold" aria-hidden="true" className={cn("shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5", it.hub ? "text-ink" : "text-accent")} />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
