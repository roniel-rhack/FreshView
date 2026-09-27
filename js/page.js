function isChannelPage(_, path) {
    return /^\/(?:@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)(?:\/|$)/.test(Path.pathname(path));
}
function isHomePage(_, path) { return Path.pathname(path) === "/"; }
function isExplorePage(_, path) { return /^\/feed\/(?:explore|trending)(?:\/|$)/.test(Path.pathname(path)); }
function isLibraryPage(_, path) { return /^\/feed\/(?:library|you|playlists)(?:\/|$)/.test(Path.pathname(path)); }
function isHistoryPage(_, path) { return Path.pathname(path) === "/feed/history"; }
function isSubscriptionsPage(_, path) { return Path.pathname(path) === "/feed/subscriptions"; }
