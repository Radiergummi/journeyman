'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Configuration validation error
 * This error should be used if an unknown type has been passed to the validation. The Schema class can
 * only validate objects.
 *
 * @memberof Errors
 */
class ConfigValidationError extends JourneymanError {

  /**
   * @param {Schema} schema Schema instance
   * @param {*}      config The configuration data declared as an object but is none
   */
  constructor ( schema, config ) {
    super( `Invalid config type passed (got ${typeof config}, expected object)` );

    this.name = this.constructor.name;

    this.meta = { schema, config };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationError;
