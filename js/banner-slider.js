(() => {
  const core = window.PortfolioCore || {};
  const reduceMotion = core.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");
  const bannerSlider = document.querySelector("[data-banner-slider]");
  const bannerViewport = bannerSlider?.querySelector(".banner-slider__viewport");
  const bannerSlides = [...(bannerSlider?.querySelectorAll("[data-banner-slide]") || [])];
  const bannerDots = [...(bannerSlider?.querySelectorAll("[data-banner-dot]") || [])];
  const bannerStatus = bannerSlider?.querySelector("[data-banner-status]");
  const bannerNames = ["GENTLE MONSTER", "AESOP", "NULDAM", "YOUTUBE MUSIC"];

  const setupBannerSlider = () => {
    if (!bannerSlider || !bannerViewport || !bannerSlides.length || typeof Swiper === "undefined") return;

    bannerSlides.forEach((slide, index) => {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-label", `${index + 1} / ${bannerSlides.length}`);
      slide.querySelectorAll("img").forEach((image) => { image.draggable = false; });
    });

    const updateBannerState = (swiper) => {
      const index = swiper.realIndex;
      bannerSlides.forEach((slide, slideIndex) => {
        const isActive = index === slideIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
      bannerDots.forEach((dot, dotIndex) => {
        const isActive = index === dotIndex;
        dot.classList.toggle("is-active", isActive);
        if (isActive) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (bannerStatus) {
        bannerStatus.textContent = `${index + 1} / ${bannerSlides.length}, ${bannerNames[index] || "배너"}`;
      }
    };

    const swiper = new Swiper(bannerViewport, {
      slidesPerView: 1,
      loop: true,
      speed: reduceMotion.matches ? 0 : 620,
      grabCursor: true,
      simulateTouch: true,
      threshold: 5,
      longSwipesRatio: 0.025,
      longSwipesMs: 400,
      shortSwipes: true,
      slidesPerGroup: 1,
      watchOverflow: true,
      preventClicks: true,
      loopPreventsSliding: false,
      autoplay: reduceMotion.matches ? false : {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      on: {
        init: updateBannerState,
        slideChange: updateBannerState
      }
    });

    bannerDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        swiper.slideToLoop(Number(dot.dataset.bannerDot));
        window.setTimeout(() => dot.blur(), 0);
      });
    });

    bannerSlider.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "PageDown", "ArrowLeft", "PageUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") swiper.slideToLoop(0);
      else if (event.key === "End") swiper.slideToLoop(bannerSlides.length - 1);
      else if (event.key === "ArrowRight" || event.key === "PageDown") swiper.slideNext();
      else swiper.slidePrev();
    });

    bannerSlider.addEventListener("focusin", () => swiper.autoplay?.stop());
    bannerSlider.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!bannerSlider.contains(document.activeElement) && !reduceMotion.matches) swiper.autoplay?.start();
      }, 0);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) swiper.autoplay?.stop();
      else if (!reduceMotion.matches) swiper.autoplay?.start();
    });

    const onMotionPreferenceChange = () => {
      swiper.params.speed = reduceMotion.matches ? 0 : 620;
      if (reduceMotion.matches) swiper.autoplay?.stop();
      else swiper.autoplay?.start();
    };

    if (typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", onMotionPreferenceChange);
    } else {
      reduceMotion.addListener(onMotionPreferenceChange);
    }
  };

  setupBannerSlider();
})();
