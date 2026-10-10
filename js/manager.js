class Manager {
    constructor() {
        this.album = new Album();
        this.settings = new Settings();
        this.settingsLoaded = false;
        this.pollCount = 0;
        this.pending = new Set();
        this.fullScan = false;
        this.timer = null;
        this.observer = new MutationObserver(records => this.onMutations(records));
        this.settings.load(() => {
            this.settingsLoaded = true;
            this.observer.observe(document, {
                childList: true, subtree: true, attributes: true,
                attributeFilter: ["style", "href", "class", "hidden", "is-history", "is-shorts", "is-ad", "page-subtype"]
            });
            this.request();
        });
    }

    active() {
        return this.settingsLoaded && this.settings.hidden() && !this.settings.ignored();
    }

    onMutations(records) {
        if (!this.active()) return;
        for (const record of records) {
            const target = record.target;
            if (record.type === "attributes") {
                if (record.attributeName === "style" && !target.matches(Video.PROGRESS_SELECTOR)) {
                    // Ignore our own hide writes, but recheck host visibility changes.
                    if (this.album.videos.has(target) && target.style.display !== "none") this.pending.add(target);
                    continue;
                }
                if (target.matches('ytd-browse, ytd-search, ytd-watch-flexy') && record.attributeName !== "style") {
                    this.request();
                    continue;
                }
                const card = Extractor.card(target);
                if (card) this.pending.add(card);
            } else {
                const card = Extractor.card(target);
                if (card) this.pending.add(card);
                for (const node of record.addedNodes) {
                    if (node instanceof Element && !card) {
                        Extractor.candidates(node).forEach(candidate => this.pending.add(candidate));
                    }
                }
                for (const node of record.removedNodes) {
                    if (!(node instanceof Element)) continue;
                    if (this.album.videos.has(node)) this.pending.add(node);
                    node.querySelectorAll(VIDEO_CARD_SELECTOR).forEach(element => {
                        if (this.album.videos.has(element)) this.pending.add(element);
                    });
                }
            }
        }
        if (this.pending.size) this.request(false);
    }

    request(full = true) {
        if (!this.settingsLoaded) return;
        this.fullScan ||= full;
        if (this.timer !== null) return;
        this.timer = setTimeout(() => {
            try {
                this.poll();
            } catch (error) {
                this.fullScan = true;
                Logger.error("FreshView could not update video visibility.", error);
            } finally {
                this.timer = null;
            }
        }, BATCH_TIME_MILLISECONDS);
    }

    poll() {
        this.pollCount++;
        const full = this.fullScan;
        this.fullScan = false;
        const pending = this.pending;
        this.pending = new Set();
        if (!this.active()) {
            this.album.clear();
            return;
        }
        const path = Path.pathname(window.location.href);
        const threshold = this.settings.threshold();
        if (full) {
            this.album.merge(this.extract(path));
            this.display();
        } else {
            for (const element of pending) {
                if (!element.isConnected || Extractor.card(element) !== element ||
                    !Extractor.eligible(element, this.settings.state, path)) {
                    this.album.remove(element);
                    continue;
                }
                const video = this.album.videos.get(element) || new Video(element);
                if (video.getViewed(threshold)) {
                    this.album.add(video);
                    video.hide();
                } else {
                    this.album.remove(element);
                }
            }
        }
        if (window.FRESHVIEW_DEBUG) console.debug("[FreshView] Poll", {full, checked: pending.size, hidden: this.album.getSize()});
    }

    display() {
        if (!this.active()) this.album.clear();
        else this.album.videos.forEach(video => video.hide());
    }

    extract(path) {
        if (!this.active()) return new Album();
        return new Album(new Extractor().extract(document, this.settings.threshold(), this.settings.state, path, this.album.videos));
    }

    dispose() {
        this.observer.disconnect();
        clearTimeout(this.timer);
        this.timer = null;
        this.pending.clear();
        this.album.clear();
    }
}
