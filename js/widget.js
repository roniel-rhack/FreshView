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

class HideVideosCheckbox extends Widget {
    constructor() {
        super("hide-videos-checkbox", Object.keys(SETTINGS_DEFAULT_STATE), HIDE_VIDEOS_CHECKBOX_DEFAULT_STATE);
        this.generation = 0;
        this.load();
        this.element.addEventListener("change", () => this.save());
    }

    load() {
        const generation = ++this.generation;
        const bookmark = document.getElementById("hide-videos-bookmark");
        Storage.get(SETTINGS_DEFAULT_STATE, values => {
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                const error = chrome.runtime.lastError;
                if (generation !== this.generation) return;
                const tab = tabs?.[0];
                if (error || !Path.supported(tab?.url)) {
                    this.element.checked = false;
                    this.element.disabled = bookmark.disabled = true;
                    this.status(I18n.message("openYoutube"));
                    return;
                }
                chrome.tabs.sendMessage(tab.id, {message: PAGE_FILTER_QUERY_MESSAGE}, ignored => {
                    const error = chrome.runtime.lastError;
                    if (generation !== this.generation) return;
                    if (error || typeof ignored !== "boolean") {
                        this.element.checked = false;
                        this.element.disabled = bookmark.disabled = true;
                        this.status(I18n.message("refreshYoutube"));
                        return;
                    }
                    const page = Path.parse(tab.url);
                    const bookmarks = values[HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY];
                    const locked = Object.hasOwn(bookmarks, page);
                    this.element.checked = !ignored && (locked ? bookmarks[page] : values[HIDE_VIDEOS_CHECKBOX_STORAGE_KEY]);
                    this.element.disabled = ignored || locked;
                    bookmark.disabled = false;
                    this.status(ignored ? I18n.message("excludedPage") : locked ? I18n.message(bookmarks[page] ? "lockedOn" : "lockedOff") : "");
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
            Path.get(page => {
                this.element.checked = page !== undefined && Object.hasOwn(values[HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY], page);
                document.getElementById("lock-label").textContent = I18n.message(this.element.checked ? "unlockPage" : "lockPage");
            });
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
            this.element.disabled = !values[VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY];
            this.element.value = this.element.disabled ? 100 : values[VIEW_THRESHOLD_SLIDER_STORAGE_KEY];
            this.render();
        });
    }
    render() {
        const value = this.element.disabled ? 100 : Number(this.element.value);
        const percent = I18n.percent(value);
        document.getElementById("view-threshold-percent").textContent = percent;
        document.getElementById("threshold-help").textContent = this.element.disabled
            ? I18n.message("thresholdOff") : I18n.message("thresholdSummary", percent);
        this.element.setAttribute("aria-valuetext", I18n.message("thresholdAria", I18n.percent(this.element.value)));
    }

    save() { Storage.set({[VIEW_THRESHOLD_SLIDER_STORAGE_KEY]: Number(this.element.value)}); }
}
