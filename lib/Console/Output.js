'use strict';

/**
 * #### Console output
 * The `Output` class is responsible for buffering the console output.
 */
class Output {
  static get VERBOSITY_QUIET () {
    return 1;
  }

  static get VERBOSITY_NORMAL () {
    return 2;
  }

  static get VERBOSITY_VERBOSE () {
    return 4;
  }

  static get VERBOSITY_DEBUG () {
    return 8;
  }

  static get VERBOSITY_DEFAULT () {
    return this.VERBOSITY_NORMAL;
  }

  static get _DEFAULT_FORMATTER () {
    return function ( message ) {
      return message;
    };
  }

  /**
   * Creates a new output
   *
   * @param {WritableStream} outputStream
   * @param {Number}         [verbosity]
   * @param {Function}       [formatter]
   */
  constructor (
    outputStream,
    verbosity = this.constructor.VERBOSITY_DEFAULT,
    formatter = this.constructor._DEFAULT_FORMATTER
  ) {

    /**
     * Holds the output verbosity
     *
     * @type {Number}
     */
    this.verbosity = verbosity;

    /**
     * Holds the output buffer
     *
     * @type {String}
     * @private
     */
    this._buffer = '';

    /**
     * Holds the output transport
     *
     * @type {WritableStream}
     * @private
     */
    this._stream = outputStream;

    /**
     * Holds the output message formatter
     *
     * @type {Function}
     * @private
     */
    this._formatter = formatter;
  }

  /**
   * Allows to set a output message formatter callback.
   *
   * @param {Function} callback
   */
  setFormatter ( callback ) {
    this._formatter = callback;
  }

  /**
   * Writes text to the output buffer. Everything passed to `write` is being appended to the
   * current line, until a newline character (`\n`) is encountered which will terminate the
   * current line and start a new one. If multiple newline-separated lines are passed, all lines
   * will be appended individually.<br>
   * To create individual new lines, use the `writeLn` method.
   *
   * @param {String} string      String to write to the buffer
   * @param {Number} [verbosity]
   * @param {*}      [args]      Formatting arguments
   */
  write ( string = '', verbosity = this.constructor.VERBOSITY_DEFAULT, ...args ) {
    const lines = string.split( '\n' );

    this._buffer += lines.shift();

    if ( lines.length > 0 ) {
      this.writeLn( this._buffer, verbosity, args );
      this._buffer = '';
    }
  }

  /**
   * Writes a line to the output buffer. Lines can be formatted by passing a list of arguments,
   * either as a single object (for named replacements) or multiple values (for indexed replacements).
   *
   * @param {String} line
   * @param {Number} [verbosity]
   * @param {*}      [args]
   */
  writeLn ( line, verbosity = this.constructor.VERBOSITY_DEFAULT, ...args ) {
    this._writeStream( this.constructor._format( line + '\n', ...args ), verbosity );
  }

  /**
   * Flushes the output buffer by writing its content to the transport.
   */
  flush () {
    if ( this._buffer.length > 0 ) {
      this.writeLn( this._buffer );
      this._buffer = '';
    }
  }

  /**
   * Writes all messages to the output.
   *
   * @param {String} message
   * @param {Number} verbosity
   */
  _writeStream ( message, verbosity = this.constructor.VERBOSITY_DEFAULT ) {
    const levels = this.constructor.VERBOSITY_QUIET |
                   this.constructor.VERBOSITY_NORMAL |
                   this.constructor.VERBOSITY_VERBOSE |
                   this.constructor.VERBOSITY_DEBUG;

    const level = levels & verbosity || this.constructor.VERBOSITY_DEFAULT;

    // check if the verbosity is high enough
    if ( level > this.verbosity ) {
      return;
    }

    this._stream.write( this._formatter( message, verbosity ) );
  }

  /**
   * Formats a string.
   *
   * @param str
   * @param args
   * @returns {*}
   * @private
   */
  static _format ( str, ...args ) {
    if ( args.length ) {
      const data = (
        typeof args[ 0 ] === 'string' || typeof args[ 0 ] === 'number' || typeof args[ 0 ] === 'boolean'
        ? args
        : args[ 0 ]
      );

      for ( let key in data ) {
        str = str.replace( new RegExp( `\\{${key}\\}`, 'gi' ), data[ key ] );
      }
    }

    return str;
  }
}

module.exports = Output;
