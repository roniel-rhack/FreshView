// This script initializes the popup UI.
// -----------------------------------------------------------------------------

// Updates the states of the UI widgets when the URL of the current tab changes.
function onTabUpdatedListener(tabID, changes, tab) {
    if (tab.active && (changes.url || changes.status === "complete")) {
        widgets.forEach(widget => widget.load());
    }
}

// -----------------------------------------------------------------------------

// Array of widgets appearing in the popup UI. Since widgets can only be
// instantiated after the DOM is loaded, the array is initially empty.
let widgets = [];

document.addEventListener("DOMContentLoaded", () => {
    // Browser extensions are prohibited from embedding JavaScript in the
    // "on_click" properties of their HTML elements.
    const options = document.getElementById("options-span");
    options.addEventListener("click", () => chrome.runtime.openOptionsPage());

    widgets = [
        // Hide Videos
        new HideVideosCheckbox(),
        new HideVideosBookmark(),

        // View Threshold
        new ViewThresholdCheckbox(),
        new ViewThresholdSlider()
    ]

    chrome.tabs.onUpdated.addListener(onTabUpdatedListener);
    chrome.tabs.onActivated.addListener(() => widgets.forEach(widget => widget.load()));
});
