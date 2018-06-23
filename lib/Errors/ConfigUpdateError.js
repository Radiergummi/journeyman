'use strict';

/**
 * #### Configuration update error
 * This error should be used if an error occurred during writing the configuration to file.
 * It indicates the configuration file could not be persisted to disk.
 *
 * @memberof Errors
 */
class ConfigUpdateError extends Error {

  /**
   * @param {String} path  Path to the configuration file
   * @param {Error}  error Error that was thrown
   */
  constructor ( path, error ) {
    super( 'Could not write configuration: ' + error.message );

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
