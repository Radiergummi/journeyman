'use strict';

/**
 * #### Configuration validation type error
 * This error should be used if the schema validation of a field's type fails. It indicates the field
 * exists but is of the wrong type.
 */
class ConfigValidationTypeError extends Error {
  constructor ( validator, field, value, rule ) {
    super(
      `Invalid config field type: "${field}" is of type ${typeof value} but should be of type ${rule.type}`
    );

    this.name = this.constructor.name;

    this.rule = { validator, field, value, rule };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigValidationTypeError;
