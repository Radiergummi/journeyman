'use strict';

class CommandExecutionError extends Error {
  constructor ( plugin, handler, error ) {
    super( error.message );

    this.name = this.constructor.name;

    this.meta = { plugin, handler, error };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = CommandExecutionError;
