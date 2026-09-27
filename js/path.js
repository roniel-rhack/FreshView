class Path {
    static supported(url) {
        try {
            const uri = new URL(url);
            return uri.protocol === "https:" && ["youtube.com", "www.youtube.com"].includes(uri.hostname);
        } catch (_) {
            return false;
        }
    }

    static parse(url) {
        try {
            const uri = new URL(url);
            return uri.pathname + uri.search;
        } catch (_) {
            return undefined;
        }
    }

    static pathname(path) {
        try { return new URL(path, "https://www.youtube.com").pathname; }
        catch (_) { return ""; }
    }

    static get(callback) {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            if (chrome.runtime.lastError || !Path.supported(tabs[0]?.url)) {
                callback(undefined);
                return;
            }
            callback(Path.parse(tabs[0].url));
        });
    }
}
