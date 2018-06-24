'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Invalid plugin error
 * This error should be used if a bad module is encountered by the plugin loader. It
 * indicates a module declares itself as a journeyman plugin but doesn't work according to
 * the plugin specification.
 *
 * @memberof Errors
 */
class InvalidPluginError extends JourneymanError {

  /**
   * @param {Loader} loader Instance of the plugin loader
   * @param {Plugin} plugin Instance of the invalid Plugin
   */
  constructor ( loader, plugin ) {
    super( 'Not an instance of Plugin or malformed plugin' );

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
