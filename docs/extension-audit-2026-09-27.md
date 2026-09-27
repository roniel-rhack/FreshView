# FreshView extension audit — 2026-09-27

This is the historical pre-change audit. See [implementation verification](verification-2026-09-27.md) for the subsequent fixes, measured results, and remaining validation limits.

## Assessment and scope

The current working tree, declaring version 3.0.0, works for basic supported cards but has reproducible correctness, performance, accessibility, and distribution defects. It should not be treated as fully working across the advertised browsers and YouTube layouts.

This review includes the existing uncommitted changes in 13 files. No extension implementation, existing configuration, stored settings, or pre-existing changes were modified. `AGENTS.md` and this report are the deliverables. Disposable checks and their results are in the already ignored `private/audit/` directory.

## Verification performed

- All 15 JavaScript source files passed `node --check` using Node 20.19.5.
- Manifest JSON parsed successfully; all 23 checked manifest file references exist.
- The new Markdown files passed whitespace checks. Whole-tree `git diff --check` reports pre-existing CRLF/trailing-whitespace issues in the user's existing changes; those files were left untouched.
- Browser DOM fixtures executed the actual repository classes with mocked storage. Four baseline checks passed: old/new progress bars within supported cards, ordinary toggle restoration, threshold boundaries, and multiple cards with the same video ID. Seven additional checks exposed the failures or unnecessary work detailed below.
- Popup and options loaded with mocked extension APIs, expected defaults, and no captured warning/error logs. The popup exposed only the threshold slider as an accessible form control; the checkboxes were hidden from the accessibility tree.
- A separate Node VM check verified service-worker listener registration, both command toggles, and the URL-change message payload with mocked Chrome APIs.
- A live public YouTube watch page had no `ytd-compact-video-renderer` cards. Five sampled `yt-lockup-view-model` cards had regular watch links, no playlist query, and no ancestor matching the legacy video containers. The recommendation extractor does not select them. A search-page sample also contained modern ad/course cards, reinforcing the need to discriminate content types when adding selectors.

Limits: these are not end-to-end tests of an installed extension in an authenticated YouTube account. Browser APIs, worker suspension, real shortcuts, account progress history, and cross-tab persistence need an installed-extension smoke test. Firefox was not run. A standalone Chrome headless attempt timed out; DOM and UI fixture verification used the working Codex in-app browser instead. The benchmark is synthetic, not a live-page CPU or memory profile.

## Findings and recommended changes

### P1 — Hidden cards can remain hidden after disabling the extension

**Evidence:** `js/video.js:8`, `js/video.js:60`, `js/video.js:76`, `js/album.js:70`.

The album key combines a video ID with a path based on DOM sibling positions. Inserting a sibling or reusing a card for another video changes its key. Extraction constructs a new `Video` while the card is hidden, capturing `display: none` as its original display. Merging restores and drops the old entry, then adds the new wrapper with the incorrect saved display. Turning hiding off still writes `none`.

Both sibling insertion and node reuse reproduced this failure. Track individual DOM nodes with stable identity and preserve their original visibility independently of the current video ID and DOM position. Keep duplicate cards distinct, restore nodes when dropping them, and release disconnected references.

### P1 — Current recommendation cards are missed

**Evidence:** `js/extractor.js:161`, `js/extractor.js:23`; live DOM sample described above.

`extractRecommendedVideos()` only queries `ytd-compact-video-renderer`. Supporting modern links/progress bars in `Video` cannot help when the containing card is never extracted. The standalone modern-card fixture produced zero extracted videos.

Add context-aware extraction for regular `yt-lockup-view-model` video cards in recommendations and other applicable layouts. Preserve the recommendations type filter, avoid duplicate outer/inner wrappers, and exclude ads, playlist/course summaries, and Shorts unless explicitly supported. Verify modern CSS classes and link selection against live samples rather than relying on selector comments.

### P1 — The distribution workflow is obsolete and omits required fonts

**Evidence:** `.github/workflows/package.yaml:17`, `.github/workflows/package.yaml:20`, `css/fonts.css:7`.

`actions/upload-artifact@v2` has been retired on GitHub.com, so the current workflow cannot reliably provide the package. This conclusion follows the workflow configuration and GitHub's policy; a remote workflow was not triggered. The package allowlist also omits `fonts/`, although local Material Icons and Roboto files are required by the CSS. Missing Material Icons can leave literal icon names visible.

