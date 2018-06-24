'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Invalid instantiation error error
 * This error should be used if a command is being instantiated with anything but a valid
 * Plugin instance. It indicates a command has been constructed manually somewhere which
 * is considered unsafe.
 *
 * @memberof Errors
 */
class InvalidInstantiationError extends JourneymanError {

  /**
   * @param {Command} command Instance of the command that caused the error
   * @param {Plugin}  plugin  Whatever has been passed as a plugin but is none
   */
  constructor ( command, plugin ) {
    super( `${command.constructor.name} must be instantiated with a plugin instance` );

    this.name = this.constructor.name;

    this.meta = { command, plugin };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = InvalidInstantiationError;
