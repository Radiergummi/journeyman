'use strict';

const Output = require( '../Output' );

class ConsoleOutput extends Output {
  static get _DEFAULT_FORMATTER () {
    const prefixes = {
      [ Output.VERBOSITY_QUIET ]:   '',
      [ Output.VERBOSITY_NORMAL ]:  '',
      [ Output.VERBOSITY_VERBOSE ]: '[VERBOSE]',
      [ Output.VERBOSITY_DEBUG ]:   '[DEBUG]'
    };

    return function ( message, verbosity ) {
      const prefix = prefixes[ verbosity ];

      return ( prefix ? prefix + '\t' : '' ) + message;
    };
  }

  /**
   * Creates a new console output
   *
   * @param {WritableStream} standardOutputStream
   * @param {WritableStream} standardErrorStream
   * @param {Number}         [verbosity]
   * @param {Function}       [formatter]
   */
  constructor (
    standardOutputStream,
    standardErrorStream,
    verbosity = Output.VERBOSITY_DEFAULT,
    formatter = ConsoleOutput._DEFAULT_FORMATTER
  ) {
    super( standardOutputStream, verbosity, formatter );

    this._errorStream = new Output( standardErrorStream );

    /**** Do not rewire console globals for now
    console.log = ( ...messages ) => {
      messages.forEach( message => this.write( message, Output.VERBOSITY_NORMAL ) );
      this.flush();
    };

    console.error = ( ...messages ) => {
      messages.forEach( message => this._errorStream.write( message, Output.VERBOSITY_QUIET ) );
      this._errorStream.flush();
    };
    */
  }

  /**
   * Retrieves the standard error stream.
   *
   * @returns {Output}
   */
  getStdErr () {
    return this._errorStream;
  }
}

module.exports = ConsoleOutput;
