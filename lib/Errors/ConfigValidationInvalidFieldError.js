'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Configuration validation invalid field error
 * This error should be used if an unknown field has been passed. It indicates the field is missing
 * from the schema and therefore can't be validated.
 *
 * @memberof Errors
 */
class ConfigValidationInvalidFieldError extends JourneymanError {

  /**
   * @param {Schema} schema Schema instance
   * @param {String} field  Field that failed validation
   * @param {*}      value  Value that failed validation
   */
  constructor ( schema, field, value ) {
    super( `Field "${field}" is not defined in schema` );

    this.name = this.constructor.name;

    this.meta = { schema, field, value };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationInvalidFieldError;
