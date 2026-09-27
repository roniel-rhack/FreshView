# FreshView 3.1.0 verification

This implements the corrections proposed in the [September 2026 audit](extension-audit-2026-09-27.md). This report records implementation checks and follow-up testing of the submitted 3.1.0 package; store submission status is tracked in the README. Existing unrelated files and archives were preserved.

## Changes

| Audit finding | Implementation |
| --- | --- |
| Cards remain hidden after reordering/reuse | Albums use DOM-element identity; visibility state stays with each wrapper. Original display values and priorities are restored. Duplicate video cards remain independent. |
| Modern recommendations missed | A shared candidate selector covers legacy and modern cards, canonicalizes nested wrappers, and applies page/type filters. Ads, Shorts, and playlist/course summaries are excluded. |
| Late progress changes missed | Mutation handling watches relevant link/progress attributes and inserted/removed content. Startup retry timers were removed. |
| Unnecessary and quadratic work | DOM-path construction was removed. Normal mutations update affected cards; full scans happen for initialization, navigation, and settings changes. Disabled/ignored filtering restores cards without extraction. Unrelated mutations and the extension's display writes do not schedule scans. |
| Broken Home/page classification | Page categories use pathname; channel handles and current You/Library routes are recognized. Existing bookmark keys still include the query string. |
| Invalid state and recovery | Stored booleans, thresholds, and bookmark maps are validated. Storage errors are visible. Polling clears its scheduling state after an exception. Storage listeners ignore other storage areas. |
| Background duplication | Worker and Firefox background contexts load the same constants, logger, storage, and path helpers. Keyboard-command writes are serialized. |
| Excess permissions and unsupported tabs | Broad `tabs` access was removed. Hosts are limited to HTTPS desktop YouTube. Popup controls explain unsupported/unavailable pages and prevent inappropriate bookmark writes. |
| Accessibility | Native switches remain focusable and have descriptive labels. Options is a native button. Switches, bookmark, and slider have visible focus. |
| Excess UI/storage work | Removed redundant options listeners and the separate threshold-label storage listener. Slider input updates its display locally and persists on change. |
| Packaging | Maintained GitHub Actions versions, explicit read-only repository permissions, and a shared Python packager validate all runtime references, including fonts. Firefox packaging accepts a maintainer-supplied add-on ID. |
| Documentation | README now links the confirmed Chrome listing, distinguishes store/development versions, documents the first Firefox submission, and documents actual controls, privacy, debugging, development, and packaging. AGENTS and CLAUDE guidance are aligned. |

## Installed Chromium checks

The extension was loaded unpacked in a separate Chrome for Testing 153.0.8010.12 profile with Developer mode enabled. YouTube requests were fulfilled with synthetic DOM fixtures; browser storage, content-script isolation, runtime messaging, popup targets, and options pages used the real extension APIs. No authenticated browsing history was used.

All 19 regression groups passed, with no uncaught page errors. The suite covers:

1. Legacy/modern progress bars, threshold boundaries, and absent progress.
2. Restoring reordered cards and original `display: inline-grid !important`.
3. Reused DOM nodes, changed video links, and reduced progress.
4. Late progress attributes, removal, and insertion of progress bars.
5. Modern recommendation filtering and preservation of summaries/ads.
6. Playlist-row and search-result type filters.
7. Every page exclusion, Home query parameters, and channel handles.
8. Exact-page bookmarks overriding global state.
9. SPA navigation, duplicate videos, nested wrappers, and detached-node cleanup.
10. No self-triggered polling, unrelated-mutation scans, or disabled extraction.
11. Invalid stored settings and threshold clamping.
12. Recovery after a deliberately injected polling exception.
13. Album equality using node collections.
14. The actual popup connecting and toggling via keyboard without `tabs` permission.
15. Safe popup state on an unsupported tab.
16. Popup lock/unlock and one slider storage write after multiple input events.
17. Real storage-change propagation across multiple content-script tabs.
18. Options keyboard controls, persisted dark theme, and visual inspection.
19. Extension reload, background restart, persisted settings, and reinjection after page refresh.

The command queue and supported-host navigation messages also passed a focused Node VM check. JavaScript syntax, JSON parsing, package resource references, and whitespace checks passed. Existing CRLF files retain their line-ending convention; whitespace verification uses `git -c core.whitespace=cr-at-eol diff --check`.

## Performance comparison

Before and after were measured in the same Chrome for Testing version with the same synthetic cards, one warmup and seven timed full polls per size. The baseline came from a local snapshot taken before implementation.

| Watched cards | Previous median | Updated median |
| --- | ---: | ---: |
| 100 | 0.6 ms | 0.6 ms |
| 500 | 5.6 ms | 2.6 ms |
| 1,000 | 23.0 ms | 4.6 ms |

