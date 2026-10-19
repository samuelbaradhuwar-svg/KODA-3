import React, { useEffect, useRef } from "react";
import { PROCESS } from "../content.js";
import { Binoculars, PencilRuler, RocketLaunch, TrendUp } from "@phosphor-icons/react";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";
import CardCopy from "./CardCopy.jsx";

const PROCESS_ICONS = [Binoculars, PencilRuler, RocketLaunch, TrendUp];

// Alternating surfaces, all from the site palette.
const SURFACES = [
  "bg-paper2 text-ink",
  "keep-light bg-ink text-paper",
  "bg-paper2 text-ink",
  "keep-light bg-ink text-paper",
];

// Stacking cards: every card sticks to the top of the screen as you scroll, the next one slides up over it, and the
// card underneath shrinks and dims a little, so the steps read as a stack being dealt one at a time.
// Without JavaScript (or with reduced motion) the cards still stack through plain CSS sticky positioning.
export default function Process() {
  const wrapRefs = useRef([]);
  const cardRefs = useRef([]);
  const veilRefs = useRef([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = cardRefs.current.filter(Boolean);
    const wraps = wrapRefs.current.filter(Boolean);
    let raf = 0;
    let visible = false;

    // Browsers with scroll-driven animations (Chrome 115+, Safari 26+) run the shrink and dim on the compositor,
    // in step with the scroll itself, so nothing can stutter. Others fall back to the loop below.
    if (CSS.supports("animation-timeline: scroll()") && CSS.supports("animation-range: 0px 10px")) {
      const list = wraps[0].parentElement;
      let timer = 0;
      const apply = () => {
        const h = cards[0].offsetHeight;
        const cs = getComputedStyle(wraps[0]);
        const gap = parseFloat(cs.marginBottom) || 0;
        const listTop = list.getBoundingClientRect().top + window.scrollY;
        for (let i = 0; i < cards.length - 1; i++) {
          const stick = parseFloat(getComputedStyle(wraps[i]).top) || 0;
          const nextNatural = listTop + (i + 1) * (h + gap); // where card i + 1 would sit if nothing stuck
          const from = Math.round(nextNatural - stick - h);
          const to = Math.round(nextNatural - stick);
          for (const [el, name] of [[cards[i], "process-shrink"], [veilRefs.current[i], "process-dim"]]) {
            if (!el) continue;
            el.style.animationName = name;
            el.style.animationDuration = "1s";
            el.style.animationTimingFunction = "linear";
            el.style.animationFillMode = "both";
            el.style.animationTimeline = "scroll(root block)";
            el.style.animationRange = `${from}px ${to}px`;
          }
        }
      };
      const soon = () => {
        clearTimeout(timer);
        timer = setTimeout(apply, 120);
      };
      apply();
      const ro = new ResizeObserver(soon);
      ro.observe(list);
      ro.observe(document.documentElement);
      window.addEventListener("load", soon);
      return () => {
        clearTimeout(timer);
        ro.disconnect();
        window.removeEventListener("load", soon);
        for (const el of [...cards, ...veilRefs.current]) if (el) el.style.animationName = "";
      };
    }

    const update = () => {
      raf = 0;
      for (let i = 0; i < cards.length - 1; i++) {
        // how far the next card has climbed over this one: 0 = just touching its bottom edge, 1 = fully covering it
        const stickTop = cards[i].getBoundingClientRect().top;
        const nextTop = wraps[i + 1].getBoundingClientRect().top;
        const h = cards[i].offsetHeight;
        const p = Math.min(1, Math.max(0, (stickTop + h - nextTop) / h));
        cards[i].style.transform = `scale(${(1 - 0.05 * p).toFixed(4)})`;
        if (veilRefs.current[i]) veilRefs.current[i].style.opacity = (0.35 * p).toFixed(3);
      }
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: "20% 0px" }
    );
    io.observe(wraps[0].parentElement);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="sec">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Our process</Eyebrow>
            <Headline className="h-section mt-5">A process built to grow your business.</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
            <p className="t-body">Every step has one job: put your business in front of more customers.</p>
          </Reveal>
        </div>

        <ol className="mt-12 sm:mt-16">
          {PROCESS.map((s, i) => (
            <li key={s.n} ref={(el) => { wrapRefs.current[i] = el; }} className="process-slot" style={{ "--i": i }}>
              <article
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`process-card relative overflow-hidden rounded-[28px] ${SURFACES[i % SURFACES.length]}`}
              >
                <CardCopy icon={PROCESS_ICONS[i % PROCESS_ICONS.length]} title={s.title} desc={s.desc} tone={SURFACES[i % SURFACES.length].includes("bg-ink") ? "ink" : "paper"} />
                {/* darkens this card as the next one covers it */}
                <span ref={(el) => { veilRefs.current[i] = el; }} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black opacity-0" />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
