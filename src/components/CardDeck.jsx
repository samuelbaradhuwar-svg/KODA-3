import React from "react";

// A deck of cards: the top card jumps up and over, then slips behind the rest, revealing the next one.
// Without motion (or before the page is interactive) the same cards are shown as a plain list.
//
// Two engines drive the same choreography:
//  - native: CSS scroll-driven animations. The browser runs them on its compositor, in step with the scroll itself,
//    so they cannot stutter however busy the page is (Chrome 115+, Safari 26+).
//  - fallback: a small eased loop in JavaScript, for browsers without scroll-driven animations.
const VISIBLE = 4; // how many cards of the deck show behind the top one
const HOLD = 0.04; // share of the scroll kept as a still hold at each end
const smooth = (x) => x * x * (3 - 2 * x);

// Where card i sits, tilts and stacks when the deck has reached position t (0 = first card on top).
function cardState(i, t, n, cardH, calm) {
  const peek = Math.min(14, cardH * 0.045);
  const k = Math.min(n - 1, Math.floor(t));
  const f = k >= n - 1 ? 0 : t - k;
  let d = (((i - k) % n) + n) % n; // 0 = top of the deck
  let y = 0;
  let rot = 0;
  let z;
  if (i === k) {
    // the top card jumps up and over, then drops behind the whole deck
    const lift = Math.sin(Math.PI * Math.min(1, f));
    y = -cardH * (calm ? 0.1 : 0.62) * lift;
    rot = calm ? 0 : (k % 2 ? -1 : 1) * 5 * lift;
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
  return {
    tf: `translate3d(0,${(y - dv * peek).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${(1 - dv * 0.035).toFixed(4)})`,
    z,
    hidden: d > VISIBLE + 0.6,
    top: i === k && f < 0.5,
  };
}

const supportsNative = () =>
  typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline: scroll()") && CSS.supports("animation-range: 0px 10px");

let deckId = 0;

export default function CardDeck({ items, renderCard, label, step = 0.62 }) {
  const [mode, setMode] = React.useState("list");
  const trackRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  const counterRef = React.useRef(null);
  const barRef = React.useRef(null);
  const idRef = React.useRef(0);
  const n = items.length;

  // People who ask their device for less motion still get the deck, but a calm one: no big jump or tilt,
  // the top card just slides a little and slips behind. The motion is driven by their own scrolling.
  const calmRef = React.useRef(false);
  React.useEffect(() => {
    calmRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!idRef.current) idRef.current = ++deckId;
    setMode("deck");
  }, []);

  React.useEffect(() => {
    if (mode !== "deck") return;
    const cards = cardRefs.current.filter(Boolean);
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || cards.length === 0) return;
    const calm = calmRef.current;
    const native = supportsNative();

    // Measured once (and again whenever the layout changes), never inside a frame.
    let trackTop = 0;
    let range = 1;
    let cardH = 1;
    const measure = () => {
      trackTop = track.getBoundingClientRect().top + window.scrollY;
      range = Math.max(1, track.offsetHeight - stage.offsetHeight);
      cardH = cards[0].offsetHeight;
    };
    const readT = () => {
      const p = Math.min(1, Math.max(0, (window.scrollY - trackTop) / range));
      return Math.min(1, Math.max(0, (p - HOLD) / (1 - 2 * HOLD))) * (n - 1);
    };

    // counter, progress bar and which card a screen reader is told about: updated only when they change
    let lastShown = -1;
    let lastBar = "";
    const lastHid = cards.map(() => "");
    const paintMeta = (t, withBar) => {
      const shown = Math.round(t);
      if (shown !== lastShown) {
        lastShown = shown;
        if (counterRef.current) counterRef.current.textContent = `${String(shown + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
        for (let i = 0; i < cards.length; i++) {
          const hid = i === shown ? "false" : "true";
          if (lastHid[i] !== hid) {
            cards[i].setAttribute("aria-hidden", hid);
            lastHid[i] = hid;
          }
        }
      }
      if (withBar && barRef.current) {
        const bar = `scaleX(${(n > 1 ? t / (n - 1) : 1).toFixed(3)})`;
        if (bar !== lastBar) {
          barRef.current.style.transform = bar;
          lastBar = bar;
        }
      }
    };

    let cleanup = () => {};

    if (native) {
      // ---- native engine: keyframes for every card, tied to the page's scroll position -------------------------
      const styleEl = document.createElement("style");
      document.head.appendChild(styleEl);
      const id = idRef.current;
      const pct = (t) => ((HOLD + (1 - 2 * HOLD) * (t / (n - 1))) * 100).toFixed(3);

      const build = () => {
        measure();
        const rules = [];
        for (let i = 0; i < n; i++) {
          // sample points: every whole step, plus a fine sweep through the card's own jump
          const ts = new Set([0, n - 1]);
          for (let j = 0; j < n; j++) ts.add(j);
          for (let s = 0; s <= 16; s++) ts.add(Math.min(n - 1, i + s / 16));
          ts.add(Math.min(n - 1, i + 0.4999));
          ts.add(Math.min(n - 1, i + 0.5));
          const list = [...ts].sort((a, b) => a - b);
          let tf = "";
          let zz = "";
          for (const t of list) {
            const st = cardState(i, t, n, cardH, calm);
            tf += `${pct(t)}%{transform:${st.tf}}`;
            zz += `${pct(t)}%{z-index:${st.z}}`;
          }
          const first = cardState(i, 0, n, cardH, calm);
          const lastS = cardState(i, n - 1, n, cardH, calm);
          rules.push(
            `@keyframes deck${id}t${i}{0%{transform:${first.tf}}${tf}100%{transform:${lastS.tf}}}` +
              `@keyframes deck${id}z${i}{0%{z-index:${first.z}}${zz}100%{z-index:${lastS.z}}}`
          );
        }
        styleEl.textContent = rules.join("");
        for (let i = 0; i < cards.length; i++) {
          const st = cards[i].style;
          st.animationName = `deck${id}t${i}, deck${id}z${i}`;
          st.animationDuration = "1s, 1s";
          st.animationTimingFunction = "linear, linear";
          st.animationFillMode = "both, both";
          st.animationTimeline = "scroll(root block), scroll(root block)";
          st.animationRange = `${Math.round(trackTop)}px ${Math.round(trackTop + range)}px, ${Math.round(trackTop)}px ${Math.round(trackTop + range)}px`;
        }
        if (barRef.current) {
          const b = barRef.current.style;
          b.animationName = `deck${id}bar`;
          b.animationDuration = "1s";
          b.animationTimingFunction = "linear";
          b.animationFillMode = "both";
          b.animationTimeline = "scroll(root block)";
          b.animationRange = `${Math.round(trackTop)}px ${Math.round(trackTop + range)}px`;
          styleEl.textContent += `@keyframes deck${id}bar{0%,${pct(0)}%{transform:scaleX(0)}${pct(n - 1)}%,100%{transform:scaleX(1)}}`;
        }
        paintMeta(readT(), false);
      };

      let timer = 0;
      const rebuildSoon = () => {
        clearTimeout(timer);
        timer = setTimeout(build, 120);
      };
      build();
      const ro = new ResizeObserver(rebuildSoon);
      ro.observe(track);
      ro.observe(stage);
      ro.observe(document.documentElement);
      let raf = 0;
      const onScroll = () => {
        if (!raf)
          raf = requestAnimationFrame(() => {
            raf = 0;
            paintMeta(readT(), false);
          });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("load", rebuildSoon);
      cleanup = () => {
        clearTimeout(timer);
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("load", rebuildSoon);
        for (const c of cards) {
          c.style.animationName = "";
          c.style.animationTimeline = "";
          c.style.animationRange = "";
        }
        if (barRef.current) barRef.current.style.animationName = "";
        styleEl.remove();
      };
      return cleanup;
    }

    // ---- fallback engine: an eased loop in JavaScript ------------------------------------------------------
    const last = cards.map(() => ({ tf: "", z: "", vis: "", ev: "" }));
    const place = (t) => {
      for (let i = 0; i < n; i++) {
        const st = cardState(i, t, n, cardH, calm);
        const L = last[i];
        const el = cards[i];
        const vis = st.hidden ? "hidden" : "visible";
        const ev = st.top ? "auto" : "none";
        if (L.tf !== st.tf) { el.style.transform = st.tf; L.tf = st.tf; }
        if (L.z !== st.z) { el.style.zIndex = st.z; L.z = st.z; }
        if (L.vis !== vis) { el.style.visibility = vis; L.vis = vis; }
        if (L.ev !== ev) { el.style.pointerEvents = ev; L.ev = ev; }
      }
      paintMeta(t, true);
    };
    let target = 0;
    let current = 0;
    let raf = 0;
    let prev = 0;
    let visible = false;
    const frame = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000 || 0.016);
      prev = now;
      target = readT();
      current += (target - current) * (1 - Math.exp(-dt * 12));
      if (Math.abs(target - current) < 0.0004) current = target;
      place(current);
      raf = current === target ? 0 : requestAnimationFrame(frame);
    };
    const kick = () => {
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    measure();
    current = target = readT();
    place(current);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          measure();
          current = target = readT();
          place(current);
          kick();
        }
      },
      { rootMargin: "30% 0px" }
    );
    io.observe(track);
    const ro = new ResizeObserver(() => {
      measure();
      kick();
    });
    ro.observe(track);
    ro.observe(stage);
    window.addEventListener("scroll", kick, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", kick);
    };
  }, [mode, n]);

  if (mode === "list") {
    return (
      <ol className="deck-list grid gap-4 sm:grid-cols-2" style={{ "--n": n, "--step": step }}>
        {items.map((s, i) => (
          <li key={s.title || i} className="min-h-[15rem]">
            {renderCard(s, i, n)}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div ref={trackRef} className="deck-track" style={{ "--n": n, "--step": step }}>
      <div ref={stageRef} className="deck-stage">
        <ol className="deck" aria-label={label}>
          {items.map((s, i) => (
            <li key={s.title || i} ref={(el) => { cardRefs.current[i] = el; }} className="deck-card">
              {renderCard(s, i, n)}
            </li>
          ))}
        </ol>
        <div className="deck-meter" aria-hidden="true">
          <span className="deck-bar"><span ref={barRef} className="deck-bar-fill" /></span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/70">Keep scrolling</span>
        </div>
      </div>
    </div>
  );
}

