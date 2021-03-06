'use strict';

const JourneymanError = require( './JourneymanError' );

/**
 * #### Invalid configuration file error
 * This error should be used if the configuration file cannot be read or parsed. Due to the use
 * of `require( configFile )` inside the configuration constructor, this will implicitly be
 * the case if the file path does not exist or points to something apart of `.js` or `.json` files.
 *
 * @memberof Errors
 */
class InvalidConfigFileError extends JourneymanError {

  /**
   * @param {String} path  Path to the invalid configuration file
   * @param {Error}  error Error that was thrown
   */
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

module.exports = InvalidConfigFileError;
