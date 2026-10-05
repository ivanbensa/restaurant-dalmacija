(() => {
    "use strict";

    const supportedLanguages = ["de", "hr", "en"];
    const languageNames = { de: "Deutsch", hr: "Hrvatski", en: "English" };
    const localeRequests = new Map();
    const languageButtons = document.querySelectorAll("[data-lang]");
    const languageSwitcherButton = document.querySelector(".language-btn");
    const attributeTranslations = {
        "data-i18n-alt": "alt",
        "data-i18n-aria-label": "aria-label",
        "data-i18n-title": "title",
        "data-i18n-content": "content"
    };

    let currentLanguage = "de";
    let translations = {};
    let germanTranslations = {};
    let requestVersion = 0;
    let finishInitialLoad;
    const ready = new Promise((resolve) => {
        finishInitialLoad = resolve;
    });

    function readSavedLanguage() {
        try {
            const savedLanguage = window.localStorage.getItem("language");
            return supportedLanguages.includes(savedLanguage) ? savedLanguage : "de";
        } catch {
            return "de";
        }
    }

    function saveLanguage(language) {
        try {
            window.localStorage.setItem("language", language);
        } catch {
            // The in-memory selection still works when browser storage is disabled.
        }
    }

    function loadLocale(language) {
        if (!localeRequests.has(language)) {
            const request = fetch(`locales/${language}.json`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Could not load locale: ${language}`);
                    }
                    return response.json();
                })
                .then((locale) => {
                    if (!locale || typeof locale !== "object" || Array.isArray(locale)) {
                        throw new Error(`Invalid locale: ${language}`);
                    }
                    return locale;
                })
                .catch((error) => {
                    // Allow a later selection to retry a temporarily unavailable locale.
                    localeRequests.delete(language);
                    throw error;
                });

            localeRequests.set(language, request);
        }

        return localeRequests.get(language);
    }

    function lookup(locale, key) {
        const value = key.split(".").reduce((object, part) => object?.[part], locale);
        return typeof value === "string" ? value : undefined;
    }

    function t(key) {
        return lookup(translations, key) ?? lookup(germanTranslations, key);
    }

    function forEachMatch(root, selector, callback) {
        if (root.matches?.(selector)) {
            callback(root);
        }
        root.querySelectorAll(selector).forEach(callback);
    }

    function translate(root = document) {
        forEachMatch(root, "[data-i18n]", (element) => {
            const value = t(element.getAttribute("data-i18n"));
            if (value !== undefined) {
                element.textContent = value;
            }
        });

        Object.entries(attributeTranslations).forEach(([source, destination]) => {
            forEachMatch(root, `[${source}]`, (element) => {
                const value = t(element.getAttribute(source));
                if (value !== undefined) {
                    element.setAttribute(destination, value);
                }
            });
        });
    }

    function updateLanguageControls() {
        if (languageSwitcherButton) {
            const flag = languageSwitcherButton.querySelector("img");
            const text = languageSwitcherButton.querySelector("span");
            if (flag) {
                flag.src = `images/flags/${currentLanguage}.svg`;
                flag.alt = "";
            }
            if (text) {
                text.textContent = currentLanguage.toUpperCase();
            }
            const label = t("accessibility.chooseLanguage") || "Sprache wählen";
            languageSwitcherButton.setAttribute(
                "aria-label",
                `${label}: ${languageNames[currentLanguage]}`
            );
        }

        languageButtons.forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.lang === currentLanguage));
            button.setAttribute("lang", button.dataset.lang);
            const flag = button.querySelector("img");
            if (flag) {
                flag.alt = "";
            }
        });
    }

    async function changeLanguage(language) {
        if (!supportedLanguages.includes(language)) {
            return;
        }

        const version = ++requestVersion;
        // Every selected locale has the same German fallback, loaded at most once.
        const [germanResult, selectedResult] = await Promise.allSettled([
            loadLocale("de"),
            loadLocale(language)
        ]);

        // A slow response must never overwrite a newer click or finish its ready state.
        if (version !== requestVersion) {
            return;
        }

        if (germanResult.status === "fulfilled") {
            germanTranslations = germanResult.value;
        }

        if (selectedResult.status === "fulfilled") {
            translations = selectedResult.value;
            currentLanguage = language;
        } else if (germanResult.status === "fulfilled") {
            translations = germanTranslations;
            currentLanguage = "de";
        } else {
            // Preserve the readable HTML/current locale if the network is unavailable.
            updateLanguageControls();
            finishInitialLoad();
            return;
        }

        translate();
        document.documentElement.lang = currentLanguage;
        updateLanguageControls();
        saveLanguage(currentLanguage);
        window.dispatchEvent(new CustomEvent("languageChanged", {
            detail: { language: currentLanguage }
        }));
        finishInitialLoad();
    }

    window.DalmacijaI18n = {
        ready,
        getLanguage: () => currentLanguage,
        t,
        translate
    };

    languageButtons.forEach((button) => {
        button.addEventListener("click", () => changeLanguage(button.dataset.lang));
    });

    changeLanguage(readSavedLanguage());
})();
