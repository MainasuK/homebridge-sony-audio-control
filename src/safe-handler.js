/**
 * Safe characteristic handlers.
 *
 * Homebridge 2.x treats an unhandled rejection thrown from an `onGet`
 * handler as a fatal error and terminates the child process. When the
 * receiver is unreachable (powered off, in standby, or on another network)
 * every read handler throws, which used to crash Homebridge in a tight
 * restart loop.
 *
 * These wrappers make the read path resilient: errors are logged and a
 * safe fallback value is reported to HomeKit instead of crashing the bridge.
 * The receiver simply shows as "off" until it becomes reachable again.
 */

/**
 * Wrap a `get*` handler so it can never reject.
 *
 * @param {Function} fn - async getter bound to the service instance
 * @param {Function} fallback - () => value returned when the getter fails
 * @param {Object} log - Homebridge logger
 * @param {string} label - name used in the log message
 * @returns {Function} a handler safe to pass to `.onGet(...)`
 */
export function safeGet(fn, fallback, log, label) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (log && typeof log.warn === "function") {
        log.warn(
          "%s is unavailable (%s); reporting fallback state to HomeKit.",
          label || "Sony receiver",
          error && error.message ? error.message : error
        );
      }
      return typeof fallback === "function" ? fallback() : fallback;
    }
  };
}

/**
 * Wrap a `set*` handler so a failure is logged and surfaced to HomeKit as a
 * rejected write, but never escapes as an unhandled rejection that could
 * bring the process down.
 *
 * @param {Function} fn - async setter bound to the service instance
 * @param {Object} log - Homebridge logger
 * @param {string} label - name used in the log message
 * @returns {Function} a handler safe to pass to `.onSet(...)`
 */
export function safeSet(fn, log, label) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (log && typeof log.error === "function") {
        log.error(
          "%s write failed: %s",
          label || "Sony receiver",
          error && error.message ? error.message : error
        );
      }
      // HAP converts a thrown error from onSet into a HAP status error that
      // HomeKit shows to the user, without killing the bridge process.
      throw error;
    }
  };
}
