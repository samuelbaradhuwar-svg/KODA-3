import React from "react";
import { SERVICES } from "../content.js";
import { Button, Eyebrow, Headline, Reveal, TextLink } from "./ui.jsx";
import { scrollToId } from "../lib/utils.js";

export function ServiceList({ items = SERVICES }) {
  return (
    <ol className="grid gap-x-16 sm:grid-cols-2">
      {items.map((s, i) => (
        <Reveal as="li" key={s.title} delay={(i % 2) * 80} className="group grid grid-cols-[2.75rem_1fr] gap-3 border-t border-ink/15 py-7">
          <span className="pt-2 text-xs font-semibold tracking-[0.14em] text-muted">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3 className="font-display text-[1.2rem] leading-tight transition-colors duration-300 group-hover:text-ink/55">{s.title}</h3>
            <p className="t-body mt-2.5">{s.desc}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

// A deck of cards: the top card jumps up and over, then slips behind the rest, revealing the next one.
// Without motion (or before the page is interactive) the same cards are shown as a plain list.
const SURFACES = ["bg-paper text-ink", "bg-ink text-paper", "bg-accent text-ink"];
const VISIBLE = 4; // how many cards of the deck show behind the top one
const STEP = 0.62; // screens of scrolling per card

const smooth = (x) => x * x * (3 - 2 * x);

function ServiceCard({ s, i, total, className = "" }) {
  const dark = i % SURFACES.length === 1;
  return (
    <article className={`relative h-full overflow-hidden rounded-[28px] ${SURFACES[i % SURFACES.length]} ${className}`}>
      <div className="grid h-full content-between gap-6 p-6 sm:p-10 lg:grid-cols-12 lg:gap-10 lg:p-12 [@media(max-height:520px)]:grid-cols-12 [@media(max-height:520px)]:gap-x-6 [@media(max-height:520px)]:gap-y-2 [@media(max-height:520px)]:p-5">
        <div className="flex items-start justify-between lg:col-span-12 [@media(max-height:520px)]:col-span-12">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] opacity-60">
            {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] opacity-60">KODA</span>
        </div>
        <span aria-hidden="true" className="xwide text-[clamp(3.5rem,13vw,8rem)] leading-[0.85] tracking-[-0.04em] lg:col-span-4 [@media(max-height:520px)]:col-span-4 [@media(max-height:520px)]:self-end [@media(max-height:520px)]:text-[3.5rem]">
          {String(i + 1).padStart(2, "0")}
        </span>
        <div className="self-end lg:col-span-7 lg:col-start-6 [@media(max-height:520px)]:col-span-7 [@media(max-height:520px)]:col-start-6">
          <h3 className="xwide text-[clamp(1.35rem,3.4vw,2.6rem)] leading-[1.04] tracking-[-0.03em] [@media(max-height:520px)]:text-[1.25rem]">{s.title}</h3>
          <p className={`mt-4 max-w-[34ch] text-[clamp(15px,1.4vw,18px)] leading-[1.55] sm:max-w-[48ch] ${dark ? "text-paper/70" : "text-ink/75"}`}>{s.desc}</p>
        </div>
      </div>
    </article>
  );
}

function ServiceDeck({ items = SERVICES }) {
  const [mode, setMode] = React.useState("list");
  const trackRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  const counterRef = React.useRef(null);
  const barRef = React.useRef(null);
  const n = items.length;

  React.useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setMode("deck");
  }, []);

  React.useEffect(() => {
    if (mode !== "deck") return;
    const cards = cardRefs.current.filter(Boolean);
    let raf = 0;
    let visible = false;
    let lastShown = -1;

    const place = (t) => {
      const k = Math.min(n - 1, Math.floor(t));
      const f = k >= n - 1 ? 0 : t - k;
      const h = cards[0].offsetHeight;
      const peek = Math.min(14, h * 0.045);
      for (let i = 0; i < n; i++) {
        let d = (((i - k) % n) + n) % n; // 0 = top of the deck
        let y = 0;
        let rot = 0;
        let z;
        if (i === k) {
          // the top card jumps up and over, then drops behind the whole deck
          const lift = Math.sin(Math.PI * Math.min(1, f));
          y = -h * 0.62 * lift;
          rot = (k % 2 ? -1 : 1) * 5 * lift;
          if (f < 0.5) {
            d = 0;
            z = 2000;
          } else {
            d = (n - 1) * smooth((f - 0.5) / 0.5);
            z = 1;
          }
        } else {
          d = Math.max(0, d - f);
          z = 1000 - Math.round(d * 10);
        }
        const dv = Math.min(d, VISIBLE);
        const sc = 1 - dv * 0.035;
        cards[i].style.transform = `translate3d(0,${(y - dv * peek).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
        cards[i].style.zIndex = String(z);
        cards[i].style.opacity = d > VISIBLE + 0.6 ? "0" : "1";
        cards[i].style.pointerEvents = i === k && f < 0.5 ? "auto" : "none";
        cards[i].setAttribute("aria-hidden", i === Math.round(t) ? "false" : "true");
      }
      const shown = Math.round(t);
      if (shown !== lastShown && counterRef.current) {
        lastShown = shown;
        counterRef.current.textContent = `${String(shown + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${(n > 1 ? t / (n - 1) : 1).toFixed(4)})`;
    };

    const update = () => {
      raf = 0;
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;
      const range = Math.max(1, track.offsetHeight - stage.offsetHeight);
      const p = Math.min(1, Math.max(0, -track.getBoundingClientRect().top / range));
      // a short hold at each end so the first and last cards can be read before the deck moves
      const q = Math.min(1, Math.max(0, (p - 0.04) / 0.92));
      place(q * (n - 1));
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: "20% 0px" }
    );
    io.observe(trackRef.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode, n]);

  if (mode === "list") {
    return (
      <ol className="grid gap-4 sm:grid-cols-2">
        {items.map((s, i) => (
          <li key={s.title} className="min-h-[15rem]">
            <ServiceCard s={s} i={i} total={n} />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div ref={trackRef} className="deck-track" style={{ "--n": n, "--step": STEP }}>
      <div ref={stageRef} className="deck-stage">
        <ol className="deck" aria-label="Our services">
          {items.map((s, i) => (
            <li key={s.title} ref={(el) => { cardRefs.current[i] = el; }} className="deck-card">
              <ServiceCard s={s} i={i} total={n} />
            </li>
          ))}
        </ol>
        <div className="deck-meter" aria-hidden="true">
          <span ref={counterRef} className="text-[12px] font-semibold tracking-[0.18em] text-ink/70">01 / {String(n).padStart(2, "0")}</span>
          <span className="deck-bar"><span ref={barRef} className="deck-bar-fill" /></span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/50">Keep scrolling</span>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" className="sec bg-paper2">
      <div className="wrap">
        <div className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>What we do</Eyebrow>
            <Headline className="h-section mt-5">Everything your business needs to succeed online.</Headline>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
            <p className="t-body">From your first website to ongoing SEO and support, one studio for every step.</p>
            <div className="mt-5">
              <TextLink href="/website-design-durban">Website design in Durban</TextLink>
            </div>
          </Reveal>
        </div>
        <ServiceDeck />

        <Reveal className="mt-16 sm:mt-24 grid items-center gap-6 rounded-[2rem] bg-accent px-6 py-10 text-ink sm:px-12 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70">Starting from scratch?</p>
            <h3 className="xwide mt-4 text-[clamp(1.4rem,2.7vw,2.4rem)] leading-[1.06] tracking-[-0.02em]">Just an idea? No pressure.</h3>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.7] text-ink/75">
              Many businesses begin with nothing more than a name or a sketch. Tell us what you have in mind and we will help shape the logo, the brand and the website, at your pace, with no obligation.
            </p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Button onClick={() => scrollToId("contact")}>Share your idea</Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
