class Storage {
    static normalize(value, fallback) {
        if (typeof fallback === "boolean") return typeof value === "boolean" ? value : fallback;
        if (typeof fallback === "number") {
            const number = typeof value === "number" || (typeof value === "string" && value.trim()) ? Number(value) : NaN;
            return Number.isFinite(number) ? Math.max(1, Math.min(100, Math.round(number))) : fallback;
        }
        if (fallback && typeof fallback === "object") {
            const bookmarks = Object.create(null);
            if (value && typeof value === "object" && !Array.isArray(value)) {
                for (const [key, state] of Object.entries(value)) {
                    if (key.startsWith("/") && typeof state === "boolean") bookmarks[key] = state;
                }
            }
            return bookmarks;
        }
        return value === undefined ? fallback : value;
    }

    static get(items, callback) {
        chrome.storage.local.get(Object.keys(items), contents => {
            const error = chrome.runtime.lastError;
            if (error) Logger.error("FreshView could not read preferences:", error.message);
            const values = {};
            for (const [key, fallback] of Object.entries(items)) {
                values[key] = Storage.normalize(error ? undefined : contents?.[key], fallback);
            }
            callback(values);
        });
    }

    static set(items, callback) {
        chrome.storage.local.set(items, () => {
            const error = chrome.runtime.lastError;
            if (error) Logger.error("FreshView could not save preferences:", error.message);
            if (callback) callback(!error);
        });
    }
}
