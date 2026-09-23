(() => {
  const page = document.body;
  const stage = document.querySelector("[data-detail-stage]");
  const closeButton = document.querySelector("[data-detail-close]");
  const topButton = document.querySelector("[data-detail-top]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let lastScrollY = Math.max(window.scrollY, 0);
  let frameRequested = false;

  const updatePage = () => {
    frameRequested = false;

    const currentScrollY = Math.max(window.scrollY, 0);
    const delta = currentScrollY - lastScrollY;

    if (currentScrollY <= 24) {
      page.classList.remove("is-controls-hidden");
      lastScrollY = currentScrollY;
    } else if (Math.abs(delta) >= 7) {
      page.classList.toggle("is-controls-hidden", delta > 0);
      lastScrollY = currentScrollY;
    }

    stage?.classList.toggle("is-background", currentScrollY >= window.innerHeight * 0.28);
  };

  const requestUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updatePage);
  };

  const leaveDetailPage = (event) => {
    event?.preventDefault();
    window.close();

    window.setTimeout(() => {
      if (!window.closed) window.location.href = "./index.html#detail-page";
    }, 120);
  };

  closeButton?.addEventListener("click", leaveDetailPage);
  topButton?.addEventListener("click", () => {
    page.classList.remove("is-controls-hidden");
    window.scrollTo({
      top: 0,
      behavior: reduceMotion.matches ? "auto" : "smooth"
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") leaveDetailPage(event);
  });
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  updatePage();
})();
