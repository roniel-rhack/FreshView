const VIDEO_CARD_SELECTOR = [
    "ytd-rich-item-renderer", "ytd-grid-video-renderer", "ytd-video-renderer",
    "ytd-compact-video-renderer", "ytd-playlist-video-renderer",
    "ytd-playlist-panel-video-renderer", "yt-lockup-view-model"
].join(",");

class Extractor {
    static card(element) {
        if (!(element instanceof Element)) return null;
        const card = element.closest(VIDEO_CARD_SELECTOR);
        if (!card) return null;
        return card.parentElement?.closest(VIDEO_CARD_SELECTOR) || card;
    }

    static candidates(root) {
        const cards = new Set();
        const parent = Extractor.card(root);
        if (parent) cards.add(parent);
        else if (root.querySelectorAll) {
            root.querySelectorAll(VIDEO_CARD_SELECTOR).forEach(element => cards.add(Extractor.card(element)));
        }
        return cards;
    }

    static eligible(element, state) {
        if (element.matches('[is-shorts], [is-ad]') ||
            element.closest('ytd-ad-slot-renderer, ytd-rich-section-renderer, ytd-reel-shelf-renderer') ||
            element.querySelector('ytd-ad-slot-renderer, ytd-display-ad-renderer, ad-badge-view-model, .yt-badge-shape--ad')) return false;

        const playlist = element.matches('ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer');
        if (playlist) return state[HIDE_PLAYLISTS_CHECKBOX_STORAGE_KEY];

        // Playlist/course summaries link to a starting video; they are not watched cards.
        if (element.querySelector('a[href*="list="], a[href^="/playlist"], a[href^="/shorts/"]')) return false;
        const path = Path.pathname(window.location.href);
        if (element.matches('ytd-compact-video-renderer') ||
            element.closest('#related, #secondary, ytd-watch-next-secondary-results-renderer') ||
            (element.matches('yt-lockup-view-model') && path === "/watch")) {
            return state[HIDE_RECOMMENDATIONS_CHECKBOX_STORAGE_KEY];
        }
        if (path === "/results") return state[HIDE_SEARCHES_CHECKBOX_STORAGE_KEY];
        return true;
    }

    extract(root, threshold, state) {
        return Array.from(Extractor.candidates(root))
            .filter(element => Extractor.eligible(element, state))
            .map(element => new Video(element))
            .filter(video => video.getViewed(threshold));
    }
}

function freshviewDebugDOM() {
    const counts = Object.fromEntries(VIDEO_CARD_SELECTOR.split(",").map(selector =>
        [selector, document.querySelectorAll(selector).length]));
    const result = {counts, progressBars: document.querySelectorAll(Video.PROGRESS_SELECTOR).length};
    console.info("[FreshView] DOM counts", result);
    return result;
}
window.freshviewDebugDOM = freshviewDebugDOM;
