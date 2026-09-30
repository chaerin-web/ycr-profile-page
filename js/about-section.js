(() => {
  const core = window.PortfolioCore || {};
  const reduceMotion = core.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");
  const aboutRevealItems = [
    ...document.querySelectorAll(".about-section__intro, [data-attitude-card], .skill-card")
  ];

  const setupAboutReveal = () => {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      aboutRevealItems.forEach((item) => item.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const item = entry.target;
        if (!entry.isIntersecting) {
          item.style.setProperty("--about-reveal-delay", "0ms");
          item.classList.remove("is-revealed");
          return;
        }

        const group = item.closest(".skills-grid, .attitude-grid");
        const siblings = group
          ? [...group.querySelectorAll(".skill-card, .attitude-card")]
          : [];
        const order = Math.max(siblings.indexOf(item), 0);
        item.style.setProperty("--about-reveal-delay", `${Math.min(order * 90, 240)}ms`);
        item.classList.add("is-revealed");
      });
    }, { threshold: 0.12, rootMargin: "-4% 0px -6% 0px" });

    aboutRevealItems.forEach((item) => observer.observe(item));
  };

  const setupAttitudeSticky = () => {
    const attitudeLeft = document.querySelector(".about-section__left--attitude");
    if (!attitudeLeft) return;

    const updateAttitudeSticky = () => {
      const top = window.innerWidth <= 1024
        ? Math.min(124, Math.max(88, window.innerHeight * 0.11))
        : Math.min(112, Math.max(76, window.innerHeight * 0.08));
      attitudeLeft.classList.toggle("is-too-tall",
        window.innerWidth > 768 && attitudeLeft.offsetHeight + top + 24 > window.innerHeight);
    };

    if ("ResizeObserver" in window) {
      new ResizeObserver(updateAttitudeSticky).observe(attitudeLeft);
    }
    window.addEventListener("resize", updateAttitudeSticky, { passive: true });
    document.fonts?.ready.then(updateAttitudeSticky);
    updateAttitudeSticky();
  };

  const setupAboutOrb = () => {
    const section = document.querySelector(".about-section");
    const stage = section?.querySelector(".about-section__orb-stage");
    if (!section || !stage || reduceMotion.matches) return;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let frame = 0;

    const animate = () => {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      stage.style.setProperty("--orb-pointer-x", `${currentX.toFixed(2)}px`);
      stage.style.setProperty("--orb-pointer-y", `${currentY.toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frame = window.requestAnimationFrame(animate);
      } else {
        frame = 0;
      }
    };

    const ensureFrame = () => {
      if (!frame) frame = window.requestAnimationFrame(animate);
    };

    section.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      targetX = ((event.clientX / window.innerWidth) - 0.5) * 20;
      targetY = ((event.clientY / window.innerHeight) - 0.5) * 14;
      ensureFrame();
    }, { passive: true });

    section.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      ensureFrame();
    }, { passive: true });
  };

  setupAboutReveal();
  setupAttitudeSticky();
  setupAboutOrb();
})();
