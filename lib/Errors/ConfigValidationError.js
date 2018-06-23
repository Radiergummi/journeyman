'use strict';

/**
 * #### Configuration validation error
 * This error should be used if an unknown type has been passed to the validation. The Schema class can
 * only validate objects.
 *
 * @memberof Errors
 */
class ConfigValidationError extends Error {

  /**
   * @param {Schema} schema Schema instance
   * @param {*}      config The configuration data declared as an object but is none
   */
  constructor ( schema, config ) {
    super( 'Invalid config type' );

    this.name = this.constructor.name;

    this.meta = { schema, config };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationError;
