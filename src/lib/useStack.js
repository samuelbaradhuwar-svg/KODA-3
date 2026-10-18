import { useEffect, useRef } from "react";

// Stacking cards: every card sticks near the top of the screen, the next one slides up over it, and the card
// underneath shrinks and darkens a little. Returns refs to attach to each slot (the sticky <li>), card and veil.
// Without JavaScript (or with reduced motion) the cards still stack through plain CSS sticky positioning.
export function useStackedCards() {
  const wrapRefs = useRef([]);
  const cardRefs = useRef([]);
  const veilRefs = useRef([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = cardRefs.current.filter(Boolean);
    const wraps = wrapRefs.current.filter(Boolean);
    if (cards.length < 2) return;
    let raf = 0;
    let visible = false;

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

  return { wrapRefs, cardRefs, veilRefs };
}
