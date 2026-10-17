import React from "react";
import LiquidMetalShader from "./shader/liquid-metal-shader.jsx";
import { kodaContourFragmentShader } from "./shader/contour-shader.js";
import { Button } from "./ui.jsx";
import { ease, Timeline } from "../lib/timeline.js";
import { LETTER_PATHS, MARK_PATH } from "../lib/logo-paths.js";
import { scrollToId } from "../lib/utils.js";

// Brand colours (same values as tailwind.config.js: paper / ink).
const PAPER = "#F6F5F1";
const INK = "#0A0A0B";

const SERVICES = [
  { n: "01", title: "Website design", body: "A modern, mobile friendly site that builds credibility." },
  { n: "02", title: "Google Business", body: "Get found on Google Maps and in local searches." },
  { n: "03", title: "Digital presence", body: "One consistent story across your site, profile and email." },
];

const EYEBROW = "Web design studio, Durban";
const HEADLINE = "Your business deserves to be found.";
const LEAD =
  "KODA is a Durban web design studio. We build modern websites, set up and optimise your Google Business profile, and help local businesses turn online visibility into real customers.";

const STATEMENT_ONE = [
  { w: "We", muted: true },
  { w: "build", muted: true },
  { w: "your", muted: true },
  { w: "digital", muted: false },
  { w: "presence.", muted: false },
];
const STATEMENT_TWO = [
  { w: "Koda", muted: true },
  { w: "is", muted: true },
  { w: "a", muted: false },
  { w: "studio", muted: false },
  { w: "for", muted: false },
  { w: "being", muted: false },
  { w: "seen.", muted: false },
];

// Logo geometry: the mark is ~610 units tall; the wordmark sits 385..535 below centre (lockup ~840 tall).
const U = 610;

// Timeline units. Each beat is a block of units; the whole thing maps onto the hero's scroll distance.
const T = 1.4; // the pool zooms and dissolves into the page
const WORD_STAGGER = 0.09;

/** Fade/slide parameter u: 1 = waiting below, 0 = shown, -1 = gone above. */
const fade = (u) => Math.max(0, 1 - Math.abs(u));

