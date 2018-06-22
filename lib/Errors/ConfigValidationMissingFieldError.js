'use strict';

class ConfigValidationTypeError extends Error {
  constructor ( validator, config, field ) {
    super( 'Missing required config field' );

    this.name = this.constructor.name;

    this.meta = { validator, config, field };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationTypeError;
