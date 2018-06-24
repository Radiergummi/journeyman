'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Command execution error
 * This error should be used if a command throws during execution. It indicates the command
 * entered some kind of failed state.
 *
 * @memberof Errors
 */
class RequiredCommandOptionValueMissingError extends JourneymanError {

  /**
   * @param {Command}       command Command instance
   * @param {CommandOption} option  Definition for command option that is missing
   * @param {Input}         input   Input instance for the current process
   */
  constructor ( command, option, input ) {
    super( `Option "${option.longName || option.shortName}" has no value but is declared as value required` );

    this.name = this.constructor.name;

    this.meta = { command, option, input };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = RequiredCommandOptionValueMissingError;
