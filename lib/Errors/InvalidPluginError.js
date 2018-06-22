'use strict';

class InvalidPluginError extends Error {
  constructor ( loader, plugin ) {
    super( 'Not an instance of Plugin' );

    this.name = this.constructor.name;

    this.meta = { loader, plugin };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = InvalidPluginError;
