'use strict';

/**
 * #### Command execution error
 * This error should be used if a command throws during execution. It indicates the command
 * entered some kind of failed state.
 *
 * @memberof Errors
 */
class RequiredCommandArgumentMissing extends Error {

  /**
   * @param {Command}         command  Command instance
   * @param {CommandArgument} argument Definition for command option that is missing
   * @param {Input}           input    Input instance for the current process
   */
  constructor ( command, argument, input ) {
    super( `Argument "${argument.name}" is missing but declared as required` );

    this.name = this.constructor.name;

    this.meta = { command, argument, input };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = RequiredCommandArgumentMissing;
