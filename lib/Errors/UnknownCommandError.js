'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Unknown command error
 * This error should be used if a call for a plugin command cannot be resolved to a command. It
 * indicates the plugin sub-command is valid (the plugin exists and is loaded) but there is no
 * handler to handle the specific command called.
 *
 * @memberof Errors
 */
class UnknownCommandError extends JourneymanError {

  /**
   * @param {Plugin} plugin  Instance of the plugin the error was thrown in
   * @param {String} command Command requested
   */
  constructor ( plugin, command ) {
    super(
      typeof command === 'undefined'
      ? plugin.constructor.$name + ' requires a sub-command'
      : `${plugin.constructor.$name} has no handler registered for "${command}"`
    );

    this.name = this.constructor.name;

    this.meta = { plugin, command };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = UnknownCommandError;
