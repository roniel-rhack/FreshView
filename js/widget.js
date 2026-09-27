class Widget {
    constructor(element_id, storage_keys, fallback) {
        this.element = document.getElementById(element_id);
        if (!this.element) throw new Error(`Missing widget: ${element_id}`);
        this.storage_keys = storage_keys;
        this.fallback = fallback;
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === "local" && this.storage_keys.some(key => Object.hasOwn(changes, key))) this.load();
        });
    }
}

class Checkbox extends Widget {
    constructor(element_id, storage_key, fallback) {
        super(element_id, [storage_key], fallback);
        this.storage_key = storage_key;
        this.load();
        this.element.addEventListener("change", () => this.save());
    }
    load() { Storage.get({[this.storage_key]: this.fallback}, values => this.onLoad(values)); }
    onLoad(values) { this.element.checked = values[this.storage_key]; }
    save() { Storage.set({[this.storage_key]: this.element.checked}); }
}

class DarkModeCheckbox extends Checkbox {
    constructor() { super("dark-mode-checkbox", DARK_MODE_CHECKBOX_STORAGE_KEY, DARK_MODE_CHECKBOX_DEFAULT_STATE); }
    onLoad(values) {
        super.onLoad(values);
        setCSSTheme(values[DARK_MODE_CHECKBOX_STORAGE_KEY]);
    }
}

function setCSSTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

class HideVideosCheckbox extends Widget {
    constructor() {
        super("hide-videos-checkbox", Object.keys(SETTINGS_DEFAULT_STATE), HIDE_VIDEOS_CHECKBOX_DEFAULT_STATE);
        this.generation = 0;
        this.load();
        this.element.addEventListener("change", () => this.save());
    }

    load() {
        const generation = ++this.generation;
        this.element.disabled = true;
        const bookmark = document.getElementById("hide-videos-bookmark");
        bookmark.disabled = true;
        Storage.get(SETTINGS_DEFAULT_STATE, values => {
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                const error = chrome.runtime.lastError;
                if (generation !== this.generation) return;
                const tab = tabs?.[0];
                if (error || !Path.supported(tab?.url)) {
                    this.element.checked = false;
                    this.status("Open a YouTube page to hide videos.");
                    return;
                }
                chrome.tabs.sendMessage(tab.id, {message: PAGE_FILTER_QUERY_MESSAGE}, ignored => {
                    const error = chrome.runtime.lastError;
                    if (generation !== this.generation) return;
                    if (error || typeof ignored !== "boolean") {
                        this.element.checked = false;
                        this.status("Refresh this YouTube page to connect FreshView.");
                        return;
                    }
                    const page = Path.parse(tab.url);
                    const bookmarks = values[HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY];
                    const locked = Object.hasOwn(bookmarks, page);
                    this.element.checked = !ignored && (locked ? bookmarks[page] : values[HIDE_VIDEOS_CHECKBOX_STORAGE_KEY]);
                    this.element.disabled = ignored || locked;
                    bookmark.disabled = false;
                    this.status(ignored ? "Filtering is disabled for this page in Options." : locked ? "Unlock this page to change Hide Videos." : "");
                });
            });
        });
    }

    status(message) {
        const status = document.getElementById("page-status");
        status.textContent = message;
        status.hidden = !message;
    }

    save() {
        if (!this.element.disabled) Storage.set({[HIDE_VIDEOS_CHECKBOX_STORAGE_KEY]: this.element.checked});
    }
}

class HideVideosBookmark extends Widget {
    constructor() {
        super("hide-videos-bookmark", [HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY], HIDE_VIDEOS_BOOKMARKS_DEFAULT_STATE);
        this.load();
        this.element.addEventListener("change", () => this.save());
    }
    load() {
        Storage.get({[HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY]: this.fallback}, values => {
            Path.get(page => { this.element.checked = page !== undefined && Object.hasOwn(values[HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY], page); });
        });
    }
    save() {
        if (this.element.disabled) return;
        const checked = this.element.checked;
        Storage.get({
            [HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY]: this.fallback,
            [HIDE_VIDEOS_CHECKBOX_STORAGE_KEY]: HIDE_VIDEOS_CHECKBOX_DEFAULT_STATE
        }, values => Path.get(page => {
            if (page === undefined) return;
            const bookmarks = values[HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY];
            if (checked) bookmarks[page] = values[HIDE_VIDEOS_CHECKBOX_STORAGE_KEY];
            else delete bookmarks[page];
            Storage.set({[HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY]: bookmarks});
        }));
    }
}

class ViewThresholdCheckbox extends Checkbox {
    constructor() { super("view-threshold-checkbox", VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY, VIEW_THRESHOLD_CHECKBOX_DEFAULT_STATE); }
}

class ViewThresholdSlider extends Widget {
    constructor() {
        super("view-threshold-slider", [VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY, VIEW_THRESHOLD_SLIDER_STORAGE_KEY], VIEW_THRESHOLD_SLIDER_DEFAULT_STATE);
        this.load();
        this.element.addEventListener("input", () => this.render());
        // Commit once the interaction finishes, including keyboard adjustments.
        this.element.addEventListener("change", () => this.save());
    }
    load() {
        Storage.get({
            [VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY]: VIEW_THRESHOLD_CHECKBOX_DEFAULT_STATE,
            [VIEW_THRESHOLD_SLIDER_STORAGE_KEY]: this.fallback
        }, values => {
            this.element.value = values[VIEW_THRESHOLD_SLIDER_STORAGE_KEY];
            this.element.disabled = !values[VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY];
            this.render();
        });
    }
    render() {
        const width = this.element.clientWidth;
        const thumb = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--thumb-size"), 10);
        document.documentElement.style.setProperty("--thumb-translation", `${Math.ceil((1 - (this.element.value - 1) / 99) * (width - thumb))}px`);
        const label = document.getElementById("view-threshold-percent");
        const value = this.element.disabled ? 100 : this.element.value;
        label.textContent = `${value}%`;
        this.element.setAttribute("aria-valuetext", `${value}% watched`);
    }
    save() { Storage.set({[VIEW_THRESHOLD_SLIDER_STORAGE_KEY]: Number(this.element.value)}); }
}
