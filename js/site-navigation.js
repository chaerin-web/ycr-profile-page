(() => {
  const core = window.PortfolioCore || {};
  const reduceMotion = core.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");
  const lenis = core.lenis || null;
  const siteHeader = document.querySelector(".site-header");
  const heroScrollCue = document.querySelector(".hero__scroll-cue");
  const menuLinks = [...document.querySelectorAll(".menu-panel a, .site-header__contact")];
  const submenuToggles = [...document.querySelectorAll("[data-submenu-toggle]")];

  const SECTION_TITLE_TRAVEL_MS = 1150;
  const SECTION_TITLE_HOLD_MS = 500;
  const NAV_SECTION_TITLE_HOLD_MS = 250;

  let guidedHeroScrollId = 0;

  const startGuidedSectionScroll = (event, introId, contentId, holdDuration = SECTION_TITLE_HOLD_MS) => {
    const introSection = document.getElementById(introId);
    const contentSection = document.getElementById(contentId);
    if (!introSection || !contentSection) return false;

    event?.preventDefault();
    guidedHeroScrollId += 1;
    const currentRun = guidedHeroScrollId;

    if (reduceMotion.matches) {
      contentSection.scrollIntoView({ behavior: "auto", block: "start" });
      return true;
    }

    const introTop = window.scrollY + introSection.getBoundingClientRect().top;
    const introDistance = Math.max(introSection.offsetHeight - window.innerHeight, 1);
    const titleFrameY = introTop + introDistance * 0.43;
    siteHeader?.classList.remove("is-hidden");

    if (lenis) {
      lenis.scrollTo(titleFrameY, { duration: SECTION_TITLE_TRAVEL_MS / 1000 });
    } else {
      window.scrollTo({ top: titleFrameY, behavior: "smooth" });
    }

    window.setTimeout(() => {
      if (currentRun !== guidedHeroScrollId) return;
      if (lenis) {
        lenis.scrollTo(contentSection, { duration: 1.15 });
      } else {
        contentSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, SECTION_TITLE_TRAVEL_MS + holdDuration);
    return true;
  };

  const cancelGuidedHeroScroll = () => {
    guidedHeroScrollId += 1;
  };

  const closeSubmenus = () => {
    document.querySelectorAll(".menu-panel__group.is-expanded").forEach((group) => {
      group.classList.remove("is-expanded");
      group.querySelector("[data-submenu-toggle]")?.setAttribute("aria-expanded", "false");
    });
  };

  const scrollMenuSectionToTitle = (event, link) => {
    const introId = link.dataset.navIntro;
    const contentId = link.dataset.navContent;
    if (!introId || !contentId) return false;
    return startGuidedSectionScroll(event, introId, contentId, NAV_SECTION_TITLE_HOLD_MS);
  };

  const setupSubmenus = () => {
    submenuToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const group = toggle.closest(".menu-panel__group");
        const willExpand = !group.classList.contains("is-expanded");

        closeSubmenus();
        group.classList.toggle("is-expanded", willExpand);
        toggle.setAttribute("aria-expanded", String(willExpand));
      });
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".site-header__menu")) return;
      closeSubmenus();
    });
  };

  const setupMenuLinks = () => {
    menuLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (scrollMenuSectionToTitle(event, link)) {
          window.setTimeout(() => link.blur(), 0);
          return;
        }

        closeSubmenus();
        window.setTimeout(() => link.blur(), 0);
      });
    });
  };

  const setupDetailCardStateReset = () => {
    const detailLinks = [...document.querySelectorAll(".detail-card__cta")];
    if (!detailLinks.length) return;

    const reset = () => {
      document.body.classList.add("is-detail-hover-reset");
      detailLinks.forEach((link) => link.blur());
    };
    const release = () => document.body.classList.remove("is-detail-hover-reset");

    detailLinks.forEach((link) => link.addEventListener("click", reset));
    window.addEventListener("pageshow", reset);
    window.addEventListener("focus", reset);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) reset();
    });
    document.addEventListener("pointermove", release, { passive: true });
    document.querySelector(".detail-showcase__grid")?.addEventListener("pointerleave", release);
  };

  const setupPendingProjectLinks = () => {
    const pendingProjectLinks = [...document.querySelectorAll("[data-project-link-pending]")];
    pendingProjectLinks.forEach((button) => {
      button.addEventListener("click", () => {
        const notice = document.querySelector("[data-project-link-notice]") || document.createElement("p");
        notice.dataset.projectLinkNotice = "";
        notice.className = "web-project-link-notice";
        notice.setAttribute("role", "status");
        notice.textContent = `${button.dataset.projectLinkPending} 연결 주소를 등록하면 새 탭에서 열립니다.`;
        if (!notice.isConnected) document.body.append(notice);
        notice.classList.add("is-visible");
        window.clearTimeout(notice.hideTimer);
        notice.hideTimer = window.setTimeout(() => notice.classList.remove("is-visible"), 3400);
      });
    });
  };

  heroScrollCue?.addEventListener("click", (event) => {
    startGuidedSectionScroll(event, "about-me", "about-content");
  });
  window.addEventListener("wheel", cancelGuidedHeroScroll, { passive: true });
  window.addEventListener("touchstart", cancelGuidedHeroScroll, { passive: true });

  setupSubmenus();
  setupMenuLinks();
  setupDetailCardStateReset();
  setupPendingProjectLinks();
})();
