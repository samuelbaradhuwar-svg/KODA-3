import Lenis from "lenis";

// Smooth, inertial wheel scrolling for mouse and trackpad users. Touch screens keep their native momentum, and
// anyone who asks for less motion keeps plain scrolling. The page's scroll position is still the real one, so the
// hero story and the card decks simply read a smoother stream of scroll events.
export function initSmoothScroll() {
  if (typeof window === "undefined") return null;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(hover: none)").matches;
  if (calm || touch) return null;

  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
  window.__lenis = lenis;
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}

// Scroll to an element or a pixel position, smoothly, through Lenis when it is running.
export function smoothScrollTo(target, { offset = 0 } = {}) {
  const lenis = typeof window !== "undefined" ? window.__lenis : null;
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.3, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target + offset, behavior: "smooth" });
  else if (offset) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
  else target.scrollIntoView({ behavior: "smooth", block: "start" });
}