Update the workflow to maintained action versions compatible with its runner, include fonts, and validate all references against the produced artifact. Add syntax/manifest validation before packaging. See [GitHub's artifact-action retirement notice](https://github.blog/changelog/2024-02-13-deprecation-notice-v1-and-v2-of-the-artifact-actions/).

### P2 — Progress and link changes can go unnoticed

**Evidence:** `js/manager.js:23`, `js/injection.js:48`.

The observer subscribes only to child-list changes. Changing an existing progress bar's inline width from 0% to 95% produced no new poll, leaving the card visible. The three startup retries at 1, 3, and 5 seconds do not cover attribute-only changes occurring later.

Observe relevant progress/link changes and schedule affected cards. Do not broadly observe every style change without excluding the extension's own display writes; that can create a polling loop. Use navigation events to trigger extraction as well as display refresh when needed.

### P2 — Unnecessary whole-document scans and quadratic identity work

**Evidence:** `js/manager.js:23`, `js/manager.js:92`, `js/manager.js:119`, `js/extractor.js:201`, `js/video.js:60`.

Each default extraction performs 18 document-wide selector queries. Any child-list mutation anywhere in the document can schedule this work, including when hiding is disabled or the page is excluded. The 50 ms gate coalesces bursts but does not limit work to relevant changes. Repeatedly walking all preceding siblings to generate every card's path has quadratic cost for a flat list.

Synthetic browser measurements, one warmup and seven timed polls per size, with every card watched:

| Cards | Median poll | Slowest poll |
| --- | ---: | ---: |
| 100 | 0.5 ms | 0.6 ms |
| 500 | 5.9 ms | 6.7 ms |
| 1,000 | 23.8 ms | 24.1 ms |

These timings depend on the machine and simplified DOM. They demonstrate scaling in this fixture, not an expected live YouTube frame rate.

Prioritize stable node identity, a disabled/ignored fast path that restores existing cards once, mutation-target filtering, and incremental extraction. Combine equivalent selector queries, deduplicate candidate nodes before wrapping them, and avoid unchanged style writes. Reduce smaller overheads afterward: `Settings` is loaded twice during `Manager` startup, debug-only counts allocate arrays even with debugging off, options register redundant storage reload listeners, and the threshold slider writes storage for every input event.

### P2 — The Home exclusion fails with query parameters

**Evidence:** `js/page.js:23`, `js/path.js:16`.

`Path.parse()` retains the query string, but Home detection tests whether the whole result ends with `/`. `/` matches; `/?hl=en` does not. With Home filtering disabled, a Home URL with query parameters may still be filtered.

Match page categories against the URL pathname. Preserve bookmark behavior separately: existing bookmarks are keyed by pathname plus query and need an explicit compatibility decision before normalization changes. Also verify channel, Explore, and Library classifiers against current routes and DOM; their complete live coverage was not tested.

### P2 — Advertised Firefox support is not implemented by the background configuration

**Evidence:** `manifest.json:9`, Firefox instructions in `README.md`.

The only background entry is `service_worker`, which Firefox does not support according to [Mozilla's current background documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background). There is no event-page fallback. Provide a supported cross-browser background configuration or a Firefox-specific manifest and test it; otherwise narrow the compatibility claim. Do not infer that an unpacked Chromium load establishes Firefox compatibility.

### P2 — Core controls are inaccessible by keyboard

**Evidence:** `css/shared.css:94`, `css/popup.css:248`, `html/popup.html:23`.

Toggle and bookmark inputs use `display: none`; labels do not replace their native keyboard interaction or accessibility semantics. Ordinary toggles have empty accessible labels. Options is a clickable `span` with no keyboard focus or button behavior. The slider also removes its outline without supplying a replacement focus indicator.

Keep native inputs focusable while visually styling them, associate descriptive labels, use a real Options button, and provide visible focus. Verify Tab/Space/Enter operation and the accessibility tree in both popup and options.

### P3 — Smaller reliability, privacy, and maintenance improvements

- **Unused broken method:** `Album.equals()` calls `.every()` on a `Set` (`js/album.js:62`), which throws even for empty albums. There are currently no callers, so it does not explain normal filtering failures. Correct it or remove it if intentionally unused.
- **Permissions:** `tabs` grants broader tab metadata access than the YouTube feature requires. Evaluate relying on the existing host permission, handling absent URLs safely, and sending URL-change messages only for supported hosts. [Chrome's Tabs documentation](https://developer.chrome.com/docs/extensions/reference/api/tabs) describes metadata access through host permissions. Do not remove the permission without checking popup and navigation behavior.
- **Unsupported tabs:** the popup still queries/messages the active tab and allows bookmark logic outside YouTube. Show a clear unsupported-page state and prevent irrelevant bookmark writes. This recommendation is based on source inspection; the unsupported-tab flow was not exercised in an installed extension.
- **Storage and failure recovery:** validate threshold/bookmark values; filter events by storage area; expose actionable errors. `Logger.ENABLED = false` currently suppresses storage errors. Wrap scheduled polling cleanup in `finally`, because an exception in `poll()` leaves `ready = false` and prevents future scheduling.
- **Debug instructions:** the documented `window.FRESHVIEW_DEBUG = true` runs in the page world unless the extension execution context is selected; content-script globals are isolated. Reloading also resets the flag to false. Document the correct context and lifetime, or persist a deliberate debug setting. See [Chrome's content-script isolation documentation](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).
- **Documentation consistency:** `CLAUDE.md` says the project is no longer maintained while `README.md` describes a maintained fork. Clarify project status and only advertise browser/layout coverage actually verified.
- **Security review scope:** no extension-initiated network requests, remote scripts, `eval`, or dynamic HTML injection were found in the current JavaScript. Assets and settings are local. This is a source-level observation, not a complete security certification.

## Suggested implementation order

1. Fix stable node identity/restoration and add regression coverage for reordered and reused cards.
2. Support modern recommendation cards and relevant attribute updates, preserving page/type exclusions.
3. Eliminate disabled/unrelated scans and compare the same benchmark before and after.
4. Repair packaging, browser compatibility, and permissions with installed-browser smoke tests.
5. Fix keyboard accessibility, storage validation, debug instructions, and documentation consistency.

For local reproduction, run `python3 private/audit/run.py` to regenerate the synthetic fixture, serve the repository on loopback, and open `/private/audit/fixture.html`. Its `#results` element contains pass/fail evidence and timing samples. `private/audit/results.json` records this audit's observed outcomes. These ignored scratch files are not part of the distributable or a committed test suite.
