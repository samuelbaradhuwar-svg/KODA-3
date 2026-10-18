import React from "react";

// A deck of cards: the top card jumps up and over, then slips behind the rest, revealing the next one.
// Without motion (or before the page is interactive) the same cards are shown as a plain list.
const VISIBLE = 4; // how many cards of the deck show behind the top one

const smooth = (x) => x * x * (3 - 2 * x);

export default function CardDeck({ items, renderCard, label, step = 0.62 }) {
  const [mode, setMode] = React.useState("list");
  const trackRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  const counterRef = React.useRef(null);
  const barRef = React.useRef(null);
  const n = items.length;

  // People who ask their device for less motion still get the deck, but a calm one: no big jump or tilt,
  // the top card just slides a little and slips behind. The motion is driven by their own scrolling.
  const calmRef = React.useRef(false);
  React.useEffect(() => {
    calmRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode("deck");
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
          y = -h * (calmRef.current ? 0.1 : 0.62) * lift;
          rot = calmRef.current ? 0 : (k % 2 ? -1 : 1) * 5 * lift;
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
          <span ref={counterRef} className="text-[12px] font-semibold tracking-[0.18em] text-ink/70">01 / {String(n).padStart(2, "0")}</span>
          <span className="deck-bar"><span ref={barRef} className="deck-bar-fill" /></span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/50">Keep scrolling</span>
        </div>
      </div>
    </div>
  );
}

