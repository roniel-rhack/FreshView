// Each DOM card is independent, even when several cards show the same video.
class Album {
    constructor(videos = []) {
        this.videos = new Map();
        videos.forEach(video => this.add(video));
    }

    add(video) {
        if (!this.videos.has(video.element)) this.videos.set(video.element, video);
    }

    update(video) {
        this.add(video);
    }

    remove(element) {
        const video = this.videos.get(element);
        if (video) video.show();
        this.videos.delete(element);
    }

    clear() {
        this.videos.forEach(video => video.show());
        this.videos.clear();
    }

    equals(that) {
        return this.getSize() === that.getSize() && this.getIDs().every(id => that.videos.has(id));
    }

    merge(that) {
        for (const element of this.videos.keys()) {
            if (!that.videos.has(element)) this.remove(element);
        }
        that.videos.forEach(video => this.add(video));
    }

    getIDs() { return Array.from(this.videos.keys()); }
    getVideos() { return Array.from(this.videos.values()); }
    getSize() { return this.videos.size; }
}
