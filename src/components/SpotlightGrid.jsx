import React, { useRef } from "react";

// A grid whose cards are lit by the pointer: a soft acid-green glow inside each card and a brighter one along its
// edge, following the cursor across the whole grid. The look lives in `.spot-card` (index.css); this component only
// tells every card where the pointer is, relative to that card. Touch screens have no pointer, so there the cards
// simply keep a gentle static glow.
export default function SpotlightGrid({ children, className = "", as: Tag = "ul" }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const point = useRef({ x: 0, y: 0, on: false });

  const paint = () => {
    raf.current = 0;
    const root = ref.current;
    if (!root) return;
    const { x, y, on } = point.current;
    for (const card of root.querySelectorAll(".spot-card")) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${(x - r.left).toFixed(1)}px`);
      card.style.setProperty("--my", `${(y - r.top).toFixed(1)}px`);
      card.style.setProperty("--spot", on ? "1" : "0");
    }
  };
  const schedule = () => {
    if (!raf.current) raf.current = requestAnimationFrame(paint);
  };

  return (
    <Tag
      ref={ref}
      className={className}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        point.current = { x: e.clientX, y: e.clientY, on: true };
        schedule();
      }}
      onPointerLeave={() => {
        point.current.on = false;
        schedule();
      }}
    >
      {children}
    </Tag>
  );
}
