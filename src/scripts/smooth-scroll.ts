import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
    __lenisReady?: boolean;
  }
}

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*
 * Momentum ("silky") scrolling for the whole document. Lenis moves the native
 * scroll position rather than transforming a wrapper, so `position: fixed`
 * (the docked list) and `position: sticky` (the post heading) keep working.
 *
 * The guard mirrors the theme script: the module may be re-evaluated across
 * ClientRouter navigations, but there should only ever be one instance.
 * Readers who ask for reduced motion get native scrolling — no smoothing loop.
 */
if (!window.__lenisReady && !prefersReducedMotion()) {
  window.__lenisReady = true;

  const lenis = new Lenis({
    // Run the requestAnimationFrame loop internally.
    autoRaf: true,
    // Smooth in-page `#` fragment links like every other scroll.
    anchors: true,
    // Let inner scrollers (the horizontal code blocks) scroll natively.
    allowNestedScroll: true,
    // Stop the glide as soon as a link is followed, so the incoming page
    // starts from the top instead of coasting into it.
    stopInertiaOnNavigate: true,
  });

  window.__lenis = lenis;

  // ClientRouter swaps the page in place, changing the document height behind
  // Lenis' back. Re-measure after each swap so the scroll limit stays correct.
  document.addEventListener("astro:after-swap", () => {
    lenis.resize();
  });
}
