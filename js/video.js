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

    getAge() {
        if (!this.deriveURL()) return undefined;
        for (const element of [...this.element.querySelectorAll(Video.AGE_SELECTOR), this.element]) {
            const match = Video.AGE_PATTERN.exec(element.textContent);
            if (match) return Number(match[1]) * AGE_UNIT_HOURS[Video.ageUnit(match[2])];
        }
        return undefined;
    }

    static ageUnit(text) {
        const unit = text.toLowerCase();
        if (unit.startsWith("mo")) return "month";
        return {s: "second", m: "minute", h: "hour", d: "day", w: "week", y: "year"}[unit[0]];
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

Video.AGE_SELECTOR = [
    "#metadata-line", "#video-info", "ytd-video-meta-block", "yt-content-metadata-view-model"
].join(",");

Video.AGE_PATTERN = /(?<![\d.,])(\d+)\s*(years?|yrs?|y|months?|mos?|weeks?|wks?|w|days?|d|hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\s+ago/i;
