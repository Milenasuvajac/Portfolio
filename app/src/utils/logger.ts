// Logger utility

/**
 * Logger utility for development mode.
 *
 * This utility provides logging functionality using `console.log`, `console.warn`, and `console.error`
 * in development mode (`__DEV__`). In production mode, logging is disabled.
 *
 * @example
 * logger.log('This is a log message');
 * logger.warn('This is a warning message');
 * logger.error('This is an error message');
 */
export const logger = {
  /**
   * Logs an error message to the console in development mode.
   *
   * @param {...unknown[]} messages - The messages to log as an error.
   */
  error: (...messages: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...messages)
    }
  },

  /**
   * Logs a message to the console in development mode.
   *
   * @param {...unknown[]} messages - The messages to log.
   */
  log: (...messages: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...messages)
    }
  },

  /**
   * Logs a warning message to the console in development mode.
   *
   * @param {...unknown[]} messages - The messages to log as a warning.
   */
  warn: (...messages: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...messages)
    }
  },
}

export default logger
