'use strict';

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
