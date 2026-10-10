// This file contains constants that may be shared across different scripts.
// -----------------------------------------------------------------------------

// Dark Mode
const DARK_MODE_CHECKBOX_STORAGE_KEY = "dark-mode-checkbox-state";
const DARK_MODE_CHECKBOX_DEFAULT_STATE = false;

// Filters (Types)
const HIDE_RECOMMENDATIONS_CHECKBOX_STORAGE_KEY = "hide-recommendations-checkbox-state";
const HIDE_RECOMMENDATIONS_CHECKBOX_DEFAULT_STATE = true;
const HIDE_PLAYLISTS_CHECKBOX_STORAGE_KEY = "hide-playlists-checkbox-state";
const HIDE_PLAYLISTS_CHECKBOX_DEFAULT_STATE = true;
const HIDE_SEARCHES_CHECKBOX_STORAGE_KEY = "hide-searches-checkbox-state";
const HIDE_SEARCHES_CHECKBOX_DEFAULT_STATE = true;

// Filters (Pages)
const HIDE_CHANNELS_CHECKBOX_STORAGE_KEY = "hide-channels-checkbox-state";
const HIDE_CHANNELS_CHECKBOX_DEFAULT_STATE = true;
const HIDE_HOME_CHECKBOX_STORAGE_KEY = "hide-home-checkbox-state"
const HIDE_HOME_CHECKBOX_DEFAULT_STATE = true;
const HIDE_EXPLORE_CHECKBOX_STORAGE_KEY = "hide-explore-checkbox-state"
const HIDE_EXPLORE_CHECKBOX_DEFAULT_STATE = true;
const HIDE_LIBRARY_CHECKBOX_STORAGE_KEY = "hide-library-checkbox-state"
const HIDE_LIBRARY_CHECKBOX_DEFAULT_STATE = true;
const HIDE_HISTORY_CHECKBOX_STORAGE_KEY = "hide-history-checkbox-state"
const HIDE_HISTORY_CHECKBOX_DEFAULT_STATE = false;
const HIDE_SUBSCRIPTIONS_CHECKBOX_STORAGE_KEY = "hide-subscriptions-checkbox-state"
const HIDE_SUBSCRIPTIONS_CHECKBOX_DEFAULT_STATE = true;


// View Threshold
const VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY = "view-threshold-checkbox-state";
const VIEW_THRESHOLD_CHECKBOX_DEFAULT_STATE = true;
const VIEW_THRESHOLD_SLIDER_STORAGE_KEY = "view-threshold-slider-value";
const VIEW_THRESHOLD_SLIDER_DEFAULT_STATE = 90;

const AGE_THRESHOLD_CHECKBOX_STORAGE_KEY = "age-threshold-checkbox-state";
const AGE_THRESHOLD_CHECKBOX_DEFAULT_STATE = false;
const AGE_THRESHOLD_SLIDER_STORAGE_KEY = "age-threshold-slider-value";
const AGE_THRESHOLD_SLIDER_DEFAULT_STATE = 13;
const AGE_THRESHOLD_STEPS = [
    [1, "hour"], [3, "hour"], [6, "hour"], [12, "hour"], [1, "day"], [2, "day"], [3, "day"],
    [1, "week"], [2, "week"], [1, "month"], [2, "month"], [3, "month"], [6, "month"],
    [1, "year"], [2, "year"], [5, "year"], [10, "year"], [15, "year"], [20, "year"]
];
const AGE_UNIT_HOURS = {second: 1 / 3600, minute: 1 / 60, hour: 1, day: 24, week: 168, month: 720, year: 8760};

// Hide Videos
const HIDE_VIDEOS_CHECKBOX_STORAGE_KEY = "hide-videos-checkbox-state";
const HIDE_VIDEOS_CHECKBOX_DEFAULT_STATE = false;
const HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY = "hide-videos-bookmarks";
const HIDE_VIDEOS_BOOKMARKS_DEFAULT_STATE = {};

// -----------------------------------------------------------------------------

// Number of milliseconds over which poll requests should be batched together
const BATCH_TIME_MILLISECONDS = 50;

// -----------------------------------------------------------------------------

// Message indicating a URL change.
const URL_CHANGE_MESSAGE = "url-change";
// Message requesting a page filter query.
const PAGE_FILTER_QUERY_MESSAGE = "page-filter-query";

// -----------------------------------------------------------------------------

// Default Settings state
const SETTINGS_DEFAULT_STATE = {
    // Filters (Types)
    [HIDE_RECOMMENDATIONS_CHECKBOX_STORAGE_KEY]: HIDE_RECOMMENDATIONS_CHECKBOX_DEFAULT_STATE,
    [HIDE_PLAYLISTS_CHECKBOX_STORAGE_KEY]: HIDE_PLAYLISTS_CHECKBOX_DEFAULT_STATE,
    [HIDE_SEARCHES_CHECKBOX_STORAGE_KEY]: HIDE_SEARCHES_CHECKBOX_DEFAULT_STATE,
    [HIDE_CHANNELS_CHECKBOX_STORAGE_KEY]: HIDE_CHANNELS_CHECKBOX_DEFAULT_STATE,

    // Filters (Pages)
    [HIDE_HOME_CHECKBOX_STORAGE_KEY]: HIDE_HOME_CHECKBOX_DEFAULT_STATE,
    [HIDE_EXPLORE_CHECKBOX_STORAGE_KEY]: HIDE_EXPLORE_CHECKBOX_DEFAULT_STATE,
    [HIDE_LIBRARY_CHECKBOX_STORAGE_KEY]: HIDE_LIBRARY_CHECKBOX_DEFAULT_STATE,
    [HIDE_HISTORY_CHECKBOX_STORAGE_KEY]: HIDE_HISTORY_CHECKBOX_DEFAULT_STATE,
    [HIDE_SUBSCRIPTIONS_CHECKBOX_STORAGE_KEY]: HIDE_SUBSCRIPTIONS_CHECKBOX_DEFAULT_STATE,

    // Hide Videos
    [HIDE_VIDEOS_CHECKBOX_STORAGE_KEY]: HIDE_VIDEOS_CHECKBOX_DEFAULT_STATE,
    [HIDE_VIDEOS_BOOKMARKS_STORAGE_KEY]: HIDE_VIDEOS_BOOKMARKS_DEFAULT_STATE,

    // View Threshold
    [VIEW_THRESHOLD_CHECKBOX_STORAGE_KEY]: VIEW_THRESHOLD_CHECKBOX_DEFAULT_STATE,
    [VIEW_THRESHOLD_SLIDER_STORAGE_KEY]: VIEW_THRESHOLD_SLIDER_DEFAULT_STATE,

    [AGE_THRESHOLD_CHECKBOX_STORAGE_KEY]: AGE_THRESHOLD_CHECKBOX_DEFAULT_STATE,
    [AGE_THRESHOLD_SLIDER_STORAGE_KEY]: AGE_THRESHOLD_SLIDER_DEFAULT_STATE
};
