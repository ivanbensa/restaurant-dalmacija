(() => {
    "use strict";

    const content = document.getElementById("menuContent");
    const categoryBar = document.getElementById("menuCategories");
    const stickyBar = categoryBar.closest(".menu-categories-section");
    const i18n = window.DalmacijaI18n;
    let data;
    let initialized = false;
    let observer;
    let sections = [];
    let categoryLinks = [];
    let activeId;
    let scrollOffset = 96;
    let resizeFrame;
    let scrollFrame;

    function getTranslation(value) {
        if (typeof value === "string") return value;
        return value?.[i18n.getLanguage()] || value?.de || "";
    }

    // A single request is shared with initialization; language changes use memory.
    const dataPromise = fetch("data/food.json")
        .then((response) => {
            if (!response.ok) throw new Error("Menu request failed");
            return response.json();
        })
        .then((value) => ({ value }), () => ({ failed: true }));

    function setActiveCategory(id, center = true) {
        if (id === activeId) return;
        activeId = id;
        for (const link of categoryLinks) {
            const selected = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("active", selected);
            if (selected) {
                link.setAttribute("aria-current", "location");
                if (center) {
                    const linkRect = link.getBoundingClientRect();
                    const barRect = categoryBar.getBoundingClientRect();
                    // Scroll only the horizontal list, never its page ancestors.
                    categoryBar.scrollTo({
                        left: categoryBar.scrollLeft + linkRect.left - barRect.left
                            - (categoryBar.clientWidth - linkRect.width) / 2,
                        behavior: "instant"
                    });
                }
            } else {
                link.removeAttribute("aria-current");
            }
        }
    }

    function updateActiveCategory() {
        if (!sections.length) return;
        let current = sections[0];
        for (const section of sections) {
            if (section.getBoundingClientRect().top > scrollOffset + 2) break;
            current = section;
        }
        setActiveCategory(current.id);
    }

    function observeCategories() {
        observer?.disconnect();
        const stickyTop = Number.parseFloat(getComputedStyle(stickyBar).top) || 0;
        scrollOffset = Math.ceil(stickyBar.getBoundingClientRect().height + stickyTop + 16);
        document.documentElement.style.setProperty("--category-scroll-offset", `${scrollOffset}px`);

        if ("IntersectionObserver" in window) {
            // Pixel margins keep the tracking line below the bar on every viewport.
            const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
            const top = Math.min(scrollOffset, Math.max(0, viewportHeight - 2));
            const bottom = Math.max(0, viewportHeight - top - 2);
            observer = new IntersectionObserver(updateActiveCategory, {
                rootMargin: `-${top}px 0px -${bottom}px 0px`,
                threshold: 0
            });
            sections.forEach((section) => observer.observe(section));
        }
        updateActiveCategory();
    }

    function scheduleActiveCategory() {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(() => {
            scrollFrame = null;
            updateActiveCategory();
        });
    }

    function scheduleObservation() {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(observeCategories);
    }

    function renderCategories(categories, target) {
        categories.forEach((category) => {
            const link = document.createElement("a");
            link.href = `#${category.id}`;
            link.className = "menu-category-link";
            link.textContent = getTranslation(category.name);
            link.addEventListener("click", () => setActiveCategory(category.id));
            target.append(link);
        });
    }

    function render() {
        const focusedCategory = categoryBar.contains(document.activeElement)
            ? document.activeElement.getAttribute("href") : null;
        const links = document.createDocumentFragment();
        const items = document.createDocumentFragment();
        if (data) {
            renderCategories(data.categories, links);
            renderMenu(data.categories, items);
            renderMenuNotes(data.notes, items);
        } else {
            const error = document.createElement("p");
            error.setAttribute("role", "alert");
            const translated = i18n.t("menuPage.error");
            error.textContent = translated && translated !== "menuPage.error"
                ? translated : "Die Speisekarte konnte nicht geladen werden. Bitte versuchen Sie es später erneut.";
            items.append(error);
        }

        observer?.disconnect();
        categoryBar.replaceChildren(links);
        content.replaceChildren(items);
        sections = [...content.querySelectorAll(".menu-category")];
        categoryLinks = [...categoryBar.querySelectorAll(".menu-category-link")];
        activeId = null;
        observeCategories();
        if (focusedCategory) {
            categoryLinks.find((link) => link.getAttribute("href") === focusedCategory)
                ?.focus({ preventScroll: true });
        }
    }

    window.addEventListener("languageChanged", () => {
        // The initial language event occurs before ready resolves.
        if (initialized) render();
    });

    Promise.all([i18n.ready, dataPromise]).then(([, result]) => {
        data = result.value;
        initialized = true;
        render();
        window.addEventListener("resize", scheduleObservation, { passive: true });
        if ("ResizeObserver" in window) {
            new ResizeObserver(scheduleObservation).observe(stickyBar);
        }
        // Smooth scrolling can settle between observer thresholds at fractional pixels.
        // Track the final scroll position as well, at most once per animation frame.
        window.addEventListener("scroll", scheduleActiveCategory, { passive: true });
        // Dynamic sections do not exist during the browser's initial anchor jump.
        let hashId;
        try { hashId = decodeURIComponent(window.location.hash.slice(1)); } catch { /* Invalid hash. */ }
        const target = sections.find((section) => section.id === hashId);
        if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
    });

    function renderMenu(categories, target) {
        categories.forEach((category) => {
            const categorySection = document.createElement("section");
            categorySection.classList.add("menu-category");
            categorySection.id = category.id;

            const title = document.createElement("h2");
            title.classList.add("menu-category-title");
            title.textContent = getTranslation(category.name);

            categorySection.append(title);

            category.items.forEach((item) => {
                const menuItem = createMenuItem(item);
                categorySection.append(menuItem);
            });

            target.append(categorySection);
        });
    }

    function createMenuItem(item) {
        const article = document.createElement("article");
        article.classList.add("menu-item");

        const row = document.createElement("div");
        row.classList.add("menu-item-row");

        const info = document.createElement("div");
        info.classList.add("menu-item-info");

        const name = document.createElement("h3");
        name.classList.add("menu-item-name");
        name.textContent = `${item.id}. ${getTranslation(item.name)}`;

        info.append(name);

        const translatedDescription = getTranslation(item.description);

        if (translatedDescription) {
            const description = document.createElement("p");
            description.classList.add("menu-item-description");
            description.textContent = translatedDescription;

            info.append(description);
        }

        if (item.allergens.length > 0) {
            const allergens = document.createElement("span");
            allergens.classList.add("menu-item-allergens");
            allergens.textContent = item.allergens.join(", ");

            info.append(allergens);
        }

        const price = document.createElement("span");
        price.classList.add("menu-item-price");
        price.textContent = `${item.price.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} €`;

        row.append(info, price);
        article.append(row);

        return article;
    }

    function renderMenuNotes(notes, target) {
        const notesSection = document.createElement("section");
        notesSection.classList.add("menu-notes");

        const title = document.createElement("h2");
        title.classList.add("menu-notes-title");
        title.textContent = getTranslation(notes.title);

        const priceNote = document.createElement("p");
        priceNote.classList.add("menu-price-note");
        priceNote.textContent = getTranslation(notes.priceNote);

        const notesGrid = document.createElement("div");
        notesGrid.classList.add("menu-notes-grid");


        // ZUSATZSTOFFE
        const additivesSection = document.createElement("div");

        const additivesTitle = document.createElement("h3");
        additivesTitle.textContent = getTranslation(notes.additivesTitle);

        const additivesList = document.createElement("ul");

        Object.entries(notes.additives).forEach(([code, description]) => {
            const item = document.createElement("li");

            item.textContent = `${code}) ${getTranslation(description)}`;

            additivesList.append(item);
        });

        additivesSection.append(additivesTitle, additivesList);


        // ALLERGENE
        const allergensSection = document.createElement("div");

        const allergensTitle = document.createElement("h3");
        allergensTitle.textContent = getTranslation(notes.allergensTitle);

        const allergensList = document.createElement("ul");

        Object.entries(notes.allergens).forEach(([code, description]) => {
            const item = document.createElement("li");

            item.textContent = `${code}) ${getTranslation(description)}`;

            allergensList.append(item);
        });

        allergensSection.append(allergensTitle, allergensList);


        notesGrid.append(additivesSection, allergensSection);

        notesSection.append(title, priceNote, notesGrid);

        target.append(notesSection);
    }
})();
