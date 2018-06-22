'use strict';

class ConfigUpdateError extends Error {
  constructor ( path, error ) {
    super( error.message );

    this.name = this.constructor.name;

    this.meta = { path, error };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = ConfigUpdateError;
