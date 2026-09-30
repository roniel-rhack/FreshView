# FreshView 3.2.1 release verification

Version 3.2.1 includes all UI, localization, theme, accessibility, documentation, and screenshot changes from 3.2.0, plus the browser-specific background manifest correction. It was submitted to Chrome Web Store and Mozilla Add-ons on September 27, 2026. Approval and public availability in both stores were verified on September 30, 2026.

## Included correction

The Chromium manifest contains only `background.service_worker`, eliminating the warning that `background.scripts` requires Manifest V2. Firefox packaging derives its ordered background scripts from the worker's imports and preserves the stable add-on ID. Package validation rejects mixed background configurations, and CI checks both browser targets.

## Validation

- JavaScript syntax and resource/localization validation passed.
- Each browser ZIP contains 44 runtime/license files and reports version 3.2.1.
- All non-manifest archive contents match the current source files.
- The Firefox package is identical to the previously tested 3.2.0 Firefox package except for the version number; background order and identity are unchanged.
- Mozilla `web-ext lint` reports zero errors, warnings, or notices for the generated Firefox package.
- An isolated Chromium installation of 3.2.1 started its service worker with zero install warnings, manifest errors, or runtime errors.
- SHA-256 checksums accompany the archives.

The [3.2.0 verification report](verification-3.2.0.md) records the 19 Chromium regression groups, 42 UI/localization checks, native Firefox checks, and subsequent clean Chromium manifest verification. Those behavior checks were not repeated for this version-only preparation; their documented limitations still apply.

## Local artifacts

- `private/dist/FreshView-3.2.1.zip` — Chromium.
- `private/dist/FreshView-firefox-3.2.1.zip` — Firefox.
- `private/dist/SHA256SUMS-3.2.1.txt` — archive checksums.

These files are ignored release artifacts. Firefox distribution requires Mozilla signing/approval; creating packages does not publish a store release.

## Store submission verification

The following records the dashboard state when the release was submitted on September 27, 2026.

- Chrome: canceled the previous 3.1.0 review, uploaded the Chromium 3.2.1 ZIP, and submitted the updated listing with automatic publication after approval. The package page confirms draft 3.2.1 and pending review; the published version remains 3.0.0.
- Firefox: submitted the Firefox 3.2.1 ZIP, release notes, reviewer instructions, and a source archive with a standalone Python packaging script. Mozilla reports zero errors and warnings and version 3.2.1 awaiting review (version ID `6519225`).
- Rebuilt Firefox from the submitted source archive in a temporary directory; all 44 extracted files match the submitted runtime ZIP byte for byte.
- Updated both English descriptions to document the six automatic interface languages, System/Light/Dark themes, filtering controls, defaults, scope, and local-only preferences.
- Replaced the old screenshots in both listings with three 1280 × 800 RGB JPEGs showing the actual current popup and settings. Firefox captions were saved and read back; Chrome's three images and description persisted after reloading the listing.
- Submission proof and the new store assets are retained in ignored `private/store-3.2.1/`; the source archive is `private/dist/FreshView-source-3.2.1.zip`.

## Store availability verification

On September 30, 2026, both public listings showed version 3.2.1 available to install:

- [Chrome Web Store](https://chromewebstore.google.com/detail/freshview-for-youtube/glologkcncopfogmaghfgcoloklmella).
- [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/freshview-youtube-roniel/).

The README now links to these approved releases. Store approval confirms distribution availability; it does not replace the browser behavior checks and limitations recorded above.
