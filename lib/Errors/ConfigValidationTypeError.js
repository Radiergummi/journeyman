'use strict';

/**
 * #### Configuration validation type error
 * This error should be used if the schema validation of a field's type fails. It indicates the field
 * exists but is of the wrong type.
 *
 * @memberof Errors
 */
class ConfigValidationTypeError extends Error {

  /**
   * @param {Schema}                                                           schema Schema instance
   * @param {String}                                                           field  Field that failed validation
   * @param {*}                                                                value  Value that failed validation
   * @param {{ type:*, required?: Boolean, default?: *, validator: function }} rule   Schema rule for the field
   */
  constructor ( schema, field, value, rule ) {
    super(
      `Invalid config field type: "${field}" is of type ${typeof value} but should be of type ${rule.type}`
    );

    this.name = this.constructor.name;

    this.rule = { schema, field, value, rule };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationTypeError;
