import React, { useEffect, useRef } from "react";
import { PROCESS } from "../content.js";
import { Binoculars, PencilRuler, RocketLaunch, TrendUp } from "@phosphor-icons/react";
import { Eyebrow, Headline, Reveal } from "./ui.jsx";
import CardCopy from "./CardCopy.jsx";
import discoverImg from "../assets/process-discover.webp";
import designImg from "../assets/process-design.webp";
import launchImg from "../assets/process-launch.webp";
import growImg from "../assets/process-grow.webp";

const PROCESS_ICONS = [Binoculars, PencilRuler, RocketLaunch, TrendUp];

// Each step has a photo behind it. The photos are kept simple and dark so the copy stays readable, and the
// position of each one keeps its subject (glasses, screens, rocket, cash) in frame on phones and on wide screens.
// The text sits at the top of the card and a dark fade sits behind it, so the subject stays clear underneath.
const PHOTOS = [
  { src: discoverImg, w: 1600, h: 1200, img: "object-[50%_50%] md:object-[50%_72%]", fade: "linear-gradient(180deg, rgb(16 16 16 / 0.78), rgb(16 16 16 / 0.45) 45%, rgb(16 16 16 / 0.05))" },
  { src: designImg, w: 1600, h: 1067, img: "object-[33%_50%] md:object-[50%_38%]", fade: "linear-gradient(180deg, rgb(16 16 16 / 0.8), rgb(16 16 16 / 0.5) 45%, rgb(16 16 16 / 0.1))" },
  { src: launchImg, w: 1600, h: 1066, img: "object-[51%_50%] max-md:origin-[65%_0%] max-md:scale-[1.6] md:origin-[0%_20%] md:scale-[1.27] md:object-top", fade: "linear-gradient(180deg, rgb(16 16 16 / 0.62), rgb(16 16 16 / 0.28) 45%, rgb(16 16 16 / 0))" },
  { src: growImg, w: 1264, h: 843, img: "object-[50%_50%] md:object-[50%_30%]", fade: "linear-gradient(180deg, rgb(16 16 16 / 0.8), rgb(16 16 16 / 0.55) 45%, rgb(16 16 16 / 0.25))" },
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
    <section id="process" className="sec">
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
                className="keep-light process-card relative overflow-hidden rounded-[28px] bg-ink text-paper"
              >
                <img
                  src={PHOTOS[i % PHOTOS.length].src}
                  width={PHOTOS[i % PHOTOS.length].w}
                  height={PHOTOS[i % PHOTOS.length].h}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-cover ${PHOTOS[i % PHOTOS.length].img}`}
                />
                <span aria-hidden="true" className="absolute inset-0" style={{ background: PHOTOS[i % PHOTOS.length].fade }} />
                <CardCopy top icon={PROCESS_ICONS[i % PROCESS_ICONS.length]} title={s.title} desc={s.desc} tone="ink" className="relative" />
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
