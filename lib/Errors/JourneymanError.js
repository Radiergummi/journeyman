'use strict';

/**
 * Throughout Journeyman, a wide range of errors are used. Instead of throwing generic `Error`s
 * with a human-readable message, Journeyman uses scoped errors for different possible errors.
 * This makes it possible to transport a lot of metadata, whilst preserving the original cause.
 *
 * All errors inherit from the base error `JourneymanError`.
 *
 * @namespace Errors
 */
class JourneymanError extends Error {

  /**
   * Creates a new generic error
   *
   * @param {String} message    Error message
   * @param {Number} [exitCode] Exit code to end the process with if uncaught
   * @param {*}      meta       Any meta info to include
   */
  constructor ( message = '', exitCode = 1, ...meta ) {

    //noinspection JSCheckFunctionSignatures
    super( message );

    /**
     * Holds the error name
     *
     * @type {string}
     */
    this.name = this.constructor.name;

    /**
     * Holds the exit code for the specific error
     *
     * @type {Number}
     */
    this.exitCode = exitCode;

    /**
     * Holds any error meta data
     *
     * @type {Object}
     */
    this.meta = { ...meta };

    // This block removes the error constructor itself from the stack trace
    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }

  /**
   * Stringifies the error for user-facing output
   *
   * @returns {String}
   */
  toString () {
    const errorName = this.name
                          .replace( 'Error', '' )
                          .replace( /([A-Z][a-z])/g, ' $1' )
                          .toLowerCase()
                          .trim();

    return errorName.charAt( 0 ).toUpperCase() + errorName.slice( 1 ) +
           ( this.message.length > 0 ? `: ${this.message}` : '' );
  }
}

module.exports = JourneymanError;
