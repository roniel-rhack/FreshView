class Video {
    constructor(element) {
        this.element = element;
        this.hidden = false;
    }

    deriveURL() {
        const link = this.element.querySelector('a[href*="/watch?"]');
        if (!link) return undefined;
        try {
            const url = new URL(link.getAttribute("href"), "https://www.youtube.com");
            if (!Path.supported(url.href) || url.pathname !== "/watch") return undefined;
            const id = url.searchParams.get("v");
            return id && /^[\w-]+$/.test(id) ? id : undefined;
        } catch (_) {
            return undefined;
        }
    }

    getID() { return this.element; }

    getViewed(threshold) {
        if (!this.deriveURL()) return false;
        const bar = this.element.querySelector(Video.PROGRESS_SELECTOR);
        const width = bar?.style.width || "";
        if (!/^\d+(?:\.\d+)?%$/.test(width)) return false;
        const progress = Number.parseFloat(width);
        return progress <= 100 && progress >= threshold;
    }

    hide() {
        if (!this.hidden) {
            this.display = this.element.style.getPropertyValue("display");
            this.priority = this.element.style.getPropertyPriority("display");
            this.hidden = true;
        }
        if (this.element.style.display !== "none") this.element.style.setProperty("display", "none", "important");
    }

    show() {
        if (!this.hidden) return;
        // Do not overwrite a new display value supplied by the host page.
        if (this.element.style.display === "none") {
            if (this.display) this.element.style.setProperty("display", this.display, this.priority);
            else this.element.style.removeProperty("display");
        }
        this.hidden = false;
    }
}

Video.PROGRESS_SELECTOR = [
    ".ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment",
    "ytd-thumbnail-overlay-resume-playback-renderer #progress",
    "#progress.ytd-thumbnail-overlay-resume-playback-renderer"
].join(",");
