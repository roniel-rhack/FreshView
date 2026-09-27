// These globals belong to the extension's isolated content-script context.
window.FRESHVIEW_DEBUG = false;
const manager = new Manager();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id) return;
    if (request.message === URL_CHANGE_MESSAGE) {
        manager.request();
    } else if (request.message === PAGE_FILTER_QUERY_MESSAGE) {
        manager.settings.load(() => sendResponse(manager.settings.ignored()));
        return true;
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && Object.keys(SETTINGS_DEFAULT_STATE).some(key => Object.hasOwn(changes, key))) {
        manager.settings.load(() => manager.request());
    }
});

// YouTube retains and reuses cards during client-side navigation.
document.addEventListener("yt-navigate-finish", () => manager.request());
window.addEventListener("popstate", () => manager.request());
window.addEventListener("pagehide", event => { if (!event.persisted) manager.dispose(); });
window.addEventListener("pageshow", event => { if (event.persisted) manager.request(); });
