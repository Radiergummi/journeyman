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

    /*
     this._data = {
     options:   [],
     arguments: []
     };

     this._options = command.options;

     // noinspection JSAnnotator
     this._arguments = command.arguments;
     */
  }

  /*
   parse ( argv ) {

   // get a copy of the argv array
   const args      = Array.from( argv );
   const argString = args.join( ' ' );

   // iterate all options
   for ( let option of this._options ) {

   // iterate input arguments
   for ( let [ index, arg ] of args.entries() ) {
   if (
   typeof arg === 'string' &&
   arg.match( CommandOption.expressions.value_none( option ) )
   ) {

   // switch on the option type
   switch ( option.type ) {

   // command options without an input value
   case CommandOption.types.value_none:

   // store the matched option as a boolean true on the input value.
   // flags are automatically true if given, undefined (=falsy) otherwise.
   this._data.options.push( {
   name:  option.longName,
   value: true
   } );
   break;

   // command options with an optional input value
   case CommandOption.types.value_optional:
   let [ optionalValue ] = ( argString.match(
   CommandOption.expressions.value_optional( option )
   ) || [] ).slice( 1 );

   this._data.options.push( {
   name:  option.longName,
   value: optionalValue
   } );
   break;

   // command options with a required input value
   case CommandOption.types.value_required:
   let [ requiredValue ] = ( argString.match(
   CommandOption.expressions.value_required( option )
   ) || [] ).slice( 1 );

   if ( !requiredValue ) {
   throw new Error( `Syntax error: Missing required value for option ${option.help}` );
   }

   // store the matched value on the input data
   this._data.options.push( {
   name:  option.longName,
   value: requiredValue
   } );

   break;
   }

   // check if we've got the option registered
   if ( input.hasOption( option.longName ) ) {

   // remove the processed option from the args
   args.splice( index, 1 );
   }
   }
   }

   // we've got a required option but no more input arguments,
   // so the option seems to be missing
   if (
   !this.hasOption( option.longName ) &&
   option.type === CommandOption.types.value_required
   ) {
   throw new Error( `Syntax error: Missing required option ${option.help}` );
   }
   }

   // iterate all arguments
   for ( let argument of this._arguments ) {

   let value;

   // check if there are no more arguments left
   if ( args.length === 0 ) {

   // check if the argument is required
   if ( argument.type === CommandArgument.types.value_required && !input.hasOption( 'help' ) ) {
   throw new Error( `Missing required argument: ${argument.help}` );
   }

   // check if the argument is optional, in which case assign the default
   if (
   argument.type === CommandArgument.types.value_optional &&
   argument.fallback !== null
   ) {
   value = argument.fallback;
   }
   } else {

   // if we have an array arg, assign all left args
   if ( argument.type === CommandArgument.types.value_array ) {
   value = args;
   } else {

   // otherwise, just shift the args to receive the value
   value = args.shift();
   }
   }

   this._data.arguments.push( {
   name: argument.name,
   value
   } );
   }
   }
   */

  /*
   hasOption ( longName ) {
   return !!this._data.options.find( option => option.longName === longName );
   }
   */

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
