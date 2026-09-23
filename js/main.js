(() => {
  /* DOM references and shared runtime state */
  const root = document.documentElement;
  const siteHeader = document.querySelector(".site-header");
  const headerSectionTitle = document.querySelector("[data-header-section-title]");
  const sectionTransitions = [...document.querySelectorAll("[data-section-intro]")].map((section) => ({
    section,
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
  const heroTransition = document.querySelector(".hero-transition");
  const hero = document.querySelector(".hero");
  const heroScrollCue = document.querySelector(".hero__scroll-cue");
  const sphereCover = document.querySelector(".hero__sphere-cover");
  const popupMarquee = document.querySelector("[data-popup-marquee]");
  const popupTrack = document.querySelector("[data-popup-track]");
  const popupList = document.querySelector("[data-popup-list]");
  const popupModal = document.querySelector("[data-popup-modal]");
  const popupModalImage = document.querySelector("[data-popup-modal-image]");
  const popupModalTitle = document.querySelector("[data-popup-modal-title]");
  const popupModalDescription = document.querySelector("[data-popup-modal-description]");
  const popupModalCount = document.querySelector("[data-popup-modal-count]");
  const popupModalClose = document.querySelector("[data-popup-close]");
  const posterWorks = [...document.querySelectorAll("[data-poster-work]")];
  const posterNavLinks = [...document.querySelectorAll("[data-poster-nav]")];
  const bannerSlider = document.querySelector("[data-banner-slider]");
  const bannerViewport = bannerSlider?.querySelector(".banner-slider__viewport");
  const bannerTrack = bannerSlider?.querySelector("[data-banner-track]");
  const bannerSlides = [...(bannerSlider?.querySelectorAll("[data-banner-slide]") || [])];
  const bannerDots = [...(bannerSlider?.querySelectorAll("[data-banner-dot]") || [])];
  const bannerStatus = bannerSlider?.querySelector("[data-banner-status]");
  const menuLinks = [...document.querySelectorAll(".menu-panel a")];
  const submenuToggles = [...document.querySelectorAll("[data-submenu-toggle]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SECTION_TITLE_TRAVEL_MS = 1150;
  const SECTION_TITLE_HOLD_MS = 500;
  const NAV_SECTION_TITLE_HOLD_MS = 250;
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
    requestAnimationFrame(lenisRaf);
  };

  if (lenis) {
    requestAnimationFrame(lenisRaf);
  }

  let frameRequested = false;
  let lastHeaderScrollY = Math.max(window.scrollY, 0);
  let activeHeaderTitle = "";
  let popupListWidth = 0;
  let popupOffset = 0;
  let popupLastFrame = 0;
  let popupIsDragging = false;
  let popupDragMoved = false;
  let popupPointerId = null;
  let popupDragStartX = 0;
  let popupDragStartOffset = 0;
  let popupIsOutside = true;
  let popupSuppressClickUntil = 0;
  let guidedHeroScrollId = 0;
  let activeBannerIndex = 0;
  let bannerScrollFrame = false;
  let bannerIsDragging = false;
  let bannerDragMoved = false;
  let bannerPointerId = null;
  let bannerDragStartX = 0;
  let bannerDragStartScrollLeft = 0;
  let bannerAllSlides = [];
  let bannerPhysicalIndex = 1;
  let bannerAutoplayTimer = 0;
  let bannerScrollEndTimer = 0;
  let bannerPointerInside = false;
  let bannerHasFocus = false;
  let bannerIsTransitioning = false;
  let bannerQueuedIndex = null;
  let bannerResetFrame = 0;
  let popupScrollLockY = 0;

  const bannerNames = ["GENTLE MONSTER", "AESOP", "NULDAM", "YOUTUBE MUSIC"];

  const popupWorks = [
    {
      title: "A TWOSOME PLACE",
      image: "./img/popup-twosome_dessert.png",
      alt: "투썸플레이스 샤인머스켓 케이크 신메뉴 팝업 디자인",
      description: "딥 네이비 배경으로 샤인머스켓의 밝은 그린 컬러를 돋보이게 했으며,\n과즙 소스가 흘러내리는 연출과 제품 중심의 구도를 활용해\n샤인머스켓 케이크의 달콤한 이미지를 표현했습니다."
    },
    {
      title: "A TWOSOME PLACE",
      image: "./img/popup-twosome_drink.png",
      alt: "투썸플레이스 화이트 피치 신메뉴 팝업 디자인",
      description: "핑크와 피치 계열의 색감에 음료와 복숭아를 크게 배치해\n신메뉴의 주목도를 높였으며, 청량한 탄산 질감과 손글씨를 활용해\n여름 메뉴의 달콤하고 산뜻한 이미지를 표현했습니다."
    },
    {
      title: "OLIVE YOUNG × TORRIDEN",
      image: "./img/popup-torriden.png",
      alt: "올리브영과 토리든 협업 프로모션 팝업 디자인",
      description: "블루 계열의 컬러와 물방울 효과를 활용해\n제품의 풍부한 수분감을 시각화했으며, 제품과 할인 정보를 강조해\n기능성과 프로모션 혜택을 한눈에 전달했습니다."
    },
    {
      title: "OLIVE YOUNG × PERIPERA",
      image: "./img/popup-peripera.png",
      alt: "올리브영과 페리페라 협업 프로모션 팝업 디자인",
      description: "핑크 컬러와 픽셀 서체를 활용해\n페리페라 특유의 발랄하고 키치한 분위기를 연출했으며,\n영수증 형태의 구성으로 할인 혜택을 재치 있게 강조했습니다."
    },
    {
      title: "ROCKFISH WEATHERWEAR",
      image: "./img/popup-rockfish.png",
      alt: "락피쉬웨더웨어 봄 시즌 세일 팝업 디자인",
      description: "맑은 하늘과 들꽃 배경에 제품을 중앙 배치해\n봄 시즌의 따뜻하고 산뜻한 분위기를 표현했으며,\n서체의 대비를 활용해 브랜드 감성과 할인 정보를 함께 전달했습니다."
    },
    {
      title: "NETFLIX THRILLER",
      image: "./img/popup-netflix_thriller.png",
      alt: "넷플릭스 스릴러 콘텐츠 프로모션 팝업 디자인",
      description: "짙은 네이비와 블랙 컬러, 거친 질감의 합성 효과를 활용해\n어둡고 긴장감 있는 분위기를 연출했으며, 레드 컬러를 포인트로 사용해\n스릴러 장르의 위기감과 강렬함을 전달했습니다."
    },
    {
      title: "NETFLIX ROMANCE",
      image: "./img/popup-netflix_romance.png",
      alt: "넷플릭스 로맨스 콘텐츠 프로모션 팝업 디자인",
      description: "따뜻한 골든 톤과 여러 장면을 겹친 콜라주 구성으로\n추억과 시간의 흐름을 표현했으며, 손글씨 서체를 활용해\n로맨스 장르의 감성적이고 아련한 분위기를 전달했습니다."
    },
    {
      title: "NIKE",
      image: "./img/popup-nike.png",
      alt: "나이키 러닝 시즌 세일 팝업 디자인",
      description: "선명한 블루 배경과 역동적인 인물의 동작을 활용해\n러닝의 속도감과 에너지를 표현했으며, 화면을 가득 채운 타이포그래피로\n시즌 세일의 활기차고 강렬한 이미지를 강조했습니다."
    }
  ];

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const staggerProgress = (progress, start, end) => smoothstep(clamp((progress - start) / (end - start)));
  const getSectionCopyDistance = () => {
    if (window.innerWidth <= 560) return 36;
    if (window.innerWidth <= 768) return 44;
    if (window.innerWidth <= 1024) return 56;
    return 72;
  };
  const setLeadMotion = (element, opacity, offsetX) => {
    if (!element) return;

    element.style.opacity = clamp(opacity).toFixed(3);
    element.style.transform = `translate3d(${offsetX.toFixed(2)}px, 0, 0)`;
  };

  const aboutRevealItems = [
    ...document.querySelectorAll(".about-section__intro, [data-attitude-card], .skill-card")
  ];

  const setupAboutReveal = () => {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      aboutRevealItems.forEach((item) => item.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver((entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target;
        const group = item.closest(".skills-grid, .attitude-grid");
        const siblings = group
          ? [...group.querySelectorAll(".skill-card, .attitude-card")]
          : [];
        const order = Math.max(siblings.indexOf(item), 0);
        item.style.setProperty("--about-reveal-delay", `${Math.min(order * 90, 240)}ms`);
        item.classList.add("is-revealed");
        revealObserver.unobserve(item);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });

    aboutRevealItems.forEach((item) => observer.observe(item));
  };

  /* Section transitions, header title and scroll-linked copy */
  const getSectionTransitionProgress = (section) => {
    if (!section) return 0;

    const bounds = section.getBoundingClientRect();
    const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
    return clamp(-bounds.top / scrollDistance);
  };

  const updateSectionTransitions = () => {
    sectionTransitions.forEach(({ section, title, tone, wipeSteps }) => {
      if (!title || !tone || !wipeSteps.length) return;

      if (reduceMotion.matches) {
        title.style.opacity = "1";
        title.style.transform = "translate3d(-50%, -50%, 0)";
        tone.style.opacity = "1";
        wipeSteps.forEach((step) => {
          step.style.transform = "translate3d(0, -101%, 0)";
        });
        return;
      }

      const progress = getSectionTransitionProgress(section);
      const isAboutIntro = section.id === "about-me";
      const toneStart = isAboutIntro ? 0.035 : 0.2;
      const titleStart = isAboutIntro ? 0.065 : 0.2;
      const toneProgress = smoothstep(clamp((progress - toneStart) / (0.74 - toneStart)));
      const titleEnter = smoothstep(clamp((progress - titleStart) / (isAboutIntro ? 0.1 : 0.17)));
      const titleExit = smoothstep(clamp((progress - 0.74) / 0.14));
      const titleOffset = 26 * (1 - titleEnter) - 22 * titleExit;

      tone.style.opacity = toneProgress.toFixed(3);
      title.style.opacity = (titleEnter * (1 - titleExit)).toFixed(3);
      title.style.transform = `translate3d(-50%, calc(-50% + ${titleOffset.toFixed(2)}px), 0)`;

      wipeSteps.forEach((step, index) => {
        const coverStart = (isAboutIntro ? 0.005 : 0.035) + index * (isAboutIntro ? 0.014 : 0.028);
        const coverEnd = coverStart + (isAboutIntro ? 0.105 : 0.19);
        const revealStart = 0.6 + index * 0.024;
        const revealEnd = revealStart + 0.16;
        const cover = smoothstep(clamp((progress - coverStart) / (coverEnd - coverStart)));
        const reveal = smoothstep(clamp((progress - revealStart) / (revealEnd - revealStart)));
        const offsetY = cover < 1 ? 101 * (1 - cover) : -101 * reveal;

        step.style.transform = `translate3d(0, ${offsetY.toFixed(2)}%, 0)`;
      });
    });
  };

  const updateSectionCopies = () => {
    const viewportHeight = window.innerHeight;
    const distance = getSectionCopyDistance();

    sectionCopies.forEach(({ section, title, lead }) => {
      if (!section || !title) return;

      if (reduceMotion.matches) {
        [title, lead].filter(Boolean).forEach((element) => {
          element.style.opacity = "1";
          element.style.transform = "translate3d(0, 0, 0)";
        });
        return;
      }

      const bounds = section.getBoundingClientRect();
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

    const heroBounds = heroTransition?.getBoundingClientRect();
    if (heroBounds && heroBounds.bottom > 120) {
      headerSectionTitle.classList.remove("is-visible");
      return;
    }

    let currentRegion = null;
    sectionTitleRegions.forEach((region) => {
      if (region.getBoundingClientRect().top <= 120) currentRegion = region;
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

    const coverSize = sphereCover.offsetWidth || 1;
    const viewportDiagonal = Math.hypot(window.innerWidth, window.innerHeight);

    return Math.max(viewportDiagonal / coverSize * 1.08, 4.4);
  };

  const updateHeaderVisibility = () => {
    if (!siteHeader) return;

    const currentScrollY = Math.max(window.scrollY, 0);
    const scrollDelta = currentScrollY - lastHeaderScrollY;

    if (currentScrollY <= 24) {
      siteHeader.classList.remove("is-hidden");
      lastHeaderScrollY = currentScrollY;
      return;
    }

    if (Math.abs(scrollDelta) < 8) return;

    siteHeader.classList.toggle("is-hidden", scrollDelta > 0);
    lastHeaderScrollY = currentScrollY;
  };

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

  const updatePage = () => {
    frameRequested = false;
    updateHeaderVisibility();
    updateSectionTransitions();
    updateHeaderSectionTitle();
    updateSectionCopies();
    updatePosterNavigation();

    if (!heroTransition || !hero || reduceMotion.matches) {
      root.style.setProperty("--sphere-scale", "1");
      root.style.setProperty("--sphere-cover-opacity", "0");
      root.style.setProperty("--sphere-opacity", "1");
      root.style.setProperty("--hero-copy-opacity", "1");
      root.style.setProperty("--hero-light-opacity", "0.66");
      return;
    }

    const bounds = heroTransition.getBoundingClientRect();
    const scrollDistance = Math.max(heroTransition.offsetHeight - hero.offsetHeight, 1);
    const progress = clamp(-bounds.top / scrollDistance);
    const growthProgress = smoothstep(clamp((progress - 0.06) / 0.94));
    const fadeProgress = smoothstep(clamp((progress - 0.08) / 0.54));
    const coverProgress = smoothstep(clamp((progress - 0.28) / 0.72));
    const sphereFadeProgress = smoothstep(clamp((progress - 0.7) / 0.28));
    const sphereScale = 1 + (getCoverScale() - 1) * growthProgress;

    root.style.setProperty("--sphere-scale", sphereScale.toFixed(4));
    root.style.setProperty("--sphere-cover-opacity", coverProgress.toFixed(3));
    root.style.setProperty("--sphere-opacity", (1 - sphereFadeProgress).toFixed(3));
    root.style.setProperty("--hero-copy-opacity", (1 - fadeProgress).toFixed(3));
    root.style.setProperty("--hero-light-opacity", (0.66 - growthProgress * 0.2).toFixed(3));
  };

  const requestUpdate = () => {
    if (frameRequested) return;

    frameRequested = true;
    window.requestAnimationFrame(updatePage);
  };

  /* Popup gallery and modal */
  const getPopupCards = () => [...(popupTrack?.querySelectorAll(".popup-card") || [])];

  const clearPopupCardStates = () => {
    getPopupCards().forEach((card) => card.classList.remove("is-touch-active"));
    popupTrack?.querySelectorAll(":focus").forEach((element) => element.blur());
  };

  const syncPopupPause = () => {
    if (!popupMarquee) return false;

    const hasActiveCard = Boolean(
      popupMarquee.querySelector(".popup-card:hover, .popup-card:focus-within, .popup-card.is-touch-active")
    );
    const isPaused = Boolean(popupModal?.open) || hasActiveCard || popupIsDragging || popupIsOutside;
    popupMarquee.classList.toggle("is-paused", isPaused);
    return isPaused;
  };

  const wrapPopupOffset = (value) => {
    if (!popupListWidth) return 0;
    return ((value % popupListWidth) + popupListWidth) % popupListWidth;
  };

  const renderPopupTrack = () => {
    if (!popupTrack) return;
    popupTrack.style.transform = `translate3d(${(-popupOffset).toFixed(2)}px, 0, 0)`;
  };

  const updatePopupMetrics = () => {
    if (!popupList) return;
    popupListWidth = popupList.getBoundingClientRect().width;
    popupOffset = wrapPopupOffset(popupOffset);
    renderPopupTrack();
  };

  const animatePopupTrack = (timestamp) => {
    if (!popupTrack || reduceMotion.matches) return;

    const delta = popupLastFrame ? Math.min(timestamp - popupLastFrame, 48) : 0;
    popupLastFrame = timestamp;

    if (!syncPopupPause() && popupListWidth > 0) {
      popupOffset = wrapPopupOffset(popupOffset + (popupListWidth / 54000) * delta);
      renderPopupTrack();
    }

    window.requestAnimationFrame(animatePopupTrack);
  };

  const closePopupModal = () => {
    if (!popupModal?.open) return;

    if (typeof popupModal.close === "function") {
      popupModal.close();
    } else {
      popupModal.removeAttribute("open");
      popupModal.dispatchEvent(new Event("close"));
    }
  };

  const lockPopupBackground = () => {
    if (document.body.classList.contains("is-popup-modal-open")) return;

    popupScrollLockY = Math.max(window.scrollY, 0);
    document.body.style.position = "fixed";
    document.body.style.top = `${-popupScrollLockY}px`;
    document.body.style.right = "0";
    document.body.style.left = "0";
    document.body.style.width = "100%";
    document.body.classList.add("is-popup-modal-open");
    lenis?.stop();
  };

  const unlockPopupBackground = () => {
    if (!document.body.classList.contains("is-popup-modal-open")) return;

    document.body.classList.remove("is-popup-modal-open");
    document.body.style.removeProperty("position");
    document.body.style.removeProperty("top");
    document.body.style.removeProperty("right");
    document.body.style.removeProperty("left");
    document.body.style.removeProperty("width");
    window.scrollTo({ top: popupScrollLockY, left: 0, behavior: "auto" });
    lenis?.start();
  };

  const openPopupModal = (index, trigger) => {
    const work = popupWorks[index];
    if (!work || !popupModal) return;

    clearPopupCardStates();
    trigger?.blur();

    if (popupModalImage) {
      popupModalImage.src = work.image;
      popupModalImage.alt = work.alt;
    }
    if (popupModalTitle) popupModalTitle.textContent = work.title;
    if (popupModalDescription) popupModalDescription.textContent = work.description;
    if (popupModalCount) {
      popupModalCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(popupWorks.length).padStart(2, "0")}`;
    }

    lockPopupBackground();
    popupMarquee?.classList.add("is-paused");

    if (typeof popupModal.showModal === "function") {
      popupModal.showModal();
    } else {
      popupModal.setAttribute("open", "");
    }
  };

  const setupPopupGallery = () => {
    if (!popupMarquee || !popupTrack || !popupList) return;

    if (!reduceMotion.matches) {
      const clonedList = popupList.cloneNode(true);
      clonedList.dataset.popupClone = "";
      clonedList.setAttribute("aria-hidden", "true");
      clonedList.querySelectorAll("button").forEach((button) => {
        button.tabIndex = -1;
      });
      popupTrack.append(clonedList);
    }

    const cards = [...popupTrack.querySelectorAll(".popup-card")];
    const openButtons = [...popupTrack.querySelectorAll("[data-popup-open]")];

    cards.forEach((card) => {
      const isClone = Boolean(card.closest("[data-popup-clone]"));
      card.tabIndex = isClone ? -1 : 0;
      card.querySelectorAll("img").forEach((image) => {
        image.draggable = false;
      });

      card.addEventListener("pointerenter", syncPopupPause);
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-touch-active");
        window.requestAnimationFrame(syncPopupPause);
      });
      card.addEventListener("focusin", syncPopupPause);
      card.addEventListener("focusout", () => window.requestAnimationFrame(syncPopupPause));
      card.addEventListener("click", (event) => {
        if (event.target.closest("[data-popup-open]") || performance.now() < popupSuppressClickUntil) return;
        if (!window.matchMedia("(hover: none)").matches) return;

        cards.forEach((otherCard) => {
          if (otherCard !== card) otherCard.classList.remove("is-touch-active");
        });
        card.classList.toggle("is-touch-active");
        window.requestAnimationFrame(syncPopupPause);
      });
    });

    popupMarquee.addEventListener("pointerdown", (event) => {
      if (reduceMotion.matches || event.button !== 0 || event.target.closest("[data-popup-open]")) return;

      popupIsDragging = true;
      popupDragMoved = false;
      popupPointerId = event.pointerId;
      popupDragStartX = event.clientX;
      popupDragStartOffset = popupOffset;
      popupMarquee.classList.add("is-dragging");
      popupMarquee.setPointerCapture?.(event.pointerId);
      syncPopupPause();
    });

    popupMarquee.addEventListener("pointermove", (event) => {
      if (!popupIsDragging || event.pointerId !== popupPointerId) return;

      const distance = event.clientX - popupDragStartX;
      if (Math.abs(distance) > 4) popupDragMoved = true;
      if (!popupDragMoved) return;

      event.preventDefault();
      popupOffset = wrapPopupOffset(popupDragStartOffset - distance);
      renderPopupTrack();
    });

    const finishPopupDrag = (event) => {
      if (!popupIsDragging || event.pointerId !== popupPointerId) return;

      if (popupDragMoved) {
        popupSuppressClickUntil = performance.now() + 180;
        clearPopupCardStates();
      }
      popupIsDragging = false;
      popupPointerId = null;
      popupMarquee.classList.remove("is-dragging");
      if (popupMarquee.hasPointerCapture?.(event.pointerId)) {
        popupMarquee.releasePointerCapture(event.pointerId);
      }
      window.requestAnimationFrame(syncPopupPause);
    };

    popupMarquee.addEventListener("pointerup", finishPopupDrag);
    popupMarquee.addEventListener("pointercancel", finishPopupDrag);
    popupMarquee.addEventListener("click", (event) => {
      if (performance.now() >= popupSuppressClickUntil) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    openButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openPopupModal(Number(button.dataset.popupOpen), button);
      });
    });

    document.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".popup-card")) return;
      clearPopupCardStates();
      window.requestAnimationFrame(syncPopupPause);
    });

    popupModalClose?.addEventListener("click", closePopupModal);
    popupModal?.addEventListener("click", (event) => {
      if (event.target === popupModal) closePopupModal();
    });
    popupModal?.addEventListener("close", () => {
      unlockPopupBackground();
      clearPopupCardStates();
      window.requestAnimationFrame(syncPopupPause);
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        popupIsOutside = !entry.isIntersecting;
        popupMarquee.classList.toggle("is-outside", popupIsOutside);
      }, { threshold: 0.06 });
      observer.observe(popupMarquee);
    } else {
      popupIsOutside = false;
    }

    updatePopupMetrics();
    window.addEventListener("resize", updatePopupMetrics);
    if (!reduceMotion.matches) window.requestAnimationFrame(animatePopupTrack);
  };

  /* Poster reveal and navigation */
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

  /* Seamless banner slider */
  const getNormalizedBannerIndex = (index) => {
    if (!bannerSlides.length) return 0;
    return ((index % bannerSlides.length) + bannerSlides.length) % bannerSlides.length;
  };

  const getBannerLogicalIndex = (physicalIndex) => {
    if (physicalIndex <= 0) return bannerSlides.length - 1;
    if (physicalIndex >= bannerSlides.length + 1) return 0;
    return physicalIndex - 1;
  };

  const setActiveBannerSlide = (nextIndex) => {
    if (!bannerSlides.length) return;

    activeBannerIndex = getNormalizedBannerIndex(nextIndex);
    const slidesToUpdate = bannerAllSlides.length ? bannerAllSlides : bannerSlides;

    slidesToUpdate.forEach((slide) => {
      const logicalIndex = Number(slide.dataset.bannerLogical);
      const isActive = logicalIndex === activeBannerIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(slide.dataset.bannerClone === "true" || !isActive));
    });

    bannerDots.forEach((dot, index) => {
      const isActive = index === activeBannerIndex;
      dot.classList.toggle("is-active", isActive);
      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    if (bannerStatus) {
      bannerStatus.textContent = `${activeBannerIndex + 1} / ${bannerSlides.length}, ${bannerNames[activeBannerIndex] || "배너"}`;
    }
  };

  const clearBannerAutoplay = () => {
    window.clearTimeout(bannerAutoplayTimer);
    bannerAutoplayTimer = 0;
  };

  const settleBannerClone = (physicalIndex = bannerPhysicalIndex) => {
    if (!bannerViewport || !bannerSlides.length) return;

    let settledPhysicalIndex = physicalIndex;
    if (physicalIndex <= 0) settledPhysicalIndex = bannerSlides.length;
    if (physicalIndex >= bannerSlides.length + 1) settledPhysicalIndex = 1;
    if (settledPhysicalIndex === physicalIndex) return false;

    bannerPhysicalIndex = settledPhysicalIndex;
    window.cancelAnimationFrame(bannerResetFrame);
    bannerViewport.classList.add("is-jump-resetting");
    bannerViewport.style.scrollBehavior = "auto";
    bannerViewport.style.scrollSnapType = "none";
    bannerViewport.scrollLeft = bannerViewport.clientWidth * settledPhysicalIndex;
    setActiveBannerSlide(getBannerLogicalIndex(settledPhysicalIndex));
    bannerResetFrame = window.requestAnimationFrame(() => {
      bannerResetFrame = window.requestAnimationFrame(() => {
        bannerViewport.style.removeProperty("scroll-behavior");
        bannerViewport.style.removeProperty("scroll-snap-type");
        bannerViewport.classList.remove("is-jump-resetting");
      });
    });
    return true;
  };

  const finishBannerMovement = () => {
    if (!bannerViewport || bannerIsDragging) return;

    const slideWidth = Math.max(bannerViewport.clientWidth, 1);
    const physicalIndex = Math.min(
      Math.max(Math.round(bannerViewport.scrollLeft / slideWidth), 0),
      bannerSlides.length + 1
    );
    bannerPhysicalIndex = physicalIndex;
    settleBannerClone(physicalIndex);
    bannerIsTransitioning = false;

    if (bannerQueuedIndex !== null) {
      const queuedIndex = bannerQueuedIndex;
      bannerQueuedIndex = null;
      window.requestAnimationFrame(() => scrollToBannerSlide(queuedIndex));
      return;
    }

    scheduleBannerAutoplay();
  };

  const scrollToBannerPhysicalSlide = (physicalIndex, behavior = reduceMotion.matches ? "auto" : "smooth") => {
    if (!bannerViewport || !bannerSlides.length) return;

    const boundedPhysicalIndex = Math.min(Math.max(physicalIndex, 0), bannerSlides.length + 1);
    bannerPhysicalIndex = boundedPhysicalIndex;
    bannerIsTransitioning = behavior === "smooth";
    setActiveBannerSlide(getBannerLogicalIndex(boundedPhysicalIndex));
    bannerViewport.scrollTo({
      left: bannerViewport.clientWidth * boundedPhysicalIndex,
      behavior
    });
    if (behavior === "auto") finishBannerMovement();
  };

  const scrollToBannerSlide = (index, behavior = reduceMotion.matches ? "auto" : "smooth") => {
    if (!bannerViewport || !bannerSlides.length) return;

    if (bannerIsTransitioning && behavior === "smooth") {
      bannerQueuedIndex = index;
      return;
    }

    const logicalIndex = getNormalizedBannerIndex(index);
    let physicalIndex = logicalIndex + 1;

    if (index >= bannerSlides.length && activeBannerIndex === bannerSlides.length - 1) {
      physicalIndex = bannerSlides.length + 1;
    } else if (index < 0 && activeBannerIndex === 0) {
      physicalIndex = 0;
    }

    scrollToBannerPhysicalSlide(physicalIndex, behavior);
  };

  const scheduleBannerAutoplay = () => {
    clearBannerAutoplay();
    if (reduceMotion.matches || bannerPointerInside || bannerHasFocus || bannerIsDragging || bannerIsTransitioning || document.hidden) return;

    bannerAutoplayTimer = window.setTimeout(() => {
      scrollToBannerSlide(activeBannerIndex + 1);
    }, 3000);
  };

  const syncBannerSlideFromScroll = () => {
    bannerScrollFrame = false;
    if (!bannerViewport || !bannerSlides.length || bannerIsDragging) return;

    const slideWidth = Math.max(bannerViewport.clientWidth, 1);
    bannerPhysicalIndex = Math.min(
      Math.max(Math.round(bannerViewport.scrollLeft / slideWidth), 0),
      bannerSlides.length + 1
    );
    setActiveBannerSlide(getBannerLogicalIndex(bannerPhysicalIndex));
  };

  const setupBannerSlider = () => {
    if (!bannerSlider || !bannerViewport || !bannerTrack || !bannerSlides.length) return;

    bannerSlides.forEach((slide, index) => {
      slide.dataset.bannerLogical = String(index);
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-label", `${index + 1} / ${bannerSlides.length}`);
    });

    const firstClone = bannerSlides[0].cloneNode(true);
    const lastClone = bannerSlides[bannerSlides.length - 1].cloneNode(true);
    firstClone.removeAttribute("data-banner-slide");
    lastClone.removeAttribute("data-banner-slide");
    firstClone.dataset.bannerClone = "true";
    lastClone.dataset.bannerClone = "true";
    firstClone.classList.add("banner-slide--clone");
    lastClone.classList.add("banner-slide--clone");
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    firstClone.inert = true;
    lastClone.inert = true;
    bannerTrack.prepend(lastClone);
    bannerTrack.append(firstClone);
    bannerAllSlides = [...bannerTrack.children];

    bannerAllSlides.forEach((slide) => {
      slide.querySelectorAll("img").forEach((image) => {
        image.draggable = false;
      });
    });

    setActiveBannerSlide(0);
    window.requestAnimationFrame(() => {
      bannerPhysicalIndex = 1;
      bannerViewport.scrollTo({ left: bannerViewport.clientWidth, behavior: "auto" });
      scheduleBannerAutoplay();
    });

    bannerViewport.addEventListener("scroll", () => {
      if (!bannerScrollFrame) {
        bannerScrollFrame = true;
        window.requestAnimationFrame(syncBannerSlideFromScroll);
      }

      window.clearTimeout(bannerScrollEndTimer);
      bannerScrollEndTimer = window.setTimeout(finishBannerMovement, 220);
    }, { passive: true });

    if ("onscrollend" in bannerViewport) {
      bannerViewport.addEventListener("scrollend", finishBannerMovement, { passive: true });
    }

    bannerDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        scrollToBannerSlide(Number(dot.dataset.bannerDot));
        window.setTimeout(() => dot.blur(), 0);
      });
    });

    bannerSlider.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "PageDown", "ArrowLeft", "PageUp", "Home", "End"].includes(event.key)) return;

      event.preventDefault();
      if (event.key === "Home") {
        scrollToBannerSlide(0);
      } else if (event.key === "End") {
        scrollToBannerSlide(bannerSlides.length - 1);
      } else {
        const direction = event.key === "ArrowRight" || event.key === "PageDown" ? 1 : -1;
        scrollToBannerSlide(activeBannerIndex + direction);
      }
    });

    bannerSlider.addEventListener("pointerenter", () => {
      bannerPointerInside = true;
      clearBannerAutoplay();
    });
    bannerSlider.addEventListener("pointerleave", () => {
      bannerPointerInside = false;
      scheduleBannerAutoplay();
    });
    bannerSlider.addEventListener("focusin", () => {
      bannerHasFocus = true;
      clearBannerAutoplay();
    });
    bannerSlider.addEventListener("focusout", () => {
      window.setTimeout(() => {
        bannerHasFocus = bannerSlider.contains(document.activeElement);
        scheduleBannerAutoplay();
      }, 0);
    });

    bannerViewport.addEventListener("pointerdown", (event) => {
      clearBannerAutoplay();
      if (event.pointerType !== "mouse" || event.button !== 0) return;

      bannerIsDragging = true;
      bannerDragMoved = false;
      bannerPointerId = event.pointerId;
      bannerDragStartX = event.clientX;
      bannerDragStartScrollLeft = bannerViewport.scrollLeft;
      bannerViewport.setPointerCapture?.(event.pointerId);
    });

    bannerViewport.addEventListener("pointermove", (event) => {
      if (!bannerIsDragging || event.pointerId !== bannerPointerId) return;

      const distance = event.clientX - bannerDragStartX;
      if (Math.abs(distance) > 4) bannerDragMoved = true;
      if (!bannerDragMoved) return;

      event.preventDefault();
      bannerViewport.classList.add("is-dragging");
      bannerViewport.scrollLeft = bannerDragStartScrollLeft - distance;
    });

    const finishBannerDrag = (event) => {
      if (!bannerIsDragging || event.pointerId !== bannerPointerId) return;

      bannerIsDragging = false;
      bannerPointerId = null;
      bannerViewport.classList.remove("is-dragging");
      if (bannerViewport.hasPointerCapture?.(event.pointerId)) {
        bannerViewport.releasePointerCapture(event.pointerId);
      }

      const slideWidth = Math.max(bannerViewport.clientWidth, 1);
      scrollToBannerPhysicalSlide(Math.round(bannerViewport.scrollLeft / slideWidth));
    };

    bannerViewport.addEventListener("pointerup", finishBannerDrag);
    bannerViewport.addEventListener("pointercancel", finishBannerDrag);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearBannerAutoplay();
      } else {
        scheduleBannerAutoplay();
      }
    });

    const handleBannerMotionPreference = () => scheduleBannerAutoplay();
    if (typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", handleBannerMotionPreference);
    } else {
      reduceMotion.addListener(handleBannerMotionPreference);
    }

    window.addEventListener("resize", () => {
      bannerIsTransitioning = false;
      bannerQueuedIndex = null;
      bannerPhysicalIndex = activeBannerIndex + 1;
      bannerViewport.scrollTo({
        left: bannerViewport.clientWidth * bannerPhysicalIndex,
        behavior: "auto"
      });
      scheduleBannerAutoplay();
    });
  };

  /* Guided navigation through each section title frame */
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

  heroScrollCue?.addEventListener("click", (event) => {
    startGuidedSectionScroll(event, "about-me", "about-content");
  });

  const cancelGuidedHeroScroll = () => {
    guidedHeroScrollId += 1;
  };

  window.addEventListener("wheel", cancelGuidedHeroScroll, { passive: true });
  window.addEventListener("touchstart", cancelGuidedHeroScroll, { passive: true });

  submenuToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.closest(".menu-panel__group");
      const willExpand = !group.classList.contains("is-expanded");

      document.querySelectorAll(".menu-panel__group.is-expanded").forEach((openGroup) => {
        openGroup.classList.remove("is-expanded");
        openGroup.querySelector("[data-submenu-toggle]")?.setAttribute("aria-expanded", "false");
      });

      group.classList.toggle("is-expanded", willExpand);
      toggle.setAttribute("aria-expanded", String(willExpand));
    });
  });

  const scrollMenuSectionToTitle = (event, link) => {
    const introId = link.dataset.navIntro;
    const contentId = link.dataset.navContent;
    if (!introId || !contentId) return false;
    return startGuidedSectionScroll(event, introId, contentId, NAV_SECTION_TITLE_HOLD_MS);
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

  menuLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (scrollMenuSectionToTitle(event, link)) {
        window.setTimeout(() => link.blur(), 0);
        return;
      }

      document.querySelectorAll(".menu-panel__group.is-expanded").forEach((group) => {
        group.classList.remove("is-expanded");
        group.querySelector("[data-submenu-toggle]")?.setAttribute("aria-expanded", "false");
      });
      window.setTimeout(() => link.blur(), 0);
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".site-header__menu")) return;

    submenuToggles.forEach((toggle) => {
      toggle.closest(".menu-panel__group")?.classList.remove("is-expanded");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  setupPopupGallery();
  setupPosterSection();
  setupBannerSlider();
  setupAboutReveal();
  setupDetailCardStateReset();
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
