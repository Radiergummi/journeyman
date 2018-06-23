'use strict';

/**
 * #### Configuration validation missing field error
 * This error should be used if a required schema field is missing. It indicates a certain field must
 * be used but isn't there.
 */
class ConfigValidationMissingFieldError extends Error {
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

module.exports = ConfigValidationMissingFieldError;
