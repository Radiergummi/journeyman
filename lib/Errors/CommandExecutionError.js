'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Command execution error
 * This error should be used if a command throws during execution. It indicates the command
 * entered some kind of failed state.
 *
 * @memberof Errors
 */
class CommandExecutionError extends JourneymanError {

  /**
   * @param {Plugin}           plugin  Plugin instance
   * @param {Command|function} handler Handler that failed while handling the command
   * @param {Error}            error   Error that was thrown
   */
  constructor ( plugin, handler, error ) {
    super( `Failed to execute: ${error.message}` );

    this.name = this.constructor.name;

    this.meta = { plugin, handler, error };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = CommandExecutionError;
