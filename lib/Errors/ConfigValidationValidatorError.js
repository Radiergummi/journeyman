'use strict';

/**
 * #### Configuration validation validator error
 * This error should be used if a field validator throws or returns `false`. It indicates the field
 * either could not be validated (the result was `false`) or did throw an Error during validation.
 *
 * @memberof Errors
 */
class ConfigValidationValidatorError extends Error {

  /**
   * @param {Schema}                                                           schema Schema instance
   * @param {String}                                                           field  Field that failed validation
   * @param {*}                                                                value  Value that failed validation
   * @param {{ type:*, required?: Boolean, default?: *, validator: function }} rule   Schema rules for the field
   */
  constructor ( schema, field, value, rule ) {
    super( `Validator for field "${field}" failed` );

    this.name = this.constructor.name;

    this.meta = { schema, field, value, rule };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationValidatorError;
