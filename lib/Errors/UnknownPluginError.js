'use strict';

/**
 * #### Unknown plugin error
 * This error should be used if a call for a plugin cannot be resolved to a plugin class. It
 * indicates the plugin sub-command is invalid (the plugin does not exist) so there is no
 * handler to handle the plugin call. Likely a typo.
 *
 * @memberof Errors
 */
class UnknownPluginError extends Error {

  /**
   * @param {JourneyMan} journeyman Instance of the Journeyman application
   * @param {String} plugin Plugin requested
   */
  constructor ( journeyman, plugin ) {
    super( 'Unknown plugin ' + plugin );

    this.name = this.constructor.name;

    this.meta = { journeyman, plugin };

    if ( typeof Error.captureStackTrace === 'function' ) {
      Error.captureStackTrace( this, this.constructor );
    } else {
      this.stack = ( new Error( message ) ).stack;
    }
  }
}

module.exports = UnknownPluginError;
