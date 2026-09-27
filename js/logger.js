// This script implements the Logger class.
// -----------------------------------------------------------------------------

// Logger wraps the logging functions in |console| to control their visibility.
class Logger {
    // Logs a debug message if the Logger is enabled and verbose.
    static debug(...args) {
        if (Logger.VERBOSE) Logger.info(...args);
    }

    // Logs an information message if the Logger is enabled.
    static info(...args) {
        if (Logger.ENABLED) console.log(...args);
    }

    // Logs a warning message if the Logger is enabled.
    static warning(...args) {
        if (Logger.ENABLED) console.warn(...args);
    }

    // Always report operational errors.
    static error(...args) {
        console.error(...args);
    }
}

// Toggles the display of logging messages.
Logger.ENABLED = false;
// Toggles the display of debug messages (provided that the Logger is enabled).
Logger.VERBOSE = false;