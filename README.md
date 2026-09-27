<h1>
  <img src="img/icon24.png" alt=""/> FreshView for YouTube™
</h1>

Hide watched YouTube video cards to discover fresh content. FreshView reads the watch-progress bars already displayed by YouTube and filters cards locally. It does not retrieve your account history, contact a backend, or send browsing data elsewhere.

This is the maintained fork by [roniel-rhack](https://github.com/roniel-rhack) of [Mandrenkov's original FreshView](https://github.com/Mandrenkov/FreshView).

<p align="center">
  <img src="assets/popups.png" alt="FreshView popup in light and dark themes" width="600"/>
</p>

## Install

**Chrome:** [Install FreshView from the Chrome Web Store](https://chromewebstore.google.com/detail/freshview-for-youtube/glologkcncopfogmaghfgcoloklmella).

Version **3.1.0** was submitted on September 27, 2026 and is **pending Chrome Web Store review**, with automatic publication after approval. The previously published version is **3.0.0**. The packaging workflow does not publish to stores.

**Firefox:** version **3.1.0** was submitted as this fork's first Mozilla Add-ons release on September 27, 2026 and is **awaiting review**. Its [Mozilla Add-ons page](https://addons.mozilla.org/en-US/firefox/addon/freshview-youtube-roniel/) will become publicly available after approval. Other similarly named extensions belong to different maintainers.

### Load the development version

There is no build step or dependency installation for the extension itself.

- **Chrome 121+ / compatible Chromium browsers:** open `chrome://extensions` (or `edge://extensions`), enable Developer mode, choose **Load unpacked**, and select this repository's root directory.
- **Firefox 142+:** open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `manifest.json`. Temporary installation lasts until Firefox restarts. Allow access to YouTube if Firefox requests it.

The manifest uses a service worker in Chromium and background scripts in Firefox. The Firefox add-on ID is `freshview@roniel-rhack.github.io`; preserve it for all future updates. Store packages require Mozilla validation and signing.

After changing or updating the unpacked extension, reload it from the browser's extensions page and refresh open YouTube tabs.

## Use FreshView

1. Open desktop YouTube at `https://www.youtube.com/`.
2. Open the FreshView toolbar popup and enable **Hide Videos**. It is off by default.
3. Set **View Threshold** to the minimum watched percentage. The default is **90%**. Disabling the threshold means only cards marked **100% watched** are hidden.
4. Open **Options** to select page and video-type filters or switch between light and dark themes. History is excluded by default.

The lock control saves the current Hide Videos state for the exact page, including its query string. That saved state overrides the global toggle until the page is unlocked. Page exclusions in Options still take precedence.

Supported filters include Home, channels, Explore/Trending, You/Library, History, subscriptions, search results, playlist video rows, and recommendations. Modern `yt-lockup-view-model` video cards and legacy renderers are supported. Playlist/course summary cards, advertisements, and Shorts are excluded.

The popup explains when the current tab is unsupported, a page is excluded or locked, or YouTube needs to be refreshed. The Options button, switches, lock, and threshold slider support keyboard navigation.

### Limits

- Filtering depends on progress indicators present in YouTube's DOM. A video with no usable progress indicator stays visible, even if you remember watching it.
- YouTube may change its markup or serve different layouts. Report a reproducible case when a supported card stops working.
- Support is scoped to desktop `youtube.com` and `www.youtube.com` over HTTPS. Mobile YouTube, Music, Studio, embedded players, and other subdomains are not filtered.
- The browser's selected theme does not automatically change FreshView's theme; choose it in Options.

## Keyboard shortcuts

Configure shortcuts in your browser's extension-shortcut settings. Chromium exposes these at `chrome://extensions/shortcuts`; Firefox provides **Manage Extension Shortcuts** in the add-ons manager.

- **Toggle Hide Videos** changes the global hiding preference.
- **Toggle View Threshold** switches between the saved percentage and 100%.

A locked page continues using its saved Hide Videos state, and excluded pages remain excluded, even when the global shortcut is used.

## Changes in 3.1.0

- Restore hidden cards correctly after reordering, node reuse, navigation, and filter changes; preserve original display styles.
- Detect modern recommendation cards and late progress/link changes without startup polling timers.
- Process affected cards incrementally, avoid whole-document scans while filtering is off, and prevent visibility writes from causing observer loops.
- Recognize page categories independently of query parameters while preserving existing bookmark keys.
- Validate stored settings, share background constants/storage logic, and handle unsupported tabs safely.
- Remove the broad `tabs` permission; restrict host access to supported desktop YouTube pages.
- Add Firefox background support, keyboard-accessible controls, descriptive labels, and visible focus.
- Commit threshold-slider changes when an interaction finishes rather than writing storage on every movement.
- Validate runtime resources and include local fonts in generated packages.

## Privacy and permissions

FreshView stores preferences and per-page locks in `chrome.storage.local`. Page locks contain the pathname and query string of pages you explicitly lock. Nothing is synchronized to a server by this extension.

- **Storage:** save preferences on this device.
- **Host access to desktop YouTube:** inspect video cards, hide/restore them, and read the supported active tab's URL for page locks and popup state.

The extension does not request access to browsing history or metadata for all tabs. Scripts, fonts, and images are packaged locally. Debug output reports counts and operational errors, not video titles or account history.

## Development and validation

The project uses vanilla JavaScript, HTML, and CSS. See [AGENTS.md](AGENTS.md) for architecture and working conventions.

```sh
for file in js/*.js; do node --check "$file" || exit 1; done
python3 scripts/package.py --check
```

These checks validate syntax and resource references; they do not replace browser behavior testing. Before shipping, verify hide/restore, thresholds, all page/type filters, bookmarks, SPA navigation, infinite scrolling, duplicate/reused cards, keyboard access, and unsupported tabs with an installed extension. Check both Chromium and Firefox separately. Local development checks may live in the ignored `private/` directory.

### Package

```sh
python3 scripts/package.py
```

This creates `private/dist/FreshView.zip`, containing only runtime files and the license. The script validates manifest, script, HTML, CSS, image, and font references before packaging and again inside the generated archive. Use `--output PATH` to choose another destination.

For Firefox, use the stable add-on ID from the manifest:

```sh
python3 scripts/package.py --firefox-id "freshview@roniel-rhack.github.io" --output private/dist/FreshView-firefox.zip
```

This generates a Firefox-only manifest without changing the source manifest. The package still needs Mozilla validation/signing before distribution.

GitHub Actions runs syntax checks, builds the same archive, and uploads it as an artifact. It does not publish to browser stores. The [September 2026 audit](docs/extension-audit-2026-09-27.md) records the original findings; the [implementation verification](docs/verification-2026-09-27.md) records subsequent fixes and testing limits.

### Debugging

On a YouTube page, open DevTools and select **FreshView's content-script execution context** from the console context selector. The default page context cannot access the extension's isolated globals.

```js
window.FRESHVIEW_DEBUG = true;
window.freshviewDebugDOM();
```

Then navigate within YouTube or change a filter to see diagnostic counts. The flag lasts for the current document and resets on a full reload. Set it to `false` when finished. Storage and processing errors are reported without enabling debug mode.

## Support and contributing

Use the [issue tracker](https://github.com/roniel-rhack/FreshView/issues) for bugs and suggestions. Include the browser and extension versions, affected page type, enabled filters, expected behavior, and a minimal reproduction. Avoid sharing private URLs, account information, or browsing history.

Pull requests are welcome. Keep fixes focused and describe the browser checks performed and any unverified cases.

## License and credits

Licensed under [GNU GPL v3.0](LICENSE). Original project by [Mandrenkov](https://github.com/Mandrenkov); this fork is maintained by [roniel-rhack](https://github.com/roniel-rhack).
