'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Configuration validation missing field error
 * This error should be used if a required schema field is missing. It indicates a certain field must
 * be used but isn't there.
 *
 * @memberof Errors
 */
class ConfigValidationMissingFieldError extends JourneymanError {

  /**
   * @param {Schema} schema Schema instance
   * @param {Object} config Configuration data which failed validation
   * @param {String} field  Field that failed validation
   */
  constructor ( schema, config, field ) {
    super( `Field ${field} is required` );

    this.name = this.constructor.name;

    this.meta = { schema, config, field };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationMissingFieldError;
