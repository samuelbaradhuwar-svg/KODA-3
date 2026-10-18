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
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || cards.length === 0) return;

    // Everything the frame loop needs is measured here, once (and again on resize), so a frame never reads layout.
    let trackTop = 0;
    let range = 1;
    let cardH = 1;
    const measure = () => {
      trackTop = track.getBoundingClientRect().top + window.scrollY;
      range = Math.max(1, track.offsetHeight - stage.offsetHeight);
      cardH = cards[0].offsetHeight;
    };
    const readTarget = () => {
      const p = Math.min(1, Math.max(0, (window.scrollY - trackTop) / range));
      // a short hold at each end so the first and last cards can be read before the deck moves
      const q = Math.min(1, Math.max(0, (p - 0.04) / 0.92));
      return q * (n - 1);
    };

    // Last values written, so unchanged styles are never touched again.
    const last = cards.map(() => ({ tf: "", z: "", vis: "", ev: "", hid: "" }));
    let lastShown = -1;
    let lastBar = "";

    const place = (t) => {
      const calm = calmRef.current;
      const k = Math.min(n - 1, Math.floor(t));
      const f = k >= n - 1 ? 0 : t - k;
      const peek = Math.min(14, cardH * 0.045);
      for (let i = 0; i < n; i++) {
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
        const tf = `translate3d(0,${(y - dv * peek).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${(1 - dv * 0.035).toFixed(4)})`;
        const hidden = d > VISIBLE + 0.6 ? "hidden" : "visible";
        const ev = i === k && f < 0.5 ? "auto" : "none";
        const L = last[i];
        const el = cards[i];
        if (L.tf !== tf) { el.style.transform = tf; L.tf = tf; }
        if (L.z !== z) { el.style.zIndex = z; L.z = z; }
        if (L.vis !== hidden) { el.style.visibility = hidden; L.vis = hidden; }
        if (L.ev !== ev) { el.style.pointerEvents = ev; L.ev = ev; }
        const hid = i === Math.round(t) ? "false" : "true";
        if (L.hid !== hid) { el.setAttribute("aria-hidden", hid); L.hid = hid; }
      }
      const shown = Math.round(t);
      if (shown !== lastShown && counterRef.current) {
        lastShown = shown;
        counterRef.current.textContent = `${String(shown + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
      }
      if (barRef.current) {
        const bar = `scaleX(${(n > 1 ? t / (n - 1) : 1).toFixed(3)})`;
        if (bar !== lastBar) { barRef.current.style.transform = bar; lastBar = bar; }
      }
    };

    // The deck follows the scroll position through a little inertia, so wheel notches, trackpad flicks and the
    // uneven scroll events of a phone all turn into the same smooth glide.
    let target = readTarget();
    let current = target;
    let raf = 0;
    let prev = 0;
    let visible = false;
    const frame = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000 || 0.016);
      prev = now;
      target = readTarget();
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
    place(current);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          // arriving from far away (a link, the back-to-top button): start at the right card, do not replay the deck
          measure();
          current = target = readTarget();
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

