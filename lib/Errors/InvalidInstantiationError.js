'use strict';

class InvalidInstantiationError extends Error {
  constructor ( command, plugin ) {
    super( command.constructor.name + ' must be instantiated with a plugin instance' );

    this.name = this.constructor.name;

    this.meta = { command, plugin };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = InvalidInstantiationError;
