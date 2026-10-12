/* Freeze measured section heights on touch screens so browser chrome cannot reflow the page. */
(() => {
  const root = document.documentElement;
  const coarsePointer = window.matchMedia('(any-pointer: coarse)');
  let width = window.innerWidth;
  let height = 0;
  let frame = 0;
  const update = () => {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;width:0;height:100svh;';
    root.appendChild(probe);
    const next = probe.getBoundingClientRect().height || window.innerHeight;
    probe.remove();
    if (next === height) return;
    height = next;
    root.toggleAttribute('data-section-height-short', height <= 820);
    root.style.setProperty('--section-vh', `${height / 100}px`);
    window.dispatchEvent(new Event('sectionviewportchange'));
  };
  window.PortfolioViewport = { get height() { return height; } };
  update();
  window.addEventListener('resize', () => {
    const nextWidth = window.innerWidth;
    const widthChanged = nextWidth !== width;
    width = nextWidth;
    if (!widthChanged && (coarsePointer.matches || width <= 1024)) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  window.screen.orientation?.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  });
})();
