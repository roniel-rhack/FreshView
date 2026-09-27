// This script initializes the options UI.
// -----------------------------------------------------------------------------

// Array of widgets appearing in the options UI. Since widgets can only be
// instantiated after the DOM is loaded, the array is initially empty.
let widgets = [];

// Initialize the UI widgets and register an event listener to update them when
// a relevant change in the browser storage is detected.
document.addEventListener("DOMContentLoaded", () => {
    widgets = [
        // Filters (Types)
        new Checkbox(
            "hide-recommendations-checkbox",
            HIDE_RECOMMENDATIONS_CHECKBOX_STORAGE_KEY,
            HIDE_RECOMMENDATIONS_CHECKBOX_DEFAULT_STATE
        ),
        new Checkbox(
            "hide-playlists-checkbox",
            HIDE_PLAYLISTS_CHECKBOX_STORAGE_KEY,
            HIDE_PLAYLISTS_CHECKBOX_DEFAULT_STATE
        ),
        new Checkbox(
            "hide-searches-checkbox",
            HIDE_SEARCHES_CHECKBOX_STORAGE_KEY,
            HIDE_SEARCHES_CHECKBOX_DEFAULT_STATE
        ),
        new Checkbox(
            "hide-channels-checkbox",
            HIDE_CHANNELS_CHECKBOX_STORAGE_KEY,
            HIDE_CHANNELS_CHECKBOX_DEFAULT_STATE
        ),

        // Filters (Pages)
        new Checkbox(
            "hide-home-checkbox",
            HIDE_HOME_CHECKBOX_STORAGE_KEY,
            HIDE_HOME_CHECKBOX_DEFAULT_STATE
        ),
        new Checkbox(
            "hide-explore-checkbox",
            HIDE_EXPLORE_CHECKBOX_STORAGE_KEY,
            HIDE_EXPLORE_CHECKBOX_DEFAULT_STATE
        ),
        new Checkbox(
            "hide-subscriptions-checkbox",
            HIDE_SUBSCRIPTIONS_CHECKBOX_STORAGE_KEY,
            HIDE_SUBSCRIPTIONS_CHECKBOX_DEFAULT_STATE
        ),
        new Checkbox(
            "hide-library-checkbox",
            HIDE_LIBRARY_CHECKBOX_STORAGE_KEY,
            HIDE_LIBRARY_CHECKBOX_DEFAULT_STATE
        ),
        new Checkbox(
            "hide-history-checkbox",
            HIDE_HISTORY_CHECKBOX_STORAGE_KEY,
            HIDE_HISTORY_CHECKBOX_DEFAULT_STATE
        ),
    ];

});
