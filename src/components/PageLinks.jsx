import React from "react";
import { Headline, Reveal } from "./ui.jsx";

// A block of links to the main pages, so every page leads on to the others (good for visitors and for search engines).
const LINKS = [
  { label: "Pricing", href: "/pricing", note: "Plans and prices in rand" },
  { label: "Our work", href: "/our-work", note: "Websites we have built" },
  { label: "Website developers in Durban", href: "/website-developers-in-durban", note: "What we build and how it works" },
  { label: "Online stores", href: "/ecommerce", note: "Ecommerce website design" },
  { label: "About the studio", href: "/about", note: "Who you deal with" },
  { label: "Free website audit", href: "/#audit", note: "Check your website in plain English" },
];

export default function PageLinks({ title = "More from KODA", className = "sec bg-paper2" }) {
  return (
    <section className={className}>
      <div className="wrap">
        <Reveal>
          <Headline className="h-section mb-12 max-w-[18ch]">{title}</Headline>
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LINKS.map((l, i) => (
            <Reveal as="li" key={l.href} delay={i * 60} className="list-none">
              <a href={l.href} className="block h-full rounded-3xl border border-ink/15 bg-paper p-6 transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="xwide block text-[1.05rem] leading-[1.12] tracking-[-0.02em]">{l.label}</span>
                <span className="t-body mt-2 block">{l.note}</span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
