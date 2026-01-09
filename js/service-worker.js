// Service Worker for FreshView (Manifest V3)
// Combines constants, storage utilities, and background event handlers
// -----------------------------------------------------------------------------

// Constants needed by the service worker
const HIDE_VIDEOS_CHECKBOX_STORAGE_KEY = "hide-videos-checkbox-state";
const HIDE_VIDEOS_CHECKBOX_DEFAULT_STATE = false;
const VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY = "view-threshold-checkbox-state";
const VIEW_THRESHOLD_CHECKBOX_DEFAULT_STATE = true;
const URL_CHANGE_MESSAGE = "url-change";
const PAGE_FILTER_QUERY_MESSAGE = "page-filter-query";

// -----------------------------------------------------------------------------
// Storage class (simplified for service worker - no Logger dependency)

class Storage {
    static get(items, callback) {
        const decorator = (contents) => {
            if (chrome.runtime.lastError) {
                console.error(`Storage.get(): failed to get items: ${chrome.runtime.lastError.message}.`);
            } else {
                const values = {};
                for (const [key, value] of Object.entries(items)) {
                    values[key] = contents.hasOwnProperty(key) ? contents[key] : value;
                }
                callback(values);
            }
        }
        chrome.storage.local.get(Object.keys(items), decorator);
    }

    static set(items, callback) {
        const decorator = () => {
            if (chrome.runtime.lastError) {
                console.error(`Storage.set(): failed to set items: ${chrome.runtime.lastError.message}.`);
            } else if (callback !== undefined) {
                callback();
            }
        }
        chrome.storage.local.set(items, decorator);
    }
}

// -----------------------------------------------------------------------------
// Event handlers

/**
 * Processes keyboard shortcuts by modifying browser storage.
 */
function onCommandListener(command) {
    const toggleStateInBrowserStorage = (key, fallback) => {
        Storage.get({[key]: fallback}, values => Storage.set({[key]: !values[key]}));
    }

    if (command === "toggle-hide-videos-checkbox") {
        toggleStateInBrowserStorage(
            HIDE_VIDEOS_CHECKBOX_STORAGE_KEY,
            HIDE_VIDEOS_CHECKBOX_DEFAULT_STATE
        );
    } else if (command === "toggle-view-threshold-checkbox") {
        toggleStateInBrowserStorage(
            VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY,
            VIEW_THRESHOLD_CHECKBOX_DEFAULT_STATE
        );
    }
}

/**
 * Sends a message to a content script when the URL of its YouTube page changes.
 */
function onTabUpdatedListener(tabID, changes, _) {
    if (changes.url) {
        chrome.tabs.sendMessage(tabID, {"message": URL_CHANGE_MESSAGE});
    }
}

// -----------------------------------------------------------------------------
// Register event listeners

chrome.commands.onCommand.addListener(onCommandListener);
chrome.tabs.onUpdated.addListener(onTabUpdatedListener);

// Note: chrome.pageAction has been removed in MV3.
// The action (toolbar icon) is always visible when the extension is enabled,
// so we no longer need to handle "showPageAction" messages.
