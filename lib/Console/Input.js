'use strict';

const CommandOption   = require( './Commands/CommandOption' );
const CommandArgument = require( './Commands/CommandArgument' );
const parseArgs       = require( 'minimist' );

/**
 * Represents the command input for the application
 */
class Input {

  /**
   * Creates a new input instance
   *
   * @param {String} args Console arguments
   */
  constructor ( args ) {
    const parsedInput = parseArgs( args );

    if ( parsedInput._ && Array.isArray( parsedInput._ ) ) {
      this.arguments = parsedInput._;

      delete parsedInput._;
    } else {
      this.arguments = [];
    }

    this.options = parsedInput;

    this.raw = args;
  }

  /**
   * Checks whether any arguments have been passed
   *
   * @returns {boolean}
   */
  hasArguments () {
    return this.arguments.length > 0;
  }

  /**
   * Retrieves an input argument by position
   *
   * @param   {Number} [position] Position of the argument. Defaults to 0
   * @returns {*}                 Argument value
   */
  getArgument ( position = 0 ) {
    return this.arguments[ position ];
  }

  /**
   * Checks whether a specific option has been passed.
   *
   * @param   {String}  name Name of the option to check for
   * @returns {Boolean}      Whether the option has been passed
   */
  hasOption ( name ) {
    return this.options.hasOwnProperty( name );
  }

  /**
   * Retrieves an input option
   *
   * @param   {String} name       Option name
   * @param   {*}      [fallback] Optional fallback value if the requested option is missing
   * @returns {*}                 Option value, fallback if missing, null if no fallback
   */
  getOption ( name, fallback = null ) {
    return this.hasOption( name ) ? this.options[ name ] : fallback;
  }
}

module.exports = Input;
