'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Plugin discovery error
 * This error should be used if the plugin discovery failed. It indicates there is a problem
 * preventing the plugin loader from discovering plugins, likely at the filesystem level.
 *
 * @memberof Errors
 */
class PluginDiscoveryError extends JourneymanError {

  /**
   * @param {Loader} loader Instance of the plugin loader
   * @param {String} path   Path to the directory that caused the error
   * @param {Error}  error  Error that was thrown
   */
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
