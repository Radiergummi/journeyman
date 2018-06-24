'use strict';

const CommandOption                     = require( './Commands/CommandOption' );
const CommandArgument                   = require( './Commands/CommandArgument' );
const parseArgs                         = require( 'minimist' );
const RequiredCommandOptionMissing      = require( '../Errors/RequiredCommandOptionMissing' );
const RequiredCommandArgumentMissing    = require( '../Errors/RequiredCommandArgumentMissing' );
const RequiredCommandOptionValueMissing = require( '../Errors/RequiredCommandOptionValueMissing' );

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

    /**
     * Holds the original input args.
     *
     * @type {String}
     */
    this.raw = args;

    /**
     * Holds the plugin identifier. This will generally be the first sub-command to Journeyman.
     *
     * @type {String}
     */
    this.plugin = null;

    /**
     * Holds the command identifier. This will generally be the second sub-command to Journeyman.
     *
     * @type {String}
     */
    this.command = null;

    /**
     * Holds the command arguments passed to Journeyman, except the plugin and command identifiers.
     *
     * @type {Array}
     */
    this.arguments = [];

    // Check if there are any arguments in the input
    if ( parsedInput._ && Array.isArray( parsedInput._ ) ) {

      // Retrieve the plugin name by shifting the command arguments
      this.plugin = parsedInput._.shift();

      // Retrieve the command name by shifting the command arguments
      this.command = parsedInput._.shift();

      // Store the left arguments
      this.arguments = parsedInput._;

      this._definedArguments = {};

      // Remove the underscore property
      delete parsedInput._;
    }

    // Since we removed all arguments, only options are left
    this.options = parsedInput;
  }

  /**
   * Checks whether any arguments have been passed.
   *
   * @returns {Boolean}
   */
  hasArguments () {
    return this.arguments.length > 0;
  }

  /**
   * Checks whether an argument at a specific position exists.
   *
   * @param   {String|Number} argument Defined argument name or position of the argument.
   * @returns {Boolean}
   */
  hasArgument ( argument ) {
    if ( typeof argument === 'string' ) {
      return this._definedArguments.hasOwnProperty( argument );
    }

    return typeof this.arguments[ argument ] !== 'undefined';
  }

  /**
   * Retrieves an input argument by position.
   *
   * @param   {String|Number} [argument] Defined argument name or position of the argument.
   *                                     Defaults to 0.
   * @returns {*}                        Argument value
   */
  getArgument ( argument = 0 ) {
    if ( typeof argument === 'string' ) {
      return this._definedArguments[ argument ];
    }

    return this.arguments[ argument ];
  }

  /**
   * Checks whether a specific option has been passed.
   *
   * @param   {CommandOption|String} option Name of the option to check for
   * @returns {Boolean}                     Whether the option has been passed
   */
  hasOption ( option ) {
    if ( option instanceof CommandOption ) {
      return (
        this.options.hasOwnProperty( option.shortName ) ||
        this.options.hasOwnProperty( option.longName )
      );
    }

    return this.options.hasOwnProperty( option );
  }

  /**
   * Retrieves an input option. This method accepts both `CommandOption` instances and string identifiers.
   *
   * @param   {CommandOption|String} option     Option instance or name
   * @param   {*}                    [fallback] Optional fallback value if the requested option is missing
   * @returns {*}                               Option value, fallback if missing, null if no fallback
   */
  getOption ( option, fallback = false ) {
    if ( option instanceof CommandOption ) {
      if ( this.hasOption( option.shortName ) ) {
        return this.options[ option.shortName ];
      }

      if ( this.hasOption( option.longName ) ) {
        return this.options[ option.longName ];
      }

      return fallback;
    }

    return this.hasOption( option ) ? this.options[ option ] : fallback;
  }

  _updateOption ( option, value ) {
    if ( option instanceof CommandOption ) {
      if ( this.hasOption( option.shortName ) ) {
        this.options[ option.shortName ] = value;
      }

      if ( this.hasOption( option.longName ) ) {
        this.options[ option.longName ] = value;
      }

      return;
    }

    if ( this.hasOption( option ) ) {
      this.options[ option ] = value;
    }
  }

  /**
   * Validates a command's input definitions.
   *
   * @param {Command} command Command instance to validate definitions for.
   */
  validate ( command ) {
    const inputArguments = Array.from( this.arguments );

    command.getArguments().forEach( ( argument, index ) => {
      if ( this.hasArgument( index ) ) {

        // Check if this is an array argument. If so, push all leftover arguments,
        // otherwise, just shift the list.
        this._definedArguments[ argument.name ] = argument.isArray()
                                                  ? inputArguments.splice( index )
                                                  : inputArguments.shift();

        return;
      }

      // Check if the argument is required but missing
      if ( argument.isRequired() ) {
        throw new RequiredCommandArgumentMissing( command, argument, this );
      }
    } );

    for ( let optionDefinition of command.getOptions() ) {
      let optionValue;

      // Check if we have this option
      if ( this.hasOption( optionDefinition ) ) {
        optionValue = this.getOption( optionDefinition );

        if ( optionDefinition.isValueRequired() && typeof optionValue === 'undefined' ) {
          throw new RequiredCommandOptionValueMissing( command, optionDefinition, this );
        }

        if ( optionDefinition.isValueless() && typeof optionValue !== 'undefined' ) {

          // TODO: If -g has no value but -g=5 has been passed - should an error be thrown?
          // Or should the value be reassigned? We'll simply discard it for now.
        }
      } else {

        // Check if this is a required option
        if ( optionDefinition.isRequired() ) {
          throw new RequiredCommandOptionMissing( command, optionDefinition, this );
        }

        // Set the option default
        this._updateOption( optionDefinition, optionDefinition.default );
      }
    }

    return this;
  }
}

module.exports = Input;
