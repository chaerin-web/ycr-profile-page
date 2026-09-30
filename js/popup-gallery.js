(() => {
  const core = window.PortfolioCore || {};
  const reduceMotion = core.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");
  const lenis = core.lenis || null;
  const popupMarquee = document.querySelector("[data-popup-marquee]");
  const popupTrack = document.querySelector("[data-popup-track]");
  const popupList = document.querySelector("[data-popup-list]");
  const popupModal = document.querySelector("[data-popup-modal]");
  const popupModalImage = document.querySelector("[data-popup-modal-image]");
  const popupModalTitle = document.querySelector("[data-popup-modal-title]");
  const popupModalDescription = document.querySelector("[data-popup-modal-description]");
  const popupModalCount = document.querySelector("[data-popup-modal-count]");
  const popupModalClose = document.querySelector("[data-popup-close]");

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
  let popupScrollLockY = 0;

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

  setupPopupGallery();
})();
