'use strict';

class ConfigValidationInvalidFieldError extends Error {
  constructor ( validator, field, value ) {
    super( `Unknown config field "${field}"` );

    this.name = this.constructor.name;

    this.meta = { validator, field, value, meta };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationInvalidFieldError;
