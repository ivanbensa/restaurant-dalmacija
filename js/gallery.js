(() => {
    const galleryItems = [...document.querySelectorAll(".gallery-item")];
    const modalElement = document.querySelector("#galleryModal");
    const carouselElement = document.querySelector("#galleryCarousel");
    const carouselInner = document.querySelector("#galleryCarouselInner");

    if (!galleryItems.length || !modalElement || !carouselElement || !carouselInner) {
        return;
    }

    const sourceImages = galleryItems.map((item) => item.querySelector("img"));
    const modal = new bootstrap.Modal(modalElement);
    const modalImages = [];
    let carousel = null;
    let returnFocus = null;
    let isSliding = false;
    let pendingOpen = null;

    function syncImageDescriptions() {
        modalImages.forEach((image, index) => {
            image.alt = sourceImages[index].alt;
        });
        window.DalmacijaI18n?.translate(carouselInner);
    }

    function loadNearbyImages(index) {
        [index - 1, index, index + 1].forEach((position) => {
            const imageIndex = (position + sourceImages.length) % sourceImages.length;
            const image = modalImages[imageIndex];

            // Only the active image and its neighbours request a modal source.
            // Mark them eager because hidden carousel slides cannot trigger lazy loading.
            image.loading = "eager";
            if (!image.hasAttribute("src")) {
                image.src = sourceImages[imageIndex].currentSrc || sourceImages[imageIndex].src;
            }
        });
    }

    function buildSlides(initialIndex) {
        const fragment = document.createDocumentFragment();

        sourceImages.forEach((source, index) => {
            const slide = document.createElement("div");
            slide.classList.add("carousel-item");
            slide.classList.toggle("active", index === initialIndex);

            const image = document.createElement("img");
            image.classList.add("gallery-modal-image");
            image.alt = source.alt;
            image.loading = "lazy";
            image.decoding = "async";

            const translationKey = source.getAttribute("data-i18n-alt");
            if (translationKey) {
                image.setAttribute("data-i18n-alt", translationKey);
            }

            modalImages.push(image);
            slide.append(image);
            fragment.append(slide);
        });

        carouselInner.replaceChildren(fragment);
        carousel = new bootstrap.Carousel(carouselElement, {
            interval: false,
            ride: false,
            keyboard: true,
            touch: true
        });
    }

    function openGallery(index, trigger) {
        returnFocus = trigger;

        if (!carousel) {
            buildSlides(index);
        }

        syncImageDescriptions();
        loadNearbyImages(index);

        // A visitor can close the modal before a slide transition has finished.
        // Wait for that transition before selecting a different thumbnail.
        if (isSliding) {
            pendingOpen = { index, trigger };
            return;
        }

        // Select via Bootstrap's public API without animating the hidden carousel.
        const hasSlideAnimation = carouselElement.classList.contains("slide");
        carouselElement.classList.remove("slide");
        carousel.to(index);
        if (hasSlideAnimation) {
            carouselElement.classList.add("slide");
        }

        modal.show(trigger);
    }

    carouselElement.addEventListener("slide.bs.carousel", (event) => {
        isSliding = true;
        loadNearbyImages(event.to);
    });

    carouselElement.addEventListener("slid.bs.carousel", () => {
        isSliding = false;
        if (pendingOpen) {
            const { index, trigger } = pendingOpen;
            pendingOpen = null;
            openGallery(index, trigger);
        }
    });

    modalElement.addEventListener("shown.bs.modal", () => {
        modalElement.querySelector(".gallery-modal-close")?.focus();
    });

    modalElement.addEventListener("hidden.bs.modal", () => {
        if (returnFocus?.isConnected) {
            returnFocus.focus({ preventScroll: true });
        }
    });

    modalElement.addEventListener("keydown", (event) => {
        // Bootstrap already handles arrow keys bubbling through the carousel.
        // This fallback covers focus on the modal itself or its close button.
        if (event.defaultPrevented || !carousel || !modalElement.classList.contains("show")) {
            return;
        }
        if (event.target.closest("input, textarea, select, [contenteditable='true']")) {
            return;
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            if (event.key === "ArrowLeft") {
                carousel.prev();
            } else {
                carousel.next();
            }
        }
    });

    galleryItems.forEach((item, index) => {
        item.addEventListener("click", () => openGallery(index, item));
    });

    window.addEventListener("languageChanged", syncImageDescriptions);
})();
