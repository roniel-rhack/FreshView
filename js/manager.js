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
        let removed = false;
        for (const record of records) {
            const target = record.target;
            if (record.type === "attributes") {
                // Card display writes are ours; progress styles are the host's.
                if (record.attributeName === "style" && !target.matches(Video.PROGRESS_SELECTOR)) continue;
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
                removed ||= Array.from(record.removedNodes).some(node =>
                    node instanceof Element && (node.matches(VIDEO_CARD_SELECTOR) || node.querySelector(VIDEO_CARD_SELECTOR)));
            }
        }
        if (this.pending.size || removed) this.request(false);
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
        if (full) {
            this.album.merge(this.extract());
        } else {
            for (const element of this.album.videos.keys()) {
                if (!element.isConnected) this.album.remove(element);
            }
            for (const element of pending) {
                const video = this.album.videos.get(element) || new Video(element);
                if (element.isConnected && Extractor.eligible(element, this.settings.state) && video.getViewed(this.settings.threshold())) {
                    this.album.add(video);
                } else {
                    this.album.remove(element);
                }
            }
        }
        this.display();
        if (window.FRESHVIEW_DEBUG) console.debug("[FreshView] Poll", {full, checked: pending.size, hidden: this.album.getSize()});
    }

    display() {
        if (!this.active()) this.album.clear();
        else this.album.videos.forEach(video => video.hide());
    }

    extract() {
        if (!this.active()) return new Album();
        return new Album(new Extractor().extract(document, this.settings.threshold(), this.settings.state));
    }

    dispose() {
        this.observer.disconnect();
        clearTimeout(this.timer);
        this.timer = null;
        this.pending.clear();
        this.album.clear();
    }
}
