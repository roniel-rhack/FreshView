// UI-only localization; filtering never depends on translated text.
const I18n = {
    message(key, substitutions) {
        return chrome.i18n.getMessage(key, substitutions);
    },
    percent(value) {
        return new Intl.NumberFormat(chrome.i18n.getUILanguage(), {
            style: "percent", maximumFractionDigits: 0
        }).format(Number(value) / 100);
    },
    apply() {
        document.documentElement.lang = this.message("uiLanguage");
        document.documentElement.dir = this.message("uiDirection");
        for (const element of document.querySelectorAll("[data-i18n]")) {
            element.textContent = this.message(element.dataset.i18n);
        }
        for (const [attribute, target] of [["data-i18n-aria", "aria-label"], ["data-i18n-title", "title"]]) {
            for (const element of document.querySelectorAll(`[${attribute}]`)) {
                element.setAttribute(target, this.message(element.getAttribute(attribute)));
            }
        }
    }
};
document.addEventListener("DOMContentLoaded", () => I18n.apply());
