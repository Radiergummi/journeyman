'use strict';

/**
 * #### Configuration validation missing field error
 * This error should be used if a required schema field is missing. It indicates a certain field must
 * be used but isn't there.
 *
 * @memberof Errors
 */
class ConfigValidationMissingFieldError extends Error {

  /**
   * @param {Schema} schema Schema instance
   * @param {Object} config Configuration data which failed validation
   * @param {String} field  Field that failed validation
   */
  constructor ( schema, config, field ) {
    super( 'Missing required config field' );

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