function MotionHero() {
  const trackRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const hintRef = React.useRef(null);
  const skipRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  const poolRef = React.useRef(null);
  const oneRef = React.useRef(null);
  const twoRef = React.useRef(null);
  const oneTag = React.useRef(null);
  const oneSub = React.useRef(null);
  const twoTag = React.useRef(null);
  const oneWords = React.useRef([]);
  const twoWords = React.useRef([]);
  const serviceRefs = React.useRef([]);

  const inkGroup = React.useRef(null);
  const markRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const coverRef = React.useRef(null);
  const letterRefs = React.useRef([]);

  // The pool shader runs only while we are at the very top of the page.
  const [liquid, setLiquid] = React.useState(true);
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => setTouch(window.matchMedia("(hover: none)").matches), []);

  React.useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Measure the pinned stage itself, not the window: on phones window.innerHeight changes whenever
    // the address bar slides in or out, which would make the whole sequence jump.
    let W = stageRef.current?.clientWidth ?? window.innerWidth;
    let H = stageRef.current?.clientHeight ?? window.innerHeight;

    const nOne = STATEMENT_ONE.length;
    const nTwo = STATEMENT_TWO.length;
    const initial = {
      poolK: 1, cover: 0, hint: 1, skip: 1, ink: 0, scale: 0, offY: 0,
      markOp: 1, markScale: 1, outline: 0, word: 0,
      tagA: 1, subA: 1, tagB: 1, svc0: 1, svc1: 1, svc2: 1, cta: 1,
    };
    for (let i = 0; i < nOne; i++) initial[`a${i}`] = 115;
    for (let i = 0; i < nTwo; i++) initial[`b${i}`] = 115;

    // ---- the whole sequence, in timeline units -----------------------------------------------
    function build() {
      const base = Math.min(W, H) / U;
      const lockup = Math.min((H * 0.56) / 840, (W * 0.8) / 980);
      const init = { ...initial, scale: base * 0.24, offY: -H * 0.22 };
      const tl = new Timeline(init);
      const wordsIn = (prefix, n, at) => {
        for (let i = 0; i < n; i++) tl.to(`${prefix}${i}`, 0, at + i * WORD_STAGGER, 0.9, ease.out(4));
      };
      const wordsOut = (prefix, n, at) => {
        for (let i = 0; i < n; i++) tl.to(`${prefix}${i}`, -115, at + i * 0.04, 0.6, ease.in(3));
      };

      // 1. the page zooms gently as the pool dissolves into the website
      tl.to("poolK", 1.35, 0, T)
        .to("hint", 0, 0, 0.35)
        .to("cover", 1, 0.6, 0.9, ease.inOut(2));

      // 2. "We build your digital presence." gets its own held beat
      tl.to("tagA", 0, T - 0.2, 0.5);
      wordsIn("a", nOne, T);
      tl.to("subA", 0, T + 0.8, 0.7)
        .to("tagA", -1, T + 2.5, 0.45, ease.in(3))
        .to("subA", -1, T + 2.5, 0.45, ease.in(3));
      wordsOut("a", nOne, T + 2.5);

      // 3. "Koda is a studio for being seen." with the logo above it (only once beat 2 has fully left)
      tl.to("ink", 1, T + 3.3, 0.7, ease.out(2)).to("tagB", 0, T + 3.5, 0.5);
      wordsIn("b", nTwo, T + 3.6);
      tl.to("tagB", -1, T + 5.5, 0.45, ease.in(3));
      wordsOut("b", nTwo, T + 5.5);

      // 4. only after the words are gone does the mark morph into the rounded-square outline
      tl.to("markOp", 0, T + 6.2, 0.8)
        .to("markScale", 0.86, T + 6.2, 0.8)
        .to("outline", 1, T + 6.3, 0.8)
        .to("scale", base * 0.74, T + 6.3, 1.0)
        .to("offY", 0, T + 6.3, 1.0);

      // 5. the three services, one at a time, each with room to be read
      for (let i = 0; i < 3; i++) {
        const start = T + 7.4 + i * 1.7;
        tl.to(`svc${i}`, 0, start, 0.5, ease.out(3)).to(`svc${i}`, -1, start + 1.25, 0.45, ease.in(3));
      }

      // 6. the mark returns and KODA spells out beneath it; then the calls to action arrive
      const endAt = T + 7.4 + 3 * 1.7 + 0.1;
      tl.to("markOp", 1, endAt, 0.8)
        .to("markScale", 1, endAt, 0.8)
        .to("outline", 0, endAt, 0.8)
        .to("scale", lockup, endAt, 1.0)
        .to("offY", -112 * lockup - H * 0.04, endAt, 1.0)
        .to("word", 1, endAt + 0.4, 1.2, ease.linear)
        .to("skip", 0, endAt + 1.1, 0.4)
        .to("cta", 0, endAt + 1.4, 0.6, ease.out(3))
        .holdUntil(endAt + 1.4 + 0.6 + 1.2);
      return tl;
    }

    let tl = build();
    const V = { ...initial };

    // ---- painting: only touches the DOM for values that actually changed -----------------------
    const cache = new WeakMap();
    const changed = (el, key, value) => {
      let perEl = cache.get(el);
      if (!perEl) {
        perEl = {};
        cache.set(el, perEl);
      }
      if (perEl[key] === value) return false;
      perEl[key] = value;
      return true;
    };
    const setStyle = (el, prop, value) => {
      if (el && changed(el, prop, value)) el.style[prop] = value;
    };
    const setAttr = (el, name, value) => {
      if (el && changed(el, `@${name}`, value)) el.setAttribute(name, value);
    };
    const num = (n, digits = 3) => n.toFixed(digits);

    // an element that fades with u and drifts by `amp` px; hidden entirely when invisible
    const fadeEl = (el, u, amp) => {
      const o = fade(u);
      setStyle(el, "opacity", num(o));
      setStyle(el, "transform", `translate3d(0, ${num(u * amp, 1)}px, 0)`);
      setStyle(el, "visibility", o < 0.01 ? "hidden" : "visible");
    };

    let liquidNow = true;
    const render = (progress) => {
      tl.sample(progress * tl.duration, V);

      // the pool: gentle zoom, then drained away by the page colour and removed from compositing
      if (poolRef.current) {
        setStyle(poolRef.current, "transform", `scale(${num(V.poolK, 4)})`);
        setStyle(poolRef.current, "visibility", V.cover > 0.995 ? "hidden" : "visible");
      }
      setAttr(coverRef.current, "opacity", num(V.cover));
      setStyle(hintRef.current, "opacity", num(V.hint));
      setStyle(hintRef.current, "visibility", V.hint < 0.01 ? "hidden" : "visible");
      setStyle(skipRef.current, "opacity", num(V.skip));
      setStyle(skipRef.current, "visibility", V.skip < 0.01 ? "hidden" : "visible");

      // statement one
      fadeEl(oneTag.current, V.tagA, 14);
      fadeEl(oneSub.current, V.subA, 14);
      let oneVisible = false;
      for (let i = 0; i < nOne; i++) {
        const y = V[`a${i}`];
        if (y > -114.9 && y < 114.9) oneVisible = true;
        setStyle(oneWords.current[i], "transform", `translate3d(0, ${num(y, 2)}%, 0)`);
        setStyle(oneWords.current[i], "opacity", num(y < 0 ? Math.max(0, 1 + y / 80) : 1));
      }
      setStyle(oneRef.current, "visibility", oneVisible || fade(V.tagA) > 0.01 || fade(V.subA) > 0.01 ? "visible" : "hidden");

      // statement two
      fadeEl(twoTag.current, V.tagB, 14);
      let twoVisible = false;
      for (let i = 0; i < nTwo; i++) {
        const y = V[`b${i}`];
        if (y > -114.9 && y < 114.9) twoVisible = true;
        setStyle(twoWords.current[i], "transform", `translate3d(0, ${num(y, 2)}%, 0)`);
        setStyle(twoWords.current[i], "opacity", num(y < 0 ? Math.max(0, 1 + y / 80) : 1));
      }
      setStyle(twoRef.current, "visibility", twoVisible || fade(V.tagB) > 0.01 ? "visible" : "hidden");

      // services and the closing calls to action
      for (let i = 0; i < 3; i++) fadeEl(serviceRefs.current[i], V[`svc${i}`], 22);
      fadeEl(ctaRef.current, V.cta, 18);
      setStyle(ctaRef.current, "pointerEvents", fade(V.cta) > 0.6 ? "auto" : "none");

      // the logo layer
      const xf = `translate(${num(W / 2, 1)} ${num(H / 2 + V.offY, 1)}) scale(${num(V.scale, 4)})`;
      setAttr(inkGroup.current, "transform", xf);
      setAttr(inkGroup.current, "opacity", num(V.ink));
      setAttr(markRef.current, "opacity", num(V.markOp));
      setAttr(markRef.current, "transform", `scale(${num(V.markScale, 4)})`);
      setAttr(frameRef.current, "opacity", num(V.outline));
      for (let i = 0; i < letterRefs.current.length; i++) {
        const pr = Math.min(1, Math.max(0, V.word * 4 - i));
        setAttr(letterRefs.current[i], "opacity", num(pr));
        setAttr(letterRefs.current[i], "transform", `translate(0 ${num((1 - pr) * 60, 1)})`);
      }

      // the heavy pool shader stops the instant we leave the top of the page
      const wantLiquid = !reduced && progress < 0.003;
      if (wantLiquid !== liquidNow) {
        liquidNow = wantLiquid;
        setLiquid(wantLiquid);
      }
    };

    // ---- scroll -> progress, with a little inertia so wheel notches glide -------------------------
    // Progress is read from the hero's own position, so it is right wherever the hero sits in the page.
    let maxScroll = 1;
    let target = 0;
    let current = 0;
    let raf = 0;
    let last = 0;
    let inView = true;
    // Touch screens move in big flicks, so the story is allowed to advance more slowly there.
    const maxRate = window.matchMedia("(hover: none)").matches ? 0.12 : 0.25;

    const readTarget = () => {
      const top = trackRef.current ? trackRef.current.getBoundingClientRect().top : 0;
      return Math.min(1, Math.max(0, -top / maxScroll));
    };
    const measure = () => {
      maxScroll = Math.max(1, (trackRef.current?.offsetHeight ?? 1) - H);
      target = readTarget();
    };
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Ease towards the scroll position, but never faster than `maxRate` (a share of the whole story per second),
      // so a hard flick of the thumb cannot skip past beats. The limit is relaxed when scrolling back up (so returning
      // to the top does not take seconds) and at the very end of the track (so the story always finishes).
      const cap = maxRate * (target > 0.999 || target < current ? 4 : 1) * dt;
      current += Math.max(-cap, Math.min(cap, (target - current) * (1 - Math.exp(-dt * 11))));
      if (Math.abs(target - current) < 0.00002) current = target;
      render(current);
      raf = current === target ? 0 : requestAnimationFrame(frame);
    };
    const kick = () => {
      if (reduced) {
        current = target;
        render(current);
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const onScroll = () => {
      if (!inView) return; // the rest of the page scrolls past without touching the hero
      target = readTarget();
      kick();
    };
    const onResize = () => {
      const w = stageRef.current?.clientWidth ?? window.innerWidth;
      const h = stageRef.current?.clientHeight ?? window.innerHeight;
      if (w === W && h === H) return;
      W = w;
      H = h;
      tl = build();
      measure();
      current = target;
      render(current);
    };

    measure();
    current = target;
    render(current);
    window.addEventListener("scroll", onScroll, { passive: true });
    const sizeObserver = new ResizeObserver(onResize);
    if (stageRef.current) sizeObserver.observe(stageRef.current);
    // when the hero leaves or re-enters the viewport, settle on the right end state
    const viewObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      target = readTarget();
      kick();
    });
    if (trackRef.current) viewObserver.observe(trackRef.current);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      sizeObserver.disconnect();
      viewObserver.disconnect();
    };
  }, []);

  const skipIntro = () => {
    const next = trackRef.current?.nextElementSibling;
    if (next) next.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={trackRef} id="home" className="track relative">
      <section ref={stageRef} aria-label="KODA introduction" className="stage sticky top-0 w-full overflow-hidden bg-paper">
        {/* Full-screen pool of flowing shapes that the cursor stirs */}
        <div ref={poolRef} aria-hidden="true" className="absolute inset-0 will-change-transform">
          <LiquidMetalShader
            style={{ position: "absolute", inset: 0 }}
            fragmentShader={kodaContourFragmentShader}
            baseColor={INK}
            metalColor="#9aa1b8"
            highlightColor={PAPER}
            distortion={1}
            scale={1.15}
            pixelRatio={2}
            autoPointer
            speed={liquid ? 0.6 : 0}
            interactive={liquid}
          />
        </div>

        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            {/* shared logo shapes (paint with currentColor) */}
            <g id="koda-shapes">
              <path ref={markRef} d={MARK_PATH} fill="currentColor" fillRule="evenodd" />
              <rect ref={frameRef} x={-302} y={-307} width={604} height={614} rx={46} fill="none" stroke="currentColor" strokeWidth={26} opacity={0} />
              {LETTER_PATHS.map((d, i) => (
                <path key={i} ref={(el) => { letterRefs.current[i] = el; }} d={d} fill="currentColor" fillRule="evenodd" opacity={0} />
              ))}
            </g>
          </defs>

          {/* page colour; fades in on scroll to drain the pool */}
          <rect ref={coverRef} width="100%" height="100%" fill={PAPER} opacity={0} />
          {/* the vector logo, shown once we land on the website */}
          <g ref={inkGroup} opacity={0} style={{ color: INK }}>
            <use href="#koda-shapes" />
          </g>
        </svg>

        {/* First view: the real headline, a line about what we do and the two main actions, on frosted paper
            so they stay readable over the moving pool. It fades away as soon as the story starts. */}
        <div
          ref={hintRef}
          className="glass glass-live hero-card absolute bottom-20 z-10 max-w-[34rem] p-6 sm:bottom-9 sm:p-8 md:max-w-[min(40rem,calc(100vw-12.5rem))] md:p-10 [@media(max-height:520px)]:bottom-6 [@media(max-height:520px)]:max-w-[30rem] [@media(max-height:520px)]:p-5"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/70 [@media(max-height:520px)]:hidden">{EYEBROW}</p>
          <h1 className="mt-3 text-[clamp(1.9rem,3.6vw,3.1rem)] font-extrabold leading-[1.02] tracking-[-0.045em] md:text-[clamp(2.3rem,4.6vw,3.6rem)] [@media(max-height:520px)]:mt-0 [@media(max-height:520px)]:text-[1.6rem]">{HEADLINE}</h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink/75 md:text-base [@media(max-height:520px)]:hidden">{LEAD}</p>
          <div className="mt-6 [@media(max-height:520px)]:mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button onClick={() => scrollToId("contact")}>Book a free consultation</Button>
            <span className="text-[13px] text-ink/70">{touch ? "Scroll to see how we work" : "Move your mouse, then scroll"}</span>
          </div>
        </div>

        <button
          ref={skipRef}
          type="button"
          onClick={skipIntro}
          className="skip-btn absolute z-10 inline-flex min-h-11 items-center rounded-full bg-paper/80 px-4 text-[13px] font-medium text-ink/80 ring-1 ring-ink/10 backdrop-blur-md transition-colors hover:text-ink"
        >
          Skip intro
        </button>

        {/* 1: what we do */}
        <div ref={oneRef} className="pointer-events-none invisible absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span ref={oneTag} className="mb-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">What we do</span>
          <h2 className="statement max-w-[18ch] text-[clamp(44px,8.2vw,132px)]" aria-label="We build your digital presence.">
            {STATEMENT_ONE.map((it, i) => (
              <span key={it.w} className="word" aria-hidden="true">
                <span ref={(el) => { oneWords.current[i] = el; }} className={it.muted ? "text-ink/55" : ""}>
                  {it.w}
                </span>
              </span>
            ))}
          </h2>
          <p ref={oneSub} className="mt-8 max-w-[34rem] text-[clamp(16px,1.7vw,24px)] leading-snug text-muted">
            Websites, search visibility and a brand that shows up everywhere your customers look.
          </p>
        </div>

        {/* 2: who we are (the logo sits above, drawn by the SVG layer) */}
        <div ref={twoRef} className="pointer-events-none invisible absolute inset-x-0 top-[56%] flex flex-col items-center px-6 text-center">
          <span ref={twoTag} className="mb-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">Who we are</span>
          <h2 className="statement max-w-[16ch] text-[clamp(40px,7vw,112px)]" aria-label="Koda is a studio for being seen.">
            {STATEMENT_TWO.map((it, i) => (
              <span key={it.w} className="word" aria-hidden="true">
                <span ref={(el) => { twoWords.current[i] = el; }} className={it.muted ? "text-ink/55" : ""}>
                  {it.w}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(420px,60vmin)] -translate-x-1/2 -translate-y-1/2 text-center">
          {SERVICES.map((s, i) => (
            <div key={s.n} ref={(el) => { serviceRefs.current[i] = el; }} className="invisible absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-0">
              <span className="text-[13px] tracking-[0.14em] text-muted">{s.n} / 03</span>
              <h3 className="mb-3 mt-3 text-[clamp(26px,5.4vmin,52px)] font-bold leading-[1.02] tracking-[-0.04em]">{s.title}</h3>
              <p className="text-[clamp(14px,2.1vmin,19px)] leading-snug text-muted">{s.body}</p>
            </div>
          ))}
        </div>

        {/* closing calls to action, over the final logo lockup */}
        <div ref={ctaRef} className="cta-row invisible absolute inset-x-0 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-0">
          <Button onClick={() => scrollToId("contact")}>Book a free consultation</Button>
          <button onClick={() => scrollToId("portfolio")} className="inline-flex min-h-11 items-center text-sm font-medium text-ink">
            <span className="border-b border-ink/40 pb-0.5 transition-colors hover:border-ink hover:text-ink/60">See our work</span>
          </button>
        </div>
      </section>
    </div>
  );
}

// For visitors who ask their device for less motion: no pinned scroll story, no moving pool. The same message,
// laid out as an ordinary first screen.
function StaticHero() {
  return (
    <div id="home" className="safe-x bg-paper pb-16 pt-32 sm:pt-40 lg:pb-24">
      <div className="mx-auto max-w-[1280px]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">{EYEBROW}</p>
        <h1 className="mt-5 max-w-[16ch] text-[clamp(2.8rem,8vw,7rem)] font-extrabold leading-[0.96] tracking-[-0.055em]">{HEADLINE}</h1>
        <p className="mt-6 max-w-[46ch] text-base leading-[1.7] text-muted">{LEAD}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button onClick={() => scrollToId("contact")}>Book a free consultation</Button>
          <button onClick={() => scrollToId("portfolio")} className="inline-flex min-h-11 items-center text-sm font-medium text-ink">
            <span className="border-b border-ink/40 pb-0.5 transition-colors hover:border-ink hover:text-ink/60">See our work</span>
          </button>
        </div>
        <ol className="mt-16 grid gap-x-10 border-t border-ink/15 sm:grid-cols-3">
          {SERVICES.map((sv) => (
            <li key={sv.n} className="border-b border-ink/15 py-6 sm:border-b-0">
              <span className="text-[13px] tracking-[0.14em] text-muted">{sv.n} / 03</span>
              <h2 className="mb-2 mt-3 text-[1.6rem] font-bold leading-[1.05] tracking-[-0.04em]">{sv.title}</h2>
              <p className="text-[15px] leading-snug text-muted">{sv.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function Hero() {
  // Chosen before the first paint on the client; the server always renders the animated version.
  const [still, setStill] = React.useState(false);
  React.useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStill(true);
  }, []);
  return still ? <StaticHero /> : <MotionHero />;
}
