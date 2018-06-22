'use strict';

class PluginDiscoveryError extends Error {
  constructor ( loader, path, error ) {
    super( error.message );

    this.name = this.constructor.name;

    this.meta = { loader, path, error };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = PluginDiscoveryError;
