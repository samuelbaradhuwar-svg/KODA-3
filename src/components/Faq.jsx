import React, { useState } from "react";
import { Minus, Plus } from "@phosphor-icons/react";
import { FAQS } from "../content.js";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";
import { cn } from "../lib/utils.js";

export default function Faq({ title = "Common questions", open0 = 0 }) {
  const [open, setOpen] = useState(open0);
  return (
    <section className="sec">
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-4">
          <Eyebrow>FAQ</Eyebrow>
          <Headline className="h-section mt-5">{title}</Headline>
        </Reveal>
        <Reveal delay={100} className="lg:col-span-7 lg:col-start-6">
          <div className="border-t border-ink/15">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className="border-b border-ink/15">
                  <h3>
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium transition-colors hover:text-ink/60"
                    >
                      {f.q}
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/20">
                        {isOpen ? <Minus size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    inert={!isOpen}
                    className={cn("grid transition-[grid-template-rows] duration-500 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                  >
                    <div className="overflow-hidden">
                      <p className="t-body pb-6">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
