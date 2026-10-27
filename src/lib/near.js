// A promise that settles when the element with this id is within a couple of screens of the viewport.
// Used to start loading and hydrating the sections far below the first screen only when they are about to be seen.
// If the element or IntersectionObserver is missing it settles at once, so a section is never left unstarted.
export function whenNear(id, margin = "200% 0px") {
  return new Promise((resolve) => {
    const el = typeof document !== "undefined" ? document.getElementById(id) : null;
    if (!el || typeof IntersectionObserver === "undefined") return resolve();
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          resolve();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
  });
}
