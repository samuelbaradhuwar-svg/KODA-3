import React, { useRef } from "react";

// A grid whose cards are lit by the pointer: a soft acid-green glow inside each card and a brighter one along its
// edge, following the cursor across the whole grid. The look lives in `.spot-card` (index.css); this component only
// tells every card where the pointer is, relative to that card. Touch screens have no pointer, so there the cards
// simply keep a gentle static glow.
export default function SpotlightGrid({ children, className = "", as: Tag = "ul" }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const point = useRef({ x: 0, y: 0, on: false });

  const cards = () => ref.current?.querySelectorAll(".spot-card") ?? [];

  const paint = () => {
    raf.current = 0;
    const { x, y, on } = point.current;
    for (const card of cards()) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${(x - r.left).toFixed(1)}px`);
      card.style.setProperty("--my", `${(y - r.top).toFixed(1)}px`);
      card.style.setProperty("--spot", on ? "1" : "0");
    }
  };
  const schedule = () => {
    if (!raf.current) raf.current = requestAnimationFrame(paint);
  };

  // A finger lighting a card follows it while it is down; when it lifts, the card goes back to the resting glow
  // that touch screens always have (the CSS defaults), instead of switching the glow off like a mouse leaving.
  const settle = () => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
    point.current.on = false;
    for (const card of cards()) {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
      card.style.removeProperty("--spot");
    }
  };

  const track = (e) => {
    point.current = { x: e.clientX, y: e.clientY, on: true };
    schedule();
  };
  const release = (e) => {
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      point.current.on = false;
      schedule();
    } else {
      settle();
    }
  };

  return (
    <Tag ref={ref} className={className} onPointerDown={track} onPointerMove={track} onPointerLeave={release} onPointerUp={release} onPointerCancel={release}>
      {children}
    </Tag>
  );
}
