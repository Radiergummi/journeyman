'use strict';

/**
 * #### Configuration validation invalid field error
 * This error should be used if an unknown field has been passed. It indicates the field is missing
 * from the schema and therefore can't be validated.
 */
class ConfigValidationInvalidFieldError extends Error {
  constructor ( validator, field, value ) {
    super( `Unknown config field "${field}"` );

    this.name = this.constructor.name;

    this.meta = { validator, field, value };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationInvalidFieldError;
