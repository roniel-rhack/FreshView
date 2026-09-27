# FreshView 3.2.0 verification

Verified locally on September 27, 2026. Version 3.2.0 is prepared for distribution but has not been submitted to either browser store. The README keeps the dated 3.1.0 submission status separate.

## Changes and compatibility

- Responsive settings with semantic headings, clickable labels, associated descriptions, visible keyboard focus, and reduced-motion support.
- A 380 px toolbar popup with explicit intrinsic width. A viewport-relative maximum initially caused Firefox's auto-sized panel to collapse; the actual Firefox popup was inspected after replacing that constraint with explicit root/body sizing.
- Native extension localization for English, Spanish, Brazilian Portuguese, Japanese, Simplified Chinese, and Traditional Chinese. Firefox Chinese script aliases mirror the corresponding regional catalogs.
- Localized manifest/shortcut descriptions, popup/settings content, status text, and accessibility attributes. The actual translation identifies its language for screen readers even when it is selected as a fallback. Strings are inserted as text, not HTML.
- System/Light/Dark appearance. An explicit `theme-mode` wins; otherwise a saved legacy boolean selects its previous light/dark appearance. New installations follow the device preference. Existing storage keys, locks, filters, and defaults are preserved.
- A disabled threshold shows 100% in both the slider and explanation without overwriting the saved percentage. Slider layout measurements and the UI's icon-font dependency were removed.
- Lock/unlock has distinct text and icons. Refreshing settings no longer temporarily disables the focused lock, so keyboard focus survives saving.

## Automated Chromium checks

All **19 regression groups** passed in an installed extension in Chrome for Testing 153.0.8010.12. These cover the previous filtering/restoration, navigation, storage and messaging scenarios, plus actual toolbar-popup connectivity, unsupported-tab handling, lock/unlock focus retention, slider writes, themes, and extension reload. There were no uncaught page errors. The toolbar target was also checked for a usable width and horizontal overflow.

All **42 UI/localization checks** passed: seven groups for each of the six languages. Each used an isolated installed extension with that catalog as the native default/fallback, real `chrome.i18n`, real storage, and real page controls. This exercises translations and fallback behavior without changing the user's browser language preferences.

The groups cover:

1. Localized document titles, visible content, manifest metadata, and screen-reader language.
2. Settings at 320 px, enlarged text at twice the base size, and horizontal overflow.
3. Clicking the visible label, toggling by keyboard, and persistence after reload.
4. System appearance changes, explicit themes, persistence, and storage-driven updates.
5. Legacy light/dark choices and malformed preference fallback.
6. Localized popup states, threshold off/on behavior, saved-percentage preservation, and enlarged text.
7. Reduced motion and uncaught page errors.

The final Firefox width correction and label/focus refinements were followed by the 19-group integration run and the native Firefox checks below. Per-language full-page screenshots were inspected for representative Latin and CJK layouts.

## Installed Firefox checks

Loaded the generated Firefox ZIP temporarily into the user's **Firefox 156.0.1** through `about:debugging`; its background script ran successfully.

On live signed-out YouTube, the real toolbar popup connected to the content script. Manual checks confirmed:

- The popup has its full width and readable controls, including the longer locked-page status.
- Hide watched videos and the threshold switch respond to keyboard input.
- Locking shows the active locked state and an Unlock action; unlocking preserves keyboard focus.
- Turning the threshold off shows 100%; turning it back on restores the saved 90%.
- Settings opens from the popup; the native theme selector works with arrow keys, and Dark persists through reload and appears in the popup.
- Screen-reader control names identify the setting, with explanatory text separately associated.

The temporary 3.2.0 installation is left loaded for local review and lasts until Firefox restarts. Rebuilding a ZIP that Firefox currently has open requires reloading the temporary add-on; the final archive was reloaded and verified after packaging.

## Packaging checks

Both browser archives contain **44 runtime/license files** and passed resource/localization validation. JavaScript syntax and whitespace checks passed. Mozilla `web-ext lint` on the Firefox-only package reported **0 errors, 0 warnings, 0 notices**.

Four negative checks confirmed that packaging rejects a missing default catalog, missing translation key, broken placeholder substitution, and an unknown HTML message reference. Chinese aliases must remain identical to their regional catalogs. No new permission or runtime dependency was introduced.

Artifacts:

- `private/dist/FreshView-3.2.0.zip`
- `private/dist/FreshView-firefox-3.2.0.zip`
- Ignored local checks: `private/audit/integration-320.cjs`, `integration-320-results.json`, `ui-320.cjs`, `ui-320-results.json`, and `firefox-320-popup-fixed.png`, plus localized screenshots.

## Remaining limits

Filtering regression checks use synthetic YouTube DOM fixtures. The Firefox live page was signed out and had no watched cards; authenticated watch-progress layouts remain unverified. The six language layouts were exercised in Chromium through native catalog fallback, not through six separately installed browser interface-language packs. Firefox's manual UI check used English. Translations have not received independent native-speaker review. Store listing translations, approval, signing, and publication are separate release steps.

## Follow-up: browser-specific background manifests

Chrome reported that `background.scripts` requires Manifest V2 because the shared root manifest contained both background types. The root manifest now contains only `background.service_worker`. Firefox packaging derives its ordered `background.scripts` list from the worker's static imports and removes the worker entry. Firefox development installations must use the generated ZIP rather than the root manifest.

An isolated Chromium installation reported zero install warnings, manifest errors, or runtime errors, and its service worker started. The generated Firefox package payload was byte-for-byte identical to the previously tested 3.2.0 package; Mozilla lint again reported zero errors, warnings, or notices. A negative packaging check confirmed that mixed background manifests are rejected. CI now validates the Firefox target alongside the Chromium package.
