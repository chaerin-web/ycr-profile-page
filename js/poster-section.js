(() => {
  const core = window.PortfolioCore || {};
  const reduceMotion = core.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");
  const lenis = core.lenis || null;
  const posterWorks = [...document.querySelectorAll("[data-poster-work]")];
  const posterNavLinks = [...document.querySelectorAll("[data-poster-nav]")];

  let frameRequested = false;

  const updatePosterNavigation = () => {
    if (!posterWorks.length || !posterNavLinks.length) return;

    const anchorLine = window.innerHeight * (window.innerWidth <= 768 ? 0.58 : 0.46);
    let activeWork = posterWorks[0];

    posterWorks.forEach((work) => {
      if (work.getBoundingClientRect().top <= anchorLine) activeWork = work;
    });

    posterNavLinks.forEach((link) => {
      const isActive = link.dataset.posterNav === activeWork.id;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const requestPosterNavigationUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(() => {
      frameRequested = false;
      updatePosterNavigation();
    });
  };

  const setupPosterSection = () => {
    if (!posterWorks.length) return;

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      posterWorks.forEach((work) => work.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

      posterWorks.forEach((work) => revealObserver.observe(work));
    }

    posterNavLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.getElementById(link.dataset.posterNav || "");
        if (!target) return;

        event.preventDefault();
        if (lenis) {
          lenis.scrollTo(target);
        } else {
          target.scrollIntoView({
            behavior: "auto",
            block: "start"
          });
        }
        window.setTimeout(() => link.blur(), 0);
      });
    });
  };

  setupPosterSection();
  updatePosterNavigation();
  window.addEventListener("scroll", requestPosterNavigationUpdate, { passive: true });
  window.addEventListener("resize", requestPosterNavigationUpdate);
})();
