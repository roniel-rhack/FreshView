// Preserve explicit legacy light/dark choices; new installations follow the OS.
const Theme = {
    key: "theme-mode",
    media: matchMedia("(prefers-color-scheme: dark)"),
    mode: "system",
    generation: 0,
    apply() {
        const dark = this.mode === "dark" || (this.mode === "system" && this.media.matches);
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        const select = document.getElementById("theme-mode");
        if (select) select.value = this.mode;
    },
    load() {
        const generation = ++this.generation;
        Storage.get({[this.key]: null, [DARK_MODE_CHECKBOX_STORAGE_KEY]: null}, values => {
            if (generation !== this.generation) return;
            const mode = values[this.key];
            const legacy = values[DARK_MODE_CHECKBOX_STORAGE_KEY];
            this.mode = ["system", "light", "dark"].includes(mode) ? mode
                : typeof legacy === "boolean" ? (legacy ? "dark" : "light") : "system";
            this.apply();
        });
    },
    start() {
        this.load();
        this.media.addEventListener("change", () => this.apply());
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === "local" && (this.key in changes || DARK_MODE_CHECKBOX_STORAGE_KEY in changes)) this.load();
        });
        document.addEventListener("DOMContentLoaded", () => {
            this.apply();
            document.getElementById("theme-mode")?.addEventListener("change", event => {
                const mode = event.target.value;
                if (["system", "light", "dark"].includes(mode)) {
                    Storage.set({[this.key]: mode}, success => {
                        if (!success) this.load();
                    });
                }
            });
        });
    }
};
Theme.start();
