// Firefox loads these files through background.scripts; Chromium uses a worker.
if (typeof importScripts === "function") {
    importScripts("constants.js", "logger.js", "storage.js", "path.js");
}

let commandQueue = Promise.resolve();
chrome.commands.onCommand.addListener(command => {
    const keys = {
        "toggle-hide-videos-checkbox": [HIDE_VIDEOS_CHECKBOX_STORAGE_KEY, HIDE_VIDEOS_CHECKBOX_DEFAULT_STATE],
        "toggle-view-threshold-checkbox": [VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY, VIEW_THRESHOLD_CHECKBOX_DEFAULT_STATE]
    };
    const entry = keys[command];
    if (!entry) return;
    commandQueue = commandQueue.then(() => new Promise(resolve => {
        const [key, fallback] = entry;
        Storage.get({[key]: fallback}, values => Storage.set({[key]: !values[key]}, resolve));
    })).catch(() => Logger.error("FreshView could not process a keyboard command."));
});

chrome.tabs.onUpdated.addListener((tabID, changes) => {
    if (!Path.supported(changes.url)) return;
    chrome.tabs.sendMessage(tabID, {message: URL_CHANGE_MESSAGE}, () => {
        // A supported tab may not have a content script yet.
        void chrome.runtime.lastError;
    });
});
