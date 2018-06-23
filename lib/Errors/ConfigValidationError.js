'use strict';

/**
 * #### Configuration validation error
 * This error should be used if an unknown type has been passed to the validation. The Schema class can
 * only validate objects.
 */
class ConfigValidationError extends Error {
  constructor ( validator, config ) {
    super( 'Invalid config type' );

    this.name = this.constructor.name;

    this.meta = { validator, config };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationError;
