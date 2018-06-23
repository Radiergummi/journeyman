'use strict';

/**
 * #### Plugin load error
 * This error should be used if a plugin can't be loaded. It indicates there is a problem when
 * calling `require( pluginPath )` to load the module.
 *
 * @memberof Errors
 */
class PluginLoadError extends Error {

  /**
   * @param {Loader} loader Instance of the plugin loader
   * @param {String} path   Path to the plugin that caused the error
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

module.exports = PluginLoadError;
