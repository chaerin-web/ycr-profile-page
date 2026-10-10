(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const lenis = reduceMotion.matches || typeof Lenis === "undefined"
    ? null
    : new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
    });

  const lenisRaf = (time) => {
    if (!lenis) return;

    lenis.raf(time);
    window.requestAnimationFrame(lenisRaf);
  };

  if (lenis) {
    window.requestAnimationFrame(lenisRaf);
  }

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const staggerProgress = (progress, start, end) => smoothstep(clamp((progress - start) / (end - start)));

  // Touch takes ownership immediately, including during a menu/top-button animation.
  // Cancelling only the delayed title step does not stop Lenis' current RAF tween.
  const cancelScrollAnimation = () => {
    if (lenis?.isScrolling === "smooth") {
      lenis.scrollTo(lenis.actualScroll, { immediate: true, force: true });
    }
  };
  window.addEventListener("touchstart", cancelScrollAnimation, { passive: true });

  const scrollToTarget = (target, options = {}) => {
    const behavior = reduceMotion.matches ? "auto" : options.behavior || "smooth";

    if (lenis) {
      lenis.scrollTo(target, options.lenis || {});
      return;
    }

    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior });
      return;
    }

    target?.scrollIntoView({
      behavior,
      block: options.block || "start"
    });
  };

  window.PortfolioCore = {
    reduceMotion,
    lenis,
    clamp,
    smoothstep,
    staggerProgress,
    scrollToTarget,
    cancelScrollAnimation
  };
})();
