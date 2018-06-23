'use strict';

/**
 * #### Configuration validation validator error
 * This error should be used if a field validator throws or returns `false`. It indicates the field
 * either could not be validated (the result was `false`) or did throw an Error during validation.
 */
class ConfigValidationValidatorError extends Error {
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

module.exports = ConfigValidationValidatorError;
