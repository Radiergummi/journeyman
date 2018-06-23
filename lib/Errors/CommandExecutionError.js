'use strict';

/**
 * #### Command execution error
 * This error should be used if a command throws during execution. It indicates the command
 * entered some kind of failed state.
 *
 * @memberof Errors
 */
class CommandExecutionError extends Error {

  /**
   * @param {Plugin}           plugin  Plugin instance
   * @param {Command|function} handler Handler that failed while handling the command
   * @param {Error}            error   Error that was thrown
   */
  constructor ( plugin, handler, error ) {
    super( 'Command failed to execute: ' + error.message );

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
