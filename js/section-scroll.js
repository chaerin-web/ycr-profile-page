(() => {
  const core = window.PortfolioCore || {};
  const siteHeader = document.querySelector(".site-header");
  const scrollTopButton = document.querySelector(".scroll-top-button");
  const headerSectionTitle = document.querySelector("[data-header-section-title]");
  const heroTransition = document.querySelector(".hero-transition");
  const hero = document.querySelector(".hero");
  const sphereCover = document.querySelector(".hero__sphere-cover");
  const reduceMotion = core.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = core.clamp || ((value, min = 0, max = 1) => Math.min(Math.max(value, min), max));
  const smoothstep = core.smoothstep || ((value) => value * value * (3 - 2 * value));

  const sectionTransitions = [...document.querySelectorAll("[data-section-intro]")].map((section) => ({
    section,
    sticky: section.querySelector(".section-transition__sticky"),
    title: section.querySelector(".section-transition__title"),
    tone: section.querySelector(".section-transition__tone"),
    wipeSteps: [...section.querySelectorAll(".section-transition__wipe span")]
  }));
  const sectionCopies = [...document.querySelectorAll("[data-section-copy]")].map((heading) => ({
    section: heading.closest(".portfolio-section"),
    title: heading.querySelector("h2"),
    lead: heading.querySelector("p")
  }));
  const sectionTitleRegions = [...document.querySelectorAll("[data-section-title]")];

  let frameRequested = false;
  let lastHeaderScrollY = Math.max(window.scrollY, 0);
  let activeHeaderTitle = "";

  // Read geometry before any animation writes; reuse it throughout this frame.
  const measuredElements = [...new Set([
    heroTransition, hero, sphereCover,
    ...sectionTransitions.flatMap(({ section, sticky }) => [section, sticky]),
    ...sectionCopies.map(({ section }) => section), ...sectionTitleRegions
  ].filter(Boolean))];
  let geometry = new Map();
  let viewportHeight = window.innerHeight;
  let viewportWidth = window.innerWidth;
  let coverWidth = 1;
  const styleCache = new WeakMap();
  const setStyle = (element, property, value) => {
    if (!element) return;
    let previous = styleCache.get(element);
    if (!previous) { previous = new Map(); styleCache.set(element, previous); }
    if (previous.get(property) === value) return;
    previous.set(property, value);
    element.style.setProperty(property, value);
  };

  const getSectionCopyDistance = () => {
    if (window.innerWidth <= 560) return 36;
    if (window.innerWidth <= 768) return 44;
    if (window.innerWidth <= 1024) return 56;
    return 72;
  };

  const setLeadMotion = (element, opacity, offsetX) => {
    if (!element) return;

    setStyle(element, "opacity", clamp(opacity).toFixed(3));
    setStyle(element, "transform", `translate3d(${offsetX.toFixed(2)}px, 0, 0)`);
  };

  const getSectionTransitionProgress = (section) => {
    if (!section) return 0;

    const bounds = geometry.get(section);
    const sticky = sectionTransitions.find((item) => item.section === section)?.sticky;
    // 100svh stays stable when the mobile address bar opens/closes; innerHeight does not.
    const scrollDistance = Math.max(bounds.height - (geometry.get(sticky)?.height || viewportHeight), 1);
    return clamp(-bounds.top / scrollDistance);
  };

  const updateSectionTransitions = () => {
    sectionTransitions.forEach(({ section, title, tone, wipeSteps }) => {
      if (!title || !tone || !wipeSteps.length) return;

      if (reduceMotion.matches) {
        setStyle(title, "opacity", "1");
        setStyle(title, "transform", "translate3d(-50%, -50%, 0)");
        setStyle(tone, "opacity", "1");
        setStyle(tone, "background-position", "100% 50%");
        wipeSteps.forEach((step) => {
          setStyle(step, "transform", "translate3d(0, -101%, 0)");
        });
        return;
      }

      const progress = getSectionTransitionProgress(section);
      const isAboutIntro = section.id === "about-me";
      const isCompactIntro = section.id === "web-projects";
      const isFlowIntro = section.id === "selected-works" || section.id === "web-projects" || section.id === "contact";
      const toneStart = isAboutIntro ? 0.035 : isFlowIntro ? 0 : 0.2;
      const titleStart = isAboutIntro ? 0.065 : isFlowIntro ? 0.005 : 0.2;
      const toneProgress = smoothstep(clamp((progress - toneStart) / (0.74 - toneStart)));
      const titleEnterDuration = isAboutIntro ? 0.1 : isCompactIntro ? 0.13 : 0.17;
      const titleEnter = smoothstep(clamp((progress - titleStart) / titleEnterDuration));
      const titleExit = smoothstep(clamp((progress - (isFlowIntro ? 0.82 : 0.74)) / (isFlowIntro ? 0.16 : 0.14)));
      const titleOffset = 26 * (1 - titleEnter) - 22 * titleExit;

      setStyle(tone, "opacity", toneProgress.toFixed(3));
      setStyle(tone, "background-position", `${(toneProgress * 100).toFixed(1)}% 50%`);
      setStyle(title, "opacity", (titleEnter * (1 - titleExit)).toFixed(3));
      setStyle(title, "transform", `translate3d(-50%, calc(-50% + ${titleOffset.toFixed(2)}px), 0)`);

      wipeSteps.forEach((step, index) => {
        const coverStart = (isAboutIntro ? 0.005 : isFlowIntro ? 0 : 0.035)
          + index * (isAboutIntro ? 0.014 : isCompactIntro ? 0.018 : 0.028);
        const coverEnd = coverStart + (isAboutIntro ? 0.105 : isCompactIntro ? 0.14 : 0.19);
        const revealStart = (isFlowIntro ? 0.72 : 0.6) + index * (isFlowIntro ? 0.028 : 0.024);
        const revealEnd = revealStart + 0.16;
        const cover = smoothstep(clamp((progress - coverStart) / (coverEnd - coverStart)));
        const reveal = smoothstep(clamp((progress - revealStart) / (revealEnd - revealStart)));
        const offsetY = cover < 1 ? 101 * (1 - cover) : -101 * reveal;

        setStyle(step, "transform", `translate3d(0, ${offsetY.toFixed(2)}%, 0)`);
      });
    });
  };

  const updateSectionCopies = () => {
    const distance = getSectionCopyDistance();

    sectionCopies.forEach(({ section, title, lead }) => {
      if (!section || !title) return;

      if (reduceMotion.matches) {
        [title, lead].filter(Boolean).forEach((element) => {
          setStyle(element, "opacity", "1");
          setStyle(element, "transform", "translate3d(0, 0, 0)");
        });
        return;
      }

      const bounds = geometry.get(section);
      const sectionEnter = smoothstep(clamp((viewportHeight * 0.9 - bounds.top) / (viewportHeight * 0.5)));
      const titleEnter = smoothstep(clamp(sectionEnter / 0.78));
      const leadEnter = smoothstep(clamp((sectionEnter - 0.2) / 0.8));
      const exit = smoothstep(clamp((viewportHeight * 0.16 - bounds.bottom) / (viewportHeight * 0.34)));

      setLeadMotion(title, titleEnter * (1 - exit), -distance * (1 - titleEnter) - distance * 0.7 * exit);
      setLeadMotion(lead, leadEnter * (1 - exit), -distance * (1 - leadEnter) - distance * 0.7 * exit);
    });
  };

  const updateHeaderSectionTitle = () => {
    if (!headerSectionTitle) return;

    const heroBounds = geometry.get(heroTransition);
    if (heroBounds && heroBounds.bottom > 120) {
      headerSectionTitle.classList.remove("is-visible");
      return;
    }

    let currentRegion = null;
    sectionTitleRegions.forEach((region) => {
      if (geometry.get(region).top <= 120) currentRegion = region;
    });

    if (!currentRegion) {
      headerSectionTitle.classList.remove("is-visible");
      return;
    }

    const isTransition = currentRegion.hasAttribute("data-section-intro");
    const transitionProgress = isTransition ? getSectionTransitionProgress(currentRegion) : 1;
    const shouldShow = !isTransition || transitionProgress >= 0.88;
    const nextTitle = currentRegion.dataset.sectionTitle || "";

    if (nextTitle !== activeHeaderTitle) {
      activeHeaderTitle = nextTitle;
      headerSectionTitle.textContent = nextTitle;
    }
    headerSectionTitle.classList.toggle("is-visible", Boolean(nextTitle) && shouldShow);
  };

  const getCoverScale = () => {
    if (!sphereCover) return 5;

    const coverSize = coverWidth;
    const viewportDiagonal = Math.hypot(viewportWidth, geometry.get(hero)?.height || viewportHeight);

    return Math.max(viewportDiagonal / coverSize * 1.08, 4.4);
  };

  const updateHeaderVisibility = () => {
    if (!siteHeader) return;

    const currentScrollY = Math.max(window.scrollY, 0);
    const scrollDelta = currentScrollY - lastHeaderScrollY;

    if (currentScrollY <= 24) {
      siteHeader.classList.remove("is-hidden");
      scrollTopButton?.classList.remove("is-visible");
      scrollTopButton?.setAttribute("aria-hidden", "true");
      scrollTopButton?.setAttribute("tabindex", "-1");
      lastHeaderScrollY = currentScrollY;
      return;
    }

    if (Math.abs(scrollDelta) >= 8) {
      siteHeader.classList.toggle("is-hidden", scrollDelta > 0);
      lastHeaderScrollY = currentScrollY;
    }

    const visible = currentScrollY > 160 && !siteHeader.classList.contains("is-hidden");
    scrollTopButton?.classList.toggle("is-visible", visible);
    scrollTopButton?.setAttribute("aria-hidden", String(!visible));
    scrollTopButton?.setAttribute("tabindex", visible ? "0" : "-1");
  };

  const updateHeroSphere = () => {
    if (!heroTransition || !hero || reduceMotion.matches) {
      setStyle(hero, "--sphere-scale", "1");
      setStyle(hero, "--sphere-cover-opacity", "0");
      setStyle(hero, "--sphere-opacity", "1");
      setStyle(hero, "--hero-copy-opacity", "1");
      setStyle(document.documentElement, "--hero-light-opacity", "0.66");
      return;
    }

    const bounds = geometry.get(heroTransition);
    const scrollDistance = Math.max(geometry.get(heroTransition).height - geometry.get(hero).height, 1);
    const progress = clamp(-bounds.top / scrollDistance);
    const growthProgress = smoothstep(clamp((progress - 0.06) / 0.94));
    const fadeProgress = smoothstep(clamp((progress - 0.08) / 0.54));
    const coverProgress = smoothstep(clamp((progress - 0.28) / 0.72));
    const sphereFadeProgress = smoothstep(clamp((progress - 0.7) / 0.28));
    const sphereScale = 1 + (getCoverScale() - 1) * growthProgress;

    setStyle(hero, "--sphere-scale", sphereScale.toFixed(4));
    setStyle(hero, "--sphere-cover-opacity", coverProgress.toFixed(3));
    setStyle(hero, "--sphere-opacity", (1 - sphereFadeProgress).toFixed(3));
    setStyle(hero, "--hero-copy-opacity", (1 - fadeProgress).toFixed(3));
    setStyle(document.documentElement, "--hero-light-opacity", (0.66 - growthProgress * 0.2).toFixed(3));
  };

  const updatePage = () => {
    frameRequested = false;
    // A modal temporarily fixes body at scrollY=0; preserve the underlying scene until unlock.
    if (document.body.classList.contains("is-popup-modal-open")) return;
    viewportHeight = window.innerHeight;
    viewportWidth = window.innerWidth;
    geometry = new Map(measuredElements.map((element) => [element, element.getBoundingClientRect()]));
    coverWidth = sphereCover?.offsetWidth || 1;
    updateHeaderVisibility();
    updateSectionTransitions();
    updateHeaderSectionTitle();
    updateSectionCopies();
    updateHeroSphere();
  };

  const requestUpdate = () => {
    if (frameRequested) return;

    frameRequested = true;
    window.requestAnimationFrame(updatePage);
  };

  updatePage();
  window.requestAnimationFrame(requestUpdate);
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", requestUpdate);
  } else {
    reduceMotion.addListener(requestUpdate);
  }
})();
