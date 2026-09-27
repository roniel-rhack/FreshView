# Working agreements

- Communicate with the user in Spanish. Write code, comments, documentation, and commit messages in English; preserve the product's English UI.
- Inspect the working tree before editing. Preserve unrelated changes, staged files, local archives, and user data. Do not commit, push, publish, or deploy without the user's authorization.
- Keep changes focused and follow the existing vanilla JavaScript architecture. Do not introduce a framework, bundler, or runtime dependency for routine fixes.
- Complete authorized implementation work through the smallest meaningful verification. Report the result, checks performed, and anything that remains unverified.
- Keep credentials, browsing history, personal URLs, and sensitive configuration out of logs, fixtures, documentation, and commits. Do not add attribution signatures or generated-by notices.

# Project and execution contexts

FreshView for YouTube hides watched video cards using progress indicators present in YouTube's DOM. It does not retrieve account watch history or call a backend. Settings use `chrome.storage.local`.

There is no package manifest, build step, dependency installation, or committed automated test suite. The root directory is the unpacked extension.

- `manifest.json` targets Chromium and defines Manifest V3 permissions, content-script order, popup, options page, and only the background service worker. The Firefox packager replaces it with background scripts derived from the worker's static imports; load that generated ZIP in Firefox. Never put both background types in one manifest. Preserve dependency ordering: `injection.js` initializes classes declared by earlier scripts.
- `js/injection.js` creates the content-script `Manager` and registers message/storage listeners. Content scripts execute in an isolated JavaScript world.
- `js/manager.js` coordinates DOM observation, extraction, album merging, and visibility. `js/extractor.js` owns selectors for video containers.
- `js/video.js` reads video links/progress and controls card visibility. `js/album.js` tracks video wrappers. Album identity is the DOM element, so duplicate videos remain independent and original display styles survive reordering.
- `js/settings.js`, `js/page.js`, and `js/path.js` apply thresholds, page/type filters, and per-page bookmarks. Bookmarks currently use pathname plus query string; changing normalization changes stored-key behavior.
- `js/service-worker.js` handles keyboard commands and tab URL changes. It loads the shared constants, logger, storage, and path helpers through `importScripts` in Chromium; Firefox loads them in manifest order.
- `html/popup.html` and `html/options.html` load their own scripts. `js/widget.js` implements shared controls; `js/popup.js` and `js/options.js` initialize them. HTML script ordering is independent from content-script ordering.
- `js/i18n.js` localizes popup/options only. `_locales/` contains complete catalogs; keep Chinese regional/script aliases in sync and validate placeholders with the packager. Filtering must never depend on translated text.
- `js/theme.js` owns System/Light/Dark appearance. The `theme-mode` preference takes precedence; absent it, preserve a boolean `dark-mode-checkbox-state`, otherwise follow the system.
- `css/` and `fonts/` provide local styles and fonts. `scripts/package.py` defines and validates the distributable file list; `.github/workflows/package.yaml` runs it.

# Behavior and performance safeguards

- Hiding must be reversible after DOM insertion, reordering, node reuse, threshold changes, navigation, and disabling any relevant filter. Preserve each node's original display value. The same video may appear in multiple cards.
- Treat YouTube selectors as external contracts. Verify current DOM samples and maintain fixtures for legacy and modern cards. Do not hide playlist, ad, or Shorts containers just because a descendant happens to match a video link.
- Handle both inserted content and relevant progress/link attribute changes. Avoid reacting to the extension's own visibility writes in a way that creates an observer loop.
- Avoid full-document scans on unrelated mutations or while filtering is disabled/ignored. Coalesce work, keep DOM identity stable, and release references to detached nodes.
- Preserve storage keys, default values, page exclusions, and asynchronous message responses. Validate stored values before using them, and scope storage listeners to the intended storage area.
- Keep background listeners registered at top level so service-worker restarts work. Do not rely on persistent in-memory worker state.
- Keep permissions limited to the required YouTube functionality. Test popup behavior on unsupported tabs before reducing tab permissions.
- Controls must have accessible names, keyboard operation, and visible focus. Keep assets local and compatible with extension CSP.

# Verification

Run syntax and JSON checks from the repository root:

```sh
for file in js/*.js; do node --check "$file" || exit 1; done
python3 scripts/package.py --check
git -c core.whitespace=cr-at-eol diff --check
```

These checks do not prove browser functionality. For behavior changes, load the unpacked extension in a separate browser test profile, reload the extension, and refresh the affected YouTube tabs. Verify:

- Hide on/off, threshold boundaries, absent progress, and late progress updates.
- Home, search, channels, history, subscriptions, playlists, and recommendations, including disabled page/type filters.
- Infinite scrolling, SPA navigation, duplicate videos, reordered/reused cards, and restoration of original display styles.
- Popup, options, keyboard shortcuts, bookmarks, storage updates across tabs, and unsupported tabs.
- Keyboard accessibility, System/Light/Dark appearance, legacy preference fallback, translated text, and narrow settings layouts when changing the UI. Inspect the actual toolbar popup in both browsers: a standalone tab cannot detect Firefox popup auto-sizing failures.

Use disposable fixtures with synthetic video IDs and mocked browser storage for focused regression checks. Local scratch checks belong under the already ignored `private/` directory; do not add them to commits without an explicit request. Keep authenticated live-browser verification distinct from fixture-based checks.

Before releasing, inspect the actual packaged artifact for all manifest, HTML, CSS, image, and font dependencies. Do not advertise Firefox compatibility solely because the extension uses Manifest V3: its background configuration needs separate validation. See `docs/extension-audit-2026-09-27.md` for the historical audit and `docs/verification-2026-09-27.md` for the implementation checks. Keep store availability separate from the development version; publishing and changing a Firefox add-on ID require the maintainer's explicit scope.
