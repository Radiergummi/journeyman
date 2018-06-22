'use strict';

class ConfigValidationTypeError extends Error {
  constructor ( validator, field, value, meta ) {
    super( `Validator for field "${field}" failed` );

    this.name = this.constructor.name;

    this.meta = { validator, field, value, meta };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationTypeError;