The 1,000-card full poll took approximately 80% less time in this fixture. Routine relevant mutations use incremental processing, and the disabled-extraction check counted zero document queries. These are synthetic measurements, not a claim about live YouTube CPU use or every user's frame rate.

## Packaging and Firefox

The generated Chromium/shared archive contains 34 runtime/license files. The packager validates references before writing and after reading the ZIP. Local fonts are present, and development tools, audit files, profiles, existing archives, and store assets are excluded.

A Firefox-specific package generated with an explicitly temporary test ID passed Mozilla's `web-ext lint` with **zero errors, warnings, or notices**. Its background uses scripts and omits Chromium-only background settings. The test ID is confined to ignored validation artifacts and must not be used for publication.

The maintainer confirmed that Firefox is a first publication and authorized it. The stable add-on ID is `freshview@roniel-rhack.github.io`. Generate its package with `scripts/package.py --firefox-id freshview@roniel-rhack.github.io`. The shared development manifest alone is not a signed Firefox distribution.

### Installed Firefox 156.0.1 checks

Follow-up testing on September 27, 2026 used the user's installed Firefox **156.0.1** on macOS, launched through its native interface. The exact submitted `FreshView-firefox.zip` was loaded temporarily through `about:debugging`. Firefox reported its background script as running under the stable add-on ID.

On live, signed-out YouTube, the popup connected to the content script and displayed working controls. The threshold slider and keyboard-operated Hide Videos and View Threshold switches updated correctly. The options page loaded, its dark-theme switch worked by keyboard, and the selection persisted after reloading the page. The signed-out homepage had no watched cards, so this check does not establish filtering against account-specific live watch progress.

A separate temporary test extension ran **14 regression groups, all passing**:

1. Real Firefox storage and legacy/modern threshold filtering.
2. Reordering and exact display-value/priority restoration.
3. Reused links and late progress updates.
4. Disabled threshold requiring 100% progress.
5. Every page exclusion and Home query strings.
6. Recommendation type filtering and preservation of playlist summaries.
7. Search and playlist-row filters.
8. Exact-page bookmarks and SPA navigation.
9. Duplicate cards and detached-node cleanup.
10. No observer loops or unrelated scans.
11. Invalid persisted preference normalization.
12. Runtime messaging between background and test-page contexts.
13. Background loading of shared storage and constants.
14. Disposal restoring hidden cards.

All **15 runtime JavaScript files** in that test extension matched the submitted ZIP byte for byte. The harness used synthetic DOM fixtures in an extension page, real Firefox storage/change events and runtime messaging, a separate temporary add-on ID, and a loopback-only result collector. Its test manifest added the harness startup script and collector permission; these are not part of the submitted package. These fixtures exercise the filtering logic but do not reproduce content-script isolation on live YouTube. The separate manual package check above covers live popup/content-script connectivity.

Both temporary add-ons were removed after testing, and the local result collector stopped. No production source changes were needed. Earlier Firefox 155 profile-launch failures and a subsequent `web-ext run` connection failure remain CLI environment limitations; native Firefox testing succeeded and supersedes the previous runtime-unverified status. Store approval/signing and authenticated live filtering remain separate checks.

## Store verification and remaining limits

- The [Chrome Web Store listing](https://chromewebstore.google.com/detail/freshview-for-youtube/glologkcncopfogmaghfgcoloklmella) was verified on September 27, 2026 and lists 3.0.0. Version 3.1.0 was subsequently submitted and is pending review with automatic publication after approval.
- The first Firefox release, 3.1.0, was submitted successfully under [freshview-youtube-roniel](https://addons.mozilla.org/en-US/firefox/addon/freshview-youtube-roniel/) and is awaiting review. Mozilla accepted the package with no errors or warnings. A source archive and reproduction instructions were supplied. The public listing remains unavailable until approval.
- Current live YouTube layouts were inspected during the original audit. Firefox popup connectivity was also checked on live, signed-out YouTube. Filtering regression checks use controlled fixtures; authenticated account-specific layouts and watch-progress history still require a live smoke test.
- Keyboard interaction with popup/options was tested. Command-handler logic was tested independently; OS-level configured shortcut delivery was not automated.
- Local checks and the [remote GitHub Actions packaging run](https://github.com/roniel-rhack/FreshView/actions/runs/36326950071) passed. Both browser-store submissions were completed after explicit maintainer authorization; store approval and public rollout remain external steps.

Local reproduction artifacts live under the ignored `private/audit/` directory: `integration.cjs`, `integration-results.json`, `benchmark.cjs`, `benchmark-results.json`, `firefox-validation-results.json`, `firefox-installed-test.cjs`, `firefox-report-server.cjs`, `firefox-installed-test/`, `firefox-installed-results.json`, and popup/options screenshots, including `firefox-options-156.png`. They are local checks, not a committed test suite or distributable content.
